import { useState, useEffect } from 'react';

export function useMoviesPerRow(): number {
  const [cols, setCols] = useState(6);

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w < 480) setCols(3);
      else if (w < 640) setCols(4);
      else if (w < 1024) setCols(5);
      else setCols(6);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  return cols;
}
