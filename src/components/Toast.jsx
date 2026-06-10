import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext({
  showToast: () => {},
});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let bgColor = 'bg-theme-card border-theme-border';
          let textColor = 'text-theme-text';
          let Icon = Info;
          let iconColor = 'text-theme-primary';

          if (toast.type === 'success') {
            bgColor = 'bg-theme-success/10 border-theme-success/20';
            textColor = 'text-theme-success';
            Icon = CheckCircle;
            iconColor = 'text-theme-success';
          } else if (toast.type === 'error') {
            bgColor = 'bg-theme-error/10 border-theme-error/20';
            textColor = 'text-theme-error';
            Icon = AlertCircle;
            iconColor = 'text-theme-error';
          } else if (toast.type === 'warning') {
            bgColor = 'bg-theme-warning/10 border-theme-warning/20';
            textColor = 'text-theme-warning';
            Icon = AlertTriangle;
            iconColor = 'text-theme-warning';
          }

          return (
            <div
              key={toast.id}
              className={`flex items-start p-4 border rounded-xl shadow-lg transition-all duration-300 transform translate-y-0 opacity-100 pointer-events-auto ${bgColor} fade-in`}
              role="alert"
            >
              <div className="flex-shrink-0">
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${textColor}`}>{toast.message}</p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={() => removeToast(toast.id)}
                  className="inline-flex text-theme-text-sec hover:text-theme-text focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary rounded-md cursor-pointer"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
export default ToastContext;
