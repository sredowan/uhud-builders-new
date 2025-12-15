import React, { useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';

const SEOMetaTags: React.FC = () => {
    const { settings } = useProjects();

    useEffect(() => {
        if (!settings?.seo) return;

        // Update document title
        if (settings.seo.siteTitle) {
            document.title = settings.seo.siteTitle;
        }

        // Update or create meta description
        const metaDescription = settings.seo.metaDescription;
        if (metaDescription) {
            let meta = document.querySelector('meta[name="description"]');
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('name', 'description');
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', metaDescription);
        }

        // Update favicon
        const faviconUrl = settings.seo.favicon;
        if (faviconUrl) {
            let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.setAttribute('rel', 'icon');
                document.head.appendChild(link);
            }
            link.href = faviconUrl;
        }

    }, [settings?.seo]);

    return null; // Renderless component
};

export default SEOMetaTags;
