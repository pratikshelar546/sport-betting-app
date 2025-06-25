import React from "react";


interface labelTypes {
    className?: string,
    message: string,

}
const ErrorLabel = React.forwardRef<HTMLLabelElement, labelTypes>(
    ({ className, message }, ref) => {
        return <label className={`text-red-400 text-base font-medium` + className} ref={ref}>{message}</label>

    })

ErrorLabel.displayName = "ErrorLabel";

export { ErrorLabel };
