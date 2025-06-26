import React, { forwardRef } from "react";

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

const Modal = forwardRef<HTMLDialogElement, ModalProps>(
  ({ children, onClose }, ref) => {
    // Only call onClose if the user clicks the backdrop, not the dialog itself
    const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
      // Only close if the click is on the backdrop, not inside the dialog content
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    return (
      <dialog
        ref={ref}
        className="fixed inset-0 z-50 flex items-center justify-center p-0 m-0 border-0 outline-none"
        onClick={handleDialogClick}
        aria-modal="true"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          margin: 0,
          padding: 0,
          border: 0,
          background: "transparent",
          backdropFilter: "blur(1px)",
        }}
      >
        <div
          className="bg-neutral-700 rounded-lg shadow-lg relative"
          style={{
            // minWidth: "320px",
            // minHeight: "120px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
          <button
            type="button"
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
      </dialog>
    );
  }
);

export default Modal;
