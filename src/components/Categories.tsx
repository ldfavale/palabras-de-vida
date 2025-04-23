

function Categories() {
  return (
    <section id='categories' className="flex flex-col justify-center items-center   py-28">
      <h3 className='text-4xl mb-8 font-medium font-gayathri font-graphik '>Categorias</h3>
      <div className=' flex flex-col space-y-10 sm:space-y-0 sm:space-x-10 sm:flex-row w-full p-10 items-center justify-around  bg-white  '>
          <div className="rounded-full   h-64 w-64 bg-[#AEBF8A]  flex flex-col items-center justify-center">
              <h3 className='text-2xl mt-4 text-white font-bold  text-center flex  font-graphik uppercase' >Biblias</h3>
              <svg className="w-32 h-32 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M9 3v14m7 0v4"/>
              </svg>


          </div>
          <div className="rounded-full h-64 w-64 bg-[#897671]  flex flex-col items-center justify-center">
              <h3 className='text-2xl mt-4 text-white font-bold  text-center flex  font-graphik uppercase'>Libros</h3>
              <svg className="w-32 h-32 text-white " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 6.03v13m0-13c-2.819-.831-4.715-1.076-8.029-1.023A.99.99 0 0 0 3 6v11c0 .563.466 1.014 1.03 1.007 3.122-.043 5.018.212 7.97 1.023m0-13c2.819-.831 4.715-1.076 8.029-1.023A.99.99 0 0 1 21 6v11c0 .563-.466 1.014-1.03 1.007-3.122-.043-5.018.212-7.97 1.023"/>
              </svg>
          </div>
          <div className="rounded-full h-64 w-64 bg-[#EDCF70]  flex flex-col items-center justify-center">
              <h3 className='text-2xl mt-4 text-white font-bold  text-center flex  font-graphik uppercase' >Regalos</h3>
              <svg className="w-32 h-32 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M10 21v-9m3-4H7.5a2.5 2.5 0 1 1 0-5c1.5 0 2.875 1.25 3.875 2.5M14 21v-9m-9 0h14v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8ZM4 8h16a1 1 0 0 1 1 1v3H3V9a1 1 0 0 1 1-1Zm12.155-5c-3 0-5.5 5-5.5 5h5.5a2.5 2.5 0 0 0 0-5Z"/>
              </svg>


          </div>
          
      </div>
    </section>
  )
}

export default Categories
