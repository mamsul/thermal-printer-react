declare module 'escpos-usb' {
  class USB {
    constructor(vid?: number, pid?: number);
    static findPrinter(): USB[] | false;
    static getDevice(vid?: number, pid?: number): Promise<USB>;
    open(callback?: (error: any, device?: USB) => void): USB;
    close(callback?: (error?: any) => void): USB;
    write(data: Buffer, callback: (error?: any) => void): USB;
  }

  export = USB;
}
