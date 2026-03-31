// 1. Phân trang dùng chung cho mọi Response trả về từ Backend
export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

// 2. Các type và interface phục vụ cho Request Search nâng cao
export type Operator =
    | 'EQUAL'
    | 'NOT_EQUAL'
    | 'GREATER_THAN'
    | 'GREATER_THAN_OR_EQUAL'
    | 'LESS_THAN'
    | 'LESS_THAN_OR_EQUAL'
    | 'LIKE'
    | 'IN'
    | 'NOT_IN'
    | 'BETWEEN'
    | 'IS_NULL'
    | 'IS_NOT_NULL';

export interface FilterRequest {
    field: string;
    operator: Operator;
    value?: any;
    values?: any[];
    from?: any;
    to?: any;
    logic?: 'AND' | 'OR';
    joinType?: string;
}

export interface SortRequest {
    field: string;
    direction: 'ASC' | 'DESC';
}

export interface PaginationRequest {
    page: number;
    size: number;
}

// 3. Request Search tổng (Thay thế cho SettingsQueryRequest, ProfileQueryRequest...)
export interface QueryRequest {
    filters?: FilterRequest[];
    sorts?: SortRequest[];
    pagination?: PaginationRequest;
    rootNode?: any;
}