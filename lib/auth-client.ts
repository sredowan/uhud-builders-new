import { createAuthClient } from "better-auth/react"

// Use environment-aware API URL for split deployment
const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? "http://localhost:3001"
    : "https://api.uhudbuilders.com";

export const authClient = createAuthClient({
    baseURL: API_BASE_URL
});

