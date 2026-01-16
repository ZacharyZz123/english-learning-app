# Gitee Pages 部署指南

## 简介
本文档介绍如何将英语学习应用部署到 Gitee Pages，实现公共网络访问。

## 部署方式

### 方式一：自动化部署（推荐）

#### 1. 配置 Gitee 私人令牌

1. 登录 Gitee 账号
2. 进入「设置」→「私人令牌」→「生成新令牌」
3. 勾选以下权限：
   - `projects`：项目管理权限
   - `pull_requests`：拉取请求权限
   - `wiki`：Wiki 管理权限
   - `user_info`：用户信息权限
4. 生成令牌并保存（仅显示一次）

#### 2. 配置 GitHub Secrets

1. 进入 GitHub 仓库 →「Settings」→「Secrets and variables」→「Actions」
2. 点击「New repository secret」
3. 添加以下 Secret：
   - **名称**：`GITEE_PASSWORD`
   - **值**：刚才生成的 Gitee 私人令牌

#### 3. 触发自动化部署

- 每次向 `main` 或 `master` 分支推送代码时，GitHub Actions 会自动执行构建和部署
- 也可以手动触发：进入「Actions」→「Deploy to Gitee Pages」→「Run workflow」

### 方式二：手动部署

#### 1. 本地构建

```bash
# 安装依赖
npm install

# 构建项目
npm run build
```

#### 2. 推送构建产物

使用提供的 `gitee_push.bat` 脚本（Windows）：

```bash
# 双击运行或在命令行执行
gitee_push.bat
```

或者手动执行：

```bash
# 添加构建产物到 Git
git add .
git commit -m "build: update dist for Gitee Pages"
git push origin master
```

#### 3. 配置 Gitee Pages

1. 登录 Gitee 仓库
2. 进入「服务」→「Gitee Pages」
3. 选择以下配置：
   - **部署分支**：`gh-pages`（自动化部署）或 `master`（手动部署）
   - **部署目录**：`dist`（手动部署时）
   - **启用 HTTPS**：建议开启
4. 点击「更新」完成部署

## 访问地址

部署成功后，应用将通过以下地址访问：

```
https://{username}.gitee.io/english-learning-app/
```

## 注意事项

1. **路径配置**：`vite.config.js` 中的 `base` 已配置为 `/english-learning-app/`，确保与仓库名称一致

2. **构建产物**：
   - 自动化部署：构建产物将推送到 `gh-pages` 分支
   - 手动部署：构建产物包含在 `master` 分支的 `dist` 目录中

3. **缓存问题**：部署后可能需要清除浏览器缓存才能看到最新版本

4. **错误排查**：
   - 查看 GitHub Actions 日志了解部署状态
   - 检查 Gitee Pages 配置是否正确
   - 确认 `dist` 目录是否包含正确的构建产物

## 域名绑定（可选）

如果需要绑定自定义域名：

1. 在 Gitee Pages 配置中填写自定义域名
2. 在域名解析服务商添加 CNAME 记录，指向 `{username}.gitee.io`
3. 在 Gitee 仓库根目录添加 `CNAME` 文件，内容为自定义域名

## 更新部署

- 自动化部署：直接推送代码到 `main` 或 `master` 分支
- 手动部署：运行 `gitee_push.bat` 脚本或手动构建并推送

---

如有问题，请查看项目文档或提交 Issue。
