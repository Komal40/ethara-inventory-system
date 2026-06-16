import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // Close the modal when the user presses the Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Prevent background scrolling when modal is active
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
      {/* Backdrop blur/tint layer */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Box Area */}
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-md w-full relative z-10 transform transition-all p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="text-sm text-gray-600 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};