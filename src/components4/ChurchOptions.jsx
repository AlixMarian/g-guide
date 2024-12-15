import { useEffect, useState } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { Card, Button, Container, Row, Col, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../websiteUser.css';


 const ChurchOptions = () => {
  const [churches, setChurches] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApprovedChurches = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'church'));
        const approvedChurches = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(church => church.churchStatus === 'Approved' || church.churchStatus === 'Archived');
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentChurches = churches.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(churches.length / itemsPerPage);

  const handlePaginationClick = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className='churchList'>
      <Container>
        <h1 className="text-center mb-4">G! Guide Registered Churches</h1>
        <Row className="justify-content-center">
          {currentChurches.map((church) => (
            <Col key={church.id} md={4} className="mb-4 d-flex align-items-stretch">
              <Card className="w-100 h-100 text-center shadow-lg">
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <Card.Title>{church.churchName}</Card.Title>
                    <Card.Text>
                      <strong>Church Address:</strong> {church.churchAddress} <br />
                      <strong>Service Hours:</strong> {renderServiceHours(church)}
                    </Card.Text>
                  </div>
                  <Button className="mt-5" variant="primary" onClick={() => handleGoToHomepage(church.id)}>
                    Go to Church Homepage
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            {[...Array(totalPages).keys()].map((page) => (
              <Pagination.Item
                key={page + 1}
                active={page + 1 === currentPage}
                onClick={() => handlePaginationClick(page + 1)}
              >
                {page + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </div>
      </Container>
    </div>
  );
};

export default ChurchOptions;
