<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()
const entered = ref(false)
const menuOpen = ref(false)
const linkActivated = ref(false)
const activePeriod = ref(getBeijingPeriod())
const activeVideoSlot = ref(0)
const videoSlots = ref<Array<number | null>>([activePeriod.value, null])
const videoElements: Array<HTMLVideoElement | null> = [null, null]
const heroMedia = ref<HTMLElement | null>(null)
const VIDEO_SYNC_OFFSET_SECONDS = -5 / 30
let videoSwitching = false
const isHome = computed(() => frontmatter.value.layout === 'home')

const periods = [
  {
    name: '黎明',
    video: '/media/1morning.webm',
    accent: '#2c5f96',
    accentSoft: '#b9d8ec',
    heroInk: '#dfcbbd',
    pageBg: '#f3f8fb', surface: '#ffffff', soft: '#e4f1f7',
    pageInk: '#183552', muted: '#668099', line: '#cfe0eb'
  },
  {
    name: '正午',
    video: '/media/2noon.webm',
    accent: '#3e83b9',
    accentSoft: '#b1c0d1',
    heroInk: '#0e254d',
    pageBg: '#f1f4f8', surface: '#ffffff', soft: '#e4ebf2',
    pageInk: '#24324a', muted: '#68778b', line: '#d7e0e9'
  },
  {
    name: '黄昏',
    video: '/media/3afternoon.webm',
    accent: '#b04f31',
    accentSoft: '#ee904e',
    heroInk: '#fff8e7',
    pageBg: '#f7eee9', surface: '#fffaf6', soft: '#f0ddd4',
    pageInk: '#3f2925', muted: '#856d68', line: '#e6cec3'
  },
  {
    name: '午夜',
    video: '/media/4night.webm',
    accent: '#31628e',
    accentSoft: '#789ab5',
    heroInk: '#f2f7ff',
    pageBg: '#0c1521', surface: '#172c44', soft: '#1c2632',
    pageInk: '#e8f1f8', muted: '#9bafbf', line: '#31404e'
  }
]

const currentPeriod = computed(() => periods[activePeriod.value])
const heroLogo = computed(() => {
  if (activePeriod.value === 1) return '/media/某普通的个人主页-魔法.webp'
  if (activePeriod.value === 3) return '/media/某普通的个人主页-白色.webp'
  return '/media/某普通的个人主页-科学.webp'
})
const themeVars = computed(() => ({
  '--accent': currentPeriod.value.accent,
  '--pink': currentPeriod.value.accent,
  '--blue': currentPeriod.value.accentSoft,
  '--hero-ink': currentPeriod.value.heroInk,
  '--bg': currentPeriod.value.pageBg,
  '--surface': currentPeriod.value.surface,
  '--soft': currentPeriod.value.soft,
  '--ink': currentPeriod.value.pageInk,
  '--muted': currentPeriod.value.muted,
  '--line': currentPeriod.value.line
}))

const nav = [
  { icon: '🏠', label: '首页', href: '#home' },
  { icon: '📔', label: '博客', href: '#blog' },
  { icon: '🎨', label: '画廊', href: '#gallery' },
  { icon: '🖼️', label: '番剧', href: '/anime/' }
]

function enterSite() {
  entered.value = true
  setTimeout(() => document.querySelector('#profile')?.scrollIntoView({ behavior: 'smooth' }), 460)
}

function activateHeroLink() {
  if (linkActivated.value) return
  linkActivated.value = true
  window.setTimeout(enterSite, 620)
  window.setTimeout(() => {
    linkActivated.value = false
  }, 760)
}

function moveHeroBackground(event: MouseEvent) {
  if (!heroMedia.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = (event.clientX - bounds.left) / bounds.width - 0.5
  const y = (event.clientY - bounds.top) / bounds.height - 0.5
  heroMedia.value.style.setProperty('--parallax-x', `${x * 20}px`)
  heroMedia.value.style.setProperty('--parallax-y', `${y * 10}px`)
}

function resetHeroBackground() {
  heroMedia.value?.style.setProperty('--parallax-x', '0px')
  heroMedia.value?.style.setProperty('--parallax-y', '0px')
}

function setVideoElement(element: unknown, slot: number) {
  videoElements[slot] = element as HTMLVideoElement | null
}

function waitForMetadata(video: HTMLVideoElement) {
  if (video.readyState >= 1) return Promise.resolve()

  return new Promise<void>((resolve) => {
    const done = () => {
      video.removeEventListener('loadedmetadata', done)
      video.removeEventListener('error', done)
      resolve()
    }
    video.addEventListener('loadedmetadata', done, { once: true })
    video.addEventListener('error', done, { once: true })
  })
}

async function switchPeriod(targetPeriod: number) {
  if (targetPeriod === activePeriod.value || videoSwitching) return
  videoSwitching = true

  const oldSlot = activeVideoSlot.value
  const nextSlot = oldSlot === 0 ? 1 : 0
  videoSlots.value[nextSlot] = targetPeriod
  await nextTick()

  const currentVideo = videoElements[oldSlot]
  const nextVideo = videoElements[nextSlot]
  if (!nextVideo) {
    videoSwitching = false
    return
  }

  nextVideo.load()
  await waitForMetadata(nextVideo)

  if (
    currentVideo &&
    Number.isFinite(currentVideo.duration) &&
    currentVideo.duration > 0 &&
    Number.isFinite(nextVideo.duration) &&
    nextVideo.duration > 0
  ) {
    const progress = (currentVideo.currentTime % currentVideo.duration) / currentVideo.duration
    const matchedTime = progress * nextVideo.duration - VIDEO_SYNC_OFFSET_SECONDS
    nextVideo.currentTime = matchedTime < 0
      ? nextVideo.duration + matchedTime
      : matchedTime
  }

  await nextVideo.play().catch(() => undefined)
  activePeriod.value = targetPeriod
  activeVideoSlot.value = nextSlot

  window.setTimeout(() => {
    currentVideo?.pause()
    videoSlots.value[oldSlot] = null
    videoSwitching = false
  }, 1250)
}

function cyclePeriod() {
  void switchPeriod((activePeriod.value + 1) % periods.length)
}

function getBeijingPeriod() {
  const hour = Number(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Shanghai',
    hour: '2-digit',
    hourCycle: 'h23'
  }).format(new Date()))

  if (hour >= 5 && hour < 10) return 0
  if (hour >= 10 && hour < 16) return 1
  if (hour >= 16 && hour < 20) return 2
  return 3
}

onMounted(() => {
  entered.value = window.scrollY > 240
  const beijingPeriod = getBeijingPeriod()
  if (beijingPeriod !== activePeriod.value) void switchPeriod(beijingPeriod)
})
</script>

<template>
  <div v-if="isHome" class="site-shell" :class="{ entered }" :style="themeVars">
    <header class="topbar">
      <a class="brand" href="#home" aria-label="返回首页">
        <span class="brand-mark">M</span>
        <span>MISAKA<span class="accent">.XXW</span></span>
      </a>

      <nav :class="{ open: menuOpen }">
        <a v-for="item in nav" :key="item.label" :href="item.href" @click="menuOpen = false">
          <span>{{ item.icon }}</span>{{ item.label }}
        </a>
      </nav>

      <div class="top-actions">
        <button class="theme-switch" title="切换首页时段" @click="cyclePeriod">
          <span class="pulse-dot" /> {{ currentPeriod.name }}
        </button>
        <a class="github-button" href="https://github.com/Misaka-xxw" target="_blank" aria-label="GitHub">↗</a>
        <button class="menu-button" aria-label="打开菜单" @click="menuOpen = !menuOpen">☰</button>
      </div>
    </header>

    <main>
      <section id="home" class="hero" @mousemove="moveHeroBackground" @mouseleave="resetHeroBackground">
        <div ref="heroMedia" class="hero-media" aria-hidden="true">
          <video
            v-for="slot in [0, 1]"
            v-show="videoSlots[slot] !== null"
            :key="slot"
            :ref="element => setVideoElement(element, slot)"
            :class="{ active: activeVideoSlot === slot }"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
          >
            <source
              v-if="videoSlots[slot] !== null"
              :src="periods[videoSlots[slot] as number].video"
              type="video/mp4"
            >
          </video>
        </div>
        <img class="hero-logo" :src="heroLogo" alt="某普通的个人主页">
        <div class="hero-copy">
          <p class="eyebrow"><span /> 小昔亦或是小w的神秘小窝 · 2026</p>
          <h1 v-if="activePeriod === 0" class="dawn-title">
            <span>世界即将染成</span>
            <strong><b>黄金色</b>的黎明</strong>
          </h1>
          <h1 v-else-if="activePeriod === 1 || activePeriod === 2">
            <span>这城市还真</span>
            <strong>不会让人无聊呢</strong>
          </h1>
          <h1 v-else>
            <span>所谓人者，</span>
            <strong>皆为星辰</strong>
          </h1>
          <p class="hero-lead">
            收集喜欢的作品、随缘写下的文字，<br>
            还有生活里✧kira✧kira✧的瞬间 ヾ(≧▽≦*)o
          </p>
        </div>

        <button
          class="hero-link-button"
          :class="{ activated: linkActivated }"
          aria-label="进入主页"
          @click="activateHeroLink"
        >
          <span class="button-content">
            <img src="/media/button_phone_link.svg" alt="">
            <span class="button-particles" aria-hidden="true">
              <i v-for="particle in 12" :key="particle" />
            </span>
          </span>
        </button>
        <div class="hero-footer">
          <span>我喜欢的游戏关服啦！</span>
          <span>MISAKA-XXW</span>
        </div>
      </section>

      <section id="profile" class="profile-section section-wrap">
        <div class="section-kicker">01 / PROFILE</div>
        对就是这里我准备放一个御坂，但是没有画好
      </section>

      <section id="blog" class="content-section section-wrap">
        <div class="section-heading">
          <div><span>02 / BLOG</span><h2>最近记录</h2></div>
          <a href="/notes/">查看全部 ↗</a>
        </div>
        <div class="post-grid">
          <article class="featured-post">
            <span class="post-index">01</span>
            <p>随笔 · 2026.07</p>
            <h3>随笔1占位</h3>
            <span>阅读全文 →</span>
          </article>
          <article>
            <p>随笔 · 2026.07</p>
            <h3>随笔2占位，依旧没写</h3>
            <span>阅读全文 →</span>
          </article>
          <article>
            <p>技术 · VitePress</p>
            <h3>随笔3占位，其实这个博客不会有技术的（）</h3>
            <span>阅读全文 →</span>
          </article>
        </div>
      </section>

      <section id="gallery" class="gallery-section section-wrap">
        <div class="section-heading">
          <div><span>03 / GALLERY</span><h2>创作切片</h2></div>
          <a href="/gallery/">进入画廊 ↗</a>
        </div>
        <div class="gallery-grid">
          <div class="art-card art-one"><span>2026 / CONCEPT</span></div>
          <div class="art-card art-two"><span>2025 / STUDY</span></div>
          <div class="art-card art-three"><span>2025 / FANART</span></div>
        </div>
      </section>

    </main>

    <footer>
      <div class="brand"><span class="brand-mark">M</span><span>MISAKA<span class="accent">.XXW</span></span></div>
      <p>广告位招租中（）</p>
      <span>© 2026 MISAKA-XXW</span>
    </footer>
  </div>
  <Theme.Layout v-else />
</template>
