import { USB } from 'escpos'

declare module 'escpos' {
  export class NEWUSB extends USB {
    constructor(vid?: number, pid?: number)

    static getDevice(vid?: number, pid?: number): Promise<USB>
  }
}
