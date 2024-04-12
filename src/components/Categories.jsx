

function Categories() {
  return (
    <section id='categories' className="flex flex-col justify-center items-center   ">
      <h3 className='text-3xl my-6 '>Categorias</h3>
      <div className=' flex flex-col space-y-10 sm:space-y-0 sm:space-x-10 sm:flex-row w-full p-10 items-center justify-around  bg-white  '>
          <div className=" h-56 w-64 bg-[#AEBF8A] p-8">
              <h3 className='text-2xl mb-6 text-white font-bold text-center'>Biblias</h3>
          </div>
          <div className=" h-56 w-64 bg-[#897671] p-8">
              <h3 className='text-2xl mb-6 text-white font-bold  text-center'>Libros</h3>
          </div>
          <div className=" h-56 w-64 bg-[#D5BA88] p-8">
              <h3 className='text-2xl mb-6 text-white font-bold text-center' >Regalos</h3>
          </div>
          
      </div>
    </section>
  )
}

export default Categories
