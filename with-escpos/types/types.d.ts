type EventPayloadMapping = {
  ping: string
  'print-via-escpos-usb': void
  'print-via-escpos-usb-bitmap': void
  'print-via-escpos-network': void
  'check-connection': void
}

interface Window {
  electron: {
    testPing: () => Promise<string>
    startPrintUsb: () => void
    startPrintUsbBitmap: () => void
    startPrintNetwork: () => void
    checkConnection: () => void
  }
}
