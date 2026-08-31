<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Content, useData } from 'vitepress'
import NotesIndex from './NotesIndex.vue'

const { frontmatter } = useData()
const period = ref(0)
const ready = ref(false)
let timer: number | undefined

const themes = [
  { name: '黎明', bg: '#f3f8fb', surface: '#ffffff', soft: '#e4f1f7', ink: '#183552', muted: '#668099', line: '#cfe0eb', accent: '#2c5f96' },
  { name: '正午', bg: '#f1f4f8', surface: '#ffffff', soft: '#e4ebf2', ink: '#24324a', muted: '#68778b', line: '#d7e0e9', accent: '#3e83b9' },
  { name: '黄昏', bg: '#f7eee9', surface: '#fffaf6', soft: '#f0ddd4', ink: '#3f2925', muted: '#856d68', line: '#e6cec3', accent: '#b04f31' },
  { name: '午夜', bg: '#0c1521', surface: '#172c44', soft: '#1c2632', ink: '#e8f1f8', muted: '#9bafbf', line: '#31404e', accent: '#789ab5' }
]

const current = computed(() => themes[period.value])
const variables = computed(() => ({
  '--notes-bg': current.value.bg,
  '--notes-surface': current.value.surface,
  '--notes-soft': current.value.soft,
  '--notes-ink': current.value.ink,
  '--notes-muted': current.value.muted,
  '--notes-line': current.value.line,
  '--notes-accent': current.value.accent
}))

function beijingPeriod() {
  const hour = new Date(Date.now() + 8 * 60 * 60 * 1000).getUTCHours()
  if (hour >= 5 && hour < 10) return 0
  if (hour >= 10 && hour < 16) return 1
  if (hour >= 16 && hour < 20) return 2
  return 3
}

function cycleTheme() {
  period.value = (period.value + 1) % themes.length
}

function formatArticleDate(value: unknown) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(String(value))
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    dateStyle: 'long'
  }).format(date)
}

onMounted(() => {
  period.value = beijingPeriod()
  ready.value = true
  timer = window.setInterval(() => { period.value = beijingPeriod() }, 60_000)
})

onBeforeUnmount(() => {
  if (timer !== undefined) window.clearInterval(timer)
})
</script>

<template>
  <div class="notes-shell" :class="{ ready }" :style="variables">
    <header class="notes-nav">
      <a class="notes-brand" href="/"><b>M</b><span>MISAKA<em>.XXW</em></span></a>
      <nav>
        <a href="/">首页</a><a class="active" href="/journal/">博客</a><a href="/gallery/">画廊</a><a href="/anime/">番剧</a>
      </nav>
      <button @click="cycleTheme"><i />{{ current.name }}</button>
    </header>

    <main class="notes-main">
      <NotesIndex v-if="frontmatter.notesIndex" />
      <article v-else class="post-page">
        <header class="post-header">
          <a href="/journal/">← 返回博客</a>
          <p>{{ frontmatter.category }}</p>
          <h1>{{ frontmatter.title }}</h1>
          <span>{{ frontmatter.description }}</span>
          <div class="post-details">
            <time>发布于 {{ formatArticleDate(frontmatter.date) }}</time>
            <time v-if="frontmatter.updated">更新于 {{ formatArticleDate(frontmatter.updated) }}</time>
            <span v-for="tag in frontmatter.tags || []" :key="tag"># {{ tag }}</span>
          </div>
        </header>
        <div class="post-content"><Content /></div>
      </article>
    </main>

    <footer class="notes-footer"><a href="/journal/">MISAKA.XXW / JOURNAL</a><span>把喜欢的东西认真记下来。</span></footer>
  </div>
</template>
