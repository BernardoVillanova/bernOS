<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWindowStore } from '../../stores/windowStore'
import {
  Trash2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Search,
  Grid,
  List as ListIcon,
  X,
  Eye,
  Info,
  Folder,
  FolderHeart,
  Clock,
  ArrowLeft
} from 'lucide-vue-next'

const store = useWindowStore()

interface TrashItem {
  id: string
  name: string
  ext: string
  type: string
  size: string
  date: string
  content: string
}

const trashItems = ref<TrashItem[]>([
  {
    id: 'alexandre',
    name: 'alexandre.ia.md',
    ext: '.md',
    type: 'Documento Markdown',
    size: '2.4 KB',
    date: '10 de out. de 2026',
    content: `# alexandre.ia

Um projeto para gerenciar sua biblioteca de livros.`
  }
])

const selectedItemId = ref<string | null>(null)
const isPreviewOpen = ref(false)
const showEmptyToast = ref(false)
const viewMode = ref<'grid' | 'list'>('grid')
const searchQuery = ref('')

const selectedItem = computed(() => {
  return trashItems.value.find(item => item.id === selectedItemId.value) || null
})

const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) return trashItems.value
  const q = searchQuery.value.toLowerCase().trim()
  return trashItems.value.filter(item =>
    item.name.toLowerCase().includes(q) ||
    item.type.toLowerCase().includes(q)
  )
})

const triggerEmptyTrash = () => {
  showEmptyToast.value = true
  setTimeout(() => {
    showEmptyToast.value = false
  }, 3200)
}
</script>

<template>
  <div
    class="w-full h-full flex flex-col font-sans select-none overflow-hidden transition-colors duration-300 relative"
    :class="store.theme === 'light' ? 'bg-white text-zinc-800' : 'bg-[#1e1e24] text-zinc-200'"
    @click="selectedItemId = null"
  >
    <!-- macOS Finder Unified Top Toolbar -->
    <div
      class="h-12 border-b flex items-center justify-between px-3 sm:px-4 shrink-0 gap-2 transition-colors duration-300 z-10"
      :class="store.theme === 'light'
        ? 'bg-[#f5f5f7] border-black/10 text-zinc-800'
        : 'bg-[#25252d] border-white/10 text-zinc-200'"
      @click.stop
    >
      <!-- Navigation Group (Pill) -->
      <div class="flex items-center gap-2.5">
        <div
          class="flex items-center rounded-lg border overflow-hidden shadow-2xs"
          :class="store.theme === 'light' ? 'bg-white border-black/10' : 'bg-[#2d2d38] border-white/10'"
        >
          <button
            class="p-1.5 opacity-30 cursor-default"
            title="Voltar"
          >
            <ChevronLeft class="w-3.5 h-3.5" />
          </button>
          <div class="w-[1px] h-3.5" :class="store.theme === 'light' ? 'bg-black/10' : 'bg-white/10'"></div>
          <button
            class="p-1.5 opacity-30 cursor-default"
            title="Avançar"
          >
            <ChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Folder Title with Trash Icon -->
        <div class="flex items-center gap-2">
          <Trash2 class="w-4 h-4 text-zinc-500" />
          <span class="text-xs font-semibold tracking-tight">Lixeira</span>
        </div>
      </div>

      <!-- Center: View Mode Segmented Control -->
      <div
        class="hidden sm:flex items-center rounded-lg border p-0.5 shadow-2xs"
        :class="store.theme === 'light' ? 'bg-[#e5e5ea] border-black/10' : 'bg-[#181820] border-white/10'"
      >
        <button
          @click="viewMode = 'grid'"
          class="px-2.5 py-1 rounded-md text-xs transition cursor-pointer flex items-center gap-1.5"
          :class="viewMode === 'grid'
            ? (store.theme === 'light' ? 'bg-white text-zinc-900 shadow-xs font-medium' : 'bg-[#31313e] text-white shadow-xs font-medium')
            : 'text-zinc-500 hover:text-zinc-700'"
          title="Visualização em Ícones"
        >
          <Grid class="w-3.5 h-3.5" />
          <span class="text-[11px]">Ícones</span>
        </button>
        <button
          @click="viewMode = 'list'"
          class="px-2.5 py-1 rounded-md text-xs transition cursor-pointer flex items-center gap-1.5"
          :class="viewMode === 'list'
            ? (store.theme === 'light' ? 'bg-white text-zinc-900 shadow-xs font-medium' : 'bg-[#31313e] text-white shadow-xs font-medium')
            : 'text-zinc-500 hover:text-zinc-700'"
          title="Visualização em Lista"
        >
          <ListIcon class="w-3.5 h-3.5" />
          <span class="text-[11px]">Lista</span>
        </button>
      </div>

      <!-- Right: Search Bar & Empty Trash Action -->
      <div class="flex items-center gap-2.5">
        <div
          class="relative flex items-center rounded-lg border px-2.5 py-1 transition-all"
          :class="store.theme === 'light'
            ? 'bg-white border-black/15 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500/20'
            : 'bg-[#1a1a22] border-white/10 focus-within:border-sky-400 focus-within:ring-1 focus-within:ring-sky-400/20'"
        >
          <Search class="w-3 h-3 text-zinc-400 mr-1.5 shrink-0" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar na Lixeira"
            class="bg-transparent text-xs outline-none w-24 sm:w-32 placeholder:text-zinc-400"
            :class="store.theme === 'light' ? 'text-zinc-900' : 'text-zinc-100'"
          />
        </div>

        <!-- macOS Style Empty Trash Button (Protects alexandre.ia note) -->
        <button
          @click="triggerEmptyTrash"
          class="px-3 py-1 rounded-lg border text-xs font-medium transition cursor-pointer shadow-2xs flex items-center gap-1.5"
          :class="store.theme === 'light'
            ? 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
            : 'bg-white/5 hover:bg-white/10 text-zinc-200 border-white/15'"
          title="Esvaziar Lixeira"
        >
          <Trash2 class="w-3.5 h-3.5 text-zinc-400" />
          <span>Esvaziar Lixeira</span>
        </button>
      </div>
    </div>

    <!-- macOS Action Banner (Information header bar) -->
    <div
      class="h-8 px-4 flex items-center justify-between text-[11px] border-b shrink-0 transition-colors"
      :class="store.theme === 'light'
        ? 'bg-[#fbfbfd] border-black/5 text-zinc-500'
        : 'bg-[#18181f] border-white/5 text-zinc-400'"
    >
      <div class="flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
        <span>Os itens na Lixeira permanecem aqui até você esvaziá-la.</span>
      </div>

      <div v-if="selectedItem" class="flex items-center gap-2">
        <button
          @click.stop="isPreviewOpen = true"
          class="text-sky-500 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Eye class="w-3 h-3" />
          <span>Abrir Nota</span>
        </button>
      </div>
    </div>

    <!-- Notification Toast when trying to empty (Preserves alexandre.ia note) -->
    <Transition name="slide-down">
      <div
        v-if="showEmptyToast"
        class="bg-amber-500/10 border-b border-amber-500/25 px-4 py-2 flex items-center gap-2 text-xs font-medium shrink-0 z-20"
        :class="store.theme === 'light' ? 'text-amber-800 bg-amber-50' : 'text-amber-300 bg-amber-500/10'"
      >
        <Info class="w-4 h-4 text-amber-500 shrink-0" />
        <span>Este protótipo está arquivado com carinho e não será excluído! ☕</span>
      </div>
    </Transition>

    <!-- macOS Finder Body (Sidebar + Content Pane) -->
    <div class="flex-grow flex min-h-0 min-w-0">
      
      <!-- macOS Finder Sidebar (Desktop) -->
      <div
        class="hidden md:flex w-44 shrink-0 border-r p-3 flex-col gap-4 text-xs select-none transition-colors"
        :class="store.theme === 'light'
          ? 'bg-[#f6f6f8]/70 border-black/10 text-zinc-700'
          : 'bg-[#17171d]/70 border-white/10 text-zinc-300'"
      >
        <!-- Favoritos Section -->
        <div class="flex flex-col gap-1">
          <span class="px-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Favoritos</span>
          
          <button
            @click="store.openWindow('files')"
            class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition cursor-pointer"
            :class="store.theme === 'light' ? 'hover:bg-black/5 text-zinc-700' : 'hover:bg-white/5 text-zinc-300'"
          >
            <Folder class="w-3.5 h-3.5 text-sky-500" />
            <span class="text-xs">Documentos</span>
          </button>

          <button
            @click="store.openPhotosInFinder()"
            class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition cursor-pointer"
            :class="store.theme === 'light' ? 'hover:bg-black/5 text-zinc-700' : 'hover:bg-white/5 text-zinc-300'"
          >
            <FolderHeart class="w-3.5 h-3.5 text-rose-500" />
            <span class="text-xs">Fotos & Eventos</span>
          </button>

          <button
            class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left font-medium transition cursor-pointer"
            :class="store.theme === 'light' ? 'bg-sky-500 text-white shadow-2xs' : 'bg-sky-500 text-white shadow-2xs'"
          >
            <Trash2 class="w-3.5 h-3.5 text-white" />
            <span class="text-xs">Lixeira</span>
          </button>
        </div>

        <!-- Tags Section -->
        <div class="flex flex-col gap-1 mt-1">
          <span class="px-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tags</span>
          <div class="flex items-center gap-2 px-2 py-1 text-xs text-zinc-400">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Ideias Arquivadas</span>
          </div>
        </div>
      </div>

      <!-- Main File Browser Area (or Document Viewer) -->
      <div class="flex-grow flex flex-col min-h-0 min-w-0 overflow-y-auto p-4 sm:p-6">
        
        <!-- Viewer Pane when item is open -->
        <div
          v-if="isPreviewOpen"
          class="h-full flex flex-col border rounded-xl overflow-hidden shadow-lg transition-colors"
          :class="store.theme === 'light'
            ? 'bg-white border-zinc-200'
            : 'bg-[#181922] border-white/10'"
        >
          <!-- Viewer Header -->
          <div
            class="h-10 border-b px-4 flex items-center justify-between select-none shrink-0"
            :class="store.theme === 'light'
              ? 'bg-[#f5f5f7] border-zinc-200 text-zinc-800'
              : 'bg-[#22232c] border-white/10 text-zinc-200'"
          >
            <div class="flex items-center gap-2 text-xs font-mono">
              <button
                @click="isPreviewOpen = false"
                class="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <ArrowLeft class="w-3.5 h-3.5" />
                <span>Voltar</span>
              </button>
              <span class="opacity-40">|</span>
              <span class="font-bold">alexandre.ia.md</span>
            </div>

            <button
              @click="isPreviewOpen = false"
              class="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-600 dark:hover:text-white cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Document Markdown Body (Clean, zero mention of AI) -->
          <div class="flex-grow p-6 sm:p-8 overflow-y-auto font-sans text-xs sm:text-sm leading-relaxed select-text flex flex-col gap-3">
            <h1 class="text-base sm:text-lg font-bold" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-white'">
              # alexandre.ia
            </h1>
            <p class="leading-relaxed" :class="store.theme === 'light' ? 'text-zinc-700' : 'text-zinc-300'">
              Um projeto para gerenciar sua biblioteca de livros.
            </p>
          </div>
        </div>

        <!-- GRID VIEW (Icon View Mode) -->
        <div
          v-else-if="viewMode === 'grid'"
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          <div
            v-for="item in filteredItems"
            :key="item.id"
            @click.stop="selectedItemId = item.id"
            @dblclick="isPreviewOpen = true"
            class="group flex flex-col items-center p-3.5 rounded-xl border transition cursor-pointer text-center relative"
            :class="selectedItemId === item.id
              ? (store.theme === 'light'
                ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-500/20'
                : 'bg-sky-500/15 border-sky-500/40 ring-2 ring-sky-500/30')
              : (store.theme === 'light'
                ? 'bg-white hover:bg-zinc-50/80 border-transparent hover:border-black/5'
                : 'bg-transparent hover:bg-white/[0.04] border-transparent hover:border-white/5')"
          >
            <!-- macOS Document Thumbnail Icon with Folded Corner -->
            <div class="relative w-16 h-20 mb-2 transition-transform duration-150 group-hover:scale-105">
              <div
                class="w-full h-full rounded-lg border flex flex-col justify-between p-2 shadow-sm overflow-hidden"
                :class="store.theme === 'light'
                  ? 'bg-white border-zinc-300 shadow-zinc-200'
                  : 'bg-[#292a36] border-white/15 shadow-black/40'"
              >
                <!-- Top Extension Badge -->
                <div class="flex items-center justify-between w-full">
                  <span class="text-[9px] font-mono font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-sky-500/20 text-sky-500">
                    md
                  </span>
                  <!-- Folded Corner effect -->
                  <div class="w-3 h-3 border-b border-l rounded-bl-sm opacity-40"></div>
                </div>

                <!-- Center Icon -->
                <div class="flex items-center justify-center my-auto">
                  <FileText class="w-7 h-7 text-sky-500" />
                </div>

                <!-- Bottom Document Lines -->
                <div class="w-full flex flex-col gap-0.5 opacity-30">
                  <div class="w-3/4 h-0.5 bg-current rounded-full"></div>
                  <div class="w-1/2 h-0.5 bg-current rounded-full"></div>
                </div>
              </div>
            </div>

            <!-- Filename & Details -->
            <span
              class="text-xs font-medium tracking-tight truncate max-w-full px-1"
              :class="selectedItemId === item.id
                ? (store.theme === 'light' ? 'text-sky-900 font-semibold' : 'text-sky-200 font-semibold')
                : (store.theme === 'light' ? 'text-zinc-900' : 'text-zinc-100')"
              :title="item.name"
            >
              {{ item.name }}
            </span>
            <span class="text-[10px] text-zinc-400 font-mono mt-0.5">
              {{ item.size }}
            </span>
          </div>
        </div>

        <!-- LIST VIEW (Table View Mode) -->
        <div
          v-else-if="viewMode === 'list'"
          class="rounded-xl border overflow-hidden shadow-2xs transition-colors"
          :class="store.theme === 'light'
            ? 'bg-white border-black/10 divide-y divide-black/5'
            : 'bg-[#22232c] border-white/10 divide-y divide-white/5'"
        >
          <!-- Table Header -->
          <div
            class="grid grid-cols-12 px-4 py-2 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase select-none"
            :class="store.theme === 'light' ? 'bg-zinc-50' : 'bg-white/[0.02]'"
          >
            <div class="col-span-6 sm:col-span-5">Nome</div>
            <div class="col-span-3 sm:col-span-3">Data de Modificação</div>
            <div class="col-span-3 sm:col-span-2 text-right">Tamanho</div>
            <div class="hidden sm:block sm:col-span-2 text-right">Tipo</div>
          </div>

          <!-- Table Rows -->
          <div
            v-for="item in filteredItems"
            :key="item.id"
            @click.stop="selectedItemId = item.id"
            @dblclick="isPreviewOpen = true"
            class="grid grid-cols-12 px-4 py-2.5 text-xs items-center cursor-pointer transition-colors"
            :class="selectedItemId === item.id
              ? (store.theme === 'light' ? 'bg-sky-50 text-sky-900' : 'bg-sky-500/20 text-white')
              : (store.theme === 'light' ? 'hover:bg-zinc-50' : 'hover:bg-white/[0.03]')"
          >
            <div class="col-span-6 sm:col-span-5 flex items-center gap-2.5 min-w-0 pr-2">
              <FileText class="w-4 h-4 text-sky-500 shrink-0" />
              <span class="truncate font-medium">{{ item.name }}</span>
            </div>
            <div class="col-span-3 sm:col-span-3 text-[11px] text-zinc-400 flex items-center gap-1">
              <Clock class="w-3 h-3 text-zinc-400 shrink-0" />
              <span class="truncate">{{ item.date }}</span>
            </div>
            <div class="col-span-3 sm:col-span-2 text-right font-mono text-[11px] text-zinc-400">
              {{ item.size }}
            </div>
            <div class="hidden sm:block sm:col-span-2 text-right text-[11px] text-zinc-400 truncate">
              {{ item.type }}
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- macOS Bottom Finder Status Bar -->
    <div
      class="h-7 border-t px-3.5 flex items-center justify-between text-[10px] select-none shrink-0 transition-colors"
      :class="store.theme === 'light'
        ? 'bg-[#f5f5f7] border-black/10 text-zinc-500'
        : 'bg-[#18181f] border-white/10 text-zinc-400'"
    >
      <div class="flex items-center gap-1.5 font-mono">
        <span>Macintosh HD</span>
        <span>›</span>
        <span>bernardo</span>
        <span>›</span>
        <span class="font-semibold text-zinc-700 dark:text-zinc-200">.Trash</span>
      </div>

      <div class="font-medium">
        1 item, 2.4 KB disponíveis
      </div>
    </div>

  </div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
