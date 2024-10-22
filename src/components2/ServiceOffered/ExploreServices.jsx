import { useState, useEffect } from 'react';
import { db } from '/backend/firebase';
import { doc, getDoc, setDoc} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import '../../churchCoordinator.css'

export const ExploreServices = () => {
    const [activeSchedules, setActiveSchedules] = useState([]);
    const [activeRequests, setActiveRequests] = useState([]);
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
            toast.error('No user is logged in');
          }
        });
    
        return () => unsubscribe();
      }, []);

      useEffect(() => {
        if (userID) {
            const fetchData = async () => {
                const userDoc = await getDoc(doc(db, "services", userID));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const servicesStatus = {};
                    const schedules = userData.activeSchedules || [];
                    const requests = userData.activeRequests || [];
                    schedules.forEach(serviceName => {
                        servicesStatus[serviceName] = true;
                    });
                    requests.forEach(serviceName => {
                        servicesStatus[serviceName] = true;
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
        const schedules = ["Marriages", "Baptism", "Confirmation", "Burials","Mass Intentions"];
        return schedules.includes(serviceName);
    };

    const handleToggle = async (event) => {
        const serviceName = event.target.name;
        const isChecked = event.target.checked;

        let updatedServicesState = { ...servicesState, [serviceName]: isChecked };
        let activeSchedules = [];
        let activeRequests = [];

        Object.keys(updatedServicesState).forEach(service => {
            if (updatedServicesState[service]) {
                if (isSchedule(service)) {
                    activeSchedules.push(service);
                } else {
                    activeRequests.push(service);
                }
            }
        });

        await setDoc(doc(db, "services", userID), { activeSchedules, activeRequests }, { merge: true });

        setServicesState(updatedServicesState);
        setActiveSchedules(activeSchedules);
        setActiveRequests(activeRequests);
    };

    return (
        <>
            <h1>Explore Services</h1>

            <div className="Services">
                <div className="offer1">
                    <div className="header">Appointments</div>
                    <div className="Schedtogs">
                        <div className="form-check">
                            <div className="service1 ">
                                <input className="form-check-input" type="checkbox" id="marriages" name="Marriages" onChange={handleToggle} checked={!!servicesState['Marriages']} />
                                <label className="form-check-label" htmlFor="marriages">Marriages</label>
                                <div className='col-xs-2'>
                                    <input className="fee-input" type="text" id="marriagesFee" name="Marriages Fee" placeholder="input fee"/>
                                </div>
                            </div>
                                <input className="fee-input" type="text" placeholder="Instruction for Service"/><br />
                        </div>

                        <div className="form-check">
                            <div className="service1">
                                <input className="form-check-input" type="checkbox" id="baptism" name="Baptism" onChange={handleToggle} checked={!!servicesState['Baptism']} />
                                <label className="form-check-label" htmlFor="baptism">Baptism</label>
                                <div className='col-xs-2'>
                                    <input className="fee-input" type="text" id="baptismFee" name="Baptism Fee" placeholder="input fee"/>
                                </div>
                            </div>
                            <input className="fee-input" type="text" placeholder="Instruction for Service"/><br />
                        </div>
                        <div className="form-check">
                            <div className="service1">
                                <input className="form-check-input" type="checkbox" id="confirmation" name="Confirmation" onChange={handleToggle} checked={!!servicesState['Confirmation']} />
                                <label className="form-check-label" htmlFor="confirmation">Confirmation</label>
                                <div className='col-xs-2'>
                                    <input className="fee-input" type="text" id="confirmationFee" name="Confirmation Fee" placeholder="input fee"/>
                                </div>                            
                            </div>
                                <input className="fee-input" type="text" placeholder="Instruction for Service"/><br />
                        </div>
                        <div className="form-check">
                            <div className="service1">
                                <input className="form-check-input" type="checkbox" id="burials" name="Burials" onChange={handleToggle} checked={!!servicesState['Burials']} />
                                <label className="form-check-label" htmlFor="burials">Burials</label>
                                <div className='col-xs-2'>
                                    <input className="fee-input" type="text" id="burialFee" name="Burial Fee" placeholder="input fee"/>
                                </div>
                            </div>
                                <input className="fee-input" type="text" placeholder="Instruction for Service"/><br />
                        </div>
                        <div className="form-check">
                            <div className="service1">
                                <input className="form-check-input" type="checkbox" id="massintentions" name="Mass Intentions" onChange={handleToggle} checked={!!servicesState['Mass Intentions']} />
                                <label className="form-check-label" htmlFor="massintentions">Mass Intentions</label><br /> 
                                <div className='col-xs-2'>
                                    <input className="fee-input" type="text" id="intentionsFee" name="Intentions Fee" placeholder="input fee"/>
                                </div>
                            </div>
                                <input className="fee-input" type="text" placeholder="Instruction for Service"/><br />
                        </div>
                    </div>
                </div>

                <div className="offer2">
                    <div className="header">Document Requests</div>
                    <div className="Schedtogs">
                        <div className="form-check">
                            <div className="service1">
                                <input className="form-check-input" type="checkbox" id="baptismalCert" name="Baptismal Certificate" onChange={handleToggle} checked={!!servicesState['Baptismal Certificate']} />
                                <label className="form-check-label" htmlFor="baptismalCert">Baptismal Certificate</label><br />
                                <div className='col-xs-2'>
                                    <input className="fee-input" type="text" id="baptismalFee" name="Baptismal Fee" placeholder="input fee"/>
                                </div>
                            </div>
                                <input className="fee-input" type="text" placeholder="Instruction for Service"/><br />
                        </div>
                        <div className="form-check">
                            <div className="service1">
                                <input className="form-check-input" type="checkbox" id="confirmationCert" name="Confirmation Certificate" onChange={handleToggle} checked={!!servicesState['Confirmation Certificate']} />
                                <label className="form-check-label" htmlFor="confirmationCert">Confirmation Certificate</label><br />
                                <div className='col-xs-2'>
                                    <input className="fee-input" type="text" id="confirmationFee" name="Confirmation Fee" placeholder="input fee"/>
                                </div>
                            </div>
                                <input className="fee-input" type="text" placeholder="Instruction for Service"/><br />
                        </div>
                        <div className="form-check">
                            <div className="service1">
                                <input className="form-check-input" type="checkbox" id="marriageCert" name="Marriage Certificate" onChange={handleToggle} checked={!!servicesState['Marriage Certificate']} />
                                <label className="form-check-label" htmlFor="marriageCert">Marriage Certificate</label><br />
                                <div className='col-xs-2'>
                                    <input className="fee-input" type="text" id="marriagecertFee" name="Mcert Fee" placeholder="input fee"/>
                                </div>
                            </div>
                                <input className="fee-input" type="text" placeholder="Instruction for Service"/><br />
                        </div>
                        <div className="form-check">
                            <div className="service1">
                                <input className="form-check-input" type="checkbox" id="burialCert" name="Burial Certificate" onChange={handleToggle} checked={!!servicesState['Burial Certificate']} />
                                <label className="form-check-label" htmlFor="burialCert">Burial Certificate</label><br />
                                <div className='col-xs-2'>
                                    <input className="fee-input" type="text" id="burialcertFee" name="Bcert Fee" placeholder="input fee"/>
                                </div>
                            </div>
                                <input className="fee-input" type="text" placeholder="Instruction for Service"/><br />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ExploreServices;

