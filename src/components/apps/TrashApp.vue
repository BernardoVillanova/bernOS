<script setup lang="ts">
import { ref } from 'vue'
import {
  Trash2,
  FileText,
  ArrowLeft,
  Info,
  X
} from 'lucide-vue-next'

const isPreviewOpen = ref(false)
const showEmptyToast = ref(false)

const triggerEmptyTrash = () => {
  showEmptyToast.value = true
  setTimeout(() => {
    showEmptyToast.value = false
  }, 2500)
}
</script>

<template>
  <div class="w-full h-full bg-[#121318] text-zinc-200 font-sans flex flex-col overflow-hidden select-none">
    
    <!-- Finder / Trash Toolbar -->
    <div class="h-11 bg-[#181922] border-b border-white/[0.08] px-4 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-2.5">
        <div class="p-1.5 rounded-lg bg-zinc-800 border border-white/10 text-zinc-400">
          <Trash2 class="w-4 h-4" />
        </div>
        <div>
          <h2 class="text-xs font-bold text-white tracking-wide">Lixeira</h2>
          <span class="text-[10px] text-zinc-400">1 item · 2.4 KB</span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="triggerEmptyTrash"
          class="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[11px] text-zinc-300 hover:text-white transition cursor-pointer font-medium"
        >
          Esvaziar Lixeira
        </button>
      </div>
    </div>

    <!-- Notification Toast when trying to empty -->
    <div
      v-if="showEmptyToast"
      class="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2 text-xs text-amber-300 font-medium"
    >
      <Info class="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span>Este protótipo está arquivado com carinho e não será excluído! ☕</span>
    </div>

    <!-- Main Content Area -->
    <div class="flex-grow p-5 overflow-y-auto">
      
      <!-- File Grid / Item -->
      <div
        v-if="!isPreviewOpen"
        class="flex flex-col gap-4"
      >
        <p class="text-xs text-zinc-400">
          Itens descartados ou protótipos arquivados temporariamente:
        </p>

        <div
          @click="isPreviewOpen = true"
          class="w-56 p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/20 transition cursor-pointer flex flex-col items-center gap-2.5 text-center group"
        >
          <div class="relative">
            <div class="w-14 h-16 bg-zinc-800/90 rounded-lg border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <FileText class="w-7 h-7 text-sky-400" />
            </div>
            <span class="absolute -bottom-1 -right-1 px-1 py-0.5 rounded bg-sky-500/20 border border-sky-500/30 text-[9px] font-mono text-sky-300 font-bold">
              .md
            </span>
          </div>

          <div class="flex flex-col">
            <span class="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors">
              alexandre.ia.md
            </span>
            <span class="text-[10px] text-zinc-400 font-mono mt-0.5">
              2.4 KB · Documento Markdown
            </span>
          </div>

          <span class="text-[10px] text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.05]">
            Clique para ler
          </span>
        </div>
      </div>

      <!-- Markdown File Viewer Pane -->
      <div
        v-else
        class="h-full flex flex-col bg-[#161720] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl"
      >
        <!-- Viewer Header -->
        <div class="h-10 bg-[#1d1f2b] border-b border-white/[0.06] px-4 flex items-center justify-between select-none">
          <div class="flex items-center gap-2 text-xs font-mono text-zinc-300">
            <button
              @click="isPreviewOpen = false"
              class="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <ArrowLeft class="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>
            <span class="text-zinc-600">|</span>
            <span class="font-bold text-white">alexandre.ia.md</span>
          </div>

          <button
            @click="isPreviewOpen = false"
            class="text-zinc-400 hover:text-white cursor-pointer p-1"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Markdown Document Body (Simple, clean, minimal) -->
        <div class="flex-grow p-6 sm:p-8 overflow-y-auto font-mono text-xs sm:text-sm text-zinc-200 leading-relaxed select-text flex flex-col gap-3">
          <div class="text-zinc-500"># alexandre.ia</div>
          <p class="text-zinc-300">
            Uma IA para gerenciar sua biblioteca de livros.
          </p>
        </div>
      </div>

    </div>

  </div>
</template>
