import { useState, useMemo, useRef } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────
const SC = 36
const PAD = 22
const FF = 'rgba(0,210,230,0.07)'
const FS = '#00d4e8'
const FSW = 1.5
const DC = '#fbbf24'
const LC = 'rgba(148,163,184,0.7)'
const FLAP_COLOR = 'rgba(156,163,175,0.15)' // abu-abu untuk flap/lebihan
const FLAP_STROKE = 'rgba(156,163,175,0.5)'

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

// ─── Folding Instructions ────────────────────────────────────────────────────
const FOLD_GUIDES = {
  kubus: [
    { step: 1, desc: "Lipat sisi 'kiri' ke atas, tegak lurus ke sisi 'depan'", faces: ['kiri'] },
    { step: 2, desc: "Lipat sisi 'kanan' ke atas, tegak lurus ke sisi 'depan'", faces: ['kanan'] },
    { step: 3, desc: "Lipat sisi 'belakang' ke atas, sambungkan dengan sisi 'kiri'", faces: ['belakang'] },
    { step: 4, desc: "Lipat sisi 'atas' menutup bagian atas kubus", faces: ['atas'] },
    { step: 5, desc: "Lipat sisi 'bawah' menutup bagian bawah, lem di bagian abu-abu (flap)", faces: ['bawah'] },
  ],
  balok: [
    { step: 1, desc: "Lipat sisi 'kiri (l×t)' tegak lurus ke atas", faces: ['kiri (l×t)'] },
    { step: 2, desc: "Lipat sisi 'kanan (l×t)' tegak lurus ke atas", faces: ['kanan (l×t)'] },
    { step: 3, desc: "Lipat sisi 'belakang (p×t)' ke atas, sambungkan ujung-ujungnya", faces: ['belakang (p×t)'] },
    { step: 4, desc: "Lipat 'atas (p×l)' menutup bagian atas", faces: ['atas (p×l)'] },
    { step: 5, desc: "Lipat 'bawah (p×l)' menutup bagian bawah, lem di bagian abu-abu (flap)", faces: ['bawah (p×l)'] },
  ],
  prisma: [
    { step: 1, desc: "Lipat ketiga sisi persegi panjang ke atas membentuk segitiga", faces: ['sisi 1', 'sisi 2', 'sisi 3'] },
    { step: 2, desc: "Pastikan ujung-ujung bertemu membentuk prisma", faces: [] },
    { step: 3, desc: "Tutup kedua ujung dengan segitiga 'alas', lem di bagian abu-abu (flap)", faces: ['alas'] },
  ],
  limas: [
    { step: 1, desc: "Lipat keempat sisi segitiga ke atas menuju satu titik puncak", faces: ['sisi'] },
    { step: 2, desc: "Pastikan semua sisi segitiga bertemu di puncak", faces: [] },
    { step: 3, desc: "Lem tepi segitiga di bagian abu-abu (flap) agar tidak terbuka", faces: [] },
  ],
  tabung: [
    { step: 1, desc: "Gulung 'selimut' menjadi tabung, lem di bagian abu-abu (flap)", faces: ['selimut'] },
    { step: 2, desc: "Tempelkan lingkaran 'tutup' di ujung atas", faces: ['tutup'] },
    { step: 3, desc: "Tempelkan lingkaran 'alas' di ujung bawah", faces: ['alas'] },
  ],
  kerucut: [
    { step: 1, desc: "Gulung juring lingkaran membentuk kerucut, lem di bagian abu-abu (flap)", faces: ['selimut'] },
    { step: 2, desc: "Tempelkan lingkaran 'alas' di bagian bawah kerucut", faces: ['alas'] },
  ],
}

// ─── SVG Atoms ───────────────────────────────────────────────────────────────
const FaceRect = ({ x, y, w, h, lbl, num, highlight }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} 
      fill={highlight ? 'rgba(251,191,36,0.15)' : FF} 
      stroke={highlight ? DC : FS} 
      strokeWidth={highlight ? 2.5 : FSW} 
      className="transition-all duration-300"
    />
    {num && (
      <circle cx={x + 12} cy={y + 12} r={9} fill="rgba(251,191,36,0.9)" stroke="#000" strokeWidth={0.5} />
    )}
    {num && (
      <text x={x + 12} y={y + 12} textAnchor="middle" dominantBaseline="middle"
        fill="#000" fontSize={10} fontWeight="bold" fontFamily="monospace">{num}</text>
    )}
    {lbl && (
      <text x={x + w / 2} y={y + h / 2 + (num ? 8 : 0)} textAnchor="middle" dominantBaseline="middle"
        fill={LC} fontSize={9} fontFamily="monospace">{lbl}</text>
    )}
  </g>
)

const FacePoly = ({ pts, lbl, cx, cy, num, highlight }) => (
  <g>
    <polygon points={pts} 
      fill={highlight ? 'rgba(251,191,36,0.15)' : FF} 
      stroke={highlight ? DC : FS} 
      strokeWidth={highlight ? 2.5 : FSW}
      className="transition-all duration-300"
    />
    {num && (
      <circle cx={cx - 20} cy={cy - 15} r={9} fill="rgba(251,191,36,0.9)" stroke="#000" strokeWidth={0.5} />
    )}
    {num && (
      <text x={cx - 20} y={cy - 15} textAnchor="middle" dominantBaseline="middle"
        fill="#000" fontSize={10} fontWeight="bold" fontFamily="monospace">{num}</text>
    )}
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

// Flap/Tab helper - untuk area lem
const Flap = ({ pts, side }) => (
  <g>
    <polygon points={pts} fill={FLAP_COLOR} stroke={FLAP_STROKE} strokeWidth={1} />
    <text x={pts.split(' ')[0].split(',')[0]} y={pts.split(' ')[0].split(',')[1]} 
      textAnchor="middle" dominantBaseline="middle"
      fill="rgba(100,100,100,0.4)" fontSize={7} fontFamily="monospace">lem</text>
  </g>
)

// ─── Net Renderers ────────────────────────────────────────────────────────────
function netKubus({ a }, showNumbers, highlightFaces, flapSize, showFlaps) {
  const A = a * SC
  const F = flapSize * SC // flap size
  
  const faces = [
    { x: A,     y: 0,   lbl: 'atas', num: 4 },
    { x: 0,     y: A,   lbl: 'kiri', num: 1 },
    { x: A,     y: A,   lbl: 'depan', num: 0 },
    { x: 2 * A, y: A,   lbl: 'kanan', num: 2 },
    { x: 3 * A, y: A,   lbl: 'belakang', num: 3 },
    { x: A,     y: 2*A, lbl: 'bawah', num: 5 },
  ]
  
  // Flaps untuk kubus - di tepi yang perlu direkatkan
  const flaps = showFlaps ? [
    // Flap kiri dari kiri
    { pts: `${0},${A} ${-F},${A+F} ${-F},${2*A-F} ${0},${2*A}`, side: 'left-outer' },
    // Flap kanan dari belakang
    { pts: `${4*A},${A} ${4*A+F},${A+F} ${4*A+F},${2*A-F} ${4*A},${2*A}`, side: 'right-outer' },
    // Flap atas dari atas
    { pts: `${A},${0} ${A+F},${-F} ${2*A-F},${-F} ${2*A},${0}`, side: 'top-top' },
    // Flap bawah dari bawah
    { pts: `${A},${3*A} ${A+F},${3*A+F} ${2*A-F},${3*A+F} ${2*A},${3*A}`, side: 'bottom-bottom' },
    // Flap samping kiri bawah
    { pts: `${A},${2*A} ${A},${2*A+F} ${A-F},${2*A+F} ${A-F},${2*A}`, side: 'bottom-left' },
    // Flap samping kanan bawah
    { pts: `${2*A},${2*A} ${2*A+F},${2*A} ${2*A+F},${2*A+F} ${2*A},${2*A+F}`, side: 'bottom-right' },
  ] : []
  
  return {
    W: 4 * A + (showFlaps ? 2*F : 0), 
    H: 3 * A + (showFlaps ? 2*F : 0),
    xOffset: showFlaps ? F : 0,
    yOffset: showFlaps ? F : 0,
    els: [
      ...flaps.map((fl, i) => <Flap key={`flap${i}`} {...fl} />),
      ...faces.map((f, i) => {
        const isHighlight = highlightFaces.includes(f.lbl)
        return <FaceRect key={i} x={f.x} y={f.y} w={A} h={A} lbl={f.lbl} 
          num={showNumbers ? f.num : null} highlight={isHighlight} />
      }),
      <DimText key="d1" x={A + A/2} y={-12} t={`${a} cm`} />,
    ],
  }
}

function netBalok({ p, l, t }, showNumbers, highlightFaces, flapSize, showFlaps) {
  const P = p * SC, L = l * SC, T = t * SC
  const F = flapSize * SC
  
  const faces = [
    { x: L,         y: 0,   w: P, h: L, lbl: 'atas (p×l)', num: 4 },
    { x: 0,         y: L,   w: L, h: T, lbl: 'kiri (l×t)', num: 1 },
    { x: L,         y: L,   w: P, h: T, lbl: 'depan (p×t)', num: 0 },
    { x: L + P,     y: L,   w: L, h: T, lbl: 'kanan (l×t)', num: 2 },
    { x: L + P + L, y: L,   w: P, h: T, lbl: 'belakang (p×t)', num: 3 },
    { x: L,         y: L+T, w: P, h: L, lbl: 'bawah (p×l)', num: 5 },
  ]
  
  const flaps = showFlaps ? [
    // Flap kiri luar
    { pts: `${0},${L} ${-F},${L+F} ${-F},${L+T-F} ${0},${L+T}`, side: 'left' },
    // Flap kanan dari belakang
    { pts: `${2*L+2*P},${L} ${2*L+2*P+F},${L+F} ${2*L+2*P+F},${L+T-F} ${2*L+2*P},${L+T}`, side: 'right' },
    // Flap atas dari atas
    { pts: `${L},${0} ${L+F},${-F} ${L+P-F},${-F} ${L+P},${0}`, side: 'top-top' },
    // Flap bawah dari bawah  
    { pts: `${L},${2*L+T} ${L+F},${2*L+T+F} ${L+P-F},${2*L+T+F} ${L+P},${2*L+T}`, side: 'bottom' },
    // Flap samping kiri bawah
    { pts: `${L},${L+T} ${L-F},${L+T} ${L-F},${L+T+F} ${L},${L+T+F}`, side: 'bl' },
    // Flap samping kanan bawah
    { pts: `${L+P},${L+T} ${L+P+F},${L+T} ${L+P+F},${L+T+F} ${L+P},${L+T+F}`, side: 'br' },
  ] : []
  
  return {
    W: 2*L + 2*P + (showFlaps ? 2*F : 0), 
    H: 2*L + T + (showFlaps ? 2*F : 0),
    xOffset: showFlaps ? F : 0,
    yOffset: showFlaps ? F : 0,
    els: [
      ...flaps.map((fl, i) => <Flap key={`flap${i}`} {...fl} />),
      ...faces.map((f, i) => {
        const isHighlight = highlightFaces.includes(f.lbl)
        return <FaceRect key={i} {...f} num={showNumbers ? f.num : null} highlight={isHighlight} />
      }),
      <DimText key="dp" x={L + P/2} y={-12} t={`p=${p}cm`} />,
      <DimText key="dl" x={L/2} y={-12} t={`l=${l}cm`} />,
      <DimText key="dt" x={-12} y={L + T/2} t={`t=${t}`} anchor="end" />,
    ],
  }
}

function netPrisma({ a, len }, showNumbers, highlightFaces, flapSize, showFlaps) {
  const A = a * SC, LEN = len * SC
  const F = flapSize * SC
  const ht = A * Math.sqrt(3) / 2
  
  const rects = [0, 1, 2].map(i => {
    const lbl = `sisi ${i + 1}`
    const isHighlight = highlightFaces.includes(lbl)
    return <FaceRect key={`r${i}`} x={i * A} y={ht} w={A} h={LEN} lbl={lbl} 
      num={showNumbers ? i + 1 : null} highlight={isHighlight} />
  })
  
  const tri1 = `${0},${ht} ${A},${ht} ${A/2},${0}`
  const tri2 = `${2*A},${ht+LEN} ${3*A},${ht+LEN} ${2.5*A},${ht+LEN+ht}`
  const isHighlightAlas = highlightFaces.includes('alas')
  
  const flaps = showFlaps ? [
    // Flap vertikal kanan
    { pts: `${3*A},${ht} ${3*A+F},${ht+F} ${3*A+F},${ht+LEN-F} ${3*A},${ht+LEN}`, side: 'right' },
    // Flap segitiga atas
    { pts: `${A/2},${0} ${A/2-F*0.866},${-F*0.5} ${A/2+F*0.866},${-F*0.5}`, side: 'tri-top' },
    // Flap segitiga bawah
    { pts: `${2.5*A},${ht+LEN+ht} ${2.5*A-F*0.866},${ht+LEN+ht+F*0.5} ${2.5*A+F*0.866},${ht+LEN+ht+F*0.5}`, side: 'tri-bot' },
  ] : []
  
  return {
    W: 3 * A + (showFlaps ? F*2 : 0), 
    H: 2 * ht + LEN + (showFlaps ? F : 0),
    xOffset: showFlaps ? F*0.866 : 0,
    yOffset: showFlaps ? F*0.5 : 0,
    els: [
      ...flaps.map((fl, i) => <Flap key={`flap${i}`} {...fl} />),
      ...rects,
      <FacePoly key="t1" pts={tri1} lbl="alas" cx={A/2} cy={ht * 0.4} 
        num={showNumbers ? 4 : null} highlight={isHighlightAlas} />,
      <FacePoly key="t2" pts={tri2} lbl="alas" cx={2.5*A} cy={ht+LEN+ht*0.6} 
        num={showNumbers ? 5 : null} highlight={isHighlightAlas} />,
      <DimText key="da" x={A/2} y={-12} t={`a=${a}cm`} />,
    ],
  }
}

function netLimas({ a, s: sl }, showNumbers, highlightFaces, flapSize, showFlaps) {
  const A = a * SC, S = sl * SC
  const F = flapSize * SC
  
  const triPts = [
    { pts: `${S},${S} ${S+A},${S} ${S+A/2},${0}`,         cx: S+A/2,      cy: S*0.42, num: 1 },
    { pts: `${S},${S+A} ${S+A},${S+A} ${S+A/2},${S+A+S}`, cx: S+A/2,      cy: S+A+S*0.58, num: 2 },
    { pts: `${S},${S} ${S},${S+A} ${0},${S+A/2}`,          cx: S*0.42,     cy: S+A/2, num: 3 },
    { pts: `${S+A},${S} ${S+A},${S+A} ${2*S+A},${S+A/2}`, cx: S+A+S*0.58, cy: S+A/2, num: 4 },
  ]
  
  const isHighlightSisi = highlightFaces.includes('sisi')
  const isHighlightAlas = highlightFaces.includes('alas')
  
  const flaps = showFlaps ? [
    // Flap segitiga atas
    { pts: `${S+A/2},${0} ${S+A/2-F*0.5},${-F*0.866} ${S+A/2+F*0.5},${-F*0.866}`, side: 'top' },
    // Flap segitiga bawah
    { pts: `${S+A/2},${S+A+S} ${S+A/2-F*0.5},${S+A+S+F*0.866} ${S+A/2+F*0.5},${S+A+S+F*0.866}`, side: 'bot' },
    // Flap segitiga kiri
    { pts: `${0},${S+A/2} ${-F*0.866},${S+A/2-F*0.5} ${-F*0.866},${S+A/2+F*0.5}`, side: 'left' },
    // Flap segitiga kanan
    { pts: `${2*S+A},${S+A/2} ${2*S+A+F*0.866},${S+A/2-F*0.5} ${2*S+A+F*0.866},${S+A/2+F*0.5}`, side: 'right' },
  ] : []
  
  return {
    W: 2*S + A + (showFlaps ? F*1.732 : 0), 
    H: 2*S + A + (showFlaps ? F*1.732 : 0),
    xOffset: showFlaps ? F*0.866 : 0,
    yOffset: showFlaps ? F*0.866 : 0,
    els: [
      ...flaps.map((fl, i) => <Flap key={`flap${i}`} {...fl} />),
      <FaceRect key="sq" x={S} y={S} w={A} h={A} lbl="alas" 
        num={showNumbers ? 0 : null} highlight={isHighlightAlas} />,
      ...triPts.map((tri, i) => 
        <FacePoly key={`t${i}`} pts={tri.pts} lbl="sisi" cx={tri.cx} cy={tri.cy} 
          num={showNumbers ? tri.num : null} highlight={isHighlightSisi} />
      ),
      <DimText key="da" x={S + A/2} y={-12} t={`a=${a}cm`} />,
    ],
  }
}

function netTabung({ r, h }, showNumbers, highlightFaces, flapSize, showFlaps) {
  const R = r * SC, H = h * SC
  const F = flapSize * SC
  const circ = 2 * Math.PI * R
  const gap = 12
  const rectY = R * 2 + gap
  const totalH = rectY + H + gap + R * 2
  
  const isHighlightSelimut = highlightFaces.includes('selimut')
  const isHighlightTutup = highlightFaces.includes('tutup')
  const isHighlightAlas = highlightFaces.includes('alas')
  
  const flaps = showFlaps ? [
    // Flap vertikal kanan selimut
    { pts: `${circ},${rectY} ${circ+F},${rectY+F} ${circ+F},${rectY+H-F} ${circ},${rectY+H}`, side: 'selimut-right' },
    // Flap horizontal atas selimut (untuk tutup)
    { pts: `${0},${rectY} ${F},${rectY-F} ${circ-F},${rectY-F} ${circ},${rectY}`, side: 'selimut-top' },
    // Flap horizontal bawah selimut (untuk alas)
    { pts: `${0},${rectY+H} ${F},${rectY+H+F} ${circ-F},${rectY+H+F} ${circ},${rectY+H}`, side: 'selimut-bot' },
  ] : []
  
  return {
    W: Math.max(circ, 2 * R + 20) + (showFlaps ? F : 0),
    H: totalH + (showFlaps ? F*2 : 0),
    xOffset: 0,
    yOffset: showFlaps ? F : 0,
    els: [
      ...flaps.map((fl, i) => <Flap key={`flap${i}`} {...fl} />),
      <g key="rect">
        <rect x={0} y={rectY} width={circ} height={H} 
          fill={isHighlightSelimut ? 'rgba(251,191,36,0.15)' : FF} 
          stroke={isHighlightSelimut ? DC : FS} 
          strokeWidth={isHighlightSelimut ? 2.5 : FSW} />
        {showNumbers && (
          <>
            <circle cx={circ/4} cy={rectY + H/2} r={9} fill="rgba(251,191,36,0.9)" stroke="#000" strokeWidth={0.5} />
            <text x={circ/4} y={rectY + H/2} textAnchor="middle" dominantBaseline="middle"
              fill="#000" fontSize={10} fontWeight="bold" fontFamily="monospace">1</text>
          </>
        )}
        <text x={circ/2} y={rectY + H/2} textAnchor="middle" dominantBaseline="middle"
          fill={LC} fontSize={9} fontFamily="monospace">selimut</text>
      </g>,
      <g key="c1">
        <circle cx={circ/2} cy={R} r={R} 
          fill={isHighlightTutup ? 'rgba(251,191,36,0.15)' : FF} 
          stroke={isHighlightTutup ? DC : FS} 
          strokeWidth={isHighlightTutup ? 2.5 : FSW} />
        {showNumbers && (
          <>
            <circle cx={circ/2 + 20} cy={R - 15} r={9} fill="rgba(251,191,36,0.9)" stroke="#000" strokeWidth={0.5} />
            <text x={circ/2 + 20} y={R - 15} textAnchor="middle" dominantBaseline="middle"
              fill="#000" fontSize={10} fontWeight="bold" fontFamily="monospace">2</text>
          </>
        )}
        <text x={circ/2} y={R} textAnchor="middle" dominantBaseline="middle"
          fill={LC} fontSize={9} fontFamily="monospace">tutup</text>
      </g>,
      <g key="c2">
        <circle cx={circ/2} cy={rectY + H + gap + R} r={R}
          fill={isHighlightAlas ? 'rgba(251,191,36,0.15)' : FF} 
          stroke={isHighlightAlas ? DC : FS} 
          strokeWidth={isHighlightAlas ? 2.5 : FSW} />
        {showNumbers && (
          <>
            <circle cx={circ/2 + 20} cy={rectY + H + gap + R - 15} r={9} fill="rgba(251,191,36,0.9)" stroke="#000" strokeWidth={0.5} />
            <text x={circ/2 + 20} y={rectY + H + gap + R - 15} textAnchor="middle" dominantBaseline="middle"
              fill="#000" fontSize={10} fontWeight="bold" fontFamily="monospace">3</text>
          </>
        )}
        <text x={circ/2} y={rectY + H + gap + R} textAnchor="middle" dominantBaseline="middle"
          fill={LC} fontSize={9} fontFamily="monospace">alas</text>
      </g>,
      <DimText key="dr" x={circ/2 + R + 14} y={R} t={`r=${r}cm`} />,
      <DimText key="dh" x={circ + 10} y={rectY + H/2} t={`h=${h}cm`} anchor="start" />,
      <DimText key="dc" x={circ/2} y={rectY - 12} t={`2πr ≈ ${(2*Math.PI*r).toFixed(1)}cm`} />,
    ],
  }
}

function netKerucut({ r, h }, showNumbers, highlightFaces, flapSize, showFlaps) {
  const R = r * SC, H = h * SC
  const F = flapSize * SC
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
  
  const isHighlightSelimut = highlightFaces.includes('selimut')
  const isHighlightAlas = highlightFaces.includes('alas')
  
  const flaps = showFlaps ? [
    // Flap di sisi kanan juring
    { pts: `${x2},${y2} ${x2+F*0.5},${y2+F*0.866} ${cx+F*0.5},${cy+F*0.866} ${cx},${cy}`, side: 'sector' },
  ] : []
  
  return {
    W: L * 2 + 30 + 2*R + (showFlaps ? F : 0),
    H: Math.max(y1, y2) + 10 + (showFlaps ? F : 0),
    xOffset: 0,
    yOffset: showFlaps ? F*0.866 : 0,
    els: [
      ...flaps.map((fl, i) => <Flap key={`flap${i}`} {...fl} />),
      <g key="sector">
        <path d={sPath} 
          fill={isHighlightSelimut ? 'rgba(251,191,36,0.15)' : FF} 
          stroke={isHighlightSelimut ? DC : FS} 
          strokeWidth={isHighlightSelimut ? 2.5 : FSW} />
        {showNumbers && (
          <>
            <circle cx={cx} cy={L/2} r={9} fill="rgba(251,191,36,0.9)" stroke="#000" strokeWidth={0.5} />
            <text x={cx} y={L/2} textAnchor="middle" dominantBaseline="middle"
              fill="#000" fontSize={10} fontWeight="bold" fontFamily="monospace">1</text>
          </>
        )}
        <text x={cx - L/3} y={L/2} textAnchor="middle" dominantBaseline="middle"
          fill={LC} fontSize={9} fontFamily="monospace">selimut</text>
      </g>,
      <g key="circ">
        <circle cx={circX} cy={circY} r={R} 
          fill={isHighlightAlas ? 'rgba(251,191,36,0.15)' : FF} 
          stroke={isHighlightAlas ? DC : FS} 
          strokeWidth={isHighlightAlas ? 2.5 : FSW} />
        {showNumbers && (
          <>
            <circle cx={circX + 15} cy={circY - 15} r={9} fill="rgba(251,191,36,0.9)" stroke="#000" strokeWidth={0.5} />
            <text x={circX + 15} y={circY - 15} textAnchor="middle" dominantBaseline="middle"
              fill="#000" fontSize={10} fontWeight="bold" fontFamily="monospace">2</text>
          </>
        )}
        <text x={circX} y={circY} textAnchor="middle" dominantBaseline="middle"
          fill={LC} fontSize={9} fontFamily="monospace">alas</text>
      </g>,
      <DimText key="dr" x={circX} y={circY + R + 16} t={`r=${r}cm`} />,
      <DimText key="ds" x={cx + (x2-cx)/2 + 12} y={(y2)/2} t={`s≈${l_cm.toFixed(1)}cm`} />,
    ],
  }
}

const NET_FUNCS = {
  kubus: netKubus,
  balok: netBalok,
  prisma: netPrisma,
  limas: netLimas,
  tabung: netTabung,
  kerucut: netKerucut,
}

// ─── Info Panel ───────────────────────────────────────────────────────────────
function InfoPanel({ shapeId, dims }) {
  const formulas = {
    kubus: { L: '6a²', V: 'a³' },
    balok: { L: '2(pl + pt + lt)', V: 'p × l × t' },
    prisma: { L: '(a·l) + 2·½a·√3a/2', V: '½a·√3a/2·l' },
    limas: { L: 'a² + 4·½a·s', V: '⅓a²·tinggi' },
    tabung: { L: '2πr(r+h)', V: 'πr²h' },
    kerucut: { L: 'πr(r+s)', V: '⅓πr²h' },
  }

  const f = formulas[shapeId]
  if (!f) return null

  return (
    <div className="p-3 rounded border border-cyan-900/30 bg-cyan-950/20">
      <p className="text-[9px] text-slate-600 uppercase tracking-widest mb-1.5">Rumus</p>
      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span className="text-slate-500">Luas:</span>
          <code className="text-cyan-400">{f.L}</code>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Volume:</span>
          <code className="text-cyan-400">{f.V}</code>
        </div>
      </div>
    </div>
  )
}

// ─── Corner Marks ─────────────────────────────────────────────────────────────
function CornerMarks({ W, H }) {
  const sz = 6
  const off = 4
  return (
    <g stroke={FS} strokeWidth={0.8} opacity={0.3} fill="none">
      <path d={`M ${-off} ${-off-sz} L ${-off} ${-off} L ${-off+sz} ${-off}`} />
      <path d={`M ${W+off-sz} ${-off} L ${W+off} ${-off} L ${W+off} ${-off+sz}`} />
      <path d={`M ${-off} ${H+off-sz} L ${-off} ${H+off} L ${-off+sz} ${H+off}`} />
      <path d={`M ${W+off} ${H+off-sz} L ${W+off} ${H+off} L ${W+off-sz} ${H+off}`} />
    </g>
  )
}

// ─── Download Bar ─────────────────────────────────────────────────────────────
function DownloadBar({ onSVG, onPNG, status }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onSVG}
        disabled={status === 'svg' || status === 'done'}
        className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold
          bg-cyan-900/40 hover:bg-cyan-800/50 text-cyan-300 rounded border border-cyan-700/30
          disabled:opacity-50 disabled:cursor-not-allowed transition-all">
        {status === 'svg' ? 'Downloading...' : status === 'done' ? '✓ Done' : 'SVG'}
      </button>
      <button
        onClick={onPNG}
        disabled={status === 'png' || status === 'done'}
        className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold
          bg-amber-900/40 hover:bg-amber-800/50 text-amber-300 rounded border border-amber-700/30
          disabled:opacity-50 disabled:cursor-not-allowed transition-all">
        {status === 'png' ? 'Rendering...' : status === 'done' ? '✓ Done' : 'PNG'}
      </button>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [shapeId, setShapeId] = useState('balok')
  const [dims, setDims] = useState({})
  const [dlState, setDlState] = useState(null)
  const [activeTab, setActiveTab] = useState('net')
  const [currentStep, setCurrentStep] = useState(0)
  const [showNumbers, setShowNumbers] = useState(false)
  const [showFlaps, setShowFlaps] = useState(true)
  const [flapSize, setFlapSize] = useState(1.5) // cm
  const svgRef = useRef(null)

  const shape = SHAPES.find(s => s.id === shapeId)
  const foldGuide = FOLD_GUIDES[shapeId] || []
  
  const highlightFaces = currentStep > 0 && currentStep <= foldGuide.length
    ? foldGuide[currentStep - 1].faces
    : []

  const net = useMemo(() => {
    const fn = NET_FUNCS[shapeId]
    if (!fn) return { W: 100, H: 100, els: [], xOffset: 0, yOffset: 0 }
    const params = {}
    shape.fields.forEach(f => {
      params[f.k] = dims[f.k] ?? f.def
    })
    return fn(params, showNumbers, highlightFaces, flapSize, showFlaps)
  }, [shapeId, dims, shape, showNumbers, highlightFaces, flapSize, showFlaps])

  function handleShapeChange(id) {
    setShapeId(id)
    setDims({})
    setCurrentStep(0)
  }

  function handleDim(k, v) {
    setDims(prev => ({ ...prev, [k]: parseFloat(v) }))
  }

  function getFilename(ext) {
    const vals = shape.fields.map(f => `${f.k}${dims[f.k] ?? f.def}`).join('_')
    return `jaring_${shapeId}_${vals}_flap${flapSize}.${ext}`
  }

  function buildSVGString() {
    const el = svgRef.current
    if (!el) return null
    const vb = el.getAttribute('viewBox').split(' ').map(Number)
    const [vx, vy, vw, vh] = vb
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}" width="${vw}" height="${vh}">` +
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
    <div className="min-h-screen bg-[#060b16] text-white select-none"
      style={{ fontFamily: "'Courier New', monospace" }}>

      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(0,180,220,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,180,220,0.035) 1px, transparent 1px)
        `,
        backgroundSize: `${SC}px ${SC}px`,
      }} />

      <div className="relative z-10 flex flex-col" style={{ minHeight: '100vh' }}>

        <header className="px-5 py-3 border-b border-cyan-900/25 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 border-2 border-cyan-500 rotate-45" />
            <div className="w-2 h-2 border border-cyan-700 rotate-45 -ml-3" />
          </div>
          <span className="text-cyan-200 font-bold tracking-[0.18em] text-sm">
            JARING-JARING BANGUN RUANG
          </span>
          <div className="ml-auto flex items-center gap-4 text-[10px] text-slate-600">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" 
                checked={showNumbers} 
                onChange={(e) => setShowNumbers(e.target.checked)}
                className="w-3 h-3 accent-cyan-400"
              />
              <span>Nomor</span>
            </label>
            <span className="text-cyan-900">&#9670;</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" 
                checked={showFlaps} 
                onChange={(e) => setShowFlaps(e.target.checked)}
                className="w-3 h-3 accent-amber-400"
              />
              <span>Lebihan Lem</span>
            </label>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">

          <aside className="w-64 border-r border-cyan-900/25 p-4 flex flex-col gap-5 shrink-0 overflow-y-auto">

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

            {showFlaps && (
              <div className="p-3 rounded border border-amber-900/30 bg-amber-950/20">
                <p className="text-[10px] text-amber-400 uppercase tracking-widest mb-2.5">
                  ✂️ Ukuran Lebihan Lem
                </p>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[10px] text-slate-500">Lebar flap</span>
                  <span className="text-amber-300 text-xs font-bold">{flapSize} cm</span>
                </div>
                <input
                  type="range" min={0.5} max={3} step={0.1}
                  value={flapSize}
                  onChange={e => setFlapSize(parseFloat(e.target.value))}
                  className="w-full h-1 accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-700 mt-0.5">
                  <span>0.5</span><span>3</span>
                </div>
                <p className="text-[9px] text-slate-600 mt-2 leading-relaxed">
                  Area abu-abu adalah bagian untuk lem. Semakin besar, semakin mudah direkatkan.
                </p>
              </div>
            )}

            <InfoPanel shapeId={shapeId} dims={dims} />

            <div className="mt-auto pt-3 border-t border-cyan-900/20">
              <p className="text-[9px] text-slate-700 uppercase tracking-widest mb-1.5">Keterangan</p>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-2 rounded-sm border border-cyan-500/50" style={{ background: FF }} />
                <span className="text-[10px] text-slate-600">Bidang utama</span>
              </div>
              {showFlaps && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-2 rounded-sm border border-gray-500/50" style={{ background: FLAP_COLOR }} />
                  <span className="text-[10px] text-slate-600">Lebihan lem</span>
                </div>
              )}
            </div>
          </aside>

          <main className="flex-1 flex flex-col overflow-hidden">
            
            <div className="border-b border-cyan-900/25 px-6 pt-4 flex gap-1">
              <button
                onClick={() => setActiveTab('net')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t transition-all ${
                  activeTab === 'net'
                    ? 'bg-[#050a13] text-cyan-300 border-t border-l border-r border-cyan-900/40'
                    : 'text-slate-500 hover:text-slate-300'
                }`}>
                📐 Pola Jaring
              </button>
              <button
                onClick={() => setActiveTab('guide')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t transition-all ${
                  activeTab === 'guide'
                    ? 'bg-[#050a13] text-cyan-300 border-t border-l border-r border-cyan-900/40'
                    : 'text-slate-500 hover:text-slate-300'
                }`}>
                📖 Panduan Lipat
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              {activeTab === 'net' ? (
                <div className="flex items-center justify-center p-6 bg-[#050a13] h-full">
                  <div className="relative flex flex-col items-center gap-3">
                    <div className="w-full flex items-center justify-between gap-4">
                      <div className="text-[10px] text-slate-600 uppercase tracking-[0.25em]">
                        NET · {shape.label}
                      </div>
                      <DownloadBar onSVG={downloadSVG} onPNG={downloadPNG} status={dlState} />
                    </div>

                    <div className="border border-cyan-900/20 rounded bg-[#060c18] p-1">
                      <svg
                        ref={svgRef}
                        viewBox={`${-PAD - net.xOffset} ${-PAD - net.yOffset} ${net.W + PAD * 2} ${net.H + PAD * 2}`}
                        style={{
                          maxWidth: '100%',
                          maxHeight: 'calc(100vh - 200px)',
                          width: `${net.W + PAD * 2}px`,
                          overflow: 'visible',
                          display: 'block',
                        }}>
                        <defs>
                          <pattern id="dotgrid" x="0" y="0" width={SC} height={SC} patternUnits="userSpaceOnUse">
                            <circle cx={SC/2} cy={SC/2} r={0.6} fill="rgba(0,180,220,0.12)" />
                          </pattern>
                        </defs>
                        <rect x={-PAD - net.xOffset} y={-PAD - net.yOffset} 
                          width={net.W + PAD*2} height={net.H + PAD*2}
                          fill="url(#dotgrid)" />
                        <CornerMarks W={net.W} H={net.H} />
                        {net.els}
                      </svg>
                    </div>

                    <div className="flex gap-4 text-[10px]">
                      {shape.fields.map(f => (
                        <span key={f.k} className="text-slate-600">
                          <span className="text-slate-500">{f.lbl.split(' ')[0]}</span>
                          {' = '}
                          <span className="text-amber-500">{dims[f.k] ?? f.def} cm</span>
                        </span>
                      ))}
                      {showFlaps && (
                        <span className="text-slate-600">
                          <span className="text-slate-500">Flap</span>
                          {' = '}
                          <span className="text-amber-500">{flapSize} cm</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full">
                  <div className="w-80 border-r border-cyan-900/25 p-6 overflow-y-auto">
                    <h3 className="text-sm font-bold text-cyan-300 mb-4 uppercase tracking-wider">
                      Panduan Melipat {shape.label}
                    </h3>
                    
                    <div className="space-y-3">
                      {foldGuide.map((step, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentStep(idx + 1)}
                          className={`w-full text-left p-3 rounded border transition-all ${
                            currentStep === idx + 1
                              ? 'bg-amber-900/20 border-amber-600/40 text-amber-200'
                              : 'bg-cyan-950/20 border-cyan-900/30 text-slate-400 hover:bg-cyan-950/30'
                          }`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              currentStep === idx + 1
                                ? 'bg-amber-500 text-black'
                                : 'bg-cyan-900/50 text-cyan-400'
                            }`}>
                              {step.step}
                            </div>
                            <p className="text-xs leading-relaxed">{step.desc}</p>
                          </div>
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentStep(0)}
                        className={`w-full text-left p-3 rounded border transition-all ${
                          currentStep === 0
                            ? 'bg-cyan-900/20 border-cyan-600/40 text-cyan-200'
                            : 'bg-slate-950/20 border-slate-800/30 text-slate-500 hover:bg-slate-950/30'
                        }`}>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-slate-700 text-white">
                            ↺
                          </div>
                          <p className="text-xs">Reset / Lihat Semua</p>
                        </div>
                      </button>
                    </div>

                    <div className="mt-6 p-3 bg-cyan-950/30 rounded border border-cyan-900/30">
                      <p className="text-[10px] text-cyan-400 uppercase tracking-wider mb-2">💡 Tips:</p>
                      <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc list-inside">
                        <li>Gunakan penggaris untuk lipatan rapi</li>
                        <li>Bagian abu-abu adalah tempat lem</li>
                        <li>Tekan kuat-kuat agar tidak lepas</li>
                        <li>Biarkan lem kering sebelum digunakan</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex-1 flex items-center justify-center p-6 bg-[#050a13]">
                    <div className="relative flex flex-col items-center gap-4">
                      {currentStep > 0 && (
                        <div className="bg-amber-900/30 border border-amber-600/40 rounded px-4 py-2">
                          <p className="text-sm text-amber-200 font-bold">
                            Langkah {currentStep}: {foldGuide[currentStep - 1]?.desc}
                          </p>
                        </div>
                      )}
                      
                      <div className="border border-cyan-900/20 rounded bg-[#060c18] p-1">
                        <svg
                          viewBox={`${-PAD - net.xOffset} ${-PAD - net.yOffset} ${net.W + PAD * 2} ${net.H + PAD * 2}`}
                          style={{
                            maxWidth: '100%',
                            maxHeight: 'calc(100vh - 240px)',
                            width: `${net.W + PAD * 2}px`,
                            overflow: 'visible',
                            display: 'block',
                          }}>
                          <defs>
                            <pattern id="dotgrid" x="0" y="0" width={SC} height={SC} patternUnits="userSpaceOnUse">
                              <circle cx={SC/2} cy={SC/2} r={0.6} fill="rgba(0,180,220,0.12)" />
                            </pattern>
                          </defs>
                          <rect x={-PAD - net.xOffset} y={-PAD - net.yOffset} 
                            width={net.W + PAD*2} height={net.H + PAD*2}
                            fill="url(#dotgrid)" />
                          <CornerMarks W={net.W} H={net.H} />
                          {net.els}
                        </svg>
                      </div>

                      {currentStep === 0 && (
                        <p className="text-xs text-slate-500 text-center max-w-md">
                          Pilih langkah di sebelah kiri untuk melihat bagian mana yang harus dilipat.
                          Bagian yang di-highlight berwarna kuning adalah bagian yang aktif.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
