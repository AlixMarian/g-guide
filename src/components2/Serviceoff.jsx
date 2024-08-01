import { useState, useEffect } from 'react';
import { db } from '/backend/firebase';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import '../churchCoordinator.css';

export const Serviceoff = () => {
    const [activeSchedules, setActiveSchedules] = useState([]);
    const [activeRequests, setActiveRequests] = useState([]);
    const [servicesState, setServicesState] = useState({});
    const [userID, setUserID] = useState(null);

    const auth = getAuth();

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserID(user.uid);
            } else {
                setUserID(null);
            }
        });
    }, [auth]);

    useEffect(() => {
        if (userID) {
            const fetchData = async () => {
                const userDoc = await getDoc(doc(db, "services", userID));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const servicesStatus = {};
                    const schedules = [];
                    const requests = [];
                    (userData.activeServices || []).forEach(serviceName => {
                        servicesStatus[serviceName] = true;
                        if (isSchedule(serviceName)) {
                            schedules.push(serviceName);
                        } else {
                            requests.push(serviceName);
                        }
                    });
                    setActiveSchedules(schedules);
                    setActiveRequests(requests);
                    setServicesState(servicesStatus);
                }
            };
            fetchData();
        }
    }, [userID]);

    const isSchedule = (serviceName) => {
        const schedules = ["Marriages", "Baptism", "Confirmation", "Burials"];
        return schedules.includes(serviceName);
    };

    const handleToggle = async (event) => {
        const serviceName = event.target.name;
        const isChecked = event.target.checked;

        let updatedServices = { ...servicesState, [serviceName]: isChecked };
        let activeServices = Object.keys(updatedServices).filter(service => updatedServices[service]);

        await setDoc(doc(db, "services", userID), { activeServices }, { merge: true });

        setServicesState(updatedServices);

        if (isChecked) {
            if (isSchedule(serviceName)) {
                setActiveSchedules([...activeSchedules, serviceName]);
            } else {
                setActiveRequests([...activeRequests, serviceName]);
            }
        } else {
            if (isSchedule(serviceName)) {
                setActiveSchedules(activeSchedules.filter(service => service !== serviceName));
            } else {
                setActiveRequests(activeRequests.filter(service => service !== serviceName));
            }
        }
    };

    return (
        <>
            <h1>Services Offered</h1>

            <div className="Services">
                <div className="offer1">
                    <h4>Schedules</h4>
                    <div className="Schedtogs">
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="marriages" name="Marriages" onChange={handleToggle} checked={!!servicesState['Marriages']} />
                            <label className="form-check-label" htmlFor="marriages">Marriages</label><br />
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="baptism" name="Baptism" onChange={handleToggle} checked={!!servicesState['Baptism']} />
                            <label className="form-check-label" htmlFor="baptism">Baptism</label><br />
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="confirmation" name="Confirmation" onChange={handleToggle} checked={!!servicesState['Confirmation']} />
                            <label className="form-check-label" htmlFor="confirmation">Confirmation</label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="burials" name="Burials" onChange={handleToggle} checked={!!servicesState['Burials']} />
                            <label className="form-check-label" htmlFor="burials">Burials</label>
                        </div>
                    </div>
                </div>

                <div className="offer2">
                    <h4>Request Documents</h4>
                    <div className="Schedtogs">
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="baptismalCert" name="Baptismal Certificate" onChange={handleToggle} checked={!!servicesState['Baptismal Certificate']} />
                            <label className="form-check-label" htmlFor="baptismalCert">Baptismal Certificate</label><br />
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="confirmationCert" name="Confirmation Certificate" onChange={handleToggle} checked={!!servicesState['Confirmation Certificate']} />
                            <label className="form-check-label" htmlFor="confirmationCert">Confirmation Certificate</label><br />
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="marriageCert" name="Marriage Certificate" onChange={handleToggle} checked={!!servicesState['Marriage Certificate']} />
                            <label className="form-check-label" htmlFor="marriageCert">Marriage Certificate</label><br />
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="enumerationsCert" name="Enumerations Certificate" onChange={handleToggle} checked={!!servicesState['Enumerations Certificate']} />
                            <label className="form-check-label" htmlFor="enumerationsCert">Enumerations Certificate</label><br />
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="burialCert" name="Burial Certificate" onChange={handleToggle} checked={!!servicesState['Burial Certificate']} />
                            <label className="form-check-label" htmlFor="burialCert">Burial Certificate</label><br />
                        </div>
                    </div>
                </div>
            </div>
            <div className="ServicesList">
                <h1>List of Services Offered</h1>
                <div className="serviceListActive">
                    <ul className="styled-list">
                        {activeSchedules.map(service => (
                            <li key={service} className="styled-list-item">
                                <span className="service-icon">♦</span> {service}
                            </li>
                        ))}
                    </ul>

                    <ul className="styled-list">
                        {activeRequests.map(service => (
                            <li key={service} className="styled-list-item">
                                <span className="service-icon">♦</span> {service}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default Serviceoff;
