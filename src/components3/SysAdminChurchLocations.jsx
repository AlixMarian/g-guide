import { useEffect, useState } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '/backend/firebase';
import loadingGif from '../assets/Ripple@1x-1.0s-200px-200px.gif';  // Correctly imported loading GIF

export const SysAdminChurchLocations = () => {
  const [churchLocations, setChurchLocations] = useState([]);
  const [loading, setLoading] = useState(true); // State to manage loading

  useEffect(() => {
    const fetchChurchLocations = async () => {
      try {
        // Fetch data from 'churchLocation' collection in Firestore
        const querySnapshot = await getDocs(collection(db, 'churchLocation'));
        const locationList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setChurchLocations(locationList); // Set the fetched data to state
      } catch (error) {
        console.error('Error fetching church locations:', error);
      } finally {
        setLoading(false); // Stop loading after data is fetched
      }
    };

    fetchChurchLocations();
  }, []);

  return (
    <div className="church-location-page">
      <h3>Cebu Church List</h3>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          {/* Display the loading GIF while fetching data */}
          <img src={loadingGif} alt="Loading..." style={{ width: '100px' }} />
        </div>
      ) : (
        <table className='admin-table'>
          <thead>
            <tr>
              <th>Church ID</th>
              <th>Church Name</th>
              <th>Church Location</th>
              <th>Latitude</th>
              <th>Longitude</th>
            </tr>
          </thead>
          <tbody>
            {churchLocations.length > 0 ? (
              churchLocations.map((church) => (
                <tr key={church.id}>
                  <td>{church.id}</td>
                  <td>{church.churchName || 'N/A'}</td>
                  <td>{church.churchLocation || 'N/A'}</td>
                  <td>{church.latitude || 'N/A'}</td>
                  <td>{church.longitude || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SysAdminChurchLocations;
