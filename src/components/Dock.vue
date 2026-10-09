<script setup lang="ts">
import { useWindowStore } from '../stores/windowStore'
import { Terminal, Code, Folder, Mail, Music, Cloud } from 'lucide-vue-next'

const store = useWindowStore()

const isWindowOpen = (id: string) => {
  const win = store.windows.find(w => w.id === id)
  return win ? win.isOpen : false
}

const isWindowActive = (id: string) => {
  return store.activeWindowId === id && isWindowOpen(id) && !store.windows.find(w => w.id === id)?.isMinimized
}

const handleDockClick = (id: string) => {
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

// macOS style app icon design mappings (Rich, solid, authentic OS feel)
const dockItems = [
  { 
    id: 'terminal', 
    name: 'Terminal', 
    icon: Terminal, 
    bg: 'bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 border-white/15 text-zinc-100 shadow-zinc-950/40' 
  },
  { 
    id: 'vscode', 
    name: 'VS Code', 
    icon: Code, 
    bg: 'bg-gradient-to-b from-sky-500 to-blue-700 border-sky-300/30 text-white shadow-blue-900/30' 
  },
  { 
    id: 'files', 
    name: 'Arquivos', 
    icon: Folder, 
    bg: 'bg-gradient-to-b from-sky-400 to-blue-600 border-sky-300/30 text-white shadow-sky-900/30' 
  },
  { 
    id: 'mail', 
    name: 'Contato', 
    icon: Mail, 
    bg: 'bg-gradient-to-b from-blue-500 to-indigo-600 border-indigo-300/30 text-white shadow-indigo-900/30' 
  },
  { 
    id: 'spotify', 
    name: 'Spotify', 
    icon: Music, 
    bg: 'bg-gradient-to-b from-emerald-500 to-teal-700 border-emerald-300/30 text-white shadow-emerald-950/30' 
  },
  { 
    id: 'localstack', 
    name: 'LocalStack', 
    icon: Cloud, 
    bg: 'bg-gradient-to-b from-amber-500 to-orange-600 border-amber-300/30 text-white shadow-orange-950/30' 
  }
]
</script>

<template>
  <div class="fixed bottom-3.5 left-1/2 -translate-x-1/2 z-[9999] flex items-center select-none pointer-events-auto">
    <!-- macOS Authentic Glassmorphism Dock -->
    <div class="h-[62px] px-3.5 rounded-2xl bg-zinc-900/60 border border-white/10 shadow-2xl backdrop-blur-2xl flex items-center">
      
      <!-- Application Launcher Icons -->
      <div class="flex items-end gap-3 h-full pb-1">
        <div
          v-for="item in dockItems"
          :key="item.id"
          class="relative group flex flex-col items-center cursor-pointer transition-all duration-200"
          @click="handleDockClick(item.id)"
        >
          <!-- macOS Native Style Tooltip -->
          <div class="absolute -top-10 px-2.5 py-1 bg-zinc-900/95 text-[11px] font-medium text-zinc-100 rounded-lg border border-white/10 shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap">
            {{ item.name }}
          </div>

          <!-- Squircle App Icon (Rich Apple macOS Aesthetic) -->
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center border shadow-lg transition-all duration-200 hover:scale-120 hover:-translate-y-2 active:scale-95"
            :class="[
              item.bg,
              isWindowActive(item.id) ? 'ring-2 ring-white/30' : ''
            ]"
          >
            <component :is="item.icon" class="w-5 h-5 stroke-[2] drop-shadow-sm" />
          </div>

          <!-- macOS Authentic Active Indicator Dot -->
          <div class="absolute -bottom-1 flex justify-center w-full">
            <template v-if="item.id === 'localstack'">
              <div
                v-if="store.localstackStatus === 'running'"
                class="w-1 h-1 rounded-full bg-emerald-400 shadow-xs"
              ></div>
              <div
                v-else-if="store.localstackStatus === 'stopped'"
                class="w-1 h-1 rounded-full bg-red-400 shadow-xs"
              ></div>
            </template>
            <template v-else>
              <div
                v-if="isWindowOpen(item.id)"
                class="h-1 rounded-full transition-all duration-200"
                :class="isWindowActive(item.id) ? 'w-2 bg-white' : 'w-1 bg-white/50'"
              ></div>
            </template>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
