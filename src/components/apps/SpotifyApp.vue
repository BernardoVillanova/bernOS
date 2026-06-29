<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue'
import { Play, Pause, SkipBack, SkipForward, Volume2, ListMusic, Shuffle, Repeat, Heart } from 'lucide-vue-next'

interface Track {
  id: number
  title: string
  artist: string
  album: string
  duration: number // in seconds
  color: string // Gradient representation
}

const tracks: Track[] = [
  { id: 1, title: 'Noctalia Nebula', artist: 'Bernardo Villanova', album: 'Space Beats Vol. 1', duration: 225, color: 'from-brand-orange to-red-600' },
  { id: 2, title: 'Terraform Plan & Drift', artist: 'IaC Chill', album: 'State Files', duration: 184, color: 'from-amber-600 to-red-600' },
  { id: 3, title: 'Dockerized Dreams', artist: 'The Containers', album: 'Microservice Lofi', duration: 202, color: 'from-blue-600 to-cyan-500' },
  { id: 4, title: 'Git Push --force', artist: 'Committers', album: 'Merge Conflicts', duration: 154, color: 'from-rose-600 to-orange-500' },
  { id: 5, title: 'SQLite Sync & Chill', artist: 'Native Bun', album: 'Embedded DB', duration: 288, color: 'from-emerald-600 to-teal-500' }
]

const currentTrackIndex = ref(0)
const isPlaying = ref(false)
const currentTime = ref(0)
const volume = ref(75)
const isLiked = ref(false)

const currentTrack = ref<Track>(tracks[currentTrackIndex.value])

let playbackTimer: ReturnType<typeof setInterval> | null = null

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
}

const playTrack = (index: number) => {
  currentTrackIndex.value = index
  currentTrack.value = tracks[index]
  currentTime.value = 0
  isPlaying.value = true
}

const nextTrack = () => {
  let nextIdx = currentTrackIndex.value + 1
  if (nextIdx >= tracks.length) nextIdx = 0
  playTrack(nextIdx)
}

const prevTrack = () => {
  let prevIdx = currentTrackIndex.value - 1
  if (prevIdx < 0) prevIdx = tracks.length - 1
  playTrack(prevIdx)
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

watch(isPlaying, (playing) => {
  if (playing) {
    playbackTimer = setInterval(() => {
      if (currentTime.value < currentTrack.value.duration) {
        currentTime.value += 1
      } else {
        nextTrack()
      }
    }, 1000)
  } else {
    if (playbackTimer) {
      clearInterval(playbackTimer)
      playbackTimer = null
    }
  }
})

onUnmounted(() => {
  if (playbackTimer) clearInterval(playbackTimer)
})
</script>

<template>
  <div class="flex-grow flex flex-col h-full bg-[#121212] select-none text-gray-300 font-sans">
    
    <!-- Inner layout -->
    <div class="flex flex-grow h-[calc(100%-80px)] overflow-hidden">
      <!-- Sidebar -->
      <div class="w-[200px] bg-black p-4 flex flex-col gap-6 shrink-0 text-xs font-semibold">
        <div class="flex items-center gap-2 text-white text-base font-bold mb-2">
          <Music class="w-6 h-6 text-green-500" />
          <span>Bernify</span>
        </div>
        
        <ul class="flex flex-col gap-3.5 text-gray-400">
          <li class="hover:text-white cursor-pointer flex items-center gap-2 text-white">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            Início
          </li>
          <li class="hover:text-white cursor-pointer flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            Buscar
          </li>
          <li class="hover:text-white cursor-pointer flex items-center gap-2">
            <ListMusic class="w-5 h-5" />
            Sua Biblioteca
          </li>
        </ul>

        <div>
          <p class="text-gray-500 uppercase tracking-widest text-[9px] mb-3">Playlists</p>
          <ul class="flex flex-col gap-2.5 text-gray-400 font-normal">
            <li class="hover:text-white cursor-pointer truncate">Lofi Dev Vibes</li>
            <li class="hover:text-white cursor-pointer truncate">Terraform Orchestrations</li>
            <li class="hover:text-white cursor-pointer truncate">Focus Beats</li>
          </ul>
        </div>
      </div>

      <!-- Main Panel -->
      <div class="flex-grow bg-[#1d1d1d] overflow-y-auto flex flex-col relative">
        <!-- Banner Header -->
        <div class="bg-gradient-to-b from-brand-orange/40 to-[#1d1d1d] p-6 pt-8 shrink-0 flex gap-5 items-end">
          <div class="w-32 h-32 rounded bg-gradient-to-br shadow-xl shrink-0 flex items-center justify-center text-white font-extrabold text-4xl" :class="currentTrack.color">
            ♫
          </div>
          <div>
            <span class="text-xs uppercase font-extrabold text-white tracking-wider">Playlist pública</span>
            <h1 class="text-4xl font-extrabold text-white mt-1 mb-2">DevOps Chill Mix</h1>
            <p class="text-xs text-gray-400">Criada por <span class="text-white font-semibold">Bernardo Villanova</span> · {{ tracks.length }} músicas, 17 min</p>
          </div>
        </div>

        <!-- Action Bar -->
        <div class="p-6 pt-2 pb-2 flex items-center gap-4">
          <button @click="togglePlay" class="w-12 h-12 rounded-full bg-green-500 hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow-lg transition cursor-pointer">
            <Play v-if="!isPlaying" class="w-5 h-5 fill-black translate-x-0.5" />
            <Pause v-else class="w-5 h-5 fill-black" />
          </button>
          <button @click="isLiked = !isLiked" class="hover:text-white" :class="isLiked ? 'text-green-500' : 'text-gray-400'">
            <Heart class="w-6 h-6" :class="isLiked ? 'fill-green-500' : ''" />
          </button>
        </div>

        <!-- Track List Table -->
        <div class="px-6 pb-6">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="text-gray-400 border-b border-white/10 uppercase tracking-widest text-[9px] h-8">
                <th class="w-8 text-center">#</th>
                <th>Título</th>
                <th class="hidden sm:table-cell">Álbum</th>
                <th class="w-16 text-center">Tempo</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(track, idx) in tracks"
                :key="track.id"
                class="hover:bg-white/5 group border-b border-transparent h-12 transition rounded cursor-pointer"
                :class="currentTrackIndex === idx ? 'text-green-500 bg-white/5' : 'text-gray-300'"
                @dblclick="playTrack(idx)"
              >
                <!-- Index / Play Button -->
                <td class="text-center font-mono relative">
                  <span class="group-hover:opacity-0" :class="currentTrackIndex === idx ? 'text-green-500 font-bold' : ''">{{ idx + 1 }}</span>
                  <button @click="playTrack(idx)" class="absolute inset-0 m-auto w-6 h-6 items-center justify-center hidden group-hover:flex text-white hover:text-green-500">
                    <Play class="w-3.5 h-3.5 fill-current" />
                  </button>
                </td>
                
                <!-- Title & Artist -->
                <td>
                  <div class="flex flex-col">
                    <span class="font-semibold text-sm" :class="currentTrackIndex === idx ? 'text-green-500' : 'text-white'">{{ track.title }}</span>
                    <span class="text-gray-400 group-hover:text-gray-300 text-xs">{{ track.artist }}</span>
                  </div>
                </td>

                <!-- Album -->
                <td class="hidden sm:table-cell text-gray-400 group-hover:text-gray-300">
                  {{ track.album }}
                </td>

                <!-- Duration -->
                <td class="text-center font-mono text-gray-400 group-hover:text-gray-300">
                  {{ formatTime(track.duration) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Playback bar (Bottom) -->
    <div class="h-20 bg-[#181818] border-t border-white/5 px-4 flex items-center justify-between shrink-0">
      
      <!-- Left side: Playing track info -->
      <div class="flex items-center gap-3 w-1/4 min-w-[150px]">
        <div class="w-14 h-14 rounded bg-gradient-to-br flex items-center justify-center text-white font-bold shrink-0 text-xl" :class="currentTrack.color">
          ♫
        </div>
        <div class="flex flex-col overflow-hidden leading-snug">
          <span class="text-white text-sm font-semibold truncate">{{ currentTrack.title }}</span>
          <span class="text-gray-400 text-xs truncate hover:underline cursor-pointer">{{ currentTrack.artist }}</span>
        </div>
      </div>

      <!-- Center side: Playback controls & timeline -->
      <div class="flex flex-col items-center gap-1.5 w-2/5 max-w-[500px]">
        <!-- Controls -->
        <div class="flex items-center gap-5 text-gray-400">
          <button class="hover:text-white"><Shuffle class="w-4 h-4" /></button>
          <button @click="prevTrack" class="hover:text-white"><SkipBack class="w-5 h-5 fill-current" /></button>
          <button @click="togglePlay" class="w-8 h-8 rounded-full bg-white hover:scale-105 active:scale-95 text-black flex items-center justify-center cursor-pointer">
            <Play v-if="!isPlaying" class="w-4 h-4 fill-black translate-x-0.5" />
            <Pause v-else class="w-4 h-4 fill-black" />
          </button>
          <button @click="nextTrack" class="hover:text-white"><SkipForward class="w-5 h-5 fill-current" /></button>
          <button class="hover:text-white"><Repeat class="w-4 h-4" /></button>
        </div>

        <!-- Progress Timeline -->
        <div class="flex items-center gap-2 w-full text-[10px] font-mono text-gray-400">
          <span>{{ formatTime(currentTime) }}</span>
          <div class="flex-grow h-1 rounded-full bg-white/10 relative overflow-hidden group/bar cursor-pointer">
            <div
              class="h-full bg-white group-hover/bar:bg-green-500 rounded-full"
              :style="{ width: `${(currentTime / currentTrack.duration) * 100}%` }"
            ></div>
          </div>
          <span>{{ formatTime(currentTrack.duration) }}</span>
        </div>
      </div>

      <!-- Right side: Volume controls -->
      <div class="flex items-center gap-2.5 w-1/4 justify-end text-gray-400">
        <Volume2 class="w-4 h-4" />
        <div class="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden relative cursor-pointer">
          <div class="h-full bg-white hover:bg-green-500" :style="{ width: `${volume}%` }"></div>
        </div>
      </div>

    </div>
  </div>
</template>
