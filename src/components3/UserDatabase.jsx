import { useEffect, useState } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { Table, Button, Modal, Dropdown } from 'react-bootstrap';

export const UserDatabase = () => {
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    };

    fetchUsers();
  }, []);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
  };

  const handleShowModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };
  

  const filteredUsers = selectedRole === 'All' ? users : users.filter(user => user.role === selectedRole);

  return (
    <div>
      <h3>User Database</h3> <br/>
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
      
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id}>
              <td>{`${user.firstName} ${user.lastName}`}</td>
              <td>{user.email}</td>
              <td>
                <Button variant="info" onClick={() => handleShowModal(user)}>View Details</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {selectedUser && (
        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>User Information</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <div className="d-flex justify-content-center mb-3">
            <img src={selectedUser.profileImage} alt="Profile" 
              style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%' 
              }} 
            />
          </div>
            <p><strong>Full Name:</strong> {`${selectedUser.firstName} ${selectedUser.lastName}`}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Contact Number:</strong> {selectedUser.contactNum}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
            <p><strong>Agreed to  Data Consent:</strong> {selectedUser.dataConsent ? 'Yes' : 'No'}</p>
            
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default UserDatabase;