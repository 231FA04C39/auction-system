import React from "react";
import { Link } from "react-router";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  fullWidth = false,
  asNode = "button",
  to,
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm",
    secondary:
      "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 focus:ring-gray-200 shadow-sm",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-200",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`;

  if (asNode === "link" && to) {
    return (
      <Link to={to} className={combinedClassName} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClassName} disabled={disabled} {...props}>
      {children}
    </button>
  );
};
