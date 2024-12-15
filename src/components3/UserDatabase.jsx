import { useEffect, useState } from 'react';
import { getDoc, getDocs, collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { Button, Dropdown, Pagination} from 'react-bootstrap';
import loadingGif from '../assets/Ripple@1x-1.0s-200px-200px.gif';
import { toast } from 'react-toastify';

export const UserDatabase = () => {
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('All');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const itemsPerPage = 5; // Limit entries per page

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userList = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const userData = { id: docSnapshot.id, ...docSnapshot.data() };
          let status = 'N/A';
          let churchName = '';
          let previousChurchName = '';
          let churchID = '';
  
          if (userData.role === 'websiteUser') {
            const websiteVisitorQuery = query(
              collection(db, 'websiteVisitor'),
              where('userId', '==', userData.id)
            );
            const websiteVisitorSnapshot = await getDocs(websiteVisitorQuery);
            if (!websiteVisitorSnapshot.empty) {
              status = websiteVisitorSnapshot.docs[0].data().status || 'N/A';
            }
          } else if (userData.role === 'churchCoor') {
            const coordinatorQuery = query(
              collection(db, 'coordinator'),
              where('userId', '==', userData.id)
            );
            const coordinatorSnapshot = await getDocs(coordinatorQuery);
  
            if (!coordinatorSnapshot.empty) {
              const coordinatorData = coordinatorSnapshot.docs[0].data();
              status = coordinatorData.status || 'N/A';
              churchID = coordinatorData.churchID || '';
  
              if (status === 'Deleted' && churchID) {
                // If the coordinator is deleted, fetch the previous church name based on the churchID
                const churchDoc = await getDoc(doc(db, 'church', churchID));
                if (churchDoc.exists()) {
                  previousChurchName = churchDoc.data().churchName;
                }
              } else {
                // Fetch the current church based on the coordinator ID if the coordinator is not deleted
                const coordinatorDocId = coordinatorSnapshot.docs[0].id;
                const churchQuery = query(
                  collection(db, 'church'),
                  where('coordinatorID', '==', coordinatorDocId)
                );
                const churchSnapshot = await getDocs(churchQuery);
                if (!churchSnapshot.empty) {
                  churchName = churchSnapshot.docs[0].data().churchName;
                }
              }
            }
          }
  
          return { ...userData, status, churchName, previousChurchName, churchID };
        })
      );
  
      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setCurrentPage(1);
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
            status: 'Inactive',
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
          const churchQuery = query(
            collection(db, 'church'),
            where('coordinatorID', '==', coordinatorDocId)
          );
          const churchSnapshot = await getDocs(churchQuery);
  
          if (!churchSnapshot.empty) {
            const churchDocId = churchSnapshot.docs[0].id;
            await updateDoc(doc(db, 'coordinator', coordinatorDocId), {
              status: 'Inactive',
              churchID: churchDocId
            });
            console.log(`User with ID: ${userId} status updated in coordinator with churchID.`);
            await updateDoc(doc(db, 'church', churchDocId), {
              churchStatus: 'Archived',
            });
            console.log(`Church with ID: ${churchDocId} status updated to Archived.`);
          }
        }
      }
      toast.success('User Deleted Successfully');
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('User not deleted');
    }
  };
    const filteredUsers = users
    .filter((user) => user.role !== 'sysAdmin')
    .filter((user) => selectedRole === 'All' || user.role === selectedRole);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

  const roleTypeMapping = {
    churchCoor: "Church Coordinator",
    websiteUser: "Website User",
  };

  return (
    <div className='user-db-page'>
      <h1 className="me-3">User Database</h1>

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
              <Dropdown.Toggle variant='secondary' id='dropdown-basic'>
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

          <h4 className='mb-3'>
            Now viewing: {selectedRole === 'All' ? 'All Users' : roleTypeMapping[selectedRole] || 'Unknown Role'}
          </h4>

          <table className='admin-table table table-striped table-bordered table-hover'>
            <thead>
              <tr>
                <th className='custom-th'>Profile Photo</th>
                <th className='custom-th'>Full Name</th>
                <th className='custom-th'>Email</th>
                <th className='custom-th'>Contact Number</th>
                <th className='custom-th'>Role</th>
                <th className='custom-th'>Agreed to Data Consent</th>
                <th className='custom-th'>Status</th>
                <th className='custom-th'>Date of Registration</th>
                <th className='custom-th'>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
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
                    <td>
                    {user.role === 'churchCoor' ? (
                      user.status === 'Inactive' ? (
                        user.churchID ? (
                          <span>
                            {`Former Church Coordinator of ${
                              user.previousChurchName || 'Unknown'
                            }`}
                          </span>
                        ) : (
                          'Former Church Coordinator'
                        )
                      ) : (
                        `Church Coordinator of ${user.churchName || 'Unknown'}`
                      )
                    ) : (
                      roleTypeMapping[user.role]
                    )}
                  </td>
  
                    <td>{user.dataConsent ? 'Yes' : 'No'}</td>
                    <td
                      style={{
                        color:
                          user.status === 'Active'
                            ? 'green'
                            : user.status === 'Inactive'
                            ? 'red'
                            : user.status === 'Pending'
                            ? '#b8860b'
                            : 'black',
                        fontWeight: 'bold',
                      }}
                    >
                      ●{user.status || 'N/A'}
                    </td>
  
                    <td>
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
                ))
              ):(
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center'}}>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
        </>
      )}
    </div>
  );
};

export default UserDatabase;
