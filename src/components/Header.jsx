import { useState } from 'react'

 function Header() {

   const [menuButtonClicked, setMenuButtonClicked] = useState(false);
   const [switchingBg, setSwitchingBg] = useState({backgroundColor:'transparent'});

    // Function to check scroll position and handle it
const checkScrollPosition =  () => {
  // Get the current scroll position
  let scrollY = window.scrollY;

  // Do something based on the scroll position
  if (scrollY > 65) {
    // The user has scrolled down
    setSwitchingBg({backgroundColor:'rgba(0,0,0,0.9)'})
  } else {
    setSwitchingBg({backgroundColor:'transparent'})
    // The user is at the top of the page
    console.log("User is at the top.");
  }

}

window.addEventListener("scroll", checkScrollPosition);


    return (
      <div id='header' className=' flex flex-col fixed z-20  w-full'>
        <div className={"  text-white flex justify-end md:justify-center px-8 py-3 transition-all"} style={switchingBg}>
          <nav className=' justify-center font-gayathri  font-thin  text-md  hidden md:flex'>
            <ul className='flex flex-row [&_li]:py-3 [&_li]:md:px-6  [&_li]:lg:px-8 [&_li]:flex [&_li]:items-center  '>
              <li className='hover:underline'><a href="#link_1">link 1</a></li>
              <li className='hover:underline'><a href="#link_2">link 2</a></li>
              <li className='hover:underline'><a href="#link_3">link 3</a></li>
              <li className='hover:underline'><a href="#link_4">link 4</a></li>
              <li className='hover:underline'><a href="#link_5">link 5</a></li>     
            </ul>
          </nav>

          <button onClick={()=>{
            let scrollY = window.scrollY;
            if (menuButtonClicked && scrollY <= 65){
              setSwitchingBg({backgroundColor:'transparent'})
            }else{
              setSwitchingBg({backgroundColor:'rgba(0,0,0,0.9)'})
            }
            setMenuButtonClicked(!menuButtonClicked)

          }} className='p-[0.6rem]  md:hidden transition-all '>
            <svg className="w-5 h-4  text-white  " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor"  strokeWidth="1.7" d="M1 1h15M1 7h15M1 13h15"/>
            </svg>
          </button>

        </div>


      { menuButtonClicked &&
        <nav className='font-gayathri   text-md bg-[rgba(0,0,0,0.9)] text-white md:hidden '>
          <ul className='flex flex-col text-center items-center justify-center [&_li]:py-3 [&_li]:md:px-6  [&_li]:lg:px-8 [&_li]:flex [&_li]:items-center '>
            <li className='hover:underline'><a href="#our_story">Our Story</a></li>
            <li className='hover:underline'><a href="#location">Location</a></li>
            <li className='hover:underline'><a href="#rsvp">RSVP</a></li>
          </ul>
        </nav>
        }

      </div>
    )

}

export default Header
