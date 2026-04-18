import apiClient from './apiClient';
import { formatDistanceToNow } from 'date-fns';

export interface Post {
  id: string;
  author: {
    name: string;
    role: string;
    avatar: string;
    isVerified?: boolean;
    publicId?: string;
  };
  content: string;
  image?: string;
  video?: string;
  tags: string[];
  likes: number;
  comments: number;
  timestamp: string;
  type: 'discussion' | 'article' | 'event';
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface SuggestedMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  category: string;
  location?: string;
}

const mapPost = (post: any): Post => {
  const authorProfile = post.author?.profile;
  const authorName = authorProfile
    ? `${authorProfile.firstName} ${authorProfile.lastName}`
    : (post.author?.name || 'Healthcare Member');
  const authorRole = authorProfile?.specialization || post.author?.roles?.[0] || 'Member';

  return {
    id: post.id,
    content: post.content,
    image: post.image,
    video: post.video,
    tags: Array.isArray(post.tags) ? post.tags : (post.tags ? post.tags.split(',') : []),
    likes: post.likes || 0,
    comments: post.comments || 0,
    timestamp: post.createdAt ? `${formatDistanceToNow(new Date(post.createdAt))} ago` : 'just now',
    type: post.type || 'discussion',
    author: {
      name: authorName,
      role: authorRole,
      avatar: authorProfile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.id || post.id}`,
      isVerified: post.author?.kycStatus === 'APPROVED' || authorProfile?.isVerified,
      publicId: post.author?.displayId
    }
  };
};

export const communityService = {
  getPosts: async (category: string = 'all', page: number = 1): Promise<Post[]> => {
    try {
      const response = await apiClient.get(`/community/posts?category=${category}&page=${page}`);
      const posts = response.data.data || response.data || [];
      return posts.map(mapPost);
    } catch (error) {
      return [];
    }
  },

  createPost: async (postData: Omit<Partial<Post>, 'video' | 'image'> & { video?: File; image?: File }): Promise<Post> => {
    const hasFile = postData.video instanceof File || postData.image instanceof File;
    if (hasFile) {
      const form = new FormData();
      if (postData.content) form.append('content', postData.content);
      if (postData.type) form.append('type', postData.type);
      if (postData.tags) form.append('tags', JSON.stringify(postData.tags));
      if (postData.video instanceof File) form.append('video', postData.video);
      if (postData.image instanceof File) form.append('image', postData.image);
      const response = await apiClient.post('/community/posts', form);
      return mapPost(response.data);
    }
    const response = await apiClient.post('/community/posts', postData);
    return mapPost(response.data);
  },

  likePost: async (postId: string): Promise<void> => {
    await apiClient.post(`/community/posts/${postId}/like`);
  },

  getSuggestedMembers: async (): Promise<SuggestedMember[]> => {
    try {
      const response = await apiClient.get('/community/suggested-members');
      const members = response.data.data || response.data || [];
      return members.map((m: any) => ({
        id: m.id,
        name: m.profile ? `${m.profile.firstName} ${m.profile.lastName}` : 'Healthcare Provider',
        role: m.profile?.specialization || m.roles?.[0] || 'Member',
        avatar: m.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.id}`
      }));
    } catch (e) {
      return [];
    }
  },

  getUpcomingEvents: async (): Promise<CommunityEvent[]> => {
    try {
      const response = await apiClient.get('/community/upcoming-events');
      return response.data.data || response.data || [];
    } catch (e) {
      return [];
    }
  }
};

export default communityService;
