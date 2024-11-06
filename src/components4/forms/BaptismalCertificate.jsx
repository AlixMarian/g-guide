import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, Timestamp, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db, storage } from '/backend/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';

export const BaptismalCertificate = () => {
    const { churchId } = useParams();
    const auth = getAuth();
    const user = auth.currentUser;
    const [churchData, setChurchData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authorizationImageFile, setAuthorizationImageFile] = useState(null);
    const [refundPolicy, setRefundPolicy] = useState('');
    const [showAuthorization, setShowAuthorization] = useState(false);
    const [appointmentPurpose, setAppointmentPurpose] = useState('personal');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthday: '',
        fatherFirstName: '',
        fatherLastName: '',
        motherFirstName: '',
        motherLastName: '',
    });

    const fullName = userData ? `${userData.firstName || ''} ${userData.lastName || ''}` : '';

    useEffect(() => {
        const fetchChurchData = async () => {
            const docRef = doc(db, 'church', churchId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setChurchData(docSnap.data());
            }
        };

        const fetchRefundPolicy = async () => {
            try {
                const churchDocRef = doc(db, 'church', churchId);
                const churchDocSnap = await getDoc(churchDocRef);
                if (churchDocSnap.exists()) {
                    setRefundPolicy(churchDocSnap.data().refundPolicy || "No refund policy available.");
                } else {
                    setRefundPolicy("No refund policy available.");
                }
            } catch (error) {
                console.error("Error fetching refund policy:", error);
                toast.error("Failed to fetch refund policy.");
            }
        };

        const fetchUserData = async () => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUserData(userDocSnap.data());
                }
            }
            setLoading(false);
        };

        fetchChurchData();
        fetchRefundPolicy();
        fetchUserData();
    }, [churchId, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handlePersonalClick = () => {
        setAppointmentPurpose('personal');
        setShowAuthorization(false);
        setFormData(prevState => ({
            ...prevState,
            firstName: userData?.firstName || '',
            lastName: userData?.lastName || '',
        }));
    };

    const handleOthersClick = () => {
        setAppointmentPurpose('others');
        setShowAuthorization(true);
        setFormData(prevState => ({
            ...prevState,
            firstName: '',
            lastName: '',
        }));
    };

    const handleAuthorizationUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAuthorizationImageFile(file);
        } else {
            toast.error("No image detected");
        }
    };

    const handleCreateAppointment = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("User is not authenticated");
            return;
        }

        try {
            // Upload authorization image if provided
            let authorizationImageUrl = 'none';
            if (authorizationImageFile) {
                const storageRef = ref(storage, `userAuthorizationLetter/${user.uid}/${authorizationImageFile.name}`);
                await uploadBytes(storageRef, authorizationImageFile);
                authorizationImageUrl = await getDownloadURL(storageRef);
            }

            // Prepare appointment data
            const appointmentData = {
                appointmentType: 'baptismalCertificate',
                appointmentStatus: 'Pending',
                appointmentPurpose,
                authorizationLetter: authorizationImageUrl,
                paymentImage: 'none',
                churchId,
                userFields: {
                    requesterId: user.uid,
                    requesterName: fullName,
                    requesterContact: userData?.contactNum || '',
                    requesterEmail: userData?.email || '',
                    dateOfRequest: Timestamp.fromDate(new Date()),
                },
                baptismalCertificate: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    birthday: formData.birthday,
                    fatherFirstName: formData.fatherFirstName,
                    fatherLastName: formData.fatherLastName,
                    motherFirstName: formData.motherFirstName,
                    motherLastName: formData.motherLastName,
                }
            };

            // Save appointment to Firestore
            await addDoc(collection(db, 'appointments'), appointmentData);
            toast.success("Request submitted to Church Coordinator. Please wait for approval");
            resetForm();
        } catch (error) {
            console.error("Error submitting request:", error);
            toast.error(`Error submitting request: ${error.message}`);
        }
    };

    const handleClear = () => {
        resetForm();
        toast.success('Form cleared');
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            birthday: '',
            fatherFirstName: '',
            fatherLastName: '',
            motherFirstName: '',
            motherLastName: '',
        });
        setAuthorizationImageFile(null);
        setShowAuthorization(false);
        setAppointmentPurpose('personal');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <form className="baptismalCert" onSubmit={handleCreateAppointment}>

                {/* Appointment Purpose Section */}
                <div className='purpose card mb-4'>
                    <div className='card-body'>
                        <h5 className='card-title'>Who is the Appointment For?</h5>
                        <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                            <button type='button' className='btn btn-primary' onClick={handlePersonalClick}>Personal</button>
                            <button type='button' className='btn btn-primary' onClick={handleOthersClick}>Others</button>
                        </div>
                    </div>
                </div>

                {/* Authorization Upload Section */}
                {showAuthorization && (
                    <div className='authorization card mb-4'>
                        <div className='card-body'>
                            <h5 className='card-title'>Submit Authorization Letter</h5>
                            <p>Submit an authorization letter with a clear image of the signature and a valid ID.</p>
                            <input type="file" className="form-control" onChange={handleAuthorizationUpload} required/>
                        </div>
                    </div>
                )}

                {/* User Details Section */}
                <div className="userDetails card mb-4">
                    <div className="card-body">
                        <h5 className="card-title">User Details</h5>
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label">Selected Service</label>
                                <input type="text" className="form-control" readOnly value="Baptismal Certificate" />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">User Name</label>
                                <input type="text" className="form-control" readOnly value={fullName} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">User Contact</label>
                                <input type="text" className="form-control" readOnly value={userData?.contactNum || ''} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">User Email</label>
                                <input type="text" className="form-control" readOnly value={userData?.email || ''} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Refund Policy Section */}
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title">Refund Policy</h5>
                        <p>{refundPolicy}</p>
                    </div>
                </div>

                {/* Form Fields Section */}
                <div className="submitReq card mb-4">
                    <div className="card-body">
                        <h5 className="card-title">Submit Requirements</h5>
                        <div className="row mb-3">
                            <div className="col mb-3">
                                <label htmlFor="firstName" className="form-label">First Name</label>
                                <input type="text" className="form-control" name="firstName" onChange={handleChange} value={formData.firstName} required/>
                            </div>
                            <div className="col mb-3">
                                <label htmlFor="lastName" className="form-label">Last Name</label>
                                <input type="text" className="form-control" name="lastName" onChange={handleChange} value={formData.lastName} required/>
                            </div>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="birthday" className="form-label">Birthday</label>
                            <input type="date" className="form-control" name="birthday" onChange={handleChange} value={formData.birthday} required/>
                        </div>

                        {/* Father's Details */}
                        <div><b>Father's Details</b></div>
                        <div className="row mb-3">
                            <div className="col">
                                <label htmlFor="fatherFirstName" className="form-label">First Name</label>
                                <input type="text" className="form-control" name="fatherFirstName" onChange={handleChange} value={formData.fatherFirstName} required/>
                            </div>
                            <div className="col">
                                <label htmlFor="fatherLastName" className="form-label">Last Name</label>
                                <input type="text" className="form-control" name="fatherLastName" onChange={handleChange} value={formData.fatherLastName} required/>
                            </div>
                        </div>

                        {/* Mother's Details */}
                        <div><b>Mother's Details</b></div>
                        <div className="row mb-3">
                            <div className="col">
                                <label htmlFor="motherFirstName" className="form-label">First Name</label>
                                <input type="text" className="form-control" name="motherFirstName" onChange={handleChange} value={formData.motherFirstName} required/>
                            </div>
                            <div className="col">
                                <label htmlFor="motherLastName" className="form-label">Last Name</label>
                                <input type="text" className="form-control" name="motherLastName" onChange={handleChange} value={formData.motherLastName} required/>
                            </div>
                        </div>

                        {/* Submit and Clear Buttons */}
                        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                            <button type="submit" className="btn btn-success">Submit Request</button>
                            <button type="reset" className="btn btn-danger" onClick={handleClear}>Clear</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default BaptismalCertificate;
