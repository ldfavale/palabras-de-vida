import ShopItem from "../components/ShopItem";
import Sidebar from "../components/ShopSidebar";
import toast from "react-hot-toast";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProductListSkeleton } from "../components/ProductListSkeleton";
import useSearchProducts from "../hooks/useSearchProducts";
import clsx from "clsx";
import SearchInput from "../components/SearchInput";
import { CheckIcon, ListBulletIcon, Squares2X2Icon } from "@heroicons/react/24/outline";
import useGetCategories from "../hooks/useGetCategories";

interface SidebarItem {
    label: string;
    value: string;
    isActive?: boolean;
    icon?: React.ReactNode;
}

interface SidebarSection {
    title: string;
    items: SidebarItem[];
}

import {
  DEFAULT_CATEGORY,
  DEFAULT_SORT_ORDER,
  DEFAULT_LAYOUT_STYLE,
  FILTER_TYPE_CATEGORY,
  FILTER_TYPE_SORT,
  FILTER_TYPE_LAYOUT,
  SECTION_TITLE_CATEGORIES,
  SECTION_TITLE_SORT,
  SECTION_TITLE_LAYOUT,
  SORT_ORDER_ITEMS,
  LAYOUT_STYLE_ITEMS,
  ICON_SQUARES,
  ICON_LIST_BULLET,
} from "../constants/filters"; // Ajusta la ruta

interface SidebarItemData {
  label: string;
  value: string;
  iconName?: string; 
}

interface SidebarSectionConfig {
  key: string;                 
  title: string;               
  items: SidebarItemData[];    
  filterType: keyof ActiveFilters; 
}

interface ActiveFilters {
  [FILTER_TYPE_CATEGORY]: string;
  [FILTER_TYPE_SORT]: string;
  [FILTER_TYPE_LAYOUT]: string;
}

function ShoppingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  // 1. Estado de filtros centralizado
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    [FILTER_TYPE_CATEGORY]: DEFAULT_CATEGORY,
    [FILTER_TYPE_SORT]: DEFAULT_SORT_ORDER,
    [FILTER_TYPE_LAYOUT]: DEFAULT_LAYOUT_STYLE,
  });

  const categoryFilterForHook = useMemo(() => {
    const activeCat = activeFilters[FILTER_TYPE_CATEGORY];
    return activeCat !== DEFAULT_CATEGORY ? [activeCat] : [];
  }, [activeFilters[FILTER_TYPE_CATEGORY]]);

  const { products, loading, error } = useSearchProducts({
    searchTerm,
    categoryIds: categoryFilterForHook,
    // sortBy: activeFilters[FILTER_TYPE_SORT], // Asumiendo que tu hook puede usar esto
  });
  const { categories, loading: loadingCategories, error: errorCategories } = useGetCategories();

  const handleSearch = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  }, []);

  // 2. Manejador de cambios genérico para filtros
  const handleFilterChange = useCallback((filterType: keyof ActiveFilters, value: string) => {
    setActiveFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value,
    }));
    console.log(`Filtro '${filterType}' cambiado a:`, value);
  }, []);

  useEffect(() => {
    if (error?.message || errorCategories?.message) {
      toast.error(`Error: ${error?.message || errorCategories?.message}`);
    }
  }, [error, errorCategories]);

  // 3. Construcción de la configuración del Sidebar con useMemo
  const sidebarSectionsConfig = useMemo((): SidebarSectionConfig[] => {
    const categoryItems: SidebarItemData[] = [
      { label: 'Todos', value: DEFAULT_CATEGORY }, 
      ...(categories?.map(cat => ({ label: cat.name, value: cat.id })) || [])
    ];

    return [
      {
        key: FILTER_TYPE_CATEGORY, 
        title: SECTION_TITLE_CATEGORIES,
        items: categoryItems,
        filterType: FILTER_TYPE_CATEGORY,
      },
      {
        key: FILTER_TYPE_SORT,
        title: SECTION_TITLE_SORT,
        items: SORT_ORDER_ITEMS,
        filterType: FILTER_TYPE_SORT,
      },
      {
        key: FILTER_TYPE_LAYOUT,
        title: SECTION_TITLE_LAYOUT,
        items: LAYOUT_STYLE_ITEMS,
        filterType: FILTER_TYPE_LAYOUT,
      },
    ];
  }, [categories]); 

  const getIconComponent = (iconName?: string): React.ReactNode => {
    if (iconName === ICON_SQUARES) return <Squares2X2Icon className="w-4 h-4" />;
    if (iconName === ICON_LIST_BULLET) return <ListBulletIcon className="w-4 h-4" />;
    return undefined;
  };

  return (
    <div className="flex justify-center w-full">
      <div className="sm:flex flex-1 sm:flex-row sm:justify-center w-full lg:max-w-6xl">
        <Sidebar>
          <div className="p-4">
            <SearchInput
              initialValue={searchTerm}
              onSearch={handleSearch}
              placeholder="Buscar productos..."
            />
          </div>
          {loadingCategories && <div className="p-4 text-sm text-gray-500">Cargando categorías...</div>}

          {sidebarSectionsConfig.map((section) => (
            <div key={section.key} className="mb-6 mt-2 px-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">{section.title}</h2>
              <ul className='list-none'>
                {section.items.map((item) => {
                  const isItemActive = activeFilters[section.filterType] === item.value;
                  const itemIcon = getIconComponent(item.iconName);
                  return (
                    <li key={item.value} className="py-1">
                      <button
                        onClick={() => handleFilterChange(section.filterType, item.value)}
                        className={clsx(
                          "flex items-center w-full text-left text-sm py-1 px-2 rounded-md",
                          isItemActive
                            ? "bg-primary/20 text-black font-semibold"
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
                          <span className="truncate">{item.label}</span> {/* Para evitar overflow de texto largo */}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </Sidebar>

        {/* Sección de Productos */}
        <main className="flex-1 p-4 md:pt-6">
          {loading && (<ProductListSkeleton count={12} />)}
          {!loading && error && (
            <div className="p-4 text-center text-red-500">Error al cargar productos. Intenta de nuevo.</div>
          )}
          {!loading && !error && products.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No se encontraron productos con esos criterios.
            </div>
          )}
          {!loading && !error && products.length > 0 && (
            <div className={clsx(
              "grid gap-4 md:gap-6",
              activeFilters[FILTER_TYPE_LAYOUT] === 'grilla'
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                : "grid-cols-1"
            )}>
              {products.map((p) => (
                <ShopItem key={p.id} product={p} 
                // layout={activeFilters[FILTER_TYPE_LAYOUT]} 
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ShoppingPage;