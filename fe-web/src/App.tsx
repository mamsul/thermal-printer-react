import { ArrowPathIcon, PrinterIcon } from '@heroicons/react/16/solid';
import { useState } from 'react';
import { Cut, Line, Printer, render, Text } from 'react-thermal-printer';
import Dropdown from './components/dropdown/dropdown';
import { useSocket } from './hooks/use-socket';

interface IPrinter {
    idProduct: number;
    idVendor: number;
    productName: string;
  }

function App() {
  const [listPrinter, setListPrinter] = useState<IPrinter[]>([]);
  const [selected, setSelected] = useState<string | undefined>();

  const { emit } = useSocket({
    listeners: {
      'list-escpos-printer': (data: unknown) => {
        setListPrinter(data as IPrinter[]);
      },
    },
  });

  const createPrintData = async () => {
    const receipt = (
      <Printer type='epson'>
        <Text>text</Text>
        <Text>fragment is {'allowed'}</Text>
        <Text align='center'>center text</Text>
        <Text align='right'>right text</Text>
        <Text bold={true}>bold text</Text>
        <Text underline='1dot-thick'>underline text</Text>
        <Text invert={true}>invert text</Text>
        <Text size={{ width: 1, height: 1 }}>small size text</Text>
        <Text size={{ width: 2, height: 2 }}>big size text</Text>
        <Line />
        <Cut />
      </Printer>
    );

    const data: Uint8Array = await render(receipt);
    return data;
  };

  const handlePrint = async () => {
    if (!selected) return;
    const dataPrint = await createPrintData();

    emit('start-print-via-usb', {
      device: listPrinter.find((printer) => {
        return `${printer.idVendor}-${printer.idProduct}` === selected;
      }),
      dataPrint,
    });
  };

  const handlePrintNetwork = async () => {
    const dataPrint = await createPrintData();

    emit('print-via-network', dataPrint);
  };

  return (
    <div className='h-dvh w-dvw flex flex-col justify-center items-center bg-radial-[at_25%_25%] from-white to-zinc-900 to-75%'>
      <div className='flex flex-col gap-5 p-5 rounded-xl w-full max-w-lg backdrop-blur-lg bg-white/20'>
        <div className='flex gap-4 mb-5 items-center'>
          <Dropdown
            options={listPrinter.map((printer) => ({
              label: printer.productName,
              value: `${printer.idVendor}-${printer.idProduct}`,
            }))}
            selected={selected}
            onSelect={(val) => setSelected(val)}
            buttonLabel='Pilih Printer'
          />
          <button
            className='h-full aspect-square bg-orange-300 rounded-md cursor-pointer flex justify-center items-center'
            onClick={() => emit('list-escpos-printer')}
          >
            <ArrowPathIcon className='w-5 h-5 text-white' aria-hidden='true' />
          </button>
        </div>

        <button
          className='cursor-pointer p-1.5 ml-auto bg-white rounded-sm text-sm inline-flex'
          disabled={!selected}
          onClick={handlePrint}
        >
          <PrinterIcon className='w-5 text-gray-700' />
          Start Print
        </button>

        <button
          className='cursor-pointer p-1.5 ml-auto bg-white rounded-sm text-sm inline-flex'
          onClick={handlePrintNetwork}
        >
          <PrinterIcon className='w-5 text-gray-700' />
          Start Print Network
        </button>
      </div>
    </div>
  );
}

export default App;
