# Strix penetration test: local-only reproducible runbook

> **Current status:** The Strix engine was **not executed** in the development environment for this release. Docker CLI/daemon and a configured Strix LLM runtime were unavailable. The test counts in `PENTEST_REPORT_v1.3.md` are from FastAPI, Python/pytest, JavaScript, and local HTTP contract checks, **not** Strix-generated PoCs.

## Safety and scope

Authorized target: only the SIMPUL source code in this repository (a temporary scrubbed copy). No public Internet domain, real MRT system, government infrastructure, production database, account, or third-party host is in scope. The default runner performs a **source-only** review; it does not launch a live black-box scan.

Strix agents may execute commands in Docker and may send parts of the provided code to an external LLM. Confirm that you have authorization and permission to share the code. The runner intentionally excludes `.env`, local databases, the proposal PDF, screenshots, and user-created backups. Review the copied source for secrets before approval.

## Verified upstream CLI interface

The `usestrix/strix` README (reviewed 2026-11-15) specifies Docker, an LLM provider or supported ChatGPT sign-in, `strix --target ./path`, `--scan-mode quick`, `--instruction`, and `-n/--non-interactive`. Verify current documentation when installing a newer version: https://github.com/usestrix/strix and https://docs.strix.ai/.

## Windows 11 / WSL2

1. Install Docker Desktop, enable WSL2, and start Docker. Run `docker info` to verify.
2. Install Strix using its official documentation. Do not blindly execute downloaded install scripts without verifying the source.
3. Configure a supported provider according to Strix documentation, e.g. `STRIX_LLM` and `LLM_API_KEY`, or its supported signed-in authentication method. **Do not commit credentials.**
4. In PowerShell at the SIMPUL project root:

```powershell
python tools/run_strix_local.py --authorize-local-scan --accept-llm-egress
```

The runner fails closed if Docker or Strix is unavailable. It builds a temporary source copy without data/credentials. Strix findings are retained by its normal run-output mechanism (see Strix documentation); review the scan report and retain the run identifier, exact version, target path, and configuration.

## After the scan

- Treat each finding as a hypothesis until a reproducible local proof exists.
- Record exact affected file, input, output, authorization context, and severity rationale.
- Implement a minimal patch, write a regression test, and rerun the reproduction and suite.
- Check that the entire original mobility workflow still functions.
- Do not claim security certification, zero vulnerabilities, or complete penetration-test coverage.

## Additional practical tests

```bash
python -m pytest -q tests/test_security_hardening.py
node tests/test_csv_security.mjs
python -m pytest -q tests
npm run verify
```

Use `docker compose --profile monitoring up --build` only when separately testing the internal monitoring service. Do not publish ports or add external targets merely to make the scan more extensive.
