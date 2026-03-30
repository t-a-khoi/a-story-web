// src/types/story.ts

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
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
  catId: number;
  title: string;
  content: string;
}

export interface StoryUpdateRequest {
  userId?: number;
  profileId?: number;
  catId?: number;
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