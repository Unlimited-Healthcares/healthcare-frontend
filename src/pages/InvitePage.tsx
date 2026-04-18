import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { discoveryService } from '@/services/discoveryService';
import { Invitation } from '@/types/discovery';
import { toast } from 'react-hot-toast';
import { logger, generateCorrelationId } from '@/utils/logger';

const InvitePage: React.FC = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [declineReason, setDeclineReason] = useState('');

  const correlationId = useMemo(() => generateCorrelationId(), []);

  useEffect(() => {
    const load = async () => {
      if (!token) {
        toast.error('Invalid invitation link');
        navigate('/auth');
        return;
      }
      try {
        logger.info('INVITES:UI_LOAD', { correlationId, token: token.slice(0, 6) + '...' });
        const inv = await discoveryService.getInvitation(token);
        setInvitation(inv);
      } catch (e) {
        logger.error('INVITES:UI_LOAD_ERR', { correlationId, message: (e as Error)?.message });
        toast.error('Failed to load invitation');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, correlationId, navigate]);

  const handleAccept = async () => {
    if (!token) return;
    if (!name.trim() || !password.trim()) {
      toast.error('Name and password are required');
      return;
    }
    setSubmitting(true);
    try {
      logger.info('INVITES:UI_ACCEPT', { correlationId });
      await discoveryService.acceptInvitation(token, { name: name.trim(), password: password.trim(), phone: phone.trim() || undefined });
      toast.success('Invitation accepted');
      logger.info('INVITES:UI_ACCEPT_OK', { correlationId });
      const targetCenterId = (invitation as any)?.centerId as string | undefined;
      if (targetCenterId) {
        navigate(`/centers/${targetCenterId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (e) {
      logger.error('INVITES:UI_ACCEPT_ERR', { correlationId, message: (e as Error)?.message });
      toast.error((e as Error)?.message || 'Failed to accept invitation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      logger.warn('INVITES:UI_DECLINE', { correlationId });
      await discoveryService.declineInvitation(token, declineReason.trim() || undefined);
      toast.success('Invitation declined');
      navigate('/auth');
    } catch (e) {
      logger.error('INVITES:UI_DECLINE_ERR', { correlationId, message: (e as Error)?.message });
      toast.error((e as Error)?.message || 'Failed to decline invitation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading invitation...</div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Invitation not found or expired</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-2">You're invited to join as staff</h1>
        <p className="text-gray-600 mb-6">Invitation for {invitation.email}</p>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 555 5555" />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" type="button" disabled={submitting} onClick={handleDecline}>Decline</Button>
              <Button type="button" disabled={submitting} onClick={handleAccept}>Accept Invitation</Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Label htmlFor="reason">Decline reason (optional)</Label>
          <Textarea id="reason" rows={3} value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} placeholder="Reason for declining..." />
        </div>
      </div>
    </div>
  );
};

export default InvitePage;


