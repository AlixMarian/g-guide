import { useEffect, useState } from 'react';
import '../churchCoordinator.css';
import { db } from "/backend/firebase";
import { getDocs, collection } from 'firebase/firestore';

export const Church = () => {
    const [churchList, setChurchList] = useState([]);
    const [selectedChurch, setSelectedChurch] = useState(null);

    const churchCollectionRef = collection(db, "church");

    const getChurchList = async () => {
        try {
            const data = await getDocs(churchCollectionRef);
            const filteredData = data.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id
            }));
            setChurchList(filteredData);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        getChurchList();
    }, []);

    const handleChurchChange = (e) => {
        const church = churchList.find(church => church.id === e.target.value);
        setSelectedChurch(church);
    };

    return (
        <>
            <h1>Church Information</h1>
            <div className="announcementsCH">
                <h3>CHURCH NAME</h3>
                <label htmlFor="exampleFormControlTextarea1" className="form-label">
                    Church History
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                        <path fill="black" d="M7.243 17.997H3v-4.243L14.435 2.319a1 1 0 0 1 1.414 0l2.829 2.828a1 1 0 0 1 0 1.415zm-4.243 2h18v2H3z"/>
                    </svg>
                </label>
                <div className="mb-3">
                    <textarea className="form-control" id="exampleFormControlTextarea1" rows="5"></textarea>
                </div>
                <br></br>
            </div>

            <div className="editchurch">
                <form className="row g-3">
                    <div className="col-md-6">
                        <label htmlFor="churchSelect" className="form-label">Select Church</label>
                        <select className="form-select" id="churchSelect" onChange={handleChurchChange}>
                            <option value="" selected disabled>Select a church</option>
                            {churchList.map((church) => (
                                <option key={church.id} value={church.id}>{church.churchName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-6">
                        <label htmlFor="churchName" className="form-label">Church Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="churchName"
                            value={selectedChurch ? selectedChurch.churchName : ''}
                            readOnly
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="churchAddress" className="form-label">Church Address</label>
                        <input
                            type="text"
                            className="form-control"
                            id="churchAddress"
                            value={selectedChurch ? selectedChurch.churchAddress : ''}
                            readOnly
                        />
                    </div>
                    <div className="col-6">
                        <label htmlFor="churchEmail" className="form-label">Church Email</label>
                        <input
                            type="text"
                            className="form-control"
                            id="churchEmail"
                            value={selectedChurch ? selectedChurch.churchEmail : ''}
                            readOnly
                        />
                    </div>
                    <div className="col-6">
                        <label htmlFor="churchContactNum" className="form-label">Contact Details</label>
                        <input
                            type="text"
                            className="form-control"
                            id="churchContactNum"
                            value={selectedChurch ? selectedChurch.churchContactNum : ''}
                            readOnly
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="churchRegistrationDate" className="form-label">Registration Date</label>
                        <input
                            type="text"
                            className="form-control"
                            id="churchRegistrationDate"
                            value={selectedChurch ? new Date(selectedChurch.churchRegistrationDate).toLocaleString() : ''}
                            readOnly
                        />
                    </div>
                    <div className="col-12">
                        <label htmlFor="churchProof" className="form-label">Church Proof</label>
                        {selectedChurch ? (
                            <a href={selectedChurch.churchProof} target="_blank" rel="noopener noreferrer">
                                View Proof
                            </a>
                        ) : (
                            <p>No proof available</p>
                        )}
                    </div>
                </form>
                <br></br>
                <form className="row g-3">
                    <div className="col-6">
                        <label htmlFor="formFileMultiple" className="form-label">Multiple files input example</label>
                        <input className="form-control" type="file" id="formFileMultiple" multiple />
                    </div>
                    <div className="col-6">
                        <label htmlFor="formFileMultiple2" className="form-label">Multiple files input example</label>
                        <input className="form-control" type="file" id="formFileMultiple2" multiple />
                    </div>
                    <div className="col-6">
                        <label htmlFor="formFileMultiple3" className="form-label">Multiple files input example</label>
                        <input className="form-control" type="file" id="formFileMultiple3" multiple />
                    </div>
                    <div className="col-6">
                        <label htmlFor="formFileMultiple4" className="form-label">Multiple files input example</label>
                        <input className="form-control" type="file" id="formFileMultiple4" multiple />
                    </div>
                    <div className="announcement-bttn">
                        <button type="button" className="btn btn-success">Confirm Change</button>
                        <button type="button" className="btn btn-danger">Clear</button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default Church;
