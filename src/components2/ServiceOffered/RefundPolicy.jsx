import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../churchCoordinator.css';

export const RefundPolicy = () => {
    const navigate = useNavigate();
    const [refPolicyBodyInput, setRefPolicyBodyInput] = useState('');
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState('');
    const [refundPolicies, setRefundPolicies] = useState([]);

    const handleBodyChange = (e) => setRefPolicyBodyInput(e.target.value);
    const handleServiceChange = (e) => setSelectedService(e.target.value);

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                fetchServices(user.uid); // Fetch services based on user ID
                fetchRefundPolicies(user.uid); // Fetch policies created by the user
            } else {
                navigate('/login');
            }
        });
    }, [navigate]);

    const fetchServices = async (churchId) => {
        try {
            const docRef = doc(db, 'services', churchId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const servicesList = Object.keys(data)
                    .filter(key => typeof data[key] === 'object' && data[key].active) // Only include active services
                    .map(key => ({ name: key, ...data[key] }));
                setServices(servicesList);
            } else {
                toast.error("No services found for this church.");
            }
        } catch (error) {
            console.error("Error fetching services:", error);
        }
    };

    const fetchRefundPolicies = async (creatorId) => {
        try {
            const q = query(collection(db, 'refundPolicy'), where('creatorId', '==', creatorId));
            const policiesSnapshot = await getDocs(q);
            const policiesList = policiesSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            setRefundPolicies(policiesList);
        } catch (error) {
            console.error("Error fetching refund policies:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const auth = getAuth();
        const user = auth.currentUser;

        if (!selectedService || !refPolicyBodyInput) {
            toast.error('Please select a service and enter a refund policy.');
            return;
        }

        const policyData = {
            serviceName: selectedService, // Save the service name
            refundPolicy: refPolicyBodyInput,
            creatorId: user.uid, // Associate the policy with the current user ID
        };

        try {
            await addDoc(collection(db, 'refundPolicy'), policyData);
            toast.success('Refund policy saved successfully!');
            setRefPolicyBodyInput(''); // Clear the input
            setSelectedService(''); // Clear the selected service
            fetchRefundPolicies(user.uid); // Refresh the displayed policies
        } catch (error) {
            toast.error('Failed to save refund policy.');
        }
    };

    return (
        <>
            <h1 className="me-3">Refund Policy</h1>
            <div className="container mt-5">
                <div className="row">
                    {/* Left side - Create/Edit Refund Policy form */}
                    <div className="col-md-5">
                        <div className="card shadow-lg" style={{ width: "100%" }}>
                            <div className="card-body">
                                <h3>Enter Refund Policy</h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="contentArea col-md-12">
                                        <label className="form-label">Select a service</label>
                                        <select
                                            className="form-select"
                                            id="service"
                                            value={selectedService}
                                            onChange={handleServiceChange}
                                            required
                                        >
                                            <option value="" disabled>Select a service</option>
                                            {services.map((service) => (
                                                <option key={service.name} value={service.name}>
                                                    {service.name}
                                                </option>
                                            ))}
                                        </select>
                                        <label className="form-label mt-3">Refund Policy</label>
                                        <textarea
                                            className="form-control"
                                            id="content"
                                            rows="10"
                                            value={refPolicyBodyInput}
                                            onChange={handleBodyChange}
                                            required
                                        ></textarea>
                                        <br />
                                        <button type="submit" className="btn btn-primary">Submit Policy</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Display all saved refund policies */}
                    <div className="col-md-6">
                        <div className="card shadow-lg">
                            <div className="card-body">
                                <label className="form-label">All Policies</label>
                                {refundPolicies.length > 0 ? (
                                    refundPolicies.map((policy) => (
                                        <div className="card mb-3" key={policy.id}>
                                            <div className="card-body">
                                                <h5 className="card-title">{policy.serviceName}</h5>
                                                <p className="card-text">{policy.refundPolicy}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No refund policies available.</p>
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
