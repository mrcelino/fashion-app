'use client';

import { useEffect, useRef, useState } from 'react';

type DropdownOption =
  | string
  | {
      label: string;
      value: string;
    };

type CustomDropdownProps = {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  className?: string;
};

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  placeholder = 'Pilih...',
  options,
  selectedValue,
  onSelect,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Convert string options to { label, value }
  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  const selectedLabel = normalizedOptions.find((opt) => opt.value === selectedValue)?.label;

  return (
    <div className={`flex flex-col gap-2 relative ${className}`} ref={dropdownRef}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 rounded-lg p-3 text-sm text-left flex justify-between items-center"
      >
        <span className={selectedValue ? 'text-gray-900' : 'text-gray-400'}>
          {selectedLabel || placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {normalizedOptions.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onSelect(opt.value);
                setIsOpen(false);
              }}
              className={`p-3 text-sm cursor-pointer ${
                selectedValue === opt.value
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-800 hover:bg-gray-100'
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
