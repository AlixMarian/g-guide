import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { Dropdown, Table, Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getAuth, onAuthStateChanged} from 'firebase/auth';
import { useNavigate} from 'react-router-dom';

export const UserDatabase = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [setSelectedRole] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
      setFilteredUsers(userList);
    };

    fetchUsers();
  }, []);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    if (role === 'all') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(user => user.role === role));
    }
  };

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User signed in:", user);
      } else {
        console.log("No user signed in.");
        navigate('/login'); // Redirect to login if no user is signed in
      }
    });
  }, [navigate]);

  return (
    <Container>
      <Row className="mt-4 mb-2">
        <Col>
          <Dropdown>
            <Dropdown.Toggle variant="primary" id="dropdown-basic">
              Filter by Role
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleRoleChange('all')}>All</Dropdown.Item>
              <Dropdown.Item onClick={() => handleRoleChange('websiteUser')}>Website User</Dropdown.Item>
              <Dropdown.Item onClick={() => handleRoleChange('churchCoor')}>Church Coordinator</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{`${user.firstName} ${user.lastName}`}</td>
                  <td>{user.email}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default UserDatabase;
