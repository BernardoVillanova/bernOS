<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWindowStore } from './stores/windowStore'

const store = useWindowStore()

const showTutorial = ref(false)
const showInstructions = ref(false)
const showMobileWarning = ref(false)

const completeTutorial = () => {
  showTutorial.value = false
  localStorage.setItem('bernos_tutorial_complete', 'true')
}

const checkMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024
}

const dismissMobileWarning = () => {
  showMobileWarning.value = false
  const tutorialComplete = localStorage.getItem('bernos_tutorial_complete')
  if (!tutorialComplete) {
    showTutorial.value = true
  }
}

onMounted(() => {
  if (checkMobile()) {
    showMobileWarning.value = true
  } else {
    const tutorialComplete = localStorage.getItem('bernos_tutorial_complete')
    if (!tutorialComplete) {
      showTutorial.value = true
    }
  }
})
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
import { Terminal, Code, Folder, Mail, Music, Cloud, AlertTriangle } from 'lucide-vue-next'

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
    case 'terminal': return 'text-emerald-400'
    case 'vscode': return 'text-blue-400'
    case 'files': return 'text-amber-400'
    case 'mail': return 'text-sky-300'
    case 'spotify': return 'text-green-400'
    case 'localstack': return 'text-purple-400'
    default: return 'text-brand-orange'
  }
}
</script>

<template>
  <div class="w-screen h-screen overflow-hidden flex flex-col relative select-none font-sans bg-transparent">
    <!-- Wallpaper background -->
    <DesktopBackground />

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

    <!-- Onboarding Tutorial Modal -->
    <Transition name="tutorial-fade">
      <div v-if="showTutorial" class="fixed inset-0 z-[100000] flex items-center justify-center bg-black/75 backdrop-blur-sm">
        <div class="w-[380px] bg-[#0a0a0c]/90 border border-brand-orange/30 p-6 rounded-2xl shadow-2xl flex flex-col gap-4 text-gray-200">
          
          <!-- Screen 1: Choice question -->
          <template v-if="!showInstructions">
            <div class="text-center">
              <h3 class="text-sm font-bold text-white tracking-wide">É a sua primeira vez no BernOS?</h3>
              <p class="text-[9px] text-brand-orange-light font-semibold uppercase mt-0.5 tracking-wider">Boas-vindas</p>
            </div>
            
            <p class="text-xs leading-relaxed text-gray-300 text-center mt-1">
              Gostaria de ver um breve tutorial de 1 minuto ensinando a navegar pelos aplicativos, janelas e atalhos do portfólio?
            </p>

            <div class="flex gap-3 justify-center mt-3">
              <button
                class="px-4 py-2 border border-white/10 hover:bg-white/5 text-gray-300 rounded-lg cursor-pointer transition text-xs font-semibold"
                @click="completeTutorial"
              >
                Não, pular
              </button>
              <button
                class="px-4 py-2 bg-brand-orange hover:bg-brand-orange-light text-black font-extrabold rounded-lg shadow-md cursor-pointer transition text-xs"
                @click="showInstructions = true"
              >
                Sim, ver tutorial
              </button>
            </div>
          </template>

          <!-- Screen 2: Step-by-step instructions -->
          <template v-else>
            <div class="text-center">
              <h3 class="text-sm font-bold text-white tracking-wide">Como navegar no BernOS</h3>
              <p class="text-[9px] text-brand-orange-light font-semibold uppercase mt-0.5 tracking-wider">Manual de Inicialização</p>
            </div>

            <div class="text-xs leading-relaxed flex flex-col gap-2.5 text-gray-300 mt-1 select-text">
              <p class="select-text">Este portfólio simula um sistema operacional completo. Como navegar:</p>
              <ul class="flex flex-col gap-2 select-text">
                <li class="flex gap-2 select-text">
                  <span class="text-brand-orange font-bold select-text">1.</span>
                  <span class="select-text"><strong>Dock (Abaixo)</strong>: Clique nos ícones coloridos para abrir aplicativos (Terminal, VSCode, Files, Contato, Music Player).</span>
                </li>
                <li class="flex gap-2 select-text">
                  <span class="text-brand-orange font-bold select-text">2.</span>
                  <span class="select-text"><strong>Janelas</strong>: Arraste pelo cabeçalho. Redimensione puxando qualquer <strong>borda ou canto</strong>.</span>
                </li>
                <li class="flex gap-2 select-text">
                  <span class="text-brand-orange font-bold select-text">3.</span>
                  <span class="select-text"><strong>Contato</strong>: Clique no envelope no Dock para ver redes sociais (LinkedIn, GitHub e E-mail).</span>
                </li>
                <li class="flex gap-2 select-text">
                  <span class="text-brand-orange font-bold select-text">4.</span>
                  <span class="select-text"><strong>Calendário</strong>: Clique no relógio no centro da barra superior.</span>
                </li>
              </ul>
            </div>

            <div class="flex justify-center mt-3">
              <button
                class="px-5 py-2.5 bg-brand-orange hover:bg-brand-orange-light text-black font-extrabold rounded-lg shadow-md cursor-pointer transition active:scale-95 text-xs tracking-wide"
                @click="completeTutorial"
              >
                Entendi, iniciar!
              </button>
            </div>
          </template>
          
        </div>
      </div>
    </Transition>

    <!-- Mobile Device Warning Modal -->
    <Transition name="tutorial-fade">
      <div v-if="showMobileWarning" class="fixed inset-0 z-[100000] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
        <div class="w-[380px] bg-[#0a0a0c]/95 border border-amber-500/30 p-6 rounded-2xl shadow-2xl flex flex-col gap-4 text-gray-200">
          
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 mb-3">
              <AlertTriangle class="w-6 h-6" />
            </div>
            <h3 class="text-sm font-bold text-white tracking-wide">Aviso de Experiência</h3>
            <p class="text-[9px] text-amber-500 font-semibold uppercase mt-0.5 tracking-wider">Dispositivo Mobile/Tela Pequena</p>
          </div>
          
          <p class="text-xs leading-relaxed text-gray-300 text-center select-text">
            O BernOS simula um sistema operacional completo voltado para computadores. A navegação de janelas e visualização dos aplicativos não é otimizada para telas pequenas e pode ficar prejudicada.
          </p>

          <div class="flex flex-col gap-2 mt-2">
            <button
              class="w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-lg shadow-md cursor-pointer transition active:scale-95 text-xs text-center"
              @click="dismissMobileWarning"
            >
              Prosseguir mesmo assim
            </button>
          </div>
          
        </div>
      </div>
    </Transition>
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
