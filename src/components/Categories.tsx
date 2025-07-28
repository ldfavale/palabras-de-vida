

import { NavLink } from 'react-router-dom';
import useGetCategories from '../hooks/useGetCategories';
import { FILTER_TYPE_CATEGORY } from '../constants/filters';
import { useInView } from 'react-intersection-observer';
import clsx from 'clsx';
import CategoryCard from './CategoryCard';

function Categories() {
  // const { categories, loading, error } = useGetCategories();
  const categories = [
    { 
      id: '1', 
      title: 'Biblias', 
      bg_color: 'bg-primary_light',
      icon: <svg className="w-32 h-32 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M9 3v14m7 0v4"/>
              </svg> 
    },
    { 
      id: '2', 
      title: 'Libros', 
      bg_color: 'bg-secondary',
      icon: <svg className="w-32 h-32 text-white " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 6.03v13m0-13c-2.819-.831-4.715-1.076-8.029-1.023A.99.99 0 0 0 3 6v11c0 .563.466 1.014 1.03 1.007 3.122-.043 5.018.212 7.97 1.023m0-13c2.819-.831 4.715-1.076 8.029-1.023A.99.99 0 0 1 21 6v11c0 .563-.466 1.014-1.03 1.007-3.122-.043-5.018.212-7.97 1.023"/>
              </svg>
   },
    { 
      id: '3', 
      title: 'Regalos', 
      bg_color: 'bg-third',
      icon: <svg className="w-32 h-32 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M10 21v-9m3-4H7.5a2.5 2.5 0 1 1 0-5c1.5 0 2.875 1.25 3.875 2.5M14 21v-9m-9 0h14v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8ZM4 8h16a1 1 0 0 1 1 1v3H3V9a1 1 0 0 1 1-1Zm12.155-5c-3 0-5.5 5-5.5 5h5.5a2.5 2.5 0 0 0 0-5Z"/>
              </svg>
    }
  ];

  return (
          <>
    <section id='categories' className="flex flex-col justify-center items-center py-28">
      <h3 className='text-5xl mb-32  font-medium font-gayathri font-graphik text-gray-500'>Nuestros Productos</h3>
      {/* {loading && <div className="text-gray-500">Cargando categorías...</div>} */}
      {/* {error && <div className="text-red-500">Error al cargar categorías.</div>} */}
      {/* {!loading && !error && categories && ( */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full px-4 lg:px-0 justify-items-center'>
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>
      {/* )} */}
    </section>
    
    </>
  );
}

export default Categories
