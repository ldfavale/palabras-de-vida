// src/components/MainContainer.tsx
import React from 'react';

interface MainContainerProps {
  children: React.ReactNode; 
  title?: string;             
  className?: string;
}

const MainContainer: React.FC<MainContainerProps> = ({ children, title , className  }) => {
  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50 py-8 sm:py-12 ">
      <div 
        className={`w-full max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8 md:space-y-10 /* ${className || ''} */ pt-28`}
      >
        {title && (
          <h1 className='font-gilroy text-4xl sm:text-5xl lg:text-6xl text-primary_light font-bold text-center md:text-left'>
            {title}
          </h1>
        )}
        <div className="bg-white shadow-xl rounded-lg p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainContainer;