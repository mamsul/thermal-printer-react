type EventPayloadMapping = {
  ping: string
  'print-via-escpos-usb': void
  'print-via-escpos-network': void
}

interface Window {
  electron: {
    testPing: () => Promise<string>
    startPrintUsb: () => void
    startPrintNetwork: () => void
  }
}
