import { logger } from "./logger";

const clientErrorMap = {
    NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
    TIMEOUT: 'The request took too long. Please try again later.',
    BROWSER_ERROR: 'An unexpected application error occurred.',
};

export const handleClientError = (error: any, context?: string): string => {
    // Ghi log chi tiết cho Developer
    logger.error(`Client/Network Error: ${context || 'Unknown context'}`, error);

    // Mất kết nối internet hoàn toàn
    if (!navigator.onLine) {
        return clientErrorMap.NETWORK_ERROR;
    }

    // Axios nhận diện lỗi mạng hoặc Không thể reach được BE (CORS, Server down)
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        return clientErrorMap.NETWORK_ERROR;
    }

    // Lỗi timeout do set trong axios configs
    if (error.code === 'ECONNABORTED') {
        return clientErrorMap.TIMEOUT;
    }

    return clientErrorMap.BROWSER_ERROR;
};
