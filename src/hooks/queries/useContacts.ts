import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ContactService } from "@/services/contact.service";
import { ContactCreateRequest, ContactUpdateRequest, Contact } from "@/types/contact";
import { QueryRequest, PageResponse } from "@/types/common";

export const contactKeys = {
    all: ['contacts'] as const,
    lists: () => [...contactKeys.all, 'list'] as const,
    list: (filters: string) => [...contactKeys.lists(), { filters }] as const,
    details: () => [...contactKeys.all, 'detail'] as const,
    detail: (id: number) => [...contactKeys.details(), id] as const,
};

// Hook tìm kiếm danh bạ chung (chủ yếu dùng cho My Contacts)
export const useContactsSearch = (queryRequest: QueryRequest) => {
    return useQuery<PageResponse<Contact>>({
        queryKey: contactKeys.list(JSON.stringify(queryRequest)),
        queryFn: () => ContactService.searchContacts(queryRequest),
        enabled: Boolean(queryRequest?.filters?.length),
    });
};

export const useContactById = (id: number) => {
    return useQuery({
        queryKey: contactKeys.detail(id),
        queryFn: () => ContactService.getContactById(id),
        enabled: !!id,
    });
};

export const useCreateContact = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ContactCreateRequest) => ContactService.createContact(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
        }
    });
};

export const useUpdateContact = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number, data: ContactUpdateRequest }) => ContactService.updateContact(id, data),
        onSuccess: (updatedContact) => {
            queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
            queryClient.setQueryData(contactKeys.detail(updatedContact.id), updatedContact);
        }
    });
};

export const useDeleteContact = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => ContactService.deleteContact(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
            queryClient.removeQueries({ queryKey: contactKeys.detail(id) });
        }
    });
};
