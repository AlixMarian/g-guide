import { collection, getDocs } from 'firebase/firestore';
import { db } from '/backend/firebase';
import coverLogo from '../assets/logo cover.png';

export const fetchChurchData = async () => {
  try {
    const churchLocationCollection = collection(db, 'churchLocation');
    const churchLocationSnapshot = await getDocs(churchLocationCollection);
    const churchLocationList = churchLocationSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const churchCollection = collection(db, 'church');
    const churchSnapshot = await getDocs(churchCollection);
    const churchList = churchSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const churchPhotosCollection = collection(db, 'churchPhotos');
    const churchPhotosSnapshot = await getDocs(churchPhotosCollection);
    const churchPhotosList = churchPhotosSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const combinedChurchData = churchLocationList.map((location) => {
      const matchedChurch = churchList.find(
        (church) => church.churchName === location.churchName
      );
      const matchedPhoto = churchPhotosList.find(
        (photo) =>
          photo.uploader === (matchedChurch ? matchedChurch.coordinatorID : null)
      );

      return {
        ...location,
        ...(matchedChurch || {}),
        churchPhoto: matchedPhoto ? matchedPhoto.photoLink : coverLogo,
      };
    });

    return combinedChurchData;
  } catch (error) {
    console.error('Error fetching church data:', error);
    return []; // Return an empty array on error
  }
};

export const handleMapLoad = (mapInstance, setMap, setCustomIcon, setLoading) => {
    setMap(mapInstance);
    if (window.google) {
      setCustomIcon({
        url: 'src/assets/location.png', // Adjust the path if necessary
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 40),
      });
    }
    if (setLoading) {
      setLoading(false);
    }
  };