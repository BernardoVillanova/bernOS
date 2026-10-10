<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useWindowStore } from '../../stores/windowStore'
import {
  Search,
  Grid,
  List as ListIcon,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Star,
  HardDrive,
  Folder as FolderIcon,
  Image as ImageIcon,
  X
} from 'lucide-vue-next'

const store = useWindowStore()

export interface MediaFile {
  id: string
  name: string
  description: string
  location: string
  date: string
  src: string
  size: string
  resolution: string
}

const mediaFiles: MediaFile[] = [
  {
    id: 'photo-google',
    name: 'Google Campus SP.png',
    description: 'Visita ao campus do Google em São Paulo em eventos da comunidade de tecnologia e desenvolvedores.',
    location: 'São Paulo, SP · Brasil',
    date: '2024',
    src: '/images/bern-google.png',
    size: '1.4 MB',
    resolution: '1201 × 1600'
  },
  {
    id: 'photo-linuxtips',
    name: 'LINUXtips Local Brasil.png',
    description: 'Encontro presencial da comunidade LINUXtips Local Brasil com Jeferson Fernando (Fundador do LINUXtips).',
    location: 'São Paulo, SP · Brasil',
    date: '2023',
    src: '/images/bern-linuxtips.png',
    size: '3.1 MB',
    resolution: '1200 × 1600'
  },
  {
    id: 'photo-laptop',
    name: 'Workstation & Dev.png',
    description: 'Estação de trabalho e ambiente de desenvolvimento diário com Linux e terminal.',
    location: 'Rio Claro, SP · Brasil',
    date: '2025',
    src: '/images/bern-laptop.png',
    size: '167 KB',
    resolution: '800 × 800'
  }
]

interface Repository {
  id: number
  name: string
  description: string
  language: string
  stars: number
  forks: number
  url: string
  homepage: string
  topics: string[]
  updated_at: string
  created_at: string
  is_favorite: boolean
  folder: 'Trabalho' | 'Estudos' | null
}

const repos = ref<Repository[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const searchQuery = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const selectedRepo = ref<Repository | null>(null)
const selectedMedia = ref<MediaFile | null>(null)
const currentPath = ref<string[]>(['bernardo', 'Repositories'])

const closeInspector = () => {
  selectedRepo.value = null
  selectedMedia.value = null
}

// Active sidebar item: 'all' | 'favorites' | 'work' | 'studies' | 'tag-{color}'
const activeSidebarItem = ref<string>('all')

const fetchRepos = async (force = false) => {
  loading.value = true
  error.value = null
  try {
    const endpoint = force ? '/api/github/refresh' : '/api/github/repos'
    const res = await fetch(endpoint, {
      method: force ? 'POST' : 'GET'
    })
    if (!res.ok) throw new Error('Falha ao obter os repositórios do GitHub.')
    const data = await res.json()
    repos.value = data
  } catch (err: any) {
    error.value = err.message || 'Erro ao carregar repositórios.'
  } finally {
    loading.value = false
  }
}

const toggleFavorite = async (repo: Repository, favoriteState?: boolean) => {
  const newState = favoriteState !== undefined ? favoriteState : !repo.is_favorite
  try {
    const res = await fetch(`/api/github/repos/${repo.id}/favorite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorite: newState })
    })
    if (res.ok) {
      repo.is_favorite = newState
      if (selectedRepo.value && selectedRepo.value.id === repo.id) {
        selectedRepo.value.is_favorite = newState
      }
    }
  } catch (err) {
    console.error('Error toggling favorite:', err)
  }
}

const moveRepoToFolder = async (repo: Repository, folder: 'Trabalho' | 'Estudos' | null) => {
  try {
    const res = await fetch(`/api/github/repos/${repo.id}/folder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder })
    })
    if (res.ok) {
      repo.folder = folder
      if (selectedRepo.value && selectedRepo.value.id === repo.id) {
        selectedRepo.value.folder = folder
      }
    }
  } catch (err) {
    console.error('Error moving repo to folder:', err)
  }
}

const selectSidebar = (item: string) => {
  activeSidebarItem.value = item
  store.filesActiveCategory = item
  selectedRepo.value = null
  selectedMedia.value = null
  if (item === 'all') {
    currentPath.value = ['bernardo', 'Repositories']
  } else if (item === 'favorites') {
    currentPath.value = ['bernardo', 'Repositories', 'Destaques']
  } else if (item === 'work') {
    currentPath.value = ['bernardo', 'Repositories', 'Trabalho']
  } else if (item === 'studies') {
    currentPath.value = ['bernardo', 'Repositories', 'Estudos']
  } else if (item === 'media') {
    currentPath.value = ['bernardo', 'Fotos & Eventos']
  } else if (item.startsWith('tag-')) {
    currentPath.value = ['Tags', item.replace('tag-', '')]
  }
}

const openFolder = (folderName: string) => {
  if (folderName === 'Trabalho') selectSidebar('work')
  else if (folderName === 'Estudos') selectSidebar('studies')
  else if (folderName === 'Destaques') selectSidebar('favorites')
  else if (folderName === 'Fotos') selectSidebar('media')
}

const navigateUp = () => {
  if (currentPath.value.length > 2) {
    selectSidebar('all')
  }
}

const filteredRepos = computed(() => {
  let list = [...repos.value]

  if (activeSidebarItem.value === 'favorites') {
    list = list.filter(r => r.is_favorite)
  } else if (activeSidebarItem.value === 'work') {
    list = list.filter(r => r.folder === 'Trabalho')
  } else if (activeSidebarItem.value === 'studies') {
    list = list.filter(r => r.folder === 'Estudos')
  } else if (activeSidebarItem.value === 'tag-blue') {
    list = list.filter(r => r.language?.toLowerCase() === 'typescript' || r.language?.toLowerCase() === 'go')
  } else if (activeSidebarItem.value === 'tag-green') {
    list = list.filter(r => r.language?.toLowerCase() === 'vue' || r.language?.toLowerCase() === 'shell')
  } else if (activeSidebarItem.value === 'tag-orange') {
    list = list.filter(r => r.language?.toLowerCase() === 'html' || r.name.toLowerCase().includes('terraform'))
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(
      r =>
        r.name.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.language && r.language.toLowerCase().includes(q))
    )
  }

  return list
})

const timeAgo = (dateStr: string) => {
  if (!dateStr) return ''
  const now = new Date()
  const updated = new Date(dateStr)
  const diffDays = Math.floor(Math.abs(now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 30) return `Há ${diffDays} dias`
  if (diffDays < 365) return `Há ${Math.floor(diffDays / 30)} meses`
  return `Há ${Math.floor(diffDays / 365)} anos`
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric' })
}

const getLanguageDotColor = (lang: string) => {
  const l = (lang || '').toLowerCase()
  if (l === 'typescript') return 'bg-[#3178c6]'
  if (l === 'javascript') return 'bg-[#f1e05a]'
  if (l === 'python') return 'bg-[#3572A5]'
  if (l === 'go') return 'bg-[#00ADD8]'
  if (l === 'shell' || l === 'bash') return 'bg-[#89e051]'
  if (l === 'vue') return 'bg-[#41b883]'
  if (l === 'html') return 'bg-[#e34c26]'
  return 'bg-zinc-400'
}

watch(
  [() => store.filesActiveCategory, () => store.photosOpenTrigger],
  ([newCat]) => {
    if (newCat) {
      selectSidebar(newCat)
    }
  },
  { immediate: true }
)

onMounted(() => {
  fetchRepos()
})
</script>

<template>
  <div
    class="flex-grow flex flex-col h-full font-sans select-none overflow-hidden transition-colors duration-300"
    :class="store.theme === 'light' ? 'bg-white text-zinc-800' : 'bg-[#1e1e24] text-zinc-200'"
  >
    <!-- macOS Finder Unified Top Toolbar -->
    <div
      class="h-12 border-b flex items-center justify-between px-3 sm:px-4 shrink-0 gap-2 transition-colors duration-300"
      :class="store.theme === 'light'
        ? 'bg-[#f5f5f7] border-black/10'
        : 'bg-[#25252d] border-white/10'"
    >
      <!-- Navigation Buttons (Pill) -->
      <div class="flex items-center gap-2">
        <div
          class="flex items-center rounded-lg border overflow-hidden shadow-2xs"
          :class="store.theme === 'light' ? 'bg-white border-black/10' : 'bg-[#2d2d38] border-white/10'"
        >
          <button
            @click="navigateUp"
            :disabled="currentPath.length <= 2"
            class="p-1.5 hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
            title="Voltar"
          >
            <ChevronLeft class="w-3.5 h-3.5" />
          </button>
          <div class="w-[1px] h-3.5" :class="store.theme === 'light' ? 'bg-black/10' : 'bg-white/10'"></div>
          <button
            disabled
            class="p-1.5 opacity-30 cursor-default"
          >
            <ChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Current Folder Title -->
        <span class="text-xs font-semibold tracking-tight truncate max-w-[140px] sm:max-w-none">
          {{ currentPath[currentPath.length - 1] }}
        </span>
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

      <!-- Right: Search Bar & Refresh -->
      <div class="flex items-center gap-2">
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
            placeholder="Buscar"
            class="bg-transparent text-xs outline-none w-24 sm:w-36 select-text"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="text-zinc-400 hover:text-zinc-600 ml-1 cursor-pointer"
          >
            <X class="w-3 h-3" />
          </button>
        </div>

        <button
          @click="fetchRepos(true)"
          :disabled="loading"
          class="p-1.5 rounded-lg border transition cursor-pointer"
          :class="store.theme === 'light' ? 'bg-white hover:bg-zinc-100 border-black/10' : 'bg-[#2d2d38] hover:bg-[#383846] border-white/10'"
          title="Recarregar repositórios do GitHub"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="loading ? 'animate-spin text-sky-500' : 'text-zinc-400'" />
        </button>
      </div>
    </div>

    <!-- Finder Body (Sidebar + Content + Quick Look Inspector) -->
    <div class="flex-grow flex overflow-hidden relative">
      <!-- Authentic macOS Sidebar -->
      <div
        class="hidden md:flex w-52 shrink-0 border-r flex-col p-3 gap-4 overflow-y-auto select-none transition-colors duration-300"
        :class="store.theme === 'light'
          ? 'bg-[#f6f6f8]/90 border-black/10 text-zinc-700'
          : 'bg-[#23232c]/90 border-white/10 text-zinc-300'"
      >
        <!-- Favoritos Section -->
        <div class="flex flex-col gap-1">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-2 mb-0.5">Favoritos</span>
          <button
            @click="selectSidebar('all')"
            class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition cursor-pointer font-medium"
            :class="activeSidebarItem === 'all'
              ? (store.theme === 'light' ? 'bg-black/10 text-zinc-950 font-semibold' : 'bg-white/15 text-white font-semibold')
              : 'hover:bg-black/5 hover:text-zinc-900'"
          >
            <HardDrive class="w-3.5 h-3.5 text-sky-500" />
            <span>Todos os Repos</span>
            <span class="ml-auto text-[10px] opacity-60 font-mono">{{ repos.length }}</span>
          </button>

          <button
            @click="selectSidebar('favorites')"
            class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition cursor-pointer font-medium"
            :class="activeSidebarItem === 'favorites'
              ? (store.theme === 'light' ? 'bg-black/10 text-zinc-950 font-semibold' : 'bg-white/15 text-white font-semibold')
              : 'hover:bg-black/5 hover:text-zinc-900'"
          >
            <Star class="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
            <span>Destaques</span>
            <span class="ml-auto text-[10px] opacity-60 font-mono">{{ repos.filter(r => r.is_favorite).length }}</span>
          </button>
        </div>

        <!-- Locais / Pastas Section -->
        <div class="flex flex-col gap-1">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-2 mb-0.5">Categorias</span>
          <button
            @click="selectSidebar('work')"
            class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition cursor-pointer font-medium"
            :class="activeSidebarItem === 'work'
              ? (store.theme === 'light' ? 'bg-black/10 text-zinc-950 font-semibold' : 'bg-white/15 text-white font-semibold')
              : 'hover:bg-black/5 hover:text-zinc-900'"
          >
            <FolderIcon class="w-3.5 h-3.5 text-blue-500" />
            <span>Trabalho</span>
            <span class="ml-auto text-[10px] opacity-60 font-mono">{{ repos.filter(r => r.folder === 'Trabalho').length }}</span>
          </button>

          <button
            @click="selectSidebar('studies')"
            class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition cursor-pointer font-medium"
            :class="activeSidebarItem === 'studies'
              ? (store.theme === 'light' ? 'bg-black/10 text-zinc-950 font-semibold' : 'bg-white/15 text-white font-semibold')
              : 'hover:bg-black/5 hover:text-zinc-900'"
          >
            <FolderIcon class="w-3.5 h-3.5 text-emerald-500" />
            <span>Estudos & TCC</span>
            <span class="ml-auto text-[10px] opacity-60 font-mono">{{ repos.filter(r => r.folder === 'Estudos').length }}</span>
          </button>

          <button
            @click="selectSidebar('media')"
            class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition cursor-pointer font-medium"
            :class="activeSidebarItem === 'media'
              ? (store.theme === 'light' ? 'bg-black/10 text-zinc-950 font-semibold' : 'bg-white/15 text-white font-semibold')
              : 'hover:bg-black/5 hover:text-zinc-900'"
          >
            <ImageIcon class="w-3.5 h-3.5 text-purple-500" />
            <span>Fotos & Eventos</span>
            <span class="ml-auto text-[10px] opacity-60 font-mono">{{ mediaFiles.length }}</span>
          </button>
        </div>

        <!-- macOS Tags Section -->
        <div class="flex flex-col gap-1 mt-auto pt-2 border-t" :class="store.theme === 'light' ? 'border-black/5' : 'border-white/5'">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-2 mb-0.5">Etiquetas</span>
          <button
            @click="selectSidebar('tag-blue')"
            class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition cursor-pointer"
            :class="activeSidebarItem === 'tag-blue' ? (store.theme === 'light' ? 'bg-black/10 font-semibold' : 'bg-white/15 font-semibold') : 'hover:bg-black/5'"
          >
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-2xs"></span>
            <span>TypeScript & Go</span>
          </button>
          <button
            @click="selectSidebar('tag-green')"
            class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition cursor-pointer"
            :class="activeSidebarItem === 'tag-green' ? (store.theme === 'light' ? 'bg-black/10 font-semibold' : 'bg-white/15 font-semibold') : 'hover:bg-black/5'"
          >
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs"></span>
            <span>Vue & Shell</span>
          </button>
          <button
            @click="selectSidebar('tag-orange')"
            class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition cursor-pointer"
            :class="activeSidebarItem === 'tag-orange' ? (store.theme === 'light' ? 'bg-black/10 font-semibold' : 'bg-white/15 font-semibold') : 'hover:bg-black/5'"
          >
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-2xs"></span>
            <span>IaC & Cloud</span>
          </button>
        </div>
      </div>

      <!-- Main Contents Area -->
      <div class="flex-grow flex flex-col min-w-0 overflow-hidden">
        <!-- Subfolder Breadcrumb Tabs for mobile -->
        <div
          class="md:hidden flex items-center gap-1.5 px-3 py-2 border-b overflow-x-auto shrink-0 text-xs"
          :class="store.theme === 'light' ? 'bg-zinc-100 border-black/10' : 'bg-[#181820] border-white/10'"
        >
          <button
            @click="selectSidebar('all')"
            class="px-2.5 py-1 rounded-md text-[11px] font-medium shrink-0"
            :class="activeSidebarItem === 'all' ? 'bg-sky-500 text-white' : 'text-zinc-400'"
          >
            Todos ({{ repos.length }})
          </button>
          <button
            @click="selectSidebar('favorites')"
            class="px-2.5 py-1 rounded-md text-[11px] font-medium shrink-0"
            :class="activeSidebarItem === 'favorites' ? 'bg-sky-500 text-white' : 'text-zinc-400'"
          >
            Destaques
          </button>
          <button
            @click="selectSidebar('work')"
            class="px-2.5 py-1 rounded-md text-[11px] font-medium shrink-0"
            :class="activeSidebarItem === 'work' ? 'bg-sky-500 text-white' : 'text-zinc-400'"
          >
            Trabalho
          </button>
          <button
            @click="selectSidebar('studies')"
            class="px-2.5 py-1 rounded-md text-[11px] font-medium shrink-0"
            :class="activeSidebarItem === 'studies' ? 'bg-sky-500 text-white' : 'text-zinc-400'"
          >
            Estudos
          </button>
          <button
            @click="selectSidebar('media')"
            class="px-2.5 py-1 rounded-md text-[11px] font-medium shrink-0"
            :class="activeSidebarItem === 'media' ? 'bg-sky-500 text-white' : 'text-zinc-400'"
          >
            Fotos ({{ mediaFiles.length }})
          </button>
        </div>

        <!-- Scrollable Files View -->
        <div class="flex-grow overflow-y-auto p-4 sm:p-6 select-none relative">
          <!-- Loading -->
          <div v-if="loading && repos.length === 0" class="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw class="w-8 h-8 animate-spin text-sky-500" />
            <span class="text-xs text-zinc-500">Carregando itens do Finder...</span>
          </div>

          <!-- ICON (GRID) VIEW: Authentic macOS Aqua Blue Folders -->
          <div
            v-else-if="viewMode === 'grid'"
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
          >
            <!-- Subfolder Shortcuts if in root -->
            <template v-if="activeSidebarItem === 'all' && !searchQuery">
              <!-- Trabalho Folder -->
              <div
                @click="openFolder('Trabalho')"
                class="flex flex-col items-center gap-1.5 p-2 rounded-xl cursor-pointer group transition hover:bg-black/5 dark:hover:bg-white/5"
              >
                <!-- macOS Blue Aqua Folder -->
                <div class="relative w-16 h-14 flex items-center justify-center transition-transform group-hover:scale-105">
                  <svg viewBox="0 0 64 52" class="w-full h-full drop-shadow-md">
                    <defs>
                      <linearGradient id="macFolderGrad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#64b5f6" />
                        <stop offset="100%" stop-color="#1976d2" />
                      </linearGradient>
                      <linearGradient id="macFolderBack1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#42a5f5" />
                        <stop offset="100%" stop-color="#1565c0" />
                      </linearGradient>
                    </defs>
                    <path d="M4 8C4 5.79 5.79 4 8 4H22C24.5 4 26.5 6 28 8L31 12H56C58.21 12 60 13.79 60 16V44C60 46.21 58.21 48 56 48H8C5.79 48 4 46.21 4 44V8Z" fill="url(#macFolderBack1)" />
                    <rect x="8" y="10" width="48" height="12" rx="2" fill="#ffffff" opacity="0.3" />
                    <path d="M4 16C4 13.79 5.79 12 8 12H56C58.21 12 60 13.79 60 16V44C60 46.21 58.21 48 56 48H8C5.79 48 4 46.21 4 44V16Z" fill="url(#macFolderGrad1)" />
                  </svg>
                </div>
                <span class="text-xs font-medium text-center truncate max-w-full px-1.5 rounded group-hover:bg-sky-500 group-hover:text-white transition-colors">
                  Trabalho
                </span>
              </div>

              <!-- Estudos Folder -->
              <div
                @click="openFolder('Estudos')"
                class="flex flex-col items-center gap-1.5 p-2 rounded-xl cursor-pointer group transition hover:bg-black/5 dark:hover:bg-white/5"
              >
                <div class="relative w-16 h-14 flex items-center justify-center transition-transform group-hover:scale-105">
                  <svg viewBox="0 0 64 52" class="w-full h-full drop-shadow-md">
                    <defs>
                      <linearGradient id="macFolderGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#64b5f6" />
                        <stop offset="100%" stop-color="#1976d2" />
                      </linearGradient>
                      <linearGradient id="macFolderBack2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#42a5f5" />
                        <stop offset="100%" stop-color="#1565c0" />
                      </linearGradient>
                    </defs>
                    <path d="M4 8C4 5.79 5.79 4 8 4H22C24.5 4 26.5 6 28 8L31 12H56C58.21 12 60 13.79 60 16V44C60 46.21 58.21 48 56 48H8C5.79 48 4 46.21 4 44V8Z" fill="url(#macFolderBack2)" />
                    <rect x="8" y="10" width="48" height="12" rx="2" fill="#ffffff" opacity="0.3" />
                    <path d="M4 16C4 13.79 5.79 12 8 12H56C58.21 12 60 13.79 60 16V44C60 46.21 58.21 48 56 48H8C5.79 48 4 46.21 4 44V16Z" fill="url(#macFolderGrad2)" />
                  </svg>
                </div>
                <span class="text-xs font-medium text-center truncate max-w-full px-1.5 rounded group-hover:bg-sky-500 group-hover:text-white transition-colors">
                  Estudos & TCC
                </span>
              </div>

              <!-- Fotos & Eventos Folder -->
              <div
                @click="openFolder('Fotos')"
                class="flex flex-col items-center gap-1.5 p-2 rounded-xl cursor-pointer group transition hover:bg-black/5 dark:hover:bg-white/5"
              >
                <div class="relative w-16 h-14 flex items-center justify-center transition-transform group-hover:scale-105">
                  <svg viewBox="0 0 64 52" class="w-full h-full drop-shadow-md">
                    <defs>
                      <linearGradient id="macFolderGradPhotos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#ab47bc" />
                        <stop offset="100%" stop-color="#7b1fa2" />
                      </linearGradient>
                      <linearGradient id="macFolderBackPhotos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#ba68c8" />
                        <stop offset="100%" stop-color="#6a1b9a" />
                      </linearGradient>
                    </defs>
                    <path d="M4 8C4 5.79 5.79 4 8 4H22C24.5 4 26.5 6 28 8L31 12H56C58.21 12 60 13.79 60 16V44C60 46.21 58.21 48 56 48H8C5.79 48 4 46.21 4 44V8Z" fill="url(#macFolderBackPhotos)" />
                    <rect x="8" y="10" width="48" height="12" rx="2" fill="#ffffff" opacity="0.3" />
                    <path d="M4 16C4 13.79 5.79 12 8 12H56C58.21 12 60 13.79 60 16V44C60 46.21 58.21 48 56 48H8C5.79 48 4 46.21 4 44V16Z" fill="url(#macFolderGradPhotos)" />
                  </svg>
                  <ImageIcon class="w-4 h-4 text-white/90 absolute bottom-3 drop-shadow-xs" />
                </div>
                <span class="text-xs font-medium text-center truncate max-w-full px-1.5 rounded group-hover:bg-sky-500 group-hover:text-white transition-colors">
                  Fotos & Eventos
                </span>
              </div>
            </template>

            <!-- MEDIA FILES (Fotos & Eventos) -->
            <template v-if="activeSidebarItem === 'media'">
              <div
                v-for="media in mediaFiles"
                :key="media.id"
                @click="selectedMedia = media; selectedRepo = null"
                class="flex flex-col items-center gap-1.5 p-2 rounded-xl cursor-pointer transition select-none group w-full text-center"
                :class="selectedMedia?.id === media.id
                  ? (store.theme === 'light' ? 'bg-sky-50 border border-sky-300 shadow-2xs' : 'bg-sky-500/15 border border-sky-400/30 shadow-2xs')
                  : 'border border-transparent hover:bg-black/5 dark:hover:bg-white/5'"
              >
                <!-- Image Thumbnail with macOS Photo Frame -->
                <div class="relative w-16 h-14 rounded-lg overflow-hidden border shadow-sm transition-transform group-hover:scale-105 bg-black/10" :class="store.theme === 'light' ? 'border-zinc-200' : 'border-white/10'">
                  <img :src="media.src" class="w-full h-full object-cover object-top" :alt="media.name" />
                  <span class="absolute bottom-0.5 right-0.5 bg-black/70 text-[8px] font-mono text-white px-1 py-0.2 rounded">PNG</span>
                </div>
                <span
                  class="text-xs font-medium text-center line-clamp-2 break-all px-1.5 py-0.5 rounded leading-tight transition-colors"
                  :class="selectedMedia?.id === media.id
                    ? 'bg-sky-500 text-white font-semibold'
                    : (store.theme === 'light' ? 'text-zinc-800' : 'text-zinc-200')"
                >
                  {{ media.name }}
                </span>
              </div>
            </template>

            <!-- Repositories as macOS Project Folders -->
            <template v-else>
              <div
                v-for="repo in filteredRepos"
                :key="repo.id"
                @click="selectedRepo = repo; selectedMedia = null"
                class="flex flex-col items-center gap-1.5 p-2 rounded-xl cursor-pointer transition select-none group w-full text-center"
                :class="selectedRepo?.id === repo.id
                  ? (store.theme === 'light' ? 'bg-sky-50 border border-sky-300 shadow-2xs' : 'bg-sky-500/15 border border-sky-400/30 shadow-2xs')
                  : 'border border-transparent hover:bg-black/5 dark:hover:bg-white/5'"
              >
                <!-- macOS Blue Aqua Folder with Code Badge -->
                <div class="relative w-16 h-14 flex items-center justify-center transition-transform group-hover:scale-105">
                  <svg viewBox="0 0 64 52" class="w-full h-full drop-shadow-md">
                    <defs>
                      <linearGradient id="macFolderGradRepo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#72c5ff" />
                        <stop offset="100%" stop-color="#2185d0" />
                      </linearGradient>
                      <linearGradient id="macFolderBackRepo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#4ea8f6" />
                        <stop offset="100%" stop-color="#166dbb" />
                      </linearGradient>
                    </defs>
                    <path d="M4 8C4 5.79 5.79 4 8 4H22C24.5 4 26.5 6 28 8L31 12H56C58.21 12 60 13.79 60 16V44C60 46.21 58.21 48 56 48H8C5.79 48 4 46.21 4 44V8Z" fill="url(#macFolderBackRepo)" />
                    <rect x="8" y="10" width="48" height="12" rx="2" fill="#ffffff" opacity="0.3" />
                    <path d="M4 16C4 13.79 5.79 12 8 12H56C58.21 12 60 13.79 60 16V44C60 46.21 58.21 48 56 48H8C5.79 48 4 46.21 4 44V16Z" fill="url(#macFolderGradRepo)" />
                  </svg>

                  <!-- Language dot badge on folder -->
                  <span
                    class="absolute bottom-2.5 right-2 w-2.5 h-2.5 rounded-full ring-2 ring-white/80 shadow-xs"
                    :class="getLanguageDotColor(repo.language)"
                    :title="repo.language || 'Outro'"
                  ></span>

                  <!-- Star indicator -->
                  <Star
                    v-if="repo.is_favorite"
                    class="absolute top-4 left-3 w-3 h-3 text-amber-300 fill-amber-300 drop-shadow-xs"
                  />
                </div>

                <!-- Folder Title underneath -->
                <span
                  class="text-xs font-medium text-center line-clamp-2 break-all px-1.5 py-0.5 rounded leading-tight transition-colors"
                  :class="selectedRepo?.id === repo.id
                    ? 'bg-sky-500 text-white font-semibold'
                    : (store.theme === 'light' ? 'text-zinc-800' : 'text-zinc-200')"
                >
                  {{ repo.name }}
                </span>
              </div>
            </template>
          </div>

          <!-- LIST VIEW: macOS Finder Standard Column Table -->
          <div v-else class="flex flex-col border rounded-xl overflow-hidden shadow-2xs" :class="store.theme === 'light' ? 'border-black/10 bg-white' : 'border-white/10 bg-[#25252d]'">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr
                  class="border-b text-[10px] uppercase tracking-wider font-semibold"
                  :class="store.theme === 'light' ? 'bg-[#f5f5f7] border-black/10 text-zinc-500' : 'bg-[#1e1e24] border-white/10 text-zinc-400'"
                >
                  <th class="py-2 px-3">Nome</th>
                  <th class="py-2 px-3 hidden sm:table-cell">Linguagem</th>
                  <th class="py-2 px-3 text-right">Modificado</th>
                  <th class="py-2 px-3 text-center">⭐</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="repo in filteredRepos"
                  :key="repo.id"
                  @click="selectedRepo = repo"
                  class="border-b transition cursor-pointer"
                  :class="selectedRepo?.id === repo.id
                    ? (store.theme === 'light' ? 'bg-sky-100 text-sky-950 font-medium' : 'bg-sky-900/40 text-white font-medium')
                    : (store.theme === 'light' ? 'border-black/5 hover:bg-black/5' : 'border-white/5 hover:bg-white/5')"
                >
                  <td class="py-2 px-3">
                    <div class="flex items-center gap-2 max-w-[240px] truncate">
                      <FolderIcon class="w-4 h-4 text-sky-500 fill-sky-500/20 shrink-0" />
                      <span class="truncate">{{ repo.name }}</span>
                    </div>
                  </td>
                  <td class="py-2 px-3 hidden sm:table-cell text-zinc-500">
                    <span class="flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full" :class="getLanguageDotColor(repo.language)"></span>
                      {{ repo.language || 'Outro' }}
                    </span>
                  </td>
                  <td class="py-2 px-3 text-right text-zinc-400 font-mono text-[11px]">
                    {{ timeAgo(repo.updated_at) }}
                  </td>
                  <td class="py-2 px-3 text-center font-mono">
                    <span v-if="repo.stars > 0" class="text-amber-500 flex items-center justify-center gap-0.5">
                      <Star class="w-3 h-3 fill-amber-500" /> {{ repo.stars }}
                    </span>
                    <span v-else class="text-zinc-400">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- macOS Finder Path & Status Bar (Bottom) -->
        <div
          class="h-7 border-t flex items-center justify-between px-3 text-[10px] font-mono shrink-0 select-none transition-colors duration-300"
          :class="store.theme === 'light' ? 'bg-[#f5f5f7] border-black/10 text-zinc-500' : 'bg-[#181820] border-white/10 text-zinc-400'"
        >
          <!-- Path Breadcrumbs -->
          <div class="flex items-center gap-1 truncate">
            <HardDrive class="w-3 h-3 text-zinc-400" />
            <span>Macintosh HD</span>
            <ChevronRight class="w-2.5 h-2.5 text-zinc-400" />
            <span>Users</span>
            <ChevronRight class="w-2.5 h-2.5 text-zinc-400" />
            <template v-for="(p, i) in currentPath" :key="i">
              <span :class="i === currentPath.length - 1 ? 'font-semibold text-zinc-700 dark:text-zinc-200' : ''">{{ p }}</span>
              <ChevronRight v-if="i < currentPath.length - 1" class="w-2.5 h-2.5 text-zinc-400" />
            </template>
          </div>

          <!-- Item count -->
          <span class="shrink-0 ml-2">
            {{ filteredRepos.length }} itens
          </span>
        </div>
      </div>

      <!-- Mobile Backdrop (allows tapping outside to close on phones) -->
      <div
        v-if="selectedRepo || selectedMedia"
        @click="closeInspector"
        class="absolute inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
      ></div>

      <!-- macOS Quick Look / Inspector Panel -->
      <Transition name="drawer-slide">
        <div
          v-if="selectedRepo || selectedMedia"
          class="absolute inset-y-0 right-0 z-50 md:static w-full max-w-xs sm:w-80 border-l p-4 flex flex-col gap-4 overflow-y-auto shrink-0 transition-colors duration-300 shadow-2xl"
          :class="store.theme === 'light'
            ? 'bg-[#fafafa] border-black/10 text-zinc-800'
            : 'bg-[#21212a] border-white/10 text-zinc-200'"
        >
          <!-- Prominent Mobile Back Bar (Solves mobile trap!) -->
          <div class="flex items-center justify-between pb-2 border-b md:hidden" :class="store.theme === 'light' ? 'border-black/10' : 'border-white/10'">
            <button
              @click="closeInspector"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 text-white font-semibold text-xs active:scale-95 transition cursor-pointer shadow-xs"
            >
              <ChevronLeft class="w-4 h-4" />
              <span>Voltar ao Finder</span>
            </button>
            <button
              @click="closeInspector"
              class="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-600 cursor-pointer"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- DESKTOP Header -->
          <div class="hidden md:flex items-start justify-between border-b pb-3" :class="store.theme === 'light' ? 'border-black/10' : 'border-white/10'">
            <div class="min-w-0 pr-2">
              <span class="text-[9px] font-semibold uppercase tracking-wider text-sky-500 block mb-0.5">Informações</span>
              <h3 class="font-bold text-sm truncate">{{ selectedRepo ? selectedRepo.name : selectedMedia?.name }}</h3>
            </div>
            <button
              @click="closeInspector"
              class="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
            >
              <X class="w-4 h-4 text-zinc-400" />
            </button>
          </div>

          <!-- CASE 1: MEDIA PREVIEW -->
          <template v-if="selectedMedia">
            <div class="w-full aspect-[4/3] rounded-xl overflow-hidden border shadow-sm bg-black/10" :class="store.theme === 'light' ? 'border-zinc-200' : 'border-white/10'">
              <img :src="selectedMedia.src" class="w-full h-full object-cover object-top" :alt="selectedMedia.name" />
            </div>

            <div class="flex flex-col gap-1">
              <h4 class="font-bold text-sm" :class="store.theme === 'light' ? 'text-zinc-900' : 'text-white'">{{ selectedMedia.name }}</h4>
              <p class="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                {{ selectedMedia.description }}
              </p>
            </div>

            <div class="flex flex-col gap-2 text-[11px] border-t pt-3" :class="store.theme === 'light' ? 'border-black/10' : 'border-white/10'">
              <div class="flex justify-between">
                <span class="text-zinc-400">Local:</span>
                <span class="font-medium">{{ selectedMedia.location }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-400">Ano:</span>
                <span class="font-medium font-mono">{{ selectedMedia.date }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-400">Resolução:</span>
                <span class="font-medium font-mono text-[10px]">{{ selectedMedia.resolution }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-400">Tamanho:</span>
                <span class="font-medium font-mono text-[10px]">{{ selectedMedia.size }}</span>
              </div>
            </div>

            <div class="mt-auto pt-3 border-t flex flex-col gap-2" :class="store.theme === 'light' ? 'border-black/10' : 'border-white/10'">
              <a
                :href="selectedMedia.src"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full py-2 px-3 rounded-lg text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <ExternalLink class="w-3.5 h-3.5" />
                <span>Visualizar Imagem Completa</span>
              </a>
              <button
                @click="closeInspector"
                class="w-full py-2 px-3 rounded-lg border text-xs font-medium transition cursor-pointer md:hidden"
                :class="store.theme === 'light' ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800' : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200'"
              >
                Fechar Painel
              </button>
            </div>
          </template>

          <!-- CASE 2: REPOSITORY PREVIEW -->
          <template v-else-if="selectedRepo">
            <!-- Big Preview Icon -->
            <div class="flex flex-col items-center justify-center py-2">
              <svg viewBox="0 0 64 52" class="w-20 h-16 drop-shadow-lg">
                <defs>
                  <linearGradient id="macInspectGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#72c5ff" />
                    <stop offset="100%" stop-color="#2185d0" />
                  </linearGradient>
                  <linearGradient id="macInspectBack" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#4ea8f6" />
                    <stop offset="100%" stop-color="#166dbb" />
                  </linearGradient>
                </defs>
                <path d="M4 8C4 5.79 5.79 4 8 4H22C24.5 4 26.5 6 28 8L31 12H56C58.21 12 60 13.79 60 16V44C60 46.21 58.21 48 56 48H8C5.79 48 4 46.21 4 44V8Z" fill="url(#macInspectBack)" />
                <rect x="8" y="10" width="48" height="12" rx="2" fill="#ffffff" opacity="0.3" />
                <path d="M4 16C4 13.79 5.79 12 8 12H56C58.21 12 60 13.79 60 16V44C60 46.21 58.21 48 56 48H8C5.79 48 4 46.21 4 44V16Z" fill="url(#macInspectGrad)" />
              </svg>
              <span class="text-xs font-semibold mt-2">{{ selectedRepo.name }}</span>
              <span class="text-[10px] text-zinc-400">Repositório Git · {{ selectedRepo.language || 'Geral' }}</span>
            </div>

            <!-- Description -->
            <div class="flex flex-col gap-1 text-xs">
              <span class="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Descrição</span>
              <p class="leading-relaxed text-zinc-600 dark:text-zinc-300 text-[11px] select-text">
                {{ selectedRepo.description || 'Nenhuma descrição fornecida.' }}
              </p>
            </div>

            <!-- Info List -->
            <div class="flex flex-col gap-2 text-[11px] border-t pt-3" :class="store.theme === 'light' ? 'border-black/10' : 'border-white/10'">
              <div class="flex justify-between">
                <span class="text-zinc-400">Linguagem:</span>
                <span class="font-medium">{{ selectedRepo.language || 'Outro' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-400">Estrelas:</span>
                <span class="font-medium font-mono">{{ selectedRepo.stars }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-400">Atualizado:</span>
                <span class="font-medium font-mono text-[10px]">{{ formatDate(selectedRepo.updated_at) }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col gap-2 mt-auto pt-3 border-t" :class="store.theme === 'light' ? 'border-black/10' : 'border-white/10'">
              <button
                @click="toggleFavorite(selectedRepo)"
                class="w-full py-1.5 px-3 rounded-lg border text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
                :class="selectedRepo.is_favorite
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-500'
                  : (store.theme === 'light' ? 'bg-white border-zinc-300 hover:bg-zinc-50' : 'bg-white/5 border-white/10 hover:bg-white/10')"
              >
                <Star class="w-3.5 h-3.5" :class="selectedRepo.is_favorite ? 'fill-amber-500' : ''" />
                <span>{{ selectedRepo.is_favorite ? 'Destaque Marcado' : 'Marcar Destaque' }}</span>
              </button>

              <select
                :value="selectedRepo.folder"
                @change="moveRepoToFolder(selectedRepo, ($event.target as HTMLSelectElement).value as any || null)"
                class="w-full text-xs font-medium rounded-lg px-2.5 py-1.5 border outline-none cursor-pointer"
                :class="store.theme === 'light' ? 'bg-white border-zinc-300 text-zinc-800' : 'bg-[#181820] border-white/10 text-zinc-300'"
              >
                <option :value="null">Mover para: Raiz</option>
                <option value="Trabalho">Mover para: Trabalho</option>
                <option value="Estudos">Mover para: Estudos & TCC</option>
              </select>

              <a
                :href="selectedRepo.url"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full py-1.5 px-3 rounded-lg text-xs font-medium text-white bg-sky-500 hover:bg-sky-600 transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <ExternalLink class="w-3.5 h-3.5" />
                <span>Abrir no GitHub</span>
              </a>

              <button
                @click="closeInspector"
                class="w-full py-2 px-3 rounded-lg border text-xs font-medium transition cursor-pointer md:hidden"
                :class="store.theme === 'light' ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800' : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200'"
              >
                Fechar Painel
              </button>
            </div>
          </template>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
  opacity: 0.5;
}
</style>
