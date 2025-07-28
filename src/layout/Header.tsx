import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom';
import logo from '../assets/images/icon.png'; // Asumiendo que tu configuración de TS/Vite maneja imágenes
import { useAuth } from '../hooks/useAuth';
import { UserDropdownMenu } from '../components/UserDropdownMenu';
import { ArrowLeftEndOnRectangleIcon, ArrowLeftStartOnRectangleIcon, ArrowRightOnRectangleIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx';

// import TabMenu from '../components/TabMenu';

interface HeaderProps {
  /**
   * Función que se ejecuta para hacer scroll hacia el componente Footer.
   * No recibe argumentos y no retorna ningún valor.
   */
  onScrollToFooter: () => void;
}

// 2. Tipar el componente funcional usando React.FC<HeaderProps>
//    React.FC (Functional Component) es un tipo genérico que acepta la interfaz de props.
const Header: React.FC<HeaderProps> = ({ onScrollToFooter }) => {

  const navItems = [
    { to: "/", label: "Inicio" },
    { to: "/tienda", label: "Tienda" },
    { to: "/actividades", label: "Actividades" },
    { to: "/blog", label: "Blog" },
    { to: "/nosotros", label: "Nosotros" },
    { to: "#footer", label: "Contacto", isSpecial: true }, // isSpecial para el onClick
  ];

   const [menuButtonClicked, setMenuButtonClicked] = useState(false);
   const [switchingBg, setSwitchingBg] = useState({});
   const [switchingSize, setSwitchingSize] = useState({height: "80px",width: "80px"});
   const [searchFieldShown, setSearchFieldShown] = useState(false);
   const location = useLocation();
   const isShoppingPage = ['/tienda'].includes(location.pathname);

    // Function to check scroll position and handle it
const checkScrollPosition =  () => {
  // Get the current scroll position
  let scrollY = window.scrollY;
  let screenWidth = screen.width;

  // Do something based on the scroll position
  if (scrollY > 65 || screenWidth < 640) {
    // The user has scrolled down
    setSwitchingBg({height:'70px'})
    setSwitchingSize({height: "50px",width: "50px"})
  } else {
    if(isShoppingPage){
      setSwitchingBg({height:'104px'})
    }else{
      setSwitchingBg({height:'104px'})
    }
    setSwitchingSize({height: "80px",width: "80px"})
    // setSwitchingBg({backgroundColor:'transparent'})
    // The user is at the top of the page
    console.log("User is at the top.");
  }

}

window.addEventListener("scroll", checkScrollPosition);

//  TODO: Create component for burger menu 
const { isAuthenticated } = useAuth();

const dismissMenu = () => {
  setMenuButtonClicked(false)
}

const onClickContactLink = () => {
  dismissMenu()
  onScrollToFooter()
}

const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    "block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0  md:p-0",
    isActive ? "font-bold" : ""
  );

    return (
      
      <div id='header' className=' flex flex-col fixed z-20  w-full bg-white [box-shadow:0_8px_6px_-6px_rgba(0,0,0,0.15)] ' >
        <div className='flex  w-full'>

        <div className={` hidden md:flex justify-between  w-full items-center md:justify-center px-4 sm:px-6 md:px-8 py-3 transition-all`} style={switchingBg}>
          <nav className='DESKTOP-MENU justify-center font-gayathri  font-thin  text-md  hidden md:flex'>
            <ul className='flex flex-row [&_li]:py-3 [&_li]:md:px-6  [&_li]:lg:px-8 [&_li]:flex [&_li]:items-center font-gayathri  font-medium  '>
              {navItems.slice(0, 3).map((item) => (
                <li key={item.to} className='hover:underline'>
                  <NavLink
                    to={item.to}
                    className={getNavLinkClass}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              
              <Link to="/">
                <img src={logo} className='h-20 w-20' alt="Logo" style={switchingSize} />
              </Link>

              {navItems.slice(3).map((item) => (
                <li key={item.to} className='hover:underline'>
                  {item.isSpecial ? (
                    <Link to={item.to} onClick={onClickContactLink}>
                      {item.label}
                    </Link>
                  ) : (
                    <NavLink
                      to={item.to}
                      className={getNavLinkClass}
                    >
                      {item.label}
                    </NavLink>
                  )}
                </li>
              ))}
           </ul>
          </nav>
           {isAuthenticated && (
          <UserDropdownMenu className="ml-4" />
           )}
      
      {/* {!isAuthenticated && (
        <Link 
          to="/login" 
          className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-primary   hover:bg-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#E4C97A] focus:ring-offset-2 "
          aria-label="Iniciar Sesión"
        >
          <ArrowLeftEndOnRectangleIcon className="w-5 h-5 text-primary hover:text-white font-bold" />
      </Link>
      )} */}
        </div>

          {/* MOBILE MENU */}
          <div className='flex  w-full justify-between items-center md:hidden px-4 sm:px-6 md:px-8 py-3 transition-all' style={switchingBg}>
            <img src={logo} className='h-12 w-12 md:hidden' alt="Logo" />

            <button onClick={() => setMenuButtonClicked((prev) => !prev)} className='p-[0.6rem] pr-1 sm:pr-2 md:hidden transition-all '>
              <svg className="w-5 h-4 text-black   " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                <path stroke="currentColor"  strokeWidth="1.7" d="M1 1h15M1 7h15M1 13h15"/>
              </svg>
            </button>
          </div>

        </div>

        <nav>
        <section className="MOBILE-MENU flex md:hidden ">
          <div className={menuButtonClicked ? "showMenuNav" : "hideMenuNav"}>
            <div
              className="absolute top-0 right-0 px-8 py-8"
              onClick={() => setMenuButtonClicked(false)}
            >
              <svg
                className="h-8 w-8 text-gray-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <ul className="flex flex-col items-center justify-between min-h-[250px] space-y-10   font-gayathri text-lg   ">
              {navItems.map((item) => (
                <li key={item.to} className='hover:underline'>
                  {item.isSpecial ? (
                    <Link to={item.to} onClick={onClickContactLink}>
                      {item.label}
                    </Link>
                  ) : (
                    <NavLink
                      to={item.to}
                      onClick={dismissMenu}
                      className={getNavLinkClass}
                    >
                      {item.label}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </nav>
     
     
      <style>{`
      .hideMenuNav {
        display: none;
      }
      .showMenuNav {
        display: block;
        position: absolute;
        width: 100%;
        height: 100vh;
        top: 0;
        left: 0;
        background: white;
        z-index: 20;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
      }
    `}</style>
      </div>
    )

}

export default Header
