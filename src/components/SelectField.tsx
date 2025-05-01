import React from "react";
import Select from "react-select";

interface SelectFieldProps {
  label: string;
  options: { value: string; label: string }[];
  value: { value: string; label: string }[];
  onChange: (selected: { value: string; label: string }[]) => void;
  error?: string;
  placeholder?: string;
}



const SelectField: React.FC<SelectFieldProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  placeholder = "Selecciona una o más opciones...",
}) => {
  return (
    <div>
      <label className="block text-gray-700 font-semibold font-gilroy">{label}</label>
      <Select
        isMulti
        options={options}
        value={value}
        onChange={(selected) => onChange(selected as { value: string; label: string }[])}
        className="w-full"
        classNamePrefix="custom-select"
        placeholder={placeholder}
        styles={customStyles}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};


const customStyles = {
  control: (base: any, { isFocused }: any) => ({
    ...base,
    backgroundColor: "#e5e7eb",
    borderRadius: "0.375rem",
    padding: "0.5rem",
    boxShadow: isFocused ? "0 0 0 2px #FDCA40" : "none",
    borderColor: isFocused ? "#FDCA40" : "transparent",
    "&:hover": {
      borderColor: "#e5e7eb",
    },
  }),
  menu: (base: any) => ({
    ...base,
    borderRadius: "0.375rem",
    boxShadow: "0 0px 0px rgba(0, 0, 0, 0)",
  }),
  option: (base: any, { isFocused, isSelected }: any) => ({
    ...base,
    backgroundColor: isSelected
      ? "#FDCA40"
      : isFocused
      ? "#EDCF70"
      : "white",
    color: isSelected ? "white" : "#374151",
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: "#EDCF70",
    borderRadius: "0.25rem",
    padding: "0.2rem",
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: "#374151",
    fontWeight: "bold",
    padding: "0.1rem",
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: "#374151",
    "&:hover": {
      backgroundColor: "#374151",
      color: "white",
    },
  }),
};
export default SelectField;
