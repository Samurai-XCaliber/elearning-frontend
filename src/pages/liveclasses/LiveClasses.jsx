import { useState, useEffect } from "react";
import "./liveclasses.css";
import { LiveClassData } from "../../context/LiveClassContext";
import LiveClassCard from "../../components/liveclasscard/LiveClassCard";
import { UserData } from "../../context/UserContext";

const LiveClasses = () => {
  const { liveClasses } = LiveClassData();
  const { user } = UserData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLiveClasses, setFilteredLiveClasses] = useState([]);

  // Filter live classes based on search query and expiration
  useEffect(() => {
    const currentTime = new Date();

    // Filter live classes based on search query and user role
    const validLiveClasses = liveClasses.filter((liveClass) => {
      const endTime = new Date(liveClass.endDateTime);

      // Admins and superadmins can see all live classes
      if (user && (user.role === "admin" || user.role === "superadmin")) {
        return liveClass.title.toLowerCase().includes(searchQuery.toLowerCase());
      }

      // Regular users can only see live classes that haven't expired
      return (
        endTime > currentTime &&
        liveClass.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    // If the user is a lecturer, filter live classes assigned to them
    if (user && user.role === "lect") {
      const lecturerLiveClasses = validLiveClasses.filter(
        (liveClass) => liveClass.lectureUsername === user.email
      );
      setFilteredLiveClasses(lecturerLiveClasses);
    } else {
      setFilteredLiveClasses(validLiveClasses);
    }
  }, [liveClasses, searchQuery, user]);

  return (
    <div>
      <h1>Live Classes</h1>
      <div className="search-container">
        <input
          className="search-input"
          type="text"
          placeholder="Search live classes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="live-classes">
        <h2>Available Live Classes</h2>

        <div className="live-class-container">
          {filteredLiveClasses && filteredLiveClasses.length > 0 ? (
            filteredLiveClasses.map((liveClass) => (
              <LiveClassCard key={liveClass._id} liveClass={liveClass} />
            ))
          ) : (
            <p>No Live Classes Yet!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveClasses;