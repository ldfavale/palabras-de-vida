import { SparklesIcon } from '@heroicons/react/24/outline';

const ComingSoon = ({ section = 'blog' }: { section?: 'blog' | 'actividades' }) => {
  const content = {
    blog: {
      icon: '📝',
      title: 'Estamos preparando',
      subtitle: 'Nuevo contenido para ti',
      description: 'Pronto compartiremos reflexiones, artículos inspiradores y recursos que fortalecerán tu relación con Dios. Mantente atento a las novedades.',
    },
    actividades: {
      icon: '🎯',
      title: 'Próximamente',
      subtitle: '¡Nuevas actividades!',
      description: 'Estamos organizando eventos, talleres y actividades especiales.Pronto anunciaremos todas las novedades.',
    }
  };

  const currentContent = content[section] || content.blog;

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-16 pt-28 bg-gray-50 overflow-hidden relative">
      {/* Fondo con gradiente sutil y formas abstractas */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-primary_light rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="text-center max-w-3xl relative z-10 bg-white bg-opacity-90 p-8 md:p-12 rounded-lg shadow-xl backdrop-filter backdrop-blur-sm">
        {/* Ícono con diseño mejorado y animación */}
        <div className="relative mb-10">
          <div className="w-40 h-40 mx-auto bg-primary rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-700 hover:scale-105 overflow-hidden">
            <SparklesIcon className="w-24 h-24 text-white" />
            {/* Efecto de brillo/pulso */}
            <div className="absolute inset-0 bg-white rounded-full opacity-30 animate-pulse-slow"></div>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-500 mb-3 tracking-tight leading-tight">
          {currentContent.title}
        </h1>

        {/* Subtítulo */}
        <h2 className="text-3xl md:text-4xl text-primary font-bold mb-8 leading-snug">
          {currentContent.subtitle}
        </h2>

        {/* Descripción */}
        <p className="text-xl text-gray-500 leading-relaxed mb-12 max-w-2xl mx-auto font-normal">
          {currentContent.description}
        </p>

        {/* Botón */}
        <a 
          href="/" 
          className="inline-block px-10 py-4 bg-primary text-white rounded-full hover:bg-primary_light transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl font-semibold text-lg tracking-wide"
        >
          Volver al inicio
        </a>
      </div>
      {/* Animaciones de fondo (keyframes para animate-blob y animation-delay-*) */}
      

    </div>
  );
};

export default ComingSoon;