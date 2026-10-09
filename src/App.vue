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

// Import icons for desktop icons
import { Terminal, Code, Folder, Mail, Music, Cloud } from 'lucide-vue-next'

const store = useWindowStore()

const showTutorial = ref(false)
const showInstructions = ref(false)
const isMobile = ref(false)

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
    case 'mail': return MailApp
    case 'spotify': return SpotifyApp
    case 'localstack': return LocalStackApp
    default: return null
  }
}

// Icon mappings for titlebars
const getAppIcon = (id: string) => {
  switch (id) {
    case 'terminal': return Terminal
    case 'vscode': return Code
    case 'files': return Folder
    case 'mail': return Mail
    case 'spotify': return Music
    case 'localstack': return Cloud
    default: return Folder
  }
}

const getAppIconColor = (id: string) => {
  switch (id) {
    case 'terminal': return 'text-zinc-300'
    case 'vscode': return 'text-blue-400'
    case 'files': return 'text-sky-400'
    case 'mail': return 'text-indigo-400'
    case 'spotify': return 'text-emerald-400'
    case 'localstack': return 'text-amber-400'
    default: return 'text-zinc-300'
  }
}
</script>

<template>
  <div class="w-screen h-screen overflow-hidden flex flex-col relative select-none font-sans bg-transparent">
    <!-- Wallpaper background -->
    <DesktopBackground />

    <!-- Mobile Layout vs Desktop Layout -->
    <MobileLayout v-if="isMobile" />

    <template v-else>
      <!-- Top status bar -->
      <TopBar />

      <!-- Desktop Area (Windows container) -->
      <div class="flex-grow relative overflow-hidden p-6">
        
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
