// src/types/escpos-network.d.ts
declare module 'escpos-network' {
  import { EventEmitter } from 'events'

  class Network extends EventEmitter {
    address: string
    port: number
    device: any

    constructor(address: string, port?: number)

    open(callback?: (err: Error | null, device?: any) => void): this

    write(data: Buffer, callback?: () => void): this

    read(callback: (buf: Buffer) => void): this

    close(callback?: (err: Error | null, device?: any) => void): this
  }

  export = Network
}
