<script setup lang="ts">
import { ref, watch } from 'vue'
import { useWindowStore } from '../stores/windowStore'
import { Power, RotateCcw, Loader2 } from 'lucide-vue-next'

const store = useWindowStore()
const bootProgress = ref(0)
let bootInterval: ReturnType<typeof setInterval>

const playBootChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const now = ctx.currentTime
    const freqs = [349.23, 440.0, 523.25, 698.46]
    freqs.forEach(freq => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)
      gain.gain.setValueAtTime(0.06, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 1.9)
    })
  } catch {}
}

const handlePowerOn = () => {
  playBootChime()
  store.powerOn()
}

watch(
  () => store.powerState,
  (state) => {
    clearInterval(bootInterval)
    if (state === 'booting') {
      bootProgress.value = 5
      bootInterval = setInterval(() => {
        if (bootProgress.value < 95) {
          bootProgress.value += Math.floor(Math.random() * 15 + 8)
        }
      }, 120)
    } else {
      bootProgress.value = 0
    }
  }
)
</script>

<template>
  <div>
    <!-- 1. macOS Style Power Confirmation Dialog -->
    <Transition name="fade">
      <div
        v-if="store.showPowerDialog"
        class="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 backdrop-blur-sm select-none"
        @click.self="store.closePowerDialog"
      >
        <div class="w-[360px] bg-zinc-900/95 border border-white/10 p-5 rounded-2xl shadow-2xl backdrop-blur-2xl flex flex-col gap-4 text-zinc-200">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
              <Power class="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h3 class="text-sm font-semibold text-white tracking-wide">Gerenciamento de Energia</h3>
              <p class="text-[11px] text-zinc-400 leading-snug">Deseja reiniciar ou desligar o BernOS?</p>
            </div>
          </div>

          <p class="text-xs text-zinc-400 leading-relaxed">
            Todas as janelas abertas e processos em execução no sistema serão salvos e encerrados.
          </p>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
            <button
              class="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-zinc-300 text-xs font-medium transition cursor-pointer"
              @click="store.closePowerDialog"
            >
              Cancelar
            </button>
            <button
              class="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              @click="store.triggerRestart"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>Reiniciar</span>
            </button>
            <button
              class="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              @click="store.triggerShutdown"
            >
              <Power class="w-3.5 h-3.5" />
              <span>Desligar</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 2. Shutting Down Transition Screen -->
    <Transition name="fade">
      <div
        v-if="store.powerState === 'shutting_down'"
        class="fixed inset-0 z-[1000000] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-4 text-zinc-200 select-none pointer-events-auto"
      >
        <div class="w-12 h-12 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center">
          <Loader2 class="w-6 h-6 text-white animate-spin stroke-[1.5]" />
        </div>
        <div class="flex flex-col items-center gap-1">
          <span class="text-sm font-medium tracking-wide text-zinc-200">Encerrando o BernOS...</span>
          <span class="text-xs text-zinc-500 font-mono">Salvando configurações do sistema</span>
        </div>
      </div>
    </Transition>

    <!-- 3. Machine Completely OFF Screen -->
    <Transition name="fade">
      <div
        v-if="store.powerState === 'off'"
        class="fixed inset-0 z-[1000000] bg-black flex flex-col items-center justify-center select-none pointer-events-auto"
      >
        <div class="flex flex-col items-center gap-6">
          <!-- Power-On Button with breathing glow -->
          <button
            @click="handlePowerOn"
            class="group relative w-20 h-20 rounded-full border border-white/15 bg-zinc-950 hover:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer shadow-2xl"
          >
            <span class="absolute inset-0 rounded-full bg-white/5 animate-ping opacity-30 pointer-events-none"></span>
            <Power class="w-8 h-8 stroke-[1.75] transition group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]" />
          </button>

          <div class="flex flex-col items-center gap-1.5 text-center">
            <h2 class="text-sm font-semibold text-zinc-300 tracking-wider uppercase">BernOS Desligado</h2>
            <p class="text-xs text-zinc-500 max-w-xs">
              Pressione o botão de energia para ligar o sistema operacional
            </p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 4. Booting / Restarting Screen -->
    <Transition name="fade">
      <div
        v-if="store.powerState === 'booting' || store.powerState === 'restarting'"
        class="fixed inset-0 z-[1000000] bg-black flex flex-col items-center justify-center select-none pointer-events-auto"
      >
        <div class="flex flex-col items-center gap-8 w-64">
          <!-- Apple / BernOS Minimal Monogram -->
          <div class="flex flex-col items-center gap-2">
            <span class="text-3xl font-extrabold text-white tracking-tight">BernOS</span>
            <span class="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">System Boot</span>
          </div>

          <!-- Loading progress bar -->
          <div class="w-full bg-zinc-800/80 h-1 rounded-full overflow-hidden border border-white/10">
            <div
              class="bg-white h-full transition-all duration-150 rounded-full"
              :style="{ width: `${bootProgress}%` }"
            ></div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
