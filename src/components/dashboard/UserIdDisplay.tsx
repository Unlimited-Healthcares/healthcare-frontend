
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface UserIdDisplayProps {
  id: string;
  label: string;
}

export const UserIdDisplay = ({ id, label }: UserIdDisplayProps) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(id || '');
    toast.success('ID copied to clipboard');
  };
  
  return (
    <div className="bg-healthcare-800 rounded-lg p-3 shadow-lg mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm text-healthcare-300 font-medium">{label}</h2>
          <div className="text-healthcare-100 font-mono text-lg font-bold tracking-wider">
            {id}
          </div>
        </div>
        <button 
          onClick={copyToClipboard}
          className="p-2 hover:bg-healthcare-700 rounded-full transition-colors"
          aria-label="Copy ID to clipboard"
        >
          <Copy className="h-4 w-4 text-healthcare-300" />
        </button>
      </div>
    </div>
  );
};
