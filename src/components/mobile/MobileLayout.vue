<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWindowStore } from '../../stores/windowStore'
import { 
  ChevronLeft, 
  Power,
  Sun,
  Moon
} from 'lucide-vue-next'

// Import app components
import TerminalApp from '../apps/TerminalApp.vue'
import VSCodeApp from '../apps/VSCodeApp.vue'
import FilesApp from '../apps/FilesApp.vue'
import MailApp from '../apps/MailApp.vue'
import SpotifyApp from '../apps/SpotifyApp.vue'
import LocalStackApp from '../apps/LocalStackApp.vue'
import PortfolioApp from '../apps/PortfolioApp.vue'
import TrashApp from '../apps/TrashApp.vue'
import GalleryApp from '../apps/GalleryApp.vue'
import SettingsApp from '../apps/SettingsApp.vue'

const store = useWindowStore()

// Clock logic for Mobile Status Bar
const timeString = ref('')
let clockInterval: any

const updateTime = () => {
  const now = new Date()
  timeString.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const triggerHaptic = () => {
  if (navigator.vibrate) {
    navigator.vibrate(10) // Subtle haptic tap
  }
}

import safariIcon from '../../assets/app-icons/safari.svg'
import terminalIcon from '../../assets/app-icons/terminal.svg'
import vscodeIcon from '../../assets/app-icons/vscode.svg'
import finderIcon from '../../assets/app-icons/finder.svg'
import photosIcon from '../../assets/app-icons/photos.svg'
import settingsIcon from '../../assets/app-icons/settings.svg'
import mailIcon from '../../assets/app-icons/mail.svg'
import spotifyIcon from '../../assets/app-icons/spotify.svg'
import localstackIcon from '../../assets/app-icons/localstack.svg'
import trashIcon from '../../assets/app-icons/trash.svg'

// Authentic iOS/macOS style App Icon mappings (Finder first)
const gridApps = [
  { id: 'files', title: 'Finder', iconSrc: finderIcon },
  { id: 'portfolio', title: 'Navegador', iconSrc: safariIcon },
  { id: 'gallery', title: 'Fotos', iconSrc: photosIcon },
  { id: 'spotify', title: 'Spotify', iconSrc: spotifyIcon },
  { id: 'localstack', title: 'LocalStack', iconSrc: localstackIcon },
  { id: 'settings', title: 'Configurações', iconSrc: settingsIcon },
  { id: 'trash', title: 'Lixeira', iconSrc: trashIcon }
]

const dockApps = [
  { id: 'terminal', title: 'Terminal', iconSrc: terminalIcon },
  { id: 'vscode', title: 'VS Code', iconSrc: vscodeIcon },
  { id: 'mail', title: 'Contato', iconSrc: mailIcon }
]

const getAppComponent = (id: string) => {
  switch (id) {
    case 'terminal': return TerminalApp
    case 'vscode': return VSCodeApp
    case 'files': return FilesApp
    case 'gallery': return GalleryApp
    case 'settings': return SettingsApp
    case 'mail': return MailApp
    case 'spotify': return SpotifyApp
    case 'localstack': return LocalStackApp
    case 'portfolio': return PortfolioApp
    case 'trash': return TrashApp
    default: return null
  }
}

const activeApp = computed(() => {
  return store.windows.find(w => w.isOpen && store.activeWindowId === w.id) || store.windows.find(w => w.isOpen)
})

const openApp = (id: string) => {
  triggerHaptic()
  store.windows.forEach(w => {
    if (w.id !== id && (id !== 'gallery' || w.id !== 'files')) {
      w.isOpen = false
    }
  })
  if (id === 'gallery') {
    store.openPhotosInFinder()
    return
  }
  store.openWindow(id)
}

const closeActiveApp = () => {
  triggerHaptic()
  store.windows.forEach(w => {
    w.isOpen = false
  })
  store.activeWindowId = null
}

onMounted(() => {
  updateTime()
  clockInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(clockInterval)
})
</script>

<template>
  <div
    class="relative w-full h-[100dvh] flex flex-col overflow-hidden select-none font-sans transition-colors duration-500"
    :class="store.theme === 'light' ? 'bg-[#eef2f7] text-zinc-900' : 'bg-[#070709] text-white'"
  >
    <!-- Background layer: Light macOS or Dark Void -->
    <div
      v-if="store.theme === 'light'"
      class="absolute inset-0 pointer-events-none"
      style="
        background:
          radial-gradient(ellipse 70% 60% at 20% 20%, rgba(254, 180, 123, 0.35) 0%, transparent 60%),
          radial-gradient(ellipse 70% 60% at 85% 15%, rgba(199, 125, 255, 0.30) 0%, transparent 65%),
          radial-gradient(ellipse 80% 65% at 50% 60%, rgba(144, 219, 244, 0.40) 0%, transparent 70%),
          #eef2f7;
      "
    ></div>
    <div v-else class="absolute inset-0 bg-radial from-zinc-900/40 via-[#070709] to-black pointer-events-none"></div>

    <!-- Top Mobile Status Bar (iOS Native Style) -->
    <div
      class="h-10 shrink-0 flex justify-between items-center px-4 sm:px-6 text-[11px] font-semibold backdrop-blur-md z-[10000] border-b transition-colors duration-300"
      :class="store.theme === 'light'
        ? 'bg-white/70 border-black/10 text-zinc-800'
        : 'bg-black/40 border-white/[0.04] text-white'"
    >
      <div
        class="flex items-center gap-1.5 cursor-pointer active:opacity-60"
        @click="store.openPowerDialog()"
        title="Menu de Energia"
      >
        <span class="font-bold tracking-tight">BernOS</span>
        <Power class="w-3 h-3 text-zinc-400" />
      </div>

      <div class="font-medium tracking-wide">
        {{ timeString }}
      </div>

      <div class="flex items-center gap-2.5">
        <!-- Sun/Moon Theme Toggle -->
        <button
          @click="store.toggleTheme()"
          class="p-1 rounded-full transition active:scale-90"
          :title="store.theme === 'light' ? 'Modo Escuro' : 'Modo Claro'"
        >
          <Sun v-if="store.theme === 'dark'" class="w-3.5 h-3.5 text-amber-400" />
          <Moon v-else class="w-3.5 h-3.5 text-indigo-600" />
        </button>

        <!-- Battery -->
        <div class="flex items-center gap-1">
          <span class="text-[10px] font-mono">100%</span>
          <div
            class="w-5 h-2.5 border rounded-[3px] p-[1.5px] flex items-center"
            :class="store.theme === 'light' ? 'border-black/40' : 'border-white/40'"
          >
            <div class="h-full w-full bg-emerald-500 rounded-[1px]"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Home Screen Canvas -->
    <div class="flex-grow flex flex-col justify-between relative p-6 pb-4 z-10">
      <!-- Home Apps Grid (Upper Area) -->
      <div class="grid grid-cols-3 gap-y-8 gap-x-4 pt-8">
        <div 
          v-for="app in gridApps" 
          :key="app.id"
          @click="openApp(app.id)"
          class="flex flex-col items-center gap-2 cursor-pointer group active:scale-90 transition-transform duration-150"
        >
          <!-- Official App SVG Icon -->
          <div class="w-15 h-15 rounded-2xl flex items-center justify-center transition duration-150 active:brightness-90 drop-shadow-md">
            <img :src="app.iconSrc" :alt="app.title" class="w-full h-full object-contain rounded-2xl" />
          </div>
          <span
            class="text-[11px] font-medium text-center tracking-tight drop-shadow-xs"
            :class="store.theme === 'light' ? 'text-zinc-800' : 'text-zinc-200'"
          >
            {{ app.title }}
          </span>
        </div>
      </div>

      <!-- Dock Area (Bottom Floating Glass) -->
      <div class="mb-2">
        <div
          class="backdrop-blur-2xl rounded-3xl p-3.5 flex justify-around items-center shadow-2xl transition-colors duration-300"
          :class="store.theme === 'light'
            ? 'bg-white/60 border border-white/80 shadow-black/10'
            : 'bg-zinc-900/60 border border-white/10 shadow-black/50'"
        >
          <div 
            v-for="app in dockApps" 
            :key="app.id"
            @click="openApp(app.id)"
            class="flex flex-col items-center gap-1.5 cursor-pointer group active:scale-90 transition-transform duration-150"
          >
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center transition duration-150 active:brightness-90 drop-shadow-md">
              <img :src="app.iconSrc" :alt="app.title" class="w-full h-full object-contain rounded-2xl" />
            </div>
            <span
              class="text-[10px] font-medium text-center tracking-tight"
              :class="store.theme === 'light' ? 'text-zinc-700' : 'text-zinc-300'"
            >
              {{ app.title }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Fullscreen App Layer -->
    <Transition name="app-slide">
      <div 
        v-if="activeApp" 
        class="fixed inset-x-0 bottom-0 top-0 pt-10 z-[5000] flex flex-col overflow-hidden transition-colors duration-300"
        :class="store.theme === 'light' ? 'bg-[#fbfbfd]' : 'bg-[#0d0e12]'"
      >
        <!-- App Titlebar/Header -->
        <div
          class="h-11 shrink-0 border-b backdrop-blur-xl flex justify-between items-center px-3.5 z-[50] transition-colors duration-300"
          :class="store.theme === 'light'
            ? 'bg-[#f5f5f7]/95 border-black/10 text-zinc-900'
            : 'bg-[#090a0d]/90 border-white/[0.08] text-zinc-100'"
        >
          <button 
            @click="closeActiveApp" 
            class="flex items-center gap-0.5 text-xs font-medium text-sky-500 hover:text-sky-600 transition cursor-pointer active:opacity-70"
          >
            <ChevronLeft class="w-4 h-4" />
            <span>Voltar</span>
          </button>
          
          <span class="text-xs font-semibold tracking-wide">
            {{ activeApp.title }}
          </span>

          <div class="w-12"></div>
        </div>

        <!-- App View Area (Scrollable and responsive) -->
        <div class="flex-grow min-h-0 overflow-auto relative flex flex-col">
          <component :is="getAppComponent(activeApp.id)" />
        </div>

        <!-- iOS Style Bottom Home Indicator -->
        <div
          class="h-5 shrink-0 flex items-center justify-center pb-1 z-[50] transition-colors duration-300"
          :class="store.theme === 'light' ? 'bg-[#f5f5f7]' : 'bg-[#090a0d]'"
        >
          <div 
            @click="closeActiveApp" 
            class="w-32 h-1 rounded-full transition cursor-pointer active:opacity-100"
            :class="store.theme === 'light' ? 'bg-black/30 hover:bg-black/50' : 'bg-white/30 hover:bg-white/50'"
          ></div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.app-slide-enter-active,
.app-slide-leave-active {
  transition: transform 0.28s cubic-bezier(0.32, 0.94, 0.6, 1), opacity 0.2s ease;
}

.app-slide-enter-from {
  transform: translateY(100%);
  opacity: 0.9;
}

.app-slide-leave-to {
  transform: translateY(100%);
  opacity: 0.9;
}
</style>
