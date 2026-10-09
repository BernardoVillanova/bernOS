<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWindowStore } from '../../stores/windowStore'
import { 
  Terminal, 
  Code, 
  Folder, 
  Mail, 
  Music, 
  Cloud, 
  ChevronLeft, 
  Wifi
} from 'lucide-vue-next'

// Import app components
import TerminalApp from '../apps/TerminalApp.vue'
import VSCodeApp from '../apps/VSCodeApp.vue'
import FilesApp from '../apps/FilesApp.vue'
import MailApp from '../apps/MailApp.vue'
import SpotifyApp from '../apps/SpotifyApp.vue'
import LocalStackApp from '../apps/LocalStackApp.vue'

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

// Authentic iOS/macOS style App Icon mappings (Rich gradients, solid, clean)
const gridApps = [
  { 
    id: 'files', 
    title: 'Arquivos', 
    icon: Folder, 
    bg: 'bg-gradient-to-b from-sky-400 to-blue-600 border-sky-300/30 text-white shadow-md shadow-sky-950/40' 
  },
  { 
    id: 'spotify', 
    title: 'Spotify', 
    icon: Music, 
    bg: 'bg-gradient-to-b from-emerald-500 to-teal-700 border-emerald-300/30 text-white shadow-md shadow-emerald-950/40' 
  },
  { 
    id: 'localstack', 
    title: 'LocalStack', 
    icon: Cloud, 
    bg: 'bg-gradient-to-b from-amber-500 to-orange-600 border-amber-300/30 text-white shadow-md shadow-orange-950/40' 
  }
]

const dockApps = [
  { 
    id: 'terminal', 
    title: 'Terminal', 
    icon: Terminal, 
    bg: 'bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 border-white/15 text-zinc-100 shadow-md shadow-black/50' 
  },
  { 
    id: 'vscode', 
    title: 'VS Code', 
    icon: Code, 
    bg: 'bg-gradient-to-b from-sky-500 to-blue-700 border-sky-300/30 text-white shadow-md shadow-blue-950/40' 
  },
  { 
    id: 'mail', 
    title: 'Contato', 
    icon: Mail, 
    bg: 'bg-gradient-to-b from-blue-500 to-indigo-600 border-indigo-300/30 text-white shadow-md shadow-indigo-950/40' 
  }
]

const getAppComponent = (id: string) => {
  switch (id) {
    case 'terminal': return TerminalApp
    case 'vscode': return VSCodeApp
    case 'files': return FilesApp
    case 'mail': return MailApp
    case 'spotify': return SpotifyApp
    case 'localstack': return LocalStackApp
    default: return null
  }
}

const activeApp = computed(() => {
  return store.windows.find(w => w.isOpen && store.activeWindowId === w.id)
})

const openApp = (id: string) => {
  triggerHaptic()
  store.openWindow(id)
}

const closeActiveApp = () => {
  triggerHaptic()
  if (activeApp.value) {
    store.closeWindow(activeApp.value.id)
  }
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
  <div class="relative w-full h-[100dvh] flex flex-col overflow-hidden text-white select-none font-sans bg-[#070709]">
    <!-- Atmospheric deep subtle background -->
    <div class="absolute inset-0 bg-radial from-zinc-900/40 via-[#070709] to-black pointer-events-none"></div>

    <!-- Top Mobile Status Bar (iOS Native Style) -->
    <div class="h-10 shrink-0 flex justify-between items-center px-6 text-[11px] font-semibold bg-black/40 backdrop-blur-md z-[10000] border-b border-white/[0.04]">
      <div class="flex items-center gap-1.5 text-zinc-300">
        <span class="font-bold tracking-tight">BernOS</span>
        <Wifi class="w-3 h-3 text-zinc-400" />
      </div>
      <div class="text-zinc-100 font-medium tracking-wide">
        {{ timeString }}
      </div>
      <div class="flex items-center gap-1.5 text-zinc-300">
        <span class="text-[10px] font-mono">100%</span>
        <div class="w-5 h-2.5 border border-white/40 rounded-[3px] p-[1.5px] flex items-center">
          <div class="h-full w-full bg-emerald-400 rounded-[1px]"></div>
        </div>
      </div>
    </div>

    <!-- Home Screen Canvas -->
    <div class="flex-grow flex flex-col justify-between relative p-6 pb-4 z-10">
      
      <!-- Home Apps Grid (Upper Area) -->
      <div class="grid grid-cols-3 gap-y-8 gap-x-4 pt-10">
        <div 
          v-for="app in gridApps" 
          :key="app.id"
          @click="openApp(app.id)"
          class="flex flex-col items-center gap-2 cursor-pointer group active:scale-90 transition-transform duration-150"
        >
          <!-- Authentic iOS Squircle App Icon -->
          <div 
            class="w-15 h-15 rounded-2xl flex items-center justify-center border transition duration-150 active:brightness-90"
            :class="app.bg"
          >
            <component :is="app.icon" class="w-7 h-7 stroke-[2] drop-shadow-sm" />
          </div>
          <span class="text-[11px] font-medium text-zinc-200 text-center tracking-tight">
            {{ app.title }}
          </span>
        </div>
      </div>

      <!-- Dock Area (Bottom Floating Glass) -->
      <div class="mb-2">
        <div class="bg-zinc-900/60 border border-white/10 backdrop-blur-2xl rounded-3xl p-3.5 flex justify-around items-center shadow-2xl">
          <div 
            v-for="app in dockApps" 
            :key="app.id"
            @click="openApp(app.id)"
            class="flex flex-col items-center gap-1.5 cursor-pointer group active:scale-90 transition-transform duration-150"
          >
            <div 
              class="w-14 h-14 rounded-2xl flex items-center justify-center border transition duration-150 active:brightness-90"
              :class="app.bg"
            >
              <component :is="app.icon" class="w-6.5 h-6.5 stroke-[2] drop-shadow-sm" />
            </div>
            <span class="text-[10px] font-medium text-zinc-300 text-center tracking-tight">
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
        class="fixed inset-x-0 bottom-0 top-0 pt-10 bg-[#0d0e12] z-[5000] flex flex-col overflow-hidden"
      >
        <!-- App Titlebar/Header -->
        <div class="h-11 shrink-0 border-b border-white/[0.08] bg-[#090a0d]/90 backdrop-blur-xl flex justify-between items-center px-3.5 z-[50]">
          <button 
            @click="closeActiveApp" 
            class="flex items-center gap-0.5 text-xs font-medium text-sky-400 hover:text-sky-300 transition cursor-pointer active:opacity-70"
          >
            <ChevronLeft class="w-4 h-4" />
            <span>Voltar</span>
          </button>
          
          <span class="text-xs font-semibold text-zinc-100 tracking-wide">
            {{ activeApp.title }}
          </span>

          <div class="w-12"></div>
        </div>

        <!-- App View Area (Scrollable and responsive) -->
        <div class="flex-grow overflow-auto relative bg-[#0d0e12] flex flex-col">
          <component :is="getAppComponent(activeApp.id)" />
        </div>

        <!-- iOS Style Bottom Home Indicator -->
        <div class="h-5 shrink-0 bg-[#090a0d] flex items-center justify-center pb-1 z-[50]">
          <div 
            @click="closeActiveApp" 
            class="w-32 h-1 bg-white/30 rounded-full hover:bg-white/50 transition cursor-pointer active:bg-white"
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
