import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import SearchInput from './SearchInput';
import { ActiveFilters, SidebarSectionConfig, getIconComponent } from '../pages/ShoppingPage';

// Definimos las props que nuestro componente de presentación necesita.
interface FilterPanelProps {
  searchTerm: string;
  onSearch: (searchTerm: string) => void;
  loadingCategories: boolean;
  sidebarSectionsConfig: SidebarSectionConfig[];
  activeFilters: ActiveFilters;
  onFilterChange: (filterType: keyof ActiveFilters, value: string) => void;
}

/**
 * Componente de presentación (Dumb Component) que renderiza el panel de filtros.
 * Es reutilizable tanto para la vista de escritorio como para la móvil.
 */
const FilterPanel: React.FC<FilterPanelProps> = ({
  searchTerm,
  onSearch,
  loadingCategories,
  sidebarSectionsConfig,
  activeFilters,
  onFilterChange,
}) => {
  return (
    // Usamos un Fragment para no añadir un nodo extra al DOM.
    <>
      <div className="p-4">
        <SearchInput
          initialValue={searchTerm}
          onSearch={onSearch}
          placeholder="Buscar productos..."
        />
      </div>

      {loadingCategories && <div className="p-4 text-sm text-gray-500">Cargando categorías...</div>}

      {sidebarSectionsConfig.map((section) => (
        <div key={section.key} className="mb-6 mt-2 px-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">{section.title}</h2>
          <ul className='list-none p-0 m-0'>
            {section.items.map((item) => {
              const isItemActive = activeFilters[section.filterType] === item.value;
              const itemIcon = getIconComponent(item.iconName);
              return (
                <li key={item.value} className="py-1">
                  <button
                    onClick={() => onFilterChange(section.filterType, item.value)}
                    className={clsx(
                      "flex items-center w-full text-left text-sm py-1 px-2 rounded-md",
                      isItemActive
                        ? "bg-primary/10 text-black font-semibold"
                        : "text-gray-600 hover:bg-gray-100 hover:text-black"
                    )}
                  >
                    {isItemActive && <CheckIcon className="mr-2 h-5 w-5 text-primary shrink-0" />}
                    <div className={clsx(
                        !isItemActive ? "ml-7" : "", 
                        "flex items-center flex-grow min-w-0" 
                      )}
                    >
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
    </>
  );
};

export default FilterPanel;
