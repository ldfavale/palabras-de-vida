import React from 'react'
import grid1 from '../assets/images/grid1.png'
import grid2 from '../assets/images/grid2.png'
import grid3 from '../assets/images/grid3.png'
import grid4 from '../assets/images/grid4.png'
import aside from '../assets/images/side_about_us.png'

function AboutUsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section id='about-us' className="px-4 sm:px-6 md:px-10 lg:px-20 pt-24 sm:pt-32 md:pt-40 lg:pt-48 pb-10 md:pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <h1 className='font-gilroy text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-primary_light font-bold mb-12 md:mb-20'>
            Sobre Nosotros
          </h1>

          {/* Main Content Grid */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start'>
            
            {/* Images Grid */}
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-3 aspect-square">
                {/* Large Image - Left Side */}
                <div className="row-span-2">
                  <img
                    src={grid1} 
                    alt="Palabras de Vida Storefront"
                    className="w-full h-full object-cover rounded-lg shadow-md"
                  />
                </div>

                {/* Top Right Image */}
                <div>
                  <img
                    src={grid2} 
                    alt="Books on Shelves"
                    className="w-full h-full object-cover rounded-lg shadow-md"
                  />
                </div>

                {/* Bottom Right - Two Small Images */}
                <div className="grid grid-cols-2 gap-3">
                  <img
                    src={grid3} 
                    alt="Books on Table"
                    className="w-full h-full object-cover rounded-lg shadow-md"
                  />
                  <img
                    src={grid4} 
                    alt="More Books on Table"
                    className="w-full h-full object-cover rounded-lg shadow-md"
                  />
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className='order-1 lg:order-2  h-full space-y-6'>
              <div className="h-full space-y-4 text-gray-700 leading-relaxed flex flex-col items-center justify-center ">
                <p className="text-base md:text-lg">
                  En el año 2020 aproximadamente, comenzamos con la visión de abrir un espacio cultural cristiano, donde se puedan realizar reuniones, talleres, estudios bíblicos, con el fin de alcanzar a otros para Cristo y edificar a la Iglesia.
                </p>
                
                <p className="text-base md:text-lg">
                  Así es que en el año 2021 se abre la Librería Cristiana llamada "Palabras de Vida" en la ciudad de Maldonado, Uruguay. El nombre surge del versículo... "Y le respondió Simón Pedro: Señor, ¿a quién iremos? Tú tienes palabras de vida eterna." <span className="font-semibold">San Juan 6:68</span>
                </p>
                
                <p className="text-base md:text-lg">
                  Actualmente el Señor a llevado a que este lugar sea más que una librería, por esto ha pasado a llamarse "Casa Palabras de Vida".
                </p>
                
                <p className="text-base md:text-lg">
                  En el año 2023, se comenzaron a realizar talleres de oratoria, y en el 2024 se comenzó con reuniones de té evangelísticas para mujeres, y también con un grupo de discipulado para personas que no conocen de la Palabra de Dios.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section - Centered */}
      <section className="py-12 md:py-16 flex items-center justify-center ">
        <div className="max-w-7xl  px-4 sm:px-6 md:px-10">
          <div className="bg-gray-50 p-8 md:p-10 rounded-xl border-l-4 border-primary_light shadow-sm">
            <h3 className="text-xl md:text-2xl font-bold text-primary_light mb-4">Nuestra Misión</h3>
            <p className="text-base md:text-lg font-medium text-gray-800 leading-relaxed">
              Nuestra misión es edificar y servir a la iglesia y a nuestra comunidad con la propagación de la Palabra de Dios, de libros y materiales de bendición, con estudios bíblicos y espacios de bendición donde personas que no conocen a Cristo se encuentren con Él. Nuestro anhelo es que Maldonado y Uruguay por completo sea lleno del conocimiento de Dios, tenga luz y todos vengan a la salvación que es Jesús. Estamos para servirle en el amor de Cristo.
            </p>
          </div>
        </div>
      </section>

      {/* Second Section */}
      <section id='mainBanner' className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-20">
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center'>
            
            {/* Text Content */}
            <div className='space-y-6 md:space-y-8'>
              <h2 className='font-gilroy text-2xl sm:text-3xl lg:text-4xl text-[#a28c85] font-bold leading-tight'>
                ¿Qué significa "solo tú tienes palabras de vida eterna"?
              </h2>
              
              <div className="space-y-4">
                <p className="text-base md:text-lg leading-relaxed text-gray-700">
                  <span className="font-semibold text-[#a28c85]">Tú tienes palabras de vida eterna.</span> Esta declaración poderosa nos muestra que las palabras de Dios están llenas del Espíritu que da vida. El mismo Espíritu es quien actúa en nuestras mentes y corazones para acercarnos a Jesús, si se lo permitimos y pedimos de sincero corazón.
                </p>
                
                <p className="text-base md:text-lg leading-relaxed text-gray-700">
                  El lo hace en muchas vidas, por todo el mundo, en este mismo instante, lo está haciendo, Él está obrando siempre. El Espíritu Santo, El Espíritu de Verdad nos guía hacia toda Verdad. Jesús es el Camino, la Verdad y la Vida.
                </p>
                
                <p className="text-base md:text-lg leading-relaxed text-gray-700">
                  Al leer la Palabra, el Espíritu Santo es quien nos ayuda a comprenderla y nos revela al Hijo. Por eso solo podemos decir, al igual que Pedro en <span className="font-semibold">San Juan 6:68</span>: ¿A quién iremos Jesús? Si sólo Tu tienes palabras de vida eterna.
                </p>
              </div>
            </div>

            {/* Image */}
            <div className='flex justify-center md:justify-end'>
              <img 
                src={aside} 
                alt="Illustration" 
                className='w-full max-w-xs md:max-w-sm lg:max-w-md object-contain'
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutUsPage