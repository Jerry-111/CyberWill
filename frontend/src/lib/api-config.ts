export const getApiUrl = () => {
    if (typeof window !== 'undefined') {
        // Use the same hostname as the frontend, but port 8000
        return `http://${window.location.hostname}:8000`;
    }
    return 'http://127.0.0.1:8000'; // Fallback for server-side rendering
};
