import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const positions = {};

const useScrollRestoration = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (positions[pathname]) {
      window.scrollTo(0, positions[pathname]);
    }
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      positions[pathname] = window.scrollY;
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);
};

export default useScrollRestoration;