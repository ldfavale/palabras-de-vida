import { useState } from 'react'
import logo from '../assets/images/icon.png'
import { Link } from 'react-router-dom';

 function Header() {

   const [menuButtonClicked, setMenuButtonClicked] = useState(false);
   const [switchingBg, setSwitchingBg] = useState({});
   const [switchingSize, setSwitchingSize] = useState({height: "80px",width: "80px"});

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
    setSwitchingBg({height:'104px'})
    setSwitchingSize({height: "80px",width: "80px"})
    // setSwitchingBg({backgroundColor:'transparent'})
    // The user is at the top of the page
    console.log("User is at the top.");
  }

}

window.addEventListener("scroll", checkScrollPosition);

// Botones:  Tienda Actividades Blog algomas Historia  Contacto
//  TODO: Cambiar Col
//  TODO: Pagina Tienda 
    return (
      <div id='header' className=' flex flex-col fixed z-20  w-full bg-white [box-shadow:0_8px_6px_-6px_rgba(0,0,0,0.15)] ' >
        <div className={"  flex justify-between items-center md:justify-center px-8 py-3 transition-all"} style={switchingBg}>
          <nav className=' justify-center font-gayathri  font-thin  text-md  hidden md:flex'>
            <ul className='flex flex-row [&_li]:py-3 [&_li]:md:px-6  [&_li]:lg:px-8 [&_li]:flex [&_li]:items-center font-gayathri  font-medium  '>
            <li className='hover:underline'>
              <Link to="/tienda">
                Tienda
              </Link>
            </li>
              <li className='hover:underline'>
              <Link to="/actividades">
                Actividades
              </Link></li>
              <li className='hover:underline'>
                <Link to="/blog">
                Blog
                </Link>
              </li>
              <Link to="/">
              <img src={logo} className='h-20 w-20' alt="Logo" style={switchingSize} />
                </Link>
              <li className='hover:underline'>
              <Link to="/algomas">
              Algomas
              </Link></li>
              <li className='hover:underline'>
              <Link to="/historia">
              Historia
              </Link>
              </li>
              <li className='hover:underline '>
              <Link to="/contacto">
                Contacto
              </Link>
              </li>
           </ul>
          </nav>
          <img src={logo} className='h-14 w-14 md:hidden' alt="Logo" />

          <button onClick={()=>{
            let scrollY = window.scrollY;
            if (menuButtonClicked && scrollY <= 65){
              // setSwitchingBg({backgroundColor:'transparent'})
            }else{
              // setSwitchingBg({backgroundColor:'rgba(0,0,0,0.9)'})
            }
            setMenuButtonClicked(!menuButtonClicked)

          }} className='p-[0.6rem]  md:hidden transition-all '>
            <svg className="w-5 h-4   " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor"  strokeWidth="1.7" d="M1 1h15M1 7h15M1 13h15"/>
            </svg>
          </button>

        </div>


      { menuButtonClicked &&
        <nav className='font-gayathri   text-md bg-white  md:hidden '>
          <ul className='flex flex-col text-center items-center justify-center [&_li]:py-3 [&_li]:md:px-6  [&_li]:lg:px-8 [&_li]:flex [&_li]:items-center '>
          <li className='hover:underline'>
              <Link to="/tienda">
                Tienda
              </Link>
            </li>
              <li className='hover:underline'>
              <Link to="/actividades">
                Actividades
              </Link></li>
              <li className='hover:underline'>
                <Link to="/blog">
                Blog
                </Link>
              </li>
              <li className='hover:underline'>
              <Link to="/algomas">
              Algomas
              </Link></li>
              <li className='hover:underline'>
              <Link to="/historia">
              Historia
              </Link>
              </li>
              <li className='hover:underline '>
              <Link to="/contacto">
                Contacto
              </Link>
              </li>
            </ul>
        </nav>
        }

      </div>
    )

}

export default Header
