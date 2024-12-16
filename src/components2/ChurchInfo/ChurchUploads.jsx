import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { doc, updateDoc, getDoc, addDoc, collection, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { db, storage } from '/backend/firebase';
import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../churchCoordinator.css';

export const ChurchUploads = () => {

    const [churchId, setChurchId] = useState("");
    // eslint-disable-next-line no-unused-vars
    const [churchData, setChurchData] = useState({});
    const [churchPhotos, setChurchPhotos] = useState([]);
    const [bankProofFile, setBankProofFile] = useState(null);
    const [churchProofFile, setChurchProofFile] = useState(null);
    const churchPhotosRef = useRef(null);
    const bankProofRef = useRef(null);
    const churchProofRef = useRef(null);
    const navigate = useNavigate();

    
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
                    const fetchedChurchId = churchSnapshot.docs[0].id;
                    setChurchId(fetchedChurchId);
                    console.log("Fetched churchId:", fetchedChurchId);
                } else {
                    toast.error("No associated church found for this coordinator.");
                }
            } else {
                toast.error("No coordinator found for the logged-in user.");
            }
        } catch (error) {
            console.error("Error fetching churchId:", error);
            toast.error("Failed to fetch church details.");
        }
    };

    
    const fetchChurchData = async (id) => {
        try {
            const churchDoc = await getDoc(doc(db, "church", id));
            if (churchDoc.exists()) {
                setChurchData(churchDoc.data());
            } else {
                toast.error("Church data not found");
            }
        } catch (error) {
            console.error("Error fetching church data:", error);
            toast.error("Failed to fetch church data.");
        }
    };

   
    const fetchChurchPhotos = async (id) => {
        try {
            const photosQuery = query(
                collection(db, "churchPhotos"),
                where("uploader", "==", id)
            );
            const querySnapshot = await getDocs(photosQuery);
            const photos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setChurchPhotos(photos);
        } catch (error) {
            toast.error("Error fetching church photos");
        }
    };

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log("User signed in:", user);
                await fetchChurchId(user.uid);
            } else {
                console.log("No user signed in.");
                navigate("/login");
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        if (churchId) {
            fetchChurchData(churchId); 
            fetchChurchPhotos(churchId);
        }
    }, [churchId]);

    const handleBankProofChange = (e) => {
        const { id, files } = e.target;
        if (id === 'churchBank') {
            setBankProofFile(files[0]);
        }
    };

    const handleBankProofUpload = async (e) => {
        e.preventDefault();
    
        if (!churchId) {
            toast.error("Church ID is missing");
            return;
        }
    
        if (!bankProofFile) {
            toast.error('No file selected');
            return;
        }
    
        try {
            const storageRef = ref(storage, `churchQRs/${churchId}`); 
            await uploadBytes(storageRef, bankProofFile);
            const bankProofUrl = await getDownloadURL(storageRef);
    
            await updateDoc(doc(db, 'church', churchId), {
                churchQRDetail: bankProofUrl, 
            });
    
            toast.success('Bank proof updated successfully');
            setBankProofFile(null);
            bankProofRef.current.value = '';
        } catch (error) {
            console.error("Error updating bank proof:", error);
            toast.error('Error updating bank proof');
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
    
        if (!churchId) {
            toast.error("Church ID is missing");
            return;
        }
    
        if (!churchProofFile) {
            toast.error('No file selected');
            return;
        }
    
        try {
            const storageRef = ref(storage, `churchVerification/${churchId}`); 
            await uploadBytes(storageRef, churchProofFile);
            const churchProofUrl = await getDownloadURL(storageRef);
    
            await updateDoc(doc(db, 'church', churchId), {
                churchProof: churchProofUrl, 
            });
    
            toast.success('Church proof updated successfully');
            setChurchProofFile(null);
            churchProofRef.current.value = '';
        } catch (error) {
            console.error("Error updating church proof:", error);
            toast.error('Error updating church proof');
        }
    };

    const handleChurchPhotosChange = (e) => {
        const { files } = e.target;
        setChurchPhotos(Array.from(files)); 
    };

    const handleChurchPhotosUpload = async (e) => {
        e.preventDefault();
    
        if (!churchId) {
            toast.error("Church ID is missing");
            return;
        }
    
        if (!churchPhotosRef.current || !churchPhotosRef.current.files.length) {
            toast.error('Please select a photo');
            return;
        }
    
        try {
           
            const q = query(collection(db, "churchPhotos"), where("uploader", "==", churchId));
            const querySnapshot = await getDocs(q);
            const currentPhotoCount = querySnapshot.size;
    
            if (currentPhotoCount + churchPhotos.length > 5) {
                toast.error(`You can only upload ${5 - currentPhotoCount} more photo(s)`);
                return;
            }
    
            
            const uploadPromises = churchPhotos.map(async (photo) => {
                const storageRef = ref(storage, `churchPhotos/${churchId}/${photo.name}`); 
                await uploadBytes(storageRef, photo);
                const photoUrl = await getDownloadURL(storageRef);
    
                await addDoc(collection(db, 'churchPhotos'), {
                    photoLink: photoUrl,
                    uploader: churchId, 
                });
            });
    
            await Promise.all(uploadPromises);
            fetchChurchPhotos(churchId);
    
            toast.success('Church photos uploaded successfully');
            setChurchPhotos([]);
        } catch (error) {
            console.error("Error uploading church photos:", error);
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
        <>
            <h1 className="me-3">Church Uploads</h1>
            <div className="container mt-5">
            <div className="row">
                <div className="col-md-6 mb-4">
                    <div className="card shadow-lg">
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
                                        <button className="btn btn-custom-outline" type="submit">
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
                                        <button className="btn btn-custom-outline" type="submit">
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
                                        <button className="btn btn-custom-outline" type="submit">
                                            Update Proof of Affiliation
                                        </button>
                                    </div>
                                </div>
                            </form>
                            <button type="button" className="btn btn-danger" onClick={handleClear}>
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 mb-4">
                    <div className="card shadow-lg">
                        <div className="card-body">
                            <h5 className="card-title"><b>Uploaded Church Photos</b></h5>
                            <div className="uploaded-photos-list">
                                {churchPhotos.length > 0 ? (
                                    churchPhotos.map(photo => (
                                        <div key={photo.id} className="photo-item mb-3">
                                            <img src={photo.photoLink} alt="Church" className="img-thumbnail mb-2" />
                                            <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeletePhoto(photo.id, photo.photoLink)}>Delete</button>
                                        </div>
                                    ))
                                ) : (
                                <div className="text-center d-flex justify-content-center align-items-center py-5" style={{ height: "100%" }}>
                                    <h4 className="text-muted text-center">No uploads found</h4>
                                </div>    
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default ChurchUploads;
