import { collection, getDocs } from 'firebase/firestore';
import { db } from '/backend/firebase';
import coverLogo from '/src/assets/logo cover.png';

export const onZoomChanged = (map, setCustomIcon) => {
  if (map) {
    const zoom = map.getZoom();
    const newSize = zoom > 15 ? 40 : zoom > 12 ? 30 : 20;
    setCustomIcon((prevIcon) => ({
      ...prevIcon,
      scaledSize: new window.google.maps.Size(newSize, newSize),
    }));
  }
};

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
    return []; 
  }
};

export const handleMapLoad = (mapInstance, setMap, setCustomIcon, setLoading) => {
    setMap(mapInstance);
    if (window.google) {
      setCustomIcon({
        url: 'src/assets/location.png', 
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 40),
      });
    }
    if (setLoading) {
      setLoading(false);
    }
  };

  export const handleMarkerClick = (church, setDrawerInfo, setChurchPhoto) => {
    const telephone = church.churchContactNum ? church.churchContactNum : 'No data added yet.';
    
    const serviceHours = (!church.churchStartTime || !church.churchEndTime || 
        church.churchStartTime === "none" || church.churchEndTime === "none")
      ? 'No data added yet.' 
      : `${convertTo12HourFormat(church.churchStartTime)} - ${convertTo12HourFormat(church.churchEndTime)}`;
  
    const photo = church.churchPhoto ? church.churchPhoto : coverLogo;
  
    setDrawerInfo({
      show: true,
      title: church.churchName || 'Church Name Not Available',
      description: church.churchLocation || 'Location not available',  
      telephone: telephone,
      serviceHours: serviceHours,
    });
  
    setChurchPhoto(photo);
  };

  export const convertTo12HourFormat = (time) => {
    const [hours, minutes] = time.split(':');
    const period = hours >= 12 ? 'PM' : 'AM';
    const adjustedHours = hours % 12 || 12;
    return `${adjustedHours}:${minutes} ${period}`;
  };