import { apiClient } from '@/lib/axios';
import { PageResponse } from '@/types/common';
import { Contact, ContactCreateRequest, ContactUpdateRequest } from '@/types/contact';

export const ContactService = {
  /**
   * Lấy danh sách danh bạ (phân trang)
   */
  getContacts: async (page = 0, size = 100): Promise<PageResponse<Contact>> => {
    const response = await apiClient.get<PageResponse<Contact>>('/ph-story-mvp-service/api/v1/contacts', {
      params: { page, size, sort: 'preferenceName,asc' }
    });
    return response.data;
  },

  /**
   * Lấy contact theo ID
   */
  getContactById: async (id: number): Promise<Contact> => {
    const response = await apiClient.get<Contact>(`/ph-story-mvp-service/api/v1/contacts/${id}`);
    return response.data;
  },

  /**
   * Tạo contact mới
   */
  createContact: async (data: ContactCreateRequest): Promise<Contact> => {
    const response = await apiClient.post<Contact>('/ph-story-mvp-service/api/v1/contacts', data);
    return response.data;
  },

  /**
   * Cập nhật contact
   */
  updateContact: async (id: number, data: ContactUpdateRequest): Promise<Contact> => {
    const response = await apiClient.put<Contact>(`/ph-story-mvp-service/api/v1/contacts/${id}`, data);
    return response.data;
  },

  /**
   * Xóa contact
   */
  deleteContact: async (id: number): Promise<void> => {
    await apiClient.delete(`/ph-story-mvp-service/api/v1/contacts/${id}`);
  },

  /**
   * Tìm kiếm contact
   */
  searchContacts: async (body: {
    page?: number;
    size?: number;
    sort?: string;
    filter?: Record<string, unknown>;
    search?: string;
  }): Promise<PageResponse<Contact>> => {
    const response = await apiClient.post<PageResponse<Contact>>(
      '/ph-story-mvp-service/api/v1/contacts/search',
      body
    );
    return response.data;
  },
};