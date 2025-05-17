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


function ShoppingPage() {
  const [searchTerm, setSearchTerm] = useState(''); // Inicialmente vacío o con un valor por defecto
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categoryFilterForHook = useMemo(() => {
    return activeCategory && activeCategory !== 'all' ? [activeCategory] : [];
  }, [activeCategory]); 
  const { products, loading, error } = useSearchProducts({
    searchTerm,
    categoryIds: categoryFilterForHook
  });  
  const { categories, loading:loadingCategories, error:errorCategories } = useGetCategories();  

  const handleSearch = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  }, []);

  const handleCategoryClick = useCallback((categoryValue: string) => {
    setActiveCategory(categoryValue);
  }, []);

  useEffect(() => {
    if (error?.message) {
        toast.error(`Error: ${error.message}`);
    }
  }, [error]);


  const sidebarData: SidebarSection[] = [
    {
        title: 'Categorias',
        items: [
            { label: 'Todo', value: 'all' },
            { label: 'Libros para niños', value: 'libros-ninos' },
            { label: 'Estudio Bíblico', value: 'estudio-biblico' },
            { label: 'Biblias', value: 'biblias', isActive: true },
            { label: 'Biblias de estudio', value: 'biblias-estudio' },
            { label: 'Libros', value: 'libros' },
            { label: 'Himnarios', value: 'himnarios' },
            { label: 'Devocionales', value: 'devocionales' },
            { label: 'Regalería', value: 'regaleria' },
            { label: 'Juegos', value: 'juegos' },
            { label: 'Biografías', value: 'biografias' },
            { label: 'Librillos', value: 'librillos' },
        ],
    },
    {
        title: 'Ordenar por',
        items: [
            { label: 'Categorias', value: 'categories' },
            { label: 'Precio más bajo', value: 'lowest-price' },
            { label: 'Precio más alto', value: 'highest-price' },
            { label: 'A - Z', value: 'a-z' },
            { label: 'Z - A', value: 'z-a' },
        ],
    },
    {
        title: 'Visualizacion',
        items: [
            { label: 'Grilla', value: 'grilla', icon: <Squares2X2Icon className="w-4 h-4" /> },
            { label: 'Lista', value: 'lista', icon: <ListBulletIcon className="w-4 h-4" /> },
        ],
    },
];



  return (
    <div className="flex justify-center w-full  ">
      <div className="sm:flex flex-1 sm:flex-row  sm:justify-center w-full lg:max-w-6xl ">      
        <Sidebar>
            <SearchInput
              initialValue={searchTerm} 
              onSearch={handleSearch}
              placeholder="Buscar..."
            />
            <div  className="mb-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Categorías</h2> 
            {categories.map((item) => {
                let currentItemIsActive = false;
                currentItemIsActive = item.id === activeCategory;
       
                return ( <li key={item.id} className="py-2 w-full list-none">
                    <button
                        onClick={() => {
                            handleCategoryClick(item.id);
                        }}
                        className={clsx(
                          "flex items-center w-full text-left text-sm",
                          currentItemIsActive
                            ? "text-black font-semibold" 
                            : "text-gray-600 hover:text-black" 
                        )}
                    
                    >
                        {currentItemIsActive && <CheckIcon className="mr-2 w-6 h-6 text-primary" />}
                        <div className={
                            clsx(!currentItemIsActive
                                ? "ml-8 w-full flex items-center"
                                : "w-full flex items-center" 
                            )}
                        >
                          {item.name}
                        </div>
                    </button>
                </li>)
                        })}
            </div>
            <></>
            {sidebarData.map((section, index) => (
              <div key={index} className="mb-6 mt-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">{section.title}</h2> 
                    <ul className=''>
                       {section.items.map((item) => {
                        // Lógica para determinar si el ítem está activo
                        let currentItemIsActive = false;
                        if (section.title === 'Categorias') { 
                          currentItemIsActive = item.value === activeCategory;
                        } else {
                          currentItemIsActive = !!item.isActive; // Convierte a booleano
                        }

              
                           return ( <li key={item.value} className="py-2 w-full">
                                <button
                                    onClick={() => {}}
                                    className={clsx(
                                      "flex items-center w-full text-left text-sm",
                                      currentItemIsActive
                                        ? "text-black font-semibold" 
                                        : "text-gray-600 hover:text-black" 
                                    )}
                                
                                >
                                    {item.isActive && <CheckIcon className="mr-2 w-6 h-6 text-primary" />}
                                    <div className={
                                        clsx(!item.isActive 
                                            ? "ml-8 w-full flex items-center"
                                            : "w-full flex items-center" 
                                        )}
                                    >
                                        {item.icon && section.title !== 'Categories' && <span className="mr-2">{item.icon}</span>} {/* Mostrar icono si no es de categoría y está definido */}
                                        {item.icon && section.title === 'Categories' && currentItemIsActive && <span className="mr-2">{item.icon}</span>} {/* Para cuando una categoría también tenga icono y esté activa */}
                                        {item.label}
                                    </div>
                                </button>
                            </li>)
                        })}
                    </ul>
                </div>
            ))}
        </Sidebar>
        {loading && ( <ProductListSkeleton count={12} />) }

        {!loading && !error && products.length === 0 && (
             <div className=" flex-1 p-4 text-center text-gray-500 pt-32">No se encontraron productos con esos criterios.</div>
        )}

        {!loading && !error && products.length > 0 && 
          <div className="container w-full  lg:px-4 py-8 pt-32 ">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-6">  
              {
                products.map((p) => (
                  <ShopItem key={p.id} product={p} />
                ))
              }
            </div>
          </div>
        }        
      </div>
    </div>
    );
  }

export default ShoppingPage;
