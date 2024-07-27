import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDoc, addDoc, collection } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { db, storage } from '/backend/firebase';
import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export const ChurchUploads = () => {
    // eslint-disable-next-line no-unused-vars
    const [userData, setUserData] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [churchData, setChurchData] = useState({});

    const [churchPhotos, setChurchPhotos] = useState([]);
    const [bankProofFile, setBankProofFile] = useState(null);
    const [churchProofFile, setChurchProofFile] = useState(null);

    const churchPhotosRef = useRef(null);
    const bankProofRef = useRef(null);
    const churchProofRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log("Message from ChurchUpload.jsx User signed in:", user);
                console.log("User id signed in:", user.uid);

                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUserData(userData);

                        // Fetch church data
                        const churchDoc = await getDoc(doc(db, "church", user.uid));
                        if (churchDoc.exists()) {
                            setChurchData(churchDoc.data());
                        } else {
                            toast.error("Church data not found");
                        }
                    } else {
                        toast.error("User data not found");
                    }
                } catch (error) {
                    toast.error("Error fetching user data");
                }
            } else {
                console.log("No user signed in.");
            }
        });
    }, [navigate]);

    const handleBankProofChange = (e) => {
        const { id, files } = e.target;
        if (id === 'churchBank') {
            setBankProofFile(files[0]);
        }
    };

    const handleBankProofUpload = async (e) => {
        e.preventDefault();
        const auth = getAuth();
        const user = auth.currentUser;
        if (user && bankProofFile) {
            try {
                const storageRef = ref(storage, `churchQRs/${user.uid}`);
                await uploadBytes(storageRef, bankProofFile);
                const bankProofUrl = await getDownloadURL(storageRef);

                await updateDoc(doc(db, 'church', user.uid), {
                    churchQRDetail: bankProofUrl,
                });

                toast.success('Bank proof updated successfully');
                setBankProofFile(null);
            } catch (error) {
                toast.error('Error updating bank proof');
            }
            bankProofRef.current.value = '';
        } else {
            toast.error('No file selected or user not authenticated');
        }
    };

    const handleChurchProofChange = (e) => {
        const { id, files } = e.target;
        if (id === 'churchProof') {
            setChurchProofFile(files[0]);
        }
    };

    const handleChurchProofUpload = async (e) => {
        e.preventDefault();
        const auth = getAuth();
        const user = auth.currentUser;
        if (user && churchProofFile) {
            try {
                const storageRef = ref(storage, `churchVerification/${user.uid}`);
                await uploadBytes(storageRef, churchProofFile);
                const churchProofUrl = await getDownloadURL(storageRef);

                await updateDoc(doc(db, 'church', user.uid), {
                    churchProof: churchProofUrl,
                });

                toast.success('Church proof updated successfully');
                setChurchProofFile(null);
            } catch (error) {
                toast.error('Error updating church proof');
            }
            churchProofRef.current.value = '';
        } else {
            toast.error('No file selected or user not authenticated');
        }
    };

    const handleChurchPhotosChange = (e) => {
        const { files } = e.target;
        setChurchPhotos(files);
    };

    const handleChurchPhotosUpload = async (e) => {
        e.preventDefault();
        const auth = getAuth();
        const user = auth.currentUser;
        if (user && churchPhotos.length > 0) {
            try {
                const uploadPromises = Array.from(churchPhotos).map(async (photo) => {
                    const storageRef = ref(storage, `churchPhotos/${user.uid}/${photo.name}`);
                    await uploadBytes(storageRef, photo);
                    const photoUrl = await getDownloadURL(storageRef);

                    await addDoc(collection(db, 'churchPhotos'), {
                        photoLink: photoUrl,
                        uploader: user.uid,
                    });
                });

                await Promise.all(uploadPromises);

                toast.success('Church photos uploaded successfully');
                setChurchPhotos([]);
            } catch (error) {
                toast.error('Error uploading church photos');
            }
        } else {
            toast.error('No files selected or user not authenticated');
        }
    };

    const handleClear = () => {
        setChurchPhotos([]);
        setBankProofFile(null);
        setChurchProofFile(null);
        if (churchPhotosRef.current) churchPhotosRef.current.value = '';
        if (bankProofRef.current) bankProofRef.current.value = '';
        if (churchProofRef.current) churchProofRef.current.value = '';
    };

    return (
        <div>
            <form className="row g-3" onSubmit={handleChurchPhotosUpload}>
                <div className="col-6">
                    <label htmlFor="formFileMultiple" className="form-label">
                        <b>Church Photos</b>
                    </label>
                    <div className='input-group'>
                        <input
                            className="form-control"
                            type="file"
                            id="formFileMultiple"
                            multiple
                            onChange={handleChurchPhotosChange}
                            ref={churchPhotosRef}
                        />
                        <button className="btn btn-outline-secondary" type="submit">
                            Upload Photos
                        </button>
                    </div>
                </div>
            </form>

            <form className="row g-3" onSubmit={handleBankProofUpload}>
                <div className="col-6">
                    <label htmlFor="churchBank" className="form-label">
                        <b>G-Cash or Bank QR Code Picture</b>
                    </label>
                    <div className='input-group'>
                        <input
                            type="file"
                            className="form-control"
                            id="churchBank"
                            accept="image/*,.doc,.docx,.pdf"
                            onChange={handleBankProofChange}
                            ref={bankProofRef}
                        />
                        <button className="btn btn-outline-secondary" type="submit">
                            Update QR Code
                        </button>
                    </div>
                </div>
            </form>

            <form className="row g-3" onSubmit={handleChurchProofUpload}>
                <div className="col-6">
                    <label htmlFor="churchProof" className="form-label">
                        <b>Update Church Proof of Affiliation</b>
                    </label>
                    <div className='input-group'>
                        <input
                            type="file"
                            className="form-control"
                            id="churchProof"
                            accept="image/*,.doc,.docx,.pdf"
                            onChange={handleChurchProofChange}
                            ref={churchProofRef}
                        />
                        <button className="btn btn-outline-secondary" type="submit">
                            Update Proof of Affiliation
                        </button>
                    </div>
                </div>
            </form>

            <div className="announcement-bttn">
                <br />
                <button type="button" className="btn btn-danger" onClick={handleClear}>
                    Clear
                </button>
            </div>
        </div>
    );
};

export default ChurchUploads;
