<script setup lang="ts">
import { Mail, Linkedin, Github, ExternalLink, MapPin, User } from 'lucide-vue-next'

const email = 'bernardo.villasantana@gmail.com'
const linkedinUrl = 'https://www.linkedin.com/in/bernardo-villanova-de-santana'
const githubUrl = 'https://github.com/bernardovillanova'
</script>

<template>
  <div class="flex-grow flex flex-col items-center justify-center p-5 bg-[#0a0a0c]/90 text-gray-200 select-none font-sans h-full">
    <!-- Profile Card Header -->
    <div class="text-center mb-4 flex flex-col items-center">
      <!-- Styled Avatar with glowing orange ring -->
      <div class="w-12 h-12 rounded-full bg-brand-orange/10 border border-brand-orange/40 flex items-center justify-center text-brand-orange shadow-lg shadow-brand-orange/10 mb-2">
        <User class="w-6 h-6 stroke-[1.8]" />
      </div>

      <h2 class="text-xs font-bold text-white tracking-wide">Bernardo Villanova de Santana</h2>
      <p class="text-[9px] text-brand-orange-light font-semibold uppercase mt-0.5 tracking-widest">DevOps Pleno | Full Stack</p>
      
      <div class="flex items-center justify-center gap-1 text-[9px] text-gray-500 mt-1">
        <MapPin class="w-3 h-3 text-brand-orange" />
        <span>Rio Claro, SP - Brasil</span>
      </div>
    </div>

    <!-- Actions List -->
    <div class="w-full max-w-[280px] flex flex-col gap-2">
      <!-- Email Link -->
      <a
        :href="`mailto:${email}`"
        class="flex items-center justify-between px-3.5 py-1.5 bg-white/[0.02] border border-white/5 hover:border-brand-orange/30 hover:bg-brand-orange/5 rounded-lg transition duration-200 text-[11px] font-semibold text-gray-300 hover:text-white"
      >
        <div class="flex items-center gap-2">
          <Mail class="w-3.5 h-3.5 text-brand-orange" />
          <span>E-mail</span>
        </div>
        <span class="text-[9px] font-mono text-gray-500 select-text">{{ email }}</span>
      </a>

      <!-- LinkedIn Link -->
      <a
        :href="linkedinUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center justify-between px-3.5 py-1.5 bg-white/[0.02] border border-white/5 hover:border-brand-orange/30 hover:bg-brand-orange/5 rounded-lg transition duration-200 text-[11px] font-semibold text-gray-300 hover:text-white"
      >
        <div class="flex items-center gap-2">
          <Linkedin class="w-3.5 h-3.5 text-brand-orange" />
          <span>LinkedIn</span>
        </div>
        <ExternalLink class="w-3 h-3 text-gray-500" />
      </a>

      <!-- GitHub Link -->
      <a
        :href="githubUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center justify-between px-3.5 py-1.5 bg-white/[0.02] border border-white/5 hover:border-brand-orange/30 hover:bg-brand-orange/5 rounded-lg transition duration-200 text-[11px] font-semibold text-gray-300 hover:text-white"
      >
        <div class="flex items-center gap-2">
          <Github class="w-3.5 h-3.5 text-brand-orange" />
          <span>GitHub</span>
        </div>
        <ExternalLink class="w-3 h-3 text-gray-500" />
      </a>
    </div>

    <!-- Small Footer -->
    <div class="text-[8px] text-gray-600 mt-4 tracking-wider font-mono">
      BERNOS CONNECT CARD v1.0
    </div>
  </div>
</template>
