import { useState, useEffect } from 'react';
import { db } from '/backend/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import '../../churchCoordinator.css';

export const ExploreServices = () => {
    const [servicesState, setServicesState] = useState({});
    const [userID, setUserId] = useState(null);

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

        try {
            await setDoc(doc(db, "services", userID), updatedServicesState, { merge: true });
            setServicesState(updatedServicesState);
        } catch (error) {
            console.error("Error updating service toggle:", error);
        }
    };

    const handleChange = (serviceName, field, value) => {
        const updatedService = {
            ...servicesState[serviceName],
            [field]: value,
        };
        setServicesState({ ...servicesState, [serviceName]: updatedService });
    };

    const handleSubmit = async () => {
        try {
            await setDoc(doc(db, "services", userID), servicesState, { merge: true });
            toast.success("Services updated successfully!");
        } catch (error) {
            console.error("Error updating services:", error);
        }
    };

    const renderServiceFields = (services) =>
        services.map((service) => (
            <div key={service} className="form-check">
                <div className="service1">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id={service.toLowerCase().replace(/ /g, '')}
                        name={service}
                        onChange={handleToggle}
                        checked={!!(servicesState[service]?.active)}
                    />
                    <label
                        className="form-check-label"
                        htmlFor={service.toLowerCase().replace(/ /g, '')}>
                        {service}
                    </label>
                    <div className="col-xs-2">
                        <input
                            className="fee-input"
                            type="text"
                            placeholder="Input fee"
                            value={servicesState[service]?.fee || ''}
                            onChange={(e) => handleChange(service, 'fee', e.target.value)}
                        />
                    </div>
                </div>
                <input
                    className="fee-input"
                    type="text"
                    placeholder="Instruction for Service"
                    value={servicesState[service]?.instructions || ''}
                    onChange={(e) => handleChange(service, 'instructions', e.target.value)}
                /><br />
            </div>
        ));

    return (
        <>
            <h1>Explore Services</h1>
                <div className="Services">
                    <div className="offer1">
                        <div className="header">Appointments</div>
                            <div className="Schedtogs">
                                {renderServiceFields([
                                    "Marriages",
                                    "Baptism",
                                    "Confirmation",
                                    "Burials",
                                    "Mass Intentions",
                                ])}
                            </div>
                    </div>

                    <div className="offer2">
                        <div className="header">Document Requests</div>
                            <div className="Schedtogs">
                                {renderServiceFields([
                                    "Baptismal Certificate",
                                    "Confirmation Certificate",
                                    "Marriage Certificate",
                                    "Burial Certificate",
                                ])}
                            </div>
                    </div>
                </div>

                <div className="position-relative">
                    <div className="position-absolute bottom-0 end-0 mb-3 me-3">
                        <button className="btn btn-primary" onClick={handleSubmit}>
                        Submit
                        </button>
                    </div>
                </div>
        </>
    );
};

export default ExploreServices;
