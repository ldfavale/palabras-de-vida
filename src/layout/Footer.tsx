import React from 'react'; // Necesario importar React
import logo from '../assets/images/icon.png'; // Asumiendo que tu configuración de TS/Vite maneja imágenes

// Definimos una interfaz para las props, aunque en este caso no reciba props personalizadas.
// Es útil si en el futuro necesita alguna.
interface FooterProps {
  // No hay props personalizadas aquí por ahora.
  // Si recibiera, por ejemplo, un 'year', sería: year: number;
}

// Usamos React.forwardRef para poder aceptar el 'ref' que le pasa el componente Layout.
// React.forwardRef<TipoElementoRef, TipoProps>
// HTMLElement es un tipo genérico adecuado para el elemento <footer>.
const Footer = React.forwardRef<HTMLElement, FooterProps>((props, ref) => {
  // 'props' contendría cualquier prop definida en FooterProps si las hubiera.
  // 'ref' es la referencia que pasamos desde el componente padre (Layout).

  return (
    // Asignamos el 'ref' recibido al elemento raíz del componente (footer).
    // Corregido: Eliminado background color duplicado.
    <footer ref={ref} id='footer' className="bg-[#2a323f] text-white flex flex-col md:flex-row">

      {/* Sección Izquierda: Logo y Misión */}
      {/* Mejorado: Añadido lg:space-x-4 para espaciado horizontal en pantallas grandes */}
      <div className='flex flex-col lg:flex-row p-10 space-y-6 lg:space-y-0 lg:space-x-4 justify-center items-center w-full md:w-1/2'>
          <img src={logo} className='h-36 w-36 object-contain' alt="Logo Librería Palabras de Vida" /> {/* Añadido object-contain y alt más descriptivo */}
          {/* Mejorado: Añadido lg:ml-4 para asegurar espacio tras imagen en lg, ajustado texto */}
          <p className='font-gayathri text-[#C4C4C4] lg:ml-4 text-center lg:text-left'>
            Nuestra misión es edificar y servir a la iglesia y a nuestra comunidad con la propagación de la Palabra de Dios para que todos vengan al conocimiento de Cristo. <br className="hidden lg:inline"/> (1 Timoteo 2:4-6) {/* Mejor formato en texto */}
          </p>
      </div>

      {/* Sección Central: Síguenos */}
      {/* Mejorado: Simplificado contenedor de íconos sociales */}
      <div className='flex flex-col p-10 justify-center w-full md:w-1/3'>
          <h3 className='text-3xl mb-6 font-graphik'>Síguenos</h3>
          <p className='font-gayathri text-[#C4C4C4] mb-6'>
            Síguenos en nuestras redes sociales o comunícate a través de nuestro WhatsApp.
          </p>
          {/* Mejorado: Usando space-x para espaciado uniforme, añadido hover y accesibilidad */}
          <div className='flex flex-row space-x-6 items-center text-[#C4C4C4]'>
            {/* Facebook */}
            <a
              href="https://www.facebook.com/p/Librer%C3%ADa-Palabras-de-Vida-100075757248730/?_rdr"
              target="_blank"
              rel="noopener noreferrer" // Buena práctica para seguridad y SEO en enlaces externos
              aria-label="Facebook de Librería Palabras de Vida" // Mejora accesibilidad
              className="hover:text-white transition-colors duration-200"
            >
              <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M13.135 6H15V3h-1.865a4.147 4.147 0 0 0-4.142 4.142V9H7v3h2v9.938h3V12h2.021l.592-3H12V6.591A.6.6 0 0 1 12.592 6h.543Z" clipRule="evenodd"/>
              </svg>
            </a>
            {/* Instagram */}
            <a
              href="https://instagram.com/libreriapalabrasdevida"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Librería Palabras de Vida"
              className="hover:text-white transition-colors duration-200"
            >
              <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path fill="currentColor" fillRule="evenodd" d="M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8Zm5-3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm7.597 2.214a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-5 3a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" clipRule="evenodd"/>
              </svg>
            </a>
            {/* WhatsApp */}
            <a
              href="https://wa.me/59899254043"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp de Librería Palabras de Vida"
              className="hover:text-white transition-colors duration-200"
            >
              <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path fill="currentColor" fillRule="evenodd" d="M12 4a8 8 0 0 0-6.895 12.06l.569.718-.697 2.359 2.32-.648.379.243A8 8 0 1 0 12 4ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10a9.96 9.96 0 0 1-5.016-1.347l-4.948 1.382 1.426-4.829-.006-.007-.033-.055A9.958 9.958 0 0 1 2 12Z" clipRule="evenodd"/>
                <path fill="currentColor" d="M16.735 13.492c-.038-.018-1.497-.736-1.756-.83a1.008 1.008 0 0 0-.34-.075c-.196 0-.362.098-.49.291-.146.217-.587.732-.723.886-.018.02-.042.045-.057.045-.013 0-.239-.093-.307-.123-1.564-.68-2.751-2.313-2.914-2.589-.023-.04-.024-.057-.024-.057.005-.021.058-.074.085-.101.08-.079.166-.182.249-.283l.117-.14c.121-.14.175-.25.237-.375l.033-.066a.68.68 0 0 0-.02-.64c-.034-.069-.65-1.555-.715-1.711-.158-.377-.366-.552-.655-.552-.027 0 0 0-.112.005-.137.005-.883.104-1.213.311-.35.22-.94.924-.94 2.16 0 1.112.705 2.162 1.008 2.561l.041.06c1.161 1.695 2.608 2.951 4.074 3.537 1.412.564 2.081.63 2.461.63.16 0 .288-.013.4-.024l.072-.007c.488-.043 1.56-.599 1.804-1.276.192-.534.243-1.117.115-1.329-.088-.144-.239-.216-.43-.308Z"/>
              </svg>
            </a>
          </div>
      </div>

      {/* Sección Derecha: Contacto */}
      {/* Mejorado: Usando space-y y group para hover en links de contacto */}
      <div className='flex flex-col p-10 justify-center w-full md:w-1/3'>
          <h3 className='text-3xl mb-6 font-graphik'>Contacto</h3>
          <div className='text-[#C4C4C4] flex flex-col space-y-4 items-start'> {/* Espaciado vertical */}
            {/* Teléfono */}
            <a className="flex flex-row items-center space-x-3 group" href="tel:+59899254043">
              <svg className="w-5 h-5 text-white group-hover:text-blue-400 transition-colors duration-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.427 14.768 17.2 13.542a1.733 1.733 0 0 0-2.45 0l-.613.613a1.732 1.732 0 0 1-2.45 0l-1.838-1.84a1.735 1.735 0 0 1 0-2.452l.612-.613a1.735 1.735 0 0 0 0-2.452L9.237 5.572a1.6 1.6 0 0 0-2.45 0c-3.223 3.2-1.702 6.896 1.519 10.117 3.22 3.221 6.914 4.745 10.12 1.535a1.601 1.601 0 0 0 0-2.456Z"/>
              </svg>
              <p className="group-hover:text-blue-400 transition-colors duration-200">+598 99 254 043</p>
            </a>
            {/* Email */}
            <a className="flex flex-row items-center space-x-3 group" href="mailto:libreriapalabrasdevida7@gmail.com">
              <svg className="w-5 h-5 text-white group-hover:text-blue-400 transition-colors duration-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m3.5 5.5 7.893 6.036a1 1 0 0 0 1.214 0L20.5 5.5M4 19h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z"/>
              </svg>
              <p className="group-hover:text-blue-400 transition-colors duration-200">libreriapalabrasdevida7@gmail.com</p>
            </a>
            {/* Dirección */}
            <a
              className="flex flex-row items-start space-x-3 group" // items-start para alinear ícono arriba
              href="https://maps.app.goo.gl/HXpoibSEbxvReDJeA"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-5 h-5 text-white mt-1 flex-shrink-0 group-hover:text-blue-400 transition-colors duration-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"> {/* Ajustado tamaño/margen */}
                <path fillRule="evenodd" d="M11.906 1.994a8.002 8.002 0 0 1 8.09 8.421 7.996 7.996 0 0 1-1.297 3.957.996.996 0 0 1-.133.204l-.108.129c-.178.243-.37.477-.573.699l-5.112 6.224a1 1 0 0 1-1.545 0L5.982 15.26l-.002-.002a18.146 18.146 0 0 1-.309-.38l-.133-.163a.999.999 0 0 1-.13-.202 7.995 7.995 0 0 1 6.498-12.518ZM15 9.997a3 3 0 1 1-5.999 0 3 3 0 0 1 5.999 0Z" clipRule="evenodd"/>
              </svg>
              <p className="group-hover:text-blue-400 transition-colors duration-200">
                Ventura Alegre & Zelmar Michelini,<br/> {/* Salto de línea para claridad */}
                20000 Maldonado, Uruguay
              </p>
            </a>
          </div>
      </div>

    </footer>
  );
});

// Es buena práctica añadir un displayName para debugging con React DevTools cuando usas forwardRef
Footer.displayName = 'Footer';

export default Footer;