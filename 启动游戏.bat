@echo off
chcp 65001 >nul
title 高中生活模拟器
cd /d "%~dp0"

echo.
echo   高中生活模拟器 v1.0
echo   ------------------
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo   没有找到 Node.js。
  echo   请先安装：https://nodejs.org/zh-cn  （选 LTS 版本，一路下一步）
  echo   装完再双击本文件。
  echo.
  start "" https://nodejs.org/zh-cn
  pause
  exit /b 1
)

if not exist node_modules (
  echo   第一次启动，正在安装依赖，大约需要一两分钟……
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo   安装失败。请检查网络，或把本窗口截图发给开发者。
    pause
    exit /b 1
  )
)

echo   正在启动本地服务器……
start "高中生活模拟器-服务" cmd /c "npm run dev"

echo   等待服务器就绪（约 6 秒）……
timeout /t 8 /nobreak >nul

start "" http://127.0.0.1:5180
echo.
echo   浏览器已打开。如果没有，请手动访问 http://127.0.0.1:5180
echo   关闭那个黑色窗口即可停止游戏。
echo.
pause
