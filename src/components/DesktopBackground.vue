<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

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
let mouse = { x: -1000, y: -1000, radius: 150 }

const colors = [
  'rgba(168, 85, 247, 0.45)', // Purple
  'rgba(59, 130, 246, 0.45)', // Blue
  'rgba(249, 115, 22, 0.45)', // Orange
  'rgba(236, 72, 153, 0.45)', // Pink
]

const initParticles = (width: number, height: number) => {
  particles = []
  const count = Math.min(Math.floor((width * height) / 7000), 160)
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 1.5 + 1.0,
      color: colors[Math.floor(Math.random() * colors.length)]
    })
  }
}

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
          const alpha = (1 - dist / 100) * 0.07
          ctx.beginPath()
          ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`
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
  <div class="fixed inset-0 w-full h-full z-[-1] bg-[#07020e] overflow-hidden select-none">
    <!-- Moving Particle Canvas -->
    <canvas ref="canvasRef" class="absolute inset-0 block"></canvas>
    
    <!-- Original static wallpaper rendered EXACTLY like before but with opacity 80% to blend -->
    <div
      class="absolute inset-0 bg-no-repeat bg-right-bottom bg-contain pointer-events-none opacity-80 transition-opacity duration-700"
      style="background-image: url('/wallpaper.png'); background-size: 38% auto;"
    ></div>
    
    <!-- Radial overlay to blend particles into the dark edges -->
    <div class="absolute inset-0 pointer-events-none bg-radial-gradient"></div>
  </div>
</template>

<style scoped>
.bg-radial-gradient {
  background: radial-gradient(circle at 50% 50%, rgba(7, 2, 14, 0) 30%, rgba(7, 2, 14, 0.85) 100%);
}
</style>


