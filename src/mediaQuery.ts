import { useState, useEffect } from 'react';

/**
 * Basic media query hook
 * Will check if the current screen size matches the media query (currently hardcoded) 
 */
export const useMediaQuery = () => {
    const [isMatch, setIsMatch] = useState(false);

    useEffect(() => {
        const media = window.matchMedia("(max-width: 800px)")

        if (media.matches !== isMatch) {
            setIsMatch(media.matches);
        }

        const listener = () => {
            setIsMatch(media.matches);
        }

        media.addEventListener("change", listener);

        return () => media.removeEventListener("change", listener);
    }, [isMatch]);

    return isMatch;
}