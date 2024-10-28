import { useEffect, useState } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

 const ChurchOptions = () => {
  const [churches, setChurches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApprovedChurches = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'church'));
        const approvedChurches = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(church => church.churchStatus === 'Approved');
        setChurches(approvedChurches);
      } catch (error) {
        console.error('Error fetching approved churches: ', error);
      }
    };

    fetchApprovedChurches();
  }, []);

  const handleGoToHomepage = (churchId) => {
    navigate(`/church-homepage/${churchId}`);
  };

  const convertTo12HourFormat = (time) => {
    if (!time || time === "none") return "none";
    const [hours, minutes] = time.split(':');
    let hours12 = (hours % 12) || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hours12}:${minutes} ${ampm}`;
  };

  const renderServiceHours = (church) => {
    if (!church.churchStartTime || !church.churchEndTime || 
        church.churchStartTime === "none" || church.churchEndTime === "none") {
      return 'Information unavailable';
    }
    return `${convertTo12HourFormat(church.churchStartTime)} - ${convertTo12HourFormat(church.churchEndTime)}`;
  };

  return (
    <div>
    <Container>
    <h3>Our Partnered Church List</h3>
    <p>This page is temporary and for demonstration purposes only since our mapping feature is still on the way</p>
      <Row>
        {churches.map((church) => (
          <Col key={church.id} md={4} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>{church.churchName}</Card.Title>
                <Card.Text>
                  <strong>Church Address:</strong> {church.churchAddress} <br/>
                  <strong>Service Hours:</strong>  {renderServiceHours(church)}
                </Card.Text>
                <Button onClick={() => handleGoToHomepage(church.id)}>Go to Church Homepage</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
    </div>
  );
};

export default ChurchOptions;
