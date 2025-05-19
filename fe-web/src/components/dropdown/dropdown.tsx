import { Fragment } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/16/solid';

export type DropdownOption = {
  label: string;
  value: string;
};

type IDropdown = {
  label?: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  selected?: string;
  buttonLabel?: string;
};

export default function Dropdown(props: IDropdown) {
  const { label, options, onSelect, selected, buttonLabel = 'Select Option' } = props;

  const selectedLabel = options.find((opt) => opt.value === selected)?.label;

  return (
    <Menu as='div' className='relative inline-block text-left'>
      {label && <p className='text-sm mb-1'>{label}</p>}
      <div>
        <MenuButton className='inline-flex justify-between w-48 px-4 py-2 text-sm font-medium rounded-md focus:outline-none bg-white'>
          {selectedLabel || buttonLabel}
          <ChevronDownIcon className='w-5 h-5 ml-2 -mr-1' aria-hidden='true' />
        </MenuButton>
      </div>

      <Transition
        as={Fragment}
        enter='transition ease-out duration-100'
        enterFrom='transform opacity-0 scale-95'
        enterTo='transform opacity-100 scale-100'
        leave='transition ease-in duration-75'
        leaveFrom='transform opacity-100 scale-100'
        leaveTo='transform opacity-0 scale-95'
      >
        <MenuItems className='absolute z-10 w-48 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black/5 focus:outline-none'>
          <div className='p-1'>
            {options.map((option) => (
              <MenuItem key={option.value}>
                {({ active }) => (
                  <button
                    onClick={() => onSelect(option.value)}
                    className={`${
                      active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    {option.label}
                  </button>
                )}
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
}
