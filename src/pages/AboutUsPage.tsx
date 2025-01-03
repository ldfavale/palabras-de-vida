import React from 'react'
import grid1 from '../assets/images/grid1.png'
import grid2 from '../assets/images/grid2.png'
import grid3 from '../assets/images/grid3.png'
import grid4 from '../assets/images/grid4.png'
import aside from '../assets/images/side_about_us.png'


function AboutUsPage() {
  return (
    <div>

    <section id='about-us' className="flex flex-col flex-col justify-center  p-10  md:p-20  pt-48 md:pt-48 space-y-20">
          <h1 className=' font-gilroy  text-6xl   lg:text-7xl  text-primary_light font-bold '>
            Sobre Nosotros
            </h1>
      <div className=' flex flex-col lg:flex-row space-y-20  lg:space-y-0  space-x-0 lg:space-x-10 w-full items-center justify-around  '>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full lg:w-1/2 ">
                {/* Left Image (Large) */}
                <div>
                    <img
                    src={grid1} 
                    alt="Palabras de Vida Storefront"
                    className="w-full h-full bg-cover "
                    />
                </div>

                {/* Right Images */}
                <div className="grid grid-rows-2 gap-3">
                    {/* Top Image (Shelves) */}
                    <div>
                    <img
                        src={grid2} 
                        alt="Books on Shelves"
                        className="w-full h-full   bg-cover   "
                    />
                    </div>

                    {/* Bottom Row with Two Images */}
                    <div className="grid grid-cols-2 gap-3">
                    <img
                        src={grid3} 
                        alt="Books on Table"
                        className="w-full h-full    "
                    />
                    <img
                        src={grid4} 
                        alt="More Books on Table"
                        className="w-full h-full  "
                        />
                    </div>
                </div>
                </div>


          <div className=' flex flex-col items-center lg:w-1/2'>
            <p>En el año 2020 aproximadamente, comenzamos con la visión de abrir un espacio cultural cristiano, donde se puedan realizar reuniones, talleres, estudios bíblicos, con el fin de alcanzar a otros para Cristo y edificar a la Iglesia.</p>
            <p>Así es que en el año 2021 se abre la Librería Cristiana llamada “Palabras de Vida” en la ciudad de Maldonado, Uruguay. 
El nombre surge del versículo... "Y le respondió Simón Pedro: Señor, ¿a quién iremos? Tú tienes palabras de vida eterna." San Juan 6:68 </p>
            <p>Actualmente el Señor a llevado a que este lugar sea más que una librería, por esto ha pasado a llamarse “Casa Palabras de Vida”.</p>
            <p>En el año 2023, se comenzaron a realizar talleres de oratoria, y en el 2024 se comenzó con reuniones de té evangelísticas para mujeres, y también con un grupo de discipulado para personas que no conocen de la Palabra de Dios. </p>
            <p>Nuestra misión es edificar y servir a la iglesia y a nuestra comunidad con la propagación de la Palabra de Dios, de libros y materiales de bendición, con estudios bíblicos y espacios de bendición donde personas que no conocen a Cristo se encuentren con Él. Nuestro anhelo es que Maldonado y Uruguay por completo sea lleno del conocimiento de Dios, tenga luz y todos vengan a la salvación que es Jesús. Estamos para servirle en el amor de Cristo.</p>
          </div>
      </div>
    </section>
    <section id='mainBanner' className="flex flex-row justify-center items-center  pt-28">
      <div className=' flex flex-col md:flex-row  space-y-20 md:space-y-0 md:space-x-10 w-full p-5 md:p-10   '>
          <div className=' flex flex-col space-y-10'>
            <h2 className=' font-gilroy  text-3xl  md:text-3xl lg:text-3xl xl:text-4xl  text-[#a28c85] font-bold  '>
            ¿Qué significa “solo tú tienes palabras de vida eterna”?            </h2>
            <p>Tú tienes palabras de vida eterna. Esta declaración poderosa nos muestra que las palabras de Dios están llenas del Espíritu que da vida. El mismo Espíritu es quien actúa en nuestras mentes y corazones para acercarnos a Jesús, si se lo permitimos y pedimos de sincero corazón. El lo hace en muchas vidas, por todo el mundo, en este mismo intante, lo está haciendo, Él está obrando siempre. El Espíritu Santo, El Espíritu de Verdad nos guía hacia toda Verdad. Jesús es el Camino, la Verdad y la Vida. Al leer la Palabra, el Espíritu Santo es quien nos ayuda a comprenderla y nos revela al Hijo. Por eso solo podemos decir, al igual que Pedro en San Juan 6: 68: ¿A quién iremos Jesús? Si sólo Tu tienes palabras de vida eterna.</p>

          </div>
      <img src={aside} alt="mainIcon" className='w-[80%]  md:w-[40%] max-w-[300px]'/>
      </div>
    </section>
</div>
    
  )
}

export default AboutUsPage