import mainIcon from '../assets/images/giftIconLibreria.gif'
import { useInView } from 'react-intersection-observer';
import clsx from 'clsx';

function MainBanner() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const { ref: ref2, inView: inView2 } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  return (
    <section id='mainBanner' className="flex flex-row justify-center items-center lg:justify-between pt-28 gap-10">
      <div className=' flex flex-col md:flex-row  space-y-10 md:space-y-0 md:space-x-10 w-full  items-center justify-between'>
        <div
          ref={ref}
          className={clsx(
            "transition-all duration-1000 ease-out transform  w-[80%]  md:w-[50%]  flex items-center lg:justify-between",
            inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
          )}
        >
          <img src={mainIcon} alt="mainIcon" className=' w-full max-w-[450px]'/>
        </div>
        <div
          ref={ref2}
          className={clsx(
            'flex items-center transition-all duration-1000 ease-out transform',
            inView2 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
          )}
        >
          <h1 className=' font-gilroy text-5xl md:text-5xl lg:text-6xl 2xl:text-7xl text-gray-400 font-extrabold text-center md:text-right leading-tight '>
            Señor,<br />
            ¿a quién iremos? <br/>
            Tú tienes <br/>
            <span className='text-primary'>
             palabras <br className='md:hidden'/> de vida 
            </span>
            <br/>
            eterna
          </h1>
        </div>
      </div>
    </section>
  )
}

export default MainBanner
