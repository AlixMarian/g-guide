import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '/backend/firebase';

export const SysAdminDashboard = () => {
  const navigate = useNavigate();
  
  const [churchCount, setChurchCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0); 
  const [cebuChurchCount, setCebuChurchCount] = useState(0);

  const animateCount = (startValue, endValue, element) => {
    let current = startValue;
    const duration = Math.floor(1500 / endValue); 

    const counter = setInterval(() => {
      current += 1;
      element.textContent = current; 

      if (current >= endValue) {
        clearInterval(counter); 
      }
    }, duration);
  };

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (!user) {
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
        const approvedChurches = churchSnapshot.docs.filter(doc => 
          doc.data().churchStatus === "Approved" 
        );
        
        setChurchCount(approvedChurches.length);
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

    const fetchCebuChurchCount = async () => {
      try {
        const churchLocationCollection = collection(db, 'churchLocation');
        const churchLocationSnapshot = await getDocs(churchLocationCollection);
        setCebuChurchCount(churchLocationSnapshot.size);
      } catch (error) {
        console.error("Error fetching church location count:", error);
      }
    };

    fetchCebuChurchCount();
    fetchChurchCount();
    fetchUsersCount();
  }, []);

  useEffect(() => {
    const elements = [
      { element: document.querySelector(".sysAdminchurch-count"), count: churchCount },
      { element: document.querySelector(".sysAdminuser-count"), count: usersCount },
      { element: document.querySelector(".sysAdmincebu-church-count"), count: cebuChurchCount }
    ];
  
    elements.forEach(({ element, count }) => {
      if (element && count > 0) {
        animateCount(0, count, element);
      }
    });
  }, [churchCount, usersCount, cebuChurchCount]);  

  return (
    <div className='admin-dashboard'>
      <h1 className="me-3">Admin Dashboard</h1>
      <div className='dashboard-container'>
        <div className="sysAdmincard shadow-lg">
          <div className="sysAdmincard-header">Registered Church Count</div>
          <div className="sysAdmincard-number sysAdminchurch-count">{churchCount}</div>
        </div>
        <div className="sysAdmincard shadow-lg">
          <div className="sysAdmincard-header">User Count</div>
          <div className="sysAdmincard-number sysAdminuser-count">{usersCount}</div>
        </div>
        <div className="sysAdmincard shadow-lg">
          <div className="sysAdmincard-header">Churches in Cebu</div>
          <div className="sysAdmincard-number sysAdmincebu-church-count">{cebuChurchCount}</div>
        </div>
      </div>
    </div>
  );
};

export default SysAdminDashboard;
