import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Plus,
  Search,
  TrendingUp,
  Users,
  Calendar,
  Bookmark,
  Award,
  Filter,
  Image as ImageIcon,
  Video,
  FileText,
  MapPin,
  Clock,
  Check,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { communityService, Post, SuggestedMember, CommunityEvent } from '@/services/communityService';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const TRENDING_TAGS = ['HeartHealth', 'MentalHealthAwareness', 'NutritionTips', 'COVID19Update', 'WellnessWednesday'];

const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestedMembers, setSuggestedMembers] = useState<SuggestedMember[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [following, setFollowing] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<'discussion' | 'article' | 'event'>('discussion');
  const [newPostVideo, setNewPostVideo] = useState<File | null>(null);
  const [newPostVideoPreview, setNewPostVideoPreview] = useState<string | null>(null);
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  useEffect(() => {
    fetchSidebarData();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await communityService.getPosts(activeTab);
      setPosts(data);
    } catch (error) {
      toast.error('Failed to load community content');
    } finally {
      setLoading(false);
    }
  };

  const fetchSidebarData = async () => {
    setSidebarLoading(true);
    try {
      const [members, events] = await Promise.all([
        communityService.getSuggestedMembers(),
        communityService.getUpcomingEvents()
      ]);
      setSuggestedMembers(members);
      setUpcomingEvents(events);
    } catch (e) {
      console.error('Sidebar data fetch failed');
    } finally {
      setSidebarLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      toast.error('Please enter some content');
      return;
    }

    setIsPosting(true);
    try {
      const newPost = await communityService.createPost({
        content: newPostContent,
        type: newPostType,
        tags: ['General'],
        video: newPostVideo ?? undefined,
        image: newPostImage ?? undefined,
      } as Parameters<typeof communityService.createPost>[0]);

      setPosts(prev => [newPost, ...prev]);
      setIsCreateModalOpen(false);
      setNewPostContent('');
      setNewPostVideo(null);
      setNewPostVideoPreview(null);
      setNewPostImage(null);
      toast.success('Post created successfully!');
    } catch (error) {
      toast.error('Failed to create post. Please check file size.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (likedPosts.includes(postId)) return;

    setLikedPosts(prev => [...prev, postId]);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));

    try {
      await communityService.likePost(postId);
    } catch (error) {
      setLikedPosts(prev => prev.filter(id => id !== postId));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes - 1 } : p));
    }
  };

  const handleFollow = (memberId: string) => {
    if (following.includes(memberId)) {
      setFollowing(prev => prev.filter(id => id !== memberId));
    } else {
      setFollowing(prev => [...prev, memberId]);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50/50">
        {/* Community Hero Section */}
        <div className="bg-white border-b border-slate-200 pt-8 pb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-50 rounded-full -ml-32 -mb-32 blur-3xl opacity-60"></div>

          <div className="max-w-6xl mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                    <Heart className="w-6 h-6 fill-current" />
                  </div>
                  Health Community
                </h1>
                <p className="text-slate-500 mt-2 text-lg">Connect, share experiences, and learn from healthcare experts.</p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="rounded-full bg-slate-900 hover:bg-slate-800 text-white px-6 shadow-xl shadow-slate-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search discussions, articles, or members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-12 bg-slate-50 border-none rounded-2xl focus-visible:ring-rose-500 focus-visible:ring-offset-2"
                />
              </div>
              <div className="w-full md:w-auto overflow-x-auto no-scrollbar pb-1">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                  <TabsList className="bg-slate-50 p-1 rounded-2xl h-12 border border-slate-200 flex min-w-max">
                    <TabsTrigger value="all" className="rounded-xl px-4 data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm">All</TabsTrigger>
                    <TabsTrigger value="discussion" className="rounded-xl px-4 data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm">Discussions</TabsTrigger>
                    <TabsTrigger value="article" className="rounded-xl px-4 data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm">Articles</TabsTrigger>
                    <TabsTrigger value="event" className="rounded-xl px-4 data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm">Events</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white group transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Avatar className="w-12 h-12 ring-2 ring-slate-100">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'current'}`} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-slate-50 rounded-2xl p-4 text-slate-400 group-hover:bg-slate-100 transition-colors cursor-pointer mb-4"
                      >
                        What's on your mind regarding health today?
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 sm:gap-4">
                          <Button
                            variant="ghost" size="sm"
                            className="text-slate-500 hover:text-blue-600 rounded-full px-3"
                            onClick={() => { setIsCreateModalOpen(true); }}
                          >
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Image
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            className="text-slate-500 hover:text-purple-600 rounded-full px-3"
                            onClick={() => setIsCreateModalOpen(true)}
                          >
                            <Video className="w-4 h-4 mr-2" />
                            Video
                          </Button>
                          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-emerald-600 rounded-full px-3">
                            <FileText className="w-4 h-4 mr-2" />
                            File
                          </Button>
                        </div>
                        <Button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="rounded-full bg-rose-500 hover:bg-rose-600 text-white px-6"
                        >Post</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Card key={i} className="rounded-3xl h-64 animate-pulse bg-slate-100 border-none" />)}
                </div>
              ) : filteredPosts.map((post) => (
                <Card key={post.id} className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
                  <CardHeader className="p-4 sm:p-6 flex flex-row items-center gap-4 space-y-0">
                    <Avatar className="w-12 h-12 ring-2 ring-slate-50">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <CardTitle className="text-base font-bold truncate">{post.author.name}</CardTitle>
                        {post.author.isVerified && <Award className="w-4 h-4 text-blue-500 fill-blue-500" />}
                      </div>
                      <CardDescription className="flex items-center gap-2 text-xs">
                        <span className="truncate max-w-[150px]">{post.author.role}</span>
                        <span>•</span>
                        <span>{post.timestamp}</span>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:px-6 sm:pb-4 pt-0">
                    <p className="text-slate-700 leading-relaxed mb-4">{post.content}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 border-none px-3 py-1 rounded-full transition-colors font-medium">#{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="p-2 sm:p-4 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className={cn(
                          "rounded-full px-3 transition-colors",
                          likedPosts.includes(post.id) ? "text-rose-600 bg-rose-50" : "text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                        )}
                      >
                        <Heart className={cn("w-4 h-4 mr-2", likedPosts.includes(post.id) && "fill-current")} />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-full px-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {post.comments}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-4 space-y-8">
              <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="p-6 pb-2">
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-rose-500">
                      <TrendingUp className="w-5 h-5" />
                      Trending Tags
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {TRENDING_TAGS.map(tag => (
                      <Badge key={tag} variant="outline" className="rounded-full px-3 py-1 border-slate-100 hover:bg-rose-50 hover:text-rose-600 cursor-pointer">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="p-6 pb-2">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-500">
                    <Users className="w-5 h-5" />
                    Suggested Members
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-2 space-y-4">
                  {sidebarLoading ? [1, 2].map(i => <div key={i} className="h-10 bg-slate-50 rounded-xl animate-pulse" />) : suggestedMembers.map((member, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>M</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold leading-none mb-1">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.role}</p>
                        </div>
                      </div>
                      <Button size="sm" variant={following.includes(member.id) ? "secondary" : "outline"} onClick={() => handleFollow(member.id)} className="rounded-full h-8">
                        {following.includes(member.id) ? <Check className="w-3 h-3" /> : 'Follow'}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

            </div>
          </div>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) { setNewPostVideo(null); setNewPostVideoPreview(null); setNewPostImage(null); }
        }}>
          <DialogContent className="sm:max-w-[520px] rounded-3xl p-0 border-none shadow-2xl overflow-y-auto max-h-[92vh] my-auto dialog-content-scroll">
            <DialogHeader className="p-6 bg-slate-50 border-b">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-500" />
                Create New Post
              </DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-4">
              <Select value={newPostType} onValueChange={(v: any) => setNewPostType(v)}>
                <SelectTrigger className="w-full rounded-xl bg-slate-100 border-none h-12">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discussion">Discussion</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                </SelectContent>
              </Select>

              <Textarea
                placeholder="What's on your mind?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[120px] rounded-2xl bg-slate-50 border-none resize-none p-4"
              />

              {/* Media Upload Row */}
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Add Media</p>
                <div className="flex gap-2">
                  {/* Image Upload */}
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setNewPostImage(file);
                      }}
                    />
                    <div className={`flex items-center justify-center gap-2 rounded-xl border-2 border-dashed p-3 text-sm font-medium transition-colors ${newPostImage ? 'border-blue-400 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500'
                      }`}>
                      <ImageIcon className="w-4 h-4" />
                      {newPostImage ? newPostImage.name.slice(0, 14) + '…' : 'Photo'}
                    </div>
                  </label>

                  {/* Video Upload */}
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 50 * 1024 * 1024) {
                          toast.error('Video must be under 50 MB');
                          return;
                        }
                        setNewPostVideo(file);
                        setNewPostVideoPreview(URL.createObjectURL(file));
                      }}
                    />
                    <div className={`flex items-center justify-center gap-2 rounded-xl border-2 border-dashed p-3 text-sm font-medium transition-colors ${newPostVideo ? 'border-purple-400 bg-purple-50 text-purple-600' : 'border-slate-200 text-slate-400 hover:border-purple-300 hover:text-purple-500'
                      }`}>
                      <Video className="w-4 h-4" />
                      {newPostVideo ? newPostVideo.name.slice(0, 14) + '…' : 'Video'}
                    </div>
                  </label>
                </div>

                {/* Video Preview */}
                {newPostVideoPreview && (
                  <div className="relative rounded-2xl overflow-hidden bg-black">
                    <video
                      src={newPostVideoPreview}
                      controls
                      className="w-full max-h-48 object-contain"
                    />
                    <button
                      onClick={() => { setNewPostVideo(null); setNewPostVideoPreview(null); }}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-black/80"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Image Preview */}
                {newPostImage && !newPostVideoPreview && (
                  <div className="relative rounded-2xl overflow-hidden bg-slate-100">
                    <img
                      src={URL.createObjectURL(newPostImage)}
                      alt="preview"
                      className="w-full max-h-48 object-cover"
                    />
                    <button
                      onClick={() => setNewPostImage(null)}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-black/80"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="p-6 pt-0">
              <Button
                onClick={handleCreatePost}
                disabled={isPosting}
                className="w-full rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold h-12 shadow-lg shadow-rose-200"
              >
                {isPosting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading Media...
                  </>
                ) : 'Post to Community'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CommunityPage;
