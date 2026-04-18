import React from 'react';
import { Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConnectionStatusProps {
  isConnected: boolean;
  isReconnecting?: boolean;
  error?: string | null;
  onReconnect?: () => void;
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isReconnecting = false,
  error = null,
  onReconnect,
  className = ''
}) => {
  const getStatusConfig = () => {
    if (isConnected) {
      return {
        icon: Wifi,
        text: 'Connected',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600'
      };
    } else if (isReconnecting) {
      return {
        icon: AlertCircle,
        text: 'Reconnecting...',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        iconColor: 'text-yellow-600'
      };
    } else {
      return {
        icon: WifiOff,
        text: 'Disconnected',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        iconColor: 'text-red-600'
      };
    }
  };

  const statusConfig = getStatusConfig();
  const Icon = statusConfig.icon;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
        <Icon className={`w-3 h-3 ${statusConfig.iconColor}`} />
        <span>{statusConfig.text}</span>
      </div>
      
      {error && (
        <div className="group relative">
          <AlertCircle className="w-4 h-4 text-red-500 cursor-help" />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            {error}
          </div>
        </div>
      )}
      
      {!isConnected && !isReconnecting && onReconnect && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReconnect}
          className="h-6 px-2 text-xs"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Reconnect
        </Button>
      )}
      
      {!isConnected && !isReconnecting && !onReconnect && (
        <div className="text-xs text-gray-500">
          Messages will still be sent via HTTP
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
