import React from "react";

export const Badge = ({ children, variant = "neutral", className = "" }) => {
  const variants = {
    neutral: "bg-gray-100 text-gray-700 border-gray-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    primary: "bg-indigo-50 text-indigo-700 border-indigo-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
