import { useCallback, useEffect, useRef, useState } from 'react'
import Globe from 'react-globe.gl'
import { Globe as GlobeIcon } from 'lucide-react'
import { api } from '@/lib/api'
import boundaryData from '@/assets/an-hai-boundary.json'

const AN_HAI       = { lat: 16.0639, lng: 108.2298 }
const FAR_VIEW     = { lat: 14, lng: 100, altitude: 2.6 }
const CLOSE_VIEW   = { lat: AN_HAI.lat, lng: AN_HAI.lng, altitude: 0.08 }

// Tọa độ trung tâm khớp với Google Maps iframe bên dưới
const MAP_CENTER   = { lat: 16.0693, lng: 108.2389 }
const MAP_ZOOM     = 15
const MAP_EMBED    =
  `https://maps.google.com/maps?ll=${MAP_CENTER.lat},${MAP_CENTER.lng}&t=k&z=${MAP_ZOOM}&output=embed&hl=vi`

const STATUS_COLOR = { pending: '#f59e0b', draft: '#3b82f6' }
const STATUS_LABEL = { pending: 'Đang chờ xử lý', draft: 'Đang soạn thảo' }

/**
 * Chuyển lat/lng → pixel (x, y) tương đối với container.
 * Dùng phép chiếu Mercator khớp với Google Maps tile system.
 */
function latLngToXY(lat, lng, w, h) {
  const TILE = 256
  const world = TILE * Math.pow(2, MAP_ZOOM)
  const toX = (l) => ((l + 180) / 360) * world
  const toY = (l) => {
    const r = (l * Math.PI) / 180
    return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * world
  }
  return {
    x: w / 2 + (toX(lng) - toX(MAP_CENTER.lng)),
    y: h / 2 + (toY(lat) - toY(MAP_CENTER.lat)),
  }
}

// Vẽ ranh giới An Hải bằng SVG chồng lên iframe (cùng phép chiếu Mercator)
function BoundaryOverlay({ containerSize }) {
  const { w, h } = containerSize
  const ring = boundaryData.features[0].geometry.coordinates[0] // [lng, lat][]
  const pts = ring
    .map(([lng, lat]) => {
      const { x, y } = latLngToXY(lat, lng, w, h)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 4, overflow: 'visible',
      }}
    >
      <polygon
        points={pts}
        fill="rgba(220,38,38,0.08)"
        stroke="#dc2626"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeDasharray="0"
      />
    </svg>
  )
}

function MarkerLayer({ markers, containerSize }) {
  const [openId, setOpenId] = useState(null)
  const { w, h } = containerSize

  return (
    <div className="absolute inset-0 z-[2] overflow-hidden" style={{ pointerEvents: 'none' }}>
      {markers.map((m) => {
        const { x, y } = latLngToXY(m.lat, m.lng, w, h)
        if (x < -20 || x > w + 20 || y < -20 || y > h + 20) return null

        const color = STATUS_COLOR[m.status] || '#6b7280'
        const isOpen = openId === m.id

        return (
          <div
            key={m.id}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'auto',
              zIndex: isOpen ? 10 : 5,
            }}
          >
            {/* Dot marker */}
            <div
              onClick={() => setOpenId(isOpen ? null : m.id)}
              style={{
                width: 14, height: 14,
                borderRadius: '50%',
                background: color,
                border: '2.5px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,.55)',
                cursor: 'pointer',
                transition: 'transform .15s',
                transform: isOpen ? 'scale(1.35)' : 'scale(1)',
              }}
            />

            {/* Popup */}
            {isOpen && (
              <div style={{
                position: 'absolute',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'white',
                borderRadius: 10,
                padding: '10px 13px',
                width: 240,
                boxShadow: '0 4px 20px rgba(0,0,0,.35)',
                fontSize: 13,
                lineHeight: 1.5,
                fontFamily: 'sans-serif',
                whiteSpace: 'normal',
                pointerEvents: 'auto',
              }}>
                {/* mũi tên */}
                <div style={{
                  position: 'absolute', bottom: -7, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0, height: 0,
                  borderLeft: '7px solid transparent',
                  borderRight: '7px solid transparent',
                  borderTop: '7px solid white',
                }} />

                {/* nút đóng */}
                <button
                  onClick={(e) => { e.stopPropagation(); setOpenId(null) }}
                  style={{
                    position: 'absolute', top: 6, right: 8,
                    background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: 16, color: '#9ca3af',
                    lineHeight: 1,
                  }}
                >×</button>

                <div style={{ fontWeight: 700, color: '#059669', marginBottom: 3 }}>
                  {m.icon} {m.category}
                </div>
                <div style={{ marginBottom: 3 }}>
                  <span style={{
                    background: '#f3f4f6', borderRadius: 4,
                    padding: '1px 6px', fontSize: 11,
                    fontWeight: 600, color: '#374151',
                  }}>#{m.id}</span>
                  <span style={{ marginLeft: 6, fontSize: 11, color: '#6b7280' }}>
                    {new Date(m.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                {m.address && (
                  <div style={{ color: '#6b7280', fontSize: 11, marginBottom: 3 }}>
                    📍 {m.address}
                  </div>
                )}
                <div style={{ color: '#374151', marginBottom: 6 }}>{m.content}</div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: color + '22', borderRadius: 6,
                  padding: '2px 8px', fontSize: 11,
                  fontWeight: 600, color,
                }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: color, display: 'inline-block',
                  }} />
                  {STATUS_LABEL[m.status] || 'Đang xử lý'}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function GlobeHero() {
  const globeEl    = useRef()
  const mapRef     = useRef()   // wrapper div (opacity toggle)
  const backRef    = useRef()
  const hintRef    = useRef()
  const zoomedRef  = useRef(false)
  const flyTimer   = useRef()

  const [size, setSize]         = useState({ width: window.innerWidth, height: window.innerHeight })
  const [markers, setMarkers]   = useState([])
  const [mapSize, setMapSize]   = useState({ w: window.innerWidth, h: window.innerHeight })
  const [mapVisible, setMapVisible] = useState(false)

  // Theo dõi kích thước màn hình
  useEffect(() => {
    const onResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight })
      if (mapRef.current) {
        const r = mapRef.current.getBoundingClientRect()
        setMapSize({ w: r.width, h: r.height })
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Tải markers một lần
  useEffect(() => {
    api.get('/api/public/map-markers')
      .then((r) => setMarkers(r.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => () => clearTimeout(flyTimer.current), [])

  const flyToAnHai = useCallback(() => {
    if (!globeEl.current || zoomedRef.current) return
    zoomedRef.current = true
    globeEl.current.controls().autoRotate = false
    globeEl.current.pointOfView(CLOSE_VIEW, 4000)
    if (hintRef.current) hintRef.current.style.opacity = '0'

    clearTimeout(flyTimer.current)
    flyTimer.current = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.style.opacity = '1'
        mapRef.current.style.pointerEvents = 'auto'
        const r = mapRef.current.getBoundingClientRect()
        setMapSize({ w: r.width, h: r.height })
      }
      if (backRef.current) {
        backRef.current.style.opacity = '1'
        backRef.current.style.pointerEvents = 'auto'
      }
      setMapVisible(true)
    }, 3300)
  }, [])

  const backToGlobe = useCallback(() => {
    clearTimeout(flyTimer.current)
    if (mapRef.current) {
      mapRef.current.style.opacity = '0'
      mapRef.current.style.pointerEvents = 'none'
    }
    if (backRef.current) {
      backRef.current.style.opacity = '0'
      backRef.current.style.pointerEvents = 'none'
    }
    if (hintRef.current) hintRef.current.style.opacity = ''
    zoomedRef.current = false
    setMapVisible(false)

    if (globeEl.current) {
      globeEl.current.pointOfView(FAR_VIEW, 2600)
      setTimeout(() => {
        if (globeEl.current) globeEl.current.controls().autoRotate = true
      }, 2600)
    }
  }, [])

  const onGlobeReady = useCallback(() => {
    const c = globeEl.current.controls()
    c.autoRotate = true
    c.autoRotateSpeed = 0.4
    c.enableDamping = true
    c.dampingFactor = 0.08
    c.minDistance = 102
    c.maxDistance = 800
    globeEl.current.pointOfView(FAR_VIEW, 0)
  }, [])

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: 'radial-gradient(circle at 64% 42%, #0a1430 0%, #050a1c 55%, #01030a 100%)' }}
    >
      {/* Layer 0: quả địa cầu 3D */}
      <div className="absolute inset-0 z-0" style={{ transform: 'translateX(-11%)' }}>
        <Globe
          ref={globeEl}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="/globe/earth-blue-marble.jpg"
          bumpImageUrl="/globe/earth-topology.png"
          showAtmosphere
          atmosphereColor="#6fb0ff"
          atmosphereAltitude={0.2}
          pointsData={[AN_HAI]}
          pointColor={() => '#f4c245'}
          pointAltitude={0.015}
          pointRadius={0.45}
          pointResolution={18}
          ringsData={[AN_HAI]}
          ringColor={() => (t) => `rgba(244,194,69,${1 - t})`}
          ringMaxRadius={5}
          ringPropagationSpeed={3}
          ringRepeatPeriod={900}
          onGlobeClick={flyToAnHai}
          onPointClick={flyToAnHai}
          onGlobeReady={onGlobeReady}
        />
      </div>

      {/* Layer 1: Google Maps satellite (tự có ranh giới đỏ An Hải) + marker overlay */}
      <div
        ref={mapRef}
        className="absolute inset-0 z-[1]"
        style={{ opacity: 0, pointerEvents: 'none', transition: 'opacity 1.2s ease' }}
      >
        {/* iframe Google Maps — chỉ làm nền vệ tinh, không cho user kéo/zoom */}
        <iframe
          title="Bản đồ An Hải"
          src={MAP_EMBED}
          className="absolute inset-0 w-full h-full border-0"
          style={{ pointerEvents: 'none', zIndex: 0 }}
          allowFullScreen
        />

        {/* Chặn toàn bộ tương tác với iframe để tiles không dịch chuyển */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }} />

        {/* Ranh giới An Hải - SVG đỏ khớp phép chiếu Mercator với iframe */}
        {mapVisible && <BoundaryOverlay containerSize={mapSize} />}

        {/* Overlay marker (div tuyệt đối tính từ lat/lng) */}
        {mapVisible && markers.length > 0 && (
          <MarkerLayer markers={markers} containerSize={mapSize} />
        )}

        {/* Ô thông tin số hồ sơ */}
        {mapVisible && (
          <div style={{
            position: 'absolute', top: 12, left: 12, zIndex: 20,
            background: 'rgba(255,255,255,.93)',
            borderRadius: 10, padding: '8px 13px',
            fontFamily: 'sans-serif', fontSize: 12,
            boxShadow: '0 2px 10px rgba(0,0,0,.25)',
            lineHeight: 1.5, pointerEvents: 'none',
          }}>
            <div style={{ fontWeight: 700, color: '#059669', fontSize: 13 }}>
              🗺️ Bản đồ phản ánh
            </div>
            <div style={{ color: '#374151' }}>Phường An Hải, Đà Nẵng</div>
            <div style={{ color: markers.length ? '#f59e0b' : '#6b7280', fontWeight: 600, marginTop: 2 }}>
              {markers.length > 0
                ? `${markers.length} hồ sơ đang chờ xử lý`
                : 'Không có hồ sơ chờ xử lý'}
            </div>
          </div>
        )}
      </div>

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{ background: 'radial-gradient(120% 100% at 50% 50%, rgba(0,0,0,0) 58%, rgba(2,4,12,.55) 100%)' }}
      />

      {/* Hint */}
      <div
        ref={hintRef}
        className="animate-pulse-hint pointer-events-none absolute z-[4] flex items-center gap-2 text-[13px] font-semibold"
        style={{
          left: 'clamp(20px,4vw,64px)', bottom: 30,
          color: 'rgba(220,233,255,.92)', textShadow: '0 1px 10px rgba(0,0,0,.8)',
        }}
      >
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#f4c245', boxShadow: '0 0 0 4px rgba(244,194,69,.25)' }} />
        Kéo để xoay • cuộn để phóng to • nhấp vào địa cầu để bay tới An Hải
      </div>

      <button
        ref={backRef}
        type="button"
        onClick={backToGlobe}
        className="absolute z-[5] flex h-11 items-center gap-2 rounded-full pl-4 pr-5 text-sm font-bold text-white transition-opacity duration-500 hover:border-emerald-400"
        style={{
          left: 'clamp(20px,4vw,64px)', bottom: 28,
          opacity: 0, pointerEvents: 'none',
          border: '1px solid rgba(255,255,255,.35)',
          background: 'rgba(8,16,36,.7)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <GlobeIcon className="h-4 w-4" /> Quay lại quả địa cầu
      </button>
    </div>
  )
}
