import React, { useState, useEffect } from 'react';
import { Mail, Send, UserPlus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { discoveryService } from '@/services/discoveryService';
import { Invitation, CreateInvitationData, INVITATION_TYPES } from '@/types/discovery';
import { toast } from 'react-hot-toast';

const InvitationsPage: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState<CreateInvitationData>({
    email: '',
    invitationType: 'staff_invitation',
    role: '',
    message: '',
    centerId: ''
  });

  // Load invitations
  const loadInvitations = async () => {
    setLoading(true);
    try {
      // This would typically load invitations for the current user
      // For now, we'll show a placeholder
      setInvitations([]);
    } catch (error) {
      console.error('Failed to load invitations:', error);
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  // Send invitation
  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      await discoveryService.sendInvitation(inviteForm);
      toast.success('Invitation sent successfully!');
      setShowInviteForm(false);
      setInviteForm({
        email: '',
        invitationType: 'staff_invitation',
        role: '',
        message: '',
        centerId: ''
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send invitation';
      toast.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

  // Load invitations on component mount
  useEffect(() => {
    loadInvitations();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'declined':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Service Invitations
          </h1>
          <p className="text-gray-600">
            Send and manage invitations to join your healthcare service network.
          </p>
        </div>

        {/* Send Invitation Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Send Invitation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showInviteForm ? (
              <Button onClick={() => setShowInviteForm(true)} className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Send New Invitation
              </Button>
            ) : (
              <form onSubmit={handleSendInvitation} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invitationType">Invitation Type *</Label>
                    <Select
                      value={inviteForm.invitationType}
                      onValueChange={(value) => setInviteForm({ ...inviteForm, invitationType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {INVITATION_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {inviteForm.invitationType === 'staff_invitation' && (
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={inviteForm.role}
                      onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                      placeholder="Doctor, Nurse, Staff, etc."
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="message">Personal Message</Label>
                  <Textarea
                    id="message"
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                    placeholder="Add a personal message to your invitation..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    disabled={sending}
                    className="flex items-center gap-2"
                  >
                    {sending ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowInviteForm(false)}
                    disabled={sending}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Invitations List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Sent Invitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading invitations...</p>
                </div>
              </div>
            ) : invitations.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Invitations Sent
                  </h3>
                  <p className="text-gray-600">
                    You haven't sent any invitations yet.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {invitation.email}
                        </h3>
                        <Badge className={getStatusColor(invitation.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(invitation.status)}
                            {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                          </div>
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-1">
                        {invitation.invitationType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        {invitation.role && ` • ${invitation.role}`}
                      </p>

                      {invitation.message && (
                        <p className="text-sm text-gray-500">
                          "{invitation.message}"
                        </p>
                      )}

                      <p className="text-xs text-gray-400 mt-2">
                        Sent {new Date(invitation.createdAt).toLocaleDateString()}
                        {invitation.expiresAt && (
                          <span> • Expires {new Date(invitation.expiresAt).toLocaleDateString()}</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvitationsPage;
