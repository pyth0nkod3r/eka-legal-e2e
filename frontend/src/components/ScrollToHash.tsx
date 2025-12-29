import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Component that handles scrolling to hash fragments when navigating between pages.
 * React Router doesn't do this automatically, so we need to handle it ourselves.
 */
export function ScrollToHash() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) {
            // Small timeout to ensure the DOM has updated after navigation
            const timeoutId = setTimeout(() => {
                const element = document.querySelector(hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
            return () => clearTimeout(timeoutId);
        } else {
            // Scroll to top when navigating to a page without a hash
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [pathname, hash]);

    return null;
}
