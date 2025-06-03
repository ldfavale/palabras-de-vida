interface StyledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  registration: any; 
}

export const StyledInput: React.FC<StyledInputProps> = ({ label, id, error, registration, type = "text", ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      id={id}
      type={type}
      {...registration}
      {...props}
      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                  focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm transition-colors duration-150
                  ${error 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500 text-red-900 placeholder-red-300' 
                    : 'border-gray-300 focus:ring-[#E4C97A] focus:border-[#E4C97A]'
                  }`}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);