"use client"
import { ThemeProvider } from "@/providers/theme-provider";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { ToastContainer } from "react-toastify";

export const Provider = ({ children }: { children: ReactNode }) => {
    return (
        <SessionProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                {children}
                <ToastContainer
                    position="top-right"
                    autoClose={2000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                />
            </ThemeProvider>
        </SessionProvider>
    );
};
