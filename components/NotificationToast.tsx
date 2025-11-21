import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, X, Mail } from 'lucide-react';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  const icons = {
    success: <CheckCircle2 size={20} className="text-green-600" />,
    error: <XCircle size={20} className="text-red-600" />,
    info: <Mail size={20} className="text-blue-600" />
  };

  const colors = {
    success: 'bg-white border-green-100',
    error: 'bg-white border-red-100',
    info: 'bg-white border-blue-100'
  };

  const backgrounds = {
    success: 'bg-green-100',
    error: 'bg-red-100',
    info: 'bg-blue-100'
  };

  const titles = {
    success: 'Success',
    error: 'Error',
    info: 'Notification'
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-5 fade-in duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border ${colors[notification.type]} min-w-[300px]`}>
        <div className={`${backgrounds[notification.type]} p-2 rounded-full shrink-0`}>
          {icons[notification.type]}
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm text-slate-800">{titles[notification.type]}</p>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">{notification.message}</p>
        </div>
        <button 
          onClick={onClose} 
          className="ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;