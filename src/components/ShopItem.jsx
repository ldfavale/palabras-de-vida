import React from 'react'

function ShopItem({product}) {
  return (
    <div className=" w-full ">
        <div className=" ">
            <img src={product.image} alt="product" className="w-full"/>
        </div>
        <div className=" h-48 p-4">
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