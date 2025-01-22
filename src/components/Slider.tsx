import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules'; // Correct Swiper module import
import { StorageImage } from '@aws-amplify/ui-react-storage';
import { useRef } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface SliderProps {
  images?: string[]; // Array of image URLs
  paths?: string[]; // Array of S3 paths
  containerClassName?: string; 
  carouselClassName?: string; 
  imageClassName?: string; 
  navigation?: boolean | object
}

const Slider: React.FC<SliderProps> = ({
  images,
  paths,
  containerClassName,
  carouselClassName,
  imageClassName,
  navigation
}) => {
  if (!images && !paths) {
    return (
      <div className={containerClassName}>
        <p>No images available</p>
      </div>
    );
  }

  const pagination = {
    clickable: true,
  };

  return (
    <div className={containerClassName}>
      <Swiper 
      
      spaceBetween={30}
        slidesPerView={1}
        loop={true}
        navigation={navigation} // Adds arrows for navigation
        pagination={pagination} // Adds clickable bullet pagination
        modules={[Navigation, Pagination]}
        className={carouselClassName}>
        {images &&
          images.map((image, index) => (
            <SwiperSlide key={`image-${index}`}>
              <img
                src={image}
                alt={`slide-${index}`}
                className={imageClassName}
              />
            </SwiperSlide>
          ))}

        {paths &&
          paths.map((path, index) => (
            <SwiperSlide key={`path-${index}`}>
              <StorageImage
                alt={`slide-${index}`}
                path={path}
                className={imageClassName}
              />
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  );
};

export default Slider;
