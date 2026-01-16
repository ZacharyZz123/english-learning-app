@echo off
cd /d "E:\0-脚本\学习app"

REM 安装依赖
echo Installing dependencies...
npm install

REM 构建项目
echo Building project...
npm run build

REM 添加构建产物到git
git add .
git commit -m "build: update dist for Gitee Pages"
git push origin main

echo Deployment completed!
pause
