'use client';

import { useEffect } from 'react';
import { CheckCircle, X, ShoppingCart } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'error':
        return <X className="text-red-500" size={20} />;
      case 'info':
        return <ShoppingCart className="text-blue-500" size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 animate-[slideInRight_0.3s_ease-out] max-w-sm">
      <div className={`
        flex items-center space-x-3 p-4 rounded-lg border shadow-lg
        ${getToastStyles()}
      `}>
        {getIcon()}
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}