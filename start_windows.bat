@echo off
cd /d "%~dp0"
echo SIMPUL API ^| http://localhost:8888
python server\app.py
if errorlevel 1 (
  echo.
  echo Jika modul belum terpasang, jalankan:
  echo python -m pip install -r server\requirements.txt
  pause
)
