@echo off
setlocal
chcp 65001 >nul

set "SCRIPT_DIR=%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%launch-fullscreen.ps1" %*

if errorlevel 1 (
  echo.
  echo 课件启动失败，请把上面的错误信息截图发给开发者。
  pause
)

endlocal
