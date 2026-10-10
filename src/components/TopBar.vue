<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useWindowStore } from '../stores/windowStore'
import {
  Radio,
  Zap,
  Wifi,
  Volume2,
  Sun,
  Moon,
  Power,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'

const store = useWindowStore()
const timeString = ref('')
const showControlCenter = ref(false)
const showCalendar = ref(false)
const showAppleMenu = ref(false)

const systemVolume = ref(80)
const systemBrightness = ref(90)
const isWifiConnected = ref(true)

const cpuUsage = ref(15)
const ramUsage = ref(42)

// Calendar States
const calendarDays = ref<number[]>([])
const currentMonthName = ref('')
const currentYear = ref(2026)
const currentDayNum = ref(29)

let timer: ReturnType<typeof setInterval>
let resourceInterval: ReturnType<typeof setInterval>

const updateTime = () => {
  const now = new Date()
  const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const weekday = now.toLocaleDateString('pt-BR', { weekday: 'short' })
  const month = now.toLocaleDateString('pt-BR', { month: 'short' })
  const day = now.getDate()
  timeString.value = `${time} ${weekday}, ${day} de ${month}`
}

const generateCalendar = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  currentMonthName.value = now.toLocaleDateString('pt-BR', { month: 'long' })
  currentYear.value = year
  currentDayNum.value = now.getDate()

  const firstDayIndex = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()

  const days: number[] = []
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(0)
  }
  for (let day = 1; day <= totalDays; day++) {
    days.push(day)
  }
  calendarDays.value = days
}

const handleShutdown = () => {
  showControlCenter.value = false
  showAppleMenu.value = false
  store.openPowerDialog()
}

const handleRestart = () => {
  showControlCenter.value = false
  showAppleMenu.value = false
  store.triggerRestart()
}

const toggleAppleMenu = () => {
  showAppleMenu.value = !showAppleMenu.value
  if (showAppleMenu.value) {
    showCalendar.value = false
    showControlCenter.value = false
  }
}

const toggleCalendar = () => {
  showCalendar.value = !showCalendar.value
  if (showCalendar.value) {
    showControlCenter.value = false
    showAppleMenu.value = false
    generateCalendar()
  }
}

const toggleControlCenter = () => {
  showControlCenter.value = !showControlCenter.value
  if (showControlCenter.value) {
    showCalendar.value = false
    showAppleMenu.value = false
  }
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  generateCalendar()

  resourceInterval = setInterval(() => {
    cpuUsage.value = Math.max(5, Math.min(95, Math.floor(cpuUsage.value + (Math.random() * 10 - 5))))
    ramUsage.value = Math.max(30, Math.min(85, Math.floor(ramUsage.value + (Math.random() * 4 - 2))))
  }, 3000)
})

onUnmounted(() => {
  clearInterval(timer)
  clearInterval(resourceInterval)
})
</script>

<template>
  <div
    class="h-8 w-full backdrop-blur-xl border-b flex items-center justify-between px-4 z-[9999] select-none text-xs font-medium relative transition-colors duration-300"
    :class="store.theme === 'light'
      ? 'bg-white/75 border-black/[0.08] text-zinc-800 shadow-xs'
      : 'bg-black/40 border-white/[0.08] text-zinc-300'"
  >
    
    <!-- Left Section: Apple Logo / OS Brand & System Indicators -->
    <div class="flex items-center gap-3 relative">
      <button
        class="font-bold tracking-tight flex items-center gap-1.5 px-2 py-0.5 rounded transition cursor-pointer"
        :class="store.theme === 'light' ? 'text-zinc-900 hover:bg-black/10' : 'text-zinc-100 hover:bg-white/10'"
        @click="toggleAppleMenu"
      >
        <span>BernOS</span>
      </button>

      <!-- Apple-style Dropdown Menu -->
      <div
        v-if="showAppleMenu"
        class="absolute left-0 top-8 w-44 bg-zinc-900/95 border border-white/10 shadow-2xl backdrop-blur-2xl rounded-xl p-1.5 flex flex-col z-[100000] text-zinc-200 text-xs"
      >
        <button
          class="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-blue-600 hover:text-white transition flex items-center justify-between cursor-pointer"
          @click="showAppleMenu = false; store.openWindow('settings')"
        >
          <span>Sobre o BernOS</span>
        </button>
        <button
          class="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-blue-600 hover:text-white transition flex items-center justify-between cursor-pointer"
          @click="showAppleMenu = false; store.openWindow('settings')"
        >
          <span>Configurações do Sistema...</span>
        </button>
        <div class="h-px bg-white/[0.08] my-1"></div>
        <button
          class="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-blue-600 hover:text-white transition flex items-center justify-between cursor-pointer"
          @click="handleRestart"
        >
          <span>Reiniciar...</span>
        </button>
        <button
          class="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-red-600 hover:text-white transition flex items-center justify-between cursor-pointer"
          @click="handleShutdown"
        >
          <span>Desligar...</span>
        </button>
      </div>

      <div class="hidden sm:flex items-center gap-2 text-zinc-500">
        <Radio class="w-3.5 h-3.5" />
        <Zap class="w-3.5 h-3.5" />
      </div>
    </div>

    <!-- Center Section: Clean Centered live clock trigger for Calendar -->
    <div class="absolute left-1/2 -translate-x-1/2">
      <button
        class="px-2.5 py-1 rounded-md hover:bg-white/[0.06] active:bg-white/10 text-zinc-200 text-[11px] font-medium transition cursor-pointer"
        :class="showCalendar ? 'bg-white/10 text-white' : ''"
        @click="toggleCalendar"
      >
        <span>{{ timeString }}</span>
      </button>

      <!-- Calendar Dropdown panel -->
      <div
        v-if="showCalendar"
        class="absolute left-1/2 -translate-x-1/2 top-8 w-[250px] bg-zinc-900/90 border border-white/10 shadow-2xl backdrop-blur-2xl rounded-xl p-3.5 flex flex-col gap-2.5 z-[100000] text-zinc-200"
      >
        <!-- Month Header -->
        <div class="flex justify-between items-center border-b border-white/[0.08] pb-2">
          <button class="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition"><ChevronLeft class="w-3.5 h-3.5" /></button>
          <span class="font-semibold text-xs tracking-tight text-white capitalize">{{ currentMonthName }} {{ currentYear }}</span>
          <button class="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition"><ChevronRight class="w-3.5 h-3.5" /></button>
        </div>

        <!-- Weekdays -->
        <div class="grid grid-cols-7 text-center text-[9px] text-zinc-500 font-semibold uppercase">
          <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
        </div>

        <!-- Days Grid -->
        <div class="grid grid-cols-7 gap-y-1">
          <div
            v-for="(day, idx) in calendarDays"
            :key="idx"
            class="flex items-center justify-center h-6"
          >
            <span
              v-if="day > 0"
              class="w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-medium transition"
              :class="[
                day === currentDayNum
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-zinc-300 hover:bg-white/10 hover:text-white cursor-pointer'
              ]"
            >
              {{ day }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Section: System Tools & Control Center -->
    <div class="flex items-center gap-2.5 relative">
      <span class="hidden md:inline-block font-mono text-[10px] text-zinc-500">CPU {{ cpuUsage }}%</span>

      <!-- Theme Switcher (Dark / Light macOS Mode) -->
      <button
        @click="store.toggleTheme"
        class="p-1.5 rounded-md transition cursor-pointer flex items-center justify-center"
        :class="store.theme === 'light'
          ? 'text-amber-600 hover:bg-black/[0.08]'
          : 'text-amber-400 hover:bg-white/[0.08]'"
        :title="store.theme === 'light' ? 'Alternar para Modo Escuro' : 'Alternar para Modo Claro (macOS)'"
      >
        <Sun v-if="store.theme === 'light'" class="w-3.5 h-3.5" />
        <Moon v-else class="w-3.5 h-3.5" />
      </button>

      <!-- Action items -->
      <button
        class="flex items-center gap-2 p-1 rounded-md transition cursor-pointer"
        :class="store.theme === 'light'
          ? (showControlCenter ? 'text-zinc-900 bg-black/10' : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.06]')
          : (showControlCenter ? 'text-zinc-100 bg-white/10' : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06]')"
        @click="toggleControlCenter"
      >
        <Wifi class="w-3.5 h-3.5" />
        <Volume2 class="w-3.5 h-3.5" />
        <Settings class="w-3.5 h-3.5" />
      </button>

      <!-- Control Center Dropdown -->
      <div
        v-if="showControlCenter"
        class="absolute right-0 top-8 w-[250px] shadow-2xl backdrop-blur-2xl rounded-xl p-3.5 flex flex-col gap-3.5 z-[100000] transition-colors"
        :class="store.theme === 'light'
          ? 'bg-white/95 border border-black/10 text-zinc-800'
          : 'bg-zinc-900/90 border border-white/10 text-zinc-200'"
      >
        <div class="flex justify-between items-center border-b pb-2" :class="store.theme === 'light' ? 'border-black/[0.08]' : 'border-white/[0.08]'">
          <span class="font-semibold text-xs" :class="store.theme === 'light' ? 'text-zinc-800' : 'text-zinc-200'">Ajustes Rápidos</span>
          <button class="text-zinc-400 hover:text-red-400 transition cursor-pointer" @click="handleShutdown" title="Desligar">
            <Power class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Connection Settings -->
        <div class="grid grid-cols-2 gap-2 text-center text-[10px]">
          <div
            class="p-2 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] rounded-lg cursor-pointer flex flex-col items-center gap-1 transition"
            @click="isWifiConnected = !isWifiConnected"
          >
            <Wifi class="w-4 h-4" :class="isWifiConnected ? 'text-blue-400' : 'text-zinc-500'" />
            <span class="font-medium text-zinc-200">Wi-Fi</span>
            <span class="text-[9px] text-zinc-500">{{ isWifiConnected ? 'Conectado' : 'Off' }}</span>
          </div>

          <div class="p-2 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] rounded-lg cursor-pointer flex flex-col items-center gap-1 transition">
            <Volume2 class="w-4 h-4 text-emerald-400" />
            <span class="font-medium text-zinc-200">Áudio</span>
            <span class="text-[9px] text-emerald-400">Ativo</span>
          </div>
        </div>

        <!-- Volume and Brightness Sliders -->
        <div class="flex flex-col gap-2.5">
          <div class="flex flex-col gap-1">
            <div class="flex justify-between text-[10px] text-zinc-400">
              <span class="flex items-center gap-1"><Volume2 class="w-3 h-3" /> Volume</span>
              <span class="font-mono text-zinc-300">{{ systemVolume }}%</span>
            </div>
            <input type="range" v-model="systemVolume" min="0" max="100" class="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
          </div>

          <div class="flex flex-col gap-1">
            <div class="flex justify-between text-[10px] text-zinc-400">
              <span class="flex items-center gap-1"><Sun class="w-3 h-3" /> Brilho</span>
              <span class="font-mono text-zinc-300">{{ systemBrightness }}%</span>
            </div>
            <input type="range" v-model="systemBrightness" min="10" max="100" class="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
          </div>
        </div>

        <button
          @click="showControlCenter = false; store.openWindow('settings')"
          class="w-full py-1.5 px-2.5 rounded-lg border text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
          :class="store.theme === 'light' ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800' : 'bg-white/10 hover:bg-white/15 border-white/10 text-white'"
        >
          <Settings class="w-3.5 h-3.5 text-sky-400" />
          <span>Configurações do Sistema...</span>
        </button>

        <div class="text-[9px] text-center text-zinc-500 border-t border-white/[0.08] pt-2 font-mono">
          BernOS v2.4.0 · macOS Sequoia Theme
        </div>
      </div>
    </div>
  </div>
</template>
