import { useEffect, useState } from 'react';

export const mobileQuery = '(max-width: 600px)';
export const compactQuery = '(max-width: 1000px)';

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const media = matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}
