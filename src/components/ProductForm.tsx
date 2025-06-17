import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import useCreateProduct from "../hooks/useCreateProducts";
import { useEffect, useState } from "react";
import useGetCategories from "../hooks/useGetCategories";
import SelectField from "./SelectField";
import { PlusIcon } from "@heroicons/react/24/outline";
import InputField from "./InputField";
import { ProductRequestData } from "../services/dataService";
import useCreateCategory from "../hooks/useCreateCategory";
import LoadingIndicator  from "./LoadingIndicator";
import toast from "react-hot-toast";
import TextareaField from "./TextAreaField";
import SimpleInputField from "./SimpleInputField";

export const productSchema = yup.object().shape({
  title: yup.string().required("El título es obligatorio"),
  price: yup.number().required("El precio es obligatorio").positive("El precio debe ser positivo"),
  description: yup.string().required("La descripción es obligatoria"),
  categories: yup.array().of(yup.string()).required("Selecciona al menos una categoría").min(1, "Selecciona al menos una categoría"),
  code: yup.string().required("El código es obligatorio"),
  images: yup.mixed().test("required", "You must upload at least one image", (value) => {
    return !!value 
  }),
});

type ProductForm = yup.InferType<typeof productSchema>;

export default function ProductForm() {

  const { loading, error, success, create} = useCreateProduct();
  const { loading: loadingCategory, error: errorCategory, success: successCategory, create: createCategory } = useCreateCategory();
  const { loading: categoriesLoading, error: categoriesError, categories, refetch: refetchCategories } = useGetCategories();
  const [selectedCategories, setSelectedCategories] = useState<{ value: string; label: string }[]>([]);
  const [newCategory, setNewCategory] = useState<string>("");
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));
  const {
    register,
    reset,
    handleSubmit,
    setValue, // Importante: usar setValue para actualizar valores
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: yupResolver(productSchema),
  });


  useEffect(() => {
    if (success) {
      toast.success('¡Producto creado exitosamente!');
      reset(); 
      setPreviewImages([]);
      setSelectedCategories([]);
    }
    if (error?.message) {
       toast.error(`Error: ${error.message}`);
    }
  }, [success, error, reset]);

  const onSubmit: SubmitHandler<ProductForm> = async (data) => { // data es ProductForm
    // 1. FILTER CATEGORIES
    const categoryIds: string[] = data.categories.filter(
      (catId): catId is string => typeof catId === 'string'
    );
  
    // 2. CONVERT IMAGES -> File[]
    let imageFiles: File[] = [];
    if (data.images instanceof FileList) {
        imageFiles = Array.from(data.images);
    } else {
        console.warn("No images selected or images field is not a FileList.");
        // return; //  si son obligatorias
    }
  
    // 3. BUILD THE OBJECT FOR THE API 
    const productDataForApi: ProductRequestData = {
      title: data.title,
      price: data.price, 
      description: data.description,
      code: data.code,
      categories: categoryIds,   
      images: imageFiles,        
    };
  
      await create(productDataForApi); 
    
  };
  
  const handleImagePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const previews = Array.from(files).map((file) => URL.createObjectURL(file));
      setPreviewImages(previews);
    }
  };

  const handleCreateCategory = async () => {
    if (newCategory.trim()) {
      try {
        await createCategory({name: newCategory});
        console.log("New category created:", newCategory);
        toast.success("Categoría creada exitosamente");
        setNewCategory("");
        refetchCategories();
        
      } catch (error) {
        console.error("Error creating category:", error);
        toast.error("Error al crear la categoría");
        return;
      }
    }
  }


  return (
<>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className=" rounded-lg py-6 px-0 space-y-6"
      >
    

        {/* Code */}
        
        <InputField 
          type="text" 
          label="Código" 
          placeholder="Ingrese el código del producto..." 
          register={register("code")}
          error={errors.code?.message}
        />
   

        {/* Title */}         
        <InputField 
          type="text" 
          label="Titulo" 
          placeholder="Ingrese el titulo del producto..." 
          register={register("title")}
          error={errors.title?.message}
        />

        {/* Price */}
         
        <InputField 
          type="text" 
          label="Precio" 
          placeholder="Ingrese el precio del producto..." 
          register={register("price")}
          error={errors.price?.message}
        />

        {/* Description */}
        <TextareaField 
          rows={4}
          resize="vertical"
          label="Descripción" 
          placeholder="Ingrese la descripción del producto..." 
          register={register("description")}
          error={errors.description?.message}
        />

        {/* Category Select */}
        <SelectField
          label="Categorias"
          options={categoryOptions}
          value={selectedCategories}
          onChange={(selected) => {
            setSelectedCategories(selected);
            setValue("categories", selected.map((item) => item.value)); // Actualiza el valor de categories
          }}
          error={errors.categories?.message}
          placeholder="Selecciona una o más categorías..."
        />


        {/* Nueva categoría */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SimpleInputField
              type="text"
              label="Nueva categoría"
              placeholder="Ingrese una nueva categoría..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              error={undefined}
            />
          </div>
          <button
            type="button"
            onClick={handleCreateCategory}
            disabled={loadingCategory}
            className="p-[14px] mb-[2px] bg-primary text-white rounded flex self-end "
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div>
        <label className="block text-gray-700 font-semibold font-gilroy">Imagenes</label>
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
          disabled={loading}
          className="w-full flex items-center justify-center py-3 bg-primary_light text-white font-bold font-gilroy rounded-md hover:bg-yellow-400 transition"
        >
          {loading ? <LoadingIndicator/> : "Agregar Producto"}
        </button>
      </form>
    </>
  );
}
