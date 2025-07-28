import React from 'react';
import FilterPanel from './FilterPanel';
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

        <FilterPanel
          searchTerm={searchTerm}
          onSearch={onSearch}
          loadingCategories={loadingCategories}
          sidebarSectionsConfig={sidebarSectionsConfig}
          activeFilters={activeFilters}
          onFilterChange={onFilterChange}
        />
      </div>
    </div>
  );
};

export default MobileFilter;