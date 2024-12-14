import { useEffect, useState } from "react";
import { Modal, Button, Pagination, Dropdown, DropdownButton} from 'react-bootstrap';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "/backend/firebase"; 
import { getAuth } from 'firebase/auth';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import '../../churchCoordinator.css'
import loadingGif from '/src/assets/Ripple@1x-1.0s-200px-200px.gif';


export const MassIntentions = () => {
    const [massIntentions, setMassIntentions] = useState([]);
    const [showMassIntentionModal, setShowMassIntentionModal] = useState(false);
    const [selectedMassIntention, setSelectedMassIntention] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedMassDay, setSelectedMassDay] = useState("All");
    const auth = getAuth();
    const user = auth.currentUser;
    const intentionsPerPage = 7; 
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchMassIntentions = async () => {
            if (!user) return;
            try{
                const coordinatorQuery = query(
                    collection(db, "coordinator"),
                    where("userId", "==", user.uid)
                );
                const coordinatorSnapshot = await getDocs(coordinatorQuery);
                
                if (coordinatorSnapshot.empty) {
                    console.log("No coordinator found for this user.");
                    return;
                }
                const coordinatorID = coordinatorSnapshot.docs[0].id;

                if (!coordinatorID) {
                    console.error("Coordinator ID is undefined.");
                    return;
                }

                const churchQuery = query(
                    collection(db, "church"),
                    where("coordinatorID", "==", coordinatorID)
                );
                const churchSnapshot = await getDocs(churchQuery);
                
                if (churchSnapshot.empty) {
                    console.log("No church found for this coordinator.");
                    return;
                }
                const churchID = churchSnapshot.docs[0].id;

                if (!churchID) {
                    console.error("Church ID is undefined.");
                    return;
                }

                const massIntentionsQuery = query(
                    collection(db, "massIntentions"), 
                    where("churchId", "==", churchID)
                );
                const massIntentionsSnapshot = await getDocs(massIntentionsQuery);
                const massIntentionsData = massIntentionsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .sort((a, b) => {
                    const dateA = a.userFields?.dateOfRequest?.seconds || 0;
                    const dateB = b.userFields?.dateOfRequest?.seconds || 0;
                    return dateB - dateA; 
                });
                console.log("Fetched Data: ", massIntentionsData);
                setMassIntentions(massIntentionsData);
                setLoading(false);
            } catch (error){
                console.error("Error fetching appointments: ", error);
                setLoading(false);
        }
    };
        fetchMassIntentions();
    }, [user]);

    const handleShowMassIntentionModal = (intention) => {
        setSelectedMassIntention(intention);
        setShowMassIntentionModal(true);
    };
    
    const handleCloseMassIntentionModal = () => {
        setShowMassIntentionModal(false);
        setSelectedMassIntention(null);
    };

    const formatDate = (timestamp) => {
        if (!timestamp || !timestamp.seconds) {
            return 'Invalid Date';
        }
        const date = new Date(timestamp.seconds * 1000);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    };

    const convertTo12HourFormat = (time) => {
        if (!time || time === "none") return "none";
        const [hours, minutes] = time.split(':');
        let hours12 = (hours % 12) || 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        return `${hours12}:${minutes} ${ampm}`;
    };

    const filteredIntentions = massIntentions.filter((intention) => {
        const matchesDateOfRequest = selectedDate
            ? new Date(intention.dateOfRequest?.seconds * 1000).toDateString() === selectedDate.toDateString()
            : true;
    
        const matchesMassDay = selectedMassDay === "All"
            || (intention.massSchedule?.massDate && intention.massSchedule.massDate === selectedMassDay);
    
        return matchesDateOfRequest && matchesMassDay;
    });
    
    

    const indexOfLastIntention = currentPage * intentionsPerPage;
    const indexOfFirstIntention = indexOfLastIntention - intentionsPerPage;
    const currentMassIntentions = filteredIntentions.slice(indexOfFirstIntention, indexOfLastIntention);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <img src={loadingGif} alt="Loading..." style={{ width: '100px', justifyContent: 'center' }} />
        </div>  
        )
    }
    
    return (
        <>
        <h1 className="me-3">Mass Intentions</h1>
        <div className="d-flex justify-content-center align-items-center mt-5">
        <div className="card shadow-lg" style={{ width: "80%" }}>
            <div className="card-body">
            <div className="row mb-4 align-items-center">
            <div className="col-md-4">
                <div className="form-group w-100">
                    <label className="form-label"><b>Filter by Date of Request:</b></label>
                    <div className="input-group">
                        <DatePicker
                        className="form-control"
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        showYearDropdown
                        />
                    <button className="btn btn-danger" onClick={() => setSelectedDate(null)}>Clear</button>
                    </div>
                </div>
            </div>
            <div className="col-md-4">
                <div className="form-group w-100">
                    <label className="form-label"><b>Filter by Mass Day:</b></label>
                        <DropdownButton id="dropdown-basic-button" title={`Mass Day: ${selectedMassDay}`} variant="secondary">
                        <Dropdown.Item onClick={() => setSelectedMassDay("All")}>All</Dropdown.Item>
                        <Dropdown.Item onClick={() => setSelectedMassDay("Sunday")}>Sunday</Dropdown.Item>
                        <Dropdown.Item onClick={() => setSelectedMassDay("Monday")}>Monday</Dropdown.Item>
                        <Dropdown.Item onClick={() => setSelectedMassDay("Tuesday")}>Tuesday</Dropdown.Item>
                        <Dropdown.Item onClick={() => setSelectedMassDay("Wednesday")}>Wednesday</Dropdown.Item>
                        <Dropdown.Item onClick={() => setSelectedMassDay("Thursday")}>Thursday</Dropdown.Item>
                        <Dropdown.Item onClick={() => setSelectedMassDay("Friday")}>Friday</Dropdown.Item>
                        <Dropdown.Item onClick={() => setSelectedMassDay("Saturday")}>Saturday</Dropdown.Item>
                        </DropdownButton>
                </div>
            </div>
            </div>
            <table className="table">
                <thead className="table-dark">
                <tr>
                    <th scope="col" className="massIntention-th">Date of Request</th>
                    <th scope="col" className="massIntention-th">Mass Date</th>
                    <th scope="col" className="massIntention-th">Mass Time</th>
                    <th scope="col" className="massIntention-th">Requested by</th>
                    <th scope="col" className="massIntention-th">More Info</th>
                </tr>
                </thead>
                <tbody>
                {currentMassIntentions.length > 0 ? (
                    currentMassIntentions.map((intention, index) => (
                        <tr key={index}>
                            <td className="massIntention-td">{formatDate(intention.dateOfRequest)}</td>
                            <td className="massIntention-td">{intention.massSchedule?.massDate}</td>
                            <td className="massIntention-td">{convertTo12HourFormat(intention.massSchedule?.massTime)}</td>
                            <td className="massIntention-td">{intention.userFields.requesterName}</td>
                            <td className="massIntention-td">
                                <Button variant="info" onClick={() => handleShowMassIntentionModal(intention)}>
                                    <i className="bi bi-info-circle-fill"></i>
                                </Button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="7" className="text-center py-5">
                            <h4 className="text-muted">No mass intentions found</h4>
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
            {filteredIntentions.length > 0 && (
                    <Pagination className="justify-content-center">
                        {[...Array(Math.ceil(filteredIntentions.length / intentionsPerPage)).keys()].map((number) => (
                            <Pagination.Item
                                key={number + 1}
                                active={number + 1 === currentPage}
                                onClick={() => paginate(number + 1)}
                            >
                                {number + 1}
                            </Pagination.Item>
                        ))}
                    </Pagination>
            )}
            </div>
        </div>
        </div>


        <Modal show={showMassIntentionModal} onHide={handleCloseMassIntentionModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Mass Intention Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedMassIntention && (
                        <>
                            <p><strong>Date of Request:</strong> {formatDate(selectedMassIntention.dateOfRequest)}</p>
                            <p><strong>Mass Date:</strong> {selectedMassIntention.massSchedule?.massDate}</p>
                            <p><strong>Mass Time:</strong> {convertTo12HourFormat(selectedMassIntention.massSchedule?.massTime)}</p>
                            <p><strong>Requester Contact:</strong> {selectedMassIntention.userFields?.requesterContact}</p>
                            <p><strong>Requester Email:</strong> {selectedMassIntention.userFields?.requesterEmail}</p>
                            <p><strong>Requester Name:</strong> {selectedMassIntention.userFields?.requesterName}</p>
                            
                            <br/>
                            <p><strong>Petition:</strong> {selectedMassIntention.petition || 'none'}</p>
                            <p><strong>Thanksgiving Mass:</strong> {selectedMassIntention.thanksgivingMass || 'none'}</p>
                            <p><strong>For the Souls of:</strong> {selectedMassIntention.forTheSoulOf || 'none'}</p>
                            <br/>

                            <p><strong>Mass Intention receipt:</strong> <a href={selectedMassIntention.receiptImage} target="_blank" rel="noopener noreferrer">View Document</a></p>
                        </>
                    )}
                </Modal.Body>
        </Modal>
        </>
    );
};

export default MassIntentions;
