export interface ProfilesResponse {
  id: number;
  userId: number;
  fullname: string;
  phoneNumber?: string;
  address?: string;
  legacyUserId?: number;
  legacySettings?: any;
  isDeceased: boolean;
  memorialMessage?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string; // ISO 8601
  createdDate: string; // ISO 8601
  modifiedDate: string; // ISO 8601
}

export interface ProfilesCreateRequest {
  userId: number;
  fullname: string;
  phoneNumber?: string;
  address?: string;
  legacyUserId?: number;
  legacySettings?: any;
  isDeceased: boolean;
  memorialMessage?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string; 
}

export interface ProfilesUpdateRequest {
  fullname: string;
  phoneNumber?: string;
  address?: string;
  legacyUserId?: number;
  legacySettings?: any;
  isDeceased: boolean;
  memorialMessage?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string; // ISO 8601
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ProfileQueryRequest {
  page?: number;
  size?: number;
  sort?: string;
  filter?: {
    [key: string]: any;
  };
  search?: string;
}
