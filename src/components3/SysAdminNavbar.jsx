import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '/backend/firebase'; 
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';


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
    height: '90px', 
    width: '120px', 
    padding: '10px',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)', 
  },
  buttonIcon: {
    marginBottom: '5px',
    marginTop: '15px', 
  },
};

const SysAdminNavbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); 
  const [profileImage, setProfileImage] = useState('../src/assets/G-Guide LOGO.png'); 
  const [userRole, setUserRole] = useState(''); 

  useEffect(() => {
    const auth = getAuth();

    const fetchUserData = async (userId) => {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserRole(userData.role); 
        if (userData.role !== 'sysAdmin' && userData.profileImage) {
          setProfileImage(userData.profileImage); 
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); 
        fetchUserData(user.uid); 
      } else {
        navigate('/login'); 
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
