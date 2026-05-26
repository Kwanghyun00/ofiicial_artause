"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  motion,
  useInView,
  animate,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion"

// ─────────────────────────────────────────────────────────────────────────────
// SHARED STATE — canvas reads this every frame (no re-render overhead)
// ─────────────────────────────────────────────────────────────────────────────
const STAGE = {
  spotNx: 0.15,   // spotlight normalized X (0–1), starts at left
  mouseVx: 0,     // mouse velocity X
  mouseVy: 0,     // mouse velocity Y
  mouseX: 0,      // mouse canvas X (px)
  mouseY: 0,      // mouse canvas Y (px)
  prevX: 0,
  prevY: 0,
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CUSTOM CURSOR
// ─────────────────────────────────────────────────────────────────────────────
function CustomCursor() {
  const mx = useMotionValue(-200)
  const my = useMotionValue(-200)
  const rx = useSpring(mx, { damping: 30, stiffness: 180 })
  const ry = useSpring(my, { damping: 30, stiffness: 180 })
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const onMove = (e: MouseEvent) => { mx.set(e.clientX); my.set(e.clientY); setVisible(true) }
    const onLeave = () => setVisible(false)
    const onOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a,button,[role=button]")) setHovered(true)
    }
    const onOut = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a,button,[role=button]")) setHovered(false)
    }
    window.addEventListener("mousemove", onMove)
    document.addEventListener("mouseleave", onLeave)
    document.addEventListener("mouseover", onOver)
    document.addEventListener("mouseout", onOut)
    return () => {
      window.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseleave", onLeave)
      document.removeEventListener("mouseover", onOver)
      document.removeEventListener("mouseout", onOut)
    }
  }, [mx, my])

  return (
    <>
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] hidden rounded-full border border-amber-400/38 md:block"
        style={{ left: rx, top: ry, x: "-50%", y: "-50%" }}
        animate={{ width: hovered ? 48 : 30, height: hovered ? 48 : 30, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      />
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] hidden rounded-full bg-amber-400 md:block"
        style={{ left: mx, top: my, x: "-50%", y: "-50%" }}
        animate={{ width: 5, height: 5, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.08 }}
      />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. FILM GRAIN
// ─────────────────────────────────────────────────────────────────────────────
function FilmGrain() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[90]"
      style={{
        opacity: 0.026,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "150px 150px",
      }}
      aria-hidden
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. STAGE CANVAS — velocity-distorted flow field + dynamic spotlight cone
//    마우스를 빠르게 움직이면 파티클 흐름이 교란됩니다 (물리 기반)
// ─────────────────────────────────────────────────────────────────────────────
function StageCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let t = 0

    const resize = () => {
      const dpr = devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Update STAGE mouse coords relative to canvas
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      STAGE.mouseX = e.clientX - rect.left
      STAGE.mouseY = e.clientY - rect.top
      STAGE.mouseVx = e.clientX - STAGE.prevX
      STAGE.mouseVy = e.clientY - STAGE.prevY
      STAGE.prevX = e.clientX
      STAGE.prevY = e.clientY
    }
    window.addEventListener("mousemove", onMove, { passive: true })

    const W = () => canvas.offsetWidth
    const H = () => canvas.offsetHeight

    type P = {
      x: number; y: number
      vx: number; vy: number
      life: number; maxLife: number
      size: number
    }

    const mkP = (): P => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      vx: 0, vy: 0,
      life: Math.random() * 180,
      maxLife: 180 + Math.random() * 140,
      size: Math.random() * 1.3 + 0.25,
    })

    const pts: P[] = Array.from({ length: 85 }, mkP)

    const tick = () => {
      t += 0.0035

      // Partial clear → trailing / haze effect
      ctx.fillStyle = "rgba(5,5,14,0.13)"
      ctx.fillRect(0, 0, W(), H())

      // ── Spotlight cone ──────────────────────────────────
      const spx = W() * STAGE.spotNx
      const spy = -28
      const baseDir = Math.PI / 2   // pointing down
      const sideAngle = (STAGE.spotNx - 0.5) * 0.6
      const dir = baseDir + sideAngle
      const halfA = 0.30
      const cLen = H() * 1.55

      const l1x = spx + Math.cos(dir - halfA) * cLen
      const l1y = spy + Math.sin(dir - halfA) * cLen
      const l2x = spx + Math.cos(dir + halfA) * cLen
      const l2y = spy + Math.sin(dir + halfA) * cLen

      const coneGrad = ctx.createRadialGradient(spx, spy, 0, spx, spy, cLen)
      coneGrad.addColorStop(0,    "rgba(205,168,62,0.20)")
      coneGrad.addColorStop(0.22, "rgba(205,168,62,0.08)")
      coneGrad.addColorStop(0.55, "rgba(205,168,62,0.025)")
      coneGrad.addColorStop(1,    "rgba(205,168,62,0)")

      ctx.save()
      ctx.beginPath()
      ctx.moveTo(spx, spy)
      ctx.lineTo(l1x, l1y)
      ctx.lineTo(l2x, l2y)
      ctx.closePath()
      ctx.fillStyle = coneGrad
      ctx.fill()
      ctx.restore()

      // ── Flow field particles ─────────────────────────────
      const velMag = Math.min(Math.sqrt(STAGE.mouseVx ** 2 + STAGE.mouseVy ** 2), 30)

      for (const p of pts) {
        p.life++
        if (p.life >= p.maxLife) {
          Object.assign(p, mkP())
          continue
        }

        const prog = p.life / p.maxLife
        const baseOp =
          prog < 0.12 ? prog / 0.12 :
          prog > 0.82 ? (1 - prog) / 0.18 : 1

        // Flow field angle — smooth noise approximation
        const noiseAngle =
          Math.sin(p.x * 0.0065 + t) * 1.6 +
          Math.cos(p.y * 0.008 + t * 0.75) * 1.1 +
          Math.sin((p.x + p.y) * 0.0045 + t * 0.5) * 0.6

        // Mouse velocity disturbance — physics-based ripple
        const dxM = p.x - STAGE.mouseX
        const dyM = p.y - STAGE.mouseY
        const distM = Math.sqrt(dxM * dxM + dyM * dyM)
        const disturbRadius = 120 + velMag * 3
        let disturbAngle = 0
        if (distM < disturbRadius && velMag > 1) {
          const influence = (1 - distM / disturbRadius) * velMag * 0.05
          disturbAngle = Math.atan2(STAGE.mouseVy, STAGE.mouseVx) * influence
        }

        const finalAngle = noiseAngle + disturbAngle

        p.vx += Math.cos(finalAngle) * 0.055
        p.vy += Math.sin(finalAngle) * 0.055 - 0.018  // slight upward drift
        p.vx *= 0.935
        p.vy *= 0.935
        p.x  += p.vx
        p.y  += p.vy

        // Wrap
        if (p.x < -8) p.x = W() + 8
        if (p.x > W() + 8) p.x = -8
        if (p.y < -8 || p.y > H() + 8) Object.assign(p, mkP())

        // Spotlight cone brightness boost
        const dxS = p.x - spx
        const dyS = p.y - spy
        const pAngle = Math.atan2(dyS, dxS)
        const aDiff = Math.abs(((pAngle - dir + Math.PI * 3) % (Math.PI * 2)) - Math.PI)
        const distS = Math.sqrt(dxS * dxS + dyS * dyS)
        const inCone = aDiff < halfA && dyS > 0
        const coneBoost = inCone ? Math.max(0, 1 - distS / (cLen * 0.75)) * 0.45 : 0

        const finalOp = Math.min(0.75, baseOp * 0.22 + coneBoost)
        const finalSz = p.size * (1 + coneBoost * 1.8)

        ctx.beginPath()
        ctx.arc(p.x, p.y, finalSz, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(205,168,62,${finalOp})`
        ctx.fill()
      }

      // Dampen velocity over time
      STAGE.mouseVx *= 0.82
      STAGE.mouseVy *= 0.82

      animId = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      window.removeEventListener("mousemove", onMove)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      className={`pointer-events-none ${className ?? ""}`}
      aria-hidden
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CURTAIN CANVAS — 무대 조명이 하나씩 켜지며 어둠을 걷어내는 연출
//
// 연출 흐름:
//   ① 검은 캔버스 오버레이 (커튼)
//   ② 무대 상단에서 조명이 하나씩 켜짐 (destination-out으로 구멍 뚫기)
//   ③ 조명 테두리 황금빛 번짐 (lighter 블렌딩)
//   ④ 중앙 조명에 플리커(깜박임) 효과 → 구형 극장 느낌
//   ⑤ 전체 화면 노출 → 짧은 앰버 플래시 → 캔버스 페이드아웃
// ─────────────────────────────────────────────────────────────────────────────
function CurtainCanvas({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [opacity, setOpacity] = useState(1)
  const doneCalledRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = devicePixelRatio || 1
    const W = window.innerWidth
    const H = window.innerHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = W + "px"
    canvas.style.height = H + "px"
    ctx.scale(dpr, dpr)

    // ── 조명 정의 (normalized 0-1 좌표)
    const DIAG = Math.sqrt(W * W + H * H)
    const spots = [
      // 중앙 주조명 — 가장 크고, 플리커 있음
      { nx: 0.50, ny: 0,    maxR: DIAG * 0.62, delay: 380,  dur: 820, flicker: true  },
      // 좌우 보조 조명
      { nx: 0.23, ny: 0,    maxR: DIAG * 0.48, delay: 640,  dur: 640, flicker: false },
      { nx: 0.77, ny: 0,    maxR: DIAG * 0.48, delay: 720,  dur: 640, flicker: false },
      // 측면 필인 조명
      { nx: 0.04, ny: 0.45, maxR: W  * 0.52,   delay: 860,  dur: 520, flicker: false },
      { nx: 0.96, ny: 0.45, maxR: W  * 0.52,   delay: 920,  dur: 520, flicker: false },
    ]

    // 플리커 커브 — 구형 형광등이 켜질 때 느낌
    const flicker = (p: number): number => {
      if (p < 0.04) return p / 0.04           // 빠른 점등
      if (p < 0.07) return 0.15               // 꺼짐
      if (p < 0.10) return 0.95               // 재점등
      if (p < 0.12) return 0.10               // 다시 꺼짐
      if (p < 0.15) return 1.00               // 안정
      if (p < 0.16) return 0.45               // 미세 흔들
      return 1.00                             // 완전 안정
    }

    // ease-out quart — 빠르게 팽창 후 서서히 멈춤
    const ease = (t: number) => 1 - Math.pow(1 - t, 3.5)

    let animId: number
    let running = true
    let startTime: number | null = null

    const tick = (now: number) => {
      if (!running) return
      if (!startTime) startTime = now
      const elapsed = now - startTime

      // ── ① 검은 배경 채우기
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = "#04040c"
      ctx.fillRect(0, 0, W, H)

      let allDone = true

      // ── ② destination-out으로 구멍 뚫기
      ctx.globalCompositeOperation = "destination-out"
      for (const s of spots) {
        const se = elapsed - s.delay
        if (se < 0) { allDone = false; continue }

        const rawP = Math.min(se / s.dur, 1)
        if (rawP < 1) allDone = false

        const mul = s.flicker ? flicker(rawP) : 1
        const r = ease(rawP) * s.maxR * mul

        const x = s.nx * W
        const y = s.ny * H

        const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(r, 1))
        g.addColorStop(0,    "rgba(255,255,255,1)")
        g.addColorStop(0.82, "rgba(255,255,255,0.97)")
        g.addColorStop(1,    "rgba(255,255,255,0)")

        ctx.beginPath()
        ctx.arc(x, y, Math.max(r, 1), 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
      }
      ctx.globalCompositeOperation = "source-over"

      // ── ③ 조명 테두리 황금빛 번짐
      ctx.globalCompositeOperation = "lighter"
      for (const s of spots) {
        const se = elapsed - s.delay
        if (se < 0) continue

        const rawP = Math.min(se / s.dur, 1)
        const mul = s.flicker ? flicker(rawP) : 1
        const r = ease(rawP) * s.maxR * mul
        if (r < 2) continue

        // 팽창 중일수록 테두리 글로우가 강함
        const glowStr = (1 - rawP) * 0.28 + 0.06
        const x = s.nx * W
        const y = s.ny * H

        const gg = ctx.createRadialGradient(x, y, r * 0.78, x, y, r * 1.18)
        gg.addColorStop(0,   "rgba(205,168,62,0)")
        gg.addColorStop(0.5, `rgba(205,168,62,${glowStr})`)
        gg.addColorStop(1,   "rgba(205,168,62,0)")

        ctx.beginPath()
        ctx.arc(x, y, r * 1.18, 0, Math.PI * 2)
        ctx.fillStyle = gg
        ctx.fill()
      }
      ctx.globalCompositeOperation = "source-over"

      // ── ④ 완전히 열리면 → 앰버 플래시 후 페이드아웃
      if (allDone && !doneCalledRef.current) {
        doneCalledRef.current = true
        running = false

        // 앰버 플래시 오버레이 (CSS로 처리)
        setTimeout(() => {
          setOpacity(0)
          setTimeout(onDone, 450)
        }, 80)
        return
      }

      animId = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)
    return () => {
      running = false
      cancelAnimationFrame(animId)
    }
  }, [onDone])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[60]"
      style={{
        opacity,
        transition: opacity === 0 ? "opacity 0.45s cubic-bezier(0.4,0,0.2,1)" : "none",
      }}
      aria-hidden
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. 3D TILT CARD
// ─────────────────────────────────────────────────────────────────────────────
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const rX = useMotionValue(0)
  const rY = useMotionValue(0)
  const srX = useSpring(rX, { damping: 30, stiffness: 280 })
  const srY = useSpring(rY, { damping: 30, stiffness: 280 })
  const gX = useMotionValue(50)
  const gY = useMotionValue(50)
  const bg = useMotionTemplate`radial-gradient(circle at ${gX}% ${gY}%, rgba(205,168,62,0.11) 0%, transparent 55%)`

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    rX.set(-y * 8)
    rY.set(x * 8)
    gX.set(((e.clientX - rect.left) / rect.width) * 100)
    gY.set(((e.clientY - rect.top) / rect.height) * 100)
  }, [rX, rY, gX, gY])

  const onLeave = useCallback(() => { rX.set(0); rY.set(0) }, [rX, rY])

  return (
    <motion.div
      ref={ref}
      className={`relative ${className ?? ""}`}
      style={{ rotateX: srX, rotateY: srY, transformPerspective: 720 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <motion.div className="pointer-events-none absolute inset-0 rounded-2xl" style={{ background: bg }} />
      {children}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. MAGNETIC BUTTON
// ─────────────────────────────────────────────────────────────────────────────
function MagneticButton({
  href, children, variant = "primary",
}: { href: string; children: React.ReactNode; variant?: "primary" | "outline" }) {
  const bx = useMotionValue(0)
  const by = useMotionValue(0)
  const sx = useSpring(bx, { damping: 20, stiffness: 280 })
  const sy = useSpring(by, { damping: 20, stiffness: 280 })

  const onMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    bx.set((e.clientX - (rect.left + rect.width / 2)) * 0.3)
    by.set((e.clientY - (rect.top + rect.height / 2)) * 0.3)
  }, [bx, by])
  const onLeave = useCallback(() => { bx.set(0); by.set(0) }, [bx, by])

  const cls = variant === "primary"
    ? "rounded-full bg-amber-500 px-9 py-4 text-sm font-bold text-black tracking-wide hover:bg-amber-400 transition-colors inline-block"
    : "rounded-full border border-white/16 px-9 py-4 text-sm font-semibold text-white/50 tracking-wide hover:bg-white/6 hover:text-white/85 transition-all inline-block"

  return (
    <motion.a href={href} className={cls} style={{ x: sx, y: sy }} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </motion.a>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — HERO
//
// 인터랙션 의미: 마우스 좌우 = 스포트라이트 방향 조종 (조명 기사 메타포)
// 연출: 스포트라이트가 왼쪽에서 스윕 → 타이틀을 "찾아" 고정 → 이후 마우스 반응
// 텍스트: clip-path wipe reveal (글자 낙하 X, 영화적 와이프)
// ─────────────────────────────────────────────────────────────────────────────
function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [textIn, setTextIn] = useState(false)
  const [interactive, setInteractive] = useState(false)

  // Parallax for depth layers
  const pmx = useMotionValue(0)
  const pmy = useMotionValue(0)
  const spmx = useSpring(pmx, { damping: 50, stiffness: 80 })
  const spmy = useSpring(pmy, { damping: 50, stiffness: 80 })
  const titleShiftX = useTransform(spmx, [-0.5, 0.5], ["-7px", "7px"])
  const titleShiftY = useTransform(spmy, [-0.5, 0.5], ["-4px", "4px"])
  const tagShiftX = useTransform(spmx, [-0.5, 0.5], ["5px", "-5px"])

  // Parallax tracking
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      pmx.set((e.clientX - rect.left) / rect.width - 0.5)
      pmy.set((e.clientY - rect.top) / rect.height - 0.5)
    }
    el.addEventListener("mousemove", onMove, { passive: true })
    return () => el.removeEventListener("mousemove", onMove)
  }, [pmx, pmy])

  // CurtainCanvas onDone → spotlight sweep → text → interactive
  const handleCurtainDone = useCallback(() => {
    setTextIn(true)
    let start: number | null = null
    const sweep = (now: number) => {
      if (!start) start = now
      const p = Math.min((now - start) / 1500, 1)
      const e = 1 - Math.pow(1 - p, 3)
      STAGE.spotNx = 0.15 + e * 0.35
      if (p < 1) requestAnimationFrame(sweep)
      else setInteractive(true)
    }
    requestAnimationFrame(sweep)
  }, [])

  // After interactive: mouse controls spotlight
  useEffect(() => {
    if (!interactive) return
    const onMove = (e: MouseEvent) => {
      STAGE.spotNx = 0.5 + (e.clientX / window.innerWidth - 0.5) * 0.5
    }
    window.addEventListener("mousemove", onMove, { passive: true })
    return () => window.removeEventListener("mousemove", onMove)
  }, [interactive])

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#05050e]"
    >
      <StageCanvas className="absolute inset-0 h-full w-full" />

      {/* Stage floor reflection */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-40"
        style={{ background: "linear-gradient(to top, rgba(205,168,62,0.04) 0%, transparent)" }}
      />

      {/* ── CURTAIN — 조명 점등 방식 ── */}
      <CurtainCanvas onDone={handleCurtainDone} />

      {/* ── CONTENT ─────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center gap-5 px-6 text-center">

        {/* Pre-label — simple, no badge frame */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: textIn ? 1 : 0 }}
          transition={{ duration: 0.7, delay: 0 }}
        >
          <div className="h-px w-6 bg-amber-500/35" />
          <span
            className="text-[10px] tracking-[0.28em] text-amber-400/55 uppercase"
            style={{ fontFamily: '"Libre Baskerville", serif' }}
          >
            Performance Marketing Partner
          </span>
          <div className="h-px w-6 bg-amber-500/35" />
        </motion.div>

        {/* ARTAUSE — clip-path wipe reveal (영화적 와이프, 글자 낙하 X) */}
        <motion.div style={{ x: titleShiftX, y: titleShiftY }}>
          <motion.h1
            className="leading-none tracking-[-0.02em]"
            style={{
              fontSize: "clamp(4.8rem, 14vw, 11rem)",
              fontFamily: '"Libre Baskerville", serif',
              fontWeight: 700,
              color: "rgba(238,222,195,0.92)",
              textShadow: "0 0 120px rgba(205,168,62,0.12)",
            }}
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: textIn ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
            transition={{ duration: 1.5, delay: 0.1, ease: [0.76, 0, 0.24, 1] }}
          >
            ARTAUSE
          </motion.h1>
        </motion.div>

        {/* Divider line */}
        <motion.div
          style={{
            width: "min(50%, 340px)", height: "1px",
            background: "linear-gradient(to right, transparent, rgba(205,168,62,0.45), transparent)",
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: textIn ? 1 : 0 }}
          transition={{ duration: 1.1, delay: 0.7, ease: "easeOut" }}
        />

        {/* Tagline */}
        <motion.p
          className="font-light tracking-[0.22em] text-amber-100/45"
          style={{
            fontSize: "clamp(0.9rem, 2vw, 1.4rem)",
            fontFamily: '"Noto Serif KR", serif',
            x: tagShiftX,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: textIn ? 1 : 0 }}
          transition={{ duration: 0.9, delay: 0.85 }}
        >
          공연예술을 세상과 잇다
        </motion.p>

        <motion.p
          className="max-w-xs text-sm leading-loose tracking-wide text-white/25"
          initial={{ opacity: 0 }}
          animate={{ opacity: textIn ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 1.05 }}
        >
          연극 · 뮤지컬 · 클래식 · 무용<br />모든 무대를 더 많은 관객과 연결합니다
        </motion.p>

        <motion.div
          className="mt-3 flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: textIn ? 1 : 0, y: textIn ? 0 : 14 }}
          transition={{ duration: 0.6, delay: 1.25 }}
        >
          <MagneticButton href="/services">서비스 알아보기</MagneticButton>
          <MagneticButton href="/contact" variant="outline">파트너 문의</MagneticButton>
        </motion.div>

        {/* Spotlight hint — interactive indicator */}
        <motion.p
          className="mt-2 text-[10px] tracking-[0.2em] text-white/20 uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: interactive ? 1 : 0 }}
          transition={{ duration: 1.2, delay: 0 }}
        >
          ← 마우스로 조명을 움직여보세요 →
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: textIn ? 0.55 : 0 }}
        transition={{ duration: 0.6, delay: 1.6 }}
      >
        <span className="text-[9px] tracking-[0.32em] text-white/28 uppercase">Scroll</span>
        <motion.div
          className="h-5 w-px"
          style={{ background: "linear-gradient(to bottom, rgba(205,168,62,0.45), transparent)" }}
          animate={{ scaleY: [1, 0.2, 1], opacity: [0.55, 0.1, 0.55] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 38%, rgba(0,0,0,0.48) 100%)" }}
      />
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — MANIFESTO
//
// 인터랙션 의미: 스크롤 = 공연 장면 전환
// 각 줄은 항상 존재하지만 어둠 속에 있음 → 스크롤로 해당 줄에 조명이 들어옴
// 스크롤을 지나치면 다시 어두워짐 (once: false)
// ─────────────────────────────────────────────────────────────────────────────
const MANIFESTO_LINES = [
  { ko: "우리는 공연을 믿습니다",          en: "We believe in live performance" },
  { ko: "무대 위의 순간은 단 한 번뿐입니다", en: "A moment on stage only happens once" },
  { ko: "관객과 예술가 사이에서",           en: "Between audience and artist" },
  { ko: "우리가 다리가 됩니다",             en: "We become the bridge" },
]

function ManifestoLine({ line, index }: { line: typeof MANIFESTO_LINES[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  // once: false — 스크롤 지나치면 다시 어두워짐
  const inView = useInView(ref, { once: false, margin: "-15% 0px -25% 0px" })

  return (
    <motion.div
      ref={ref}
      className="group flex cursor-default items-baseline gap-5 border-b border-white/[0.05] py-6"
      animate={{ opacity: inView ? 1 : 0.1 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
    >
      <span className="w-6 shrink-0 text-right font-mono text-[10px] text-amber-500/30">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h2
        className="flex-1 font-light leading-tight"
        style={{
          fontSize: "clamp(1.6rem, 3.8vw, 3rem)",
          fontFamily: '"Noto Serif KR", serif',
          color: inView ? "rgba(240,230,210,0.90)" : "rgba(240,230,210,0.9)",
        }}
      >
        {line.ko}
      </h2>
      <motion.span
        className="ml-auto hidden shrink-0 text-[10px] tracking-[0.22em] text-white/18 uppercase md:block"
        animate={{ opacity: inView ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        {line.en}
      </motion.span>
    </motion.div>
  )
}

function ManifestoSection() {
  return (
    <section className="relative overflow-hidden bg-[#040409] py-36 px-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 45% 40% at 50% 50%, rgba(100,65,10,0.07) 0%, transparent 65%)" }}
      />
      <div className="mx-auto max-w-5xl">
        {MANIFESTO_LINES.map((line, i) => (
          <ManifestoLine key={i} line={line} index={i} />
        ))}
      </div>
      <motion.p
        className="mx-auto mt-16 max-w-lg text-center text-sm leading-loose tracking-wide text-white/18 font-light"
        style={{ fontFamily: '"Libre Baskerville", serif', fontStyle: "italic" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ delay: 0.3 }}
      >
        &ldquo;공연예술은 그 순간에만 존재합니다.<br />
        그 소중한 순간을 더 많은 사람에게 전하는 것,<br />
        그것이 알터즈가 하는 일입니다.&rdquo;
      </motion.p>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — SERVICES
//
// 인터랙션 의미: 한 서비스에 집중하면 나머지가 어두워짐 (스포트라이트 집중)
// ─────────────────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    num: "01", title: "초대권 이벤트", sub: "Invitation Campaign",
    desc: "공연 초대권을 추첨 이벤트로 운영합니다. 이벤트 페이지 생성부터 당첨자 안내까지 전 과정을 대행합니다.",
    accent: "rgba(205,168,62,",
  },
  {
    num: "02", title: "SNS 콘텐츠", sub: "Social Content",
    desc: "공연을 알리는 카드뉴스, 릴스, 숏폼을 직접 제작합니다. 기획부터 촬영·편집까지 인력 기반으로 운영합니다.",
    accent: "rgba(200,88,28,",
  },
  {
    num: "03", title: "플랫폼 노출", sub: "Platform Discovery",
    desc: "알터즈 플랫폼에 공연을 등록하고 초대권 이벤트와 연결합니다. 공연을 찾는 관객에게 직접 노출됩니다.",
    accent: "rgba(88,68,188,",
  },
]

function ServicesSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const [focused, setFocused] = useState<number | null>(null)

  return (
    <section ref={ref} className="relative bg-[#05050e] py-32 px-6">
      <div className="mx-auto mb-20 max-w-6xl">
        <div className="mb-3 flex items-center gap-4">
          <motion.span
            className="font-mono text-[10px] tracking-[0.3em] text-amber-500/38 uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: inView ? 1 : 0 }}
            transition={{ delay: 0.1 }}
          >
            Services
          </motion.span>
          <motion.div
            className="h-px flex-1 bg-white/[0.06]"
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: inView ? 1 : 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
          />
        </div>
        <motion.h2
          className="font-light leading-tight text-white/88"
          style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontFamily: '"Noto Serif KR", serif' }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 18 }}
          transition={{ duration: 0.7, delay: 0.28 }}
        >
          세 개의 조명,<br />하나의 무대
        </motion.h2>
      </div>

      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
        {SERVICES.map((svc, i) => (
          <motion.div
            key={svc.num}
            initial={{ opacity: 0, y: 46 }}
            animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 46 }}
            transition={{ duration: 0.72, delay: i * 0.13, ease: [0.16, 1, 0.3, 1] }}
            // Spotlight focus: unfocused cards go dim
            whileHover={{ opacity: 1 }}
            style={{ opacity: focused !== null && focused !== i ? 0.3 : 1 }}
            onHoverStart={() => setFocused(i)}
            onHoverEnd={() => setFocused(null)}
          >
            <TiltCard className="group h-full overflow-hidden rounded-2xl border border-white/[0.065] bg-white/[0.022] p-8 backdrop-blur-sm transition-colors duration-400 hover:border-white/10">
              <div className="relative z-10 flex h-full flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-[0.22em] text-white/22">{svc.num}</span>
                  <div
                    className="h-px flex-1 ml-4 opacity-15"
                    style={{ background: `linear-gradient(to right, ${svc.accent}0.6), transparent)` }}
                  />
                </div>
                <div className="flex-1">
                  <h3
                    className="mb-1 text-xl font-semibold text-white/88"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    {svc.title}
                  </h3>
                  <p className="text-[10px] tracking-[0.22em] text-white/22 uppercase">{svc.sub}</p>
                </div>
                <p className="text-sm leading-relaxed text-white/38 group-hover:text-white/52 transition-colors duration-300">
                  {svc.desc}
                </p>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// GENRE MARQUEE
// ─────────────────────────────────────────────────────────────────────────────
const GENRES = [
  "연극", "뮤지컬", "클래식", "무용", "오페라",
  "국악", "재즈", "현대무용", "발레", "어린이극",
  "즉흥연주", "실험극", "낭독공연", "마임", "서커스",
]

function GenreMarquee() {
  const doubled = [...GENRES, ...GENRES]
  return (
    <div className="relative overflow-hidden bg-[#030308] py-7 border-y border-white/[0.04]">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((g, i) => (
          <span key={i} className="inline-flex items-center gap-4 px-5">
            <span className="h-0.5 w-0.5 rounded-full bg-amber-500/28" />
            <span
              className="text-[10px] tracking-[0.32em] text-white/20 uppercase"
              style={{ fontFamily: '"Libre Baskerville", serif' }}
            >
              {g}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────────────────────────────
function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView || !ref.current) return
    const ctrl = animate(0, to, {
      duration: 2.5, ease: "easeOut",
      onUpdate: (v) => { if (ref.current) ref.current.textContent = Math.round(v).toLocaleString("ko-KR") + suffix },
    })
    return () => ctrl.stop()
  }, [inView, to, suffix])

  return <span ref={ref}>0{suffix}</span>
}

const STATS = [
  { to: 120, suffix: "+", label: "진행 이벤트",    sub: "Total Campaigns" },
  { to: 8500, suffix: "+", label: "참여 관객",     sub: "Audience Members" },
  { to: 35, suffix: "+",  label: "파트너 공연단체", sub: "Partner Companies" },
  { to: 92, suffix: "%",  label: "파트너 재계약률", sub: "Renewal Rate" },
]

function StatsSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: "-90px" })

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#030308] py-32 px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "linear-gradient(rgba(205,168,62,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(205,168,62,0.5) 1px, transparent 1px)",
          backgroundSize: "58px 58px",
        }}
      />
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-14 flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: inView ? 1 : 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="h-px w-7 bg-amber-500/32" />
          <span className="font-mono text-[10px] tracking-[0.3em] text-amber-500/38 uppercase">Numbers</span>
        </motion.div>

        <div className="grid grid-cols-2 overflow-hidden rounded-2xl bg-white/[0.032] gap-px md:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              className="group relative bg-[#030308] px-8 py-12 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: inView ? 1 : 0 }}
              transition={{ delay: i * 0.1 + 0.2 }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(205,168,62,0.055) 0%, transparent 68%)" }}
              />
              <div className="relative">
                <div
                  className="font-mono font-bold leading-none tabular-nums text-amber-400"
                  style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)" }}
                >
                  <CountUp to={stat.to} suffix={stat.suffix} />
                </div>
                <div className="mt-3 text-sm font-medium text-white/58">{stat.label}</div>
                <div className="mt-1 text-[10px] tracking-[0.22em] text-white/18 uppercase">{stat.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.p
          className="mt-5 text-center text-[10px] text-white/15"
          initial={{ opacity: 0 }}
          animate={{ opacity: inView ? 1 : 0 }}
          transition={{ delay: 0.9 }}
        >
          * 2024년 기준 누적 운영 실적
        </motion.p>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  { n: "01", title: "상담", desc: "공연 일정, 목표, 예산에 맞는 서비스를 함께 기획합니다." },
  { n: "02", title: "제작", desc: "이벤트 페이지, SNS 콘텐츠, 플랫폼 등록을 진행합니다." },
  { n: "03", title: "운영", desc: "이벤트 기간 동안 참여 현황을 실시간으로 관리합니다." },
  { n: "04", title: "결과", desc: "추첨 및 당첨자 안내, 결과 리포트를 공유합니다." },
]

function ProcessSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: "-70px" })

  return (
    <section ref={ref} className="relative bg-[#05050e] py-32 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16">
          <motion.span
            className="font-mono text-[10px] tracking-[0.3em] text-amber-500/38 uppercase"
            initial={{ opacity: 0 }} animate={{ opacity: inView ? 1 : 0 }}
          >Process</motion.span>
          <motion.h2
            className="mt-3 font-light leading-tight text-white/86"
            style={{ fontSize: "clamp(1.9rem, 4vw, 2.8rem)", fontFamily: '"Noto Serif KR", serif' }}
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 18 }}
            transition={{ delay: 0.2 }}
          >
            막이 오르기까지
          </motion.h2>
        </div>
        <div className="relative">
          <motion.div
            className="pointer-events-none absolute top-6 left-6 right-6 hidden h-px md:block"
            style={{ background: "linear-gradient(to right, rgba(205,168,62,0.32), rgba(205,168,62,0.1), transparent)" }}
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: inView ? 1 : 0 }}
            transition={{ duration: 1.3, delay: 0.4 }}
          />
          <div className="grid gap-10 md:grid-cols-4">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 24 }}
                transition={{ duration: 0.6, delay: i * 0.13 + 0.32 }}
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/[0.06]">
                  <span className="font-mono text-[10px] text-amber-400/75">{step.n}</span>
                </div>
                <h3 className="mb-2 text-base font-semibold text-white/82">{step.title}</h3>
                <p className="text-sm leading-relaxed text-white/32">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CTA
// ─────────────────────────────────────────────────────────────────────────────
function CTASection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: "-90px" })

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#040409] py-44 px-6 text-center">
      <StageCanvas className="absolute inset-0 h-full w-full" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 38% 48% at 50% 50%, rgba(205,168,62,0.10) 0%, transparent 62%)" }}
      />
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-amber-700/28 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-t from-amber-700/28 to-transparent" />

      <div className="relative mx-auto max-w-xl">
        <motion.span
          className="font-mono text-[10px] tracking-[0.3em] text-amber-500/32 uppercase"
          initial={{ opacity: 0 }} animate={{ opacity: inView ? 1 : 0 }}
        >
          Curtain Call
        </motion.span>
        <motion.h2
          className="mt-6 font-light leading-tight text-white/94"
          style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", fontFamily: '"Noto Serif KR", serif' }}
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 28 }}
          transition={{ delay: 0.2 }}
        >
          막을 함께<br />올려보세요
        </motion.h2>
        <motion.p
          className="mx-auto mt-6 max-w-sm text-base leading-relaxed text-white/30"
          initial={{ opacity: 0 }} animate={{ opacity: inView ? 1 : 0 }} transition={{ delay: 0.4 }}
        >
          공연 마케팅이 필요하신가요?<br />알터즈가 함께 기획합니다.
        </motion.p>
        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 18 }}
          transition={{ delay: 0.58 }}
        >
          <MagneticButton href="/contact">파트너 문의하기</MagneticButton>
          <MagneticButton href="/services" variant="outline">서비스 보기</MagneticButton>
        </motion.div>
        <motion.div
          className="mt-10 flex items-center justify-center gap-5 text-xs text-white/18"
          initial={{ opacity: 0 }} animate={{ opacity: inView ? 1 : 0 }} transition={{ delay: 0.82 }}
        >
          <span>artause@gmail.com</span>
          <span className="h-3 w-px bg-white/14" />
          <a href="https://www.instagram.com/artause" target="_blank" rel="noopener noreferrer"
            className="transition-colors hover:text-white/42">@artause</a>
        </motion.div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export function CompanyHomePage() {
  useEffect(() => {
    const style = document.createElement("style")
    style.id = "company-cursor-hide"
    style.textContent = "@media (pointer: fine) { * { cursor: none !important; } }"
    document.head.appendChild(style)
    return () => document.getElementById("company-cursor-hide")?.remove()
  }, [])

  return (
    <div className="bg-[#05050e]">
      <CustomCursor />
      <FilmGrain />
      <HeroSection />
      <ManifestoSection />
      <ServicesSection />
      <GenreMarquee />
      <StatsSection />
      <ProcessSection />
      <CTASection />
    </div>
  )
}
