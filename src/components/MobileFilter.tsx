import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { SidebarSectionConfig, ActiveFilters, getIconComponent } from '../pages/ShoppingPage';
import SearchInput from './SearchInput';
import { CheckIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface MobileFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterChange: (filterType: keyof ActiveFilters, value: string) => void;
  onSearch: (searchTerm: string) => void;
  activeFilters: ActiveFilters;
  searchTerm: string;
  sidebarSectionsConfig: SidebarSectionConfig[];
  loadingCategories: boolean;
}

const MobileFilter: React.FC<MobileFilterProps> = ({
  isOpen,
  onClose,
  onFilterChange,
  onSearch,
  activeFilters,
  searchTerm,
  sidebarSectionsConfig,
  loadingCategories,
}) => {
  return (
    <div
      className={clsx(
        'fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ease-in-out',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Contenido del Filtro */}
      <div
        className={clsx(
          'relative h-full w-4/5 max-w-sm bg-white shadow-xl p-4 flex flex-col transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Filtros</h2>
          <button onClick={onClose} className="p-2">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <SearchInput
            initialValue={searchTerm}
            onSearch={onSearch}
            placeholder="Buscar productos..."
          />
        </div>

        {loadingCategories && <div className="p-4 text-sm text-gray-500">Cargando categorías...</div>}

        {sidebarSectionsConfig.map((section) => (
          <div key={section.key} className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{section.title}</h3>
            <ul className='list-none p-0 m-0'>
              {section.items.map((item) => {
                const isItemActive = activeFilters[section.filterType] === item.value;
                const itemIcon = getIconComponent(item.iconName);
                return (
                  <li key={item.value} className="py-1">
                    <button
                      onClick={() => onFilterChange(section.filterType, item.value)}
                      className={clsx(
                        "flex items-center w-full text-left text-sm py-2 px-3 rounded-md",
                        isItemActive
                          ? "bg-primary/10 text-black font-semibold"
                          : "text-gray-600 hover:bg-gray-100 hover:text-black"
                      )}
                    >
                      {isItemActive && <CheckIcon className="mr-2 h-5 w-5 text-primary shrink-0" />}
                      <div className={clsx(!isItemActive ? "ml-7" : "", "flex items-center flex-grow min-w-0")}>
                        {itemIcon && <span className={clsx("mr-2 shrink-0", isItemActive ? "text-primary" : "")}>{itemIcon}</span>}
                        <span className="truncate">{item.label}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileFilter;