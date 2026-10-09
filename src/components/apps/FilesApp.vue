<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Folder,
  Star,
  Briefcase,
  BookOpen,
  Search,
  Grid,
  List as ListIcon,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Home,
  FileCode2,
  X
} from 'lucide-vue-next'

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

// State management
const repos = ref<Repository[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const searchQuery = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const sortBy = ref<'recent' | 'oldest' | 'stars' | 'name'>('recent')
const selectedRepo = ref<Repository | null>(null)
const currentPath = ref<string[]>(['Home']) // Navigation: 'Home', 'Destaques', 'Trabalho', 'Estudos'

// Filter states (Sidebar)
const selectedLanguageFilter = ref<string | null>(null)
const selectedYearFilter = ref<string | null>(null)

// Drag and drop states
const draggedRepo = ref<Repository | null>(null)
const activeDragOverFolder = ref<string | null>(null)

// API Fetching functions
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
    error.value = err.message || 'Erro desconhecido.'
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

// Helper: Formatter for time elapsed
const timeAgo = (dateStr: string) => {
  if (!dateStr) return ''
  const now = new Date()
  const updated = new Date(dateStr)
  const diffTime = Math.abs(now.getTime() - updated.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    if (diffHours === 0) return 'Hoje'
    return `Há ${diffHours}h`
  }
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 30) return `Há ${diffDays}d`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths === 1) return 'Há 1 mês'
  if (diffMonths < 12) return `Há ${diffMonths}m`
  const diffYears = Math.floor(diffMonths / 12)
  return `Há ${diffYears}a`
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Subtle standard language dot colors (GitHub Official Style)
const getLanguageDotColor = (lang: string) => {
  const l = (lang || '').toLowerCase()
  if (l === 'typescript') return 'bg-[#3178c6]'
  if (l === 'javascript') return 'bg-[#f1e05a]'
  if (l === 'python') return 'bg-[#3572A5]'
  if (l === 'go') return 'bg-[#00ADD8]'
  if (l === 'shell' || l === 'bash') return 'bg-[#89e051]'
  if (l === 'vue') return 'bg-[#41b883]'
  if (l === 'html') return 'bg-[#e34c26]'
  if (l === 'css') return 'bg-[#563d7c]'
  if (l === 'java') return 'bg-[#b07219]'
  return 'bg-zinc-400'
}

// Proportions mock for drawer breakdown
const getMockLanguagesProportions = (mainLang: string) => {
  const l = (mainLang || '').toLowerCase()
  if (l === 'typescript') {
    return [
      { name: 'TypeScript', percentage: 78, color: '#3178c6' },
      { name: 'Vue', percentage: 15, color: '#41b883' },
      { name: 'CSS', percentage: 7, color: '#563d7c' }
    ]
  }
  if (l === 'python') {
    return [
      { name: 'Python', percentage: 92, color: '#3572A5' },
      { name: 'Shell', percentage: 5, color: '#89e051' },
      { name: 'Docker', percentage: 3, color: '#384d54' }
    ]
  }
  if (l === 'go') {
    return [
      { name: 'Go', percentage: 89, color: '#00ADD8' },
      { name: 'Shell', percentage: 8, color: '#89e051' },
      { name: 'Makefile', percentage: 3, color: '#427819' }
    ]
  }
  if (l === 'vue') {
    return [
      { name: 'Vue', percentage: 68, color: '#41b883' },
      { name: 'TypeScript', percentage: 22, color: '#3178c6' },
      { name: 'CSS', percentage: 10, color: '#563d7c' }
    ]
  }
  return [
    { name: mainLang || 'Outro', percentage: 80, color: '#3178c6' },
    { name: 'Outros', percentage: 20, color: '#52525b' }
  ]
}

const activeFolderName = computed(() => {
  return currentPath.value.length > 1 ? currentPath.value[1] : null
})

// Main filtering logic
const filteredRepos = computed(() => {
  let list = [...repos.value]

  const folder = activeFolderName.value
  if (folder === 'Destaques') {
    list = list.filter(r => r.is_favorite)
  } else if (folder === 'Trabalho') {
    list = list.filter(r => r.folder === 'Trabalho')
  } else if (folder === 'Estudos') {
    list = list.filter(r => r.folder === 'Estudos')
  } else {
    list = list.filter(r => r.folder === null)
  }

  if (selectedLanguageFilter.value) {
    list = list.filter(r => r.language === selectedLanguageFilter.value)
  }

  if (selectedYearFilter.value) {
    list = list.filter(r => r.created_at && new Date(r.created_at).getFullYear().toString() === selectedYearFilter.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(r => 
      r.name.toLowerCase().includes(q) || 
      (r.description || '').toLowerCase().includes(q) ||
      r.topics.some(t => t.toLowerCase().includes(q))
    )
  }

  list.sort((a, b) => {
    if (sortBy.value === 'recent') {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    }
    if (sortBy.value === 'oldest') {
      return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
    }
    if (sortBy.value === 'stars') {
      return b.stars - a.stars
    }
    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name)
    }
    return 0
  })

  return list
})

const currentViewLanguages = computed(() => {
  const langs = new Set<string>()
  let baseList = [...repos.value]
  const folder = activeFolderName.value
  if (folder === 'Destaques') {
    baseList = baseList.filter(r => r.is_favorite)
  } else if (folder === 'Trabalho') {
    baseList = baseList.filter(r => r.folder === 'Trabalho')
  } else if (folder === 'Estudos') {
    baseList = baseList.filter(r => r.folder === 'Estudos')
  } else {
    baseList = baseList.filter(r => r.folder === null)
  }
  
  baseList.forEach(r => {
    if (r.language && r.language !== 'Other') {
      langs.add(r.language)
    }
  })
  return Array.from(langs).sort()
})

const navigateToFolder = (folder: string) => {
  currentPath.value = ['Home', folder]
  selectedRepo.value = null
  selectedYearFilter.value = null
}

const navigateBack = () => {
  if (currentPath.value.length > 1) {
    currentPath.value = ['Home']
    selectedRepo.value = null
  }
}

const handleSidebarShortcut = (type: 'all' | 'favorites' | 'folder', payload?: any) => {
  if (type === 'all') {
    currentPath.value = ['Home']
    selectedLanguageFilter.value = null
    selectedYearFilter.value = null
  } else if (type === 'favorites') {
    navigateToFolder('Destaques')
    selectedLanguageFilter.value = null
  } else if (type === 'folder') {
    navigateToFolder(payload)
    selectedLanguageFilter.value = null
  }
  selectedRepo.value = null
}

const handleDragStart = (e: DragEvent, repo: Repository) => {
  draggedRepo.value = repo
  if (e.dataTransfer) {
    e.dataTransfer.setData('text/plain', repo.id.toString())
    e.dataTransfer.effectAllowed = 'move'
  }
}

const handleDragOver = (_e: DragEvent, folder: string) => {
  activeDragOverFolder.value = folder
}

const handleDragLeave = (_e: DragEvent, folder: string) => {
  if (activeDragOverFolder.value === folder) {
    activeDragOverFolder.value = null
  }
}

const handleDrop = async (_e: DragEvent, folder: 'Destaques' | 'Trabalho' | 'Estudos') => {
  activeDragOverFolder.value = null
  if (!draggedRepo.value) return
  
  const repo = draggedRepo.value
  draggedRepo.value = null

  if (folder === 'Destaques') {
    await toggleFavorite(repo, true)
  } else {
    await moveRepoToFolder(repo, folder)
  }
}

onMounted(() => {
  fetchRepos()
})
</script>

<template>
  <div class="flex-grow flex h-full bg-[#0d0e12] text-zinc-300 font-sans text-xs select-none relative overflow-hidden">
    
    <!-- Desktop Sidebar (macOS Finder Style) -->
    <div class="hidden md:flex w-[190px] bg-[#090a0d] border-r border-white/[0.08] p-3 flex-col gap-5 shrink-0 overflow-y-auto">
      
      <!-- Favoritos -->
      <div>
        <p class="text-zinc-500 uppercase font-semibold tracking-wider text-[10px] mb-1.5 px-2.5">Navegação</p>
        <ul class="flex flex-col gap-0.5">
          <li
            class="flex items-center justify-between py-1.5 px-2.5 rounded-lg cursor-pointer transition text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100"
            :class="currentPath.length === 1 ? 'bg-white/[0.09] text-white font-medium' : ''"
            @click="handleSidebarShortcut('all')"
          >
            <div class="flex items-center gap-2">
              <Home class="w-3.5 h-3.5 text-zinc-400" />
              <span>Todos</span>
            </div>
            <span class="text-[9px] text-zinc-500 font-mono">{{ repos.length }}</span>
          </li>
          
          <li
            class="flex items-center justify-between py-1.5 px-2.5 rounded-lg cursor-pointer transition text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100"
            :class="activeFolderName === 'Destaques' ? 'bg-white/[0.09] text-white font-medium' : ''"
            @click="handleSidebarShortcut('favorites')"
          >
            <div class="flex items-center gap-2">
              <Star class="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
              <span>Destaques</span>
            </div>
            <span class="text-[9px] text-zinc-500 font-mono">
              {{ repos.filter(r => r.is_favorite).length }}
            </span>
          </li>
        </ul>
      </div>

      <!-- Pastas -->
      <div>
        <p class="text-zinc-500 uppercase font-semibold tracking-wider text-[10px] mb-1.5 px-2.5">Pastas</p>
        <ul class="flex flex-col gap-0.5">
          <li
            class="flex items-center justify-between py-1.5 px-2.5 rounded-lg cursor-pointer transition text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100"
            :class="activeFolderName === 'Trabalho' ? 'bg-white/[0.09] text-white font-medium' : ''"
            @click="handleSidebarShortcut('folder', 'Trabalho')"
          >
            <div class="flex items-center gap-2">
              <Briefcase class="w-3.5 h-3.5 text-zinc-400" />
              <span>Trabalho</span>
            </div>
            <span class="text-[9px] text-zinc-500 font-mono">
              {{ repos.filter(r => r.folder === 'Trabalho').length }}
            </span>
          </li>

          <li
            class="flex items-center justify-between py-1.5 px-2.5 rounded-lg cursor-pointer transition text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100"
            :class="activeFolderName === 'Estudos' ? 'bg-white/[0.09] text-white font-medium' : ''"
            @click="handleSidebarShortcut('folder', 'Estudos')"
          >
            <div class="flex items-center gap-2">
              <BookOpen class="w-3.5 h-3.5 text-zinc-400" />
              <span>Estudos</span>
            </div>
            <span class="text-[9px] text-zinc-500 font-mono">
              {{ repos.filter(r => r.folder === 'Estudos').length }}
            </span>
          </li>
        </ul>
      </div>

    </div>

    <!-- Main Workspace -->
    <div class="flex-grow flex flex-col min-w-0 bg-[#0d0e12]">
      
      <!-- Top Navigation & Search Toolbar -->
      <div class="h-11 border-b border-white/[0.08] px-3.5 flex items-center justify-between bg-[#0a0b0e]/70 shrink-0 gap-3">
        
        <!-- Breadcrumb / Back button -->
        <div class="flex items-center gap-2 min-w-0">
          <button
            class="p-1.5 rounded-md hover:bg-white/[0.06] text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer shrink-0"
            :disabled="currentPath.length <= 1"
            @click="navigateBack"
            title="Voltar"
          >
            <ArrowLeft class="w-3.5 h-3.5" />
          </button>

          <div class="flex items-center gap-1 text-[11px] text-zinc-400 overflow-x-auto select-none whitespace-nowrap scrollbar-none">
            <template v-for="(node, idx) in currentPath" :key="idx">
              <ChevronRight v-if="idx > 0" class="w-3 h-3 shrink-0 text-zinc-600" />
              <span
                class="hover:text-white cursor-pointer truncate font-medium max-w-[120px]"
                :class="idx === currentPath.length - 1 ? 'text-zinc-100 font-semibold' : ''"
                @click="currentPath = currentPath.slice(0, idx + 1); selectedRepo = null"
              >
                {{ node }}
              </span>
            </template>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="relative flex-1 max-w-64 shrink-0">
          <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar repositórios..."
            class="w-full bg-zinc-900/70 border border-white/[0.08] rounded-lg pl-8 pr-7 py-1 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 select-text transition"
          />
          <button 
            v-if="searchQuery" 
            @click="searchQuery = ''" 
            class="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer rounded-full p-0.5"
          >
            <X class="w-3 h-3" />
          </button>
        </div>

        <!-- Toolbar Buttons (Sort, View Mode, Refresh) -->
        <div class="flex items-center gap-1.5 shrink-0 select-none">
          <!-- Refresh -->
          <button
            class="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
            :class="loading ? 'animate-spin text-sky-400' : ''"
            :disabled="loading"
            @click="fetchRepos(true)"
            title="Sincronizar GitHub"
          >
            <RefreshCw class="w-3.5 h-3.5" />
          </button>

          <!-- Sorting Select -->
          <div class="hidden sm:block">
            <select
              v-model="sortBy"
              class="bg-zinc-900/70 border border-white/[0.08] text-zinc-300 hover:text-white text-[11px] rounded-lg px-2 py-1 outline-none cursor-pointer focus:border-white/20"
            >
              <option value="recent">Recentes</option>
              <option value="oldest">Antigos</option>
              <option value="stars">Mais Estrelas</option>
              <option value="name">Nome A-Z</option>
            </select>
          </div>

          <!-- View Mode Toggle -->
          <div class="flex bg-zinc-900/80 p-0.5 rounded-lg border border-white/[0.08]">
            <button
              class="p-1 rounded cursor-pointer transition"
              :class="viewMode === 'grid' ? 'bg-white/10 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-300'"
              @click="viewMode = 'grid'"
            >
              <Grid class="w-3 h-3" />
            </button>
            <button
              class="p-1 rounded cursor-pointer transition"
              :class="viewMode === 'list' ? 'bg-white/10 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-300'"
              @click="viewMode = 'list'"
            >
              <ListIcon class="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      <!-- Mobile Navigation Quick Tabs (Visible only on mobile/narrow screens) -->
      <div class="md:hidden flex items-center gap-1 px-3 py-2 border-b border-white/[0.08] bg-[#090a0d] overflow-x-auto scrollbar-none shrink-0">
        <button
          class="px-2.5 py-1 rounded-md text-[11px] font-medium shrink-0 transition"
          :class="currentPath.length === 1 ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-zinc-200'"
          @click="handleSidebarShortcut('all')"
        >
          Todos ({{ repos.length }})
        </button>
        <button
          class="px-2.5 py-1 rounded-md text-[11px] font-medium shrink-0 transition"
          :class="activeFolderName === 'Destaques' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-zinc-200'"
          @click="handleSidebarShortcut('favorites')"
        >
          Destaques
        </button>
        <button
          class="px-2.5 py-1 rounded-md text-[11px] font-medium shrink-0 transition"
          :class="activeFolderName === 'Trabalho' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-zinc-200'"
          @click="handleSidebarShortcut('folder', 'Trabalho')"
        >
          Trabalho
        </button>
        <button
          class="px-2.5 py-1 rounded-md text-[11px] font-medium shrink-0 transition"
          :class="activeFolderName === 'Estudos' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-zinc-200'"
          @click="handleSidebarShortcut('folder', 'Estudos')"
        >
          Estudos
        </button>
      </div>

      <!-- Main Directory Contents -->
      <div class="flex-grow flex overflow-hidden relative">
        
        <!-- Files Grid/List Area -->
        <div class="flex-grow flex flex-col overflow-hidden">
          
          <!-- Chips Area (Language Filter) -->
          <div v-if="currentViewLanguages.length > 1" class="px-4 py-2 border-b border-white/[0.06] flex gap-1.5 overflow-x-auto select-none scrollbar-none shrink-0 bg-black/20">
            <button
              class="px-2 py-0.5 rounded-md border text-[10px] font-medium transition cursor-pointer"
              :class="!selectedLanguageFilter ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-zinc-400 border-white/5 hover:bg-white/[0.04]'"
              @click="selectedLanguageFilter = null"
            >
              Todas
            </button>
            <button
              v-for="lang in currentViewLanguages"
              :key="'chip-' + lang"
              class="px-2 py-0.5 rounded-md border text-[10px] font-medium transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              :class="selectedLanguageFilter === lang ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-zinc-400 border-white/5 hover:bg-white/[0.04]'"
              @click="selectedLanguageFilter = selectedLanguageFilter === lang ? null : lang"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="getLanguageDotColor(lang)"></span>
              {{ lang }}
            </button>
          </div>

          <!-- List Scroll Container -->
          <div class="flex-grow overflow-y-auto p-4 select-none relative">
            
            <!-- Loading Indicator -->
            <div v-if="loading && repos.length === 0" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0d0e12]/80 backdrop-blur-xs z-30">
              <RefreshCw class="w-8 h-8 animate-spin text-zinc-400" />
              <span class="text-xs text-zinc-400 font-medium">Carregando repositórios...</span>
            </div>

            <!-- Error State -->
            <div v-if="error && repos.length === 0" class="flex flex-col items-center justify-center py-16 gap-3 text-zinc-400">
              <span class="text-xs font-semibold">Não foi possível carregar os repositórios</span>
              <button @click="fetchRepos()" class="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-medium cursor-pointer">
                Tentar novamente
              </button>
            </div>

            <template v-if="repos.length > 0">
              
              <!-- Special Folders Row (Root only) -->
              <div v-if="currentPath.length === 1 && !selectedLanguageFilter && !selectedYearFilter && !searchQuery" class="mb-5 select-none">
                <p class="text-zinc-500 font-semibold uppercase tracking-wider text-[10px] mb-2.5">Pastas</p>
                
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <!-- Destaques -->
                  <div
                    class="flex items-center gap-3 p-3 rounded-xl border border-white/[0.07] bg-zinc-900/30 hover:bg-zinc-900/60 transition cursor-pointer select-none"
                    :class="activeDragOverFolder === 'Destaques' ? 'border-amber-400/50 bg-amber-500/5 border-dashed' : ''"
                    @click="navigateToFolder('Destaques')"
                    @dragover.prevent="handleDragOver($event, 'Destaques')"
                    @dragleave="handleDragLeave($event, 'Destaques')"
                    @drop="handleDrop($event, 'Destaques')"
                  >
                    <div class="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Star class="w-4 h-4 text-amber-400 fill-amber-400/20" />
                    </div>
                    <div class="min-w-0">
                      <span class="block font-semibold text-zinc-100 text-xs">Destaques</span>
                      <span class="block text-[10px] text-zinc-500 font-mono mt-0.5">
                        {{ repos.filter(r => r.is_favorite).length }} itens
                      </span>
                    </div>
                  </div>

                  <!-- Trabalho -->
                  <div
                    class="flex items-center gap-3 p-3 rounded-xl border border-white/[0.07] bg-zinc-900/30 hover:bg-zinc-900/60 transition cursor-pointer select-none"
                    :class="activeDragOverFolder === 'Trabalho' ? 'border-blue-400/50 bg-blue-500/5 border-dashed' : ''"
                    @click="navigateToFolder('Trabalho')"
                    @dragover.prevent="handleDragOver($event, 'Trabalho')"
                    @dragleave="handleDragLeave($event, 'Trabalho')"
                    @drop="handleDrop($event, 'Trabalho')"
                  >
                    <div class="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Briefcase class="w-4 h-4 text-blue-400" />
                    </div>
                    <div class="min-w-0">
                      <span class="block font-semibold text-zinc-100 text-xs">Trabalho</span>
                      <span class="block text-[10px] text-zinc-500 font-mono mt-0.5">
                        {{ repos.filter(r => r.folder === 'Trabalho').length }} itens
                      </span>
                    </div>
                  </div>

                  <!-- Estudos -->
                  <div
                    class="flex items-center gap-3 p-3 rounded-xl border border-white/[0.07] bg-zinc-900/30 hover:bg-zinc-900/60 transition cursor-pointer select-none"
                    :class="activeDragOverFolder === 'Estudos' ? 'border-emerald-400/50 bg-emerald-500/5 border-dashed' : ''"
                    @click="navigateToFolder('Estudos')"
                    @dragover.prevent="handleDragOver($event, 'Estudos')"
                    @dragleave="handleDragLeave($event, 'Estudos')"
                    @drop="handleDrop($event, 'Estudos')"
                  >
                    <div class="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <BookOpen class="w-4 h-4 text-emerald-400" />
                    </div>
                    <div class="min-w-0">
                      <span class="block font-semibold text-zinc-100 text-xs">Estudos</span>
                      <span class="block text-[10px] text-zinc-500 font-mono mt-0.5">
                        {{ repos.filter(r => r.folder === 'Estudos').length }} itens
                      </span>
                    </div>
                  </div>
                </div>

                <div class="border-b border-white/[0.06] my-4"></div>
              </div>

              <!-- Repositórios Header -->
              <p v-if="currentPath.length === 1 && !selectedLanguageFilter && !selectedYearFilter && !searchQuery" class="text-zinc-500 font-semibold uppercase tracking-wider text-[10px] mb-2.5">Repositórios</p>
              
              <!-- GRID VIEW -->
              <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-8 select-none">
                <div
                  v-for="repo in filteredRepos"
                  :key="repo.id"
                  draggable="true"
                  @dragstart="handleDragStart($event, repo)"
                  @dragend="draggedRepo = null"
                  @click="selectedRepo = repo"
                  class="flex flex-col border border-white/[0.08] bg-zinc-900/35 hover:bg-zinc-900/70 rounded-xl p-3.5 cursor-pointer transition select-none group relative"
                  :class="selectedRepo?.id === repo.id ? 'border-sky-500/60 bg-sky-950/20' : ''"
                >
                  <!-- Star toggle inside card -->
                  <button
                    @click.stop="toggleFavorite(repo)"
                    class="absolute top-3 right-3 text-zinc-500 hover:text-amber-400 transition p-1 cursor-pointer"
                    :class="repo.is_favorite ? 'text-amber-400 fill-amber-400/20' : 'opacity-0 group-hover:opacity-100'"
                    title="Favoritar"
                  >
                    <Star class="w-3.5 h-3.5" />
                  </button>

                  <!-- Card Title -->
                  <div class="flex items-center gap-2 mb-1.5 pr-6 min-w-0">
                    <Folder class="w-4 h-4 text-sky-400 fill-sky-400/10 shrink-0" />
                    <h4 class="font-semibold text-zinc-100 text-xs truncate">{{ repo.name }}</h4>
                  </div>

                  <!-- Description -->
                  <p class="text-zinc-400 text-[11px] leading-relaxed mb-3 line-clamp-2 min-h-8">
                    {{ repo.description || 'Sem descrição.' }}
                  </p>

                  <!-- Footer Row -->
                  <div class="mt-auto pt-2 border-t border-white/[0.05] flex items-center justify-between text-[10px] text-zinc-500">
                    <div class="flex items-center gap-2.5">
                      <span class="flex items-center gap-1.5 font-medium text-zinc-400">
                        <span class="w-1.5 h-1.5 rounded-full" :class="getLanguageDotColor(repo.language)"></span>
                        {{ repo.language || 'Outro' }}
                      </span>
                      <span class="flex items-center gap-0.5 text-zinc-400 font-mono">
                        <Star class="w-2.5 h-2.5 text-amber-400 fill-amber-400/20" />
                        {{ repo.stars }}
                      </span>
                    </div>

                    <span class="font-mono text-[9px] text-zinc-500">
                      {{ timeAgo(repo.updated_at) }}
                    </span>
                  </div>

                </div>
              </div>

              <!-- LIST VIEW -->
              <div v-else class="flex flex-col border border-white/[0.08] bg-zinc-900/20 rounded-xl overflow-hidden mb-8 select-none">
                <table class="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr class="border-b border-white/[0.08] bg-zinc-900/50 text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">
                      <th class="py-2 px-3">Nome</th>
                      <th class="py-2 px-3 hidden sm:table-cell">Descrição</th>
                      <th class="py-2 px-3">Linguagem</th>
                      <th class="py-2 px-3 text-center">⭐</th>
                      <th class="py-2 px-3 text-right">Atualizado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="repo in filteredRepos"
                      :key="repo.id"
                      draggable="true"
                      @dragstart="handleDragStart($event, repo)"
                      @dragend="draggedRepo = null"
                      @click="selectedRepo = repo"
                      class="border-b border-white/[0.04] hover:bg-white/[0.04] cursor-pointer transition select-none group"
                      :class="selectedRepo?.id === repo.id ? 'bg-sky-950/20' : ''"
                    >
                      <td class="py-2.5 px-3 font-medium text-zinc-200">
                        <div class="flex items-center gap-2 max-w-[200px] truncate">
                          <Folder class="w-3.5 h-3.5 text-sky-400 fill-sky-400/10 shrink-0" />
                          <span class="truncate">{{ repo.name }}</span>
                          <Star v-if="repo.is_favorite" class="w-3 h-3 text-amber-400 fill-amber-400/20 shrink-0" />
                        </div>
                      </td>

                      <td class="py-2.5 px-3 text-zinc-400 hidden sm:table-cell max-w-xs truncate">
                        {{ repo.description || 'Sem descrição.' }}
                      </td>

                      <td class="py-2.5 px-3 text-zinc-400">
                        <span class="flex items-center gap-1.5">
                          <span class="w-1.5 h-1.5 rounded-full" :class="getLanguageDotColor(repo.language)"></span>
                          {{ repo.language || 'Outro' }}
                        </span>
                      </td>

                      <td class="py-2.5 px-3 font-mono text-center text-zinc-300">
                        {{ repo.stars }}
                      </td>

                      <td class="py-2.5 px-3 text-right text-zinc-500 font-mono">
                        {{ timeAgo(repo.updated_at) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Empty state -->
              <div v-if="filteredRepos.length === 0" class="py-16 flex flex-col items-center justify-center text-zinc-500 gap-1.5">
                <Folder class="w-8 h-8 stroke-[1] text-zinc-600" />
                <span class="font-medium text-xs text-zinc-400">Nenhum repositório encontrado</span>
              </div>

            </template>

          </div>
        </div>

        <!-- Detail Sidebar Panel (macOS Inspector Style & Mobile Responsive Fullscreen Overlay) -->
        <Transition name="drawer-slide">
          <div 
            v-if="selectedRepo" 
            class="fixed inset-0 z-50 md:static md:w-[280px] border-l border-white/[0.08] bg-[#0c0d11]/95 md:bg-[#0a0b0e]/80 backdrop-blur-xl p-4.5 flex flex-col gap-4 shrink-0 overflow-y-auto select-none"
          >
            <!-- Drawer Header -->
            <div class="flex items-start justify-between border-b border-white/[0.08] pb-3">
              <div class="min-w-0 pr-2">
                <div class="flex items-center gap-1.5 mb-1">
                  <span class="text-[9px] font-semibold bg-white/[0.06] px-1.5 py-0.5 rounded text-zinc-300">
                    {{ selectedRepo.language || 'Outro' }}
                  </span>
                  <span v-if="selectedRepo.is_favorite" class="text-[9px] font-semibold bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded text-amber-400 flex items-center gap-0.5">
                    <Star class="w-2.5 h-2.5 fill-amber-400/20" /> Destaque
                  </span>
                </div>
                <h3 class="font-bold text-zinc-100 text-sm break-words select-text">{{ selectedRepo.name }}</h3>
              </div>
              <button
                @click="selectedRepo = null"
                class="p-1.5 rounded-lg hover:bg-white/[0.08] text-zinc-400 hover:text-white cursor-pointer transition shrink-0"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Description -->
            <div class="flex flex-col gap-1">
              <span class="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">Descrição</span>
              <p class="text-zinc-300 text-xs leading-relaxed select-text">
                {{ selectedRepo.description || 'Nenhuma descrição fornecida.' }}
              </p>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-2">
              <div class="bg-zinc-900/60 border border-white/[0.06] rounded-lg p-2.5 flex flex-col gap-0.5">
                <span class="text-[8px] font-semibold text-zinc-500 uppercase tracking-wider">Estrelas</span>
                <span class="text-xs font-mono font-semibold text-zinc-200 flex items-center gap-1">
                  <Star class="w-3 h-3 text-amber-400 fill-amber-400/20" /> {{ selectedRepo.stars }}
                </span>
              </div>
              <div class="bg-zinc-900/60 border border-white/[0.06] rounded-lg p-2.5 flex flex-col gap-0.5">
                <span class="text-[8px] font-semibold text-zinc-500 uppercase tracking-wider">Forks</span>
                <span class="text-xs font-mono font-semibold text-zinc-200 flex items-center gap-1">
                  <FileCode2 class="w-3 h-3 text-sky-400" /> {{ selectedRepo.forks }}
                </span>
              </div>
            </div>

            <!-- Language Breakdown Bar -->
            <div class="flex flex-col gap-1.5">
              <span class="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">Linguagens</span>
              <div class="h-1.5 rounded-full overflow-hidden bg-white/5 flex">
                <div
                  v-for="prop in getMockLanguagesProportions(selectedRepo.language)"
                  :key="prop.name"
                  :style="{ width: prop.percentage + '%', backgroundColor: prop.color }"
                  class="h-full"
                ></div>
              </div>
              <div class="flex flex-wrap gap-x-3 gap-y-1 text-[9px] mt-0.5">
                <div
                  v-for="prop in getMockLanguagesProportions(selectedRepo.language)"
                  :key="'legend-' + prop.name"
                  class="flex items-center gap-1 text-zinc-400"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: prop.color }"></span>
                  <span>{{ prop.name }} <span class="text-zinc-500 font-mono">({{ prop.percentage }}%)</span></span>
                </div>
              </div>
            </div>

            <!-- Topics -->
            <div v-if="selectedRepo.topics && selectedRepo.topics.length" class="flex flex-col gap-1.5">
              <span class="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">Tópicos</span>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="topic in selectedRepo.topics"
                  :key="topic"
                  class="bg-white/[0.06] text-zinc-300 border border-white/[0.06] px-2 py-0.5 rounded-md text-[9px] font-medium"
                >
                  {{ topic }}
                </span>
              </div>
            </div>

            <!-- Timestamps -->
            <div class="flex flex-col gap-1 text-[10px] text-zinc-400 bg-zinc-900/40 border border-white/[0.06] rounded-lg p-2.5">
              <div class="flex justify-between">
                <span>Criado:</span>
                <span class="text-zinc-300 font-medium">{{ formatDate(selectedRepo.created_at) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Atualizado:</span>
                <span class="text-zinc-300 font-medium">{{ formatDate(selectedRepo.updated_at) }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col gap-2 mt-auto pt-3 border-t border-white/[0.08] shrink-0">
              <div class="flex gap-2">
                <button
                  @click="toggleFavorite(selectedRepo)"
                  class="flex-1 py-1.5 px-2.5 border rounded-lg cursor-pointer transition text-[11px] font-semibold flex items-center justify-center gap-1.5"
                  :class="selectedRepo.is_favorite ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'border-white/10 text-zinc-300 hover:bg-white/[0.05]'"
                >
                  <Star class="w-3.5 h-3.5" :class="selectedRepo.is_favorite ? 'fill-amber-400/20' : ''" />
                  <span>{{ selectedRepo.is_favorite ? 'Favoritado' : 'Favoritar' }}</span>
                </button>

                <select
                  :value="selectedRepo.folder"
                  @change="moveRepoToFolder(selectedRepo, ($event.target as HTMLSelectElement).value as any || null)"
                  class="bg-zinc-900 border border-white/10 text-zinc-300 text-[11px] font-medium rounded-lg px-2 py-1.5 outline-none cursor-pointer"
                >
                  <option :value="null">Pasta: Raiz</option>
                  <option value="Trabalho">Trabalho</option>
                  <option value="Estudos">Estudos</option>
                </select>
              </div>

              <a
                v-if="selectedRepo.homepage"
                :href="selectedRepo.homepage"
                target="_blank"
                class="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-1.5 rounded-lg text-center flex items-center justify-center gap-1.5 transition text-[11px] shadow-sm"
              >
                <ExternalLink class="w-3.5 h-3.5" />
                <span>Abrir Demo</span>
              </a>

              <a
                :href="selectedRepo.url"
                target="_blank"
                class="w-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-200 font-medium py-1.5 rounded-lg text-center flex items-center justify-center gap-1.5 transition text-[11px]"
              >
                <ExternalLink class="w-3.5 h-3.5" />
                <span>Ver no GitHub</span>
              </a>
            </div>

          </div>
        </Transition>

      </div>

    </div>

  </div>
</template>

<style scoped>
/* Clean scrollbar */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
  opacity: 0.8;
}

.scrollbar-none {
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
