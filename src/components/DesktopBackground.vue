<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useWindowStore } from '../stores/windowStore'

const store = useWindowStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
}

let animationFrameId: number
let particles: Particle[] = []
let mouse = { x: -1000, y: -1000, radius: 160 }

const darkColors = [
  'rgba(168, 85, 247, 0.45)', // Purple
  'rgba(59, 130, 246, 0.45)', // Blue
  'rgba(249, 115, 22, 0.45)', // Orange
  'rgba(236, 72, 153, 0.45)', // Pink
]

const lightColors = [
  'rgba(99, 102, 241, 0.35)', // Indigo
  'rgba(59, 130, 246, 0.35)', // Blue
  'rgba(244, 63, 94, 0.30)',  // Rose
  'rgba(168, 85, 247, 0.30)', // Purple
]

const initParticles = (width: number, height: number) => {
  particles = []
  const count = Math.min(Math.floor((width * height) / 7500), 140)
  const palette = store.theme === 'light' ? lightColors : darkColors
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      radius: Math.random() * 1.5 + 1.0,
      color: palette[Math.floor(Math.random() * palette.length)]
    })
  }
}

watch(() => store.theme, () => {
  const canvas = canvasRef.value
  if (canvas) {
    initParticles(canvas.width, canvas.height)
  }
})

const handleResize = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  initParticles(canvas.width, canvas.height)
}

const handleMouseMove = (e: MouseEvent) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
}

const handleMouseLeave = () => {
  mouse.x = -1000
  mouse.y = -1000
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  initParticles(canvas.width, canvas.height)

  window.addEventListener('resize', handleResize)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseleave', handleMouseLeave)

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    const isLight = store.theme === 'light'
    const lineBase = isLight ? 'rgba(99, 102, 241, ' : 'rgba(168, 85, 247, '

    // Draw constellation lines
    const len = particles.length
    for (let i = 0; i < len; i++) {
      const p1 = particles[i]
      for (let j = i + 1; j < len; j++) {
        const p2 = particles[j]
        const dx = p1.x - p2.x
        const dy = p1.y - p2.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        if (dist < 100) {
          const alpha = (1 - dist / 100) * (isLight ? 0.05 : 0.08)
          ctx.beginPath()
          ctx.strokeStyle = `${lineBase}${alpha})`
          ctx.lineWidth = 0.5
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
        }
      }
    }

    // Update and draw particles
    particles.forEach(p => {
      // Repulsion force from mouse
      const dx = p.x - mouse.x
      const dy = p.y - mouse.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius
        const angle = Math.atan2(dy, dx)
        p.x += Math.cos(angle) * force * 1.5
        p.y += Math.sin(angle) * force * 1.5
      }

      // Physics motion
      p.x += p.vx
      p.y += p.vy

      // Wrap around screen edges
      if (p.x < 0) p.x = canvas.width
      if (p.x > canvas.width) p.x = 0
      if (p.y < 0) p.y = canvas.height
      if (p.y > canvas.height) p.y = 0

      // Render particle circle
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.fill()
    })

    animationFrameId = requestAnimationFrame(draw)
  }

  draw()
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseleave', handleMouseLeave)
})
</script>

<template>
  <div class="fixed inset-0 w-full h-full z-[-1] overflow-hidden select-none pointer-events-none">
    <!-- Light Mode: Authentic macOS Abstract Fluid Mesh Wallpaper (CSS Vector Gradient, crisp & smooth) -->
    <div
      class="absolute inset-0 transition-opacity duration-700 ease-in-out"
      :class="store.theme === 'light' ? 'opacity-100' : 'opacity-0 pointer-events-none'"
      style="
        background:
          radial-gradient(ellipse 65% 55% at 20% 20%, rgba(254, 180, 123, 0.45) 0%, transparent 60%),
          radial-gradient(ellipse 70% 60% at 85% 15%, rgba(199, 125, 255, 0.40) 0%, transparent 65%),
          radial-gradient(ellipse 80% 65% at 50% 60%, rgba(144, 219, 244, 0.50) 0%, transparent 70%),
          radial-gradient(ellipse 60% 50% at 80% 85%, rgba(255, 154, 162, 0.35) 0%, transparent 60%),
          radial-gradient(ellipse 70% 50% at 15% 85%, rgba(181, 168, 255, 0.40) 0%, transparent 65%),
          #eef2f7;
      "
    >
      <!-- macOS Light frosted subtle grain overlay -->
      <div class="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px]"></div>
    </div>

    <!-- Dark Mode: Deep Cosmic Void -->
    <div
      class="absolute inset-0 bg-[#07020e] transition-opacity duration-700 ease-in-out"
      :class="store.theme === 'dark' ? 'opacity-100' : 'opacity-0 pointer-events-none'"
    >
      <!-- Atmospheric dark glow -->
      <div class="absolute inset-0 bg-radial-gradient"></div>
    </div>

    <!-- Interactive Particle / Constellation Canvas (always mounted, seamlessly reactive) -->
    <canvas
      ref="canvasRef"
      class="absolute inset-0 block pointer-events-auto transition-opacity duration-700"
      :class="store.theme === 'light' ? 'opacity-50' : 'opacity-90'"
    ></canvas>
  </div>
</template>

<style scoped>
.bg-radial-gradient {
  background: radial-gradient(circle at 50% 50%, rgba(7, 2, 14, 0) 30%, rgba(7, 2, 14, 0.85) 100%);
}
</style>
