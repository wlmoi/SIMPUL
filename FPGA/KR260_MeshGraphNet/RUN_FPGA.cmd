@echo off
cd /d "%~dp0"
python demo\run_demo.py run
if errorlevel 1 (echo Demo gagal. Periksa log Vivado.) else (echo Demo selesai.)
pause
