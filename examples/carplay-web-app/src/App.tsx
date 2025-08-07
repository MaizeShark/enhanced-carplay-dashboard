import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import './App.css'
import {
  findDevice,
  requestDevice,
  DongleConfig,
  CommandMapping,
} from 'node-carplay/web'
import { CarPlayWorker } from './worker/types'
import useCarplayAudio from './useCarplayAudio'
import { useCarplayTouch } from './useCarplayTouch'
import { InitEvent } from './worker/render/RenderEvents'

const width = window.innerWidth
const height = window.innerHeight

const videoChannel = new MessageChannel()
const micChannel = new MessageChannel()

const config: Partial<DongleConfig> = {
  width,
  height,
  fps: 60,
  mediaDelay: 300,
}

const RETRY_DELAY_MS = 30000

function App() {
  const [isPlugged, setPlugged] = useState(false)
  const [deviceFound, setDeviceFound] = useState<Boolean | null>(null)
  const [showDashboard, setShowDashboard] = useState(false)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(
    null,
  )

  const renderWorker = useMemo(() => {
    if (!canvasElement) return

    const worker = new Worker(
      new URL('./worker/render/Render.worker.ts', import.meta.url),
    )
    const canvas = canvasElement.transferControlToOffscreen()
    worker.postMessage(new InitEvent(canvas, videoChannel.port2), [
      canvas,
      videoChannel.port2,
    ])
    return worker
  }, [canvasElement])

  useLayoutEffect(() => {
    if (canvasRef.current) {
      setCanvasElement(canvasRef.current)
    }
  }, [])

  const carplayWorker = useMemo(() => {
    const worker = new Worker(
      new URL('./worker/CarPlay.worker.ts', import.meta.url),
    ) as CarPlayWorker
    const payload = {
      videoPort: videoChannel.port1,
      microphonePort: micChannel.port1,
    }
    worker.postMessage({ type: 'initialise', payload }, [
      videoChannel.port1,
      micChannel.port1,
    ])
    return worker
  }, [])

  const { processAudio, getAudioPlayer, startRecording, stopRecording } =
    useCarplayAudio(carplayWorker, micChannel.port2)

  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }, [])

  // subscribe to worker messages
  useEffect(() => {
    carplayWorker.onmessage = ev => {
      const { type } = ev.data
      switch (type) {
        case 'plugged':
          setPlugged(true)
          break
        case 'unplugged':
          setPlugged(false)
          break
        case 'requestBuffer':
          clearRetryTimeout()
          getAudioPlayer(ev.data.message)
          break
        case 'audio':
          clearRetryTimeout()
          processAudio(ev.data.message)
          break
        case 'media':
          //TODO: implement
          break
        case 'command':
          const {
            message: { value },
          } = ev.data
          switch (value) {
            case CommandMapping.startRecordAudio:
              startRecording()
              break
            case CommandMapping.stopRecordAudio:
              stopRecording()
              break
          }
          break
        case 'failure':
          if (retryTimeoutRef.current == null) {
            console.error(
              `Carplay initialization failed -- Reloading page in ${RETRY_DELAY_MS}ms`,
            )
            retryTimeoutRef.current = setTimeout(() => {
              window.location.reload()
            }, RETRY_DELAY_MS)
          }
          break
      }
    }
  }, [
    carplayWorker,
    clearRetryTimeout,
    getAudioPlayer,
    processAudio,
    renderWorker,
    startRecording,
    stopRecording,
  ])

  const checkDevice = useCallback(
    async (request: boolean = false) => {
      const device = request ? await requestDevice() : await findDevice()
      if (device) {
        setDeviceFound(true)
        const payload = {
          config,
        }
        carplayWorker.postMessage({ type: 'start', payload })
      } else {
        setDeviceFound(false)
      }
    },
    [carplayWorker],
  )

  // usb connect/disconnect handling and device check
  useEffect(() => {
    navigator.usb.onconnect = async () => {
      checkDevice()
    }

    navigator.usb.ondisconnect = async () => {
      const device = await findDevice()
      if (!device) {
        carplayWorker.postMessage({ type: 'stop' })
        setDeviceFound(false)
      }
    }

    checkDevice()
  }, [carplayWorker, checkDevice])

  const onClick = useCallback(() => {
    checkDevice(true)
  }, [checkDevice])

  const sendTouchEvent = useCarplayTouch(carplayWorker, width, height)

  const isLoading = !isPlugged
  const shouldShowDashboard = isLoading || showDashboard

  // Simulated hybrid car data with realistic values
  const [carData, setCarData] = useState({
    speed: 0,
    gear: 'P',
    fuel: 78,
    battery: 85,
    temperature: 92,
    range: 420,
    electricRange: 45,
    mpg: 52.3,
    hybridMode: 'ECO',
    engineStatus: 'OFF',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
  })

  // Update only time and date periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCarData(prev => ({
        ...prev,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // CarPlay icon SVG
  const CarPlayIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
      <circle cx="12" cy="8.5" r="1.5" fill="rgba(255,255,255,0.8)"/>
    </svg>
  )

  // Battery icon for hybrid display
  const BatteryIcon = ({ level }: { level: number }) => (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: '24px', height: '24px' }}>
      <rect x="3" y="8" width="16" height="8" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="20" y="10" width="2" height="4" rx="1" fill="currentColor"/>
      <rect 
        x="4" 
        y="9" 
        width={`${(level / 100) * 14}`} 
        height="6" 
        rx="0.5" 
        fill={level > 20 ? "#34C759" : "#FF3B30"}
      />
    </svg>
  )

  // Hybrid system icon
  const HybridIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px' }}>
      <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
    </svg>
  )

  return (
    <div
      style={{ height: '100%', touchAction: 'none' }}
      id={'main'}
      className="App"
    >
      {/* Animated grid overlay */}
      <div className="grid-overlay" />
      
      {/* Toggle button when CarPlay is connected */}
      {isPlugged && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 20,
          display: 'flex',
          gap: '10px'
        }}>
          <button
            onClick={() => setShowDashboard(!showDashboard)}
            style={{
              background: showDashboard 
                ? 'linear-gradient(135deg, #34C759, #30D158)' 
                : 'linear-gradient(135deg, #007AFF, #5856D6)',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 20px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
          >
            {showDashboard ? '📱 CarPlay' : '🚗 Dashboard'}
          </button>
        </div>
      )}
      
      {shouldShowDashboard && (
        <div className="dashboard-screen">
          {(deviceFound === false || (isPlugged && showDashboard)) && (
            <>
              {/* Dashboard Header */}
              <div className="dashboard-header">
                <div>
                  <div className="time-display">{carData.time}</div>
                  <div className="date-display">{carData.date}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <HybridIcon />
                  <span style={{ color: '#34C759', fontSize: '14px', fontWeight: '600' }}>
                    {carData.hybridMode} MODE
                  </span>
                </div>
              </div>

              {/* Main Dashboard */}
              <div className="dashboard-main">
                {/* Left Panel */}
                <div className="left-panel">
                  <div className="data-card">
                    <div className="data-label">Fuel Level</div>
                    <div className="data-value">{carData.fuel}%</div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill progress-fuel" 
                        style={{ width: `${carData.fuel}%` }}
                      />
                    </div>
                  </div>

                  <div className="data-card">
                    <div className="data-label">Battery</div>
                    <div className="data-value" style={{ color: '#34C759' }}>{carData.battery}%</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '12px' }}>
                      <BatteryIcon level={carData.battery} />
                    </div>
                  </div>

                  <div className="data-card">
                    <div className="data-label">Engine Temp</div>
                    <div className="data-value">{carData.temperature}°</div>
                    <div className="data-unit">Fahrenheit</div>
                  </div>
                </div>

                {/* Center Panel */}
                <div className="center-panel">
                  <div className="data-card data-card-large">
                    <div className="data-label">Current Speed</div>
                    <div className="data-value data-value-large">{carData.speed}</div>
                    <div className="data-unit">MPH</div>
                  </div>

                  <div className="gear-display">{carData.gear}</div>
                  <div className="data-label">Gear</div>
                </div>

                {/* Right Panel */}
                <div className="right-panel">
                  <div className="data-card">
                    <div className="data-label">Total Range</div>
                    <div className="data-value">{carData.range}</div>
                    <div className="data-unit">Miles</div>
                  </div>

                  <div className="data-card">
                    <div className="data-label">Electric Range</div>
                    <div className="data-value" style={{ color: '#00D4FF' }}>{carData.electricRange}</div>
                    <div className="data-unit">Miles</div>
                  </div>

                  <div className="data-card">
                    <div className="data-label">Avg MPG</div>
                    <div className="data-value">{carData.mpg}</div>
                    <div className="data-unit">Miles/Gallon</div>
                  </div>
                </div>

                {/* CarPlay Connection Area */}
                <div className="carplay-connection">
                  <div className="carplay-mini-logo">
                    <CarPlayIcon />
                  </div>
                  <div className="carplay-status">
                    <h3>{isPlugged ? 'CarPlay Connected' : 'CarPlay Ready'}</h3>
                    <p>{isPlugged ? 'Tap the toggle button to switch views' : 'Connect your iPhone to access CarPlay'}</p>
                  </div>
                  {!isPlugged && (
                    <button className="connect-button" onClick={onClick}>
                      Connect Device
                    </button>
                  )}
                  {isPlugged && (
                    <button 
                      className="connect-button" 
                      onClick={() => setShowDashboard(!showDashboard)}
                      style={{ background: 'linear-gradient(135deg, #34C759, #30D158)' }}
                    >
                      Switch to CarPlay
                    </button>
                  )}
                </div>
              </div>

              {/* Status Grid */}
              <div className="status-grid">
                <div className="status-item">
                  <div className="status-icon green" />
                  <span className="status-text">Hybrid System</span>
                </div>
                <div className="status-item">
                  <div className="status-icon blue" />
                  <span className="status-text">Engine {carData.engineStatus}</span>
                </div>
                <div className="status-item">
                  <div className="status-icon green" />
                  <span className="status-text">All Systems OK</span>
                </div>
                <div className="status-item">
                  <div className={`status-icon ${isPlugged ? 'green' : 'yellow'}`} />
                  <span className="status-text">CarPlay {isPlugged ? 'Connected' : 'Disconnected'}</span>
                </div>
              </div>
            </>
          )}
          {deviceFound === true && !isPlugged && (
            <div className="waiting-screen">
              <div className="loading-container">
                <div className="carplay-logo">
                  <CarPlayIcon />
                </div>
                <h1 className="status-text">Connecting...</h1>
                <div className="custom-spinner" />
                <p className="loading-text">Establishing CarPlay connection</p>
                <div className="status-indicator">
                  <div className="status-dot" />
                  <span>Device found - Initializing</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <div
        id="videoContainer"
        onPointerDown={sendTouchEvent}
        onPointerMove={sendTouchEvent}
        onPointerUp={sendTouchEvent}
        onPointerCancel={sendTouchEvent}
        onPointerOut={sendTouchEvent}
        style={{
          height: '100%',
          width: '100%',
          padding: 0,
          margin: 0,
          display: 'flex',
        }}
      >
        <canvas
          ref={canvasRef}
          id="video"
          style={isPlugged && !showDashboard ? { height: '100%' } : { display: 'none' }}
        />
      </div>
    </div>
  )
}

export default App
