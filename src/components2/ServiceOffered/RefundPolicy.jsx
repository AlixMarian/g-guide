import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../churchCoordinator.css';

export const RefundPolicy = () => {
    const navigate = useNavigate();
    const [refPolicyBodyInput, setRefPolicyBodyInput] = useState('');
    const [churchData, setChurchData] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleBodyChange = (e) => setRefPolicyBodyInput(e.target.value);

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Fetch user document
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        // Fetch church document associated with the user
                        const churchDoc = await getDoc(doc(db, "church", user.uid));
                        if (churchDoc.exists()) {
                            const churchData = churchDoc.data();
                            setChurchData(churchData); // Set church data, including refundPolicy
                            setRefPolicyBodyInput(churchData.refundPolicy || ''); // Populate text area with current refundPolicy
                        } else {
                            toast.error("Church data not found");
                        }
                    } else {
                        toast.error("User data not found");
                    }
                } catch (error) {
                    console.error("Error fetching user or church data:", error);
                    toast.error("Error fetching user data");
                }
            } else {
                navigate('/login');
            }
            setLoading(false);
        });
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            toast.error("User is not logged in.");
            return;
        }

        if (!refPolicyBodyInput) {
            toast.error('Please enter a refund policy.');
            return;
        }

        try {
            // Update the refundPolicy in Firestore
            const churchDocRef = doc(db, "church", user.uid);
            await updateDoc(churchDocRef, {
                refundPolicy: refPolicyBodyInput
            });
            toast.success('Refund policy updated successfully!');
            
            // Update local state with new refund policy
            setChurchData((prevData) => ({
                ...prevData,
                refundPolicy: refPolicyBodyInput
            }));
        } catch (error) {
            console.error("Error updating refund policy:", error);
            toast.error('Failed to update refund policy.');
        }
    };

    return (
        <>
            <h1 className="me-3">Refund Policy</h1>
            <div className="container mt-5">
                <div className="row">
                    
                    <div className="col-md-5">
                        <div className="card shadow-lg">
                            <div className="card-body">
                                <h3>Edit Refund Policy</h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="contentArea col-md-12">
                                        <textarea
                                            className="form-control"
                                            id="content"
                                            rows="10"
                                            value={refPolicyBodyInput}
                                            onChange={handleBodyChange}
                                            required
                                        ></textarea>
                                        <br />
                                        <div className="d-flex justify-content-end">
                                            <button type="submit" className="btn btn-success">Update Policy</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    
                    <div className="col-md-7">
                        <div className="card shadow-lg">
                            <div className="card-body">
                            <h3 className="card-title">Refund Policy</h3>
                                {!loading && churchData && churchData.refundPolicy ? (
                                <>
                                <p className="card-text">{churchData.refundPolicy}</p>
                                </>
                                ) : (
                                    <p>No refund policy available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RefundPolicy;
