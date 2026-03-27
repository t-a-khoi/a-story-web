import { apiClient } from '@/lib/axios';
import { PageResponse } from './stories.service'; // Tái sử dụng interface PageResponse
import { Contact } from '@/types/contact';


export const ContactService = {
  /**
   * Lấy danh sách danh bạ của người dùng (tương ứng với ContactsSearchService)
   */
  getContacts: async (): Promise<PageResponse<Contact>> => {
    // Giả định endpoint BE là /contacts, có thể truyền thêm params size lớn để lấy hết
    const response = await apiClient.get<PageResponse<Contact>>('/contacts', {
      params: { size: 100, sort: 'preferenceName,asc' } 
    });
    return response.data;
  }
};