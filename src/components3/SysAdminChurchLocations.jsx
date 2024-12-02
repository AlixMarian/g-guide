import { useEffect, useState } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '/backend/firebase';
import loadingGif from '../assets/Ripple@1x-1.0s-200px-200px.gif';  // Correctly imported loading GIF
import { Pagination } from 'react-bootstrap';

export const SysAdminChurchLocations = () => {
  const [churchLocations, setChurchLocations] = useState([]);
  const [loading, setLoading] = useState(true); // State to manage loading
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const itemsPerPage = 10; // Number of items per page

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

  const totalPages = Math.ceil(churchLocations.length / itemsPerPage);
  const paginatedLocations = churchLocations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="church-location-page">
      <h1 className="me-3">Cebu Church List</h1>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <img src={loadingGif} alt="Loading..." style={{ width: '100px' }} />
        </div>
      ) : (
        <table className='admin-table table table-striped table-bordered table-hover'>
          <thead>
            <tr>
              <th className='custom-th'>Church ID</th>
              <th className='custom-th'>Church Name</th>
              <th className='custom-th'>Church Location</th>
              <th className='custom-th'>Latitude</th>
              <th className='custom-th'>Longitude</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLocations.length > 0 ? (
              paginatedLocations.map((church) => (
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
      <div className="d-flex justify-content-center mt-3">
            <Pagination>
              <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
              <Pagination.Prev onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
              {[...Array(totalPages).keys()].map((page) => (
                <Pagination.Item
                  key={page + 1}
                  active={page + 1 === currentPage}
                  onClick={() => setCurrentPage(page + 1)}
                >
                  {page + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
              <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
            </Pagination>
          </div>
    </div>
  );
};

export default SysAdminChurchLocations;
