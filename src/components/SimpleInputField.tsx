import React from "react";

interface SimpleInputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'required'> {
  label: string;
  error?: string;
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

const SimpleInputField: React.FC<SimpleInputFieldProps> = ({ 
  label, 
  error, 
  type = "text",
  containerClassName = "",
  labelClassName = "",
  errorClassName = "",
  className = "",
  required = false,
  id,
  ...inputProps 
}) => {
  // Generar ID único si no se proporciona
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const inputClassName = `${styles.input} ${className}`.trim();

  return (
    <div className={`${styles.container} ${containerClassName}`.trim()}>
      <label 
        htmlFor={inputId}
        className={`${styles.label} ${labelClassName}`.trim()}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        {...inputProps}
        type={type}
        id={inputId}
        className={inputClassName}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        required={required}
      />
      
      {error && (
        <span 
          id={`${inputId}-error`}
          className={`${styles.error} ${errorClassName}`.trim()}
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default SimpleInputField;