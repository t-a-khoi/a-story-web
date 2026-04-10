/**
 * Utility: Developer Logger
 * Chỉ hoạt động trong môi trường Development. Không in log rác lên Production.
 */

export const logger = {
    error: (context: string, error: any, payload?: any) => {
        if (process.env.NODE_ENV !== 'production') {
            console.error(`🔴 [ERROR] ${context}`, {
                message: error?.message || error,
                status: error?.response?.status,
                data: error?.response?.data,
                payload,
                stack: error?.stack,
                originalError: error
            });
        }
    },
    warn: (context: string, warning: any) => {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`🟠 [WARN] ${context}`, warning);
        }
    },
    info: (context: string, info: any) => {
        if (process.env.NODE_ENV !== 'production') {
            console.info(`🟢 [INFO] ${context}`, info);
        }
    }
};
