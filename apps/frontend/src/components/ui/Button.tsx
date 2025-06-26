"use client"
import classNames from "classnames";
import React from "react"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string,
    variant?: "primary" | "secoundary" | "outlined"
    size?: "sm" | "lg" | "md",
    disabled?: boolean,
    loading?: boolean,
    className?: string,

}


const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ label, className, variant = "primary", size = "md", disabled = false, ...props }, ref) => {

        const baseStyle = "px-6 py-2 rounded-md font-semibold cursor-pointer";

        const sizeStyle = {
            sm: "text-sm px-4 py-2",
            lg: "text-lg px-8 py-2",
            md: "text-base px-6 py-4"
        }

        const variantStyle = {
            primary: "bg-blue-500 hover:bg-blue-600 text-white",
            secoundary: "bg-white hover:bg-green-400 text-black",
            outlined: "border-2 border-netural-500 hover:bg-neutral-500 hover:text-white",
        }

        const combineStyle = classNames(
            baseStyle,
            sizeStyle[size],
            variantStyle[variant],
            {
                "cursor-not-allowed opacity-50": disabled
            },
            className
        )
        return (
            <button
                disabled={disabled}
                ref={ref}
                {...props}
                className={combineStyle}
            >
                {label}
            </button>
        )
    }
)

Button.displayName = "Button";
export { Button }