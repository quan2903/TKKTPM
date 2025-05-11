interface InputFieldProps {
  label: string;
  type: string | number;
  placeholder: string;
  value: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  customClass?: string; 
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: { value: string; label: string }[]; // Thêm thuộc tính options
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  placeholder,
  value,
  name,
  required = false,
  disabled = false,
  style,
  customClass = "", 
  options,
  onChange,
}) => {
  // Render select nếu có options, nếu không sẽ render input
  const renderInput = () => {
    if (options) {
      return (
        <select
          name={name}
          value={value}
          required={required}
          disabled={disabled}
          onChange={onChange}
          className={`px-8 py-0 w-full text-2xl bg-white rounded-xl border-[2.5px] border-neutral-300 h-[40px] text-black-900 placeholder:text-gray-400 max-sm:text-xl max-sm:h-[70px] focus:outline-none focus:border-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${customClass}`}
          style={style}
        >
          <option value="" disabled>
            {placeholder || "Chọn một tùy chọn"}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }
    
    return (
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        required={required}
        disabled={disabled}
        onChange={onChange}
        className={`px-8 py-0 w-full text-2xl bg-white rounded-xl border-[2.5px] border-neutral-300 h-[40px] text-black-900 placeholder:text-gray-400 max-sm:text-xl max-sm:h-[70px] focus:outline-none focus:border-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${customClass}`}
        style={style}
      />
    );
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[600px] mx-auto mb-6" style={style}>
      <label className="self-start mb-2 text-xl text-black max-sm:text-xl">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
    </div>
  );
};
