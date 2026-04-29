import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CollaborativeLogSheet } from './CollaborativeLogSheet';
import { ClinicalDocumentManager } from './ClinicalDocumentManager';
import { RealTimeChat } from '@/components/chat/RealTimeChat';
import { FilesManagement } from '@/components/dashboard/FilesManagement';
import { DicomViewer } from '@/components/dashboard/DicomViewer';
import { workspaceService } from '@/services/workspaceService';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  FileText, 
  Activity, 
  ClipboardList, 
  Layers, 
  ChevronRight,
  ShieldCheck,
  User as UserIcon,
  Calendar,
  Video
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { discoveryService } from '@/services/discoveryService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Search as SearchIcon } from 'lucide-react';

interface CaseWorkspaceProps {
  workspaceId: string;
}

export const CaseWorkspace = ({ workspaceId }: CaseWorkspaceProps) => {
  const [workspace, setWorkspace] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      setIsLoading(true);
      try {
        const [wsData, logsData] = await Promise.all([
          workspaceService.getWorkspace(workspaceId),
          workspaceService.getLogs(workspaceId)
        ]);
        setWorkspace(wsData);
        setLogs(logsData);
      } catch (error) {
        console.error("Failed to fetch workspace:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (workspaceId) {
      fetchWorkspaceData();
    }
  }, [workspaceId]);

  const handleAddLogEntry = async (content: string) => {
    try {
      const newEntry = await workspaceService.addLogEntry(workspaceId, content);
      setLogs(prev => [newEntry, ...prev]);
    } catch (error) {
      console.error("Error adding log entry:", error);
      throw error;
    }
  };

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await discoveryService.searchUsers({
        search: searchQuery,
        limit: 5
      });
      setSearchResults(response.users || []);
    } catch (error) {
      toast.error("Failed to search for users");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddParticipant = async (userId: string) => {
    setIsInviting(true);
    try {
      await workspaceService.addParticipant(workspaceId, userId);
      toast.success("Participant added successfully");
      setShowInviteModal(false);
      setSearchQuery('');
      setSearchResults([]);
      // Refresh workspace to show new participants
      const wsData = await workspaceService.getWorkspace(workspaceId);
      setWorkspace(wsData);
    } catch (error) {
      toast.error("Failed to add participant");
    } finally {
      setIsInviting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-[40px]" />
        <Skeleton className="h-[600px] w-full rounded-[40px]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full max-h-[calc(100dvh-120px)]">
      {/* Workspace Header */}
      <div className="bg-white rounded-[40px] p-8 shadow-premium border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Activity size={120} className="text-blue-600" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-2xl">
                <ShieldCheck className="text-white w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">Clinical Workspace</span>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">ID: {workspace.id.substring(0, 8)}</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight">{workspace.title}</h1>
            <p className="text-slate-500 font-bold text-sm md:text-base leading-relaxed max-w-2xl">{workspace.description}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center gap-4">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <UserIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Patient</p>
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{workspace.patient?.profile?.displayName || 'Patient Record'}</p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center gap-4">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Initialized</p>
                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{format(new Date(workspace.createdAt), 'MMM dd, yyyy')}</p>
              </div>
            </div>

            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-[32px] h-auto px-8 py-4 flex flex-col items-center justify-center gap-2 shadow-xl shadow-blue-100 border-none transition-all hover:scale-105 active:scale-95"
              onClick={() => navigate(`/clinical/teleconsult/${workspace.id}`)}
            >
              <Video className="w-6 h-6" />
              <span className="text-[9px] font-black uppercase tracking-widest leading-none">Live Video Session</span>
            </Button>

            <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="bg-white hover:bg-slate-50 text-slate-900 rounded-[32px] h-auto px-8 py-4 flex flex-col items-center justify-center gap-2 shadow-sm border-2 border-slate-100 transition-all hover:scale-105 active:scale-95"
                >
                  <UserPlus className="w-6 h-6 text-slate-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest leading-none">Add Provider</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white rounded-[40px] border-none shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="bg-slate-900 p-8 text-white">
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight">Collaborate</DialogTitle>
                  <DialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Invite multidisciplinary providers to this case</DialogDescription>
                </DialogHeader>
                <div className="p-8 space-y-6">
                  <div className="relative">
                    <Input 
                      placeholder="Search by name, role or ID..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                      className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-sm shadow-sm pl-12"
                    />
                    <SearchIcon className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                    <Button 
                      onClick={handleSearchUsers}
                      disabled={isSearching}
                      className="absolute right-2 top-2 h-10 bg-blue-600 rounded-xl px-4 font-black uppercase text-[10px] tracking-widest"
                    >
                      Search
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {searchResults.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                            <AvatarImage src={u.avatar} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">{u.displayName?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-black text-slate-900 uppercase">{u.displayName}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.specialty || u.roles?.[0]}</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleAddParticipant(u.id)}
                          disabled={isInviting}
                          variant="ghost"
                          className="rounded-xl h-9 px-4 font-black uppercase text-[10px] tracking-widest bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                    {searchResults.length === 0 && searchQuery && !isSearching && (
                      <div className="text-center py-8 opacity-40">
                        <p className="text-xs font-black uppercase tracking-widest">No providers found</p>
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="bg-white/80 backdrop-blur-md p-1.5 rounded-[28px] shadow-sm border border-slate-100 w-fit mb-6">
          <TabsTrigger value="chat" className="rounded-2xl px-6 gap-2 font-black uppercase text-[11px] data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <MessageSquare className="w-4 h-4" /> Unified Chat
          </TabsTrigger>
          <TabsTrigger value="logs" className="rounded-2xl px-6 gap-2 font-black uppercase text-[11px] data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <ClipboardList className="w-4 h-4" /> Log Sheet
          </TabsTrigger>
          <TabsTrigger value="files" className="rounded-2xl px-6 gap-2 font-black uppercase text-[11px] data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4" /> Medical Files
          </TabsTrigger>
          <TabsTrigger value="dicom" className="rounded-2xl px-6 gap-2 font-black uppercase text-[11px] data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Layers className="w-4 h-4" /> DICOM Viewer
          </TabsTrigger>
          <TabsTrigger value="documents" className="rounded-2xl px-6 gap-2 font-black uppercase text-[11px] data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4" /> Documents
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0 bg-white rounded-[40px] shadow-premium border border-slate-100 overflow-hidden relative">
          <TabsContent value="chat" className="m-0 h-full">
            <RealTimeChat roomId={workspace.chatRoomId} centerId={workspace.centerId || ''} />
          </TabsContent>

          <TabsContent value="logs" className="m-0 h-full">
            <CollaborativeLogSheet 
              workspaceId={workspaceId} 
              entries={logs} 
              onAddEntry={handleAddLogEntry} 
            />
          </TabsContent>

          <TabsContent value="files" className="m-0 h-full">
            <div className="p-8 h-full overflow-y-auto custom-scrollbar">
              <FilesManagement centerId={workspace.centerId} patientId={workspace.patientId} />
            </div>
          </TabsContent>

          <TabsContent value="dicom" className="m-0 h-full">
            <div className="h-full">
              <DicomViewer />
            </div>
          </TabsContent>

          <TabsContent value="documents" className="m-0 h-full">
            <ClinicalDocumentManager workspaceId={workspaceId} patientId={workspace.patientId} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
