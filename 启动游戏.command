#!/usr/bin/env bash
cd "$(dirname "$0")"
echo "高中生活模拟器 v1.0"
command -v node >/dev/null 2>&1 || { echo "请先安装 Node.js: https://nodejs.org/zh-cn"; exit 1; }
[ -d node_modules ] || npm install
npm run dev &
sleep 6
(open http://127.0.0.1:5180 2>/dev/null || xdg-open http://127.0.0.1:5180 2>/dev/null || echo "请访问 http://127.0.0.1:5180")
wait
