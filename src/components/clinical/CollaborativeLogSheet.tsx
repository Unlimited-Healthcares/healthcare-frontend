import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, MessageSquare, Plus, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

interface LogEntry {
  id: string;
  content: string;
  authorRole: string;
  timestamp: string;
  isSystemGenerated: boolean;
  author?: {
    fullName: string;
    profile?: {
      displayName: string;
      avatarUrl?: string;
    };
  };
}

interface CollaborativeLogSheetProps {
  workspaceId: string;
  onAddEntry: (content: string) => Promise<void>;
  entries: LogEntry[];
}

export const CollaborativeLogSheet = ({ workspaceId, onAddEntry, entries }: CollaborativeLogSheetProps) => {
  const [newEntry, setNewEntry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newEntry.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onAddEntry(newEntry);
      setNewEntry('');
      toast.success('Note added to log sheet');
    } catch (error) {
      toast.error('Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-none shadow-premium rounded-[32px] overflow-hidden bg-white h-full flex flex-col">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tight">Collaborative Log Sheet</CardTitle>
            <CardDescription className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Ward round notes & clinical activity registry</CardDescription>
          </div>
          <Badge className="bg-blue-600 text-white border-none px-3 py-1 rounded-full font-bold text-[10px]">
            {entries.length} ENTRIES
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1 px-6 py-6">
          <div className="space-y-8 pb-10">
            {entries.length > 0 ? (
              entries.map((entry, index) => (
                <div key={entry.id} className="relative pl-8 border-l-2 border-slate-100">
                  {/* Timeline dot */}
                  <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-blue-500 shadow-sm" />
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 border-2 border-white shadow-sm">
                          <AvatarImage src={entry.author?.profile?.avatarUrl} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-[10px] font-black uppercase">
                            {entry.authorRole.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-black text-slate-900 uppercase tracking-tight">
                          {entry.author?.profile?.displayName || entry.author?.fullName || 'System'}
                        </span>
                        <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest border-slate-200 text-slate-400 py-0 h-4">
                          {entry.authorRole}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        <Clock className="w-3 h-3" />
                        {format(new Date(entry.timestamp), 'MMM dd, HH:mm')}
                      </div>
                    </div>

                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      entry.isSystemGenerated 
                        ? 'bg-slate-50 text-slate-500 italic font-medium border border-slate-100' 
                        : 'bg-white shadow-sm border border-slate-100 text-slate-700 font-bold'
                    }`}>
                      {entry.content}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-slate-200" />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">No entries yet</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Start the log by adding a clinical note</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 bg-slate-50/50 border-t border-slate-100">
          <div className="relative">
            <Textarea
              placeholder="Add clinical observation, ward round note or update..."
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              className="min-h-[100px] bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-blue-500/10 focus:border-blue-500 resize-none font-bold text-sm"
            />
            <div className="absolute bottom-3 right-3">
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || !newEntry.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-black uppercase text-xs px-6 h-10 shadow-lg shadow-blue-500/20"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Add Note
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
