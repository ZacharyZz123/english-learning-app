@echo off
cd /d "E:\0-脚本\学习app"
git add .
git commit -m "build: update dist for Gitee Pages"
git push origin master
pause
