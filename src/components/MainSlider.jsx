

import React, { useState, useEffect } from 'react';
import Slider from './Slider'



function MainSlider() {

  const [images, setImages] = useState([]);

  useEffect(() => {
    const loadImages = async () => {
      if (window.innerWidth >= 768) {
        // Load desktop images
        const desktopImages = await Promise.all([
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
    <div className='md:px-28 pt-[80px] md:pt-[105px]'>
      <Slider
        images={images}
        carouselClassName="rounded-xl"  
        imageClassName="h-full md:h-[75vh] w-full object-cover"                         navigation={false} 
        navigation={true}
      />
    </div>
  )
}

export default MainSlider
