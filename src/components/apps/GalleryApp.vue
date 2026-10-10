<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWindowStore } from '../../stores/windowStore'
import {
  Image,
  Calendar,
  MapPin,
  Heart,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  FolderOpen
} from 'lucide-vue-next'

const store = useWindowStore()

interface PhotoItem {
  id: string
  title: string
  date: string
  location: string
  category: 'events' | 'career' | 'personal'
  src: string
  description: string
  isFavorite: boolean
  camera?: string
}

const photos = ref<PhotoItem[]>([
  {
    id: 'google-hq',
    title: 'Google HQ · Visita Técnica',
    date: '2025',
    location: 'Google · Silicon Valley / SP',
    category: 'events',
    src: '/images/bern-google.png',
    description: 'Registro na sede do Google junto à icônica estátua do "G" multicolorido.',
    isFavorite: true,
    camera: 'Mobile RAW · 24mm f/1.8'
  },
  {
    id: 'linuxtips-local',
    title: 'LINUXtips Local Brasil com Jeferson Fernando',
    date: '2025',
    location: 'São Paulo, SP · Brasil',
    category: 'events',
    src: '/images/bern-linuxtips.png',
    description: 'Encontro com Jeferson Fernando (fundador do LINUXtips), referência nacional em DevOps, Linux e Cloud Native.',
    isFavorite: true,
    camera: 'Mobile · HDR · 26mm'
  },
  {
    id: 'bern-workstation',
    title: 'Working Session & Daily Setup',
    date: '2025',
    location: 'Rio Claro, SP · Brasil',
    category: 'career',
    src: '/images/bern-laptop.png',
    description: 'Bernardo focado no desenvolvimento e automação de infraestrutura em nuvem, terminal e muito café.',
    isFavorite: false,
    camera: 'Natural Light · 50mm'
  }
])

const activeCategory = ref<'all' | 'favorites' | 'events' | 'career'>('all')
const selectedPhoto = ref<PhotoItem | null>(null)
const showInfoPanel = ref(true)

const filteredPhotos = computed(() => {
  if (activeCategory.value === 'favorites') {
    return photos.value.filter(p => p.isFavorite)
  }
  if (activeCategory.value === 'events') {
    return photos.value.filter(p => p.category === 'events')
  }
  if (activeCategory.value === 'career') {
    return photos.value.filter(p => p.category === 'career')
  }
  return photos.value
})

const openLightbox = (photo: PhotoItem) => {
  selectedPhoto.value = photo
}

const closeLightbox = () => {
  selectedPhoto.value = null
}

const nextPhoto = () => {
  if (!selectedPhoto.value) return
  const list = filteredPhotos.value
  const idx = list.findIndex(p => p.id === selectedPhoto.value?.id)
  if (idx !== -1 && idx < list.length - 1) {
    selectedPhoto.value = list[idx + 1]
  } else if (idx === list.length - 1) {
    selectedPhoto.value = list[0]
  }
}

const prevPhoto = () => {
  if (!selectedPhoto.value) return
  const list = filteredPhotos.value
  const idx = list.findIndex(p => p.id === selectedPhoto.value?.id)
  if (idx > 0) {
    selectedPhoto.value = list[idx - 1]
  } else if (idx === 0) {
    selectedPhoto.value = list[list.length - 1]
  }
}

const toggleFavorite = (photo: PhotoItem) => {
  photo.isFavorite = !photo.isFavorite
}
</script>

<template>
  <div
    class="flex-grow flex h-full select-none font-sans overflow-hidden transition-colors duration-300 relative"
    :class="store.theme === 'light' ? 'bg-[#f5f5f7] text-zinc-900' : 'bg-[#141418] text-zinc-100'"
  >
    <!-- macOS Photos Sidebar (Desktop) -->
    <div
      class="hidden sm:flex flex-col w-52 shrink-0 border-r p-3 gap-4 text-xs select-none transition-colors duration-300"
      :class="store.theme === 'light'
        ? 'bg-[#e9e9ed]/80 border-black/10 text-zinc-700'
        : 'bg-[#1a1a22]/70 border-white/10 text-zinc-300'"
    >
      <div>
        <span class="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-2 block mb-1">Biblioteca</span>
        <div class="flex flex-col gap-0.5">
          <button
            @click="activeCategory = 'all'"
            class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition text-left cursor-pointer font-medium"
            :class="activeCategory === 'all'
              ? 'bg-sky-500 text-white shadow-xs'
              : (store.theme === 'light' ? 'hover:bg-black/5 text-zinc-700' : 'hover:bg-white/5 text-zinc-300')"
          >
            <Image class="w-4 h-4" />
            <span>Todas as Fotos</span>
            <span class="ml-auto text-[10px] opacity-75">{{ photos.length }}</span>
          </button>

          <button
            @click="activeCategory = 'favorites'"
            class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition text-left cursor-pointer font-medium"
            :class="activeCategory === 'favorites'
              ? 'bg-sky-500 text-white shadow-xs'
              : (store.theme === 'light' ? 'hover:bg-black/5 text-zinc-700' : 'hover:bg-white/5 text-zinc-300')"
          >
            <Heart class="w-4 h-4" />
            <span>Favoritas</span>
            <span class="ml-auto text-[10px] opacity-75">{{ photos.filter(p => p.isFavorite).length }}</span>
          </button>
        </div>
      </div>

      <div>
        <span class="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-2 block mb-1">Álbuns</span>
        <div class="flex flex-col gap-0.5">
          <button
            @click="activeCategory = 'events'"
            class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition text-left cursor-pointer font-medium"
            :class="activeCategory === 'events'
              ? 'bg-sky-500 text-white shadow-xs'
              : (store.theme === 'light' ? 'hover:bg-black/5 text-zinc-700' : 'hover:bg-white/5 text-zinc-300')"
          >
            <MapPin class="w-4 h-4 text-emerald-500" />
            <span>Eventos & Visitas</span>
            <span class="ml-auto text-[10px] opacity-75">{{ photos.filter(p => p.category === 'events').length }}</span>
          </button>

          <button
            @click="activeCategory = 'career'"
            class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition text-left cursor-pointer font-medium"
            :class="activeCategory === 'career'
              ? 'bg-sky-500 text-white shadow-xs'
              : (store.theme === 'light' ? 'hover:bg-black/5 text-zinc-700' : 'hover:bg-white/5 text-zinc-300')"
          >
            <FolderOpen class="w-4 h-4 text-amber-500" />
            <span>Carreira & Setup</span>
            <span class="ml-auto text-[10px] opacity-75">{{ photos.filter(p => p.category === 'career').length }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="flex-grow flex flex-col h-full overflow-hidden">
      <!-- Toolbar Header -->
      <div
        class="h-11 border-b flex items-center justify-between px-4 shrink-0 transition-colors duration-300"
        :class="store.theme === 'light' ? 'bg-white/70 border-black/10' : 'bg-[#181820]/70 border-white/10'"
      >
        <!-- Mobile Category Selector -->
        <div class="flex items-center gap-1.5 sm:hidden overflow-x-auto py-1">
          <button
            @click="activeCategory = 'all'"
            class="px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer"
            :class="activeCategory === 'all' ? 'bg-sky-500 text-white' : 'bg-black/5 dark:bg-white/5'"
          >
            Todas
          </button>
          <button
            @click="activeCategory = 'events'"
            class="px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer"
            :class="activeCategory === 'events' ? 'bg-sky-500 text-white' : 'bg-black/5 dark:bg-white/5'"
          >
            Eventos
          </button>
          <button
            @click="activeCategory = 'career'"
            class="px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer"
            :class="activeCategory === 'career' ? 'bg-sky-500 text-white' : 'bg-black/5 dark:bg-white/5'"
          >
            Setup
          </button>
        </div>

        <div class="hidden sm:flex items-center gap-2">
          <span class="font-bold text-xs">
            {{ activeCategory === 'all' ? 'Todas as Fotos' : activeCategory === 'favorites' ? 'Favoritas' : activeCategory === 'events' ? 'Eventos & Visitas' : 'Carreira & Setup' }}
          </span>
          <span class="text-zinc-400 text-xs font-normal">({{ filteredPhotos.length }} fotos)</span>
        </div>

        <div class="flex items-center gap-1.5 ml-auto">
          <button
            @click="showInfoPanel = !showInfoPanel"
            class="p-1.5 rounded-lg border text-xs font-medium transition cursor-pointer"
            :class="showInfoPanel
              ? 'bg-sky-500 text-white border-sky-600'
              : (store.theme === 'light' ? 'bg-white hover:bg-zinc-100 border-zinc-200' : 'bg-white/5 hover:bg-white/10 border-white/10')"
            title="Alternar Detalhes"
          >
            <Info class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Photo Grid List -->
      <div class="flex-grow overflow-y-auto p-4 sm:p-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div
            v-for="photo in filteredPhotos"
            :key="photo.id"
            @click="openLightbox(photo)"
            class="group relative rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
            :class="store.theme === 'light'
              ? 'bg-white border-black/10 hover:border-black/20'
              : 'bg-[#1d1d26] border-white/10 hover:border-white/20'"
          >
            <!-- Image Frame -->
            <div class="relative aspect-4/3 w-full overflow-hidden bg-black/10">
              <img
                :src="photo.src"
                :alt="photo.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <!-- Favorite Button Overlay -->
              <button
                @click.stop="toggleFavorite(photo)"
                class="absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md transition cursor-pointer shadow-sm"
                :class="photo.isFavorite
                  ? 'bg-rose-500 text-white'
                  : 'bg-black/40 text-white/80 hover:bg-black/60'"
              >
                <Heart class="w-3.5 h-3.5" :class="photo.isFavorite ? 'fill-current' : ''" />
              </button>
            </div>

            <!-- Meta Footer -->
            <div class="p-3.5 flex flex-col gap-1">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-xs line-clamp-1" :class="store.theme === 'light' ? 'text-zinc-900' : 'text-white'">
                  {{ photo.title }}
                </h3>
                <span class="text-[10px] font-mono text-zinc-400 shrink-0 ml-1">{{ photo.date }}</span>
              </div>
              <p class="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {{ photo.description }}
              </p>
              <div class="flex items-center gap-1 text-[10px] text-zinc-400 mt-1">
                <MapPin class="w-3 h-3 text-rose-500 shrink-0" />
                <span class="truncate">{{ photo.location }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox Modal Viewer -->
    <Transition name="fade">
      <div
        v-if="selectedPhoto"
        class="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between select-none"
        @click.self="closeLightbox"
      >
        <!-- Close button -->
        <button
          @click="closeLightbox"
          class="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition"
          title="Fechar"
        >
          <X class="w-5 h-5" />
        </button>

        <!-- Previous button -->
        <button
          @click="prevPhoto"
          class="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition hidden sm:flex items-center justify-center"
          title="Foto anterior"
        >
          <ChevronLeft class="w-6 h-6" />
        </button>

        <!-- Center Image Stage -->
        <div class="flex-grow flex items-center justify-center h-full p-4 sm:p-8 max-h-[85vh] sm:max-h-full">
          <img
            :src="selectedPhoto.src"
            :alt="selectedPhoto.title"
            class="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          />
        </div>

        <!-- Next button -->
        <button
          @click="nextPhoto"
          class="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition hidden sm:flex items-center justify-center"
          title="Próxima foto"
        >
          <ChevronRight class="w-6 h-6" />
        </button>

        <!-- Info Sidebar Overlay in Lightbox -->
        <div
          v-if="showInfoPanel"
          class="w-full sm:w-80 h-auto sm:h-full shrink-0 bg-zinc-900/90 border-t sm:border-t-0 sm:border-l border-white/10 p-5 text-white flex flex-col gap-3 justify-between"
        >
          <div class="flex flex-col gap-2">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-sky-400">Informações</span>
            <h2 class="text-sm font-bold">{{ selectedPhoto.title }}</h2>
            <p class="text-xs text-zinc-300 leading-relaxed">{{ selectedPhoto.description }}</p>

            <div class="flex flex-col gap-2 pt-3 border-t border-white/10 text-xs">
              <div class="flex items-center gap-2 text-zinc-300">
                <MapPin class="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{{ selectedPhoto.location }}</span>
              </div>
              <div class="flex items-center gap-2 text-zinc-300">
                <Calendar class="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{{ selectedPhoto.date }}</span>
              </div>
              <div v-if="selectedPhoto.camera" class="flex items-center gap-2 text-zinc-400 text-[11px]">
                <span>📷 {{ selectedPhoto.camera }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-3 border-t border-white/10">
            <button
              @click="toggleFavorite(selectedPhoto)"
              class="flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              :class="selectedPhoto.isFavorite
                ? 'bg-rose-500 border-rose-600 text-white'
                : 'bg-white/10 border-white/10 text-white hover:bg-white/20'"
            >
              <Heart class="w-4 h-4" :class="selectedPhoto.isFavorite ? 'fill-current' : ''" />
              <span>{{ selectedPhoto.isFavorite ? 'Favoritada' : 'Favoritar' }}</span>
            </button>
            <a
              :href="selectedPhoto.src"
              target="_blank"
              class="py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold transition flex items-center justify-center"
              title="Abrir em nova aba"
            >
              <ZoomIn class="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
