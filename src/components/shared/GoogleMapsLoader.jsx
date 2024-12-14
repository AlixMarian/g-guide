import { useEffect } from 'react';
import { useGoogleMaps } from '../../context/GoogleMapsContext';
import PropTypes from 'prop-types'; // Add this import


const GoogleMapsLoader = ({ children }) => {
  const { isLoaded, setIsLoaded } = useGoogleMaps();

  useEffect(() => {
    if (!isLoaded && !window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
      script.async = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else if (window.google) {
      setIsLoaded(true);
    }
  }, [isLoaded, setIsLoaded]);

  if (!isLoaded) return null;
  return children;
};

GoogleMapsLoader.propTypes = {
  children: PropTypes.node.isRequired,
};

export default GoogleMapsLoader;