import { useEffect, useState } from 'react';
import { getDocs, collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { Table, Button, Dropdown } from 'react-bootstrap';
import loadingGif from '../assets/Ripple@1x-1.0s-200px-200px.gif';
import { toast } from 'react-toastify';

export const UserDatabase = () => {
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('All');
  const [loading, setLoading] = useState(true);

  // Reusable fetch function to load users from Firestore
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Step 1: Fetch users from the 'users' collection
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userList = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const userData = { id: docSnapshot.id, ...docSnapshot.data() };
          let status = 'N/A';

          // Step 2: Based on user role, fetch the status from either 'websiteVisitor' or 'coordinator' collection
          if (userData.role === 'websiteUser') {
            const websiteVisitorQuery = query(
              collection(db, 'websiteVisitor'),
              where('userId', '==', userData.id)
            );
            const websiteVisitorSnapshot = await getDocs(websiteVisitorQuery);
            if (!websiteVisitorSnapshot.empty) {
              // Assuming there's only one entry per user
              status = websiteVisitorSnapshot.docs[0].data().status || 'N/A';
            }
          } else if (userData.role === 'churchCoor') {
            const coordinatorQuery = query(
              collection(db, 'coordinator'),
              where('userId', '==', userData.id)
            );
            const coordinatorSnapshot = await getDocs(coordinatorQuery);
            if (!coordinatorSnapshot.empty) {
              // Assuming there's only one entry per user
              status = coordinatorSnapshot.docs[0].data().status || 'N/A';
            }
          }

          // Return user data with the status field
          return { ...userData, status };
        })
      );

      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
  };

  const handleDeleteUser = async (userId, role) => {
    try {
      if (role === 'websiteUser') {
        const websiteVisitorQuery = query(
          collection(db, 'websiteVisitor'),
          where('userId', '==', userId)
        );
        const websiteVisitorSnapshot = await getDocs(websiteVisitorQuery);
        if (!websiteVisitorSnapshot.empty) {
          const websiteVisitorDocId = websiteVisitorSnapshot.docs[0].id;
          await updateDoc(doc(db, 'websiteVisitor', websiteVisitorDocId), {
            status: 'Deleted',
          });
          console.log(`User with ID: ${userId} status updated in websiteVisitor.`);
        }
      } else if (role === 'churchCoor') {
        const coordinatorQuery = query(
          collection(db, 'coordinator'),
          where('userId', '==', userId)
        );
        const coordinatorSnapshot = await getDocs(coordinatorQuery);
        if (!coordinatorSnapshot.empty) {
          const coordinatorDocId = coordinatorSnapshot.docs[0].id;

          // Update coordinator status
          await updateDoc(doc(db, 'coordinator', coordinatorDocId), {
            status: 'Deleted',
          });
          console.log(`User with ID: ${userId} status updated in coordinator.`);

          // Step 1: Find the connected church in the "church" collection
          const churchQuery = query(
            collection(db, 'church'),
            where('coordinatorID', '==', coordinatorDocId)
          );
          const churchSnapshot = await getDocs(churchQuery);

          if (!churchSnapshot.empty) {
            // Step 2: Update the church status to "Archived"
            const churchDocId = churchSnapshot.docs[0].id;
            await updateDoc(doc(db, 'church', churchDocId), {
              churchStatus: 'Archived',
            });
            console.log(`Church with ID: ${churchDocId} status updated to Archived.`);
          }
        }
      }

      toast.success('User Deleted Successfully');
      // Refresh user list after deletion
      await fetchUsers(); // Call fetchUsers to refresh the list
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('User not deleted');
    }
  };

  const filteredUsers = users
    .filter((user) => user.role !== 'sysAdmin')
    .filter((user) => selectedRole === 'All' || user.role === selectedRole);

  const roleTypeMapping = {
    churchCoor: "Church Coordinator",
    websiteUser: "Website User",
  };

  return (
    <div className='user-db-page'>
      <h3>User Database</h3> <br />

      {loading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <img
            src={loadingGif}
            alt='Loading...'
            style={{ width: '100px', height: '100px' }}
          />
        </div>
      ) : (
        <>
          <div className='mb-3'>
            <Dropdown>
              <Dropdown.Toggle variant='primary' id='dropdown-basic'>
                Filter Roles
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleRoleChange('All')}>
                  All
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleRoleChange('websiteUser')}>
                  Website User
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleRoleChange('churchCoor')}>
                  Church Coordinator
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <h4 className='mb-3'>Now viewing: {selectedRole}</h4>

          <Table className='admin-table' striped bordered hover responsive>
            <thead>
              <tr>
                <th>Profile Photo</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Contact Number</th>
                <th>Role</th>
                <th>Agreed to Data Consent</th>
                <th>Status</th> {/* New Status Column */}
                <th>Date of Registration</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <img
                      src={user.profileImage || 'default-profile.jpg'}
                      alt='Profile'
                      style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                    />
                  </td>
                  <td>{`${user.firstName} ${user.lastName}`}</td>
                  <td>{user.email}</td>
                  <td>{user.contactNum}</td>
                  <td>{roleTypeMapping[user.role]}</td>
                  <td>{user.dataConsent ? 'Yes' : 'No'}</td>
                  <td>{user.status || 'N/A'}</td> {/* Display status */}
                  <td>
                    {/* Convert Firebase Timestamp to readable date */}
                    {user.dateOfRegistration
                      ? new Date(user.dateOfRegistration.seconds * 1000).toLocaleString()
                      : 'N/A'}
                  </td>
                  <td>
                    <Button
                      variant='danger'
                      onClick={() => handleDeleteUser(user.id, user.role)}
                    >
                      Delete User
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </div>
  );
};

export default UserDatabase;
