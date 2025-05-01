import React from "react";

interface InputFieldProps {
  label: string;
  placeholder: string;
  error?: string;
  register: any; // Puedes usar un tipo más específico si usas TypeScript
  type?: string;
}

const styles = {
  input: "w-full p-3 border border-gray-100 rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300",
}

const InputField: React.FC<InputFieldProps> = ({ label, placeholder, error, register, type = "text" }) => {
  return (
    <div>
      <label className="block text-gray-700 font-semibold font-gilroy">{label}</label>
      {type === "text" &&
        <input
            {...register}
            placeholder={placeholder}
            type={type}
            className={styles.input}
        />
        }
      {type === "textarea" &&
        <textarea
            {...register}
            placeholder={placeholder}
            type={type}
            className={styles.input}
        />
        }
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};




export default InputField;