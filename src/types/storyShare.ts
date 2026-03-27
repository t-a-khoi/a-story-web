// src/types/storyShare.ts

export interface StorySharesResponse {
  id: number;
  storyId: number;
  sharedUserId: number;
  deleted: boolean;
  createdDate: string; // ISO 8601
  modifiedDate: string; // ISO 8601
}

export interface StorySharesCreateRequest {
  storyId: number;
  sharedUserId: number;
}

export interface StorySharesUpdateRequest {
  storyId?: number;
  sharedUserId?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface StorySharesQueryRequest {
  page?: number;
  size?: number;
  sort?: string;
  filter?: {
    [key: string]: any;
  };
  search?: string;
}
