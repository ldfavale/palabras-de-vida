import React from 'react'

function ShopItem({product}) {
  return (
    <div className=" max-w-md sm:hover:[box-shadow:3px_6px_6px_3px_rgba(0,0,0,0.15)] m-3  sm:w-1/3">
        <div className="flex flex-col">
            <div className=' flex sm:h-[231px] bg-lightgrey items-center justify-center'>
                <img src={product.image} alt="product" className="w-full "/>
            </div>
            <div className=' -mt-6 flex items-end justify-end pr-4'>
                <div className='rounded-full bg-primary border  border-white p-2'>
                    <svg className="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7 7V5"/>
                    </svg>
                </div>
            </div>
        </div>
        <div className=" p-4">
            <p className="font-graphik font-medium text-black mb-2">{product.title}</p>
            <div className="flex flex-row  justify-between w-full mb-1 [&>span]:text-lightgrey [&>span]:font-thin  [&>span]:text-xs">
                <span>{product.category}</span>
                <span>{product.codigo}</span>
            </div>
            <div className="font-medium text-primary mb-1">{product.price}</div>
            <p className="font-graphik font- text-xs text-black mb-2">
            {product.description}
            </p>
        </div>
  </div>
  )
}

export default ShopItem