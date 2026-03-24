import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Hàm cn (classnames): Chuyên dùng để nối và gộp các class Tailwind CSS.
 * Xử lý hoàn hảo việc xung đột class (ví dụ: vừa truyền p-4 vừa truyền p-2).
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Hàm formatDate: Chuyển đổi chuỗi ngày tháng từ DB (ISO 8601) sang định dạng dễ đọc.
 * Mặc định đang dùng chuẩn Việt Nam (DD/MM/YYYY).
 */
export function formatDate(dateString: string | undefined | null): string {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        // Có thể đổi 'vi-VN' thành 'en-US' nếu muốn hiển thị tiếng Anh
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date);
    } catch (error) {
        return dateString; // Nếu lỗi parse, trả về chuỗi gốc
    }
}

/**
 * (Tùy chọn) Hàm lấy chữ cái đầu của tên để làm Avatar mặc định
 * Rất hữu ích khi user chưa upload ảnh đại diện
 */
export function getAvatarFallback(name: string | undefined): string {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
}