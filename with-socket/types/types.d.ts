type EventPayloadMapping = {
  ping: string
}

interface Window {
  electron: {
    testPing: () => Promise<string>
  }
}

declare module 'usb' {
  const usb: any
  export = usb
}

interface ISelectedPrinter {
  idProduct: number
  idVendor: number
  productName: string
}
