
export interface SettingsResponse {
  id: number;
  userId: number;
  general: Record<string, any>;
  profile: Record<string, any>;
  story: Record<string, any>;
  mediaFile: Record<string, any>;
  deleted: boolean;
  createdDate: string;
  modifiedDate: string;
}

export interface SettingsCreateRequest {
  userId: number;
  general?: Record<string, any>;
  profile?: Record<string, any>;
  story?: Record<string, any>;
  mediaFile?: Record<string, any>;
}

export interface SettingsUpdateRequest {
  userId?: number;
  general?: Record<string, any>;
  profile?: Record<string, any>;
  story?: Record<string, any>;
  mediaFile?: Record<string, any>;
}