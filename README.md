# 学习小卫士 - 六年级英语学习应用

一个面向六年级学生的英语学习 Web 应用，包含词汇练习、语法学习、错题本等功能。

## 在线访问

🌐 **[https://zacharyzz123.github.io/english-learning-app/](https://zacharyzz123.github.io/english-learning-app/)**

## 功能特性

- 📚 **知识专项选择**：词汇翻译、语法填空、名词复数、动词三单、人称代词等
- 🎯 **智能练习系统**：支持选择题和填空题，即时反馈
- 📝 **错题本**：自动记录错题，支持按知识点筛选
- 📊 **学习统计**：实时显示答题进度和各分类正确率
- 💾 **本地存储**：学习记录自动保存在浏览器中

## 技术栈

- **Vue 3** + Vite
- **Vue Router 4** - 路由管理
- **Pinia** - 状态管理
- **localStorage** - 数据持久化

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 项目结构

```
src/
├── components/          # 组件
│   ├── NavBar.vue       # 底部导航栏
│   ├── ProgressBar.vue  # 进度条
│   └── QuizCard.vue     # 题目卡片
├── views/               # 页面视图
│   ├── HomeView.vue     # 首页
│   ├── TopicView.vue    # 知识专项选择
│   ├── QuizView.vue     # 答题练习
│   ├── WrongBookView.vue # 错题本
│   └── StatsView.vue    # 学习统计
├── stores/              # Pinia 状态管理
│   └── quiz.js          # 答题状态和题目生成
├── router/              # 路由配置
│   └── index.js
├── data/                # 数据文件
│   └── learning_data.json # 知识点数据
└── main.js              # 入口文件
```

## 知识点内容

数据来源于六年级英语教材，包含：

- **Starter + Unit 1-6** 课文笔记
- **词汇表**：约 300+ 单词，含音标和中文释义
- **语法规则**：一般现在时、现在进行时、人称代词、名词复数等
- **日常表达**：各单元常用句型和表达

## 部署

本项目配置了 GitHub Actions 自动部署到 GitHub Pages。

每次推送到 `main` 分支时，将自动构建并部署。

## 许可证

MIT
