
/**
 * ============================================================================
 * 1. OAUTH2 TOKEN RESPONSES
 * Khớp với response từ /oauth2/token của ph-story-oauth2-service
 * ============================================================================
 */
export interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
    refresh_token?: string;
}

/**
 * ============================================================================
 * 2. CORE ENTITIES (Dữ liệu trả về từ GET API)
 * ============================================================================
 */

export interface User {
    id: number;
    username: string;
    email: string;
    fullName: string;
    createdDate: string;
    modifiedDate: string;
}

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER'
}

export interface Profile {
    id: number;
    userId: number;
    legacyUserId?: number | null;
    fullname: string;
    phoneNumber?: string;
    address?: string;
    legacySettings?: string | null; 
    isDeceased: boolean;
    memorialMessage?: string | null;
    gender?: Gender;
    dateOfBirth?: string; 
    createdDate: string;
    modifiedDate: string;
}

export interface UserSettings {
    id: number;
    userId: number;
    general?: {
        language?: string;
        timezone?: string;
        [key: string]: any;
    };
    profile?: {
        showEmail?: boolean;
        [key: string]: any;
    };
    story?: {
        autoSave?: boolean;
        [key: string]: any;
    };
    mediaFile?: {
        defaultQuality?: string;
        [key: string]: any;
    };
    deleted: boolean;
    createdDate: string;
    modifiedDate: string;
}

/**
 * ============================================================================
 * 3. REQUEST DTOs (Dữ liệu đẩy lên Backend khi submit Form)
 * ============================================================================
 */

export interface UserCreateRequest {
    username: string;
    email: string;
    password?: string;
    fullname: string;
    gender: string;
    dateOfBirth?: string | null;
    phoneNumber?: string;
    address?: string;
    userType?: string;
}

export interface UserUpdateRequest {
    email?: string;
    fullName?: string;
}

export interface ProfileCreateRequest {
    userId: number;
    fullname: string;
    phoneNumber?: string;
    address?: string;
    gender?: Gender;
    dateOfBirth?: string; 
}

export interface ProfileUpdateRequest {
    fullname?: string;
    phoneNumber?: string;
    address?: string;
    legacyUserId?: number;
    legacySettings?: string;
    isDeceased?: boolean;
    memorialMessage?: string;
    gender?: Gender;
    dateOfBirth?: string;
}