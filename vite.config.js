import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
// base 路径配置：
// - Vercel/Netlify 等平台：使用 '/' (根路径，默认)
// - Gitee Pages：通过环境变量 VITE_BASE_PATH='/english-learning-app/' 设置
// 部署到 Gitee 时，在构建命令中添加：VITE_BASE_PATH='/english-learning-app/' npm run build
export default defineConfig({
  plugins: [vue()],
  base: process.env.VITE_BASE_PATH || '/',
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
