// churchDataUtils.jsx

import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { db } from '/backend/firebase';
import coverLogo from '/src/assets/logo cover.png';

export const handleMapLoad = (mapInstance, setMap, setCustomIcon, setLoading) => {
  setMap(mapInstance);
  if (window.google) {
    setCustomIcon({
      url: '/src/assets/location.png',
      scaledSize: new window.google.maps.Size(40, 40),
      anchor: new window.google.maps.Point(20, 40),
    });
  }
  setLoading(false);
};

export const handleMarkerClick = async (church, setDrawerInfo, setChurchPhoto) => {
  console.log('Clicked church ID:', church.id); 

  // Set drawer information
  setDrawerInfo({
    show: true,
    id: church.id || '', 
    title: church.churchName || 'Church Name Not Available',
    description: church.churchAddress || church.churchLocation || 'Address not available',
    telephone: church.telephone || 'No contact information available',
    churchStartTime: church.churchStartTime || 'Start time not available',
    churchEndTime: church.churchEndTime || 'End time not available',
    massDate: church.massDate || '',
    massTime: church.massTime || '',
    massType: church.massType || '',
    presidingPriest: church.presidingPriest || '',
  });

  // Set initial church photo
  setChurchPhoto(church.churchPhoto || coverLogo);

  // Fetch and update church photoLink
  const photoLink = await fetchPhotoLink(church.id);
  setChurchPhoto(photoLink);
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
        (church) => church.churchLocationID === location.id
      );
      const matchedPhoto = churchPhotosList.find(
        (photo) => photo.uploader === (matchedChurch ? matchedChurch.coordinatorID : null)
      );

      return {
        ...location,
        ...(matchedChurch || {}),
        churchPhoto: matchedPhoto ? matchedPhoto.photoLink : coverLogo,
        telephone: matchedChurch ? matchedChurch.churchContactNum : 'No contact information available',
        churchStartTime: matchedChurch ? matchedChurch.churchStartTime : 'Start time not available',
        churchEndTime: matchedChurch ? matchedChurch.churchEndTime : 'End time not available',
      };
    });

    return combinedChurchData;
  } catch (error) {
    console.error('Error fetching church data:', error);
    return [];
  }
};

/**
 * Fetches churches by language from 'massSchedules' and related collections.
 */
export const fetchChurchesByLanguage = async (selectedLanguage) => {
  try {
    // Query massSchedules for the selected language
    const massSchedulesQuery = query(
      collection(db, 'massSchedules'),
      where('massLanguage', '==', selectedLanguage)
    );
    const massSchedulesSnapshot = await getDocs(massSchedulesQuery);

    if (massSchedulesSnapshot.empty) {
      console.log(`No mass schedules found for language: ${selectedLanguage}`);
      return [];
    }

    // Fetch related church data
    const churchesList = await Promise.all(
      massSchedulesSnapshot.docs.map(async (massDoc) => {
        const massData = massDoc.data();
        const churchId = massData.churchId;

        // Fetch church data
        const churchDoc = await getDoc(doc(db, 'church', churchId));
        if (!churchDoc.exists()) return null;

        const churchData = churchDoc.data();
        const churchLocationID = churchData.churchLocationID;

        // Fetch church location data
        const locationDoc = await getDoc(doc(db, 'churchLocation', churchLocationID));
        const locationData = locationDoc.exists()
          ? locationDoc.data()
          : { churchLocation: 'Location not available', churchStartTime: '', churchEndTime: '' };

        return {
          id: churchDoc.id,
          churchName: churchData.churchName || 'Name not available',
          churchAddress: locationData.churchLocation || 'Address not available',
          churchLocation: locationData.churchLocation || 'Location not available',
          latitude: locationData.latitude || 0,
          longitude: locationData.longitude || 0,
          churchStartTime: churchData.churchStartTime || 'Start time not available',
          churchEndTime: churchData.churchEndTime || 'End time not available',
          telephone: churchData.churchContactNum || 'No contact information available',
          churchPhoto: churchData.churchPhoto || coverLogo,
          massDate: massData.massDate || '',
          massTime: massData.massTime || '',
          massType: massData.massType || '',
          presidingPriest: massData.presidingPriest || '',
        };
      })
    );

    return churchesList.filter((church) => church !== null); // Remove null results
  } catch (error) {
    console.error('Error fetching churches by language:', error);
    return [];
  }
};


export const fetchChurchesByLanguageToday = async (selectedLanguage) => {
  try {
    // Get today's day name, e.g., 'Friday'
    const today = new Date();
    const options = { weekday: 'long' };
    const todayDay = today.toLocaleDateString('en-US', options);

    // Query massSchedules for the selected language and today's day
    const massSchedulesQuery = query(
      collection(db, 'massSchedules'),
      where('massLanguage', '==', selectedLanguage),
      where('massDate', '==', todayDay)
    );
    const massSchedulesSnapshot = await getDocs(massSchedulesQuery);

    if (massSchedulesSnapshot.empty) {
      console.log(`No mass schedules found for language: ${selectedLanguage} on ${todayDay}`);
      return [];
    }

    // Fetch related church data
    const churchesList = await Promise.all(
      massSchedulesSnapshot.docs.map(async (massDoc) => {
        const massData = massDoc.data();
        const churchId = massData.churchId;

        // Fetch church data
        const churchDoc = await getDoc(doc(db, 'church', churchId));
        if (!churchDoc.exists()) return null;

        const churchData = churchDoc.data();
        const churchLocationID = churchData.churchLocationID;

        // Fetch church location data
        const locationDoc = await getDoc(doc(db, 'churchLocation', churchLocationID));
        const locationData = locationDoc.exists()
          ? locationDoc.data()
          : { churchLocation: 'Location not available', churchStartTime: '', churchEndTime: '' };

        return {
          id: churchDoc.id,
          churchName: churchData.churchName || 'Name not available',
          churchAddress: locationData.churchLocation || 'Address not available',
          churchLocation: locationData.churchLocation || 'Location not available',
          latitude: locationData.latitude || 0,
          longitude: locationData.longitude || 0,
          churchStartTime: churchData.churchStartTime || 'Start time not available',
          churchEndTime: churchData.churchEndTime || 'End time not available',
          telephone: churchData.churchContactNum || 'No contact information available',
          churchPhoto: churchData.churchPhoto || coverLogo,
          massDate: massData.massDate || '',
          massTime: massData.massTime || '',
          massType: massData.massType || '',
          presidingPriest: massData.presidingPriest || '',
        };
      })
    );

    return churchesList.filter((church) => church !== null); // Remove null results
  } catch (error) {
    console.error('Error fetching churches by language:', error);
    return [];
  }
};
/**
 * Fetches churches by service from 'services' and related collections.
 */
export const fetchChurchesByService = async (selectedService) => {
  try {
    if (!selectedService) {
      console.log('No service selected.');
      return [];
    }

    console.log(`Fetching churches offering: ${selectedService}`);

    // Query 'services' collection where [selectedService].active == true
    const servicesQuery = query(
      collection(db, 'services'),
      where(`${selectedService}.active`, '==', true)
    );
    const servicesSnapshot = await getDocs(servicesQuery);

    if (servicesSnapshot.empty) {
      console.log(`No active services found for the selected service: ${selectedService}.`);
      return [];
    }

    // Extract church IDs
    const churchIds = servicesSnapshot.docs.map((doc) => doc.id);
    console.log(`Found ${churchIds.length} churches offering ${selectedService}.`);

    if (churchIds.length === 0) {
      console.log('No church IDs found with active service.');
      return [];
    }

    // Fetch church details
    const churchDetailsPromises = churchIds.map(async (churchID) => {
      const churchRef = doc(db, 'church', churchID);
      const churchSnap = await getDoc(churchRef);

      if (churchSnap.exists()) {
        const churchData = churchSnap.data();
        const churchLocationID = churchData.churchLocationID;

        if (!churchLocationID) {
          console.log(`No churchLocationID found for church ID: ${churchID}`);
          return {
            id: churchSnap.id,
            churchName: churchData.churchName || 'Name not available',
            churchAddress: 'Address not available',
            churchStartTime: churchData.churchStartTime || 'Start time not available',
            churchEndTime: churchData.churchEndTime || 'End time not available',
            latitude: churchData.latitude || 0,
            longitude: churchData.longitude || 0,
            telephone: churchData.churchContactNum || 'No contact information available',
            churchPhoto: churchData.churchPhoto || coverLogo,
          };
        }

        // Fetch church location data
        const locationDoc = await getDoc(doc(db, 'churchLocation', churchLocationID));
        const locationData = locationDoc.exists()
          ? locationDoc.data()
          : { churchLocation: 'Location not available', churchStartTime: '', churchEndTime: '' };

        return {
          id: churchSnap.id,
          churchName: churchData.churchName || 'Name not available',
          churchAddress: locationData.churchLocation || 'Address not available',
          churchLocation: locationData.churchLocation || 'Location not available',
          latitude: locationData.latitude || 0,
          longitude: locationData.longitude || 0,
          churchStartTime: churchData.churchStartTime || 'Start time not available',
          churchEndTime: churchData.churchEndTime || 'End time not available',
          telephone: churchData.churchContactNum || 'No contact information available',
          churchPhoto: churchData.churchPhoto || coverLogo,
        };
      } else {
        console.log(`No church found with ID: ${churchID}`);
        return null;
      }
    });

    const churchDetailsResults = await Promise.all(churchDetailsPromises);
    const churchDetails = churchDetailsResults.filter((church) => church !== null);

    console.log(`Fetched details for ${churchDetails.length} churches.`);

    return churchDetails;
  } catch (error) {
    console.error('Error fetching churches by service:', error);
    return [];
  }
};

/**
 * Converts 24-hour time format to 12-hour format.
 */
export const convertTo12HourFormat = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const period = hours >= 12 ? 'PM' : 'AM';
  const adjustedHours = hours % 12 || 12;
  return `${adjustedHours}:${minutes} ${period}`;
};

/**
 * Handles zoom changes on the map by adjusting marker icon sizes.
 */
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

export const fetchPhotoLink = async (churchId) => {
  try {
    // Step 1: Fetch church document
    const churchRef = doc(db, 'church', churchId);
    const churchSnap = await getDoc(churchRef);
    if (!churchSnap.exists()) {
      console.error(`No church found with ID: ${churchId}`);
      return coverLogo;
    }
    const churchData = churchSnap.data();
    const coordinatorID = churchData.coordinatorID;
    if (!coordinatorID) {
      console.error(`No coordinatorID found for church ID: ${churchId}`);
      return coverLogo;
    }
    
    // Step 2: Fetch coordinator document
    const coordinatorRef = doc(db, 'coordinator', coordinatorID);
    const coordinatorSnap = await getDoc(coordinatorRef);
    if (!coordinatorSnap.exists()) {
      console.error(`No coordinator found with ID: ${coordinatorID}`);
      return coverLogo;
    }
    const coordinatorData = coordinatorSnap.data();
    const userId = coordinatorData.userId;
    if (!userId) {
      console.error(`No userId found for coordinator ID: ${coordinatorID}`);
      return coverLogo;
    }
    
    // Step 3: Query churchPhotos
    const churchPhotosQuery = query(
      collection(db, 'churchPhotos'),
      where('userId', '==', userId),
      where('uploader', '==', userId)
    );
    const churchPhotosSnapshot = await getDocs(churchPhotosQuery);
    if (!churchPhotosSnapshot.empty) {
      const photoDoc = churchPhotosSnapshot.docs[0];
      const photoLink = photoDoc.data().photoLink;
      if (photoLink) {
        return photoLink;
      }
    }
    
    // Step 4: Return default photo if not found
    return coverLogo;
  } catch (error) {
    console.error('Error fetching photoLink:', error);
    return coverLogo;
  }
};