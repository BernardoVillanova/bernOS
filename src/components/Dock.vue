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

// Dock items array mapping
const dockItems = [
  { id: 'terminal', name: 'Terminal', icon: Terminal, color: 'text-emerald-400 hover:text-emerald-300' },
  { id: 'vscode', name: 'VSCode', icon: Code, color: 'text-blue-400 hover:text-blue-300' },
  { id: 'files', name: 'Files', icon: Folder, color: 'text-amber-400 hover:text-amber-300' },
  { id: 'mail', name: 'Contato', icon: Mail, color: 'text-sky-300 hover:text-sky-200' },
  { id: 'spotify', name: 'Music Player', icon: Music, color: 'text-green-400 hover:text-green-300' },
  { id: 'localstack', name: 'LocalStack', icon: Cloud, color: 'text-purple-400 hover:text-purple-300' }
]
</script>

<template>
  <div class="fixed bottom-3 left-1/2 -translate-x-1/2 z-[9999] flex items-center select-none pointer-events-auto">
    <!-- Main Dock Wrapper (Centered and rounded) -->
    <div class="h-[54px] px-3.5 rounded-2xl bg-black/60 border border-white/5 shadow-2xl backdrop-blur-xl flex items-center">
      
      <!-- Application Launcher Icons -->
      <div class="flex items-end gap-3.5 h-full pb-1">
        <div
          v-for="item in dockItems"
          :key="item.id"
          class="relative group flex flex-col items-center cursor-pointer transition-all duration-200"
          @click="handleDockClick(item.id)"
        >
          <!-- Tooltip -->
          <div class="absolute -top-9 px-2 py-1 bg-black/90 text-[9px] text-brand-orange rounded border border-brand-orange/20 shadow-md opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap">
            {{ item.name }}
          </div>

          <!-- Icon Wrapper with bounce and scaling -->
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/5 shadow-inner transition-all duration-200 hover:scale-120 hover:-translate-y-1.5 active:scale-95"
            :class="[
              item.color,
              isWindowActive(item.id) ? 'bg-brand-orange/10 border-brand-orange/20 shadow-brand-orange/5' : ''
            ]"
          >
            <component :is="item.icon" class="w-5 h-5 stroke-[1.8]" />
          </div>

          <!-- App Active Indicators -->
          <div class="absolute -bottom-1 flex justify-center w-full">
            <!-- LocalStack status indicator -->
            <template v-if="item.id === 'localstack'">
              <div
                v-if="store.localstackStatus === 'running'"
                class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500 animate-pulse"
              ></div>
              <div
                v-else-if="store.localstackStatus === 'stopped'"
                class="w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm shadow-red-500"
              ></div>
            </template>
            <!-- Default open/active indicator -->
            <template v-else>
              <div
                v-if="isWindowOpen(item.id)"
                class="w-1 h-1 rounded-full bg-brand-orange/60 shadow-sm shadow-brand-orange transition-all duration-200"
                :class="isWindowActive(item.id) ? 'w-2.5 bg-brand-orange shadow-brand-orange' : 'opacity-50'"
              ></div>
            </template>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.group:hover .absolute {
  display: block;
}
</style>
