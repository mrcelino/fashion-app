import { useEffect, FC } from "react";

export type ToastType = "success" | "error";

 const Toast: FC<{ message: string; type: ToastType; onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center gap-3 max-w-xs rounded-lg px-4 py-3 shadow-lg text-white animate-slideIn`}
      role="alert"
      style={{
        backgroundColor: type === "success" ? "#22c55e" : "#ef4444",
      }}
    >
      {type === "success" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span className="flex-grow">{message}</span>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 transition"
        aria-label="Close notification"
      >
        ✕
      </button>

      <style jsx>{`
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateX(100%);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;