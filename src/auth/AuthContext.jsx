import { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import PropTypes from 'prop-types'; // Import PropTypes for prop validation

// Create a context for authentication
const AuthContext = createContext();

// Provide authentication state to the application
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Tracks the logged-in user
  const auth = getAuth(); // Initialize Firebase Auth

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Update user state when auth state changes
    });
    return () => unsubscribe(); // Cleanup the listener on unmount
  }, [auth]);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Define propTypes for AuthProvider
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired, // Validate that children is a React node
};

// Hook to access authentication state
export const useAuth = () => useContext(AuthContext);
