import React, { useState } from 'react';
import { X, Video, Calendar, Lock, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CreateVideoConferenceDto } from '@/types/videoConferences';

interface CreateVideoConferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateVideoConferenceDto) => void;
  loading?: boolean;
  initialData?: any; // The conference being edited
}

export const CreateVideoConferenceModal: React.FC<CreateVideoConferenceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  initialData
}) => {
  const [formData, setFormData] = useState<CreateVideoConferenceDto>({
    title: '',
    description: '',
    type: 'consultation',
    maxParticipants: 10,
    isRecordingEnabled: false,
    meetingPassword: '',
    waitingRoomEnabled: true,
    autoAdmitParticipants: false,
    muteParticipantsOnEntry: true,
    provider: 'webrtc'
  });

  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration] = useState(60);

  // Initialize form when editing
  React.useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        type: initialData.type || 'consultation',
        maxParticipants: initialData.maxParticipants || 10,
        isRecordingEnabled: initialData.isRecordingEnabled ?? false,
        meetingPassword: initialData.meetingPassword || '',
        waitingRoomEnabled: initialData.waitingRoomEnabled ?? true,
        autoAdmitParticipants: initialData.autoAdmitParticipants ?? false,
        muteParticipantsOnEntry: initialData.muteParticipantsOnEntry ?? true,
        provider: initialData.provider || 'webrtc'
      });

      if (initialData.scheduledStartTime) {
        const start = new Date(initialData.scheduledStartTime);
        setScheduledDate(start.toISOString().split('T')[0]);
        setScheduledTime(start.toTimeString().split(' ')[0].slice(0, 5));

        if (initialData.scheduledEndTime) {
          const end = new Date(initialData.scheduledEndTime);
          const diffMs = end.getTime() - start.getTime();
          setDuration(Math.round(diffMs / 60000));
        }
      }
    } else if (!initialData && isOpen) {
      // Reset for new conference
      setFormData({
        title: '',
        description: '',
        type: 'consultation',
        maxParticipants: 10,
        isRecordingEnabled: false,
        meetingPassword: '',
        waitingRoomEnabled: true,
        autoAdmitParticipants: false,
        muteParticipantsOnEntry: true,
        provider: 'webrtc'
      });
      setScheduledDate('');
      setScheduledTime('');
      setDuration(60);
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return;
    }

    const scheduledStartTime = scheduledDate && scheduledTime
      ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
      : undefined;

    const scheduledEndTime = scheduledStartTime
      ? new Date(new Date(scheduledStartTime).getTime() + duration * 60000).toISOString()
      : undefined;

    const submissionData = {
      ...formData,
      title: formData.title.trim(),
      scheduledStartTime,
      scheduledEndTime
    };

    console.log('Creating conference with data:', submissionData);
    onSubmit(submissionData);
  };

  const handleInputChange = (field: keyof CreateVideoConferenceDto, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <Video className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {initialData ? 'Edit Conference' : 'Create Conference'}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Basic Information */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 flex items-center gap-2">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              Basic Information
            </h3>

            <div>
              <Label htmlFor="title">Conference Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter conference title"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter conference description"
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Conference Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="group_session">Group Session</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                    <SelectItem value="webinar">Webinar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.maxParticipants}
                  onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              Scheduling
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="scheduledDate">Date</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="scheduledTime">Start Time</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  max="480"
                  step="15"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Security & Settings */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 flex items-center gap-2">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
              Security & Settings
            </h3>

            <div>
              <Label htmlFor="meetingPassword">Meeting Password (Optional)</Label>
              <Input
                id="meetingPassword"
                value={formData.meetingPassword}
                onChange={(e) => handleInputChange('meetingPassword', e.target.value)}
                placeholder="Enter password for the meeting"
                className="mt-1"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="waitingRoom">Waiting Room</Label>
                  <p className="text-sm text-gray-500">Participants must wait for host approval</p>
                </div>
                <Switch
                  id="waitingRoom"
                  checked={formData.waitingRoomEnabled}
                  onCheckedChange={(checked) => handleInputChange('waitingRoomEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoAdmit">Auto Admit Participants</Label>
                  <p className="text-sm text-gray-500">Automatically admit participants when they join</p>
                </div>
                <Switch
                  id="autoAdmit"
                  checked={formData.autoAdmitParticipants}
                  onCheckedChange={(checked) => handleInputChange('autoAdmitParticipants', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="muteOnEntry">Mute on Entry</Label>
                  <p className="text-sm text-gray-500">Mute all participants when they join</p>
                </div>
                <Switch
                  id="muteOnEntry"
                  checked={formData.muteParticipantsOnEntry}
                  onCheckedChange={(checked) => handleInputChange('muteParticipantsOnEntry', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="recording">Enable Recording</Label>
                  <p className="text-sm text-gray-500">Allow recording of the conference</p>
                </div>
                <Switch
                  id="recording"
                  checked={formData.isRecordingEnabled}
                  onCheckedChange={(checked) => handleInputChange('isRecordingEnabled', checked)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              {loading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Conference' : 'Create Conference')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
