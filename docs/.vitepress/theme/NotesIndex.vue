<script setup lang="ts">
import { computed, ref } from 'vue'
import { data as posts } from './posts.data'

const selectedCategory = ref('全部')
const selectedTag = ref('')
const categories = computed(() => ['全部', ...new Set(posts.map(post => post.category))])
const tags = computed(() => [...new Set(posts.flatMap(post => post.tags))])
const filteredPosts = computed(() => posts.filter(post =>
  (selectedCategory.value === '全部' || post.category === selectedCategory.value) &&
  (!selectedTag.value || post.tags.includes(selectedTag.value))
))

function selectCategory(category: string) {
  selectedCategory.value = category
  selectedTag.value = ''
}

function formatDate(date: string) {
  if (!date) return '日期未定'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date(`${date}T00:00:00+08:00`))
}
</script>

<template>
  <section class="notes-hero">
    <p>WORDS & MEMORIES</p>
    <h1>最近写下的<br><em>一些东西。</em></h1>
    <span>随笔、创作记录，以及偶尔出现的长篇碎碎念。</span>
  </section>

  <section class="notes-browser">
    <div class="notes-filters">
      <div class="category-filter" aria-label="文章分类">
        <button
          v-for="category in categories"
          :key="category"
          :class="{ active: selectedCategory === category }"
          @click="selectCategory(category)"
        >{{ category }}</button>
      </div>

      <div class="tag-filter" aria-label="文章标签">
        <button
          v-for="tag in tags"
          :key="tag"
          :class="{ active: selectedTag === tag }"
          @click="selectedTag = selectedTag === tag ? '' : tag"
        ># {{ tag }}</button>
      </div>
    </div>

    <div class="notes-result-count">{{ filteredPosts.length }} 篇记录</div>
    <div class="notes-list">
      <a v-for="post in filteredPosts" :key="post.url" class="note-card" :href="post.url">
        <div class="note-date">
          <strong>{{ formatDate(post.date).slice(5) }}</strong>
          <span>{{ formatDate(post.date).slice(0, 4) }}</span>
        </div>
        <div class="note-summary">
          <div class="note-meta"><span>{{ post.category }}</span><i v-if="post.featured">推荐</i></div>
          <h2>{{ post.title }}</h2>
          <p>{{ post.description }}</p>
          <div class="note-tags"><span v-for="tag in post.tags" :key="tag"># {{ tag }}</span></div>
        </div>
        <span class="note-arrow">↗</span>
      </a>
    </div>
    <p v-if="filteredPosts.length === 0" class="notes-empty">这个组合下还没有文章。</p>
  </section>
</template>
