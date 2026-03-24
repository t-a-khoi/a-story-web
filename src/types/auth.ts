// src/types/auth.ts

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

// Thông tin cơ bản của User (từ API /api/v1/users/me)
export interface User {
    id: number;
    username: string;
    email: string;
    fullName: string;
    createdDate: string;
    modifiedDate: string;
}

// Enum giới tính mapping với DB
export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER'
}

// Chi tiết Profile của User (từ API /api/v1/profiles/{id})
export interface Profile {
    id: number;
    userId: number;
    legacyUserId?: number | null;
    fullname: string;
    phoneNumber?: string;
    address?: string;
    legacySettings?: string | null; // Backend trả về chuỗi JSON stringified
    isDeceased: boolean;
    memorialMessage?: string | null;
    gender?: Gender;
    dateOfBirth?: string; // Định dạng YYYY-MM-DD
    createdDate: string;
    modifiedDate: string;
}

// Cấu hình tuỳ chọn của User (từ API /api/v1/settings/{id})
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

// Dùng cho màn hình Đăng ký
export interface UserCreateRequest {
    username: string;
    email: string;
    password?: string; // Thường backend sẽ xử lý password ở luồng register riêng
    fullName: string;
}

// Dùng cho màn hình Cập nhật tài khoản
export interface UserUpdateRequest {
    email?: string;
    fullName?: string;
}

// Dùng cho màn hình Tạo Profile ban đầu (Onboarding sau khi đăng ký)
export interface ProfileCreateRequest {
    userId: number;
    fullname: string;
    phoneNumber?: string;
    address?: string;
    gender?: Gender;
    dateOfBirth?: string; // YYYY-MM-DD
}

// Dùng cho màn hình Chỉnh sửa Profile
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