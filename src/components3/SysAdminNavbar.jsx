import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '/backend/firebase'; // Adjust path based on your project structure
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

// Inline styles
const styles = {
  navbarContainer: {
    position: 'fixed',
    width: '100%',
    zIndex: 1,
  },
  navbarButtons: {
    marginTop: '-0.8rem',
    display: 'flex',
    justifyContent: 'right',
    marginRight: '20px',
    gap: '0.5rem',
  },
  navbarButton: {
    marginLeft: '10px',
    color: 'white',
    display: 'flex',
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center',
    background: '#0068A2',
    height: '90px', // Adjusted for better height
    width: '120px', // Adjusted for better width
    padding: '10px',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)', // Slight shadow for depth
  },
  buttonIcon: {
    marginBottom: '5px',
    marginTop: '15px', // Add some space between icon and text
  },
};

const SysAdminNavbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // State for the logged-in user
  const [profileImage, setProfileImage] = useState('../src/assets/G-Guide LOGO.png'); // Default system admin image
  const [userRole, setUserRole] = useState(''); // To track the user's role

  useEffect(() => {
    const auth = getAuth();

    const fetchUserData = async (userId) => {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserRole(userData.role); // Set the user's role (sysAdmin, churchCoor, websiteUser)
        if (userData.role !== 'sysAdmin' && userData.profileImage) {
          setProfileImage(userData.profileImage); // Set the user's profile image if they are not sysAdmin
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // Set the user state with logged-in user info
        fetchUserData(user.uid); // Fetch user data from Firestore
      } else {
        navigate('/login'); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleAccountClick = () => {
    if (userRole === 'sysAdmin') {
      navigate('/sys-account');
    } else if (userRole === 'churchCoor') {
      navigate('/AccountSettings'); 
    } else if (userRole === 'websiteUser') {
      navigate('/user-accSettings'); 
    } else {
      navigate('/login'); 
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth); 
      navigate('/login'); 
      toast.success('User logged out successfully');
    } catch (error) {
      toast.error('Error logging out:', error);
    }
  };

  return (
    <div style={styles.navbarContainer}>
      <div style={styles.navbarButtons}>
        <Button variant="primary" style={styles.navbarButton} onClick={handleAccountClick}>
          <input type="image" src={profileImage} height="32" width="32" alt="Account"
            style={{ ...styles.buttonIcon, filter: 'drop-shadow(0 3px 3px rgba(0, 0, 0, 0.5))', borderRadius: '50%', }}
          />
          Account
        </Button>
        <Button variant="primary" style={styles.navbarButton} onClick={handleLogout}>
          <input type="image" src="../src/assets/log-out.png" height="30" width="25" alt="Log Out"
            style={{ ...styles.buttonIcon, filter: 'drop-shadow(0 3px 3px rgba(0, 0, 0, 0.5))'}}
          />
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default SysAdminNavbar;
