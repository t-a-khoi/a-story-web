/**
 * Tạo ra một chuỗi ngẫu nhiên (Code Verifier) an toàn.
 * Độ dài khuyến nghị từ 43 đến 128 ký tự.
 */
export function generateCodeVerifier(length: number = 64): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
        result += charset[randomValues[i] % charset.length];
    }
    return result;
}

/**
 * Mã hóa Code Verifier thành Code Challenge bằng thuật toán SHA-256
 * và chuyển đổi sang định dạng Base64URL.
 */
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);

    // Chuyển đổi ArrayBuffer sang Base64 chuỗi chuẩn
    const base64String = btoa(String.fromCharCode(...new Uint8Array(digest)));

    // Convert sang chuẩn Base64URL (thay thế +, / và xóa dấu = ở cuối)
    return base64String
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}