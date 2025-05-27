import { app, BrowserWindow } from 'electron'
import path from 'path'
import { ipcHandle, isDev } from './utils.js'
import { getPreloadPath } from './path-resolver.js'

import http from 'http'
import { Server } from 'socket.io'

import usb from 'usb'
import escpos from 'escpos'
import escposUsb from 'escpos-usb'
import escposNetwork from 'escpos-network'

escpos.NEWUSB = escposUsb
escpos.Network = escposNetwork

function getPrinterInfo(device: any) {
  return new Promise((resolve) => {
    try {
      device.open()
      const desc = device.deviceDescriptor

      device.getStringDescriptor(desc.iProduct, (err: any, product: any) => {
        const name = err ? 'Unknown Printer' : product
        resolve({
          idVendor: desc.idVendor,
          idProduct: desc.idProduct,
          productName: name,
        })

        device.close()
      })
    } catch (e) {
      console.log(e)
      resolve(null)
    }
  })
}

// ==========================================================
// ==================== Socket IO Server ====================
const server = http.createServer()
const io = new Server(server, { cors: { origin: '*' } })

io.on('connection', (socket) => {
  console.log('Client connected', socket.id)

  socket.on('ping-socket-electron', () => {
    socket.emit('pong-socket-electron', 'Hello from Electron!')
  })

  // Ambil list printer yang terhubung
  socket.on('list-escpos-printer', async () => {
    const printers = escpos.NEWUSB.findPrinter() as any
    const printerInfos = await Promise.all(
      printers?.map((device: any) => getPrinterInfo(device)),
    )

    // console.log('CEK Printer:', printers);
    // console.log('CEK Printer Info:', printerInfos.filter(Boolean));

    socket.emit('list-escpos-printer', printerInfos.filter(Boolean))
  })

  // Start print via USB dengan library usb
  // Dengan transfer data dari FE Web dalam bentuk Uint8Array
  socket.on(
    'start-print-via-usb',
    async (data: { device: ISelectedPrinter; dataPrint: Uint8Array }) => {
      const { device, dataPrint } = data
      console.log('data: ', data)
      console.log('data id vendor: ', data.device.idVendor)
      const printer = usb.findByIds(device.idVendor, device.idProduct)
      console.log('Printer:', printer)

      if (!printer) {
        console.log('Printer not found')
        return
      }

      if (printer) {
        printer.open()

        const iface = printer.interfaces[0]

        if (iface.isKernelDriverActive()) {
          iface.detachKernelDriver()
        }
        iface.claim()

        const endpoint = iface.endpoints.find(
          (ep: any) => ep.direction === 'out',
        )

        endpoint.transfer(Buffer.from(dataPrint), (err: any) => {
          if (err) {
            console.error('Transfer error:', err)
          } else {
            console.log('Printed successfully!')
          }

          iface.release(true, (err: any) => {
            if (err) console.error('Release error:', err)
            printer.close()
          })
        })
      }
    },
  )

  socket.on('print-via-network', async (dataPrint: Uint8Array) => {
    const device = new escpos.Network('192.168.21.99', 9100)
    // const printer = new escpos.Printer(device)

    console.log({ dataPrint, device })

    // if (!device) {
    //   console.log('Printer not found')
    //   return
    // }

    // device.open((error: any) => {
    //   if (error) {
    //     console.error('Error opening device:', error)
    //     return
    //   }

    //   device.write(Buffer.from(dataPrint), (err?: any) => {
    //     if (err) {
    //       console.error('Error writing to printer:', err)
    //     } else {
    //       console.log('Data sent successfully')
    //     }

    //     device.close()
    //   })
    // })
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

server.listen(3000, () => {
  console.log('Server listening on port 3000')
})
// ==================== END of Socket IO Server ====================
// =================================================================

// ==================================================
// ==================== Electron ====================
app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
    },
  })

  if (isDev()) {
    mainWindow.loadURL('http://localhost:4006')
  } else {
    mainWindow.loadFile(path.join(app.getAppPath() + '/dist-react/index.html'))
  }

  ipcHandle('ping', () => {
    console.log('Log electron: ', 'PONG')
    return 'PONG'
  })
})
