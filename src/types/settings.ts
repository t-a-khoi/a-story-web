// src/types/settings.ts

export interface SettingsResponse {
  id: number;
  userId: number;
  general: Record<string, any>;
  profile: Record<string, any>;
  story: Record<string, any>;
  mediaFile: Record<string, any>;
  deleted: boolean;
  createdDate: string; // ISO 8601
  modifiedDate: string; // ISO 8601
}

export interface SettingsCreateRequest {
  userId: number;
  general?: Record<string, any>;
  profile?: Record<string, any>;
  story?: Record<string, any>;
  mediaFile?: Record<string, any>;
}

export interface SettingsUpdateRequest {
  userId?: number; // Backend PUT endpoint doesn't strictly need it, but flexible model allows it
  general?: Record<string, any>;
  profile?: Record<string, any>;
  story?: Record<string, any>;
  mediaFile?: Record<string, any>;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface SettingsQueryRequest {
  page?: number;
  size?: number;
  sort?: string;
  filter?: {
    [key: string]: any;
  };
  search?: string;
}
