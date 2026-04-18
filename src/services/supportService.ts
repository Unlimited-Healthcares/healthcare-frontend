import apiClient from './apiClient';

export enum SupportTicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface SupportTicketDto {
  name: string;
  email: string;
  subject: string;
  description: string;
  priority?: SupportTicketPriority;
  metadata?: Record<string, any>;
}

export const supportService = {
  createTicket: async (ticketDto: SupportTicketDto) => {
    return apiClient.post('/support/ticket', ticketDto);
  },

  getMyTickets: async () => {
    return apiClient.get('/support/my-tickets');
  }
};
