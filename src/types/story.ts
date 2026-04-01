// src/types/story.ts

export interface Category {
  id: number;
  name: string;
  typeCode?: string;
  userId?: number;
  username?: string;
  icon?: string;
  color?: string;
  createdDate?: string;
  createdBy?: string;
  modifiedDate?: string;
  modifiedBy?: string;
}

export interface CategoriesCreateRequest {
  name: string;
  typeCode?: string;
  userId?: number;
  icon?: string;
  color?: string;
}

export interface CategoriesUpdateRequest {
  name: string;
  typeCode?: string;
  userId?: number;
  icon?: string;
  color?: string;
}

export interface Story {
  id: number;
  userId: number;
  profileId: number;
  catId: number;
  title: string;
  content: string;
  deleted: boolean;
  createdDate: string;
  modifiedDate: string;
}

export interface StoryCreateRequest {
  userId: number;
  profileId: number;
  catId?: number | null;
  title: string;
  content: string;
}

export interface StoryUpdateRequest {
  userId?: number;
  profileId?: number;
  catId?: number | null;
  title?: string;
  content?: string;
}

export interface StoryQueryParams {
  page?: number;
  size?: number;
  sort?: string; 
}

export interface QueryRequest {
  page?: number;
  size?: number;
  sort?: string;
  filter?: {
    'category.id'?: number;
    'user.id'?: number;
    deleted?: boolean;
    [key: string]: any;
  };
  search?: string;
}

export interface StoryMediaResponse {
    id: number;
    storyId: number;
    mediaId: number;
    caption?: string;
    deleted?: boolean;
    createdDate?: string;
}

export interface StoryMediaCreateRequest {
    storyId: number;
    mediaId: number;
    caption?: string;
}