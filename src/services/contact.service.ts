import { apiClient } from '@/lib/axios';

export interface SpringPage<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface ContactsResponse {
    id: number;
    userId: number;
    username: string;
    email: string;
    profileId: number;
    fullname: string;
    phoneNumber: string;
    address: string;
    categoryId: number;
    name: string;
    typeCode: string;
    icon: string;
    color: string;
    preferenceName: string;
}

export const contactService = {
    /**
     * Lấy danh sách danh bạ người thân
     * Endpoint: GET /api/v1/contacts
     */
    getContacts: async (page = 0, size = 50): Promise<SpringPage<ContactsResponse>> => {
        const response = await apiClient.get<SpringPage<ContactsResponse>>('/contacts', {
            params: { page, size }
        });
        return response.data;
    }
};