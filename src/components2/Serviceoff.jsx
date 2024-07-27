import { useState, useEffect } from 'react';
import { db } from '/backend/firebase';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import '../churchCoordinator.css';

export const Serviceoff = () => {
    const [activeSchedules, setActiveSchedules] = useState([]);
    const [activeRequests, setActiveRequests] = useState([]);
    const [servicesState, setServicesState] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            const querySnapshot = await getDocs(collection(db, "services"));
            const schedules = [];
            const requests = [];
            const servicesStatus = {};
            querySnapshot.forEach((doc) => {
                const serviceData = doc.data().name;
                servicesStatus[serviceData] = true; // Mark the service as active
                if (isSchedule(serviceData)) {
                    schedules.push(serviceData);
                } else {
                    requests.push(serviceData);
                }
            });
            setActiveSchedules(schedules);
            setActiveRequests(requests);
            setServicesState(servicesStatus);
        };
        fetchData();
    }, []);

    const isSchedule = (serviceName) => {
        const schedules = ["Marriages", "Baptism", "Confirmation", "Burials",];
        return schedules.includes(serviceName);
    };

    const handleToggle = async (event) => {
        const serviceName = event.target.name;
        const isChecked = event.target.checked;

        if (isChecked) {
            await setDoc(doc(db, "services", serviceName), { name: serviceName });
            if (isSchedule(serviceName)) {
                setActiveSchedules([...activeSchedules, serviceName]);
            } else {
                setActiveRequests([...activeRequests, serviceName]);
            }
        } else {
            await deleteDoc(doc(db, "services", serviceName));
            if (isSchedule(serviceName)) {
                setActiveSchedules(activeSchedules.filter(service => service !== serviceName));
            } else {
                setActiveRequests(activeRequests.filter(service => service !== serviceName));
            }
        }

        setServicesState(prevState => ({
            ...prevState,
            [serviceName]: isChecked,
        }));
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
