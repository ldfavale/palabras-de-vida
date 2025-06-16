import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface TextareaFieldProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'required'> {
  label: string;
  error?: string;
  register: UseFormRegisterReturn;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  required?: boolean;
  rows?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const styles = {
  container: "space-y-1",
  label: "block text-gray-700 font-semibold font-gilroy text-sm",
  textarea: "w-full p-3 border border-gray-100 rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors duration-200",
  error: "text-sm text-red-500 mt-1"
} as const;

const TextareaField: React.FC<TextareaFieldProps> = ({ 
  label, 
  error, 
  register, 
  containerClassName = "",
  labelClassName = "",
  errorClassName = "",
  className = "",
  required = false,
  rows = 4,
  resize = 'vertical',
  ...textareaProps 
}) => {
  const resizeClass = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  }[resize];

  const textareaClassName = `${styles.textarea} ${resizeClass} ${className}`.trim();

  return (
    <div className={`${styles.container} ${containerClassName}`.trim()}>
      <label 
        htmlFor={register.name}
        className={`${styles.label} ${labelClassName}`.trim()}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <textarea
        {...register}
        {...textareaProps}
        id={register.name}
        rows={rows}
        className={textareaClassName}
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

export default TextareaField;