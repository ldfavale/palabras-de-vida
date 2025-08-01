import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface InputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'required'> {
  label: string;
  error?: string;
  register: UseFormRegisterReturn;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local';
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  required?: boolean;
}

const styles = {
  container: "space-y-1",
  label: "block text-gray-700 font-semibold font-gilroy text-sm",
  input: "w-full p-3 border border-gray-100 rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors duration-200",
  error: "text-sm text-red-500 mt-1"
} as const;

const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  error, 
  register, 
  type = "text",
  containerClassName = "",
  labelClassName = "",
  errorClassName = "",
  className = "",
  required = false,
  ...inputProps 
}) => {
  const inputClassName = `${styles.input} ${className}`.trim();

  return (
    <div className={`${styles.container} ${containerClassName}`.trim()}>
      <label 
        htmlFor={register.name}
        className={`${styles.label} ${labelClassName}`.trim()}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        {...register}
        {...inputProps}
        type={type}
        id={register.name}
        className={inputClassName}
        aria-invalid={!!error}
        aria-describedby={error ? `${register.name}-error` : undefined}
        required={required}
      />
      
      {error && (
        <span 
          id={`${register.name}-error`}
          className={`${styles.error} ${errorClassName}`.trim()}
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default InputField;