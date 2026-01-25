
import React, { useEffect } from 'react';

interface ApiErrorNotificationProps {
  message: string;
  onClose: () => void;
}

export const ApiErrorNotification: React.FC<ApiErrorNotificationProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // 5초 후 자동 닫기

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="absolute bottom-4 left-4 bg-red-600 text-white p-4 rounded-lg z-50 max-w-sm font-mono animate-[fadein_0.5s_ease-in-out]">
      <div className="flex justify-between items-start">
          <div>
              <h4 className="font-bold">AI 오류</h4>
              <p className="text-sm">{message}</p>
          </div>
          <button onClick={onClose} className="ml-4 text-xl font-bold leading-none">&times;</button>
      </div>
       <style>{`
        @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};
