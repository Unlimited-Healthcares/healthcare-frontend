import React from 'react';
import { Video, Grid, List, Calendar, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface VideoConferenceHeaderProps {
  onViewChange: (view: 'list' | 'calendar' | 'grid') => void;
  currentView: 'list' | 'calendar' | 'grid';
  isConnected?: boolean;
}

export const VideoConferenceHeader: React.FC<VideoConferenceHeaderProps> = ({
  onViewChange,
  currentView,
  isConnected = false
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8 sm:mb-12 px-2 sm:px-0">
      {/* Left: Page Title with Connection Status */}
      <div className="grid grid-cols-[1fr_auto] items-center w-full gap-2 sm:gap-6 overflow-hidden">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-50 rounded-[1.5rem] border border-blue-100 shadow-sm group hover:scale-110 transition-transform duration-300">
              <Video className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight truncate sm:whitespace-normal">VIDEO CONFERENCES</h1>
              <p className="text-[10px] sm:text-sm font-semibold text-gray-500 uppercase tracking-widest mt-1 truncate sm:whitespace-normal">Manage scheduled & active meetings</p>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center self-start sm:self-center mt-2 sm:mt-0 shrink-0">
          <div className="flex flex-col items-end gap-1">
            <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border shrink-0 ${isConnected
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
              } shadow-sm backdrop-blur-sm transition-all duration-300`}>
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
              <span className="text-[9px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap">{isConnected ? 'LIVE CLOUD' : 'OFFLINE'}</span>
            </div>
            {!isConnected && (
              <span className="text-[10px] font-bold text-gray-400 font-mono tracking-tight text-right uppercase">
                {window.location.origin.startsWith('https://') && !window.location.host.includes('localhost') ? 'Web Browser' : 'App Core'} ➡ {import.meta.env.VITE_API_URL?.includes('render') ? 'Render Cloud' : 'Local/IP Node'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: View Toggle */}
      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md border border-gray-100 rounded-[1.5rem] sm:rounded-[2rem] p-1 self-start sm:self-auto shadow-sm overflow-hidden w-full sm:w-auto">
        <Button
          variant={currentView === 'grid' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('grid')}
          className={`h-10 sm:h-11 flex-1 sm:flex-none px-3 sm:px-6 rounded-[1.1rem] sm:rounded-[1.75rem] font-bold text-xs sm:text-sm transition-all duration-300 active:scale-95 ${currentView === 'grid'
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 border-0'
            : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
          <Grid className="h-4 w-4 sm:mr-2" />
          <span className="hidden xs:inline">Grid</span>
        </Button>
        <Button
          variant={currentView === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('list')}
          className={`h-10 sm:h-11 flex-1 sm:flex-none px-3 sm:px-6 rounded-[1.1rem] sm:rounded-[1.75rem] font-bold text-xs sm:text-sm transition-all duration-300 active:scale-95 ${currentView === 'list'
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 border-0'
            : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
          <List className="h-4 w-4 sm:mr-2" />
          <span className="hidden xs:inline">List</span>
        </Button>
        <Button
          variant={currentView === 'calendar' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('calendar')}
          className={`h-10 sm:h-11 flex-1 sm:flex-none px-3 sm:px-6 rounded-[1.1rem] sm:rounded-[1.75rem] font-bold text-xs sm:text-sm transition-all duration-300 active:scale-95 ${currentView === 'calendar'
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 border-0'
            : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
          <Calendar className="h-4 w-4 sm:mr-2" />
          <span className="hidden xs:inline">Calendar</span>
        </Button>
      </div>
    </div>
  );
};
