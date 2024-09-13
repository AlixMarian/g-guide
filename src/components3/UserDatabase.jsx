import { useEffect, useState } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { Table, Button, Dropdown } from 'react-bootstrap';
import loadingGif from '../assets/Ripple@1x-1.0s-200px-200px.gif'; 

export const UserDatabase = () => {
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('All');
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true); // Set loading to true when fetching data
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(userList);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
  };
  
  const filteredUsers = users
    .filter(user => user.role !== 'sysAdmin')  
    .filter(user => selectedRole === 'All' || user.role === selectedRole); 

  return (
    <div className='user-db-page'>
      <h3>User Database</h3> <br/>

      {loading ? ( // Show loading GIF when data is being fetched
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <img src={loadingGif} alt="Loading..." style={{ width: '100px', height: '100px' }} />
        </div>
      ) : (
        <>
          <div className="mb-3">
            <Dropdown>
              <Dropdown.Toggle variant="primary" id="dropdown-basic">
                Filter Roles
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleRoleChange('All')}>All</Dropdown.Item>
                <Dropdown.Item onClick={() => handleRoleChange('websiteUser')}>Website User</Dropdown.Item>
                <Dropdown.Item onClick={() => handleRoleChange('churchCoor')}>Church Coordinator</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          
          <h4 className="mb-3">Now viewing: {selectedRole}</h4>
          
          <table className='admin-table'>
            <thead>
              <tr>
                <th>Profile Photo</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Contact Number</th>
                <th>Role</th>
                <th>Agreed to Data Consent</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <img
                      src={user.profileImage || 'default-profile.jpg'}
                      alt="Profile"
                      style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                    />
                  </td>
                  <td>{`${user.firstName} ${user.lastName}`}</td>
                  <td>{user.email}</td>
                  <td>{user.contactNum}</td>
                  <td>{user.role}</td>
                  <td>{user.dataConsent ? 'Yes' : 'No'} </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default UserDatabase;
