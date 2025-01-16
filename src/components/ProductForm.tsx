import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { createProduct } from "../services/dataService";
import useCreateProduct from "../hooks/useCreateProducts";
import type { Schema } from '../../amplify/data/resource'
import { useState } from "react";
type Product = Schema['Product']['type'];

const productSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  category: yup.string().required("Category is required"),
  images: yup.mixed().test("required", "You must upload at least one image", (value) => {
    return !!value // value.length > 0;
  }),
  code: yup.string().required("Code is required"),
  price: yup
    .string()
    .matches(/^\d+(\.\d{1,2})?$/, "Price must be a valid number")
    .required("Price is required"),
});

type ProductForm = yup.InferType<typeof productSchema>;

export default function ProductForm() {

  const { loading, error, success, create } = useCreateProduct();


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: yupResolver(productSchema),
  });

  const [previewImages, setPreviewImages] = useState<string[]>([]);


  const onSubmit: SubmitHandler<ProductForm> = (data) => {
    console.log("Form submitted:", data);

    // const formData = new FormData();
    // O lo que estés pasando a Array.from()


    // if (data.images && data.images.length > 0) {
    //   const files = Array.from(data.images as FileList); // Convierte el FileList en un Array
    //   console.log(files); // Ahora es un arreglo
    // } else {
    //   console.error("No images found");
    // }

    // formData.append("title", data.title);
    // formData.append("description", data.description);
    // formData.append("category", data.category);
    // formData.append("code", data.code);
    // formData.append("price", data.price);

    // Send formData to your backend
    // console.log("formData:", formData);
    createProduct(data)
  };

  const handleImagePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const previews = Array.from(files).map((file) => URL.createObjectURL(file));
      setPreviewImages(previews);
    }
  };

  return (
    <div className="min-h-screen flex  ">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full  bg-white  rounded-lg py-6 px-0 space-y-6"
      >
    

        {/* Title */}
        <div>
          <label className="block text-gray-700 font-semibold font-gilroy">Título</label>
          <input
            {...register("title")}
            placeholder="Enter product title"
            className="w-full p-3 border border-gray-100 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          {errors.title && (
            <span className="text-sm text-red-500">{errors.title.message}</span>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-semibold font-gilroy">Descripción</label>
          <textarea
            {...register("description")}
            placeholder="Enter product description"
            className="w-full p-3 border border-gray-100 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          {errors.description && (
            <span className="text-sm text-red-500">
              {errors.description.message}
            </span>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-gray-700  font-semibold font-gilroy">Categoria</label>
          <input
            {...register("category")}
            placeholder="Ingrese la categoría"
            className="w-full p-3 border border-gray-100 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          {errors.category && (
            <span className="text-sm text-red-500">{errors.category.message}</span>
          )}
        </div>

        {/* Image */}
        <div>
          <label className="block text-gray-700 font-semibold font-gilroy">Image URL</label>
          <input
            {...register("image")}
            placeholder="Enter image URL"
            type="url"
            className="w-full p-3 border border-gray-100 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          {errors.image && (
            <span className="text-sm text-red-500">{errors.image.message}</span>
          )}
        </div>

        {/* Code */}
        <div>
          <label className="block text-gray-700 font-semibold font-gilroy">Code</label>
          <input
            {...register("code")}
            placeholder="Enter product code"
            className="w-full p-3 border border-gray-100 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          {errors.code && (
            <span className="text-sm text-red-500">{errors.code.message}</span>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block text-gray-700 font-semibold font-gilroy">Price</label>
          <input
            {...register("price")}
            placeholder="Enter product price"
            type="text"
            className="w-full p-3 border border-gray-100 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          {errors.price && (
            <span className="text-sm text-red-500">{errors.price.message}</span>
          )}
        </div>

        <div>
        <label>Images</label>
        <input
          type="file"
          multiple
          {...register("images")}
          onChange={(e) => {
            handleImagePreview(e);
            register("images").onChange(e); // Sync with react-hook-form
          }}
        />
        {errors.images && <p>{errors.images.message}</p>}
      </div>

      {/* Image previews */}
      <div className="flex space-x-4">
        {previewImages.map((src, index) => (
          <img key={index} src={src} alt={`Preview ${index}`} className="w-20 h-20 object-cover" />
        ))}
      </div>
        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 bg-primary_light text-white font-bold font-gilroy rounded-md hover:bg-yellow-400 transition"
        >
          {loading ? "Cargando..." : "Agregar Producto"}
        </button>
      </form>
    </div>
  );
}
