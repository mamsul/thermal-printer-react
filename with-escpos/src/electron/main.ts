import { app, BrowserWindow } from 'electron'
import path from 'path'
import { ipcHandle, isDev } from './utils.js'
import { getPreloadPath } from './path-resolver.js'

import escpos from 'escpos'
import escposUsb from 'escpos-usb'
escpos.NEWUSB = escposUsb

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

  // print via escpos usb
  ipcHandle('print-via-escpos-usb', () => {
    const device = new escpos.NEWUSB(4070, 33054)
    const printer = new escpos.Printer(device)

    console.log({ device, printer })

    // templating
    device.open((error: any) => {
      if (error) {
        console.error('Error opening device:', error)
        return
      }

      function formatLeftRight(
        left: string,
        right: string,
        width = 32,
      ): string {
        const space = width - left.length - right.length
        const spacer = space > 0 ? ' '.repeat(space) : ' '
        return `${left}${spacer}${right}`
      }

      printer.font('B')
      printer.style('NORMAL')
      printer.align('LT').text('')
      printer.style('B')
      printer.align('CT').text('React Electron')
      printer.align('CT').text('Thermal Printer')
      printer.align('LT').text('')

      printer.style('B')
      printer.align('LT').text('Print Barcode: CODE39')
      printer.align('CT').barcode('CODE39', 'CODE39')
      printer.align('CT').text('')

      printer.style('U')
      printer.align('LT').text('Text Underline')
      printer.align('CT').text('')

      printer.style('NORMAL')
      const line1 = formatLeftRight('Sikat Gigi', 'Rp 12.000')
      const line2 = formatLeftRight('Odol', 'Rp 21.000')
      const line3 = formatLeftRight('Sabun Mandi', 'Rp 4.000')
      printer.text(line1)
      printer.text(line2)
      printer.text(line3)
      printer.align('CT').text('')

      printer.align('CT').qrimage('https://github.com/mamsul', function () {
        printer.align('CT').text('https://github.com/mamsul')
        printer.align('CT').text('')
        printer.align('CT').text('')
        printer.cut()
        printer.close()
      })

      // print action
      printer.cut()
      printer.cashdraw(2)
      printer.close()
    })
  })

  // print via escpos network
  ipcHandle('print-via-escpos-network', () => {
    const device = new escpos.Network('192.168.1.100', 9100)
    const printer = new escpos.Printer(device)

    console.log({ device, printer })

    // templating
    device.open((error: any) => {
      if (error) {
        console.error('Error opening device:', error)
        return
      }

      function formatLeftRight(
        left: string,
        right: string,
        width = 32,
      ): string {
        const space = width - left.length - right.length
        const spacer = space > 0 ? ' '.repeat(space) : ' '
        return `${left}${spacer}${right}`
      }

      printer.font('B')
      printer.style('NORMAL')
      printer.align('LT').text('')
      printer.style('B')
      printer.align('CT').text('React Electron')
      printer.align('CT').text('Thermal Printer')
      printer.align('LT').text('')

      printer.style('B')
      printer.align('LT').text('Print Barcode: CODE39')
      printer.align('CT').barcode('CODE39', 'CODE39')
      printer.align('CT').text('')

      printer.style('U')
      printer.align('LT').text('Text Underline')
      printer.align('CT').text('')

      printer.style('NORMAL')
      const line1 = formatLeftRight('Sikat Gigi', 'Rp 12.000')
      const line2 = formatLeftRight('Odol', 'Rp 21.000')
      const line3 = formatLeftRight('Sabun Mandi', 'Rp 4.000')
      printer.text(line1)
      printer.text(line2)
      printer.text(line3)
      printer.align('CT').text('')

      printer.align('CT').qrimage('https://github.com/mamsul', function () {
        printer.align('CT').text('https://github.com/mamsul')
        printer.align('CT').text('')
        printer.align('CT').text('')
        printer.cut()
        printer.close()
      })

      // print action
      printer.cut()
      printer.cashdraw(2)
      printer.close()
    })
  })
})
