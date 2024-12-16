import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../churchCoordinator.css';

export const RefundPolicy = () => {
    const navigate = useNavigate();
    const [refPolicyBodyInput, setRefPolicyBodyInput] = useState('');
    const [churchData, setChurchData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [churchId, setChurchId] = useState(null);
    const handleBodyChange = (e) => setRefPolicyBodyInput(e.target.value);

    const fetchChurchId = async (userId) => {
        try {
            
            const coordinatorQuery = query(
                collection(db, 'coordinator'),
                where('userId', '==', userId)
            );
            const coordinatorSnapshot = await getDocs(coordinatorQuery);

            if (!coordinatorSnapshot.empty) {
                const coordinatorDoc = coordinatorSnapshot.docs[0];
                const churchQuery = query(
                    collection(db, 'church'),
                    where('coordinatorID', '==', coordinatorDoc.id)
                );
                const churchSnapshot = await getDocs(churchQuery);

                if (!churchSnapshot.empty) {
                    return churchSnapshot.docs[0].id; 
                } else {
                    toast.error("No church associated with this coordinator.");
                }
            } else {
                toast.error("Coordinator data not found.");
            }
        } catch (error) {
            console.error("Error fetching churchId:", error);
            toast.error("Failed to fetch church information.");
        }
        return null;
    };

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const fetchedChurchId = await fetchChurchId(user.uid);
                if (fetchedChurchId) {
                    setChurchId(fetchedChurchId);
                    try {
                        const churchDoc = await getDoc(doc(db, 'church', fetchedChurchId));
                        if (churchDoc.exists()) {
                            const churchData = churchDoc.data();
                            setChurchData(churchData);
                            setRefPolicyBodyInput(churchData.refundPolicy || '');
                        } else {
                            toast.error("Church data not found.");
                        }
                    } catch (error) {
                        console.error("Error fetching church data:", error);
                        toast.error("Error fetching church data.");
                    }
                }
            } else {
                navigate('/login');
            }
            setLoading(false);
        });
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!churchId) {
            toast.error("Church ID is missing. Cannot update the refund policy.");
            return;
        }

        if (!refPolicyBodyInput) {
            toast.error('Please enter a refund policy.');
            return;
        }

        try {
            
            const churchDocRef = doc(db, "church", churchId);
            await updateDoc(churchDocRef, {
                refundPolicy: refPolicyBodyInput
            });
            toast.success('Refund policy updated successfully!');
            
            
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
                                    <p className="card-text">{churchData.refundPolicy}</p>
                                ) : (
                                    <p>{loading ? "Loading..." : "No refund policy available."}</p>
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
