

import '../App'
import HeroSlider, { Overlay, Slide, Nav } from "hero-slider";
import React, { useState, useEffect } from 'react';


const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};


function Slider() {

  const [images, setImages] = useState([]);

  useEffect(() => {
    const loadImages = async () => {
      if (window.innerWidth >= 768) {
        // Load desktop images
        const desktopImages = await Promise.all([
          import('../assets/images/slider/desktop/1.png'),
          import('../assets/images/slider/desktop/2.png'),
          import('../assets/images/slider/desktop/3.png'),
          import('../assets/images/slider/desktop/4.png'),
          import('../assets/images/slider/desktop/5.png'),
          import('../assets/images/slider/desktop/6.png'),
          import('../assets/images/slider/desktop/7.png')
        ]);
        setImages(desktopImages.map(img => img.default));
      } else {
        // Load mobile images
        const mobileImages = await Promise.all([
          import('../assets/images/slider/mobile/1.png'),
          import('../assets/images/slider/mobile/2.png'),
          import('../assets/images/slider/mobile/3.png'),
          import('../assets/images/slider/mobile/4.png'),
          import('../assets/images/slider/mobile/5.png'),
          import('../assets/images/slider/mobile/6.png'),
          import('../assets/images/slider/mobile/7.png')
        ]);
        setImages(mobileImages.map(img => img.default));
      }
    };

    loadImages();
  }, []);
  

  return (
    <div id='countdown' className='md:px-16 pt-[80px] md:pt-[105px] '>

      <HeroSlider
      style={{paddingTop: "450px"}}
      height="87vh"
      autoplay
      accessibility={{
        shouldDisplayButtons: true
      }}
      controller={{
        initialSlide: 1,
        slidingDuration: 500,
        slidingDelay: 100
      }}
    >
      <Overlay>
        {/* Overlay Container */}
        <div className='flex  flex-col items-center justify-center h-[100%]'>
          {/* <div className='h-10 '></div> */}

          {/* <span className='line-subtitle line-subtitle-slider font-gayathri  text-white  text-sm  lg:text-[1.125rem]  mb-4 tracking-widest'>For ever</span> */}
          
          {/* Main Title */}
          {/* <h1 className=' font-italiana text-[3rem] mb-8 mt-4 md:text-6xl lg:text-[5rem]  md:mb-10  text-white text-center '> Jerusalem</h1> */}
          
          {/* Sub Title */}
          {/* <span className='line-subtitle line-subtitle-slider font-gayathri  text-white   text-sm  lg:text-[1.125rem]  mb-12 tracking-widest'>The City of the Great King </span> */}


        </div>
      </Overlay>


      
     
      <Slide
        background={{
          backgroundImageSrc: images[0]
        }}
      />

      <Slide
        background={{
          backgroundImageSrc: images[1]
        }}
      />
      <Slide
        background={{
          backgroundImageSrc: images[2]
        }}
      />
       <Slide
        background={{
          backgroundImageSrc: images[3]
        }}
      />
      <Slide
        background={{
          backgroundImageSrc: images[4]
        }}
      />
      <Slide
        background={{
          backgroundImageSrc: images[5]
        }}
      />
      <Slide
        background={{
          backgroundImageSrc: images[6]
        }}
      />
      
   
     
      <Nav  />
    </HeroSlider>
    </div>
  )
}

export default Slider
