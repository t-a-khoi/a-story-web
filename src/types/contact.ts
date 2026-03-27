export interface Contact {
    id: number;
    preferenceName?: string; // Tên gợi nhớ (có thể null)

    userId: number;
    username: string;
    email?: string;

    profileId: number;
    fullname: string;        // Tên thật
    phoneNumber?: string;
    address?: string;

    categoryId?: number;
    name?: string;           // Tên nhóm (vd: "Gia đình", "Bạn bè")
    typeCode?: string;
    icon?: string;
    color?: string;
}

export interface ContactCreateRequest {
    preferenceName?: string;
    userId: number;
    profileId: number;
    categoryId?: number;
}

export interface ContactUpdateRequest {
    preferenceName?: string;
    categoryId?: number;
}

export interface ContactQueryParams {
    page?: number;
    size?: number;
    sort?: string;
    search?: string;
    'user.id'?: number;        // Lọc theo User
    'profile.id'?: number;     // Lọc theo Profile
    'category.id'?: number;    // Lọc theo Nhóm
}