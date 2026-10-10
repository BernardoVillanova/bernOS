<script setup lang="ts">
import { ref } from 'vue'
import { useWindowStore } from '../../stores/windowStore'
import {
  Mail,
  Linkedin,
  Github,
  MapPin,
  Check,
  Copy,
  ExternalLink,
  Send
} from 'lucide-vue-next'

const store = useWindowStore()

const email = 'bernardo.villasantana@gmail.com'
const linkedinUrl = 'https://www.linkedin.com/in/bernardo-villanova-de-santana'
const githubUrl = 'https://github.com/bernardovillanova'

const copied = ref(false)

const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(email)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // fallback
    const el = document.createElement('textarea')
    el.value = email
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}
</script>

<template>
  <div
    class="w-full h-full flex flex-col items-center justify-center p-4 sm:p-5 select-none font-sans transition-colors duration-300 min-h-0 overflow-y-auto"
    :class="store.theme === 'light' ? 'bg-[#f6f6f8] text-zinc-900' : 'bg-[#141419] text-zinc-100'"
  >
    <!-- macOS Contact Card Body -->
    <div class="w-full max-w-[400px] flex flex-col items-center gap-3.5 my-auto">
      
      <!-- Avatar Section with Bernardo's Real Photo -->
      <div class="relative flex flex-col items-center">
        <div
          class="w-20 h-20 rounded-full overflow-hidden border-2 shadow-lg relative transition-transform duration-200 hover:scale-105"
          :class="store.theme === 'light'
            ? 'border-white shadow-black/10 ring-2 ring-black/5'
            : 'border-[#22232c] shadow-black/50 ring-2 ring-white/10'"
        >
          <img
            src="/images/bern-laptop.png"
            alt="Bernardo Villanova"
            class="w-full h-full object-cover object-top"
          />
        </div>
        <!-- Active Status Badge -->
        <div
          class="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full border-2 bg-emerald-500 flex items-center justify-center shadow-xs"
          :class="store.theme === 'light' ? 'border-white' : 'border-[#141419]'"
          title="Disponível para contato"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
        </div>
      </div>

      <!-- Identity Header -->
      <div class="text-center flex flex-col items-center gap-1">
        <h2
          class="text-lg font-bold tracking-tight"
          :class="store.theme === 'light' ? 'text-zinc-950' : 'text-white'"
        >
          Bernardo Villanova de Santana
        </h2>
        <div
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
          :class="store.theme === 'light'
            ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
            : 'bg-amber-400/10 text-amber-300 border border-amber-400/20'"
        >
          <span>Analista DevOps</span>
          <span class="opacity-40">·</span>
          <span>Casa do Construtor</span>
        </div>
        <div
          class="flex items-center gap-1.5 text-[11px] mt-0.5"
          :class="store.theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'"
        >
          <MapPin class="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span>Rio Claro, SP · Brasil</span>
        </div>
      </div>

      <!-- Quick Action Buttons (macOS Contact Style) -->
      <div class="flex items-center gap-2.5 w-full justify-center">
        <a
          :href="`mailto:${email}`"
          class="flex-1 max-w-[130px] py-1.5 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
          :class="store.theme === 'light'
            ? 'bg-sky-500 hover:bg-sky-600 text-white'
            : 'bg-sky-600 hover:bg-sky-500 text-white'"
          title="Enviar e-mail agora"
        >
          <Send class="w-3.5 h-3.5" />
          <span>Escrever</span>
        </a>

        <button
          @click="copyEmail"
          class="flex-1 max-w-[130px] py-1.5 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 border transition cursor-pointer"
          :class="copied
            ? 'bg-emerald-500 text-white border-emerald-600'
            : (store.theme === 'light'
              ? 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-200 shadow-2xs'
              : 'bg-white/5 hover:bg-white/10 text-zinc-200 border-white/10')"
          title="Copiar endereço de e-mail"
        >
          <Check v-if="copied" class="w-3.5 h-3.5 stroke-[2.5]" />
          <Copy v-else class="w-3.5 h-3.5" />
          <span>{{ copied ? 'Copiado!' : 'Copiar' }}</span>
        </button>
      </div>

      <!-- Contact Details Grouped List -->
      <div
        class="w-full rounded-xl border divide-y overflow-hidden shadow-2xs transition-colors"
        :class="store.theme === 'light'
          ? 'bg-white border-zinc-200 divide-zinc-100'
          : 'bg-[#1c1d25] border-white/10 divide-white/5'"
      >
        <!-- Email Row -->
        <div class="px-3.5 py-2.5 flex items-center justify-between gap-2.5">
          <div class="flex items-center gap-2.5 min-w-0">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              :class="store.theme === 'light' ? 'bg-amber-500/10 text-amber-600' : 'bg-amber-400/10 text-amber-400'"
            >
              <Mail class="w-4 h-4" />
            </div>
            <div class="min-w-0 flex flex-col">
              <span class="text-[9px] font-semibold uppercase tracking-wider text-zinc-400">E-mail</span>
              <a
                :href="`mailto:${email}`"
                class="text-xs font-mono truncate hover:underline select-text"
                :class="store.theme === 'light' ? 'text-zinc-900 font-medium' : 'text-zinc-100'"
              >
                {{ email }}
              </a>
            </div>
          </div>
          <button
            @click="copyEmail"
            class="p-1.5 rounded-lg border text-xs font-medium transition cursor-pointer shrink-0"
            :class="copied
              ? 'bg-emerald-500 text-white border-emerald-600'
              : (store.theme === 'light'
                ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600 border-zinc-200'
                : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10')"
            :title="copied ? 'Copiado!' : 'Copiar'"
          >
            <Check v-if="copied" class="w-3.5 h-3.5 text-white" />
            <Copy v-else class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- LinkedIn Row -->
        <a
          :href="linkedinUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="px-3.5 py-2.5 flex items-center justify-between gap-2.5 transition group cursor-pointer"
          :class="store.theme === 'light' ? 'hover:bg-zinc-50' : 'hover:bg-white/[0.03]'"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              :class="store.theme === 'light' ? 'bg-blue-500/10 text-blue-600' : 'bg-blue-400/10 text-blue-400'"
            >
              <Linkedin class="w-4 h-4" />
            </div>
            <div class="min-w-0 flex flex-col">
              <span class="text-[9px] font-semibold uppercase tracking-wider text-zinc-400">LinkedIn</span>
              <span
                class="text-xs font-semibold truncate group-hover:text-blue-500 transition-colors"
                :class="store.theme === 'light' ? 'text-zinc-900' : 'text-zinc-100'"
              >
                /in/bernardo-villanova-de-santana
              </span>
            </div>
          </div>
          <ExternalLink class="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-500 transition-colors mr-1 shrink-0" />
        </a>

        <!-- GitHub Row -->
        <a
          :href="githubUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="px-3.5 py-2.5 flex items-center justify-between gap-2.5 transition group cursor-pointer"
          :class="store.theme === 'light' ? 'hover:bg-zinc-50' : 'hover:bg-white/[0.03]'"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              :class="store.theme === 'light' ? 'bg-zinc-200 text-zinc-800' : 'bg-white/10 text-zinc-200'"
            >
              <Github class="w-4 h-4" />
            </div>
            <div class="min-w-0 flex flex-col">
              <span class="text-[9px] font-semibold uppercase tracking-wider text-zinc-400">GitHub</span>
              <span
                class="text-xs font-mono font-semibold truncate group-hover:text-sky-500 transition-colors"
                :class="store.theme === 'light' ? 'text-zinc-900' : 'text-zinc-100'"
              >
                github.com/bernardovillanova
              </span>
            </div>
          </div>
          <ExternalLink class="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-100 transition-colors mr-1 shrink-0" />
        </a>
      </div>

      <!-- Availability & Status Message -->
      <div
        class="w-full text-center py-2 px-3 rounded-xl border text-[11px] leading-relaxed"
        :class="store.theme === 'light'
          ? 'bg-emerald-500/5 text-emerald-800 border-emerald-500/20'
          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'"
      >
        ✨ Aberto para oportunidades de Engenharia DevOps, Cloud e Consultoria.
      </div>

    </div>
  </div>
</template>
