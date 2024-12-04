//churchDataUtils.jsx

import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
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

// export const sortAndSetTopChurches = (churchesList, currentPosition, setFilteredChurches) => { 
//   if (currentPosition && window.google) {
//       const { lat, lng } = currentPosition;
//       const currentLatLng = new window.google.maps.LatLng(lat, lng);

//       const sortedChurches = churchesList.map((church) => {
//           const latitude = parseFloat(church.latitude);
//           const longitude = parseFloat(church.longitude);

//           if (!isNaN(latitude) && !isNaN(longitude)) {
//               const churchLatLng = new window.google.maps.LatLng(latitude, longitude);
//               const distance = window.google.maps.geometry.spherical.computeDistanceBetween(churchLatLng, currentLatLng) / 1000; // Convert to km
//               return {
//                   ...church,
//                   distance,
//               };
//           } else {
//               console.warn(`Invalid latitude or longitude for church: ${church.churchName}`);
//               return {
//                   ...church,
//                   distance: Infinity,
//               };
//           }
//       });
//       sortedChurches.sort((a, b) => a.distance - b.distance);
//       console.log("Sorted Churches:", sortedChurches);
//       setFilteredChurches(sortedChurches.slice(0, 10));
//   }
// };

export const fetchChurchesByLanguage = async (selectedLanguage) => {
  try {
    // Step 1: Query massSchedules for the selected language
    const massSchedulesQuery = query(
      collection(db, 'massSchedules'),
      where('massLanguage', '==', selectedLanguage)
    );
    const massSchedulesSnapshot = await getDocs(massSchedulesQuery);

    if (massSchedulesSnapshot.empty) {
      console.log(`No mass schedules found for language: ${selectedLanguage}`);
      return [];
    }

    // Step 2: Process massSchedules and fetch related church data
    const churchesList = await Promise.all(
      massSchedulesSnapshot.docs.map(async (massDoc) => {
        const massData = massDoc.data();
        const churchId = massData.churchId;

        // Fetch church data
        const churchDoc = await getDoc(doc(db, 'church', churchId));
        if (!churchDoc.exists()) return null;

        const churchData = churchDoc.data();
        const churchLocationID = churchData.churchLocationID;

        // Fetch the church location document
        const locationQuery = query(
          collection(db, 'churchLocation'),
          where('__name__', '==', churchLocationID)
        );
        const locationSnapshot = await getDocs(locationQuery);

        const locationData = locationSnapshot.empty
          ? { churchLocation: 'Location not available' }
          : locationSnapshot.docs[0].data();

        return {
          ...massData,
          churchName: churchData.churchName,
          churchLocation: locationData.churchLocation,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        };
      })
    );

    return churchesList.filter((church) => church !== null); // Remove null results
  } catch (error) {
    console.error('Error fetching churches by language:', error);
    return [];
  }
};

export const fetchChurchesByService = async (selectedService) => {
  try {
    console.log(`Selected Service: ${selectedService}`);

    // **Step 1: Query services where activeSchedules includes selectedService**
    const servicesQuery = query(
      collection(db, 'services'),
      where('activeSchedules', 'array-contains', selectedService)
    );
    const servicesSnapshot = await getDocs(servicesQuery);

    if (servicesSnapshot.empty) {
      console.log("No services found for the selected service.");
      return [];
    }

    console.log(`Services Found: ${servicesSnapshot.docs.length}`);

    // **Step 2: Extract unique coordinatorIDs from services**
    const coordinatorIds = servicesSnapshot.docs.map(serviceDoc => serviceDoc.data().coordinatorID);
    const uniqueCoordinatorIds = [...new Set(coordinatorIds)]; // Remove duplicates
    console.log(`Collected coordinatorIDs from services: ${uniqueCoordinatorIds}`);

    const churchesList = [];

    // **Step 3: Batch the coordinatorIds for Firestore 'in' queries (max 10 per batch)**
    const batches = [];
    while (uniqueCoordinatorIds.length) {
      batches.push(uniqueCoordinatorIds.splice(0, 10));
    }

    for (const batch of batches) {
      const churchQuery = query(
        collection(db, 'church'),
        where('coordinatorID', 'in', batch)
      );
      const churchSnapshot = await getDocs(churchQuery);

      if (!churchSnapshot.empty) {
        for (const churchDoc of churchSnapshot.docs) {
          const churchData = churchDoc.data();
          const churchName = churchData.churchName;
          const churchLocationID = churchData.churchLocationID;

          // **Step 4: Fetch churchLocation**
          const churchLocationDoc = await getDoc(doc(db, 'churchLocation', churchLocationID));
          let churchLocation = "Location not available";
          let latitude = null;
          let longitude = null;

          if (churchLocationDoc.exists()) {
            const locationData = churchLocationDoc.data();
            churchLocation = locationData.churchLocation;
            latitude = parseFloat(locationData.latitude);
            longitude = parseFloat(locationData.longitude);
          } else {
            console.log(`No location found for churchName: ${churchName}`);
          }

          // **Step 5: Combine data**
          churchesList.push({
            id: churchDoc.id,
            churchName: churchName,
            churchLocation: churchLocation,
            telephone: churchData.telephone || 'No contact information available',
            serviceHours: churchData.serviceHours || 'No service hours available',
            latitude: latitude,
            longitude: longitude,
            churchPhoto: churchData.churchPhoto || coverLogo, // Ensure churchPhoto is included
          });
        }
      } else {
        console.log(`No churches found for coordinatorIDs: ${batch}`);
      }
    }

    // **Step 6: Remove duplicate churches based on 'id'**
    const uniqueChurches = [];
    const seenChurchIds = new Set();
    for (const church of churchesList) {
      if (!seenChurchIds.has(church.id)) {
        uniqueChurches.push(church);
        seenChurchIds.add(church.id);
      }
    }

    console.log(`Total Churches Found: ${uniqueChurches.length}`);
    return uniqueChurches;
  } catch (error) {
    console.error('Error fetching churches by service:', error);
    return [];
  }
};

