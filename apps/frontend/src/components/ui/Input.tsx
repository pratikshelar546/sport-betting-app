"use client";
import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ type, label, style, className, placeholder, onChange, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        <label>{label}</label>
        <input
          name={label}
          className={`px-4 py-3 w-full border-neutral-500 border rounded-md outline-none ${style ? style : ""} ${className ? className : ""}`}
          type={type}
          placeholder={placeholder}
          onChange={onChange}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
