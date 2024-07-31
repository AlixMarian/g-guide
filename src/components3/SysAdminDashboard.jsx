import { useEffect, useState } from 'react';
import { useNavigate} from 'react-router-dom';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '/backend/firebase';

export const SysAdminDashboard = () => {
  const navigate = useNavigate();
  const [churchCount, setChurchCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0); 


  useEffect(() => {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log("User signed in:", user);
        } else {
          console.log("No user signed in.");
          navigate('/login');
        }
      });
  }, [navigate]);

  useEffect(() => {
      const fetchChurchCount = async () => {
          try {
              const churchCollection = collection(db, 'church');
              const churchSnapshot = await getDocs(churchCollection);
              setChurchCount(churchSnapshot.size);
          } catch (error) {
              console.error("Error fetching church count:", error);
          }
      };

      const fetchUsersCount = async () => {
        try {
            const usersCollection = collection(db, 'users');
            const usersSnapshot = await getDocs(usersCollection);
            setUsersCount(usersSnapshot.size);
        } catch (error) {
            console.error("Error fetching users count:", error);
        }
    };
      fetchChurchCount();
      fetchUsersCount();
  }, []);


    


    return (
      <div>
      <h3>Admin Dashboard</h3>
        <div className='dashboard-container'>
            <div className='church-total'>
              <br></br>
            Total Number of Churches
              <div className='churchCount'>{churchCount}</div>
            </div>
            <div className='users-total'>
              <br></br>
            Total Number of Users
              <div className='usersCount'>{usersCount}</div>
            </div>
        
        </div>
      </div>

    )
}

export default SysAdminDashboard;