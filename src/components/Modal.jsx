"use client";
import { useEffect } from "react";
import { FiX } from "react-icons/fi";

export default function Modal({ children, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/75 backdrop-blur-md z-50 animate-fadeIn p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div 
        className="relative bg-slate-900 border border-gold-500/30 rounded-3xl shadow-2xl p-6 md:p-8 text-white w-full max-w-xl md:max-w-3xl mx-4 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 border border-slate-700/80 hover:bg-slate-700 transition-colors cursor-pointer"
          aria-label="Close Modal"
        >
          <FiX size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}
