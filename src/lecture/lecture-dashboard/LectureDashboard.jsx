import { useState, useEffect } from "react"
import "./lecture-dashboard.css"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { server } from "../../main"
import toast from "react-hot-toast"
import { UserData } from "../../context/UserContext"
import Layout from "../../admin/Utils/Layout"

const LectureDashboard = () => {
  const navigate = useNavigate()
  const { user } = UserData()
  const [assignedClasses, setAssignedClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredClasses, setFilteredClasses] = useState([])

  useEffect(() => {
    // Redirect if not a lecturer
    if (user && user.role !== "lect") {
      navigate("/")
      return
    }

    fetchAssignedClasses()
  }, [user, navigate])

  // Filter classes based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = assignedClasses.filter(liveClass => 
        liveClass.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        liveClass.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredClasses(filtered)
    } else {
      setFilteredClasses(assignedClasses)
    }
  }, [searchQuery, assignedClasses])

  const fetchAssignedClasses = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${server}/api/lecturer/classes`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      })
      setAssignedClasses(data.liveClasses)
      setFilteredClasses(data.liveClasses) // Initialize filtered classes
      setLoading(false)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch assigned classes")
      setLoading(false)
    }
  }

  const handleTakeClass = async (id) => {
    try {
      const { data } = await axios.get(`${server}/api/live-class/validate-time/${id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      })

      if (data.isValid) {
        navigate(`/zoom-meeting/${id}`)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to validate class time")
    }
  }

  // Calculate remaining time for a live class
  const calculateRemainingTime = (endDateTime) => {
    const now = new Date().getTime()
    const endTime = new Date(endDateTime).getTime()
    const timeDifference = endTime - now

    if (timeDifference <= 0) {
      return "Expired"
    }

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000)

    return `${days}d ${hours}h ${minutes}m ${seconds}s`
  }

  // Check if a class is currently active
  const isClassActive = (startDateTime, endDateTime) => {
    const now = new Date().getTime()
    const startTime = new Date(startDateTime).getTime()
    const endTime = new Date(endDateTime).getTime()

    return now >= startTime && now <= endTime
  }

  return (
    <Layout>
      <div className="lecture-dashboard">
        <h1>Lecture Dashboard</h1>
        <p>Welcome, {user?.name}. Here are your assigned live classes:</p>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search your classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {loading ? (
          <p>Loading your classes...</p>
        ) : filteredClasses.length > 0 ? (
          <div className="assigned-classes">
            {filteredClasses.map((liveClass) => {
              const remainingTime = calculateRemainingTime(liveClass.endDateTime)
              const isActive = isClassActive(liveClass.startDateTime, liveClass.endDateTime)

              return (
                <div key={liveClass._id} className="live-class-card">
                  <img src={`${server}/${liveClass.image}`} alt="" className="class-image" />
                  <div className="class-details">
                    <h3>{liveClass.title}</h3>
                    <p>{liveClass.description}</p>
                    <p>Type: {liveClass.type}</p>
                    <p>Meeting ID: {liveClass.meetingId}</p>
                    <p>Passcode: {liveClass.passcode}</p>
                    <p>Start: {new Date(liveClass.startDateTime).toLocaleString("en-GB")}</p>
                    <p>End: {new Date(liveClass.endDateTime).toLocaleString("en-GB")}</p>
                    <p>Time Remaining: {remainingTime}</p>
                    <p>Status: {isActive ? "Active Now" : remainingTime === "Expired" ? "Expired" : "Upcoming"}</p>

                    <button onClick={() => handleTakeClass(liveClass._id)} className="common-btn" disabled={!isActive}>
                      {isActive
                        ? "Take Class Now"
                        : remainingTime === "Expired"
                          ? "Class Expired"
                          : "Class Not Started Yet"}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p>{searchQuery ? "No classes found matching your search" : "You don't have any assigned live classes yet."}</p>
        )}
      </div>
    </Layout>
  )
}

export default LectureDashboard;