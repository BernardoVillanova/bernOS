<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const glowX = ref(50)
const glowY = ref(50)

const handleMouseMove = (e: MouseEvent) => {
  glowX.value = (e.clientX / window.innerWidth) * 100
  glowY.value = (e.clientY / window.innerHeight) * 100
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<template>
  <div class="fixed inset-0 w-full h-full z-[-1] bg-[#070709] overflow-hidden select-none pointer-events-none">
    <!-- Atmospheric Deep Mesh Gradient (Apple macOS Sequoia Dark Inspired) -->
    <div
      class="absolute inset-0 transition-opacity duration-1000"
      :style="{
        background: `
          radial-gradient(circle at ${glowX}% ${glowY}%, rgba(30, 41, 67, 0.35) 0%, transparent 60%),
          radial-gradient(circle at 15% 15%, rgba(20, 24, 38, 0.7) 0%, transparent 50%),
          radial-gradient(circle at 85% 85%, rgba(18, 16, 26, 0.8) 0%, transparent 50%),
          #08080a
        `
      }"
    ></div>

    <!-- Very subtle architectural grid/mesh texture -->
    <div class="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>

    <!-- Subtle vignette shadow edges -->
    <div class="absolute inset-0 bg-radial from-transparent via-black/20 to-black/80"></div>
  </div>
</template>
