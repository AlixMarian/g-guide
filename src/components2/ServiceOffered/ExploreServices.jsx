import { useState, useEffect } from 'react';
import { db } from '/backend/firebase';
import { doc, getDoc, setDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import { CheckCircle2, XCircle } from 'lucide-react';

export const ExploreServices = () => {
    const [servicesState, setServicesState] = useState({});
    // eslint-disable-next-line no-unused-vars
    const [userID, setUserId] = useState(null);
    const [churchID, setChurchId] = useState(null);
    const [isModified, setIsModified] = useState(false);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                fetchChurchId(user.uid);
            } else {
                setUserId(null);
                setChurchId(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchChurchId = async (uid) => {
        try {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.role === "churchCoor") {
                    const coordinatorQuery = query(
                        collection(db, "coordinator"),
                        where("userId", "==", uid)
                    );
                    const coordinatorSnapshot = await getDocs(coordinatorQuery);
    
                    if (!coordinatorSnapshot.empty) {
                        const coordinatorID = coordinatorSnapshot.docs[0].id;
                        const churchQuery = query(
                            collection(db, "church"),
                            where("coordinatorID", "==", coordinatorID)
                        );
                        const churchSnapshot = await getDocs(churchQuery);
    
                        if (!churchSnapshot.empty) {
                            const churchDoc = churchSnapshot.docs[0];
                            setChurchId(churchDoc.id);
                            fetchServices(churchDoc.id);
                        } else {
                            console.error("No church document found for the coordinator.");
                            toast.error("Unable to find a church associated with this coordinator.");
                        }
                    } else {
                        console.error("No coordinator document found for the user.");
                        toast.error("Unable to find coordinator information for this user.");
                    }
                } else {
                    console.error("User is not a church coordinator.");
                    toast.error("This user is not a church coordinator.");
                }
            } else {
                console.error("No user document found.");
                toast.error("No user data found.");
            }
        } catch (error) {
            toast.error("Error fetching churchId.");
            console.error("Error fetching churchId:", error);
        }
    };
    
    const fetchServices = async (churchId) => {
        try {
            const servicesDoc = await getDoc(doc(db, "services", churchId));
            if (servicesDoc.exists()) {
                setServicesState(servicesDoc.data());
            } else {
                console.log("No services document found for the churchId. A new one can be created.");
            }
        } catch (error) {
            toast.error("Error fetching services data.");
            console.error("Error fetching services data:", error);
        }
    };

    const handleToggle = (event) => {
        const serviceName = event.target.name;
        const isChecked = event.target.checked;

        const updatedService = {
            ...servicesState[serviceName],
            active: isChecked,
        };
        const updatedServicesState = { ...servicesState, [serviceName]: updatedService };

        setServicesState(updatedServicesState);
        setIsModified(true);
    };

    const handleChange = (serviceName, field, value) => {
        const updatedService = {
            ...servicesState[serviceName],
            [field]: value,
        };
        setServicesState({ ...servicesState, [serviceName]: updatedService });
        setIsModified(true);
    };

    const handleSubmit = async () => {
        if (!churchID) {
            toast.error("Church ID is missing. Cannot update services.");
            return;
        }
        for (const [serviceName, serviceDetails] of Object.entries(servicesState)) {
            if (serviceDetails.active) {
                if (!serviceDetails.fee || serviceDetails.fee <= 0) {
                    toast.error(`Service "${serviceName}" requires a valid fee.`);
                    return;
                }
                if (!serviceDetails.instructions || serviceDetails.instructions.trim() === "") {
                    toast.error(`Service "${serviceName}" requires instructions.`);
                    return;
                }
            }
        }
        try {
            await setDoc(doc(db, "services", churchID), servicesState, { merge: true });
            toast.success("Services updated successfully!");
            setIsModified(false);
        } catch (error) {
            toast.error("Error updating services.");
            console.error("Error updating services:", error);
        }
    };

    const renderServiceFields = (services) =>
        services.map((service) => (
            <div key={service} className="service-item">
                <div className="service-header">
                    <input
                        className="service-checkbox"
                        type="checkbox"
                        id={service.toLowerCase().replace(/ /g, '')}
                        name={service}
                        onChange={handleToggle}
                        checked={!!(servicesState[service]?.active)}
                    />
                    <label 
                        className="service-label" 
                        htmlFor={service.toLowerCase().replace(/ /g, '')}
                    >
                        {service}
                    </label>
                </div>
                <div className="service-details">
                    <input
                        className="fee-input"
                        type="number"
                        min="0"
                        placeholder="Service Fee"
                        value={servicesState[service]?.fee || ''}
                        onChange={(e) => handleChange(service, 'fee', e.target.value)}
                        required={servicesState[service]?.active}
                    />
                    <textarea
                        className="instructions-input"
                        placeholder="Service Instructions"
                        value={servicesState[service]?.instructions || ''}
                        onChange={(e) => handleChange(service, 'instructions', e.target.value)}
                        rows="2"
                        required={servicesState[service]?.active}
                    />
                </div>
            </div>
        ));

    return (
        <div className="explore-services-container">
            <h1 className="page-title">Configure Church Services</h1>
            <div className="services-grid">
                <div className="service-section">
                    <div className="section-header">Appointments</div>
                    <div className="service-list">
                        {renderServiceFields([
                            "Marriage",
                            "Baptism",
                            "Confirmation",
                            "Burial",
                            "Mass Intentions",
                        ])}
                    </div>
                </div>

                <div className="service-section">
                    <div className="section-header">Document Requests</div>
                    <div className="service-list">
                        {renderServiceFields([
                            "Baptismal Certificate",
                            "Confirmation Certificate",
                            "Marriage Certificate",
                            "Burial Certificate",
                        ])}
                    </div>
                </div>
            </div>

            <div className="submit-container">
                <button 
                    className="submit-button" 
                    onClick={handleSubmit}
                    disabled={!isModified || !churchID}
                >
                    {isModified ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default ExploreServices;
