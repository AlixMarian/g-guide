import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '/backend/firebase';
import { Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../websiteUser.css';
import useChatbot from './Chatbot';

const Home = () => {
  const [churches, setChurches] = useState([]);
  useChatbot();

  useEffect(() => {
    const fetchChurches = async () => {
      try {
        const churchCollection = collection(db, 'church');
        const churchSnapshot = await getDocs(churchCollection);
        const churchData = churchSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setChurches(churchData);
      } catch (error) {
        console.error('Error fetching churches: ', error);
      }
    };

    fetchChurches();
  }, []);

  const renderCarouselItems = () => {
    const items = churches.length > 0 ? churches : [{
      id: 'no-churches',
      churchName: 'Be a Part of Our Family!',
      churchAddress: 'Register as a Church Coordinator and sign up your church to join our community.',
    }];
  
    return items.map((church, index) => (
      <Carousel.Item key={church.id} className={index === 0 ? 'active' : ''}>
        <div className="homeCarousel row justify-content-center mb-5">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body text-center">
                <h5 className="card-title mb-2">{church.churchName}</h5>
                <p className="card-text text-muted">{church.churchAddress}</p>
              </div>
            </div>
          </div>
        </div>
      </Carousel.Item>
    ));
  };
  
  return (
    <>
      <div id="siteBanner" className="text-center">
        <img src="../src/assets/siteBanner.png" className="d-block w-100" alt="Site Banner" />
      </div>

      <div className="partneredChurch mt-4">
          <h3 className="text-center mb-4">Our Partnered Churches</h3>
          <Carousel id="partneredChurchCarousel" className="carousel slide" data-bs-ride="carousel" indicators={false} controls={true} interval={5000} pause="hover">
            {renderCarouselItems()}
          </Carousel>
      </div>


      <div id="featureBanner" className="text-center">
        <img src="../src/assets/featureBanner.png" className="d-block w-100" alt="Feature Banner" />
      </div>

      <div className="featureBanner">
        <h1 className="text-center">Features</h1>
        <div className="card-group">
          <div className="card">
            <img src="../src/assets/findAChurch.png" className="card-img-top" alt="Find a Church" />
            <div className="card-body">
              <h5 className="card-title">Find a Church</h5>
              <p className="card-text">Easily locate a church based on your device&apos;s location.</p>
            </div>
          </div>
          <div className="card">
            <img src="../src/assets/visitaIglesia.png" className="card-img-top" alt="Visita Iglesia Route Maker" />
            <div className="card-body">
              <h5 className="card-title">Visita Iglesia Route Maker</h5>
              <p className="card-text">Based on your starting point, we can generate a route consisting of nearby churches.</p>
            </div>
          </div>
          <div className="card">
            <img src="../src/assets/viewChurchInfo.png" className="card-img-top" alt="View Church Information" />
            <div className="card-body">
              <h5 className="card-title">View Church Information</h5>
              <p className="card-text">Know the church&apos;s mass schedules, language and services they offer.</p>
            </div>
          </div>
          <div className="card">
            <img src="../src/assets/setUp.png" className="card-img-top" alt="Set Up Appointments" />
            <div className="card-body">
              <h5 className="card-title">Set Up Appointments</h5>
              <p className="card-text">View available slots and set up an appointment based on the service you want to avail.</p>
            </div>
          </div>
          <div className="card">
            <img src="../src/assets/reqVolunteer.png" className="card-img-top" alt="Request for Help" />
            <div className="card-body">
              <h5 className="card-title">Request for Help</h5>
              <p className="card-text">Churches can create a call for help which brings community closer together.</p>
            </div>
          </div>
        </div>
      </div>

      <div id="contactUs" className="text-center">
        <img src="../src/assets/contactUs.png" className="d-block w-100" alt="Contact Us" />
      </div>
    </>
  );
};

export default Home;
