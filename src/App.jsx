import { useState, useMemo, useRef } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────
const SC = 36
const PAD = 22
const FF = 'rgba(0,210,230,0.07)'
const FS = '#00d4e8'
const FSW = 1.5
const DC = '#fbbf24'
const LC = 'rgba(148,163,184,0.7)'

// ─── Shapes Config ────────────────────────────────────────────────────────────
const SHAPES = [
  {
    id: 'kubus', label: 'Kubus', emoji: '🎲',
    fields: [{ k: 'a', lbl: 'Sisi (a)', def: 10 }],
  },
  {
    id: 'balok', label: 'Balok', emoji: '📦',
    fields: [
      { k: 'p', lbl: 'Panjang (p)', def: 12 },
      { k: 'l', lbl: 'Lebar (l)', def: 8 },
      { k: 't', lbl: 'Tinggi (t)', def: 6 },
    ],
  },
  {
    id: 'prisma', label: 'Prisma Segitiga', emoji: '🔻',
    fields: [
      { k: 'a', lbl: 'Alas Segitiga (a)', def: 10 },
      { k: 'len', lbl: 'Panjang Prisma (l)', def: 14 },
    ],
  },
  {
    id: 'limas', label: 'Limas Segiempat', emoji: '🔺',
    fields: [
      { k: 'a', lbl: 'Sisi Alas (a)', def: 10 },
      { k: 's', lbl: 'Tinggi Sisi (s)', def: 8 },
    ],
  },
  {
    id: 'tabung', label: 'Tabung', emoji: '🥤',
    fields: [
      { k: 'r', lbl: 'Jari-jari (r)', def: 5 },
      { k: 'h', lbl: 'Tinggi (h)', def: 12 },
    ],
  },
  {
    id: 'kerucut', label: 'Kerucut', emoji: '🍦',
    fields: [
      { k: 'r', lbl: 'Jari-jari (r)', def: 5 },
      { k: 'h', lbl: 'Tinggi (h)', def: 12 },
    ],
  },
]

// ─── SVG Atoms ───────────────────────────────────────────────────────────────
const FaceRect = ({ x, y, w, h, lbl }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={FF} stroke={FS} strokeWidth={FSW} />
    {lbl && (
      <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="middle"
        fill={LC} fontSize={9} fontFamily="monospace">{lbl}</text>
    )}
  </g>
)

const FacePoly = ({ pts, lbl, cx, cy }) => (
  <g>
    <polygon points={pts} fill={FF} stroke={FS} strokeWidth={FSW} />
    {lbl && (
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        fill={LC} fontSize={9} fontFamily="monospace">{lbl}</text>
    )}
  </g>
)

const DimText = ({ x, y, t, anchor = 'middle' }) => (
  <text x={x} y={y} textAnchor={anchor} dominantBaseline="middle"
    fill={DC} fontSize={10} fontFamily="monospace" fontWeight="bold">{t}</text>
)

// ─── Net Renderers ────────────────────────────────────────────────────────────
function netKubus({ a }) {
  const A = a * SC
  const faces = [
    { x: A,     y: 0,   lbl: 'atas' },
    { x: 0,     y: A,   lbl: 'kiri' },
    { x: A,     y: A,   lbl: 'depan' },
    { x: 2 * A, y: A,   lbl: 'kanan' },
    { x: 3 * A, y: A,   lbl: 'belakang' },
    { x: A,     y: 2*A, lbl: 'bawah' },
  ]
  return {
    W: 4 * A, H: 3 * A,
    els: [
      ...faces.map((f, i) => <FaceRect key={i} x={f.x} y={f.y} w={A} h={A} lbl={f.lbl} />),
      <DimText key="d1" x={A + A/2} y={-12} t={`${a} cm`} />,
      <DimText key="d2" x={-12} y={A + A/2} t={`${a}`} anchor="end" />,
    ],
  }
}

function netBalok({ p, l, t }) {
  const P = p * SC, L = l * SC, T = t * SC
  const faces = [
    { x: L,         y: 0,   w: P, h: L, lbl: 'atas (p\xD7l)' },
    { x: 0,         y: L,   w: L, h: T, lbl: 'kiri (l\xD7t)' },
    { x: L,         y: L,   w: P, h: T, lbl: 'depan (p\xD7t)' },
    { x: L + P,     y: L,   w: L, h: T, lbl: 'kanan (l\xD7t)' },
    { x: L + P + L, y: L,   w: P, h: T, lbl: 'belakang (p\xD7t)' },
    { x: L,         y: L+T, w: P, h: L, lbl: 'bawah (p\xD7l)' },
  ]
  return {
    W: 2*L + 2*P, H: 2*L + T,
    els: [
      ...faces.map((f, i) => <FaceRect key={i} {...f} />),
      <DimText key="dp" x={L + P/2} y={-12} t={`p=${p}cm`} />,
      <DimText key="dl" x={L/2} y={-12} t={`l=${l}cm`} />,
      <DimText key="dt" x={-12} y={L + T/2} t={`t=${t}`} anchor="end" />,
    ],
  }
}

function netPrisma({ a, len }) {
  const A = a * SC, LEN = len * SC
  const ht = A * Math.sqrt(3) / 2
  const rects = [0, 1, 2].map(i => (
    <FaceRect key={`r${i}`} x={i * A} y={ht} w={A} h={LEN} lbl={`sisi ${i + 1}`} />
  ))
  const tri1 = `${0},${ht} ${A},${ht} ${A/2},${0}`
  const tri2 = `${2*A},${ht+LEN} ${3*A},${ht+LEN} ${2.5*A},${ht+LEN+ht}`
  return {
    W: 3 * A, H: 2 * ht + LEN,
    els: [
      ...rects,
      <FacePoly key="t1" pts={tri1} lbl="alas" cx={A/2} cy={ht * 0.4} />,
      <FacePoly key="t2" pts={tri2} lbl="alas" cx={2.5*A} cy={ht+LEN+ht*0.6} />,
      <DimText key="da" x={A/2} y={-12} t={`a=${a}cm`} />,
      <DimText key="dl" x={-12} y={ht + LEN/2} t={`l=${len}`} anchor="end" />,
    ],
  }
}

function netLimas({ a, s: sl }) {
  const A = a * SC, S = sl * SC
  const triPts = [
    { pts: `${S},${S} ${S+A},${S} ${S+A/2},${0}`,         cx: S+A/2,      cy: S*0.42 },
    { pts: `${S},${S+A} ${S+A},${S+A} ${S+A/2},${S+A+S}`, cx: S+A/2,      cy: S+A+S*0.58 },
    { pts: `${S},${S} ${S},${S+A} ${0},${S+A/2}`,          cx: S*0.42,     cy: S+A/2 },
    { pts: `${S+A},${S} ${S+A},${S+A} ${2*S+A},${S+A/2}`, cx: S+A+S*0.58, cy: S+A/2 },
  ]
  return {
    W: 2*S + A, H: 2*S + A,
    els: [
      <FaceRect key="sq" x={S} y={S} w={A} h={A} lbl="alas" />,
      ...triPts.map((tri, i) => <FacePoly key={`t${i}`} pts={tri.pts} lbl="sisi" cx={tri.cx} cy={tri.cy} />),
      <DimText key="da" x={S + A/2} y={-12} t={`a=${a}cm`} />,
      <DimText key="ds" x={-12} y={S + A/2} t={`s=${sl}`} anchor="end" />,
    ],
  }
}

function netTabung({ r, h }) {
  const R = r * SC, H = h * SC
  const circ = 2 * Math.PI * R
  const gap = 12
  const rectY = R * 2 + gap
  const totalH = rectY + H + gap + R * 2
  return {
    W: Math.max(circ, 2 * R + 20),
    H: totalH,
    els: [
      <g key="rect">
        <rect x={0} y={rectY} width={circ} height={H} fill={FF} stroke={FS} strokeWidth={FSW} />
        <text x={circ/2} y={rectY + H/2} textAnchor="middle" dominantBaseline="middle"
          fill={LC} fontSize={9} fontFamily="monospace">selimut</text>
      </g>,
      <g key="c1">
        <circle cx={circ/2} cy={R} r={R} fill={FF} stroke={FS} strokeWidth={FSW} />
        <text x={circ/2} y={R} textAnchor="middle" dominantBaseline="middle"
          fill={LC} fontSize={9} fontFamily="monospace">tutup</text>
      </g>,
      <g key="c2">
        <circle cx={circ/2} cy={rectY + H + gap + R} r={R}
          fill={FF} stroke={FS} strokeWidth={FSW} />
        <text x={circ/2} y={rectY + H + gap + R} textAnchor="middle" dominantBaseline="middle"
          fill={LC} fontSize={9} fontFamily="monospace">alas</text>
      </g>,
      <line key="gl" x1={0} y1={rectY} x2={circ} y2={rectY}
        stroke={FS} strokeWidth={0.5} strokeDasharray="4,3" opacity={0.25} />,
      <DimText key="dr" x={circ/2 + R + 14} y={R} t={`r=${r}cm`} />,
      <DimText key="dh" x={circ + 10} y={rectY + H/2} t={`h=${h}cm`} anchor="start" />,
      <DimText key="dc" x={circ/2} y={rectY - 12} t={`2\u03C0r \u2248 ${(2*Math.PI*r).toFixed(1)}cm`} />,
    ],
  }
}

function netKerucut({ r, h }) {
  const R = r * SC, H = h * SC
  const L = Math.sqrt(R*R + H*H)
  const l_cm = Math.sqrt(r*r + h*h)
  const theta = 2 * Math.PI * R / L
  const half = theta / 2
  const cx = L, cy = 0
  const x1 = cx - L * Math.sin(half)
  const y1 = cy + L * Math.cos(half)
  const x2 = cx + L * Math.sin(half)
  const y2 = cy + L * Math.cos(half)
  const largeArc = theta > Math.PI ? 1 : 0
  const sPath = `M ${cx} ${cy} L ${x1} ${y1} A ${L} ${L} 0 ${largeArc} 1 ${x2} ${y2} Z`
  const circX = x2 + 18 + R
  const circY = L / 2
  return {
    W: circX + R + 14, H: Math.max(y1, y2) + 14,
    els: [
      <path key="sec" d={sPath} fill={FF} stroke={FS} strokeWidth={FSW} />,
      <g key="circ">
        <circle cx={circX} cy={circY} r={R} fill={FF} stroke={FS} strokeWidth={FSW} />
        <text x={circX} y={circY} textAnchor="middle" dominantBaseline="middle"
          fill={LC} fontSize={9} fontFamily="monospace">alas</text>
      </g>,
      <text key="lblsec" x={cx} y={y1 * 0.5} textAnchor="middle" dominantBaseline="middle"
        fill={LC} fontSize={9} fontFamily="monospace">selimut</text>,
      <DimText key="dl" x={cx - 14} y={y1 * 0.65} t={`l\u2248${l_cm.toFixed(1)}cm`} anchor="end" />,
      <DimText key="dr" x={circX} y={circY + R + 14} t={`r=${r}cm`} />,
    ],
  }
}

function renderNet(id, dims) {
  switch (id) {
    case 'kubus':   return netKubus(dims)
    case 'balok':   return netBalok(dims)
    case 'prisma':  return netPrisma(dims)
    case 'limas':   return netLimas(dims)
    case 'tabung':  return netTabung(dims)
    case 'kerucut': return netKerucut(dims)
    default:        return { W: 100, H: 100, els: [] }
  }
}

// ─── Info Panel ───────────────────────────────────────────────────────────────
function InfoPanel({ shapeId, dims }) {
  const calc = {
    kubus: d => ({
      'Luas Permukaan': `6 \xD7 ${d.a}\xB2 = ${6 * d.a * d.a} cm\xB2`,
      'Volume': `${d.a}\xB3 = ${d.a ** 3} cm\xB3`,
    }),
    balok: d => ({
      'Luas Permukaan': `2(pl+pt+lt) = ${2*(d.p*d.l + d.p*d.t + d.l*d.t)} cm\xB2`,
      'Volume': `p\xD7l\xD7t = ${d.p * d.l * d.t} cm\xB3`,
    }),
    prisma: d => ({
      'Luas Permukaan': `3al + a\xB2\u221A3 \u2248 ${(3*d.a*d.len + Math.sqrt(3)/2*d.a*d.a).toFixed(1)} cm\xB2`,
      'Volume': `(\u221A3/4)a\xB2\xD7l \u2248 ${(Math.sqrt(3)/4 * d.a * d.a * d.len).toFixed(1)} cm\xB3`,
    }),
    limas: d => {
      const h = Math.sqrt(Math.max(0, d.s*d.s - (d.a/2)**2))
      return {
        'Luas Permukaan': `a\xB2 + 2as = ${(d.a*d.a + 2*d.a*d.s).toFixed(1)} cm\xB2`,
        'Volume': `(1/3)a\xB2h \u2248 ${(d.a*d.a*h/3).toFixed(1)} cm\xB3`,
        'Tinggi (h)': `\u2248 ${h.toFixed(2)} cm`,
      }
    },
    tabung: d => ({
      'Luas Permukaan': `2\u03C0r(r+h) \u2248 ${(2*Math.PI*d.r*(d.r+d.h)).toFixed(1)} cm\xB2`,
      'Volume': `\u03C0r\xB2h \u2248 ${(Math.PI*d.r*d.r*d.h).toFixed(1)} cm\xB3`,
      'Keliling alas': `2\u03C0r \u2248 ${(2*Math.PI*d.r).toFixed(1)} cm`,
    }),
    kerucut: d => {
      const l = Math.sqrt(d.r*d.r + d.h*d.h)
      return {
        'Luas Permukaan': `\u03C0r(r+l) \u2248 ${(Math.PI*d.r*(d.r+l)).toFixed(1)} cm\xB2`,
        'Volume': `(1/3)\u03C0r\xB2h \u2248 ${(Math.PI*d.r*d.r*d.h/3).toFixed(1)} cm\xB3`,
        'Tinggi Miring (l)': `\u2248 ${l.toFixed(2)} cm`,
      }
    },
  }
  const info = calc[shapeId]?.(dims) ?? {}
  return (
    <div className="rounded border border-cyan-900/40 bg-[#0a1628]/60 p-3 text-xs">
      <p className="text-[10px] text-cyan-600 uppercase tracking-widest mb-2.5">Hitungan</p>
      {Object.entries(info).map(([k, v]) => (
        <div key={k} className="mb-2">
          <p className="text-slate-500 text-[10px] mb-0.5">{k}</p>
          <p className="text-amber-300 leading-snug">{v}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Corner Marks ─────────────────────────────────────────────────────────────
function CornerMarks({ W, H }) {
  const corners = [[-PAD, -PAD], [-PAD, H + PAD], [W + PAD, -PAD], [W + PAD, H + PAD]]
  return (
    <g opacity={0.18} stroke={FS} strokeWidth={0.5}>
      {corners.map(([x, y], i) => (
        <g key={i}>
          <line x1={x - 7} y1={y} x2={x + 7} y2={y} />
          <line x1={x} y1={y - 7} x2={x} y2={y + 7} />
        </g>
      ))}
    </g>
  )
}

// ─── Download Bar ─────────────────────────────────────────────────────────────
function DownloadBar({ onSVG, onPNG, status }) {
  const isDone = status === 'done'
  const isBusy = status === 'svg' || status === 'png'

  const DownIcon = () => (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M6 1v7M3 6l3 3 3-3M1 10h10"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  const CheckIcon = () => (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  return (
    <div className="flex items-center gap-2">
      {isBusy && (
        <span className="text-[10px] text-slate-600 animate-pulse mr-1">
          memproses...
        </span>
      )}

      {/* SVG Download */}
      <button
        onClick={onSVG}
        disabled={isBusy}
        title="Download sebagai file SVG (vektor, bisa di-scale)"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-[11px] font-medium transition-all duration-200 ${
          isDone
            ? 'border-emerald-700/50 bg-emerald-950/40 text-emerald-400'
            : 'border-cyan-700/40 bg-cyan-950/30 text-cyan-400 hover:bg-cyan-900/40 hover:border-cyan-500/50 hover:text-cyan-300 active:scale-95'
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {isDone ? <CheckIcon /> : <DownIcon />}
        SVG
      </button>

      {/* PNG Download */}
      <button
        onClick={onPNG}
        disabled={isBusy}
        title="Download sebagai PNG resolusi tinggi (3x scale)"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-[11px] font-medium transition-all duration-200 ${
          isDone
            ? 'border-emerald-700/50 bg-emerald-950/40 text-emerald-400'
            : 'border-slate-700/50 bg-slate-900/30 text-slate-400 hover:bg-slate-800/40 hover:border-slate-500/50 hover:text-slate-300 active:scale-95'
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {isDone ? <CheckIcon /> : <DownIcon />}
        PNG
      </button>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [shapeId, setShapeId] = useState('kubus')
  const shape = SHAPES.find(s => s.id === shapeId)
  const [dims, setDims] = useState(() =>
    Object.fromEntries(shape.fields.map(f => [f.k, f.def]))
  )
  const svgRef = useRef(null)
  const [dlState, setDlState] = useState(null) // null | 'svg' | 'png' | 'done'

  function handleShapeChange(id) {
    const sh = SHAPES.find(s => s.id === id)
    setShapeId(id)
    setDims(Object.fromEntries(sh.fields.map(f => [f.k, f.def])))
  }

  function handleDim(k, v) {
    const n = parseFloat(v)
    if (n > 0 && n <= 30) setDims(prev => ({ ...prev, [k]: n }))
  }

  const net = useMemo(() => renderNet(shapeId, dims), [shapeId, dims])

  // ── Download helpers ──────────────────────────────────────────────────────
  function getFilename(ext) {
    const dimStr = Object.entries(dims).map(([k, v]) => `${k}${v}`).join('-')
    return `jaring-${shapeId}-${dimStr}.${ext}`
  }

  function buildSVGString() {
    const el = svgRef.current
    if (!el) return null
    const vb = el.getAttribute('viewBox')
    const [vx, vy, vw, vh] = vb.split(' ').map(Number)
    // Self-contained SVG with dark background baked in
    return (
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${vw}" height="${vh}">` +
        `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="#060b16"/>` +
        `<defs>` +
          `<pattern id="dotgrid" x="0" y="0" width="${SC}" height="${SC}" patternUnits="userSpaceOnUse">` +
            `<circle cx="${SC/2}" cy="${SC/2}" r="0.6" fill="rgba(0,180,220,0.12)"/>` +
          `</pattern>` +
        `</defs>` +
        el.innerHTML +
      `</svg>`
    )
  }

  function triggerDone() {
    setTimeout(() => setDlState('done'), 300)
    setTimeout(() => setDlState(null), 2000)
  }

  function downloadSVG() {
    const str = buildSVGString()
    if (!str) return
    setDlState('svg')
    const blob = new Blob([str], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = getFilename('svg')
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    triggerDone()
  }

  function downloadPNG() {
    const str = buildSVGString()
    if (!str) return
    setDlState('png')
    const el = svgRef.current
    const [, , vw, vh] = el.getAttribute('viewBox').split(' ').map(Number)
    const SCALE = 3 // 3× = print-quality
    const canvas = document.createElement('canvas')
    canvas.width = vw * SCALE
    canvas.height = vh * SCALE
    const ctx = canvas.getContext('2d')
    const blob = new Blob([str], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      canvas.toBlob(pngBlob => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(pngBlob)
        a.download = getFilename('png')
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        triggerDone()
      }, 'image/png')
    }
    img.onerror = () => setDlState(null)
    img.src = url
  }

  return (
    <div className="min-h-screen bg-[#060b16] text-white select-none"
      style={{ fontFamily: "'Courier New', monospace" }}>

      {/* Blueprint grid background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(0,180,220,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,180,220,0.035) 1px, transparent 1px)
        `,
        backgroundSize: `${SC}px ${SC}px`,
      }} />

      <div className="relative z-10 flex flex-col" style={{ minHeight: '100vh' }}>

        {/* ── Header ── */}
        <header className="px-5 py-3 border-b border-cyan-900/25 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 border-2 border-cyan-500 rotate-45" />
            <div className="w-2 h-2 border border-cyan-700 rotate-45 -ml-3" />
          </div>
          <span className="text-cyan-200 font-bold tracking-[0.18em] text-sm">
            JARING-JARING BANGUN RUANG
          </span>
          <div className="ml-auto flex items-center gap-4 text-[10px] text-slate-600">
            <span>SCALE {SC}px/cm</span>
            <span className="text-cyan-900">&#9670;</span>
            <span>DEFAULT 10cm</span>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">

          {/* ── Sidebar ── */}
          <aside className="w-56 border-r border-cyan-900/25 p-4 flex flex-col gap-5 shrink-0 overflow-y-auto">

            <div>
              <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-2.5">Pilih Bangun</p>
              <div className="flex flex-col gap-0.5">
                {SHAPES.map(sh => (
                  <button
                    key={sh.id}
                    onClick={() => handleShapeChange(sh.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs text-left transition-all duration-150 ${
                      shapeId === sh.id
                        ? 'bg-cyan-900/35 text-cyan-300 border border-cyan-700/40'
                        : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'
                    }`}>
                    <span className="text-sm">{sh.emoji}</span>
                    {sh.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-2.5">
                Dimensi <span className="text-cyan-800">(cm)</span>
              </p>
              {shape.fields.map(f => (
                <div key={f.k} className="mb-3.5">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[10px] text-slate-500">{f.lbl}</span>
                    <span className="text-amber-400 text-xs font-bold">{dims[f.k] ?? f.def}</span>
                  </div>
                  <input
                    type="range" min={1} max={30} step={0.5}
                    value={dims[f.k] ?? f.def}
                    onChange={e => handleDim(f.k, e.target.value)}
                    className="w-full h-1 accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-700 mt-0.5">
                    <span>1</span><span>30</span>
                  </div>
                </div>
              ))}
            </div>

            <InfoPanel shapeId={shapeId} dims={dims} />

            <div className="mt-auto pt-3 border-t border-cyan-900/20">
              <p className="text-[9px] text-slate-700 uppercase tracking-widest mb-1.5">Keterangan</p>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-0.5 bg-cyan-500 opacity-70" />
                <span className="text-[10px] text-slate-600">Garis lipat</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-2 rounded-sm border border-cyan-500/50" style={{ background: FF }} />
                <span className="text-[10px] text-slate-600">Bidang</span>
              </div>
            </div>
          </aside>

          {/* ── Canvas ── */}
          <main className="flex-1 flex items-center justify-center p-6 overflow-auto bg-[#050a13]">
            <div className="relative flex flex-col items-center gap-3">

              {/* Top bar: shape label + download buttons */}
              <div className="w-full flex items-center justify-between gap-4">
                <div className="text-[10px] text-slate-600 uppercase tracking-[0.25em]">
                  NET &#183; {shape.label}
                </div>
                <DownloadBar onSVG={downloadSVG} onPNG={downloadPNG} status={dlState} />
              </div>

              {/* SVG viewport */}
              <div className="border border-cyan-900/20 rounded bg-[#060c18] p-1">
                <svg
                  ref={svgRef}
                  viewBox={`${-PAD} ${-PAD} ${net.W + PAD * 2} ${net.H + PAD * 2}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: 'calc(100vh - 160px)',
                    width: `${net.W + PAD * 2}px`,
                    overflow: 'visible',
                    display: 'block',
                  }}>
                  <defs>
                    <pattern id="dotgrid" x="0" y="0" width={SC} height={SC} patternUnits="userSpaceOnUse">
                      <circle cx={SC/2} cy={SC/2} r={0.6} fill="rgba(0,180,220,0.12)" />
                    </pattern>
                  </defs>
                  <rect x={-PAD} y={-PAD} width={net.W + PAD*2} height={net.H + PAD*2}
                    fill="url(#dotgrid)" />
                  <CornerMarks W={net.W} H={net.H} />
                  {net.els}
                </svg>
              </div>

              {/* Dimension summary strip */}
              <div className="flex gap-4 text-[10px]">
                {shape.fields.map(f => (
                  <span key={f.k} className="text-slate-600">
                    <span className="text-slate-500">{f.lbl.split(' ')[0]}</span>
                    {' = '}
                    <span className="text-amber-500">{dims[f.k] ?? f.def} cm</span>
                  </span>
                ))}
              </div>

            </div>
          </main>
        </div>
      </div>
    </div>
  )
}