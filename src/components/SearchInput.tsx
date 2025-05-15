// SearchInput.tsx
import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  initialValue?: string;
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  debounceTimeout?: number;
  inputClassName?: string; 
  containerClassName?: string; 
}

const SearchInput: React.FC<SearchInputProps> = ({
  initialValue = "",
  onSearch,
  placeholder = "Buscar...",
  debounceTimeout = 500, 
  inputClassName = '',
  containerClassName = '',
  ...rest
}) => {
  const [searchTerm, setSearchTerm] = useState<string>(initialValue);


  useEffect(() => {
    const timerId = setTimeout(() => {
      onSearch(searchTerm);
    }, debounceTimeout);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm, debounceTimeout, onSearch]); 

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className={`relative ${containerClassName}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
      </div>
      <input
        type="search"
        value={searchTerm}
        onChange={handleChange}
        placeholder={placeholder}
        className={`block w-full rounded-full border border-gray-400 bg-white py-2 pl-10 pr-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm ${inputClassName}`}
        {...rest}
      />
    </div>
  );
};

export default SearchInput;