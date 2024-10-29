import { useState, useEffect } from 'react';
import { db } from '/backend/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
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
        const userDoc = await getDoc(doc(db, "services", uid));
        if (userDoc.exists()) {
            setServicesState(userDoc.data());
        }
    };

    const isSchedule = (serviceName) => {
        const schedules = ["Marriages", "Baptism", "Confirmation", "Burials", "Mass Intentions"];
        return schedules.includes(serviceName);
    };

    const handleToggle = async (event) => {
        const serviceName = event.target.name;
        const isChecked = event.target.checked;

        const updatedService = {
            ...servicesState[serviceName],
            active: isChecked,
        };
        const updatedServicesState = { ...servicesState, [serviceName]: updatedService };

        await setDoc(doc(db, "services", userID), updatedServicesState, { merge: true });
        setServicesState(updatedServicesState);
    };

    const handleInputChange = async (event, serviceName, field) => {
        const value = event.target.value;

        const updatedService = {
            ...servicesState[serviceName],
            [field]: value,
        };
        const updatedServicesState = { ...servicesState, [serviceName]: updatedService };

        await setDoc(doc(db, "services", userID), updatedServicesState, { merge: true });
        setServicesState(updatedServicesState);
    };

    return (
        <>
            <h1>Explore Services</h1>
            <div className="Services">
                <div className="offer1">
                    <div className="header">Appointments</div>
                    <div className="Schedtogs">
                        {["Marriages", "Baptism", "Confirmation", "Burials", "Mass Intentions"].map(service => (
                            <div key={service} className="form-check">
                                <div className="service1">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={service.toLowerCase()}
                                        name={service}
                                        onChange={handleToggle}
                                        checked={!!(servicesState[service]?.active)}
                                    />
                                    <label className="form-check-label" htmlFor={service.toLowerCase()}>{service}</label>
                                    <div className="col-xs-2">
                                        <input
                                            className="fee-input"
                                            type="text"
                                            placeholder="input fee"
                                            value={servicesState[service]?.fee || ''}
                                            onChange={(e) => handleInputChange(e, service, 'fee')}
                                        />
                                    </div>
                                </div>
                                <input
                                    className="fee-input"
                                    type="text"
                                    placeholder="Instruction for Service"
                                    value={servicesState[service]?.instructions || ''}
                                    onChange={(e) => handleInputChange(e, service, 'instructions')}
                                /><br />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="offer2">
                    <div className="header">Document Requests</div>
                    <div className="Schedtogs">
                        {["Baptismal Certificate", "Confirmation Certificate", "Marriage Certificate", "Burial Certificate"].map(service => (
                            <div key={service} className="form-check">
                                <div className="service1">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={service.toLowerCase().replace(" ", "")}
                                        name={service}
                                        onChange={handleToggle}
                                        checked={!!(servicesState[service]?.active)}
                                    />
                                    <label className="form-check-label" htmlFor={service.toLowerCase().replace(" ", "")}>{service}</label>
                                    <div className="col-xs-2">
                                        <input
                                            className="fee-input"
                                            type="text"
                                            placeholder="input fee"
                                            value={servicesState[service]?.fee || ''}
                                            onChange={(e) => handleInputChange(e, service, 'fee')}
                                        />
                                    </div>
                                </div>
                                <input
                                    className="fee-input"
                                    type="text"
                                    placeholder="Instruction for Service"
                                    value={servicesState[service]?.instructions || ''}
                                    onChange={(e) => handleInputChange(e, service, 'instructions')}
                                /><br />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ExploreServices;
