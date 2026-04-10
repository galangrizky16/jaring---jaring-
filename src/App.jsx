import { useState, useMemo, useRef } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────
const SC = 36
const PAD = 22
const FF = 'rgba(99,102,241,0.08)'
const FS = '#6366f1'
const FSW = 1.5
const DC = '#f59e0b'
const LC = 'rgba(100,116,139,0.8)'

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
        fill={LC} fontSize={9} fontFamily="system-ui,-apple-system,sans-serif" fontWeight="500">{lbl}</text>
    )}
  </g>
)

const FacePoly = ({ pts, lbl, cx, cy }) => (
  <g>
    <polygon points={pts} fill={FF} stroke={FS} strokeWidth={FSW} />
    {lbl && (
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        fill={LC} fontSize={9} fontFamily="system-ui,-apple-system,sans-serif" fontWeight="500">{lbl}</text>
    )}
  </g>
)

const DimText = ({ x, y, t, anchor = 'middle' }) => (
  <text x={x} y={y} textAnchor={anchor} dominantBaseline="middle"
    fill={DC} fontSize={10} fontFamily="system-ui,-apple-system,sans-serif" fontWeight="600">{t}</text>
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
    { x: L,         y: 0,   w: P, h: L, lbl: 'atas (p×l)' },
    { x: 0,         y: L,   w: L, h: T, lbl: 'kiri (l×t)' },
    { x: L,         y: L,   w: P, h: T, lbl: 'depan (p×t)' },
    { x: L + P,     y: L,   w: L, h: T, lbl: 'kanan (l×t)' },
    { x: L + P + L, y: L,   w: P, h: T, lbl: 'belakang (p×t)' },
    { x: L,         y: L+T, w: P, h: L, lbl: 'bawah (p×l)' },
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
          fill={LC} fontSize={9} fontFamily="system-ui,-apple-system,sans-serif" fontWeight="500">selimut</text>
      </g>,
      <g key="c1">
        <circle cx={circ/2} cy={R} r={R} fill={FF} stroke={FS} strokeWidth={FSW} />
        <text x={circ/2} y={R} textAnchor="middle" dominantBaseline="middle"
          fill={LC} fontSize={9} fontFamily="system-ui,-apple-system,sans-serif" fontWeight="500">tutup</text>
      </g>,
      <g key="c2">
        <circle cx={circ/2} cy={rectY + H + gap + R} r={R}
          fill={FF} stroke={FS} strokeWidth={FSW} />
        <text x={circ/2} y={rectY + H + gap + R} textAnchor="middle" dominantBaseline="middle"
          fill={LC} fontSize={9} fontFamily="system-ui,-apple-system,sans-serif" fontWeight="500">alas</text>
      </g>,
      <line key="gl" x1={0} y1={rectY} x2={circ} y2={rectY}
        stroke={FS} strokeWidth={0.5} strokeDasharray="4,3" opacity={0.25} />,
      <DimText key="dr" x={circ/2 + R + 14} y={R} t={`r=${r}cm`} />,
      <DimText key="dh" x={circ + 10} y={rectY + H/2} t={`h=${h}cm`} anchor="start" />,
      <DimText key="dc" x={circ/2} y={rectY - 12} t={`2πr ≈ ${(2*Math.PI*r).toFixed(1)}cm`} />,
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
    W: circX + R + 16,
    H: Math.max(L, 2*R),
    els: [
      <g key="sector">
        <path d={sPath} fill={FF} stroke={FS} strokeWidth={FSW} />
        <text x={cx - L/3} y={L/2} textAnchor="middle" dominantBaseline="middle"
          fill={LC} fontSize={9} fontFamily="system-ui,-apple-system,sans-serif" fontWeight="500">selimut</text>
      </g>,
      <g key="circ">
        <circle cx={circX} cy={circY} r={R} fill={FF} stroke={FS} strokeWidth={FSW} />
        <text x={circX} y={circY} textAnchor="middle" dominantBaseline="middle"
          fill={LC} fontSize={9} fontFamily="system-ui,-apple-system,sans-serif" fontWeight="500">alas</text>
      </g>,
      <DimText key="dr" x={circX + R + 12} y={circY} t={`r=${r}cm`} anchor="start" />,
      <DimText key="dl" x={cx + L/2} y={-10} t={`s=${l_cm.toFixed(1)}cm`} />,
    ],
  }
}

const netFns = { kubus: netKubus, balok: netBalok, prisma: netPrisma, limas: netLimas, tabung: netTabung, kerucut: netKerucut }

// ─── Corner Marks ────────────────────────────────────────────────────────────
const CornerMarks = ({ W, H }) => {
  const mk = 10
  const cs = [
    [0, 0], [W, 0], [W, H], [0, H]
  ]
  return (
    <g stroke={FS} strokeWidth={1.2} opacity={0.15}>
      {cs.map(([x, y], i) => {
        const d = `M ${x + (i % 2 ? -mk : mk)} ${y} L ${x} ${y} L ${x} ${y + (i > 1 ? -mk : mk)}`
        return <path key={i} d={d} fill="none" />
      })}
    </g>
  )
}

// ─── Download Bar ────────────────────────────────────────────────────────────
const DownloadBar = ({ onSVG, onPNG, status }) => {
  const ico = (type, st) => {
    if (st === 'done') return '✓'
    if (st === type) return '⏳'
    return type === 'svg' ? '⬇' : '⬇'
  }
  return (
    <div className="flex gap-2">
      <button
        onClick={onSVG} disabled={!!status}
        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation"
        style={{ WebkitTapHighlightColor: 'transparent' }}>
        {ico('svg', status)} SVG
      </button>
      <button
        onClick={onPNG} disabled={!!status}
        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation"
        style={{ WebkitTapHighlightColor: 'transparent' }}>
        {ico('png', status)} PNG
      </button>
    </div>
  )
}

// ─── Info Panel ──────────────────────────────────────────────────────────────
const InfoPanel = ({ shapeId, dims }) => {
  const pi = Math.PI
  const formulas = {
    kubus: () => {
      const a = dims.a
      const vol = a ** 3
      const luas = 6 * a ** 2
      return { vol, luas, volFm: `V = a³ = ${a}³`, luasFm: `L = 6a² = 6×${a}²` }
    },
    balok: () => {
      const { p, l, t } = dims
      const vol = p * l * t
      const luas = 2 * (p*l + p*t + l*t)
      return { vol, luas, volFm: `V = p×l×t = ${p}×${l}×${t}`, luasFm: `L = 2(pl+pt+lt)` }
    },
    prisma: () => {
      const { a, len } = dims
      const areaBase = (a ** 2 * Math.sqrt(3)) / 4
      const vol = areaBase * len
      const keliling = 3 * a
      const luas = 2 * areaBase + keliling * len
      return { vol, luas, volFm: `V = ½×a×t×l`, luasFm: `L = 2×Lalas + K×l` }
    },
    limas: () => {
      const { a, s } = dims
      const h = Math.sqrt(s ** 2 - (a / 2) ** 2)
      const vol = (a ** 2 * h) / 3
      const luas = a ** 2 + 4 * (0.5 * a * s)
      return { vol, luas, volFm: `V = ⅓×a²×t`, luasFm: `L = a² + 4×(½as)` }
    },
    tabung: () => {
      const { r, h } = dims
      const vol = pi * r ** 2 * h
      const luas = 2 * pi * r * (r + h)
      return { vol, luas, volFm: `V = πr²h`, luasFm: `L = 2πr(r+h)` }
    },
    kerucut: () => {
      const { r, h } = dims
      const s = Math.sqrt(r ** 2 + h ** 2)
      const vol = (pi * r ** 2 * h) / 3
      const luas = pi * r * (r + s)
      return { vol, luas, volFm: `V = ⅓πr²h`, luasFm: `L = πr(r+s)` }
    },
  }
  const res = formulas[shapeId]()
  return (
    <div className="border border-indigo-200 bg-indigo-50/50 rounded-lg p-3">
      <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-2">Rumus & Hasil</p>
      <div className="space-y-2 text-xs">
        <div>
          <div className="text-slate-500 mb-0.5 font-medium">{res.volFm}</div>
          <div className="text-indigo-700 font-semibold">= {res.vol.toFixed(2)} cm³</div>
        </div>
        <div>
          <div className="text-slate-500 mb-0.5 font-medium">{res.luasFm}</div>
          <div className="text-indigo-700 font-semibold">= {res.luas.toFixed(2)} cm²</div>
        </div>
      </div>
    </div>
  )
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [shapeId, setShapeId] = useState('kubus')
  const [dims, setDims] = useState({})
  const [dlState, setDlState] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const svgRef = useRef(null)

  const shape = SHAPES.find(s => s.id === shapeId)
  const net = useMemo(() => {
    const fn = netFns[shapeId]
    const vals = {}
    shape.fields.forEach(f => { vals[f.k] = dims[f.k] ?? f.def })
    return fn(vals)
  }, [shapeId, dims, shape])

  function handleShapeChange(id) {
    setShapeId(id)
    setDims({})
    setMenuOpen(false)
  }

  function handleDim(k, v) {
    setDims(prev => ({ ...prev, [k]: parseFloat(v) }))
  }

  function getFilename(ext) {
    const vals = shape.fields.map(f => `${f.k}${dims[f.k] ?? f.def}`).join('_')
    return `net_${shapeId}_${vals}.${ext}`
  }

  function buildSVGString() {
    const el = svgRef.current
    if (!el) return null
    const [vx, vy, vw, vh] = el.getAttribute('viewBox').split(' ').map(Number)
    const vb = `${vx} ${vy} ${vw} ${vh}`
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${vw}" height="${vh}">` +
        `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="#fefefe"/>` +
        `<defs>` +
          `<pattern id="dotgrid" x="0" y="0" width="${SC}" height="${SC}" patternUnits="userSpaceOnUse">` +
            `<circle cx="${SC/2}" cy="${SC/2}" r="0.6" fill="rgba(99,102,241,0.08)"/>` +
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
    const SCALE = 3
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 text-slate-900 select-none"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif" }}>

      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-30" style={{
        backgroundImage: `
          linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)
        `,
        backgroundSize: `${SC}px ${SC}px`,
      }} />

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* ── Header ── */}
        <header className="px-4 sm:px-6 py-3 sm:py-4 border-b border-indigo-100 bg-white/80 backdrop-blur-xl flex items-center gap-3 sticky top-0 z-50 shadow-sm">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-indigo-50 active:bg-indigo-100 transition-colors touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}>
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white rotate-45" />
            </div>
            <span className="text-indigo-700 font-bold tracking-tight text-sm sm:text-base">
              Jaring-Jaring Bangun Ruang
            </span>
          </div>
          
          <div className="ml-auto hidden sm:flex items-center gap-3 text-[10px] text-slate-400 font-medium">
            <span>SKALA {SC}px/cm</span>
            <span className="text-indigo-300">◆</span>
            <span>DEFAULT 10cm</span>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative">

          {/* ── Sidebar (Desktop & Mobile Menu) ── */}
          <aside className={`
            fixed lg:static inset-y-0 left-0 z-40 w-72 sm:w-80 lg:w-64 xl:w-72
            border-r border-indigo-100 bg-white/95 backdrop-blur-xl
            lg:backdrop-blur-none
            p-4 sm:p-5 lg:p-4 flex flex-col gap-5 shrink-0 overflow-y-auto
            transform transition-transform duration-300 ease-out
            ${menuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
          `}>

            <div className="flex lg:hidden justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-slate-700">Menu</h3>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 active:bg-slate-200 touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}>
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-3 font-semibold">Pilih Bangun</p>
              <div className="flex flex-col gap-1.5">
                {SHAPES.map(sh => (
                  <button
                    key={sh.id}
                    onClick={() => handleShapeChange(sh.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all duration-200 touch-manipulation ${
                      shapeId === sh.id
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-200'
                        : 'text-slate-700 hover:bg-indigo-50 active:bg-indigo-100'
                    }`}
                    style={{ WebkitTapHighlightColor: 'transparent' }}>
                    <span className="text-xl">{sh.emoji}</span>
                    <span className="font-medium">{sh.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-3 font-semibold">
                Dimensi <span className="text-indigo-400">(cm)</span>
              </p>
              {shape.fields.map(f => (
                <div key={f.k} className="mb-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs text-slate-600 font-medium">{f.lbl}</span>
                    <span className="text-amber-600 text-sm font-bold">{dims[f.k] ?? f.def}</span>
                  </div>
                  <input
                    type="range" min={1} max={30} step={0.5}
                    value={dims[f.k] ?? f.def}
                    onChange={e => handleDim(f.k, e.target.value)}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer touch-manipulation"
                    style={{
                      WebkitTapHighlightColor: 'transparent',
                      background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((dims[f.k] ?? f.def) - 1) / 29 * 100}%, #e0e7ff ${((dims[f.k] ?? f.def) - 1) / 29 * 100}%, #e0e7ff 100%)`
                    }}
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
                    <span>1</span><span>30</span>
                  </div>
                </div>
              ))}
            </div>

            <InfoPanel shapeId={shapeId} dims={dims} />

            <div className="mt-auto pt-4 border-t border-indigo-100">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-semibold">Keterangan</p>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-0.5 bg-indigo-500 rounded-full" />
                <span className="text-xs text-slate-600">Garis lipat</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-3 rounded border border-indigo-300" style={{ background: FF }} />
                <span className="text-xs text-slate-600">Bidang</span>
              </div>
            </div>
          </aside>

          {/* Overlay for mobile menu */}
          {menuOpen && (
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
          )}

          {/* ── Canvas ── */}
          <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-auto">
            <div className="relative flex flex-col items-center gap-4 w-full max-w-5xl">

              {/* Top bar */}
              <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  Jaring ∙ {shape.label}
                </div>
                <DownloadBar onSVG={downloadSVG} onPNG={downloadPNG} status={dlState} />
              </div>

              {/* SVG viewport */}
              <div className="border border-indigo-200 rounded-2xl bg-white shadow-lg shadow-indigo-100/50 p-2 sm:p-3 w-full overflow-auto">
                <svg
                  ref={svgRef}
                  viewBox={`${-PAD} ${-PAD} ${net.W + PAD * 2} ${net.H + PAD * 2}`}
                  className="w-full h-auto"
                  style={{
                    maxHeight: 'calc(100vh - 280px)',
                    minHeight: '300px',
                    display: 'block',
                  }}>
                  <defs>
                    <pattern id="dotgrid" x="0" y="0" width={SC} height={SC} patternUnits="userSpaceOnUse">
                      <circle cx={SC/2} cy={SC/2} r={0.6} fill="rgba(99,102,241,0.08)" />
                    </pattern>
                  </defs>
                  <rect x={-PAD} y={-PAD} width={net.W + PAD*2} height={net.H + PAD*2}
                    fill="url(#dotgrid)" />
                  <CornerMarks W={net.W} H={net.H} />
                  {net.els}
                </svg>
              </div>

              {/* Dimension summary */}
              <div className="flex flex-wrap gap-3 sm:gap-4 text-xs justify-center">
                {shape.fields.map(f => (
                  <span key={f.k} className="text-slate-600 font-medium">
                    <span className="text-slate-500">{f.lbl.split(' ')[0]}</span>
                    {' = '}
                    <span className="text-amber-600 font-bold">{dims[f.k] ?? f.def} cm</span>
                  </span>
                ))}
              </div>

            </div>
          </main>
        </div>
      </div>

      <style>{`
        input[type="range"] {
          -webkit-appearance: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(99,102,241,0.3);
          transition: all 0.15s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(99,102,241,0.4);
        }
        input[type="range"]::-webkit-slider-thumb:active {
          transform: scale(0.95);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(99,102,241,0.3);
          transition: all 0.15s ease;
        }
        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(99,102,241,0.4);
        }
        input[type="range"]::-moz-range-thumb:active {
          transform: scale(0.95);
        }
        
        @supports (-webkit-touch-callout: none) {
          /* iOS Safari specific styles */
          * {
            -webkit-tap-highlight-color: transparent;
          }
        }
      `}</style>
    </div>
  )
}
