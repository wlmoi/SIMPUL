"""Single-host security boundary for SIMPUL's development API.

This is defense-in-depth for an academic prototype, not organizational RBAC.
For multi-user deployment replace the optional shared token with server-side
identities, per-project authorization, TLS, and a production gateway.
"""
from __future__ import annotations
import hmac
import os
import threading
import time
from collections import defaultdict, deque
from urllib.parse import urlsplit
from fastapi import Request
from fastapi.responses import JSONResponse

LOCAL_HOSTS = frozenset({'localhost', '127.0.0.1', '::1', 'testserver'})
_WINDOW_SECONDS = 60.0
_MAX_MUTATIONS = 90
_rate_lock = threading.Lock()
_recent: dict[tuple[str, str], deque[float]] = defaultdict(deque)


def _host_name(request: Request) -> str:
    raw = request.headers.get('host', '').strip().lower()
    if raw.startswith('['):
        return raw.split(']', 1)[0].removeprefix('[')
    return raw.split(':', 1)[0]


def _permitted_hosts() -> set[str]:
    extras = os.getenv('SIMPUL_ALLOWED_HOSTS', '')
    return LOCAL_HOSTS | {part.strip().lower() for part in extras.split(',') if part.strip()}


def _token_valid(request: Request, configured: str) -> bool:
    auth = request.headers.get('authorization', '')
    supplied = auth[7:] if auth.lower().startswith('bearer ') else request.headers.get('x-simpul-api-token', '')
    return bool(supplied) and hmac.compare_digest(supplied.encode('utf-8'), configured.encode('utf-8'))


def _cross_site_write(request: Request) -> bool:
    if request.method in ('GET', 'HEAD', 'OPTIONS'):
        return False
    if request.headers.get('sec-fetch-site', '').lower() == 'cross-site':
        return True
    origin = request.headers.get('origin')
    if not origin:
        return False  # CLI/desktop integration; token still required when enabled
    try:
        parts = urlsplit(origin)
    except ValueError:
        return True
    return parts.scheme not in ('http', 'https') or parts.netloc.lower() != request.headers.get('host', '').lower()


def _mutation_limit(request: Request) -> bool:
    if request.method not in ('POST', 'PUT', 'PATCH', 'DELETE') or not request.url.path.startswith('/api/'):
        return False
    # Limit per route & peer on a single process. Production must enforce this at gateway level.
    peer = request.client.host if request.client else 'unknown'
    key = (peer, request.url.path)
    now = time.monotonic()
    with _rate_lock:
        bucket = _recent[key]
        while bucket and bucket[0] <= now - _WINDOW_SECONDS:
            bucket.popleft()
        if len(bucket) >= _MAX_MUTATIONS:
            return True
        bucket.append(now)
    return False


def reject_request(request: Request) -> JSONResponse | None:
    host = _host_name(request)
    if host not in _permitted_hosts():
        return JSONResponse({'detail':'Host belum diizinkan untuk aplikasi lokal SIMPUL.'},status_code=400)
    configured = os.getenv('SIMPUL_API_TOKEN', '').strip()
    # A non-local hostname is opt-in and must have a secret; never silently expose the demo API.
    if host not in LOCAL_HOSTS and not configured:
        return JSONResponse({'detail':'Akses hostname non-lokal membutuhkan SIMPUL_API_TOKEN.'},status_code=403)
    if host not in LOCAL_HOSTS and request.url.scheme != 'https':
        return JSONResponse({'detail':'Akses hostname non-lokal harus melalui HTTPS.'},status_code=403)
    if request.url.path.startswith('/api/'):
        if configured and not _token_valid(request, configured):
            return JSONResponse({'detail':'Kredensial API tidak tersedia atau tidak valid.'},status_code=401,
                                headers={'WWW-Authenticate':'Bearer'})
        if _cross_site_write(request):
            return JSONResponse({'detail':'Permintaan lintas situs ditolak.'},status_code=403)
        if _mutation_limit(request):
            return JSONResponse({'detail':'Terlalu banyak permintaan. Coba kembali nanti.'},status_code=429,
                                headers={'Retry-After':'60'})
    return None


def secure_response(request: Request, response):
    headers = response.headers
    headers.setdefault('X-Content-Type-Options','nosniff')
    headers.setdefault('X-Frame-Options','DENY')
    headers.setdefault('Referrer-Policy','strict-origin-when-cross-origin')
    headers.setdefault('Cross-Origin-Resource-Policy','same-origin')
    headers.setdefault('Permissions-Policy','camera=(), microphone=(), geolocation=()')
    headers.setdefault('Content-Security-Policy',
        "default-src 'self'; script-src 'self' https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; "
        "img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self'; "
        "frame-src https://www.openstreetmap.org; object-src 'none'; "
        "base-uri 'self'; form-action 'self'; frame-ancestors 'none'")
    if request.url.path.startswith('/api/'):
        headers['Cache-Control'] = 'no-store'
    return response
