import React from 'react';
import { BookOpenIcon ,HomeModernIcon, MagnifyingGlassIcon, HeartIcon, StarIcon } from '@heroicons/react/24/outline';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Ilustración con libros */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="text-9xl font-bold text-primary">404</div>
          </div>
          <div className="relative z-10 flex justify-center items-center space-x-4 mb-6">
            <div className="transform rotate-12 opacity-80">
              <BookOpenIcon className="w-16 h-16 text-brown-700" />
            </div>
            <div className="transform -rotate-6 opacity-90">
              <BookOpenIcon className="w-20 h-20 text-green-700/50" />
            </div>
            <div className="transform rotate-6 opacity-80">
              <BookOpenIcon className="w-16 h-16 text-primary_light" />
            </div>
          </div>
          
          {/* Estrellas decorativas */}
          <div className="absolute top-0 left-1/4 animate-pulse">
            <StarIcon className="w-6 h-6 text-primary fill-current" />
          </div>
          <div className="absolute top-8 right-1/4 animate-pulse delay-300">
            <StarIcon className="w-4 h-4 text-primary fill-current" />
          </div>
          <div className="absolute bottom-8 left-1/3 animate-pulse delay-500">
            <StarIcon className="w-5 h-5 text-primary fill-current" />
          </div>
        </div>

        {/* Título principal */}
        <h1 className="text-6xl font-bold text-brown-300 mb-4">
          4<span className="text-primary">0</span>4
        </h1>
        
        {/* Subtítulo */}
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Página No Encontrada
        </h2>

        {/* Mensaje inspirador */}
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 mb-8 shadow-lg border border-white/20">
          <div className="flex items-center justify-center mb-4">
            <HeartIcon className="w-6 h-6 text-red-500 mr-2" />
            <span className="text-lg font-medium text-gray-700">
              "Lámpara es a mis pies tu palabra, y lumbrera a mi camino"
            </span>
          </div>
          <p className="text-gray-600 text-sm italic">- Salmos 119:105</p>
        </div>

        {/* Mensaje descriptivo */}
        <p className="text-gray-600 mb-8 text-lg leading-relaxed max-w-md mx-auto">
          La página que buscas no se encuentra en nuestro catálogo. 
          Pero no te preocupes, tenemos muchos tesoros esperando por ti.
        </p>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="group flex items-center px-6 py-3 bg-primary_light text-white rounded-lg font-medium hover:bg-primary transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <HomeModernIcon className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
            Volver al Inicio
          </button>
          
          <button className="group flex items-center px-6 py-3 bg-brown-300 text-white rounded-lg font-medium hover:bg-brown-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <MagnifyingGlassIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Buscar Libros
          </button>
        </div>

        {/* Sugerencias */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 hover:bg-white/70 transition-colors">
            <div className="text-primary font-semibold mb-2">📖 Biblias</div>
            <p className="text-gray-600">Encuentra tu versión favorita</p>
          </div>
          
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 hover:bg-white/70 transition-colors">
            <div className="text-brown-300 font-semibold mb-2">🙏 Devocionales</div>
            <p className="text-gray-600">Fortalece tu fe diaria</p>
          </div>
          
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 hover:bg-white/70 transition-colors">
            <div className="text-green-500/90 font-semibold mb-2">✨ Inspiración</div>
            <p className="text-gray-600">Libros que transforman</p>
          </div>
        </div>

        {/* Footer mensaje */}
        <div className="mt-8 text-sm text-gray-500">
          <p>¿Necesitas ayuda? Contáctanos y te ayudaremos a encontrar lo que buscas</p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;