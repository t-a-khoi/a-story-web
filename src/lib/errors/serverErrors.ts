import { logger } from "./logger";

// Mapping các mã lỗi Backend sang giao diện Tiếng Anh cao cấp theo yêu cầu
const serverErrorMap: Record<string, string> = {
    'USER_NOT_FOUND': 'User account not found. Please verify your credentials.',
    'DUPLICATE_EMAIL': 'This email is already associated with an account. Please sign in.',
    'DUPLICATE_USERNAME': 'This username is already taken. Please choose another one.',
    'TOKEN_EXPIRED': 'Your session has expired. Please sign in again.',
    'TOKEN_INVALID': 'Invalid authentication token. Please sign in again.',
    'ACCESS_DENIED': 'You do not have permission to perform this action.',
    'STORY_NOT_FOUND': 'The requested story could not be found or has been removed.',
    'VALIDATION_FAILED': 'Please check the provided information and try again.',
    'VALIDATION_ERROR': 'The provided information is invalid. Please check and try again.',
    'DEFAULT': 'An unexpected error occurred processing your request. Please try again later.'
};

export const handleServerError = (error: any, context?: string): string => {
    // Ghi log chi tiết cho Developer
    logger.error(`Server Error: ${context || 'Unknown context'}`, error);

    // Xử lý thông báo trả về cho User
    const responseData = error?.response?.data;
    const errorCode = responseData?.code || responseData?.errorCode;
    
    // Ưu tiên map theo errorCode từ Backend
    if (errorCode && serverErrorMap[errorCode]) {
        // Nếu là VALIDATION_ERROR, ưu tiên dùng message gốc từ backend nếu có (vì nó thường chứa thông tin cụ thể cho user)
        if (errorCode === 'VALIDATION_ERROR' && responseData?.message) {
            return responseData.message;
        }
        return serverErrorMap[errorCode];
    }
    
    // Dự phòng hiển thị trực tiếp message nếu BE thiết kế message chuẩn cho client
    // Lưu ý: Chỉ nên gửi message nếu chắc chắn nó không chứa thông tin nhạy cảm.
    // Tạm thời nếu không khớp code, dùng DEFAULT message để đảm bảo an toàn & thanh lịch.
    return serverErrorMap['DEFAULT'];
};
