import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
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
                fetchServices();
                fetchRefundPolicies();
            } else {
                navigate('/login');
            }
        });
    }, [navigate]);

    const fetchServices = async () => {
        try {
            const servicesSnapshot = await getDocs(collection(db, 'services'));
            const servicesList = servicesSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log("Fetched services:", servicesList); // Debugging log
            setServices(servicesList);
        } catch (error) {
            console.error("Error fetching services:", error);
        }
    };

    const fetchRefundPolicies = async () => {
        const policiesSnapshot = await getDocs(collection(db, 'refundPolicy'));
        const policiesList = policiesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        setRefundPolicies(policiesList);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedService || !refPolicyBodyInput) {
            toast.error('Please select a service and enter a refund policy.');
            return;
        }

        const policyData = {
            serviceName: selectedService,
            refundPolicy: refPolicyBodyInput,
        };

        try {
            await addDoc(collection(db, 'refundPolicy'), policyData);
            toast.success('Refund policy saved successfully!');
            setRefPolicyBodyInput(''); // Clear the input
            setSelectedService(''); // Clear the selected service
            fetchRefundPolicies(); // Refresh the displayed policies
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
                                                <option key={service.id} value={service.id}>
                                                    {service.eventName || service.id} {/* Show eventName if exists, otherwise ID */}
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
