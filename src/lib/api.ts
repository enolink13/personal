import {
  Profile,
  SiteSettings,
  MediaItem,
  Category,
  Tag,
  Album,
  Post,
  PostRevision,
  Portfolio,
  AIGeneratedContent,
  DashboardStats,
} from '../types';

const TOKEN_KEY = 'aksara_admin_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
  isAuthenticated: () => Boolean(localStorage.getItem(TOKEN_KEY)),
};

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Permintaan gagal dengan status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson.error) {
        errorMsg = errorJson.error;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  login: async (username: string, password: string) => {
    const data = await fetchJson<{ token: string; user: { id: string; username: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    authStorage.setToken(data.token);
    return data;
  },
  logout: async () => {
    try {
      await fetchJson('/api/auth/logout', { method: 'POST' });
    } finally {
      authStorage.clearToken();
    }
  },
  checkAuth: () => fetchJson<{ user: { id: string; username: string } }>('/api/auth/me'),
  changePassword: (current_password: string, new_password: string) =>
    fetchJson('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password }),
    }),

  // Public
  getPublicSettings: () => fetchJson<SiteSettings>('/api/public/settings'),
  getPublicProfile: () => fetchJson<Profile>('/api/public/profile'),
  getPublicPosts: (params?: { category_id?: string; tag_id?: string; search?: string; limit?: number; offset?: number }) => {
    const q = new URLSearchParams();
    if (params?.category_id) q.set('category_id', params.category_id);
    if (params?.tag_id) q.set('tag_id', params.tag_id);
    if (params?.search) q.set('search', params.search);
    if (params?.limit) q.set('limit', params.limit.toString());
    if (params?.offset) q.set('offset', params.offset.toString());
    return fetchJson<{ posts: any[]; total: number; offset: number; limit: number }>(`/api/public/posts?${q.toString()}`);
  },
  getPublicPostDetail: (slug: string) =>
    fetchJson<{
      post: Post;
      category: Category | null;
      tags: Tag[];
      featured_media: MediaItem | null;
      supplementary_media: MediaItem[];
      related_posts: any[];
    }>(`/api/public/posts/${slug}`),
  getPublicPortfolios: () => fetchJson<Portfolio[]>('/api/public/portfolios'),
  getPublicPortfolioDetail: (slug: string) =>
    fetchJson<{
      portfolio: Portfolio;
      featured_media: MediaItem | null;
      documents: MediaItem[];
    }>(`/api/public/portfolios/${slug}`),
  getPublicGallery: (album_id?: string) => {
    const q = album_id ? `?album_id=${album_id}` : '';
    return fetchJson<{ media: MediaItem[]; total: number }>(`/api/public/gallery${q}`);
  },
  getPublicAlbums: () => fetchJson<Album[]>('/api/public/albums'),
  getPublicCategories: () => fetchJson<Category[]>('/api/public/categories'),
  getPublicTags: () => fetchJson<Tag[]>('/api/public/tags'),
  sendContactMessage: (data: { name: string; email: string; subject?: string; message: string; website_hp?: string }) =>
    fetchJson<{ success: boolean; message: string }>('/api/public/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Admin Dashboard
  getDashboardStats: () =>
    fetchJson<{
      stats: DashboardStats;
      recent_posts: Post[];
      recent_activities: any[];
      gemini_status: { connected: boolean; model: string };
    }>('/api/admin/dashboard/stats'),

  // Admin Posts
  getAdminPosts: (params?: { status?: string; category_id?: string; search?: string; limit?: number; offset?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.category_id) q.set('category_id', params.category_id);
    if (params?.search) q.set('search', params.search);
    if (params?.limit) q.set('limit', params.limit.toString());
    if (params?.offset) q.set('offset', params.offset.toString());
    return fetchJson<{ posts: Post[]; total: number; offset: number; limit: number }>(`/api/admin/posts?${q.toString()}`);
  },
  getAdminPost: (id: string) => fetchJson<{ post: Post; revisions: PostRevision[] }>(`/api/admin/posts/${id}`),
  createAdminPost: (post: Partial<Post>) =>
    fetchJson<Post>('/api/admin/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    }),
  updateAdminPost: (id: string, post: Partial<Post> & { revision_note?: string }) =>
    fetchJson<Post>(`/api/admin/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(post),
    }),
  publishPost: (id: string) => fetchJson<{ success: boolean; post: Post }>(`/api/admin/posts/${id}/publish`, { method: 'POST' }),
  archivePost: (id: string) => fetchJson<{ success: boolean; post: Post }>(`/api/admin/posts/${id}/archive`, { method: 'POST' }),
  deleteAdminPost: (id: string) => fetchJson<{ success: boolean; message: string }>(`/api/admin/posts/${id}`, { method: 'DELETE' }),

  // Admin Media
  getAdminMedia: (params?: { is_public?: boolean; album_id?: string; search?: string; limit?: number; offset?: number }) => {
    const q = new URLSearchParams();
    if (params?.is_public !== undefined) q.set('is_public', params.is_public.toString());
    if (params?.album_id) q.set('album_id', params.album_id);
    if (params?.search) q.set('search', params.search);
    if (params?.limit) q.set('limit', params.limit.toString());
    if (params?.offset) q.set('offset', params.offset.toString());
    return fetchJson<{ media: MediaItem[]; total: number }>(`/api/admin/media?${q.toString()}`);
  },
  uploadMedia: (formData: FormData) =>
    fetchJson<{ success: boolean; media: MediaItem[] }>('/api/admin/media/upload', {
      method: 'POST',
      body: formData,
    }),
  updateMedia: (id: string, update: Partial<MediaItem>) =>
    fetchJson<MediaItem>(`/api/admin/media/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(update),
    }),
  deleteMedia: (id: string) => fetchJson<{ success: boolean; message: string }>(`/api/admin/media/${id}`, { method: 'DELETE' }),
  getAdminAlbums: () => fetchJson<Album[]>('/api/admin/albums'),
  createAlbum: (name: string, description: string) =>
    fetchJson<Album>('/api/admin/albums', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    }),

  // Admin AI Studio
  generateAINarrative: (data: {
    photos: string[];
    contentType: string;
    eventDate?: string;
    location?: string;
    eventContext: string;
    storyBehind: string;
    mainMessage: string;
    perspective: string;
    tone: string;
    length: string;
  }) =>
    fetchJson<AIGeneratedContent>('/api/admin/ai/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  reviseAINarrative: (data: { currentDraft: AIGeneratedContent; action: string; customInstruction?: string }) =>
    fetchJson<AIGeneratedContent>('/api/admin/ai/revise', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAIHistory: () => fetchJson<any[]>('/api/admin/ai/history'),
  saveAIDraftAsPost: (data: {
    aiResult: AIGeneratedContent;
    featured_media_id?: string;
    category_id?: string;
    tag_ids?: string[];
  }) =>
    fetchJson<{ success: boolean; post: Post }>('/api/admin/ai/save-draft', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Admin Portfolios
  getAdminPortfolios: () => fetchJson<Portfolio[]>('/api/admin/portfolios'),
  createAdminPortfolio: (data: Partial<Portfolio>) =>
    fetchJson<Portfolio>('/api/admin/portfolios', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAdminPortfolio: (id: string, data: Partial<Portfolio>) =>
    fetchJson<Portfolio>(`/api/admin/portfolios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteAdminPortfolio: (id: string) =>
    fetchJson<{ success: boolean; message: string }>(`/api/admin/portfolios/${id}`, { method: 'DELETE' }),

  // Admin Categories & Tags
  getAdminCategories: () => fetchJson<Category[]>('/api/admin/categories'),
  createCategory: (name: string, description: string, color?: string) =>
    fetchJson<Category>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify({ name, description, color }),
    }),
  updateCategory: (id: string, update: Partial<Category>) =>
    fetchJson<Category>(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(update),
    }),
  deleteCategory: (id: string) =>
    fetchJson<{ success: boolean; message: string }>(`/api/admin/categories/${id}`, { method: 'DELETE' }),
  getAdminTags: () => fetchJson<Tag[]>('/api/admin/tags'),
  createTag: (name: string) =>
    fetchJson<Tag>('/api/admin/tags', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  deleteTag: (id: string) => fetchJson<{ success: boolean; message: string }>(`/api/admin/tags/${id}`, { method: 'DELETE' }),

  // Admin Profile & Settings
  getAdminProfile: () => fetchJson<Profile>('/api/admin/profile'),
  updateAdminProfile: (profile: Partial<Profile>) =>
    fetchJson<Profile>('/api/admin/profile', {
      method: 'PATCH',
      body: JSON.stringify(profile),
    }),
  getAdminSettings: () => fetchJson<SiteSettings>('/api/admin/settings'),
  updateAdminSettings: (settings: Partial<SiteSettings>) =>
    fetchJson<SiteSettings>('/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    }),
  getAuditLogs: () => fetchJson<any[]>('/api/admin/audit-logs'),
  getContactMessages: () => fetchJson<any[]>('/api/admin/contact-messages'),
  markContactMessageRead: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/admin/contact-messages/${id}/read`, { method: 'PATCH' }),

  // Backup & Export
  downloadBackupUrl: '/api/admin/backup/export',
  downloadMarkdownExportUrl: '/api/admin/export/markdown',
  restoreBackup: (data: any) =>
    fetchJson<{ success: boolean; message: string }>('/api/admin/backup/restore', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
