<script setup lang="ts">
interface Props {
  color?: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  color: '#FFF',
  count: 200,
})

const canvasRef = ref<HTMLCanvasElement>()
const animationId = ref<number>()

interface Star {
  x: number
  y: number
  z: number
  prevX: number
  prevY: number
}

let stars: Star[] = []
let canvas: HTMLCanvasElement
let ctx: CanvasRenderingContext2D
let centerX: number
let centerY: number
const speed = 0.025

function initializeStars() {
  stars = []
  for (let i = 0; i < props.count; i++) {
    stars.push({
      x: Math.random() * 1600 - 800,
      y: Math.random() * 900 - 450,
      z: Math.random() * 1000,
      prevX: 0,
      prevY: 0,
    })
  }
}

function resizeCanvas() {
  if (!canvas)
    return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  centerX = canvas.width / 2
  centerY = canvas.height / 2
}

function animate() {
  if (!ctx || !canvas)
    return

  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (const star of stars) {
    star.prevX = (star.x / star.z) * 320 + centerX
    star.prevY = (star.y / star.z) * 320 + centerY

    star.z -= speed * 100

    if (star.z <= 0) {
      star.x = Math.random() * 1600 - 800
      star.y = Math.random() * 900 - 450
      star.z = 1000
      star.prevX = (star.x / star.z) * 320 + centerX
      star.prevY = (star.y / star.z) * 320 + centerY
    }

    const x = (star.x / star.z) * 320 + centerX
    const y = (star.y / star.z) * 320 + centerY
    const size = (1 - star.z / 1000) * 2
    const opacity = (1 - star.z / 1000) * 0.8

    // Draw the star trail (longer trail)
    const trailLength = 3
    ctx.strokeStyle = `${props.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`
    ctx.lineWidth = size
    ctx.beginPath()

    // Calculate trail direction based on movement towards center
    const centerDx = x - centerX
    const centerDy = y - centerY
    const distance = Math.sqrt(centerDx * centerDx + centerDy * centerDy)

    if (distance > 0) {
      const normalizedDx = centerDx / distance
      const normalizedDy = centerDy / distance
      const trailStartX = x + normalizedDx * size * trailLength
      const trailStartY = y + normalizedDy * size * trailLength

      ctx.moveTo(trailStartX, trailStartY)
      ctx.lineTo(x, y)
      ctx.stroke()
    }

    // Draw the glowing effect
    ctx.shadowColor = props.color
    ctx.shadowBlur = size * 2
    ctx.fillStyle = `${props.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`
    ctx.beginPath()
    ctx.arc(x, y, size / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
  }

  animationId.value = requestAnimationFrame(animate)
}

onMounted(() => {
  canvas = canvasRef.value!
  ctx = canvas.getContext('2d')!

  resizeCanvas()
  initializeStars()
  animate()

  window.addEventListener('resize', resizeCanvas)
})

onBeforeUnmount(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<template>
  <canvas
    ref="canvasRef"
    fixed inset-0 w="full" h="full"
    bg="neutral-1100"
    pointer-events="none"
  />
</template>
