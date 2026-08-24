import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900 bg-opacity-50 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow">
        <div className="flex items-center justify-between rounded-t border-b border-gray-200 p-4">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close modal</span>
          </button>
        </div>
        <div className="p-6 space-y-6">{children}</div>
      </div>
    </div>
  );
};
