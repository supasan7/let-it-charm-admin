const config = {
    // API_BASE_URL is now empty string because we rely on Vite Proxy (development) 
    // or Nginx logic (production) to forward /api requests to the backend.
    // This makes the frontend agnostic of the backend's port/domain.
    // In production, we need the full URL if backend is on a different domain
    API_BASE_URL: import.meta.env.VITE_API_TARGET || '',

    // Helper to get full image URL
    getImageUrl: (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        // Since we proxy /uploads, we can just return the path directly if it starts with /uploads
        // But backend often saves as /uploads/..., so returning just path works with proxy.
        // However, if we need absolute URL for some reason (rare in this setup), we'd need more logic.
        // For now, returning the path works because <img src="/uploads/..." /> works via proxy.
        return path;
    },
    // Pagination Defaults
    DEFAULT_PAGINATION_LIMIT: 10,

    // Default User Info (Mock)
    DEFAULT_USER: {
        name: 'Admin Owner',
        role: 'Admin',
        branch: 'สาขาหลัก (Headquarters)',
        initial: 'A'
    }
};

export default config;
