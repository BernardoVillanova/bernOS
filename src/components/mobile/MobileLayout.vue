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
    navigator.vibrate(15) // Subtle 15ms vibration
  }
}

// App data mappings
const gridApps = [
  { id: 'files', title: 'Arquivos', icon: Folder, color: 'text-amber-400', bg: 'bg-amber-950/20 border-amber-500/20 hover:border-amber-400/40' },
  { id: 'spotify', title: 'Spotify', icon: Music, color: 'text-green-400', bg: 'bg-green-950/20 border-green-500/20 hover:border-green-400/40' },
  { id: 'localstack', title: 'LocalStack', icon: Cloud, color: 'text-purple-400', bg: 'bg-purple-950/20 border-purple-500/20 hover:border-purple-400/40' }
]

const dockApps = [
  { id: 'terminal', title: 'Terminal', icon: Terminal, color: 'text-emerald-400', bg: 'bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-400/40' },
  { id: 'vscode', title: 'VS Code', icon: Code, color: 'text-blue-400', bg: 'bg-blue-950/20 border-blue-500/20 hover:border-blue-400/40' },
  { id: 'mail', title: 'Contato', icon: Mail, color: 'text-sky-300', bg: 'bg-sky-950/20 border-sky-500/20 hover:border-sky-400/40' }
]

// Dynamic App Component Loader
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

// Find open active window
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
  <div class="relative w-full h-[100dvh] flex flex-col overflow-hidden text-white select-none font-sans bg-black">
    <!-- Top Mobile Status Bar (iOS style) -->
    <div class="h-9 shrink-0 flex justify-between items-center px-6 text-[11px] font-semibold bg-black/30 backdrop-blur-md z-[10000] border-b border-white/[0.03]">
      <div class="flex items-center gap-1 text-gray-300">
        <span>BernOS</span>
        <Wifi class="w-3 h-3 text-white/80" />
      </div>
      <div class="text-white font-medium select-none">
        {{ timeString }}
      </div>
      <div class="flex items-center gap-1.5 text-gray-300">
        <span>85%</span>
        <div class="w-5 h-2.5 border border-white/30 rounded-sm p-[1.5px] flex items-center">
          <div class="h-full w-[85%] bg-emerald-500 rounded-[1px]"></div>
        </div>
      </div>
    </div>

    <!-- Home Screen Canvas (rendered when no app is open in fullscreen) -->
    <div class="flex-grow flex flex-col justify-between relative p-6 pb-2">
      <!-- Home Apps Grid (Upper Area) -->
      <div class="grid grid-cols-3 gap-y-8 gap-x-4 pt-12">
        <div 
          v-for="app in gridApps" 
          :key="app.id"
          @click="openApp(app.id)"
          class="flex flex-col items-center gap-2 cursor-pointer group active:scale-95 transition-transform"
        >
          <!-- Icon Squircles -->
          <div 
            class="w-14 h-14 rounded-2xl flex items-center justify-center border backdrop-blur-md shadow-lg transition duration-200"
            :class="app.bg"
          >
            <component :is="app.icon" class="w-6 h-6 stroke-[1.8]" :class="app.color" />
          </div>
          <span class="text-[10px] font-medium text-gray-200/90 text-center tracking-wide drop-shadow-md">
            {{ app.title }}
          </span>
        </div>
      </div>

      <!-- Dock Area (Bottom Area) -->
      <div class="mb-4">
        <div class="bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-4 flex justify-around items-center shadow-xl">
          <div 
            v-for="app in dockApps" 
            :key="app.id"
            @click="openApp(app.id)"
            class="flex flex-col items-center gap-1.5 cursor-pointer group active:scale-95 transition-transform"
          >
            <div 
              class="w-14 h-14 rounded-2xl flex items-center justify-center border backdrop-blur-md shadow-lg transition duration-200"
              :class="app.bg"
            >
              <component :is="app.icon" class="w-6 h-6 stroke-[1.8]" :class="app.color" />
            </div>
            <span class="text-[10px] font-medium text-gray-200/90 text-center tracking-wide drop-shadow-md">
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
        class="fixed inset-x-0 bottom-0 top-0 pt-9 bg-black z-[5000] flex flex-col overflow-hidden"
      >
        <!-- App Titlebar/Header -->
        <div class="h-12 shrink-0 border-b border-white/[0.07] bg-[#0a0a0c]/90 backdrop-blur-lg flex justify-between items-center px-4 z-[50]">
          <button 
            @click="closeActiveApp" 
            class="flex items-center gap-0.5 text-[12px] font-semibold text-brand-orange hover:text-brand-orange-light transition cursor-pointer"
          >
            <ChevronLeft class="w-4 h-4" />
            <span>Home</span>
          </button>
          
          <span class="text-[12px] font-bold text-white tracking-wide">
            {{ activeApp.title }}
          </span>

          <div class="w-12"></div> <!-- Spacer to center the title -->
        </div>

        <!-- App View Area -->
        <div class="flex-grow overflow-hidden relative bg-black">
          <component :is="getAppComponent(activeApp.id)" />
        </div>

        <!-- iOS Style Bottom Home Indicator -->
        <div class="h-6 shrink-0 bg-black flex items-center justify-center pb-2 z-[50]">
          <div 
            @click="closeActiveApp" 
            class="w-28 h-1 bg-white/35 rounded-full hover:bg-white/50 transition cursor-pointer active:bg-white"
          ></div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* iOS-style slide-up animation for opening apps */
.app-slide-enter-active,
.app-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.94, 0.6, 1), opacity 0.25s ease;
}

.app-slide-enter-from {
  transform: translateY(100%);
  opacity: 0.8;
}

.app-slide-leave-to {
  transform: translateY(100%);
  opacity: 0.8;
}
</style>
