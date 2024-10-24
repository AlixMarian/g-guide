import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import '../churchCoordinator.css';

export const Layout = () => {
  const sidebarRef = useRef(null);
  const secondSidebarRef = useRef(null); // Ref for the second sidebar
  const navigate = useNavigate();

  const [activeNumber, setActiveNumber] = useState(null);
  const [secondSidebarOpen, setSecondSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null); 

  const handleClick = (number) => {
    setActiveNumber(number); // Set the clicked number as active
  };

  const handleAppointment = () => {
    setSecondSidebarOpen(!secondSidebarOpen); // Toggle the second sidebar
    setActiveSection('appointments'); // Set the active section
  };

  const handleSEA = () => {
    setSecondSidebarOpen(!secondSidebarOpen);
    setActiveSection('mass-schedule');
  };

  const handleRequestforVolunteer = () => {
    navigate('/RequestforVolunteer');
  };

  const handleServiceOffered = () => {
    setSecondSidebarOpen(!secondSidebarOpen);
    setActiveSection('services-offered');
  };

  const handleChurchInfo = () => {
    setSecondSidebarOpen(!secondSidebarOpen);
    setActiveSection('church-info');
  };

  const handleListofPriest = () => {
    navigate('/ListofPriest');
  };

  //
  const handlePending = () => {
    navigate('/PendingAppointments');
  };

  const handleForPayment = () => {
    navigate('/ForPaymentAppointments');
  };

  const handleApprovedAppointments = () => {
    navigate('/ApprovedAppointments');
  };

  const handleDeniedAppointments = () => {
    navigate('/DeniedAppointments');
  };

  const handleMassIntentions = () => {
    navigate('/MassIntentions');
  };

  const handlePaymentHistory = () => {
    navigate('/PaymentHistory');
  };

  //
  const handleSchedules = () => {
    navigate('/Schedules')
  }

  const handleChurchEvents = () => {
    navigate('/ChurchEvents')
  }

  const handleAnnouncements = () => {
    navigate('/Announcements')
  }

//
  const handleExploreServices = () => {
    navigate('/ExploreServices')
  }

  const handleSlots = () => {
    navigate('/Slots')
  }


  //
  const handleChurchDetails = () => {
    navigate('/ChurchDetails')
  }

  const handleChurchUploads = () => {
    navigate('/ChurchUploads')
  }


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (secondSidebarRef.current && !secondSidebarRef.current.contains(event.target) && !sidebarRef.current.contains(event.target)) {
        setSecondSidebarOpen(false); // Close the sidebar if click is outside
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      // Cleanup the event listener
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [secondSidebarRef]);

  const renderSecondSidebarContent = () => {
    switch (activeSection) {
      case 'appointments':
        return (
          <div className="second-sidebar-appointments-content">
            <div onClick={handlePending}>
            <div className={`numbers ${activeNumber === 'pending' ? 'active' : ''}`} onClick={() => handleClick('pending')}>
                <input type="image" src="../src/assets/number-1.png" className="image-size" />
                <h3 className="second-button-name">Pending</h3>
            </div>
            </div>
            <div onClick={handleForPayment}>
            <div className={`numbers ${activeNumber === 'for-payment' ? 'active' : ''}`} onClick={() => handleClick('for-payment')}>
              <input type="image" src="../src/assets/number-2.png" className="image-size" />
              <h3 className="second-button-name">For Payment</h3>
            </div>
            </div>
            <div onClick={handleApprovedAppointments}>
            <div className={`numbers ${activeNumber === 'approved' ? 'active' : ''}`} onClick={() => handleClick('approved')}>
              <input type="image" src="../src/assets/number-3.png" className="image-size" />
              <h3 className="second-button-name">Approved</h3>
            </div>
            </div>
            <div onClick={handleDeniedAppointments}>
            <div className={`numbers ${activeNumber === 'denied' ? 'active' : ''}`} onClick={() => handleClick('denied')}>
              <input type="image" src="../src/assets/number-4.png" className="image-size" />
              <h3 className="second-button-name">Denied</h3>
            </div>
            </div>
            <div onClick={handleMassIntentions}>
            <div className={`numbers ${activeNumber === 'mass-intentions' ? 'active' : ''}`} onClick={() => handleClick('mass-intentions')}>
              <input type="image" src="../src/assets/number-5.png" className="image-size" />
              <h3 className="second-button-name">Mass Intentions</h3>
            </div>
            </div>
          </div>
        );
      case 'mass-schedule':
        return (
          <div className="second-sidebar-mass-schedule-content">
            <div onClick={handleSchedules}>
            <div className={`numbers ${activeNumber === 'schedules' ? 'active' : ''}`} onClick={() => handleClick('schedules')}>
              <input type="image" src="../src/assets/number-1.png" className="image-size" />
              <h3 className="second-button-name">Schedules</h3>
            </div>
            </div>
            <div onClick={handleChurchEvents}>
            <div className={`numbers ${activeNumber === 'church-events' ? 'active' : ''}`} onClick={() => handleClick('church-events')}>
              <input type="image" src="../src/assets/number-2.png" className="image-size" />
              <h3 className="second-button-name">Church Events</h3>
            </div>
            </div>
            <div onClick={handleAnnouncements}>
            <div className={`numbers ${activeNumber === 'announcements' ? 'active' : ''}`} onClick={() => handleClick('announcements')}>
              <input type="image" src="../src/assets/number-3.png" className="image-size" />
              <h3 className="second-button-name">Announcements</h3>
            </div>
            </div>
          </div>
        );
      case 'services-offered':
        return (
          <div className="second-sidebar-services-offered-content">
            <div onClick={handleExploreServices}>
            <div className={`numbers ${activeNumber === 'schedules' ? 'active' : ''}`} onClick={() => handleClick('schedules')}>
              <input type="image" src="../src/assets/number-1.png" className="image-size" />
              <h3 className="second-button-name">Explore Services</h3>
            </div>
            </div>
            <div onClick={handleSlots}>
            <div className={`numbers ${activeNumber === 'church-events' ? 'active' : ''}`} onClick={() => handleClick('church-events')}>
              <input type="image" src="../src/assets/number-2.png" className="image-size" />
              <h3 className="second-button-name">Time Slots</h3>
            </div>
            </div>
            <div className={`numbers ${activeNumber === 'announcements' ? 'active' : ''}`} onClick={() => handleClick('announcements')}>
              <input type="image" src="../src/assets/number-3.png" className="image-size" />
              <h3 className="second-button-name">Refund Policy</h3>
            </div>
          </div>
        );
      case 'church-info':
        return (
          <div className="second-sidebar-church-info-content">
            <div onClick={handleChurchDetails}>
            <div className={`numbers ${activeNumber === 'schedules' ? 'active' : ''}`} onClick={() => handleClick('schedules')}>
              <input type="image" src="../src/assets/number-1.png" className="image-size" />
              <h3 className="second-button-name">Church Details</h3>
            </div>
            </div>
            <div onClick={handleChurchUploads}>
            <div className={`numbers ${activeNumber === 'church-events' ? 'active' : ''}`} onClick={() => handleClick('church-events')}>
              <input type="image" src="../src/assets/number-2.png" className="image-size" />
              <h3 className="second-button-name">Church Uploads</h3>
            </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="sidebar-container">
        <div className="sidebar" ref={sidebarRef}>
          <div className='logo'>
            <input type="image" src="../src/assets/G-Guide LOGO.png" height="80" width="80" style={{ filter: 'drop-shadow(0 3px 3px rgba(0, 0, 0, 0.5))' }} />
          </div>
          <div className="sidebar-content">
            <div 
              className={`appointments ${activeSection === 'appointments' ? 'coord-active' : ''}`} 
              onClick={handleAppointment}
            >
              <input type="image" src="../src/assets/appointments.png" className='image-size' />
              <h3 className='button-name'>Appointments</h3>
            </div>
            <div 
              className={`payment-history ${activeSection === 'payment-history' ? 'coord-active' : ''}`} 
              onClick={handlePaymentHistory}
            >
              <input type="image" src="../src/assets/payment-history.png" className='image-size' />
              <h3 className='button-name'>Payment History</h3>
            </div>
            <div 
              className={`mass-schedule ${activeSection === 'mass-schedule' ? 'coord-active' : ''}`} 
              onClick={handleSEA}
            >
              <input type="image" src="../src/assets/mass schedule.png" className='image-size' />
              <h3 className='button-name'>Mass Schedule</h3>
            </div>
            <div 
              className={`volunteer-call ${activeSection === 'volunteer-call' ? 'coord-active' : ''}`} 
              onClick={handleRequestforVolunteer}
            >
              <input type="image" src="../src/assets/volunteer.png" className='image-size' />
              <h3 className='button-name'>Volunteer Call</h3>
            </div>
            <div 
              className={`services-offered ${activeSection === 'services-offered' ? 'coord-active' : ''}`} 
              onClick={handleServiceOffered}
            >
              <input type="image" src="../src/assets/services offered.png" className='image-size' />
              <h3 className='button-name'>Services Offered</h3>
            </div>
            <div 
              className={`church-info ${activeSection === 'church-info' ? 'coord-active' : ''}`} 
              onClick={handleChurchInfo}
            >
              <input type="image" src="../src/assets/church.png" className='image-size' />
              <h3 className='button-name'>Church Info</h3>
            </div>
            <div 
              className={`priest-list ${activeSection === 'priest-list' ? 'coord-active' : ''}`} 
              onClick={handleListofPriest}
            >
              <input type="image" src="../src/assets/priest.png" className='image-size' />
              <h3 className='button-name'>Priest List</h3>
            </div>
          </div>
        </div>
        
        <div className={`second-sidebar ${secondSidebarOpen ? 'open' : 'close'}`} ref={secondSidebarRef}>
          <div className="second-sidebar-content">
            {renderSecondSidebarContent()}
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
