import React, { useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';

const AnalyticsTracker: React.FC = () => {
    const { settings } = useProjects();

    useEffect(() => {
        if (!settings?.analytics) return;

        // 1. Google Search Console (Meta Tag)
        const gscCode = settings.analytics.googleSearchConsole;
        if (gscCode) {
            // Check if already exists
            let meta = document.querySelector('meta[name="google-site-verification"]');
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('name', 'google-site-verification');
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', gscCode);
        }

        // 2. Facebook Pixel
        const pixelId = settings.analytics.facebookPixel;
        if (pixelId && !window.hasOwnProperty('fbq')) {
            // Inject Only Once
            /* eslint-disable */
            // @ts-ignore
            !function (f, b, e, v, n, t, s) {
                if (f.fbq) return; n = f.fbq = function () {
                    n.callMethod ?
                    n.callMethod.apply(n, arguments) : n.queue.push(arguments)
                };
                if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
                n.queue = []; t = b.createElement(e); t.async = !0;
                t.src = v; s = b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t, s)
            }(window, document, 'script',
                'https://connect.facebook.net/en_US/fbevents.js');
            // @ts-ignore
            fbq('init', pixelId);
            // @ts-ignore
            fbq('track', 'PageView');
            /* eslint-enable */
        }

    }, [settings?.analytics]);

    return null; // Renderless component
};

export default AnalyticsTracker;
