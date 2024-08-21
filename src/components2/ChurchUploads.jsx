import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { doc, updateDoc, getDoc, addDoc, collection, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { db, storage } from '/backend/firebase';
import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

export const ChurchUploads = () => {

    const [userData, setUserData] = useState(null);
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
                console.log("User signed in:", user);
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUserData(userData);

                        const churchDoc = await getDoc(doc(db, "church", user.uid));
                        if (churchDoc.exists()) {
                            setChurchData(churchDoc.data());
                            fetchChurchPhotos(user.uid); 
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

    const fetchChurchPhotos = async (userId) => {
        try {
            const q = query(collection(db, "churchPhotos"), where("uploader", "==", userId));
            const querySnapshot = await getDocs(q);
            const photos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setChurchPhotos(photos); 
        } catch (error) {
            toast.error("Error fetching church photos");
        }
    };

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
        setChurchPhotos(Array.from(files)); 
    };

    const handleChurchPhotosUpload = async (e) => {
        e.preventDefault();
        const auth = getAuth();
        const user = auth.currentUser;
    
        if (!user) {
            toast.error('User not authenticated');
            return;
        }
    
        if (!churchPhotosRef.current || !churchPhotosRef.current.files.length) {
            toast.error('Please select a photo');
            return;
        }
    
        try {
            const q = query(collection(db, "churchPhotos"), where("uploader", "==", user.uid));
            const querySnapshot = await getDocs(q);
            const currentPhotoCount = querySnapshot.size;
    
            if (currentPhotoCount + churchPhotos.length > 5) {
                toast.error(`You can only upload ${5 - currentPhotoCount} more photo(s)`);
                return;
            }
    
            const uploadPromises = churchPhotos.map(async (photo) => {
                const storageRef = ref(storage, `churchPhotos/${user.uid}/${photo.name}`);
                await uploadBytes(storageRef, photo);
                const photoUrl = await getDownloadURL(storageRef);
    
                await addDoc(collection(db, 'churchPhotos'), {
                    photoLink: photoUrl,
                    uploader: user.uid,
                });
            });
    
            await Promise.all(uploadPromises);
            fetchChurchPhotos(user.uid);  
    
            toast.success('Church photos uploaded successfully');
            setChurchPhotos([]);
        } catch (error) {
            toast.error('Error uploading church photos');
        }
    };
    
    

    const handleDeletePhoto = async (photoId, photoLink) => {
        try {
            const storageRef = ref(storage, photoLink);
            await deleteObject(storageRef).catch((error) => {
                if (error.code === 'storage/object-not-found') {
                    console.warn('File not found in storage, continuing with Firestore deletion.');
                } else {
                    throw error; 
                }
            });
    
            await deleteDoc(doc(db, 'churchPhotos', photoId));
    
            setChurchPhotos((prevPhotos) => prevPhotos.filter(photo => photo.id !== photoId));
            toast.success('Photo deleted successfully');
        } catch (error) {
            console.error('Error deleting photo:', error);
            toast.error('Error deleting photo');
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
        <div className="container mt-5">
            <div className="card">
                <div className="row no-gutters">
                    <div className="col-md-6">
                        <div className="card-body">
                            <form className="mb-3" onSubmit={handleChurchPhotosUpload}>
                                <div className="mb-3">
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
                                            accept="image/*"
                                        />
                                        <button className="btn btn-outline-secondary" type="submit">
                                            Upload Photos
                                        </button>
                                    </div>
                                </div>
                            </form>

                            <form className="mb-3" onSubmit={handleBankProofUpload}>
                                <div className="mb-3">
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

                            <form className="mb-3" onSubmit={handleChurchProofUpload}>
                                <div className="mb-3">
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
                    </div>

                    <div className="col-md-6">
                        <div className="card-body">
                            <h5 className="card-title"><b>Uploaded Church Photos</b></h5>
                            <div className="uploaded-photos-list">
                                {churchPhotos.length > 0 ? (
                                    churchPhotos.map(photo => (
                                        <div key={photo.id} className="photo-item">
                                            <img 
                                                src={photo.photoLink} 
                                                alt="Church" 
                                                className="img-thumbnail" 
                                            />
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => handleDeletePhoto(photo.id, photo.photoLink)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p>No photos uploaded yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChurchUploads;
