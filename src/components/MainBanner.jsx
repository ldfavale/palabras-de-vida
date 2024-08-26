import mainIcon from '../assets/images/giftIconLibreria.gif'


function MainBanner() {
  return (
    <section id='mainBanner' className="flex flex-row justify-center items-center   py-28">
      <div className=' flex flex-col md:flex-row  space-y-20 md:space-y-0 md:space-x-10 w-full p-5 md:p-10 items-center justify-around  '>
      <img src={mainIcon} alt="mainIcon" className='w-[80%]  md:w-[40%] max-w-[400px]'/>
          <div className=' flex items-center'>
            <h1 className=' font-gilroy  text-5xl  md:text-5xl lg:text-6xl xl:text-6xl  text-[#a28c85] font-bold text-center md:text-right '>
            Señor,<br />
            ¿a quién iremos? <br/>
            Tú tienes <br/>
            <span className='text-primary_light'>
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
