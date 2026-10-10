<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useWindowStore } from '../stores/windowStore'

const props = defineProps<{
  id: string
}>()

const store = useWindowStore()

// Find this window state in the store
const win = computed(() => store.windows.find(w => w.id === props.id)!)

const isDragging = ref(false)
const isResizing = ref(false)

const dragOffset = ref({ x: 0, y: 0 })
const startSize = ref({ width: 0, height: 0, x: 0, y: 0, mouseX: 0, mouseY: 0 })
const resizeDir = ref('')

const isFocused = computed(() => store.activeWindowId === props.id)



// Focus window on mousedown
const handleFocus = () => {
  store.focusWindow(props.id)
}

// Start dragging from title bar
const startDrag = (e: MouseEvent) => {
  // Prevent dragging if clicked on window buttons
  if ((e.target as HTMLElement).closest('.win-btn')) return
  
  // Only drag if window is not maximized
  if (win.value.isMaximized) return

  handleFocus()
  isDragging.value = true
  
  dragOffset.value = {
    x: e.clientX - win.value.x,
    y: e.clientY - win.value.y
  }

  window.addEventListener('mousemove', handleDrag)
  window.addEventListener('mouseup', stopDrag)
}

const handleDrag = (e: MouseEvent) => {
  if (!isDragging.value) return
  
  // Calculate new coordinates, constraint within viewport
  let newX = e.clientX - dragOffset.value.x
  let newY = e.clientY - dragOffset.value.y

  // Avoid dragging title bar completely out of the viewport
  newY = Math.max(0, Math.min(newY, window.innerHeight - 40))
  newX = Math.max(-win.value.width + 100, Math.min(newX, window.innerWidth - 100))

  store.updatePosition(props.id, newX, newY)
}

const stopDrag = () => {
  isDragging.value = false
  window.removeEventListener('mousemove', handleDrag)
  window.removeEventListener('mouseup', stopDrag)
}

// Start resizing from any border/corner handle
const startResize = (e: MouseEvent, direction: string) => {
  e.stopPropagation()
  e.preventDefault()
  
  if (win.value.isMaximized) return

  handleFocus()
  isResizing.value = true
  resizeDir.value = direction

  startSize.value = {
    width: win.value.width,
    height: win.value.height,
    x: win.value.x,
    y: win.value.y,
    mouseX: e.clientX,
    mouseY: e.clientY
  }

  window.addEventListener('mousemove', handleResize)
  window.addEventListener('mouseup', stopResize)
}

const handleResize = (e: MouseEvent) => {
  if (!isResizing.value) return

  const deltaX = e.clientX - startSize.value.mouseX
  const deltaY = e.clientY - startSize.value.mouseY

  let newWidth = startSize.value.width
  let newHeight = startSize.value.height
  let newX = win.value.x
  let newY = win.value.y

  const dir = resizeDir.value

  // Horizontal resizing
  if (dir.includes('e')) {
    newWidth = startSize.value.width + deltaX
  } else if (dir.includes('w')) {
    const widthDiff = deltaX
    newWidth = Math.max(startSize.value.width - widthDiff, win.value.minWidth)
    if (newWidth > win.value.minWidth) {
      newX = startSize.value.x + widthDiff
    }
  }

  // Vertical resizing
  if (dir.includes('s')) {
    newHeight = startSize.value.height + deltaY
  } else if (dir.includes('n')) {
    const heightDiff = deltaY
    newHeight = Math.max(startSize.value.height - heightDiff, win.value.minHeight)
    if (newHeight > win.value.minHeight) {
      newY = startSize.value.y + heightDiff
    }
  }

  store.updateSize(props.id, newWidth, newHeight)
  if (dir.includes('w') || dir.includes('n')) {
    store.updatePosition(props.id, newX, newY)
  }
}

const stopResize = () => {
  isResizing.value = false
  window.removeEventListener('mousemove', handleResize)
  window.removeEventListener('mouseup', stopResize)
}

// Double click titlebar to maximize
const handleTitlebarDblClick = () => {
  if (props.id === 'mail') return
  store.toggleMaximizeWindow(props.id)
}

// Watch window dimensions to initialize positions on mount if unset/default
onMounted(() => {
  // If the position is too close to boundary or screen sizes changed
  if (win.value.x + win.value.width > window.innerWidth) {
    const adjustedX = Math.max(20, window.innerWidth - win.value.width - 20)
    store.updatePosition(props.id, adjustedX, win.value.y)
  }
  if (win.value.y + win.value.height > window.innerHeight) {
    const adjustedY = Math.max(50, window.innerHeight - win.value.height - 70)
    store.updatePosition(props.id, win.value.x, adjustedY)
  }
})

onUnmounted(() => {
  stopDrag()
  stopResize()
})
</script>

<template>
  <Transition name="win-zoom">
    <div
      v-if="win.isOpen && !win.isMinimized"
      ref="windowRef"
      class="absolute rounded-xl flex flex-col border overflow-hidden backdrop-blur-xl transition-shadow duration-300"
      :class="[
        store.theme === 'light'
          ? (isFocused ? 'window-active border-black/15 shadow-[0_22px_60px_rgba(0,0,0,0.22)]' : 'window-inactive border-black/10 bg-[#e8e8ea]/90 shadow-[0_10px_30px_rgba(0,0,0,0.12)]')
          : (isFocused ? 'window-active border-white/20' : 'window-inactive border-white/[0.08] bg-zinc-900/80'),
        win.isMaximized ? 'top-0 left-0 w-full! h-[calc(100vh-58px)]! rounded-none border-none' : ''
      ]"
      :style="{
        zIndex: win.zIndex,
        left: win.isMaximized ? '0px' : win.x + 'px',
        top: win.isMaximized ? '0px' : win.y + 'px',
        width: win.isMaximized ? '100%' : win.width + 'px',
        height: win.isMaximized ? 'calc(100vh - 58px)' : win.height + 'px'
      }"
      @mousedown="handleFocus"
    >
      <!-- Title bar -->
      <div
        class="h-9 px-3.5 border-b flex items-center justify-between cursor-default select-none shrink-0 transition-colors"
        :class="store.theme === 'light'
          ? 'bg-[#ececef] border-black/10 text-zinc-800'
          : 'bg-zinc-900/95 border-white/[0.08] text-zinc-300'"
        @mousedown="startDrag"
        @dblclick="handleTitlebarDblClick"
      >
        <!-- Windows style titlebar control dots -->
        <div class="flex items-center gap-2">
          <button
            class="win-btn w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80 flex items-center justify-center text-[7px] text-[#4c0002] font-bold group relative cursor-pointer"
            title="Fechar"
            @click="store.closeWindow(props.id)"
          >
            <span class="opacity-0 group-hover:opacity-100 transition-opacity">×</span>
          </button>
          <button
            class="win-btn w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-[#ffbd2e]/80 flex items-center justify-center text-[7px] text-[#5c3e00] font-bold group relative cursor-pointer"
            title="Minimizar"
            @click="store.minimizeWindow(props.id)"
          >
            <span class="opacity-0 group-hover:opacity-100 transition-opacity">-</span>
          </button>
          <button
            class="win-btn w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold group relative transition"
            :class="props.id === 'mail'
              ? 'bg-[#27c93f]/40 cursor-default'
              : 'bg-[#27c93f] hover:bg-[#27c93f]/80 text-[#006504] cursor-pointer'"
            :title="props.id === 'mail' ? 'Cartão de contato' : 'Maximizar'"
            @click="props.id === 'mail' ? null : store.toggleMaximizeWindow(props.id)"
          >
            <span v-if="props.id !== 'mail'" class="opacity-0 group-hover:opacity-100 transition-opacity">⤢</span>
          </button>
        </div>

        <!-- Title -->
        <div
          class="text-[11px] font-medium flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2"
          :class="store.theme === 'light' ? 'text-zinc-800 font-semibold' : 'text-zinc-300'"
        >
          <slot name="icon"></slot>
          <span>{{ win.title }}</span>
        </div>

        <!-- Right helper/spacer -->
        <div class="w-12"></div>
      </div>

      <!-- Content Area -->
      <div
        class="flex-grow h-[calc(100%-36px)] w-full overflow-hidden relative flex flex-col transition-colors min-h-0"
        :class="store.theme === 'light' ? 'bg-[#f8f9fa] text-zinc-900' : 'bg-[#0d0e12]/95 text-zinc-100'"
      >
        <slot></slot>
      </div>

      <!-- Window Resizer borders (8 directions) -->
      <div v-if="!win.isMaximized && props.id !== 'mail'" class="absolute inset-0 pointer-events-none select-none">
        <!-- Top Edge -->
        <div class="absolute top-0 left-1.5 right-1.5 h-1 cursor-n-resize pointer-events-auto z-[9999]" @mousedown="startResize($event, 'n')"></div>
        <!-- Bottom Edge -->
        <div class="absolute bottom-0 left-1.5 right-1.5 h-1 cursor-s-resize pointer-events-auto z-[9999]" @mousedown="startResize($event, 's')"></div>
        <!-- Left Edge -->
        <div class="absolute left-0 top-1.5 bottom-1.5 w-1 cursor-w-resize pointer-events-auto z-[9999]" @mousedown="startResize($event, 'w')"></div>
        <!-- Right Edge -->
        <div class="absolute right-0 top-1.5 bottom-1.5 w-1 cursor-e-resize pointer-events-auto z-[9999]" @mousedown="startResize($event, 'e')"></div>
        
        <!-- Corners -->
        <div class="absolute top-0 left-0 w-2.5 h-2.5 cursor-nw-resize pointer-events-auto z-[10000]" @mousedown="startResize($event, 'nw')"></div>
        <div class="absolute top-0 right-0 w-2.5 h-2.5 cursor-ne-resize pointer-events-auto z-[10000]" @mousedown="startResize($event, 'ne')"></div>
        <div class="absolute bottom-0 left-0 w-2.5 h-2.5 cursor-sw-resize pointer-events-auto z-[10000]" @mousedown="startResize($event, 'sw')"></div>
        <!-- Bottom-Right visual resizer grip + corner -->
        <div class="absolute bottom-0 right-0 w-3.5 h-3.5 cursor-se-resize pointer-events-auto z-[10000] flex items-end justify-end p-0.5" @mousedown="startResize($event, 'se')">
          <svg width="6" height="6" viewBox="0 0 10 10" fill="none" class="text-gray-500/50 hover:text-brand-orange">
            <path d="M10 0L0 10M10 4L4 10M10 8L8 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Window entry/exit zoom animations */
.win-zoom-enter-active,
.win-zoom-leave-active {
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.win-zoom-enter-from,
.win-zoom-leave-to {
  opacity: 0;
  transform: scale(0.92) translateY(12px);
}
</style>
