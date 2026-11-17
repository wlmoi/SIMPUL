"""Initialize untracked local credentials for the optional monitoring stack.

No default passwords or API tokens are shipped in the repository.
"""
from pathlib import Path
import secrets
import os
root=Path(__file__).resolve().parent.parent
out=root/'.env'
if out.exists():
    raise SystemExit('File .env sudah ada. Kredensial tidak ditimpa. Periksa file tersebut secara lokal.')
config = {
  'INFLUXDB_ADMIN_USERNAME': 'user',
  'INFLUXDB_ADMIN_PASSWORD': secrets.token_urlsafe(30),
  'INFLUXDB_TOKEN': secrets.token_urlsafe(48),
  'INFLUXDB_ORG': 'simpul',
  'INFLUXDB_BUCKET': 'simpul_observations',
  'INFLUXDB_URL': 'http://influxdb:8086',
  'GRAFANA_ADMIN_USERNAME': 'user',
  'GRAFANA_ADMIN_PASSWORD': secrets.token_urlsafe(30),
}
try:
    handle = os.open(out, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    with os.fdopen(handle, 'w', encoding='utf-8') as f:
        f.write('# Generated locally for Docker Compose; do not commit or share.\n')
        for key,value in config.items(): f.write(f'{key}={value}\n')
except FileExistsError:
    raise SystemExit('File .env sudah ada. Tidak ditimpa.')
print('File .env lokal dibuat dengan kredensial acak. Isi file tidak ditampilkan.')
print('Sekarang jalankan: docker compose --profile monitoring up --build -d')
