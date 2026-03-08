/**
 * Parses the JWT access token to get the session ID or JTI.
 */
export function parseJwtId(accessToken) {
    try {
        const payload = JSON.parse(atob((accessToken || '').split('.')[1] || ''));
        return payload?.session_id || payload?.jti || null;
    } catch {
        return null;
    }
}

/**
 * Parses the user agent to get the browser and operating system.
 */
export function parseUserAgent() {
    const ua = navigator.userAgent || '';
    const browser = ua.includes('Edg/')
        ? 'Edge'
        : ua.includes('Chrome/')
            ? 'Chrome'
            : ua.includes('Firefox/')
                ? 'Firefox'
                : ua.includes('Safari/')
                    ? 'Safari'
                    : 'Unknown';
    const os = ua.includes('Windows')
        ? 'Windows'
        : ua.includes('Mac OS')
            ? 'macOS'
            : ua.includes('Linux')
                ? 'Linux'
                : ua.includes('Android')
                    ? 'Android'
                    : ua.includes('iPhone') || ua.includes('iPad')
                        ? 'iOS'
                        : 'Unknown';
    return { browser, os };
}
