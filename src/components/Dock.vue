<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWindowStore } from '../stores/windowStore'

import finderIcon from '../assets/app-icons/finder.svg'
import safariIcon from '../assets/app-icons/safari.svg'
import photosIcon from '../assets/app-icons/photos.svg'
import mailIcon from '../assets/app-icons/mail.svg'
import terminalIcon from '../assets/app-icons/terminal.svg'
import vscodeIcon from '../assets/app-icons/vscode.svg'
import spotifyIcon from '../assets/app-icons/spotify.svg'
import localstackIcon from '../assets/app-icons/localstack.svg'
import settingsIcon from '../assets/app-icons/settings.svg'
import trashIcon from '../assets/app-icons/trash.svg'

const store = useWindowStore()

const isHovered = ref(false)
let hideTimeout: ReturnType<typeof setTimeout> | null = null

const hasOpenWindows = computed(() => {
  return store.windows.some(w => w.isOpen && !w.isMinimized)
})

const isDockHidden = computed(() => {
  return hasOpenWindows.value && !isHovered.value
})

const onMouseEnter = () => {
  if (hideTimeout) clearTimeout(hideTimeout)
  isHovered.value = true
}

const onMouseLeave = () => {
  if (hideTimeout) clearTimeout(hideTimeout)
  hideTimeout = setTimeout(() => {
    isHovered.value = false
  }, 350)
}

const handleGlobalMouseMove = (e: MouseEvent) => {
  if (typeof window === 'undefined') return
  // If mouse touches bottom edge (last 12px), reveal dock
  if (e.clientY >= window.innerHeight - 12) {
    onMouseEnter()
  } else if (e.clientY < window.innerHeight - 85 && isHovered.value) {
    // If mouse moves well above the dock, initiate hide
    onMouseLeave()
  }
}

onMounted(() => {
  window.addEventListener('mousemove', handleGlobalMouseMove)
})

onUnmounted(() => {
  if (hideTimeout) clearTimeout(hideTimeout)
  window.removeEventListener('mousemove', handleGlobalMouseMove)
})

const isWindowOpen = (id: string) => {
  const win = store.windows.find(w => w.id === id)
  return win ? win.isOpen : false
}

const isWindowActive = (id: string) => {
  return store.activeWindowId === id && isWindowOpen(id) && !store.windows.find(w => w.id === id)?.isMinimized
}

const handleDockClick = (id: string) => {
  if (id === 'gallery') {
    store.openPhotosInFinder()
    return
  }
  const win = store.windows.find(w => w.id === id)
  if (win) {
    if (win.isOpen) {
      if (win.isMinimized) {
        store.openWindow(id)
      } else if (store.activeWindowId === id) {
        store.minimizeWindow(id)
      } else {
        store.focusWindow(id)
      }
    } else {
      store.openWindow(id)
    }
  }
}

// macOS Authentic Dock order: Finder is ALWAYS #1 on the left!
const mainDockItems = [
  { id: 'files', name: 'Finder', iconSrc: finderIcon },
  { id: 'portfolio', name: 'Navegador', iconSrc: safariIcon },
  { id: 'gallery', name: 'Fotos (Finder)', iconSrc: photosIcon },
  { id: 'mail', name: 'Contato', iconSrc: mailIcon },
  { id: 'terminal', name: 'Terminal', iconSrc: terminalIcon },
  { id: 'vscode', name: 'VS Code', iconSrc: vscodeIcon },
  { id: 'spotify', name: 'Spotify', iconSrc: spotifyIcon },
  { id: 'localstack', name: 'LocalStack', iconSrc: localstackIcon },
  { id: 'settings', name: 'Configurações', iconSrc: settingsIcon }
]

const rightDockItems = [
  { id: 'trash', name: 'Lixeira', iconSrc: trashIcon }
]
</script>

<template>
  <!-- Invisible bottom hover trigger zone across the screen -->
  <div
    class="fixed bottom-0 inset-x-0 h-4 z-[9998] pointer-events-auto"
    @mouseenter="onMouseEnter"
  ></div>

  <!-- macOS Dock Container with Auto-Hide Translation -->
  <div
    class="fixed bottom-3.5 left-1/2 -translate-x-1/2 z-[9999] flex items-center select-none pointer-events-auto transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
    :class="isDockHidden ? 'translate-y-[140%] pointer-events-none' : 'translate-y-0 pointer-events-auto'"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- macOS Authentic Glassmorphism Dock -->
    <div
      class="h-[64px] px-3 rounded-2xl border shadow-2xl backdrop-blur-2xl flex items-center gap-1.5 transition-colors duration-300"
      :class="store.theme === 'light'
        ? 'bg-white/60 border-white/70 shadow-[0_15px_35px_rgba(0,0,0,0.18)]'
        : 'bg-zinc-900/65 border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)]'"
    >
      <!-- Main Application Launcher Icons (Finder on Left) -->
      <div class="flex items-end gap-2 h-full pb-1">
        <div
          v-for="item in mainDockItems"
          :key="item.id"
          class="relative flex flex-col items-center group cursor-pointer"
          @click="handleDockClick(item.id)"
        >
          <!-- Tooltip with App Name -->
          <div class="absolute -top-10 px-2.5 py-1 bg-zinc-900/90 text-white text-[11px] font-medium rounded-md shadow-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {{ item.name }}
          </div>

          <!-- Official App SVG Icon with macOS magnification effect -->
          <div class="w-12 h-12 flex items-center justify-center transition-transform duration-150 ease-out group-hover:scale-120 group-hover:-translate-y-2 active:scale-95">
            <img :src="item.iconSrc" :alt="item.name" class="w-full h-full object-contain drop-shadow-md rounded-2xl" />
          </div>

          <!-- Active App Indicator Dot -->
          <div
            class="w-1 h-1 rounded-full transition-all duration-300 mt-1"
            :class="isWindowActive(item.id)
              ? 'bg-sky-400 w-2 scale-110 shadow-xs shadow-sky-400'
              : (isWindowOpen(item.id)
                ? (store.theme === 'light' ? 'bg-zinc-800/70' : 'bg-white/70')
                : 'opacity-0')"
          ></div>
        </div>
      </div>

      <!-- macOS Authentic Dock Divider -->
      <div
        class="w-[1px] h-8 mx-0.5 rounded-full shrink-0"
        :class="store.theme === 'light' ? 'bg-black/15' : 'bg-white/15'"
      ></div>

      <!-- Right Section (Trash on far right) -->
      <div class="flex items-end gap-2 h-full pb-1">
        <div
          v-for="item in rightDockItems"
          :key="item.id"
          class="relative flex flex-col items-center group cursor-pointer"
          @click="handleDockClick(item.id)"
        >
          <!-- Tooltip -->
          <div class="absolute -top-10 px-2.5 py-1 bg-zinc-900/90 text-white text-[11px] font-medium rounded-md shadow-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {{ item.name }}
          </div>

          <!-- Icon -->
          <div class="w-12 h-12 flex items-center justify-center transition-transform duration-150 ease-out group-hover:scale-120 group-hover:-translate-y-2 active:scale-95">
            <img :src="item.iconSrc" :alt="item.name" class="w-full h-full object-contain drop-shadow-md rounded-2xl" />
          </div>

          <!-- Dot -->
          <div
            class="w-1 h-1 rounded-full transition-all duration-300 mt-1"
            :class="isWindowActive(item.id)
              ? 'bg-sky-400 w-2 scale-110 shadow-xs shadow-sky-400'
              : (isWindowOpen(item.id)
                ? (store.theme === 'light' ? 'bg-zinc-800/70' : 'bg-white/70')
                : 'opacity-0')"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>
