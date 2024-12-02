import { useState, useEffect } from 'react';
import { db } from '/backend/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import { CheckCircle2, XCircle } from 'lucide-react';

export const ExploreServices = () => {
    const [servicesState, setServicesState] = useState({});
    const [userID, setUserId] = useState(null);
    const [isModified, setIsModified] = useState(false);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                fetchData(user.uid);
            } else {
                setUserId('');
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchData = async (uid) => {
        try {
            const userDoc = await getDoc(doc(db, "services", uid));
            if (userDoc.exists()) {
                setServicesState(userDoc.data());
            } else {
                console.log("No data found for the user");
            }
        } catch (error) {
            toast.error("Error fetching services data");
            console.error("Error fetching services data:", error);
        }
    };

    const handleToggle = async (event) => {
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
        try {
            await setDoc(doc(db, "services", userID), servicesState, { merge: true });
            toast.success("Services updated successfully!");
            setIsModified(false);
        } catch (error) {
            toast.error("Error updating services");
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
                    />
                    <textarea
                        className="instructions-input"
                        placeholder="Service Instructions"
                        value={servicesState[service]?.instructions || ''}
                        onChange={(e) => handleChange(service, 'instructions', e.target.value)}
                        rows="2"
                    />
                </div>
            </div>
        ));

    return (
    <>
        <h1 >Configure Church Services</h1>
        <div className="explore-services-container">
            <div className="services-grid">
                <div className="service-section">
                    <div className="section-header">Appointments</div>
                    <div className="service-list">
                        {renderServiceFields([
                            "Marriages",
                            "Baptism",
                            "Confirmation",
                            "Burials",
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
                    disabled={!isModified}
                >
                    {isModified ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    Save Changes
                </button>
            </div>
        </div>
        </>
    );
};

export default ExploreServices;