import MainSlider from './components/MainSlider'
import Categories from './components/Categories'
import MainBanner from './components/MainBanner'



function App() {

  return (
    <div className='md:px-10 lg:px-10 xl:px-20 2xl:px-40 2xl:px-64'>
      <div className='flex flex-col min-h-screen gap-y-10 py-28'>
        <MainBanner/>
        <MainSlider />
        <Categories/>
      </div>
    </div>
  )
}

export default App
