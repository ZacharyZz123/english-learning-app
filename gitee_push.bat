@echo off
chcp 65001 >nul
setlocal

cd /d "%~dp0"

echo [1/4] 安装依赖...
where npm >nul 2>&1
if errorlevel 1 (
  echo 未检测到 npm，请先安装 Node.js 并配置到 PATH。
  pause
  exit /b 1
)
call npm install
if errorlevel 1 (
  echo 依赖安装失败，请检查网络或 npm 配置。
  pause
  exit /b 1
)

echo [2/4] 构建项目...
call npm run build
if errorlevel 1 (
  echo 构建失败，请检查构建日志。
  pause
  exit /b 1
)

echo [3/4] 提交构建产物...
git add .
git diff --cached --quiet
if errorlevel 1 (
  git commit -m "build: update dist for Gitee Pages"
) else (
  echo 没有需要提交的变更，跳过 commit。
)

echo [4/4] 推送到 Gitee...
git remote get-url gitee >nul 2>&1
if errorlevel 1 (
  git remote add gitee https://gitee.com/Zachary_Zzh/english-learning-app.git
)
for /f %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
if "%CURRENT_BRANCH%"=="" (
  echo 无法获取当前分支，请手动执行 git push。
  pause
  exit /b 1
)
git push gitee %CURRENT_BRANCH%
if errorlevel 1 (
  echo 推送当前分支失败，尝试推送到 master...
  git push gitee %CURRENT_BRANCH%:master
  if errorlevel 1 (
    echo 推送失败，请检查 Gitee 仓库权限或网络。
    pause
    exit /b 1
  )
)

echo 部署完成！
pause
