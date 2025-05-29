import { app, BrowserWindow } from 'electron'
import path from 'path'
import { ipcHandle, isDev } from './utils.js'
import { getPreloadPath } from './path-resolver.js'
import ping from 'ping'
import puppeteer from 'puppeteer'

import escpos from 'escpos'
import escposUsb from 'escpos-usb'
import escposNetwork from 'escpos-network'

escpos.NEWUSB = escposUsb
escpos.Network = escposNetwork

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
  ipcHandle('print-via-escpos-usb', async () => {
    const device = new escpos.NEWUSB(4070, 33054)
    const printer = new escpos.Printer(device)

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
    const device = new escpos.Network('192.168.21.99', 9100)
    const printer = new escpos.Printer(device)

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
      //   printer.style('B')
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

  // print via escpos usb
  ipcHandle('print-via-escpos-usb-bitmap', async () => {
    const html = `
    <html>
<head>
  <style>
    body {
      width: 384px;
      font-family: monospace;
      font-size: 16px;
      padding: 10px;
      box-sizing: border-box;
      text-align: center; /* biar semua center */
    }
    img.logo {
      max-width: 150px;
      margin: 10px auto;
    }
    h4 {
      margin-bottom: 10px;
    }
    .barcode {
      margin: 10px auto;
      width: 100%;
      text-align: center;
    }
  </style>

  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
</head>
<body>
  <!-- Logo dari URL -->
  <img class="logo" src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="Logo Perusahaan" />

  <h4>My Toko</h4>
  <p>----------------------------</p>
  <p>Item: Nasi Goreng</p>
  <p>Qty : 1 x Rp15.000</p>
  <p>Total: <b>Rp15.000</b></p>
  <p>----------------------------</p>

  <div class="barcode">
    <svg id="barcode"></svg>
  </div>

  <p style="text-align:center;">Terima kasih!</p>

  <script>
    JsBarcode("#barcode", "123456789012", {
      format: "CODE128",
      width: 2,
      height: 40,
      displayValue: true,
      fontSize: 12,
      margin: 0
    });
  </script>
</body>
</html>

  `

    const filePath = path.join(
      app.getAppPath(),
      'assets',
      'receipt.png',
    ) as `${string}.png`

    const browser = await puppeteer.launch({ headless: 'shell' })
    const page = await browser.newPage()

    const height = await page.evaluate(() => {
      const el = document.documentElement
      return Math.max(el.scrollHeight, el.offsetHeight, el.clientHeight)
    })

    await page.setContent(html)
    await page.setViewport({ width: 384, height })
    await page.screenshot({ path: filePath })
    await browser.close()

    const device = new escpos.NEWUSB(4070, 33054)
    const printer = new escpos.Printer(device)

    escpos.Image.load(filePath, function (result) {
      if (result instanceof Error) {
        console.error('Gagal load gambar:', result)
        return
      }

      const image = result

      device.open(function () {
        printer.align('CT').raster(image).cut().close()
      })
    })
  })

  ipcHandle('check-connection', async () => {
    const ip = '192.168.21.99'
    const res = await ping.promise.probe(ip)
    console.log(res.alive)
  })
})
