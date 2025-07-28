import { NavLink } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import clsx from 'clsx';
import { FILTER_TYPE_CATEGORY } from '../constants/filters';
import type { Category } from '../hooks/useGetCategories';

interface CategoryCardProps {
  category: Category;
  index: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, index }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    delay: index * 100, // Retraso escalonado
  });

  return (
    <NavLink
      to={`/tienda?${FILTER_TYPE_CATEGORY}=${category.id}`}
      ref={ref}
      className={clsx(
        "relative flex flex-col items-center justify-center p-6 rounded-full shadow-lg transition-all duration-700 ease-out transform",
        "hover:scale-105 hover:shadow-xl",
        "h-64 w-64 lg:h-64 lg:w-64 xl:h-72 xl:w-72 2xl:h-80 2xl:w-80",
        category.bg_color, // Fondo blanco para un look minimalista
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Icono o imagen de la categoría (puedes añadir aquí si tienes URLs de iconos) */}
      <h3 className='text-2xl mt-4 text-white font-bold  text-center flex  font-graphik uppercase' >{category.title}</h3>

      {category.icon && category.icon }
      <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">{category.name}</h3>
    </NavLink>
    
  );
};

export default CategoryCard;
