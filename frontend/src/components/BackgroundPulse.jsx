import { useEffect, useRef } from 'react'

export default function BackgroundPulse({ mode = 'nodes', speed = 1, density = 40, color = '#0071e3', active = true }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    // If not active, do not render any animations
    if (!active) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let particles = []
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)
    let scrollY = window.scrollY

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    const handleScroll = () => {
      scrollY = window.scrollY
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Helper to convert hex to rgba
    function hexToRgba(hex, alpha) {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    // Particle class supporting parallax and pulsing sizes
    class Particle {
      constructor() {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.vx = (Math.random() - 0.5) * speed * 0.7
        this.vy = (Math.random() - 0.5) * speed * 0.7
        this.radius = Math.random() * 2.5 + 1.5
        this.pulse = Math.random() * Math.PI
        this.pulseSpeed = Math.random() * 0.015 + 0.005
        this.parallaxFactor = Math.random() * 0.5 + 0.15 // Speeds up as we scroll
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.pulse += this.pulseSpeed

        // Wrap around boundaries
        if (this.x < 0) this.x = width
        if (this.x > width) this.x = 0
        if (this.y < 0) this.y = height
        if (this.y > height) this.y = 0
      }

      draw(scrollOffset) {
        // Apply vertical parallax shift based on scroll
        const drawY = this.y - (scrollOffset * this.parallaxFactor)
        
        // Wrap around viewport heights for continuous flow
        let normalizedY = drawY % height
        if (normalizedY < 0) normalizedY += height

        const opacity = mode === 'ambient' 
          ? (Math.sin(this.pulse) * 0.12 + 0.15) 
          : (Math.sin(this.pulse) * 0.2 + 0.25)

        ctx.beginPath()
        ctx.arc(this.x, normalizedY, this.radius + Math.sin(this.pulse) * 1.2, 0, Math.PI * 2)
        ctx.fillStyle = hexToRgba(color, opacity)
        ctx.fill()
      }
    }

    // Initialize particles
    const initParticles = () => {
      particles = []
      const adjustedDensity = Math.min(density, Math.floor((width * height) / 18000))
      for (let i = 0; i < adjustedDensity; i++) {
        particles.push(new Particle())
      }
    }
    initParticles()

    // Waves phase parameter
    let waveOffset = 0

    // Main animation loops
    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // 1. RENDER STUNNING GLOWING RADIAL GRADIENT BLOBS (PARALLAX ENHANCED)
      if (mode !== 'ambient') {
        // Blob 1: Blue/Theme Color (Left Side Top)
        const blob1Y = height * 0.25 - (scrollY * 0.18)
        const blob1 = ctx.createRadialGradient(width * 0.2, blob1Y, 50, width * 0.2, blob1Y, 350)
        blob1.addColorStop(0, hexToRgba(color, 0.15))
        blob1.addColorStop(0.5, hexToRgba(color, 0.05))
        blob1.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = blob1
        ctx.beginPath()
        ctx.arc(width * 0.2, blob1Y, 350, 0, Math.PI * 2)
        ctx.fill()

        // Blob 2: Purple Glow (Right Side Middle)
        const blob2Y = height * 0.6 - (scrollY * 0.28)
        const blob2 = ctx.createRadialGradient(width * 0.8, blob2Y, 50, width * 0.8, blob2Y, 400)
        blob2.addColorStop(0, hexToRgba('#af52de', 0.12))
        blob2.addColorStop(0.5, hexToRgba('#af52de', 0.04))
        blob2.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = blob2
        ctx.beginPath()
        ctx.arc(width * 0.8, blob2Y, 400, 0, Math.PI * 2)
        ctx.fill()

        // Blob 3: Soft Emerald/Cyan (Bottom Center)
        const blob3Y = height * 0.9 - (scrollY * 0.35)
        const blob3 = ctx.createRadialGradient(width * 0.4, blob3Y, 20, width * 0.4, blob3Y, 300)
        blob3.addColorStop(0, hexToRgba('#10b981', 0.08))
        blob3.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = blob3
        ctx.beginPath()
        ctx.arc(width * 0.4, blob3Y, 300, 0, Math.PI * 2)
        ctx.fill()
      }

      // 2. RENDER THE INTERACTIVE MODES
      if (mode === 'nodes') {
        particles.forEach((p) => {
          p.update()
          p.draw(scrollY)
        })

        // Connections with parallax-aware calculations
        ctx.lineWidth = 0.6
        for (let i = 0; i < particles.length; i++) {
          const pi = particles[i]
          const piY = (pi.y - (scrollY * pi.parallaxFactor)) % height
          const drawPiY = piY < 0 ? piY + height : piY

          for (let j = i + 1; j < particles.length; j++) {
            const pj = particles[j]
            const pjY = (pj.y - (scrollY * pj.parallaxFactor)) % height
            const drawPjY = pjY < 0 ? pjY + height : pjY

            const dx = pi.x - pj.x
            const dy = drawPiY - drawPjY
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < 130) {
              const opacity = (1 - dist / 130) * 0.2
              ctx.strokeStyle = hexToRgba(color, opacity)
              ctx.beginPath()
              ctx.moveTo(pi.x, drawPiY)
              ctx.lineTo(pj.x, drawPjY)
              ctx.stroke()
            }
          }
        }
      } 
      else if (mode === 'waves') {
        waveOffset += 0.006 * speed
        ctx.lineWidth = 2

        for (let w = 0; w < 3; w++) {
          const opacity = 0.12 - w * 0.03
          ctx.strokeStyle = hexToRgba(color, opacity)
          ctx.beginPath()
          
          // Parallax scrolling wave offset
          const baseWaveY = height * (0.35 + w * 0.15) - (scrollY * 0.25)
          let normalizedWaveY = baseWaveY % height
          if (normalizedWaveY < 0) normalizedWaveY += height

          for (let x = 0; x < width; x += 8) {
            const frequency = 0.0025 + w * 0.0008
            const amplitude = 50 + w * 15
            const y = normalizedWaveY + Math.sin(x * frequency + waveOffset + w) * amplitude
            
            if (x === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.stroke()
        }
      } 
      else if (mode === 'ambient') {
        particles.forEach((p) => {
          p.update()
          p.draw(scrollY)
        })
      }
      else if (mode === 'grid') {
        ctx.strokeStyle = hexToRgba(color, 0.05)
        ctx.lineWidth = 1
        const gridSize = 70

        // Vertical lines with slight scroll rotation or drift
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, height)
          ctx.stroke()
        }

        // Horizontal lines shifting due to scroll (Parallax Grid!)
        const gridOffset = (scrollY * 0.25) % gridSize
        for (let y = gridOffset; y < height; y += gridSize) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
          ctx.stroke()
        }

        // Pulse points intersection dots
        particles.forEach((p) => {
          p.vx = p.vx > 0 ? 0.2 * speed : -0.2 * speed
          p.vy = 0
          p.update()
          
          const drawY = p.y - (scrollY * 0.25)
          let normalizedY = drawY % height
          if (normalizedY < 0) normalizedY += height

          ctx.beginPath()
          ctx.arc(p.x, normalizedY, 2.5, 0, Math.PI * 2)
          ctx.fillStyle = hexToRgba(color, 0.2)
          ctx.fill()
        })
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(animationFrameId)
    }
  }, [mode, speed, density, color, active])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ mixBlendMode: 'normal' }} // normal blending matches light mode clean glow beautifully
    />
  )
}
