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
  Code,
  Calendar,
  AlertCircle,
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
      // Deselect or update selected repo in drawer
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
    if (diffHours === 0) return 'Atualizado agora'
    return `Atualizado há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
  }
  if (diffDays === 1) return 'Atualizado ontem'
  if (diffDays < 30) return `Atualizado há ${diffDays} dias`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths === 1) return 'Atualizado há 1 mês'
  if (diffMonths < 12) return `Atualizado há ${diffMonths} meses`
  const diffYears = Math.floor(diffMonths / 12)
  return `Atualizado há ${diffYears} ${diffYears === 1 ? 'ano' : 'anos'}`
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Language color mapping
const getLanguageColorClass = (lang: string) => {
  const l = (lang || '').toLowerCase()
  if (l === 'typescript') return 'text-blue-400'
  if (l === 'javascript') return 'text-yellow-400'
  if (l === 'python') return 'text-amber-500'
  if (l === 'go') return 'text-cyan-400'
  if (l === 'shell' || l === 'bash') return 'text-emerald-400'
  if (l === 'vue') return 'text-teal-400'
  if (l === 'html' || l === 'css') return 'text-orange-500'
  return 'text-purple-400'
}

// Sidebar list calculations
const availableLanguages = computed(() => {
  const langs = new Set<string>()
  repos.value.forEach(r => {
    if (r.language && r.language !== 'Other') langs.add(r.language)
  })
  return Array.from(langs).sort()
})

const availableYears = computed(() => {
  const years = new Set<string>()
  repos.value.forEach(r => {
    if (r.created_at) {
      const year = new Date(r.created_at).getFullYear().toString()
      years.add(year)
    }
  })
  return Array.from(years).sort((a, b) => b.localeCompare(a))
})

// Mocks proportion of languages based on main language for design aesthetics
const getMockLanguagesProportions = (mainLang: string) => {
  const l = (mainLang || '').toLowerCase()
  if (l === 'typescript') {
    return [
      { name: 'TypeScript', percentage: 78, color: '#3178c6' },
      { name: 'JavaScript', percentage: 16, color: '#f1e05a' },
      { name: 'HTML/CSS', percentage: 6, color: '#e34c26' }
    ]
  }
  if (l === 'javascript') {
    return [
      { name: 'JavaScript', percentage: 84, color: '#f1e05a' },
      { name: 'HTML', percentage: 10, color: '#e34c26' },
      { name: 'CSS', percentage: 6, color: '#563d7c' }
    ]
  }
  if (l === 'python') {
    return [
      { name: 'Python', percentage: 92, color: '#3572A5' },
      { name: 'Shell', percentage: 5, color: '#89e051' },
      { name: 'Other', percentage: 3, color: '#8b949e' }
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
  if (l === 'html' || l === 'css') {
    return [
      { name: 'HTML', percentage: 55, color: '#e34c26' },
      { name: 'CSS', percentage: 40, color: '#563d7c' },
      { name: 'JavaScript', percentage: 5, color: '#f1e05a' }
    ]
  }
  return [
    { name: mainLang || 'Other', percentage: 80, color: '#6366f1' },
    { name: 'Others', percentage: 20, color: '#4b5563' }
  ]
}

// Navigation & Filters helper
const activeFolderName = computed(() => {
  return currentPath.value.length > 1 ? currentPath.value[1] : null
})

// Main filtering logic
const filteredRepos = computed(() => {
  let list = [...repos.value]

  // 1. Folder Navigation filter
  const folder = activeFolderName.value
  if (folder === 'Destaques') {
    list = list.filter(r => r.is_favorite)
  } else if (folder === 'Trabalho') {
    list = list.filter(r => r.folder === 'Trabalho')
  } else if (folder === 'Estudos') {
    list = list.filter(r => r.folder === 'Estudos')
  } else {
    // Root level (Home): hides repos categorized inside Trabalho or Estudos (keeps folder-like behavior)
    list = list.filter(r => r.folder === null)
  }

  // 2. Language Filter
  if (selectedLanguageFilter.value) {
    list = list.filter(r => r.language === selectedLanguageFilter.value)
  }

  // 3. Year Filter
  if (selectedYearFilter.value) {
    list = list.filter(r => r.created_at && new Date(r.created_at).getFullYear().toString() === selectedYearFilter.value)
  }

  // 4. Text Search Filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(r => 
      r.name.toLowerCase().includes(q) || 
      (r.description || '').toLowerCase().includes(q) ||
      r.topics.some(t => t.toLowerCase().includes(q))
    )
  }

  // 5. Sorting
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

// Chips of languages present in current view
const currentViewLanguages = computed(() => {
  const langs = new Set<string>()
  // Calculate based on all repos (ignoring current language chip filter to allow selection)
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

// Navigation operations
const navigateToFolder = (folder: string) => {
  currentPath.value = ['Home', folder]
  selectedRepo.value = null
  // We keep language/year filters or reset them? Usually keep, but let's clear year filter for clean layout
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

// Drag & Drop HTML5 Handler functions
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
  <div class="flex-grow flex h-full bg-[#141218]/95 text-gray-300 font-sans text-xs select-none relative overflow-hidden">
    
    <!-- Sidebar -->
    <div class="w-[200px] bg-[#0c0a0f]/60 border-r border-white/5 p-4 flex flex-col gap-6 shrink-0 overflow-y-auto">
      
      <!-- Shortcuts Section -->
      <div>
        <p class="text-gray-500 uppercase font-bold tracking-wider text-[9px] mb-2 px-2 select-none">Favoritos & Atalhos</p>
        <ul class="flex flex-col gap-1">
          <li
            class="flex items-center justify-between py-1.5 px-2.5 rounded-lg cursor-pointer transition hover:bg-white/5 hover:text-white"
            :class="currentPath.length === 1 ? 'bg-indigo-500/15 text-indigo-300 font-semibold' : ''"
            @click="handleSidebarShortcut('all')"
          >
            <div class="flex items-center gap-2">
              <Home class="w-4 h-4 text-indigo-400" />
              <span>Todos os Repos</span>
            </div>
            <span class="text-[9px] bg-white/5 px-1.5 py-0.5 rounded-full text-gray-400 font-mono">{{ repos.length }}</span>
          </li>
          
          <li
            class="flex items-center justify-between py-1.5 px-2.5 rounded-lg cursor-pointer transition hover:bg-white/5 hover:text-white"
            :class="activeFolderName === 'Destaques' ? 'bg-amber-500/15 text-amber-300 font-semibold' : ''"
            @click="handleSidebarShortcut('favorites')"
          >
            <div class="flex items-center gap-2">
              <Star class="w-4 h-4 text-amber-400 fill-amber-400/20" />
              <span>Destaques</span>
            </div>
            <span class="text-[9px] bg-white/5 px-1.5 py-0.5 rounded-full text-gray-400 font-mono">
              {{ repos.filter(r => r.is_favorite).length }}
            </span>
          </li>
        </ul>
      </div>

      <!-- Categories Folders Section -->
      <div>
        <p class="text-gray-500 uppercase font-bold tracking-wider text-[9px] mb-2 px-2 select-none">Pastas</p>
        <ul class="flex flex-col gap-1">
          <li
            class="flex items-center justify-between py-1.5 px-2.5 rounded-lg cursor-pointer transition hover:bg-white/5 hover:text-white"
            :class="activeFolderName === 'Trabalho' ? 'bg-indigo-500/15 text-indigo-300 font-semibold' : ''"
            @click="handleSidebarShortcut('folder', 'Trabalho')"
          >
            <div class="flex items-center gap-2">
              <Briefcase class="w-4 h-4 text-indigo-400" />
              <span>Trabalho</span>
            </div>
            <span class="text-[9px] bg-white/5 px-1.5 py-0.5 rounded-full text-gray-400 font-mono">
              {{ repos.filter(r => r.folder === 'Trabalho').length }}
            </span>
          </li>

          <li
            class="flex items-center justify-between py-1.5 px-2.5 rounded-lg cursor-pointer transition hover:bg-white/5 hover:text-white"
            :class="activeFolderName === 'Estudos' ? 'bg-emerald-500/15 text-emerald-300 font-semibold' : ''"
            @click="handleSidebarShortcut('folder', 'Estudos')"
          >
            <div class="flex items-center gap-2">
              <BookOpen class="w-4 h-4 text-emerald-400" />
              <span>Estudos</span>
            </div>
            <span class="text-[9px] bg-white/5 px-1.5 py-0.5 rounded-full text-gray-400 font-mono">
              {{ repos.filter(r => r.folder === 'Estudos').length }}
            </span>
          </li>
        </ul>
      </div>

      <!-- Languages Section -->
      <div v-if="availableLanguages.length">
        <p class="text-gray-500 uppercase font-bold tracking-wider text-[9px] mb-2 px-2 select-none">Por Linguagem</p>
        <ul class="flex flex-col gap-1">
          <li
            v-for="lang in availableLanguages"
            :key="lang"
            class="flex items-center justify-between py-1.5 px-2.5 rounded-lg cursor-pointer transition hover:bg-white/5 hover:text-white"
            :class="selectedLanguageFilter === lang ? 'bg-purple-500/15 text-purple-300 font-semibold' : ''"
            @click="selectedLanguageFilter = selectedLanguageFilter === lang ? null : lang"
          >
            <div class="flex items-center gap-2 truncate">
              <Code class="w-4 h-4 shrink-0" :class="getLanguageColorClass(lang)" />
              <span class="truncate">{{ lang }}</span>
            </div>
            <span class="text-[9px] bg-white/5 px-1.5 py-0.5 rounded-full text-gray-400 font-mono shrink-0 ml-1">
              {{ repos.filter(r => r.language === lang).length }}
            </span>
          </li>
        </ul>
      </div>

      <!-- Years Section -->
      <div v-if="availableYears.length">
        <p class="text-gray-500 uppercase font-bold tracking-wider text-[9px] mb-2 px-2 select-none">Por Ano</p>
        <ul class="flex flex-col gap-1">
          <li
            v-for="year in availableYears"
            :key="year"
            class="flex items-center justify-between py-1.5 px-2.5 rounded-lg cursor-pointer transition hover:bg-white/5 hover:text-white"
            :class="selectedYearFilter === year ? 'bg-purple-500/15 text-purple-300 font-semibold' : ''"
            @click="selectedYearFilter = selectedYearFilter === year ? null : year"
          >
            <div class="flex items-center gap-2">
              <Calendar class="w-4 h-4 text-purple-400" />
              <span>Ano {{ year }}</span>
            </div>
            <span class="text-[9px] bg-white/5 px-1.5 py-0.5 rounded-full text-gray-400 font-mono">
              {{ repos.filter(r => r.created_at && new Date(r.created_at).getFullYear().toString() === year).length }}
            </span>
          </li>
        </ul>
      </div>

    </div>

    <!-- Main Explorer Section -->
    <div class="flex-grow flex flex-col min-w-0 bg-[#100e13]">
      
      <!-- Top Navigation & Search Toolbar -->
      <div class="h-12 border-b border-white/5 px-4 flex items-center justify-between bg-[#0c0a0f]/40 shrink-0 gap-4">
        
        <!-- Breadcrumb / Back button -->
        <div class="flex items-center gap-2.5 min-w-0">
          <button
            class="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:hover:bg-white/5 transition cursor-pointer shrink-0"
            :disabled="currentPath.length <= 1"
            @click="navigateBack"
            title="Voltar"
          >
            <ArrowLeft class="w-3.5 h-3.5" />
          </button>

          <div class="flex items-center gap-1 text-[11px] text-gray-400 overflow-x-auto py-1 select-none whitespace-nowrap scrollbar-none">
            <template v-for="(node, idx) in currentPath" :key="idx">
              <ChevronRight v-if="idx > 0" class="w-3.5 h-3.5 shrink-0 text-gray-600" />
              <span
                class="hover:text-white cursor-pointer truncate font-medium max-w-[120px]"
                :class="idx === currentPath.length - 1 ? 'text-gray-200 font-bold' : ''"
                @click="currentPath = currentPath.slice(0, idx + 1); selectedRepo = null"
              >
                {{ node === 'Home' && activeFolderName ? 'Home' : node }}
              </span>
            </template>
            <span v-if="selectedLanguageFilter" class="text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded-md text-[9px] ml-2">
              Linguagem: {{ selectedLanguageFilter }}
            </span>
            <span v-if="selectedYearFilter" class="text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded-md text-[9px] ml-1">
              Ano: {{ selectedYearFilter }}
            </span>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="relative w-48 sm:w-60 md:w-72 shrink-0">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Pesquisar repositórios..."
            class="w-full bg-[#18161d] border border-white/5 rounded-lg pl-9 pr-8 py-1.5 text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-purple-500/35 focus:ring-1 focus:ring-purple-500/10 select-text"
          />
          <button 
            v-if="searchQuery" 
            @click="searchQuery = ''" 
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer rounded-full p-0.5 hover:bg-white/10"
          >
            <X class="w-3 h-3" />
          </button>
        </div>

        <!-- Toolbar Buttons (Sort, View Mode, Refresh) -->
        <div class="flex items-center gap-2 shrink-0 select-none">
          <!-- Refresh -->
          <button
            class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer flex items-center justify-center shrink-0 border border-transparent active:scale-95"
            :class="loading ? 'animate-spin text-purple-400' : ''"
            :disabled="loading"
            @click="fetchRepos(true)"
            title="Sincronizar do GitHub"
          >
            <RefreshCw class="w-3.5 h-3.5" />
          </button>

          <!-- Sorting Select -->
          <div class="relative">
            <select
              v-model="sortBy"
              class="bg-[#18161d] border border-white/5 text-gray-300 hover:text-white text-[11px] rounded-lg px-2 py-1.5 outline-none cursor-pointer focus:border-purple-500/30 hover:bg-[#1d1b22] pr-1.5"
            >
              <option value="recent">Mais Recentes</option>
              <option value="oldest">Mais Antigos</option>
              <option value="stars">Mais Estrelas</option>
              <option value="name">Nome A-Z</option>
            </select>
          </div>

          <!-- View Mode Toggle -->
          <div class="flex bg-[#18161d] p-0.5 rounded-lg border border-white/5">
            <button
              class="p-1 rounded cursor-pointer transition"
              :class="viewMode === 'grid' ? 'bg-[#25232c] text-white' : 'text-gray-500 hover:text-gray-300'"
              @click="viewMode = 'grid'"
              title="Visualização em Grade"
            >
              <Grid class="w-3.5 h-3.5" />
            </button>
            <button
              class="p-1 rounded cursor-pointer transition"
              :class="viewMode === 'list' ? 'bg-[#25232c] text-white' : 'text-gray-500 hover:text-gray-300'"
              @click="viewMode = 'list'"
              title="Visualização em Lista"
            >
              <ListIcon class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      <!-- Main Directory Contents -->
      <div class="flex-grow flex overflow-hidden">
        
        <!-- Files Grid/List Area -->
        <div class="flex-grow flex flex-col overflow-hidden">
          
          <!-- Chips Area (Language quick filter) -->
          <div v-if="currentViewLanguages.length > 1" class="px-5 py-2.5 border-b border-white/5 flex gap-1.5 overflow-x-auto select-none scrollbar-none shrink-0 bg-[#0c0a0f]/20">
            <button
              class="px-2.5 py-1 rounded-full border transition cursor-pointer text-[10px] font-medium"
              :class="!selectedLanguageFilter ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:text-white'"
              @click="selectedLanguageFilter = null"
            >
              Todas
            </button>
            <button
              v-for="lang in currentViewLanguages"
              :key="'chip-' + lang"
              class="px-2.5 py-1 rounded-full border transition cursor-pointer text-[10px] font-medium flex items-center gap-1.5 whitespace-nowrap"
              :class="selectedLanguageFilter === lang ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:text-white'"
              @click="selectedLanguageFilter = selectedLanguageFilter === lang ? null : lang"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="getLanguageColorClass(lang).replace('text-', 'bg-')"></span>
              {{ lang }}
            </button>
          </div>

          <!-- List Scroll Container -->
          <div class="flex-grow overflow-y-auto p-5 select-none relative">
            
            <!-- Loading Indicator -->
            <div v-if="loading && repos.length === 0" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#100e13]/60 backdrop-blur-xs z-50">
              <RefreshCw class="w-10 h-10 animate-spin text-purple-400" />
              <span class="text-xs text-gray-400 font-semibold animate-pulse uppercase tracking-wider">Buscando repositórios no GitHub...</span>
            </div>

            <!-- Error State -->
            <div v-if="error && repos.length === 0" class="flex flex-col items-center justify-center py-16 gap-3 text-red-400">
              <AlertCircle class="w-10 h-10" />
              <div class="text-center">
                <p class="font-bold text-xs">Não foi possível carregar os repositórios</p>
                <p class="text-[10px] text-gray-500 mt-1 max-w-[280px] leading-relaxed">{{ error }}</p>
              </div>
              <button @click="fetchRepos()" class="mt-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 rounded-lg cursor-pointer transition text-xs font-semibold">
                Tentar novamente
              </button>
            </div>

            <template v-if="repos.length > 0">
              
              <!-- 1. SPECIAL FOLDERS ROW (Only displayed at Root folder 'Home') -->
              <div v-if="currentPath.length === 1 && !selectedLanguageFilter && !selectedYearFilter && !searchQuery" class="mb-6 select-none">
                <p class="text-gray-500 font-bold uppercase tracking-wider text-[9px] mb-3 select-none">Pastas Especiais</p>
                
                <div class="grid grid-cols-3 gap-4">
                  <!-- Destaques Folder -->
                  <div
                    class="flex flex-col sm:flex-row items-center gap-3 p-3 sm:py-3.5 sm:px-4 rounded-xl border border-white/5 bg-gradient-to-b from-[#18161d] to-[#121015] hover:from-[#1b1922] hover:to-[#16141a] transition cursor-pointer select-none relative group"
                    :class="[
                      activeDragOverFolder === 'Destaques' ? 'border-amber-400/50 bg-amber-500/5 shadow-md shadow-amber-500/5 scale-102 border-dashed' : 'hover:border-amber-500/25 hover:shadow-lg hover:shadow-amber-500/5'
                    ]"
                    @dblclick="navigateToFolder('Destaques')"
                    @click="navigateToFolder('Destaques')"
                    @dragover.prevent="handleDragOver($event, 'Destaques')"
                    @dragleave="handleDragLeave($event, 'Destaques')"
                    @drop="handleDrop($event, 'Destaques')"
                  >
                    <!-- Folder Icon w/ Badge -->
                    <div class="relative w-12 h-12 flex items-center justify-center shrink-0">
                      <Folder class="w-12 h-12 text-amber-500 stroke-[1.2] fill-amber-500/5" />
                      <Star class="absolute w-4 h-4 text-amber-900 fill-amber-400 top-[18px]" />
                    </div>
                    <div class="text-center sm:text-left min-w-0 select-none">
                      <span class="block font-bold text-gray-200 text-xs">Destaques</span>
                      <span class="block text-[9px] text-gray-500 font-mono mt-0.5">
                        {{ repos.filter(r => r.is_favorite).length }} itens
                      </span>
                    </div>
                  </div>

                  <!-- Trabalho Folder -->
                  <div
                    class="flex flex-col sm:flex-row items-center gap-3 p-3 sm:py-3.5 sm:px-4 rounded-xl border border-white/5 bg-gradient-to-b from-[#18161d] to-[#121015] hover:from-[#1b1922] hover:to-[#16141a] transition cursor-pointer select-none relative group"
                    :class="[
                      activeDragOverFolder === 'Trabalho' ? 'border-indigo-400/50 bg-indigo-500/5 shadow-md shadow-indigo-500/5 scale-102 border-dashed' : 'hover:border-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/5'
                    ]"
                    @dblclick="navigateToFolder('Trabalho')"
                    @click="navigateToFolder('Trabalho')"
                    @dragover.prevent="handleDragOver($event, 'Trabalho')"
                    @dragleave="handleDragLeave($event, 'Trabalho')"
                    @drop="handleDrop($event, 'Trabalho')"
                  >
                    <div class="relative w-12 h-12 flex items-center justify-center shrink-0">
                      <Folder class="w-12 h-12 text-indigo-400 stroke-[1.2] fill-indigo-500/5" />
                      <Briefcase class="absolute w-4 h-4 text-indigo-200 top-[18px]" />
                    </div>
                    <div class="text-center sm:text-left min-w-0 select-none">
                      <span class="block font-bold text-gray-200 text-xs">Trabalho</span>
                      <span class="block text-[9px] text-gray-500 font-mono mt-0.5">
                        {{ repos.filter(r => r.folder === 'Trabalho').length }} itens
                      </span>
                    </div>
                  </div>

                  <!-- Estudos Folder -->
                  <div
                    class="flex flex-col sm:flex-row items-center gap-3 p-3 sm:py-3.5 sm:px-4 rounded-xl border border-white/5 bg-gradient-to-b from-[#18161d] to-[#121015] hover:from-[#1b1922] hover:to-[#16141a] transition cursor-pointer select-none relative group"
                    :class="[
                      activeDragOverFolder === 'Estudos' ? 'border-emerald-400/50 bg-emerald-500/5 shadow-md shadow-emerald-500/5 scale-102 border-dashed' : 'hover:border-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/5'
                    ]"
                    @dblclick="navigateToFolder('Estudos')"
                    @click="navigateToFolder('Estudos')"
                    @dragover.prevent="handleDragOver($event, 'Estudos')"
                    @dragleave="handleDragLeave($event, 'Estudos')"
                    @drop="handleDrop($event, 'Estudos')"
                  >
                    <div class="relative w-12 h-12 flex items-center justify-center shrink-0">
                      <Folder class="w-12 h-12 text-emerald-400 stroke-[1.2] fill-emerald-500/5" />
                      <BookOpen class="absolute w-4 h-4 text-emerald-200 top-[18px]" />
                    </div>
                    <div class="text-center sm:text-left min-w-0 select-none">
                      <span class="block font-bold text-gray-200 text-xs">Estudos</span>
                      <span class="block text-[9px] text-gray-500 font-mono mt-0.5">
                        {{ repos.filter(r => r.folder === 'Estudos').length }} itens
                      </span>
                    </div>
                  </div>
                </div>

                <div class="border-b border-white/5 my-6"></div>
              </div>

              <!-- 2. REPOSITORIES CARDS CONTAINER -->
              <p v-if="currentPath.length === 1 && !selectedLanguageFilter && !selectedYearFilter && !searchQuery" class="text-gray-500 font-bold uppercase tracking-wider text-[9px] mb-3 select-none">Repositórios Avulsos</p>
              
              <!-- GRID VIEW MODE -->
              <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-12 select-none">
                <div
                  v-for="repo in filteredRepos"
                  :key="repo.id"
                  draggable="true"
                  @dragstart="handleDragStart($event, repo)"
                  @dragend="draggedRepo = null"
                  @click="selectedRepo = repo"
                  class="flex flex-col border border-white/5 bg-[#141217]/50 rounded-xl p-4 cursor-pointer hover:bg-white/[0.03] select-none hover:border-purple-500/35 hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-0.5 transition duration-200 relative group"
                  :class="selectedRepo?.id === repo.id ? 'border-purple-500 bg-purple-500/5 shadow-md shadow-purple-500/5' : ''"
                >
                  <!-- Star toggle inside card top right -->
                  <button
                    @click.stop="toggleFavorite(repo)"
                    class="absolute top-3.5 right-3.5 text-gray-600 hover:text-amber-400 active:scale-95 transition rounded-full p-1 hover:bg-white/5 opacity-0 group-hover:opacity-100 cursor-pointer"
                    :class="repo.is_favorite ? 'opacity-100 text-amber-400 fill-amber-400/20' : ''"
                    title="Favoritar"
                  >
                    <Star class="w-3.5 h-3.5" />
                  </button>

                  <!-- Card Title (Name with Lang Folder Icon) -->
                  <div class="flex items-center gap-2 mb-2 select-none pr-5 min-w-0">
                    <Folder class="w-4.5 h-4.5 shrink-0 fill-current/10" :class="getLanguageColorClass(repo.language)" />
                    <h4 class="font-bold text-gray-200 text-xs truncate select-none leading-none pt-0.5">{{ repo.name }}</h4>
                  </div>

                  <!-- Description -->
                  <p class="text-gray-400 text-[10px] leading-relaxed mb-4 line-clamp-2 h-7.5 select-none select-none-safe">
                    {{ repo.description || 'Nenhuma descrição fornecida.' }}
                  </p>

                  <!-- Details Row -->
                  <div class="mt-auto pt-2.5 border-t border-white/5 flex items-center justify-between text-[9px] text-gray-500 select-none">
                    <div class="flex items-center gap-3">
                      <!-- Language -->
                      <span class="flex items-center gap-1.5 font-medium text-gray-400">
                        <span class="w-1.5 h-1.5 rounded-full" :class="getLanguageColorClass(repo.language).replace('text-', 'bg-')"></span>
                        {{ repo.language || 'Other' }}
                      </span>
                      <!-- Stars -->
                      <span class="flex items-center gap-0.5 hover:text-amber-400 font-mono">
                        <Star class="w-3 h-3 text-amber-400 fill-amber-400/20" />
                        {{ repo.stars }}
                      </span>
                    </div>

                    <!-- Updated Date -->
                    <span class="font-sans text-[9px] font-medium text-gray-500">
                      {{ timeAgo(repo.updated_at) }}
                    </span>
                  </div>

                </div>
              </div>

              <!-- LIST VIEW MODE -->
              <div v-else class="flex flex-col border border-white/5 bg-[#141217]/30 rounded-xl overflow-hidden mb-12 select-none">
                <table class="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr class="border-b border-white/5 bg-[#0c0a0f]/40 text-gray-500 text-[10px] font-bold uppercase tracking-wider select-none">
                      <th class="py-2.5 px-4">Nome</th>
                      <th class="py-2.5 px-4 hidden sm:table-cell">Descrição</th>
                      <th class="py-2.5 px-4">Linguagem</th>
                      <th class="py-2.5 px-4 font-mono text-center">⭐</th>
                      <th class="py-2.5 px-4 text-right">Atualizado</th>
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
                      class="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition select-none group"
                      :class="selectedRepo?.id === repo.id ? 'bg-purple-500/5' : ''"
                    >
                      <!-- Name -->
                      <td class="py-3 px-4 font-bold text-gray-200">
                        <div class="flex items-center gap-2 max-w-[200px] truncate">
                          <Folder class="w-4 h-4 shrink-0 fill-current/10" :class="getLanguageColorClass(repo.language)" />
                          <span class="truncate">{{ repo.name }}</span>
                          <Star v-if="repo.is_favorite" class="w-3 h-3 text-amber-400 fill-amber-400/20 shrink-0" />
                        </div>
                      </td>

                      <!-- Description -->
                      <td class="py-3 px-4 text-gray-400 hidden sm:table-cell max-w-xs truncate select-none-safe">
                        {{ repo.description || 'Nenhuma descrição fornecida.' }}
                      </td>

                      <!-- Language -->
                      <td class="py-3 px-4 text-gray-400">
                        <span class="flex items-center gap-1.5">
                          <span class="w-1.5 h-1.5 rounded-full" :class="getLanguageColorClass(repo.language).replace('text-', 'bg-')"></span>
                          {{ repo.language || 'Other' }}
                        </span>
                      </td>

                      <!-- Stars -->
                      <td class="py-3 px-4 font-mono text-center text-gray-300">
                        {{ repo.stars }}
                      </td>

                      <!-- Date -->
                      <td class="py-3 px-4 text-right text-gray-500">
                        {{ timeAgo(repo.updated_at) }}
                      </td>

                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Empty Results Inside Folders -->
              <div v-if="filteredRepos.length === 0" class="py-20 flex flex-col items-center justify-center text-gray-500 gap-2">
                <Folder class="w-12 h-12 stroke-[1]" />
                <span class="font-bold text-xs">Nenhum repositório encontrado</span>
                <p class="text-[10px] text-gray-600 mt-0.5">Tente limpar a busca ou mudar os filtros.</p>
              </div>

            </template>

            <!-- Loading initial state -->
            <div v-else-if="!loading" class="py-20 flex flex-col items-center justify-center text-gray-500 gap-2">
              <Folder class="w-12 h-12 stroke-[1]" />
              <span class="font-bold text-xs">Nenhum repositório carregado</span>
              <button @click="fetchRepos()" class="mt-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 rounded-lg cursor-pointer transition text-xs font-semibold">
                Buscar dados
              </button>
            </div>

          </div>
        </div>

        <!-- Detail Sidebar Panel (Drawer) -->
        <Transition name="drawer-slide">
          <div v-if="selectedRepo" class="w-[280px] border-l border-white/5 bg-[#0a080d]/80 backdrop-blur-md p-5 flex flex-col gap-5 shrink-0 overflow-y-auto z-40 select-none">
            
            <!-- Drawer Header -->
            <div class="flex items-start justify-between border-b border-white/5 pb-4">
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 mb-1.5">
                  <span class="text-[9px] uppercase tracking-wider font-bold bg-white/5 px-2 py-0.5 rounded text-gray-400">
                    {{ selectedRepo.language || 'Other' }}
                  </span>
                  <span v-if="selectedRepo.is_favorite" class="text-[9px] uppercase tracking-wider font-extrabold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-amber-400 flex items-center gap-0.5">
                    <Star class="w-2.5 h-2.5 fill-amber-400/20" /> Destaque
                  </span>
                </div>
                <h3 class="font-black text-gray-200 text-sm break-words select-text">{{ selectedRepo.name }}</h3>
              </div>
              <button
                @click="selectedRepo = null"
                class="p-1 rounded-md hover:bg-white/5 text-gray-500 hover:text-white cursor-pointer transition shrink-0"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Description -->
            <div class="flex flex-col gap-1.5">
              <span class="text-[9px] font-bold uppercase tracking-wider text-gray-500 select-none">Descrição</span>
              <p class="text-gray-300 text-[11px] leading-relaxed select-text select-text-safe">
                {{ selectedRepo.description || 'Nenhuma descrição fornecida.' }}
              </p>
            </div>

            <!-- Stats (Stars & Forks) -->
            <div class="grid grid-cols-2 gap-3 select-none">
              <div class="bg-[#141217] border border-white/5 rounded-lg p-2.5 flex flex-col gap-0.5">
                <span class="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Estrelas</span>
                <span class="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                  <Star class="w-3.5 h-3.5 fill-amber-400/20" /> {{ selectedRepo.stars }}
                </span>
              </div>
              <div class="bg-[#141217] border border-white/5 rounded-lg p-2.5 flex flex-col gap-0.5">
                <span class="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Forks</span>
                <span class="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1">
                  <FileCode2 class="w-3.5 h-3.5" /> {{ selectedRepo.forks }}
                </span>
              </div>
            </div>

            <!-- Language Proportion Colored Bar -->
            <div class="flex flex-col gap-2 select-none">
              <span class="text-[9px] font-bold uppercase tracking-wider text-gray-500">Composição de Código</span>
              
              <!-- Colored proportional segment bar -->
              <div class="h-2 rounded-full overflow-hidden bg-white/5 flex">
                <div
                  v-for="prop in getMockLanguagesProportions(selectedRepo.language)"
                  :key="prop.name"
                  :style="{ width: prop.percentage + '%', backgroundColor: prop.color }"
                  class="h-full first:rounded-l-full last:rounded-r-full"
                  :title="prop.name + ': ' + prop.percentage + '%'"
                ></div>
              </div>

              <!-- Legend -->
              <div class="flex flex-wrap gap-x-3 gap-y-1.5 text-[9px] mt-0.5">
                <div
                  v-for="prop in getMockLanguagesProportions(selectedRepo.language)"
                  :key="'legend-' + prop.name"
                  class="flex items-center gap-1.5 text-gray-400 font-medium"
                >
                  <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: prop.color }"></span>
                  <span>{{ prop.name }} <span class="text-gray-500 font-mono text-[8px]">({{ prop.percentage }}%)</span></span>
                </div>
              </div>
            </div>

            <!-- Tags / Topics as badges -->
            <div v-if="selectedRepo.topics && selectedRepo.topics.length" class="flex flex-col gap-2 select-none">
              <span class="text-[9px] font-bold uppercase tracking-wider text-gray-500">Tópicos</span>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="topic in selectedRepo.topics"
                  :key="topic"
                  class="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full text-[9px] hover:bg-purple-500/20 transition cursor-default font-medium"
                >
                  {{ topic }}
                </span>
              </div>
            </div>

            <!-- Metadata Info list -->
            <div class="flex flex-col gap-2 text-[10px] leading-tight text-gray-400 bg-[#0c0a0f]/40 border border-white/5 rounded-lg p-3 select-none">
              <div class="flex justify-between border-b border-white/5 pb-1.5">
                <span>Criado em:</span>
                <span class="text-gray-200 font-medium">{{ formatDate(selectedRepo.created_at) }}</span>
              </div>
              <div class="flex justify-between pt-0.5">
                <span>Último commit:</span>
                <span class="text-gray-200 font-medium">{{ formatDate(selectedRepo.updated_at) }}</span>
              </div>
            </div>

            <!-- Markdown-like README Mockup Preview -->
            <div class="flex flex-col gap-2">
              <span class="text-[9px] font-bold uppercase tracking-wider text-gray-500">README.md Preview</span>
              <div class="bg-black/40 border border-white/5 rounded-lg p-3 font-sans text-xs text-gray-400 leading-relaxed overflow-y-auto max-h-40 select-text select-text-safe custom-scrollbar">
                <h1 class="text-xs font-black text-white mb-1.5 border-b border-white/10 pb-1 flex items-center gap-1 select-text"># {{ selectedRepo.name }}</h1>
                <p class="mb-2 select-text font-normal text-[11px]">{{ selectedRepo.description || 'Sem descrição.' }}</p>
                <div class="bg-black/30 p-2 rounded border border-white/5 font-mono text-[9px] text-emerald-400 mb-2 leading-normal select-text select-all">
                  git clone {{ selectedRepo.url }}.git
                </div>
                <p class="text-[9px] text-gray-500 italic select-none">Mocked content. Topics: {{ selectedRepo.topics.join(', ') || 'none' }}</p>
              </div>
            </div>

            <!-- Action Buttons (Favorite, Move, Open demo, view on Github) -->
            <div class="flex flex-col gap-2 mt-auto pt-4 border-t border-white/5 select-none shrink-0">
              
              <!-- Direct Actions -->
              <div class="flex gap-2">
                <!-- Toggle favorite button -->
                <button
                  @click="toggleFavorite(selectedRepo)"
                  class="flex-grow flex items-center justify-center gap-1.5 py-2 px-3 border border-white/10 rounded-lg cursor-pointer transition text-[11px] font-bold select-none"
                  :class="selectedRepo.is_favorite ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/15' : 'hover:bg-white/5 text-gray-300'"
                >
                  <Star class="w-3.5 h-3.5" :class="selectedRepo.is_favorite ? 'fill-amber-400/25' : ''" />
                  <span>{{ selectedRepo.is_favorite ? 'Favoritado' : 'Favoritar' }}</span>
                </button>

                <!-- Move folder dropdown -->
                <select
                  :value="selectedRepo.folder"
                  @change="moveRepoToFolder(selectedRepo, ($event.target as HTMLSelectElement).value as any || null)"
                  class="bg-[#18161d] border border-white/10 text-gray-300 text-[11px] font-bold rounded-lg px-2 py-2 outline-none cursor-pointer hover:bg-[#1d1b22] text-center w-28"
                >
                  <option :value="null">Pasta: Raiz</option>
                  <option value="Trabalho">Trabalho</option>
                  <option value="Estudos">Estudos</option>
                </select>
              </div>

              <!-- Homepage/Demo URL Button -->
              <a
                v-if="selectedRepo.homepage"
                :href="selectedRepo.homepage"
                target="_blank"
                class="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-lg text-center flex items-center justify-center gap-1.5 transition text-[11px] shadow-lg shadow-purple-600/15 select-none"
              >
                <ExternalLink class="w-3.5 h-3.5" />
                <span>Abrir Demo Online</span>
              </a>

              <!-- Github link button -->
              <a
                :href="selectedRepo.url"
                target="_blank"
                class="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-2 rounded-lg text-center flex items-center justify-center gap-1.5 transition text-[11px] select-none"
              >
                <ExternalLink class="w-3.5 h-3.5 text-indigo-400" />
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
/* Scrollbar Custom styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
}

.select-text-safe {
  user-select: text !important;
  -webkit-user-select: text !important;
}

/* Animations transitions */
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
  opacity: 0.8;
}

/* Hide scrollbar utility */
.scrollbar-none {
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
