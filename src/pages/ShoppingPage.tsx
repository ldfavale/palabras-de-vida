import ShopItem from "../components/ShopItem";
import Sidebar from "../components/ShopSidebar";
import toast from "react-hot-toast";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ProductListSkeleton } from "../components/ProductListSkeleton";
import useSearchProducts from "../hooks/useSearchProducts";
import clsx from "clsx";
import SearchInput from "../components/SearchInput";
import { CheckIcon, ListBulletIcon, Squares2X2Icon, AdjustmentsHorizontalIcon, XMarkIcon } from "@heroicons/react/24/outline";
import useGetCategories from "../hooks/useGetCategories";
import useDeleteProduct from "../hooks/useDeleteProduct";
import FilterPanel from "../components/FilterPanel";
import MobileFilter from "../components/MobileFilter";

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
  LAYOUT_STYLE_ITEM_GRID,
} from "../constants/filters"; 

interface SidebarItemData {
  label: string;
  value: string;
  iconName?: string; 
}

export interface SidebarSectionConfig {
  key: string;                 
  title: string;               
  items: SidebarItemData[];    
  filterType: keyof ActiveFilters; 
}

export interface ActiveFilters {
  [FILTER_TYPE_CATEGORY]: string;
  [FILTER_TYPE_SORT]: string;
  [FILTER_TYPE_LAYOUT]: string;
}

const ITEMS_PER_PAGE = 9;

export const getIconComponent = (iconName?: string): React.ReactNode => {
  if (iconName === ICON_SQUARES) return <Squares2X2Icon className="w-4 h-4" />;
  if (iconName === ICON_LIST_BULLET) return <ListBulletIcon className="w-4 h-4" />;
  return undefined;
};

function ShoppingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileFilterOpen, setMobileFilterOpen] = useState(false);
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

  const {
    products,
    loading,
    error,
    currentPage,
    totalCount,
    totalPages,
    setCurrentPage,
    refetch
  } = useSearchProducts({
    searchTerm,
    categoryIds: categoryFilterForHook,
    sortBy: activeFilters[FILTER_TYPE_SORT],
    pageSize: ITEMS_PER_PAGE,
  });
  const { categories, loading: loadingCategories, error: errorCategories } = useGetCategories();
  const { deleteProduct, isDeleting, error: errorDeleting} = useDeleteProduct();


  const handleSearch = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  }, []);

  const handlePageChange = (newPage: number) => {
    if (!loading && newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const productListElement = document.getElementById('product-list-container');
      if (productListElement) {
        productListElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

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
      // {
      //   key: FILTER_TYPE_SORT,
      //   title: SECTION_TITLE_SORT,
      //   items: SORT_ORDER_ITEMS,
      //   filterType: FILTER_TYPE_SORT,
      // },
      {
        key: FILTER_TYPE_LAYOUT,
        title: SECTION_TITLE_LAYOUT,
        items: LAYOUT_STYLE_ITEMS,
        filterType: FILTER_TYPE_LAYOUT,
      },
    ];
  }, [categories]); 

  const afterDeleteSuccess = (deletedProductId: string) => {
    console.log(`Producto ${deletedProductId} eliminado, actualizando UI...`);
    console.log(`CurrentPage ${currentPage}`);
    if (products.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
    refetch();
  };

  const handleDeleteRequest = async (productId: string, productTitle: string) => {
    const deleted = await deleteProduct(productId, productTitle);
    if (deleted) {
      toast.success(`Producto "${productTitle}" eliminado correctamente.`);
      afterDeleteSuccess(productId);
    }
  }

  return (
    <div className="flex justify-center w-full">
      <div className="sm:flex flex-1 sm:flex-row sm:justify-center w-full lg:max-w-6xl ">
        <Sidebar>
          <FilterPanel
            searchTerm={searchTerm}
            onSearch={handleSearch}
            loadingCategories={loadingCategories}
            sidebarSectionsConfig={sidebarSectionsConfig}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
          />
        </Sidebar>

        {/* Sección de Productos */}
        <main id="product-list-container" className=" flex-col p-4 md:pt-6 mt-28 flex-1">
          {/* Botón Flotante de Filtros para Móvil */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileFilterOpen(prev => !prev)}
              className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              aria-label={isMobileFilterOpen ? "Cerrar filtros" : "Abrir filtros"}
            >
              <div className={clsx("transition-transform duration-300 ease-in-out", isMobileFilterOpen && "rotate-90")}>
                {isMobileFilterOpen ? (
                  <XMarkIcon className="h-7 w-7" />
                ) : (
                  <AdjustmentsHorizontalIcon className="h-7 w-7" />
                )}
              </div>
            </button>
          </div>
          {loading && (<ProductListSkeleton count={ITEMS_PER_PAGE} />)} {/* Ajusta count si es necesario */}
          {!loading && error && (
            <div className="p-4 text-center text-red-500">Error al cargar productos. Intenta de nuevo.</div>
          )}
          {!loading && !error && products.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No se encontraron productos con esos criterios.
            </div>
          )}
          {!loading && !error && products.length > 0 && (
            <div className="flex flex-col "> {/* Envuelve la lista y la paginación */}
              <div className={clsx(
                "grid gap-4 md:gap-6  flex-1",
                activeFilters[FILTER_TYPE_LAYOUT] === LAYOUT_STYLE_ITEM_GRID
                  ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                  : "grid-cols-1"
              )}>
                {products.map((p) => (
                  <ShopItem 
                  key={p.id} 
                  product={p} 
                  layout={activeFilters[FILTER_TYPE_LAYOUT]}
                  onDeleteRequest={handleDeleteRequest} 
                  deleteDisabled={isDeleting}
                  />
                ))}
              </div>
                <div className="flex flex-1 "> </div>
              {/* ---------- CONTROLES DE PAGINACIÓN ---------- */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center space-x-1 sm:space-x-2 py-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="px-3 py-2 sm:px-4 border rounded-md bg-white text-xs sm:text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(pageNumber => {
                      if (totalPages <= 7) return true; 
                      return (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      );
                    })
                    .map((pageNumber, index, array) => (
                      <React.Fragment key={pageNumber}>
                        {/* Añadir "..." si hay saltos */}
                        {index > 0 && pageNumber - array[index-1] > 1 && (
                           <span className="px-3 py-2 sm:px-4 text-xs sm:text-sm text-gray-700">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(pageNumber)}
                          disabled={loading}
                          className={clsx(
                            "px-3 py-2 sm:px-4 border rounded-md text-xs sm:text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed",
                            currentPage === pageNumber
                              ? "bg-primary text-white border-primary"
                              : "bg-white text-gray-700"
                          )}
                        >
                          {pageNumber}
                        </button>
                      </React.Fragment>
                    ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className="px-3 py-2 sm:px-4 border rounded-md bg-white text-xs sm:text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              )}
              <div className="mt-4 text-center text-xs sm:text-sm text-gray-600">
                {totalCount > 0 && `Página ${currentPage} de ${totalPages} (Total: ${totalCount} productos)`}
              </div>
            </div>
          )}
        </main>
        <MobileFilter 
          isOpen={isMobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          activeFilters={activeFilters}
          searchTerm={searchTerm}
          sidebarSectionsConfig={sidebarSectionsConfig}
          loadingCategories={loadingCategories}
        />
      </div>
    </div>
  );
}

export default ShoppingPage;