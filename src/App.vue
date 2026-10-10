<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useWindowStore } from './stores/windowStore'
import MobileLayout from './components/mobile/MobileLayout.vue'
import DesktopBackground from './components/DesktopBackground.vue'
import TopBar from './components/TopBar.vue'
import Dock from './components/Dock.vue'
import OsWindow from './components/OsWindow.vue'

// Import app components
import TerminalApp from './components/apps/TerminalApp.vue'
import VSCodeApp from './components/apps/VSCodeApp.vue'
import FilesApp from './components/apps/FilesApp.vue'
import MailApp from './components/apps/MailApp.vue'
import SpotifyApp from './components/apps/SpotifyApp.vue'
import LocalStackApp from './components/apps/LocalStackApp.vue'
import PortfolioApp from './components/apps/PortfolioApp.vue'
import TrashApp from './components/apps/TrashApp.vue'
import GalleryApp from './components/apps/GalleryApp.vue'
import SettingsApp from './components/apps/SettingsApp.vue'
import PowerOverlay from './components/PowerOverlay.vue'

// Import icons for desktop icons
import { Terminal, Code, Folder, Mail, Music, Cloud, Globe, Trash2, Image, Settings } from 'lucide-vue-next'

const store = useWindowStore()

const showTutorial = ref(false)
const showInstructions = ref(false)
const isMobile = ref(false)
const selectedDesktopIcon = ref<string | null>(null)

import safariIcon from './assets/app-icons/safari.svg'
import terminalIcon from './assets/app-icons/terminal.svg'
import vscodeIcon from './assets/app-icons/vscode.svg'
import finderIcon from './assets/app-icons/finder.svg'
import photosIcon from './assets/app-icons/photos.svg'
import settingsIcon from './assets/app-icons/settings.svg'
import trashIcon from './assets/app-icons/trash.svg'

// macOS Authentic Desktop order: Finder is #1
const desktopShortcuts = [
  { id: 'files', title: 'Finder', iconSrc: finderIcon },
  { id: 'portfolio', title: 'Navegador', iconSrc: safariIcon },
  { id: 'gallery', title: 'Fotos', iconSrc: photosIcon },
  { id: 'terminal', title: 'Terminal', iconSrc: terminalIcon },
  { id: 'vscode', title: 'VS Code', iconSrc: vscodeIcon },
  { id: 'settings', title: 'Configurações', iconSrc: settingsIcon },
  { id: 'trash', title: 'Lixeira', iconSrc: trashIcon }
]

const completeTutorial = () => {
  showTutorial.value = false
  localStorage.setItem('bernos_tutorial_complete', 'true')
}

const checkMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768
}

const updateLayoutMode = () => {
  isMobile.value = checkMobile()
  if (isMobile.value) {
    // Close all windows on mobile to show the Home Screen
    store.windows.forEach(w => {
      w.isOpen = false
    })
    store.activeWindowId = null
  }
}

onMounted(() => {
  updateLayoutMode()
  if (!isMobile.value) {
    store.layoutInitialWindows()
  }
  window.addEventListener('resize', updateLayoutMode)

  const tutorialComplete = localStorage.getItem('bernos_tutorial_complete')
  if (!tutorialComplete && !isMobile.value) {
    showTutorial.value = true
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateLayoutMode)
})

// Mapping window ID to component
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

// Icon mappings for titlebars
const getAppIcon = (id: string) => {
  switch (id) {
    case 'terminal': return Terminal
    case 'vscode': return Code
    case 'files': return Folder
    case 'gallery': return Image
    case 'settings': return Settings
    case 'mail': return Mail
    case 'spotify': return Music
    case 'localstack': return Cloud
    case 'portfolio': return Globe
    case 'trash': return Trash2
    default: return Folder
  }
}

const getAppIconColor = (id: string) => {
  switch (id) {
    case 'terminal': return 'text-zinc-300'
    case 'vscode': return 'text-blue-400'
    case 'files': return 'text-sky-400'
    case 'gallery': return 'text-amber-400'
    case 'settings': return 'text-zinc-400'
    case 'mail': return 'text-indigo-400'
    case 'spotify': return 'text-emerald-400'
    case 'localstack': return 'text-amber-400'
    case 'portfolio': return 'text-sky-400'
    case 'trash': return 'text-zinc-400'
    default: return 'text-zinc-300'
  }
}
</script>

<template>
  <div class="w-screen h-screen overflow-hidden flex flex-col relative select-none font-sans bg-transparent">
    <!-- Power overlay (Shutdown, Restart, Off screen) -->
    <PowerOverlay />

    <!-- Wallpaper background -->
    <DesktopBackground />

    <!-- Mobile Layout vs Desktop Layout -->
    <MobileLayout v-if="isMobile" />

    <template v-else>
      <!-- Top status bar -->
      <TopBar />

      <!-- Desktop Area (Windows container) -->
      <div class="flex-grow relative overflow-hidden p-6" @click="selectedDesktopIcon = null">
        
        <!-- Desktop Shortcuts Column (Authentic macOS Desktop Icons) -->
        <div class="absolute top-4 left-6 z-0 flex flex-col gap-3 select-none pointer-events-auto">
          <div
            v-for="app in desktopShortcuts"
            :key="app.id"
            @click.stop="app.id === 'gallery' ? store.openPhotosInFinder() : store.openWindow(app.id)"
            class="flex flex-col items-center gap-1.5 p-2 rounded-xl cursor-pointer w-20 transition group"
            :class="selectedDesktopIcon === app.id ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5'"
          >
            <div class="w-13 h-13 flex items-center justify-center transition-transform duration-150 group-hover:scale-105 active:scale-95 drop-shadow-lg">
              <img :src="app.iconSrc" :alt="app.title" class="w-full h-full object-contain rounded-2xl" />
            </div>
            <span class="text-[11px] font-medium text-white/90 text-center tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] leading-tight">
              {{ app.title }}
            </span>
          </div>
        </div>

        <!-- App Windows Layer -->
        <OsWindow
          v-for="win in store.windows"
          :key="win.id"
          :id="win.id"
        >
          <template #icon>
            <component :is="getAppIcon(win.id)" class="w-3.5 h-3.5" :class="getAppIconColor(win.id)" />
          </template>
          <!-- Application Component -->
          <component :is="getAppComponent(win.id)" />
        </OsWindow>

      </div>

      <!-- macOS Style bottom Dock -->
      <Dock />

      <!-- Onboarding Tutorial Modal (macOS Clean Dialog Style) -->
      <Transition name="tutorial-fade">
        <div v-if="showTutorial" class="fixed inset-0 z-[100000] flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div class="w-[380px] bg-zinc-900/95 border border-white/10 p-6 rounded-2xl shadow-2xl backdrop-blur-2xl flex flex-col gap-4 text-zinc-200">
            
            <!-- Screen 1: Choice question -->
            <template v-if="!showInstructions">
              <div class="text-center">
                <h3 class="text-sm font-semibold text-white tracking-wide">Bem-vindo ao BernOS</h3>
                <p class="text-[10px] text-zinc-400 font-medium uppercase mt-0.5 tracking-wider">Primeira Inicialização</p>
              </div>
              
              <p class="text-xs leading-relaxed text-zinc-300 text-center mt-1">
                Gostaria de ver um breve guia rápido de navegação pelos aplicativos, janelas e atalhos do portfólio?
              </p>

              <div class="flex gap-2.5 justify-center mt-3">
                <button
                  class="px-4 py-2 border border-white/10 hover:bg-white/5 text-zinc-300 rounded-lg cursor-pointer transition text-xs font-medium"
                  @click="completeTutorial"
                >
                  Pular
                </button>
                <button
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-sm cursor-pointer transition text-xs"
                  @click="showInstructions = true"
                >
                  Ver guia
                </button>
              </div>
            </template>

            <!-- Screen 2: Step-by-step instructions -->
            <template v-else>
              <div class="text-center">
                <h3 class="text-sm font-semibold text-white tracking-wide">Como navegar no BernOS</h3>
                <p class="text-[10px] text-zinc-400 font-medium uppercase mt-0.5 tracking-wider">Atalhos do Sistema</p>
              </div>

              <div class="text-xs leading-relaxed flex flex-col gap-2.5 text-zinc-300 mt-1 select-text">
                <p class="select-text text-zinc-400">Este portfólio simula um sistema operacional completo:</p>
                <ul class="flex flex-col gap-2 select-text">
                  <li class="flex gap-2 select-text">
                    <span class="text-sky-400 font-bold select-text">1.</span>
                    <span class="select-text"><strong>Dock</strong>: Clique nos ícones abaixo para abrir os aplicativos (Terminal, VSCode, Arquivos, Contato, Spotify).</span>
                  </li>
                  <li class="flex gap-2 select-text">
                    <span class="text-sky-400 font-bold select-text">2.</span>
                    <span class="select-text"><strong>Janelas</strong>: Arraste pela barra de título. Redimensione puxando as bordas.</span>
                  </li>
                  <li class="flex gap-2 select-text">
                    <span class="text-sky-400 font-bold select-text">3.</span>
                    <span class="select-text"><strong>Contato</strong>: Clique no aplicativo de envelope para redes sociais (LinkedIn, GitHub e E-mail).</span>
                  </li>
                  <li class="flex gap-2 select-text">
                    <span class="text-sky-400 font-bold select-text">4.</span>
                    <span class="select-text"><strong>Calendário</strong>: Clique no relógio no centro da barra superior.</span>
                  </li>
                </ul>
              </div>

              <div class="flex justify-center mt-3">
                <button
                  class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-sm cursor-pointer transition active:scale-95 text-xs"
                  @click="completeTutorial"
                >
                  Entendi, iniciar!
                </button>
              </div>
            </template>
            
          </div>
        </div>
      </Transition>
    </template>
  </div>
</template>

<style>
/* Global reset overrides if needed */
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
