

import '../App'
import HeroSlider, { Overlay, Slide, Nav } from "hero-slider";
import slide1 from '../assets/images/slide1.jpg'
import slide2 from '../assets/images/slide2.jpg'
import slide3 from '../assets/images/slide3.jpg'




function Slider() {
  return (
    <div id='countdown'>

      <HeroSlider

      style={{minHeight: "650px"}}
      autoplay
      accessibility={{
        shouldDisplayButtons: false
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

          <span className='line-subtitle line-subtitle-slider font-gayathri  text-white  text-sm  lg:text-[1.125rem]  mb-4 tracking-widest'>For ever</span>

          {/* Main Title */}
          <h1 className=' font-italiana text-[3rem] mb-8 mt-4 md:text-6xl lg:text-[5rem]  md:mb-10  text-white text-center '> Jerusalem</h1>

          {/* Sub Title */}
          <span className='line-subtitle line-subtitle-slider font-gayathri  text-white   text-sm  lg:text-[1.125rem]  mb-12 tracking-widest'>The City of the Great King </span>

          {/* Countdown */}
          {/* <WeddingCountdown /> */}

        </div>
      </Overlay>

      <Slide
        background={{
          backgroundImageSrc: slide1
        }}
      />

      <Slide
        background={{
          backgroundImageSrc: slide2
        }}
      />

      <Slide
        background={{
          backgroundImageSrc: slide3
        }}
      />

      <Nav  />
    </HeroSlider>
    </div>
  )
}

export default Slider
