import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Shield, 
  Bell, 
  Plus, 
  X, 
  Building,
  Clock,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface PatientSharingPreferencesProps {
  patientId: string;
}

interface SharingPreferences {
  autoApproveTrusted: boolean;
  trustedCenters: string[];
  defaultAccessDurationDays: number;
  notifyOnAccess: boolean;
  requirePurposeExplanation: boolean;
  allowEmergencyAccess: boolean;
}

export function PatientSharingPreferences({ patientId }: PatientSharingPreferencesProps) {
  const [preferences, setPreferences] = useState<SharingPreferences>({
    autoApproveTrusted: false,
    trustedCenters: [],
    defaultAccessDurationDays: 30,
    notifyOnAccess: true,
    requirePurposeExplanation: true,
    allowEmergencyAccess: true
  });

  const [newTrustedCenter, setNewTrustedCenter] = useState('');
  const [availableCenters] = useState([
    { id: '1', name: 'City Medical Center' },
    { id: '2', name: 'General Hospital' },
    { id: '3', name: 'Specialist Clinic' },
    { id: '4', name: 'Emergency Care Center' }
  ]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load current preferences
    // In real implementation, this would fetch from API
    console.log('Loading preferences for patient:', patientId);
  }, [patientId]);

  const handlePreferenceChange = (key: keyof SharingPreferences, value: boolean | string[] | number) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addTrustedCenter = () => {
    if (newTrustedCenter && !preferences.trustedCenters.includes(newTrustedCenter)) {
      handlePreferenceChange('trustedCenters', [...preferences.trustedCenters, newTrustedCenter]);
      setNewTrustedCenter('');
      toast.success('Trusted center added successfully');
    }
  };

  const removeTrustedCenter = (centerId: string) => {
    handlePreferenceChange(
      'trustedCenters', 
      preferences.trustedCenters.filter(id => id !== centerId)
    );
    toast.success('Trusted center removed');
  };

  const savePreferences = async () => {
    setLoading(true);
    try {
      // In real implementation, this would save to API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Preferences saved successfully');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const getCenterName = (centerId: string) => {
    const center = availableCenters.find(c => c.id === centerId);
    return center?.name || centerId;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Medical Record Sharing Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto-approval settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Auto-approve trusted centers</Label>
                <p className="text-sm text-gray-600">
                  Automatically approve requests from centers you trust
                </p>
              </div>
              <Switch
                checked={preferences.autoApproveTrusted}
                onCheckedChange={(checked) => handlePreferenceChange('autoApproveTrusted', checked)}
              />
            </div>

            {/* Trusted Centers */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Trusted Centers</Label>
              <div className="flex gap-2">
                <Select value={newTrustedCenter} onValueChange={setNewTrustedCenter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a center to trust" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCenters
                      .filter(center => !preferences.trustedCenters.includes(center.id))
                      .map(center => (
                        <SelectItem key={center.id} value={center.id}>
                          {center.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button onClick={addTrustedCenter} disabled={!newTrustedCenter}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {preferences.trustedCenters.map(centerId => (
                  <Badge key={centerId} variant="secondary" className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {getCenterName(centerId)}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeTrustedCenter(centerId)}
                    />
                  </Badge>
                ))}
              </div>
              {preferences.trustedCenters.length === 0 && (
                <p className="text-sm text-gray-500">No trusted centers added yet</p>
              )}
            </div>
          </div>

          {/* Access Duration */}
          <div className="space-y-2">
            <Label className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Default Access Duration
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max="365"
                value={preferences.defaultAccessDurationDays}
                onChange={(e) => handlePreferenceChange('defaultAccessDurationDays', parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-gray-600">days</span>
            </div>
            <p className="text-sm text-gray-600">
              How long should centers have access to your records by default
            </p>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <Label className="text-base font-medium flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notification Preferences
            </Label>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notify when records are accessed</Label>
                  <p className="text-sm text-gray-600">
                    Get notified whenever someone views your medical records
                  </p>
                </div>
                <Switch
                  checked={preferences.notifyOnAccess}
                  onCheckedChange={(checked) => handlePreferenceChange('notifyOnAccess', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Require purpose explanation</Label>
                  <p className="text-sm text-gray-600">
                    Require centers to explain why they need access
                  </p>
                </div>
                <Switch
                  checked={preferences.requirePurposeExplanation}
                  onCheckedChange={(checked) => handlePreferenceChange('requirePurposeExplanation', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow emergency access</Label>
                  <p className="text-sm text-gray-600">
                    Allow emergency centers to access records without approval
                  </p>
                </div>
                <Switch
                  checked={preferences.allowEmergencyAccess}
                  onCheckedChange={(checked) => handlePreferenceChange('allowEmergencyAccess', checked)}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={savePreferences} disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              Your medical records are protected by strict privacy laws and encryption. 
              Only authorized healthcare providers can request access, and you have full 
              control over who can see your information.
            </p>
            <p>
              All access to your records is logged and can be reviewed at any time. 
              You can revoke access at any point, and records are automatically 
              removed when the access period expires.
            </p>
            <p>
              Emergency access allows critical care providers to access your records 
              in life-threatening situations, but this access is still logged and 
              subject to review.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
