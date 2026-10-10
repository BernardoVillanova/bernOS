<script setup lang="ts">
import { ref } from 'vue'
import { useWindowStore } from '../../stores/windowStore'
import {
  Info,
  Palette,
  Cloud,
  Layers,
  Code2,
  ExternalLink,
  ShieldCheck,
  Sun,
  Moon,
  Monitor,
  Terminal,
  FolderGit2
} from 'lucide-vue-next'

const store = useWindowStore()

const activeTab = ref<'about' | 'appearance' | 'architecture' | 'dev'>('about')

const techSpecs = [
  { label: 'Framework', value: 'Vue 3 (Composition API) + TypeScript' },
  { label: 'Build Tool', value: 'Vite 6 (Lightning Fast ESM)' },
  { label: 'Estilização', value: 'Tailwind CSS (macOS Glassmorphism)' },
  { label: 'Gerenciador de Estado', value: 'Pinia Window Manager Store' },
  { label: 'Runtime & Servidor', value: 'Bun Runtime & Node.js Edge' },
  { label: 'Infraestrutura de Nuvem', value: 'AWS (ECS / EC2) + Cloudflare CDN' },
  { label: 'Ícones do Sistema', value: 'SVGs Vetoriais Oficiais Apple macOS' },
  { label: 'Licença & Código', value: 'Open Source (MIT) no GitHub' }
]
</script>

<template>
  <div
    class="w-full h-full flex flex-col md:flex-row select-none font-sans overflow-hidden transition-colors duration-300 min-h-0 min-w-0"
    :class="store.theme === 'light' ? 'bg-[#f5f5f7] text-zinc-900' : 'bg-[#141418] text-zinc-100'"
  >
    <!-- macOS System Settings Sidebar (Desktop / Tablet) -->
    <div
      class="hidden md:flex w-52 shrink-0 border-r p-3 flex-col gap-1 text-xs select-none transition-colors duration-300"
      :class="store.theme === 'light'
        ? 'bg-[#e9e9ed]/70 border-black/10 text-zinc-700'
        : 'bg-[#1c1c24]/70 border-white/10 text-zinc-300'"
    >
      <!-- Identity card in sidebar -->
      <div
        class="flex items-center gap-2.5 p-2 rounded-xl mb-3 border"
        :class="store.theme === 'light' ? 'bg-white/80 border-black/5 shadow-2xs' : 'bg-white/5 border-white/5'"
      >
        <div class="w-9 h-9 rounded-full overflow-hidden border border-amber-500/50 shrink-0">
          <img src="/images/bern-laptop.png" alt="Bernardo" class="w-full h-full object-cover" />
        </div>
        <div class="min-w-0">
          <span class="block font-bold text-xs truncate" :class="store.theme === 'light' ? 'text-zinc-900' : 'text-white'">Bernardo V.</span>
          <span class="block text-[10px] text-zinc-400 truncate">Analista DevOps</span>
        </div>
      </div>

      <!-- Navigation buttons -->
      <button
        @click="activeTab = 'about'"
        class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition cursor-pointer"
        :class="activeTab === 'about'
          ? 'bg-sky-500 text-white shadow-xs'
          : (store.theme === 'light' ? 'hover:bg-black/5 text-zinc-700' : 'hover:bg-white/5 text-zinc-300')"
      >
        <Info class="w-4 h-4 shrink-0" />
        <span>Sobre o bernOS</span>
      </button>

      <button
        @click="activeTab = 'appearance'"
        class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition cursor-pointer"
        :class="activeTab === 'appearance'
          ? 'bg-sky-500 text-white shadow-xs'
          : (store.theme === 'light' ? 'hover:bg-black/5 text-zinc-700' : 'hover:bg-white/5 text-zinc-300')"
      >
        <Palette class="w-4 h-4 shrink-0" />
        <span>Aparência</span>
      </button>

      <button
        @click="activeTab = 'architecture'"
        class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition cursor-pointer"
        :class="activeTab === 'architecture'
          ? 'bg-sky-500 text-white shadow-xs'
          : (store.theme === 'light' ? 'hover:bg-black/5 text-zinc-700' : 'hover:bg-white/5 text-zinc-300')"
      >
        <Layers class="w-4 h-4 shrink-0" />
        <span>Como foi feito</span>
      </button>

      <button
        @click="activeTab = 'dev'"
        class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium transition cursor-pointer"
        :class="activeTab === 'dev'
          ? 'bg-sky-500 text-white shadow-xs'
          : (store.theme === 'light' ? 'hover:bg-black/5 text-zinc-700' : 'hover:bg-white/5 text-zinc-300')"
      >
        <Code2 class="w-4 h-4 shrink-0" />
        <span>Desenvolvedor</span>
      </button>

      <div class="mt-auto pt-3 border-t text-[10px] text-zinc-400 px-2" :class="store.theme === 'light' ? 'border-black/5' : 'border-white/5'">
        <span>bernOS v2.4.0 (2026)</span>
      </div>
    </div>

    <!-- Mobile Segmented Tabs Bar -->
    <div
      class="flex md:hidden shrink-0 border-b p-2 overflow-x-auto gap-1.5 text-xs select-none"
      :class="store.theme === 'light'
        ? 'bg-[#e9e9ed]/90 border-black/10 text-zinc-700'
        : 'bg-[#1c1c24]/90 border-white/10 text-zinc-300'"
    >
      <button
        @click="activeTab = 'about'"
        class="px-3 py-1.5 rounded-lg font-medium shrink-0 flex items-center gap-1.5 transition"
        :class="activeTab === 'about'
          ? 'bg-sky-500 text-white'
          : (store.theme === 'light' ? 'bg-black/5 text-zinc-700' : 'bg-white/5 text-zinc-300')"
      >
        <Info class="w-3.5 h-3.5" />
        <span>Sobre</span>
      </button>
      <button
        @click="activeTab = 'appearance'"
        class="px-3 py-1.5 rounded-lg font-medium shrink-0 flex items-center gap-1.5 transition"
        :class="activeTab === 'appearance'
          ? 'bg-sky-500 text-white'
          : (store.theme === 'light' ? 'bg-black/5 text-zinc-700' : 'bg-white/5 text-zinc-300')"
      >
        <Palette class="w-3.5 h-3.5" />
        <span>Aparência</span>
      </button>
      <button
        @click="activeTab = 'architecture'"
        class="px-3 py-1.5 rounded-lg font-medium shrink-0 flex items-center gap-1.5 transition"
        :class="activeTab === 'architecture'
          ? 'bg-sky-500 text-white'
          : (store.theme === 'light' ? 'bg-black/5 text-zinc-700' : 'bg-white/5 text-zinc-300')"
      >
        <Layers class="w-3.5 h-3.5" />
        <span>Como foi feito</span>
      </button>
      <button
        @click="activeTab = 'dev'"
        class="px-3 py-1.5 rounded-lg font-medium shrink-0 flex items-center gap-1.5 transition"
        :class="activeTab === 'dev'
          ? 'bg-sky-500 text-white'
          : (store.theme === 'light' ? 'bg-black/5 text-zinc-700' : 'bg-white/5 text-zinc-300')"
      >
        <Code2 class="w-3.5 h-3.5" />
        <span>Autor</span>
      </button>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 min-h-0 min-w-0 overflow-y-auto p-5 sm:p-8">
      <!-- TAB 1: SOBRE O BERNOS -->
      <div v-if="activeTab === 'about'" class="max-w-2xl flex flex-col gap-6">
        <!-- Hero Apple-style About Banner -->
        <div
          class="rounded-2xl border p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm"
          :class="store.theme === 'light' ? 'bg-white border-black/10' : 'bg-[#1d1d26] border-white/10'"
        >
          <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-lg shrink-0">
            <span class="text-white font-extrabold text-2xl tracking-tight">bOS</span>
          </div>
          <div class="flex flex-col text-center sm:text-left gap-1">
            <h1 class="text-xl font-bold tracking-tight" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-white'">
              bernOS — macOS Sequoia Edition
            </h1>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              Versão 2.4.0 · Ambiente de Trabalho Web para Portfólio & Engenharia
            </p>
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                ● Sistema Operacional Web Ativo
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-500 border border-sky-500/20">
                Bun + Cloudflare Edge
              </span>
            </div>
          </div>
        </div>

        <!-- System Specifications Table -->
        <div
          class="rounded-2xl border overflow-hidden shadow-sm"
          :class="store.theme === 'light' ? 'bg-white border-black/10' : 'bg-[#1d1d26] border-white/10'"
        >
          <div class="px-5 py-3 border-b font-bold text-xs uppercase tracking-wider" :class="store.theme === 'light' ? 'border-black/5 bg-zinc-50 text-zinc-500' : 'border-white/5 bg-white/[0.02] text-zinc-400'">
            Especificações Técnicas
          </div>
          <div class="divide-y text-xs" :class="store.theme === 'light' ? 'divide-black/5' : 'divide-white/5'">
            <div
              v-for="(spec, idx) in techSpecs"
              :key="idx"
              class="px-5 py-3 flex items-center justify-between"
            >
              <span class="text-zinc-500 dark:text-zinc-400 font-medium">{{ spec.label }}</span>
              <span class="font-semibold" :class="store.theme === 'light' ? 'text-zinc-900' : 'text-zinc-200'">{{ spec.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: APARÊNCIA -->
      <div v-else-if="activeTab === 'appearance'" class="max-w-2xl flex flex-col gap-6">
        <div>
          <h2 class="text-base font-bold mb-1" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-white'">Aparência do Sistema</h2>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">Escolha o modo de exibição do bernOS. No modo claro, a interface adota a estética translúcida do macOS.</p>
        </div>

        <!-- Mode Selectors -->
        <div class="grid grid-cols-2 gap-4">
          <!-- Light Mode Option -->
          <div
            @click="store.setTheme('light')"
            class="rounded-2xl border p-4 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200"
            :class="store.theme === 'light'
              ? 'border-sky-500 ring-2 ring-sky-500/20 bg-white shadow-md'
              : 'border-white/10 hover:border-white/20 bg-[#1d1d26]'"
          >
            <div class="w-full h-24 rounded-xl bg-gradient-to-tr from-sky-100 via-white to-amber-50 border border-black/10 flex items-center justify-center relative overflow-hidden">
              <Sun class="w-8 h-8 text-amber-500" />
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3.5 h-3.5 rounded-full border flex items-center justify-center" :class="store.theme === 'light' ? 'border-sky-500 bg-sky-500 text-white' : 'border-zinc-500'">
                <div v-if="store.theme === 'light'" class="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>
              <span class="font-semibold text-xs" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-zinc-200'">Claro (macOS)</span>
            </div>
          </div>

          <!-- Dark Mode Option -->
          <div
            @click="store.setTheme('dark')"
            class="rounded-2xl border p-4 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200"
            :class="store.theme === 'dark'
              ? 'border-sky-500 ring-2 ring-sky-500/20 bg-[#1d1d26] shadow-md'
              : 'border-black/10 hover:border-black/20 bg-white'"
          >
            <div class="w-full h-24 rounded-xl bg-gradient-to-tr from-zinc-950 via-zinc-900 to-indigo-950 border border-white/10 flex items-center justify-center relative overflow-hidden">
              <Moon class="w-8 h-8 text-indigo-400" />
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3.5 h-3.5 rounded-full border flex items-center justify-center" :class="store.theme === 'dark' ? 'border-sky-500 bg-sky-500 text-white' : 'border-zinc-500'">
                <div v-if="store.theme === 'dark'" class="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>
              <span class="font-semibold text-xs" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-zinc-200'">Escuro</span>
            </div>
          </div>
        </div>

        <!-- Dock Behavior note -->
        <div
          class="rounded-2xl border p-4 flex items-start gap-3.5"
          :class="store.theme === 'light' ? 'bg-white border-black/10' : 'bg-[#1d1d26] border-white/10'"
        >
          <Monitor class="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
          <div class="flex flex-col gap-1">
            <span class="font-bold text-xs" :class="store.theme === 'light' ? 'text-zinc-900' : 'text-white'">Ocultação Automática do Dock</span>
            <p class="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Quando qualquer janela de aplicativo é aberta, a barra inferior (Dock) é ocultada suavemente para liberar espaço na tela, reaparecendo instantaneamente ao passar o mouse na borda inferior da tela, exatamente como no macOS.
            </p>
          </div>
        </div>
      </div>

      <!-- TAB 3: COMO FOI FEITO (ARQUITETURA) -->
      <div v-else-if="activeTab === 'architecture'" class="max-w-2xl flex flex-col gap-6">
        <div>
          <h2 class="text-base font-bold mb-1" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-white'">Engenharia do bernOS</h2>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">Como este sistema operacional web foi projetado e construído do zero.</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <!-- Card 1: Window Manager -->
          <div
            class="rounded-2xl border p-5 flex flex-col gap-2.5 shadow-sm"
            :class="store.theme === 'light' ? 'bg-white border-black/10' : 'bg-[#1d1d26] border-white/10'"
          >
            <div class="flex items-center gap-2">
              <Layers class="w-4 h-4 text-sky-500" />
              <h3 class="font-bold text-xs" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-white'">
                1. Window Manager Reativo (Pinia)
              </h3>
            </div>
            <p class="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              O gerenciador de janelas é centralizado em uma store do <strong>Pinia</strong> (<code>windowStore.ts</code>). Cada aplicativo possui coordenadas (x, y), dimensões (width, height), estado de minimização, foco com z-index dinâmico e suporte a arrastar e redimensionar suavemente com limites de viewport.
            </p>
          </div>

          <!-- Card 2: Terminal Simulator -->
          <div
            class="rounded-2xl border p-5 flex flex-col gap-2.5 shadow-sm"
            :class="store.theme === 'light' ? 'bg-white border-black/10' : 'bg-[#1d1d26] border-white/10'"
          >
            <div class="flex items-center gap-2">
              <Terminal class="w-4 h-4 text-amber-500" />
              <h3 class="font-bold text-xs" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-white'">
                2. Shell Interativo com Simulação DevOps
              </h3>
            </div>
            <p class="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              O Terminal emula uma sessão real macOS zsh. Inclui comandos reais como <code>docker ps</code>, <code>terraform init/plan/apply</code>, monitor de processos <code>htop</code> em tempo real com CPU randômica e até um modo de edição com <code>vim</code>.
            </p>
          </div>

          <!-- Card 3: Cloud & CDN -->
          <div
            class="rounded-2xl border p-5 flex flex-col gap-2.5 shadow-sm"
            :class="store.theme === 'light' ? 'bg-white border-black/10' : 'bg-[#1d1d26] border-white/10'"
          >
            <div class="flex items-center gap-2">
              <Cloud class="w-4 h-4 text-emerald-500" />
              <h3 class="font-bold text-xs" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-white'">
                3. Hospedagem & Entrega na Borda
              </h3>
            </div>
            <p class="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              O bernOS é construído com <strong>Bun</strong> para máxima velocidade de bundling e servido através da borda global do <strong>Cloudflare</strong> com HTTPS automatizado, compressão Brotli e cache estático de alta performance.
            </p>
          </div>
        </div>
      </div>

      <!-- TAB 4: DESENVOLVEDOR -->
      <div v-else-if="activeTab === 'dev'" class="max-w-2xl flex flex-col gap-6">
        <div>
          <h2 class="text-base font-bold mb-1" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-white'">Autor & Engenheiro</h2>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">Informações de contato e perfil profissional de Bernardo Villanova.</p>
        </div>

        <div
          class="rounded-2xl border p-6 flex flex-col sm:flex-row items-center gap-5 shadow-sm"
          :class="store.theme === 'light' ? 'bg-white border-black/10' : 'bg-[#1d1d26] border-white/10'"
        >
          <div class="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-500/80 shadow-md shrink-0">
            <img src="/images/bern-laptop.png" alt="Bernardo" class="w-full h-full object-cover" />
          </div>
          <div class="flex flex-col text-center sm:text-left gap-1">
            <h3 class="text-base font-bold" :class="store.theme === 'light' ? 'text-zinc-950' : 'text-white'">
              Bernardo Villanova de Santana
            </h3>
            <p class="text-xs font-semibold text-amber-500">
              Analista DevOps · Casa do Construtor
            </p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Foco em Kubernetes, AWS, Terraform (IaC) e Automação de Pipelines CI/CD.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="https://github.com/bernardovillanova"
            target="_blank"
            rel="noopener noreferrer"
            class="p-3.5 rounded-xl border flex items-center justify-between transition cursor-pointer"
            :class="store.theme === 'light' ? 'bg-white border-black/10 hover:border-black/20 text-zinc-800' : 'bg-[#1d1d26] border-white/10 hover:border-white/20 text-zinc-200'"
          >
            <div class="flex items-center gap-2.5">
              <FolderGit2 class="w-4 h-4 text-sky-500" />
              <span class="text-xs font-semibold">GitHub @bernardovillanova</span>
            </div>
            <ExternalLink class="w-3.5 h-3.5 text-zinc-400" />
          </a>

          <a
            href="https://www.linkedin.com/in/bernardo-villanova-de-santana"
            target="_blank"
            rel="noopener noreferrer"
            class="p-3.5 rounded-xl border flex items-center justify-between transition cursor-pointer"
            :class="store.theme === 'light' ? 'bg-white border-black/10 hover:border-black/20 text-zinc-800' : 'bg-[#1d1d26] border-white/10 hover:border-white/20 text-zinc-200'"
          >
            <div class="flex items-center gap-2.5">
              <ShieldCheck class="w-4 h-4 text-emerald-500" />
              <span class="text-xs font-semibold">LinkedIn Conectar</span>
            </div>
            <ExternalLink class="w-3.5 h-3.5 text-zinc-400" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
