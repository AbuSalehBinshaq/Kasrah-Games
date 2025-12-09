/**
 * TypeScript type definitions for Kasrah Games
 */

// User types
export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
  isVerified: boolean;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface AuthUser extends Omit<User, 'password' | 'createdAt' | 'updatedAt'> {
  // Auth-specific fields
}

export interface UserProfile extends User {
  totalGamesPlayed: number;
  totalPlayTime: number;
  favoriteCategories: string[];
  bookmarks: Game[];
}

// Game types
export interface Game {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  developer: string;
  publisher?: string;
  releaseDate?: string;
  thumbnail: string;
  coverImage?: string;
  gameUrl: string;
  gameType: 'HTML5' | 'WebGL' | 'Unity' | 'Flash' | 'Other';
  technologies: string[];
  tags?: string[];
  requirements?: {
    min?: string;
    recommended?: string;
    browser?: string;
    controls?: string;
  };
  ageRating?: string;
  isFeatured: boolean;
  isPublished: boolean;
  views: number;
  playCount: number;
  createdAt: string;
  updatedAt: string;
  categories: Category[];
  avgRating: number;
}

export interface GameWithDetails extends Game {
  ratings: Rating[];
  playSessions: PlaySession[];
  bookmarks: Bookmark[];
}

// Category types
export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  gameCount?: number;
}

// Rating types
export interface Rating {
  id: string;
  rating: number;
  review?: string;
  userId: string;
  gameId: string;
  createdAt: string;
  updatedAt: string;
  user: Pick<User, 'id' | 'username' | 'avatar'>;
}

// PlaySession types
export interface PlaySession {
  id: string;
  userId: string;
  gameId: string;
  duration: number;
  startedAt: string;
  endedAt?: string;
}

// Bookmark types
export interface Bookmark {
  id: string;
  userId: string;
  gameId: string;
  folder?: string;
  createdAt: string;
  game: Pick<Game, 'id' | 'title' | 'thumbnail'>;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  name?: string;
}

export interface GameFormData {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  developer: string;
  publisher?: string;
  gameUrl: string;
  thumbnail: string;
  coverImage?: string;
  gameType: 'HTML5' | 'WebGL' | 'Unity' | 'Flash' | 'Other';
  technologies: string[];
  tags: string[];
  ageRating?: string;
  categoryIds: string[];
  isFeatured: boolean;
  isPublished: boolean;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Stats types
export interface DashboardStats {
  totalGames: number;
  totalUsers: number;
  totalPlays: number;
  avgRating: number;
  recentGames: Game[];
  activeUsers: number;
  popularCategories: Array<Category & { gameCount: number }>;
  recentReviews: Rating[];
}

// Filter/Sort types
export interface GameFilters {
  search?: string;
  category?: string;
  sort?: 'newest' | 'popular' | 'rating' | 'oldest';
  featured?: boolean;
  page?: number;
  limit?: number;
}

// Localization types
export type Locale = 'en' | 'ar';

export interface TranslationDictionary {
  [key: string]: string;
}

// Component Props types
export interface GameCardProps {
  game: Game;
  viewMode: 'grid' | 'list';
  className?: string;
}

export interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}
