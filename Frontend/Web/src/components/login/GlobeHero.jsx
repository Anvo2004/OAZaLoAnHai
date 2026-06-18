import { useCallback, useEffect, useRef, useState } from 'react'
import Globe from 'react-globe.gl'
import { Globe as GlobeIcon } from 'lucide-react'

const AN_HAI = { lat: 16.0639, lng: 108.2298 }
const FAR_VIEW = { lat: 14, lng: 100, altitude: 2.6 }
const CLOSE_VIEW = { lat: AN_HAI.lat, lng: AN_HAI.lng, altitude: 0.08 }
const MAP_EMBED_SRC =
  'https://maps.google.com/maps?q=An%20H%E1%BA%A3i%2C%20S%C6%A1n%20Tr%C3%A0%2C%20%C4%90%C3%A0%20N%E1%BA%B5ng%2C%20Vi%E1%BB%87t%20Nam&t=k&z=15&output=embed&hl=vi'

export default function GlobeHero() {
  const globeEl = useRef()
  const mapRef = useRef()
  const backRef = useRef()
  const hintRef = useRef()
  const zoomedRef = useRef(false)
  const flyTimerRef = useRef()

  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight })

  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => () => clearTimeout(flyTimerRef.current), [])

  const flyToAnHai = useCallback(() => {
    if (!globeEl.current || zoomedRef.current) return
    zoomedRef.current = true

    globeEl.current.controls().autoRotate = false
    globeEl.current.pointOfView(CLOSE_VIEW, 4000)

    if (hintRef.current) hintRef.current.style.opacity = '0'

    clearTimeout(flyTimerRef.current)
    flyTimerRef.current = setTimeout(() => {
      if (mapRef.current) { mapRef.current.style.opacity = '1'; mapRef.current.style.pointerEvents = 'auto' }
      if (backRef.current) { backRef.current.style.opacity = '1'; backRef.current.style.pointerEvents = 'auto' }
    }, 3300)
  }, [])

  const backToGlobe = useCallback(() => {
    clearTimeout(flyTimerRef.current)
    if (mapRef.current) { mapRef.current.style.opacity = '0'; mapRef.current.style.pointerEvents = 'none' }
    if (backRef.current) { backRef.current.style.opacity = '0'; backRef.current.style.pointerEvents = 'none' }
    if (hintRef.current) hintRef.current.style.opacity = ''
    zoomedRef.current = false

    if (globeEl.current) {
      globeEl.current.pointOfView(FAR_VIEW, 2600)
      setTimeout(() => {
        if (globeEl.current) globeEl.current.controls().autoRotate = true
      }, 2600)
    }
  }, [])

  const onGlobeReady = useCallback(() => {
    const controls = globeEl.current.controls()
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.4
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 102
    controls.maxDistance = 800
    globeEl.current.pointOfView(FAR_VIEW, 0)
  }, [])

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: 'radial-gradient(circle at 64% 42%, #0a1430 0%, #050a1c 55%, #01030a 100%)' }}
    >
      {/* Layer 0: real 3D globe — drag to rotate, scroll to zoom, click to fly to An Hải */}
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

      {/* Layer 1: An Hải satellite map — fades in after the fly-down */}
      <iframe
        ref={mapRef}
        title="An Hải, Đà Nẵng"
        src={MAP_EMBED_SRC}
        className="absolute inset-0 z-[1] h-full w-full border-0"
        style={{ opacity: 0, pointerEvents: 'none', transition: 'opacity 1.2s ease' }}
      />

      {/* Soft vignette for depth — never blocks interaction */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{ background: 'radial-gradient(120% 100% at 50% 50%, rgba(0,0,0,0) 58%, rgba(2,4,12,.55) 100%)' }}
      />

      {/* Hint + back control */}
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
