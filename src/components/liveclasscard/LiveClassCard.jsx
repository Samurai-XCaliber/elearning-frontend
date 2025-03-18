import React from "react";
import "./LiveClassCard.css";
import { server } from "../../main";
import { UserData } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { LiveClassData } from "../../context/LiveClassContext";

const LiveClassCard = ({ liveClass }) => {
  const navigate = useNavigate();
  const { user, isAuth } = UserData();
  const { fetchLiveClasses } = LiveClassData();

  // Calculate remaining time
  const calculateRemainingTime = () => {
    const now = new Date().getTime();
    const endTime = new Date(liveClass.endDateTime).getTime();
    const timeDifference = endTime - now;

    if (timeDifference <= 0) {
      return "Expired";
    }

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const [remainingTime, setRemainingTime] = React.useState(calculateRemainingTime());

  // Update remaining time every second
  React.useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(calculateRemainingTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Check if the live class has expired
  const isExpired = remainingTime === "Expired";

  const deleteLiveClass = async (id) => {
    if (confirm("Are you sure you want to delete this live class?")) {
      try {
        const { data } = await axios.delete(`${server}/api/live-class/${id}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });

        toast.success(data.message);
        fetchLiveClasses();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete live class");
      }
    }
  };

  const handleTakeClass = async (id) => {
    try {
      // Check if the user is the assigned lecturer for this class
      const { data } = await axios.get(`${server}/api/live-class/validate-access/${id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      if (!data.hasAccess) {
        toast.error("You are not authorized to take this class");
        return;
      }

      // Validate time
      const timeValidation = await axios.get(`${server}/api/live-class/validate-time/${id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      if (timeValidation.data.isValid) {
        navigate(`/zoom-meeting/${id}`);
      } else {
        toast.error(timeValidation.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to validate class");
    }
  };

  const handleJoinClass = async (id) => {
    try {
      const { data } = await axios.get(`${server}/api/live-class/validate-time/${id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      if (data.isValid) {
        navigate(`/zoom-meeting/${id}`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to validate class time");
    }
  };

  const handleGetStarted = (id) => {
    if (isAuth) {
      navigate(`/live-class/${id}`);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="live-class-card">
      <img src={`${server}/${liveClass.image}`} alt="" className="live-class-image" />
      <h3>{liveClass.title}</h3>
      <h3>Meeting ID: {liveClass.meetingId}</h3>
      <h3>Passcode: {liveClass.passcode}</h3>
      <p>{liveClass.description}</p>
      <p>Type: {liveClass.type}</p>
      <p>Start: {new Date(liveClass.startDateTime).toLocaleString("en-GB")}</p>
      <p>End: {new Date(liveClass.endDateTime).toLocaleString("en-GB")}</p>
      <p>Available Period: {remainingTime}</p>
      <p>Price: ₹{liveClass.price}</p>

      {/* Display Meeting ID and Passcode */}
     

      {isAuth ? (
        <>
          {user && user.role === "admin" && (
            <button onClick={() => navigate("/account")} className="common-btn">
              Go to Dashboard
            </button>
          )}

          {user && user.role === "lect" && (
            <button onClick={() => navigate("/account")} className="common-btn">
              Go to Dashboard
            </button>
          )}

          {user && user.role === "user" && (
            <button
              onClick={() => (liveClass.purchased ? handleJoinClass(liveClass._id) : handleGetStarted(liveClass._id))}
              className="common-btn"
              disabled={isExpired}
            >
              {liveClass.purchased ? "Join Class" : "Get Started"}
            </button>
          )}
        </>
      ) : (
        <button onClick={() => navigate("/login")} className="common-btn" disabled={isExpired}>
          Get Started
        </button>
      )}
    </div>
  );
};

export default LiveClassCard;