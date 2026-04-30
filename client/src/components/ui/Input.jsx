import React from "react";

export const Input = React.forwardRef(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || Math.random().toString(36).substr(2, 9);
    return (
      <div className={`space-y-1 ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`block w-full rounded-lg border bg-white px-4 py-2 text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 placeholder:text-gray-400 ${
            error ? "border-red-300 focus:border-red-500 focus:ring-red-500/40" : "border-gray-200"
          }`}
          {...props}
        />
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
