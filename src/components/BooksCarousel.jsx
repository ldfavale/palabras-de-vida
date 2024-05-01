import Slider from "react-slick";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
function BooksCarousel() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3
  };
  return (
    <section id='books' className="flex flex-col justify-center items-center   ">
      <h3 className='text-3xl my-6 font-graphik font-medium'>Categorias</h3>
      {/* <div className=' flex flex-col space-y-10 sm:space-y-0 sm:space-x-10 sm:flex-row w-full p-10 items-center justify-around  bg-white  '>
          <div className=" h-56 w-64 bg-[#AEBF8A] p-8">
              <h3 className='text-2xl mb-6 text-white font-bold text-center'>Biblias</h3>
          </div>
          <div className=" h-56 w-64 bg-[#897671] p-8">
              <h3 className='text-2xl mb-6 text-white font-bold  text-center'>Libros</h3>
          </div>
          <div className=" h-56 w-64 bg-[#D5BA88] p-8">
              <h3 className='text-2xl mb-6 text-white font-bold text-center' >Regalos</h3>
          </div>
      </div> */}

      <div className="slider-container">
      <Slider {...settings}>
        <div  style={{width:100, height:100}} className="h-10 w-6 bg-[#897671]">
          <h3 className="">1</h3>
        </div>
        <div>
          <h3>2dsfasdfsdafsadfsad</h3>
        </div>
        <div>
          <h3>3</h3>
        </div>
        <div>
          <h3>4</h3>
        </div>
        <div>
          <h3>5</h3>
        </div>
        <div>
          <h3>6</h3>
        </div>
        <div>
          <h3>7</h3>
        </div>
        <div>
          <h3>8</h3>
        </div>
        <div>
          <h3>9</h3>
        </div>
      </Slider>
    </div>

    </section>
  )
}

export default BooksCarousel
