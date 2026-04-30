import React from "react";

export const Card = ({ children, className = "", hoverable = false, padding = "p-6" }) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200 ease-in-out ${
        hoverable ? "hover:shadow-md hover:-translate-y-0.5" : ""
      } ${padding} ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, className = "" }) => (
  <div className={`mb-4 ${className}`}>
    {title && <h3 className="text-lg font-semibold tracking-tight text-gray-900">{title}</h3>}
    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
  </div>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`${className}`}>{children}</div>
);
