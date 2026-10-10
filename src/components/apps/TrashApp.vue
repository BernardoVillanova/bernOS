<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWindowStore } from '../../stores/windowStore'
import {
  Trash2,
  FileText,
  FileCode,
  Image,
  ChevronLeft,
  ChevronRight,
  Search,
  Grid,
  List as ListIcon,
  X,
  Eye,
  RotateCcw,
  AlertCircle,
  Folder,
  FolderHeart,
  Clock,
  Sparkles
} from 'lucide-vue-next'

const store = useWindowStore()

interface TrashItem {
  id: string
  name: string
  ext: string
  type: string
  size: string
  date: string
  iconType: 'md' | 'sh' | 'img'
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
    iconType: 'md',
    content: `# alexandre.ia (Protótipo Arquivado)

Uma ideia inicial de agente inteligente para gerenciar biblioteca pessoal de livros, estatísticas de leitura e integração com Skoob.

## Motivo do Descarte:
- Priorização total na construção e sustentação do bernOS e das automações de infraestrutura corporativa na Casa do Construtor.
- Pode ser revivido futuramente como um microsserviço conteinerizado.`
  },
  {
    id: 'deploy-sh',
    name: 'antigo-deploy.sh',
    ext: '.sh',
    type: 'Script Shell Unix',
    size: '1.2 KB',
    date: '08 de out. de 2026',
    iconType: 'sh',
    content: `#!/usr/bin/env bash
# [DEPRECATED] Script legado de deploy manual via SSH
# Substituído com sucesso pelo workflow automatizado do GitHub Actions com Docker e Amazon ECR!

set -e
echo "Aviso: Este script manual não deve mais ser executado."
echo "Use sempre: git push origin main"`
  },
  {
    id: 'draft-neon',
    name: 'rascunho-logo-neon.svg',
    ext: '.svg',
    type: 'Imagem Vetorial SVG',
    size: '4.8 KB',
    date: '02 de out. de 2026',
    iconType: 'img',
    content: `<!-- [DESCARTADO] Rascunho inicial de logo com excesso de brilho neon artificial.
     Substituído pelos ícones vetoriais limpos e elegantes no padrão nativo Apple macOS Sequoia. -->
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="45" fill="none" stroke="#ff007f" stroke-width="4"/>
  <text x="50" y="55" fill="#00f3ff" font-size="14" text-anchor="middle">NEON_DEPRECATED</text>
</svg>`
  }
])

const isEmptied = ref(false)
const selectedItemId = ref<string | null>(null)
const previewItem = ref<TrashItem | null>(null)
const showEmptyDialog = ref(false)
const showNotification = ref<string | null>(null)
const viewMode = ref<'grid' | 'list'>('grid')
const searchQuery = ref('')

const selectedItem = computed(() => {
  return trashItems.value.find(item => item.id === selectedItemId.value) || null
})

const filteredItems = computed(() => {
  if (isEmptied.value) return []
  if (!searchQuery.value.trim()) return trashItems.value
  const q = searchQuery.value.toLowerCase().trim()
  return trashItems.value.filter(item =>
    item.name.toLowerCase().includes(q) ||
    item.type.toLowerCase().includes(q)
  )
})

const totalSize = computed(() => {
  if (isEmptied.value) return '0 KB'
  return '8.4 KB'
})

const selectItem = (id: string) => {
  selectedItemId.value = id
}

const openPreview = (item: TrashItem) => {
  previewItem.value = item
}

const closePreview = () => {
  previewItem.value = null
}

const restoreItem = (item: TrashItem) => {
  trashItems.value = trashItems.value.filter(i => i.id !== item.id)
  if (selectedItemId.value === item.id) selectedItemId.value = null
  if (previewItem.value?.id === item.id) previewItem.value = null
  
  showNotification.value = `"${item.name}" foi restaurado com sucesso para a pasta de origem!`
  setTimeout(() => {
    showNotification.value = null
  }, 3000)
}

const restoreAll = () => {
  isEmptied.value = false
  if (trashItems.value.length === 0) {
    trashItems.value = [
      {
        id: 'alexandre',
        name: 'alexandre.ia.md',
        ext: '.md',
        type: 'Documento Markdown',
        size: '2.4 KB',
        date: '10 de out. de 2026',
        iconType: 'md',
        content: `# alexandre.ia (Protótipo Arquivado)\n\nUma ideia inicial de agente inteligente para gerenciar biblioteca pessoal de livros.`
      }
    ]
  }
  showNotification.value = 'Itens da Lixeira restaurados!'
  setTimeout(() => {
    showNotification.value = null
  }, 2500)
}

const confirmEmptyTrash = () => {
  showEmptyDialog.value = false
  isEmptied.value = true
  selectedItemId.value = null
  previewItem.value = null
  showNotification.value = 'Lixeira esvaziada! Todos os itens foram permanentemente apagados.'
  setTimeout(() => {
    showNotification.value = null
  }, 3500)
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

        <!-- macOS Style Empty Trash Button -->
        <button
          v-if="!isEmptied && trashItems.length > 0"
          @click="showEmptyDialog = true"
          class="px-3 py-1 rounded-lg border text-xs font-medium transition cursor-pointer shadow-2xs flex items-center gap-1.5"
          :class="store.theme === 'light'
            ? 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
            : 'bg-white/5 hover:bg-white/10 text-zinc-200 border-white/15'"
          title="Esvaziar todos os itens da Lixeira"
        >
          <Trash2 class="w-3.5 h-3.5 text-zinc-400" />
          <span>Esvaziar...</span>
        </button>

        <button
          v-else
          @click="restoreAll"
          class="px-3 py-1 rounded-lg border text-xs font-medium transition cursor-pointer shadow-2xs flex items-center gap-1.5"
          :class="store.theme === 'light'
            ? 'bg-sky-50 text-sky-700 border-sky-300 hover:bg-sky-100'
            : 'bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/20'"
          title="Restaurar itens da Lixeira"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Restaurar Itens</span>
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
          @click.stop="openPreview(selectedItem)"
          class="text-sky-500 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Eye class="w-3 h-3" />
          <span>Visualizar</span>
        </button>
        <span>·</span>
        <button
          @click.stop="restoreItem(selectedItem)"
          class="text-sky-500 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw class="w-3 h-3" />
          <span>Colocar de Volta</span>
        </button>
      </div>
    </div>

    <!-- Toast Notification Banner -->
    <Transition name="fade">
      <div
        v-if="showNotification"
        class="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl border shadow-xl text-xs font-medium backdrop-blur-xl flex items-center gap-2"
        :class="store.theme === 'light'
          ? 'bg-white/95 border-black/10 text-zinc-800 shadow-black/10'
          : 'bg-[#22222b]/95 border-white/10 text-zinc-100 shadow-black/50'"
      >
        <Sparkles class="w-4 h-4 text-amber-500 shrink-0" />
        <span>{{ showNotification }}</span>
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
            <span class="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Rascunhos</span>
          </div>
          <div class="flex items-center gap-2 px-2 py-1 text-xs text-zinc-400">
            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>DevOps Legado</span>
          </div>
          <div class="flex items-center gap-2 px-2 py-1 text-xs text-zinc-400">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Ideias Arquivadas</span>
          </div>
        </div>
      </div>

      <!-- Main File Browser Area -->
      <div class="flex-grow flex flex-col min-h-0 min-w-0 overflow-y-auto p-4 sm:p-6">
        
        <!-- Empty State -->
        <div
          v-if="filteredItems.length === 0"
          class="h-full flex flex-col items-center justify-center text-center gap-3 p-6 select-none my-auto"
        >
          <div
            class="w-20 h-20 rounded-2xl flex items-center justify-center border shadow-xs"
            :class="store.theme === 'light'
              ? 'bg-zinc-50 border-black/10 text-zinc-400'
              : 'bg-white/5 border-white/10 text-zinc-500'"
          >
            <Trash2 class="w-10 h-10 stroke-[1.5]" />
          </div>
          <div class="flex flex-col gap-1 max-w-sm">
            <h3 class="text-sm font-bold" :class="store.theme === 'light' ? 'text-zinc-900' : 'text-white'">
              A Lixeira está vazia
            </h3>
            <p class="text-xs text-zinc-400 leading-relaxed">
              {{ isEmptied ? 'Todos os arquivos foram limpos com sucesso.' : 'Nenhum item encontrado nesta busca.' }}
            </p>
          </div>
          <button
            v-if="isEmptied"
            @click="restoreAll"
            class="mt-2 px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-2"
            :class="store.theme === 'light'
              ? 'bg-white hover:bg-zinc-50 text-sky-600 border-zinc-200 shadow-2xs'
              : 'bg-white/5 hover:bg-white/10 text-sky-400 border-white/10'"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            <span>Restaurar Arquivos de Exemplo</span>
          </button>
        </div>

        <!-- GRID VIEW (Icon View Mode) -->
        <div
          v-else-if="viewMode === 'grid'"
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          <div
            v-for="item in filteredItems"
            :key="item.id"
            @click.stop="selectItem(item.id)"
            @dblclick="openPreview(item)"
            class="group flex flex-col items-center p-3 rounded-xl border transition cursor-pointer text-center relative"
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
                  <span
                    class="text-[9px] font-mono font-bold uppercase tracking-wider px-1 py-0.5 rounded"
                    :class="item.iconType === 'md'
                      ? 'bg-sky-500/20 text-sky-500'
                      : (item.iconType === 'sh' ? 'bg-amber-500/20 text-amber-500' : 'bg-purple-500/20 text-purple-500')"
                  >
                    {{ item.ext.replace('.', '') }}
                  </span>
                  <!-- Folded Corner effect -->
                  <div class="w-3 h-3 border-b border-l rounded-bl-sm opacity-40"></div>
                </div>

                <!-- Center Icon -->
                <div class="flex items-center justify-center my-auto">
                  <FileText v-if="item.iconType === 'md'" class="w-6 h-6 text-sky-500" />
                  <FileCode v-else-if="item.iconType === 'sh'" class="w-6 h-6 text-amber-500" />
                  <Image v-else class="w-6 h-6 text-purple-500" />
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
            @click.stop="selectItem(item.id)"
            @dblclick="openPreview(item)"
            class="grid grid-cols-12 px-4 py-2.5 text-xs items-center cursor-pointer transition-colors"
            :class="selectedItemId === item.id
              ? (store.theme === 'light' ? 'bg-sky-50 text-sky-900' : 'bg-sky-500/20 text-white')
              : (store.theme === 'light' ? 'hover:bg-zinc-50' : 'hover:bg-white/[0.03]')"
          >
            <div class="col-span-6 sm:col-span-5 flex items-center gap-2.5 min-w-0 pr-2">
              <FileText v-if="item.iconType === 'md'" class="w-4 h-4 text-sky-500 shrink-0" />
              <FileCode v-else-if="item.iconType === 'sh'" class="w-4 h-4 text-amber-500 shrink-0" />
              <Image v-else class="w-4 h-4 text-purple-500 shrink-0" />
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
        {{ filteredItems.length }} {{ filteredItems.length === 1 ? 'item' : 'itens' }}, {{ totalSize }} disponíveis
      </div>
    </div>

    <!-- macOS QUICK LOOK MODAL (Visualização Rápida) -->
    <Transition name="fade">
      <div
        v-if="previewItem"
        class="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
        @click.self="closePreview"
      >
        <div
          class="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all"
          :class="store.theme === 'light'
            ? 'bg-white border-black/15 text-zinc-900'
            : 'bg-[#1c1d25] border-white/15 text-zinc-100'"
        >
          <!-- Quick Look Header -->
          <div
            class="h-10 px-4 border-b flex items-center justify-between select-none shrink-0"
            :class="store.theme === 'light' ? 'bg-[#f5f5f7] border-black/10' : 'bg-[#252530] border-white/10'"
          >
            <div class="flex items-center gap-2 text-xs font-semibold truncate">
              <Eye class="w-3.5 h-3.5 text-sky-500" />
              <span class="truncate">{{ previewItem.name }}</span>
            </div>
            
            <div class="flex items-center gap-1.5">
              <button
                @click="restoreItem(previewItem)"
                class="px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer border flex items-center gap-1"
                :class="store.theme === 'light'
                  ? 'bg-white hover:bg-zinc-100 border-zinc-300 text-zinc-700'
                  : 'bg-white/5 hover:bg-white/10 border-white/15 text-zinc-200'"
                title="Restaurar este arquivo para sua pasta original"
              >
                <RotateCcw class="w-3 h-3" />
                <span>Colocar de Volta</span>
              </button>
              <button
                @click="closePreview"
                class="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition cursor-pointer"
                title="Fechar"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Quick Look Content Preview -->
          <div class="flex-grow p-5 overflow-y-auto font-mono text-xs leading-relaxed select-text flex flex-col gap-3">
            <div class="flex items-center justify-between text-[11px] text-zinc-400 pb-2 border-b border-black/5 dark:border-white/5">
              <span>{{ previewItem.type }}</span>
              <span>{{ previewItem.size }} · {{ previewItem.date }}</span>
            </div>
            <pre class="whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed p-3 rounded-xl border bg-black/[0.02] dark:bg-white/[0.02] border-black/5 dark:border-white/5">{{ previewItem.content }}</pre>
          </div>
        </div>
      </div>
    </Transition>

    <!-- macOS NATIVE EMPTY TRASH CONFIRMATION SHEET -->
    <Transition name="sheet">
      <div
        v-if="showEmptyDialog"
        class="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-8 px-4"
        @click.self="showEmptyDialog = false"
      >
        <div
          class="w-full max-w-sm rounded-2xl border p-5 shadow-2xl flex flex-col items-center text-center gap-3.5 backdrop-blur-2xl transition-all"
          :class="store.theme === 'light'
            ? 'bg-white/95 border-black/15 text-zinc-900 shadow-black/20'
            : 'bg-[#1e1e26]/95 border-white/15 text-white shadow-black/60'"
        >
          <!-- Trash Alert Icon -->
          <div class="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
            <AlertCircle class="w-6 h-6" />
          </div>

          <div class="flex flex-col gap-1">
            <h3 class="text-sm font-bold tracking-tight">
              Tem certeza de que deseja esvaziar a Lixeira?
            </h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Os itens contidos na Lixeira serão excluídos permanentemente do bernOS. Esta operação não pode ser desfeita.
            </p>
          </div>

          <!-- Buttons: Cancelar & Esvaziar -->
          <div class="flex items-center gap-2.5 w-full pt-1">
            <button
              @click="showEmptyDialog = false"
              class="flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer"
              :class="store.theme === 'light'
                ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700'
                : 'bg-white/5 hover:bg-white/10 border-white/15 text-zinc-300'"
            >
              Cancelar
            </button>
            <button
              @click="confirmEmptyTrash"
              class="flex-1 py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              Esvaziar Lixeira
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.96);
}
</style>
