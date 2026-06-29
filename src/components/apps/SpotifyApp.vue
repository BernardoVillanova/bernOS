<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue'
import { Play, Pause, SkipBack, SkipForward, Volume2, ListMusic, Shuffle, Repeat, Heart, Home, Search, Video, ChevronLeft, ChevronRight, Bell, Users } from 'lucide-vue-next'
import { useWindowStore } from '../../stores/windowStore'

const windowStore = useWindowStore()

interface Track {
  id: number
  title: string
  artist: string
  album: string
  duration: number // in seconds
  plays: string
}

const tracks: Track[] = [
  { id: 1, title: 'Samba a Dois', artist: 'Los Hermanos', album: 'Ventura', duration: 197, plays: '17.636.170' },
  { id: 2, title: 'O Vencedor', artist: 'Los Hermanos', album: 'Ventura', duration: 200, plays: '34.189.839' },
  { id: 3, title: 'Tá Bom', artist: 'Los Hermanos', album: 'Ventura', duration: 138, plays: '7.068.807' },
  { id: 4, title: 'Último Romance', artist: 'Los Hermanos', album: 'Ventura', duration: 263, plays: '75.251.392' },
  { id: 5, title: 'Do Sétimo Andar', artist: 'Los Hermanos', album: 'Ventura', duration: 226, plays: '16.209.873' },
  { id: 6, title: 'A Outra', artist: 'Los Hermanos', album: 'Ventura', duration: 215, plays: '8.706.746' },
  { id: 7, title: 'Cara Estranho', artist: 'Los Hermanos', album: 'Ventura', duration: 205, plays: '12.213.770' },
  { id: 8, title: 'O Velho e o Moço', artist: 'Los Hermanos', album: 'Ventura', duration: 243, plays: '24.812.019' },
  { id: 9, title: 'Além do Que Se Vê', artist: 'Los Hermanos', album: 'Ventura', duration: 230, plays: '14.352.010' },
  { id: 10, title: 'O Pouco que Sobrou', artist: 'Los Hermanos', album: 'Ventura', duration: 183, plays: '5.420.119' },
  { id: 11, title: 'Conversa de Botas Batidas', artist: 'Los Hermanos', album: 'Ventura', duration: 240, plays: '19.103.428' },
  { id: 12, title: 'Deixa o Verão', artist: 'Los Hermanos', album: 'Ventura', duration: 159, plays: '8.921.402' },
  { id: 13, title: 'Do Lado de Dentro', artist: 'Los Hermanos', album: 'Ventura', duration: 171, plays: '3.219.831' },
  { id: 14, title: 'Um Par', artist: 'Los Hermanos', album: 'Ventura', duration: 169, plays: '2.832.192' },
  { id: 15, title: 'De Onde Vem a Calma', artist: 'Los Hermanos', album: 'Ventura', duration: 250, plays: '6.432.012' }
]

const currentTrackIndex = ref(7) // "O Velho e o Moço" (index 7)
const isPlaying = ref(true)
const currentTime = ref(2) // Start at 2 seconds like in the print
const volume = ref(85)
const isLiked = ref(true)

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
}, { immediate: true })

// Keep window title synced to playing track
watch(currentTrack, (track) => {
  const win = windowStore.windows.find(w => w.id === 'spotify')
  if (win) {
    win.title = `${track.artist} - ${track.title}`
  }
}, { immediate: true })

onUnmounted(() => {
  if (playbackTimer) clearInterval(playbackTimer)
})
</script>

<template>
  <div class="flex-grow flex flex-col h-full bg-[#121212] select-none text-gray-300 font-sans overflow-hidden">
    
    <!-- Top Nav Bar (Like Spotify modern layout) -->
    <div class="h-14 bg-black/80 px-4 flex items-center justify-between shrink-0 border-b border-white/5">
      <div class="flex items-center gap-3">
        <!-- Navigation arrows -->
        <button class="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-gray-400 hover:text-white transition">
          <ChevronLeft class="w-5 h-5" />
        </button>
        <button class="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-gray-400 hover:text-white transition">
          <ChevronRight class="w-5 h-5" />
        </button>
      </div>

      <!-- Search and Home pill -->
      <div class="flex items-center gap-2 max-w-md w-full mx-auto">
        <button class="w-9 h-9 rounded-full bg-[#1f1f1f] hover:scale-105 transition flex items-center justify-center text-white">
          <Home class="w-5 h-5" />
        </button>
        <div class="relative flex-grow flex items-center bg-[#1f1f1f] hover:bg-[#2a2a2a] rounded-full border border-transparent focus-within:border-white/20 transition h-9 px-3">
          <Search class="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="What do you want to play?"
            class="bg-transparent text-white text-xs outline-none border-none p-0 w-full placeholder-gray-400"
            disabled
          />
        </div>
      </div>

      <!-- Profile side -->
      <div class="flex items-center gap-4 text-gray-400">
        <Bell class="w-5 h-5 hover:text-white transition cursor-pointer" />
        <Users class="w-5 h-5 hover:text-white transition cursor-pointer" />
        <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-orange to-red-500 flex items-center justify-center text-white font-bold text-xs select-none">
          B
        </div>
      </div>
    </div>

    <!-- Inner layout -->
    <div class="flex flex-grow h-[calc(100%-136px)] overflow-hidden">
      <!-- Narrow Left Sidebar -->
      <div class="w-[60px] bg-black/90 py-4 flex flex-col items-center gap-4 shrink-0">
        <button class="w-10 h-10 rounded-xl bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-400 hover:text-white flex items-center justify-center transition">
          <ListMusic class="w-5 h-5" />
        </button>
        <div class="w-8 h-[1px] bg-white/10 my-1"></div>
        
        <!-- Album circular covers / shortcut badges from the print -->
        <div class="flex flex-col gap-3">
          <div class="w-10 h-10 rounded-xl bg-purple-900 flex items-center justify-center text-purple-200 font-bold text-xs shadow-md border border-purple-800">
            IID
          </div>
          <button class="w-10 h-10 rounded-xl bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white flex items-center justify-center text-xl transition">
            +
          </button>
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs shadow">
            ♥
          </div>
          <!-- Mock list items -->
          <div class="w-10 h-10 rounded-xl overflow-hidden shadow cursor-pointer border border-white/5 hover:scale-105 transition">
            <img src="/ventura.jpg" class="w-full h-full object-cover" />
          </div>
          <div class="w-10 h-10 rounded-xl bg-[#2a1b18] flex items-center justify-center text-brand-orange font-bold text-sm border border-brand-orange/20">
            R
          </div>
          <div class="w-10 h-10 rounded-xl bg-[#182a24] flex items-center justify-center text-green-400 font-bold text-sm border border-green-500/20">
            D
          </div>
          <div class="w-10 h-10 rounded-xl bg-[#1c222a] flex items-center justify-center text-blue-400 font-bold text-sm border border-blue-500/20">
            N
          </div>
        </div>
      </div>

      <!-- Main Panel (Navy Blue Gradient) -->
      <div class="flex-grow bg-gradient-to-b from-[#0f3d4e] via-[#121212] to-[#121212] overflow-y-auto flex flex-col scrollbar-thin">
        
        <!-- Banner Header -->
        <div class="p-6 pt-8 shrink-0 flex gap-6 items-end">
          <img
            src="/ventura.jpg"
            class="w-36 h-36 rounded-md shadow-2xl shrink-0 border border-white/5 animate-pulse-slow"
            alt="Ventura Cover"
          />
          <div class="flex flex-col">
            <span class="text-xs uppercase font-extrabold text-white tracking-wider">Album</span>
            <h1 class="text-5xl font-extrabold text-white mt-1 mb-3 tracking-tight">Ventura</h1>
            <p class="text-xs text-gray-300 flex items-center gap-1.5">
              <span class="font-bold text-white hover:underline cursor-pointer">Los Hermanos</span>
              <span>•</span>
              <span>2003</span>
              <span>•</span>
              <span>15 songs, 51 min 37 sec</span>
            </p>
          </div>
        </div>

        <!-- Action Bar -->
        <div class="px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-5">
            <button @click="togglePlay" class="w-12 h-12 rounded-full bg-[#1db954] hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow-lg transition cursor-pointer">
              <Play v-if="!isPlaying" class="w-5 h-5 fill-black translate-x-0.5" />
              <Pause v-else class="w-5 h-5 fill-black" />
            </button>
            <button class="text-gray-400 hover:text-white transition"><Shuffle class="w-5 h-5" /></button>
            <button @click="isLiked = !isLiked" class="hover:text-white transition" :class="isLiked ? 'text-[#1db954]' : 'text-gray-400'">
              <Heart class="w-6 h-6" :class="isLiked ? 'fill-[#1db954]' : ''" />
            </button>
            <!-- Download icon -->
            <svg class="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 11h3l-4 4-4-4h3V8h2v5z"/></svg>
            <span class="text-gray-400 hover:text-white font-bold text-lg tracking-widest cursor-pointer ml-1">...</span>
          </div>
          
          <div class="text-xs text-gray-400 flex items-center gap-2 hover:text-white cursor-pointer">
            <span>List</span>
            <ListMusic class="w-4 h-4" />
          </div>
        </div>

        <!-- Track List Table -->
        <div class="px-6 pb-6">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="text-gray-400 border-b border-white/10 uppercase tracking-widest text-[9px] h-8">
                <th class="w-8 text-center">#</th>
                <th>Title</th>
                <th class="text-right pr-6">Plays</th>
                <th class="w-16 text-right pr-4">
                  <svg class="w-4 h-4 inline-block text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(track, idx) in tracks"
                :key="track.id"
                class="hover:bg-white/5 group border-b border-transparent h-12 transition rounded cursor-pointer"
                :class="currentTrackIndex === idx ? 'text-[#1db954] bg-white/5' : 'text-gray-300'"
                @dblclick="playTrack(idx)"
              >
                <!-- Index / Play Button -->
                <td class="text-center font-mono relative">
                  <span class="group-hover:opacity-0" :class="currentTrackIndex === idx ? 'text-[#1db954] font-bold' : ''">{{ idx + 1 }}</span>
                  <button @click="playTrack(idx)" class="absolute inset-0 m-auto w-6 h-6 items-center justify-center hidden group-hover:flex text-white hover:text-[#1db954]">
                    <Play class="w-3 h-3 fill-current" />
                  </button>
                </td>
                
                <!-- Title & Artist -->
                <td>
                  <div class="flex flex-col">
                    <span class="font-semibold text-sm" :class="currentTrackIndex === idx ? 'text-[#1db954]' : 'text-white'">{{ track.title }}</span>
                    <span class="text-gray-400 group-hover:text-gray-300 text-xs mt-0.5">{{ track.artist }}</span>
                  </div>
                </td>

                <!-- Plays -->
                <td class="text-right pr-6 font-mono text-gray-400 group-hover:text-gray-300">
                  {{ track.plays }}
                </td>

                <!-- Duration -->
                <td class="text-right pr-4 font-mono text-gray-400 group-hover:text-gray-300">
                  {{ formatTime(track.duration) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right Sidebar (Ventura Panel from the print) -->
      <div class="w-[260px] bg-[#121212] border-l border-white/5 p-4 flex flex-col gap-4 shrink-0 overflow-y-auto select-none">
        <div class="flex justify-between items-center pb-2">
          <span class="font-bold text-white text-sm">Ventura</span>
          <span class="text-gray-400 hover:text-white text-lg font-bold cursor-pointer">...</span>
        </div>
        
        <!-- Album cover (larger) -->
        <div class="w-full aspect-square rounded-lg overflow-hidden shadow-xl border border-white/5 relative group">
          <img src="/ventura.jpg" class="w-full h-full object-cover" />
        </div>

        <!-- Song info -->
        <div class="flex justify-between items-start mt-1">
          <div class="flex flex-col overflow-hidden leading-tight w-4/5">
            <span class="text-white text-base font-bold truncate hover:underline cursor-pointer">{{ currentTrack.title }}</span>
            <span class="text-gray-400 text-xs truncate mt-0.5 hover:underline cursor-pointer">{{ currentTrack.artist }}</span>
          </div>
          <button @click="isLiked = !isLiked" class="hover:text-white shrink-0" :class="isLiked ? 'text-[#1db954]' : 'text-gray-400'">
            <Heart class="w-5 h-5" :class="isLiked ? 'fill-[#1db954]' : ''" />
          </button>
        </div>

        <!-- Switch to Video Button -->
        <button class="w-full py-1.5 mt-1 bg-white/10 hover:bg-white/20 text-white rounded-full text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer">
          <Video class="w-3.5 h-3.5" />
          <span>Switch to video</span>
        </button>

        <!-- Related Music Videos section -->
        <div class="mt-4 flex flex-col gap-3">
          <span class="font-bold text-white text-xs tracking-wide">Related music videos</span>
          
          <!-- Card 1 -->
          <div class="flex items-center gap-3 bg-[#181818] hover:bg-[#242424] p-2 rounded-lg border border-white/5 cursor-pointer transition">
            <div class="w-16 h-10 bg-gradient-to-br from-red-950 to-indigo-950 rounded flex items-center justify-center text-white/50 text-[10px] shrink-0 overflow-hidden relative shadow">
              <span class="absolute inset-0 flex items-center justify-center bg-black/40"><Play class="w-3 h-3 text-white fill-white" /></span>
              A Flor
            </div>
            <div class="flex flex-col overflow-hidden leading-tight">
              <span class="text-white text-xs font-semibold truncate">A Flor (Video)</span>
              <span class="text-gray-400 text-[10px] truncate mt-0.5">Los Hermanos</span>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="flex items-center gap-3 bg-[#181818] hover:bg-[#242424] p-2 rounded-lg border border-white/5 cursor-pointer transition">
            <div class="w-16 h-10 bg-gradient-to-br from-amber-950 to-emerald-950 rounded flex items-center justify-center text-white/50 text-[10px] shrink-0 overflow-hidden relative shadow">
              <span class="absolute inset-0 flex items-center justify-center bg-black/40"><Play class="w-3 h-3 text-white fill-white" /></span>
              Pois É
            </div>
            <div class="flex flex-col overflow-hidden leading-tight">
              <span class="text-white text-xs font-semibold truncate">Pois É (Video) (Extras)</span>
              <span class="text-gray-400 text-[10px] truncate mt-0.5">Los Hermanos</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Playback bar (Bottom) -->
    <div class="h-20 bg-[#181818] border-t border-white/5 px-4 flex items-center justify-between shrink-0">
      
      <!-- Left side: Playing track info -->
      <div class="flex items-center gap-3 w-1/4 min-w-[180px]">
        <div class="w-14 h-14 rounded overflow-hidden shrink-0 border border-white/5 shadow-md">
          <img src="/ventura.jpg" class="w-full h-full object-cover" />
        </div>
        <div class="flex flex-col overflow-hidden leading-tight">
          <span class="text-white text-sm font-semibold truncate hover:underline cursor-pointer">{{ currentTrack.title }}</span>
          <span class="text-gray-400 text-xs truncate hover:underline cursor-pointer">{{ currentTrack.artist }}</span>
        </div>
      </div>

      <!-- Center side: Playback controls & timeline -->
      <div class="flex flex-col items-center gap-1.5 w-2/5 max-w-[500px]">
        <!-- Controls -->
        <div class="flex items-center gap-5 text-gray-400">
          <button class="hover:text-white transition"><Shuffle class="w-4 h-4" /></button>
          <button @click="prevTrack" class="hover:text-white transition"><SkipBack class="w-5 h-5 fill-current" /></button>
          <button @click="togglePlay" class="w-8 h-8 rounded-full bg-white hover:scale-105 active:scale-95 text-black flex items-center justify-center cursor-pointer transition">
            <Play v-if="!isPlaying" class="w-4 h-4 fill-black translate-x-0.5" />
            <Pause v-else class="w-4 h-4 fill-black" />
          </button>
          <button @click="nextTrack" class="hover:text-white transition"><SkipForward class="w-5 h-5 fill-current" /></button>
          <button class="hover:text-white transition"><Repeat class="w-4 h-4" /></button>
        </div>

        <!-- Progress Timeline -->
        <div class="flex items-center gap-2 w-full text-[10px] font-mono text-gray-400">
          <span>{{ formatTime(currentTime) }}</span>
          <div class="flex-grow h-1 rounded-full bg-white/10 relative overflow-hidden group/bar cursor-pointer">
            <div
              class="h-full bg-white group-hover/bar:bg-[#1db954] rounded-full"
              :style="{ width: `${(currentTime / currentTrack.duration) * 100}%` }"
            ></div>
          </div>
          <span>{{ formatTime(currentTrack.duration) }}</span>
        </div>
      </div>

      <!-- Right side: Volume and extra controls -->
      <div class="flex items-center gap-3 w-1/4 justify-end text-gray-400">
        <button class="hover:text-white transition"><ListMusic class="w-4 h-4" /></button>
        <div class="flex items-center gap-2">
          <Volume2 class="w-4 h-4" />
          <div class="w-20 h-1 rounded-full bg-white/10 overflow-hidden relative cursor-pointer group/vol">
            <div class="h-full bg-white group-hover/vol:bg-[#1db954]" :style="{ width: `${volume}%` }"></div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.animate-pulse-slow {
  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .85;
  }
}
</style>
