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
  userId: number; // Định danh tài khoản tạo hồ sơ này
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

// Giống cấu trúc phân trang dùng chung
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Cấu trúc query tìm kiếm
export interface ProfileQueryRequest {
  page?: number;
  size?: number;
  sort?: string;
  filter?: {
    [key: string]: any;
  };
  search?: string;
}
