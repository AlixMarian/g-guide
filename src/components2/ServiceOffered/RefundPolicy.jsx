import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db} from '/backend/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../churchCoordinator.css';


export const RefundPolicy = () => {
    const navigate = useNavigate();
    const [refPolicyBodyInput, setRefPolicyBodyInput] = useState('');
    const handleBodyChange = (e) => setRefPolicyBodyInput(e.target.value);
    const [services, setservices] = useState([]);
    const [selectedService, setSelectedService] = useState('');

    const handleServiceChange = (e) => setSelectedService(e.target.value);

    const auth = getAuth();
    const user = auth.currentUser;

      useEffect(() => {
        const auth = getAuth();
          onAuthStateChanged(auth, async (user) => {
            if (user) {
              console.log("User signed in:", user);
              console.log("User id signed in:", user.uid);
              try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  setUserData(userData);
      
                  const churchDoc = await getDoc(doc(db, "church", user.uid));
                  if (churchDoc.exists()) {
                    setChurchData(churchDoc.data());
                  } else {
                    toast.error("Church data not found");
                  }
                } else {
                  toast.error("User data not found");
                }
              } catch (error) {
                toast.error("Error fetching user data");
              }
            } else {
              console.log("No user signed in.");
              navigate('/login');
            }
          });
        }, [navigate]);

        const fetchServices = async (user) => {
            const q = query(collection(db, 'services'), where('creatorId', '==', user.uid));
            const eventsSnapshot = await getDocs(q);
            const eventsList = eventsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setServices(eventsList);
          };
        
          useEffect(() => {
            const auth = getAuth();
            onAuthStateChanged(auth, (user) => {
              if (user) {
                fetchServices(user);
              } else {
                console.log("No user signed in.");
              }
            });
          }, []);

    return (
        <>
        <h1 className="me-3">Refund Policy</h1>
            <div className="container mt-5">
                <div className="row">
            
      {/* Left side - Create/Edit Post form */}
                    <div className="col-md-5">
                        <div className="card shadow-lg" style={{ width: "100%" }}>
                        <div className="card-body">
                            <h3></h3>
                            <form>
                            
                            <div className='contentArea col-md-12'>
                                <label className="form-label">Enter Refund Policy</label>
                                    <select className="form-select" id="service"  value={selectedService} onChange={handleServiceChange}required>
                                        <option value="" disabled>Select a service</option>
                                            {services.map((services) => (
                                                <option key={services.id} value={services.eventName}>
                                                {services.eventName}
                                                </option>
                                            ))}
                                    </select>
                                <textarea className="form-control" id="content" rows="10" value={refPolicyBodyInput} onChange={handleBodyChange}required></textarea>
                                <br />
                            </div>
                            </form>
                        </div>
                        </div>
                    </div>


                    <div className="col-md-6">
                        <div className="card shadow-lg">
                            <div className="card-body">
                                <label className="form-label">All Policy</label>

    {/* 
                                {refundPolicy.map(()=>(
                                    <div className="card mb-3" key={post.id}>
                                        <div className="card-body">
                                            <p className="card-text">

                                            </p>
                                        </div>
                                    </div>
                                ))
                                }
                                */}
                            </div>
                        </div>
                    </div>   

            </div>
        </div>
    </>
    );
};

export default RefundPolicy;
