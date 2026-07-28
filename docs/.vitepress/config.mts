import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'Misaka-xxw',
  description: 'Misaka-xxw 的个人主页',
  cleanUrls: true,
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Misaka-xxw' }
    ]
  },
  head: [
    ['meta', { name: 'theme-color', content: '#08131f' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600;700;900&family=Rajdhani:wght@500;600;700&display=swap', rel: 'stylesheet' }]
  ]
})
