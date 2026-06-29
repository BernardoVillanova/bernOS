<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  Link,
  Radio,
  Zap,
  Keyboard,
  Bell,
  Wifi,
  Volume2,
  Sun,
  Power,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'

const timeString = ref('')
const showControlCenter = ref(false)
const showCalendar = ref(false)

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
  // Format: 14:20 Mon, Jun 29 (24h format)
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  const weekday = now.toLocaleDateString('en-US', { weekday: 'short' })
  const month = now.toLocaleDateString('en-US', { month: 'short' })
  const day = now.getDate()
  timeString.value = `${time} ${weekday}, ${month} ${day}`
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
  // Empty spaces for padding first week
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(0)
  }
  for (let day = 1; day <= totalDays; day++) {
    days.push(day)
  }
  calendarDays.value = days
}

const handleShutdown = () => {
  window.alert('Simulação de Desligamento de Sistema')
}

const toggleCalendar = () => {
  showCalendar.value = !showCalendar.value
  if (showCalendar.value) {
    showControlCenter.value = false
    generateCalendar()
  }
}

const toggleControlCenter = () => {
  showControlCenter.value = !showControlCenter.value
  if (showControlCenter.value) {
    showCalendar.value = false
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
  <div class="h-10 w-full bg-black/65 border-b border-white/10 flex items-center justify-between px-5 z-[9999] select-none text-xs font-semibold text-brand-orange-light relative">
    
    <!-- Left Section: Link Icon and status indicator dots -->
    <div class="flex items-center gap-3">
      <Link class="w-4 h-4 rotate-45 stroke-[1.8] text-brand-orange-light/80" />
      <div class="flex items-center gap-2.5 text-brand-orange/80">
        <Radio class="w-4 h-4 stroke-[1.8]" />
        <Zap class="w-4 h-4 stroke-[1.8]" />
        <Keyboard class="w-4 h-4 stroke-[1.8]" />
      </div>
    </div>

    <!-- Center Section: Centered live clock trigger for Calendar -->
    <div class="absolute left-1/2 -translate-x-1/2">
      <button
        class="px-3.5 py-1.5 rounded-lg hover:bg-white/10 active:bg-white/5 text-white/95 font-mono text-xs tracking-wide transition flex items-center gap-1.5 cursor-pointer"
        :class="showCalendar ? 'bg-white/10 text-brand-orange!' : ''"
        @click="toggleCalendar"
      >
        <span>{{ timeString }}</span>
      </button>

      <!-- Calendar Dropdown panel (Centred absolute layout) -->
      <div
        v-if="showCalendar"
        class="absolute left-1/2 -translate-x-1/2 top-9 w-[260px] bg-bg-panel/95 border border-brand-orange/20 shadow-2xl backdrop-blur-xl rounded-xl p-4 flex flex-col gap-3 z-[100000] text-gray-200"
      >
        <!-- Month Header -->
        <div class="flex justify-between items-center border-b border-white/5 pb-2">
          <button class="p-0.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition"><ChevronLeft class="w-4 h-4" /></button>
          <span class="font-bold text-xs uppercase tracking-wider text-white capitalize">{{ currentMonthName }} {{ currentYear }}</span>
          <button class="p-0.5 rounded hover:bg-white/5 text-gray-400 hover:text-white transition"><ChevronRight class="w-4 h-4" /></button>
        </div>

        <!-- Weekdays -->
        <div class="grid grid-cols-7 text-center text-[10px] text-gray-500 font-bold uppercase">
          <span>Dom</span>
          <span>Seg</span>
          <span>Ter</span>
          <span>Qua</span>
          <span>Qui</span>
          <span>Sex</span>
          <span>Sáb</span>
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
              class="w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-semibold"
              :class="[
                day === currentDayNum
                  ? 'bg-brand-orange text-black font-extrabold shadow-sm'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer'
              ]"
            >
              {{ day }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Section: System Tools -->
    <div class="flex items-center gap-3.5 relative">
      <!-- Faint CPU usage indicator -->
      <span class="hidden md:inline-block font-mono text-[10px] text-brand-orange-light/50 select-text">CPU {{ cpuUsage }}%</span>

      <!-- Action items -->
      <button
        class="flex items-center gap-2.5 hover:text-brand-orange transition cursor-pointer"
        @click="toggleControlCenter"
      >
        <Bell class="w-4 h-4 stroke-[1.8]" />
        <Wifi class="w-4 h-4 stroke-[1.8]" />
        <Volume2 class="w-4 h-4 stroke-[1.8]" />
        <Sun class="w-4 h-4 stroke-[1.8]" />
        <Settings class="w-4 h-4 stroke-[1.8]" />
      </button>

      <!-- Control Center Dropdown -->
      <div
        v-if="showControlCenter"
        class="absolute right-0 top-9 w-[240px] bg-bg-panel/95 border border-brand-orange/20 shadow-2xl backdrop-blur-xl rounded-xl p-4 flex flex-col gap-4 z-[100000] text-gray-300"
      >
        <div class="flex justify-between items-center border-b border-white/5 pb-2">
          <span class="font-bold text-gray-200 text-xs">Centro de Controle</span>
          <button class="text-brand-orange hover:text-brand-orange-light" @click="handleShutdown">
            <Power class="w-4 h-4" />
          </button>
        </div>

        <!-- Connection Settings -->
        <div class="grid grid-cols-2 gap-2 text-center text-[10px]">
          <div
            class="p-2 bg-white/5 border border-white/5 hover:border-brand-orange/30 rounded-lg cursor-pointer flex flex-col items-center gap-1"
            @click="isWifiConnected = !isWifiConnected"
          >
            <Wifi class="w-4.5 h-4.5" :class="isWifiConnected ? 'text-brand-orange' : 'text-gray-500'" />
            <span class="font-semibold text-gray-300">Conexão Wi-Fi</span>
            <span class="text-[8px] text-gray-500">{{ isWifiConnected ? 'Conectado' : 'Desativado' }}</span>
          </div>

          <div class="p-2 bg-white/5 border border-white/5 hover:border-brand-orange/30 rounded-lg cursor-pointer flex flex-col items-center gap-1">
            <Volume2 class="w-4.5 h-4.5 text-brand-orange" />
            <span class="font-semibold text-gray-300">Bluetooth</span>
            <span class="text-[8px] text-brand-orange">Ativado</span>
          </div>
        </div>

        <!-- Ranges / Volume and Brightness -->
        <div class="flex flex-col gap-3">
          <div class="flex flex-col gap-1">
            <div class="flex justify-between text-[9px] text-gray-400">
              <span>Volume</span>
              <span class="font-mono text-brand-orange">{{ systemVolume }}%</span>
            </div>
            <input type="range" v-model="systemVolume" min="0" max="100" class="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-orange" />
          </div>

          <div class="flex flex-col gap-1">
            <div class="flex justify-between text-[9px] text-gray-400">
              <span>Brilho</span>
              <span class="font-mono text-brand-orange">{{ systemBrightness }}%</span>
            </div>
            <input type="range" v-model="systemBrightness" min="10" max="100" class="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-orange" />
          </div>
        </div>

        <div class="text-[9px] text-center text-gray-500 border-t border-white/5 pt-2">
          BernOS v1.0.0 · Theme Orange
        </div>
      </div>
    </div>
  </div>
</template>
