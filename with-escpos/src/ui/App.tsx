import './App.css'

function App() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <h1 style={{ marginBottom: 20 }}>Electron Thermal Printer</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={() => window.electron.testPing()}>Ping!</button>
        <button onClick={() => window.electron.startPrintUsb()}>
          Print via ESCPOS-USB
        </button>
        <button onClick={() => window.electron.startPrintNetwork()}>
          Print via ESCPOS-Network
        </button>
      </div>
    </div>
  )
}

export default App
