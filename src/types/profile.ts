
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
  dateOfBirth?: string; 
  createdDate: string; 
  modifiedDate: string; 
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
  dateOfBirth?: string; 
}
