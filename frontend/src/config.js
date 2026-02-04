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

        // Ensure path starts with /
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;

        // In production (API_BASE_URL is set), prepend it.
        // In dev (API_BASE_URL is empty), return relative path (handled by proxy).
        return `${config.API_BASE_URL}${normalizedPath}`;
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
