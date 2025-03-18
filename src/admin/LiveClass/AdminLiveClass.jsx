import { useState, useEffect } from "react"
import "./adminliveclass.css"
import Layout from "../Utils/Layout"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { server } from "../../main"
import toast from "react-hot-toast"
import { UserData } from "../../context/UserContext"

const LiveClass = ({ user }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const { fetchUser } = UserData();

  const [liveClasses, setLiveClasses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [meetingId, setMeetingId] = useState("")
  const [passcode, setPasscode] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [type, setType] = useState("liveclass")
  const [startDateTime, setStartDateTime] = useState("")
  const [endDateTime, setEndDateTime] = useState("")
  const [image, setImage] = useState("")
  const [imagePrev, setImagePrev] = useState("")
  const [lectureUsername, setLectureUsername] = useState("") // New state for lecture username
  const [btnLoading, setBtnLoading] = useState(false)
  const [lecturers, setLecturers] = useState([]) // State to store lecturers

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/"); fetchLiveClasses();
    }
  }, [user, navigate])

  // Fetch live classes from the backend
  const fetchLiveClasses = async () => {
    try {
      const { data } = await axios.get(`${server}/api/live-classes`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      })
      setLiveClasses(data.liveClasses)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch live classes")
    }
  };

  const filteredLiveClasses = liveClasses.filter((liveClass) =>
    liveClass.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch lecturers (users with role "lect")
  const fetchLecturers = async () => {
    try {
      const { data } = await axios.get(`${server}/api/lecturers`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      })
      setLecturers(data.lecturers)
    } catch (error) {
      console.error("Failed to fetch lecturers:", error)
    }
  }

  useEffect(() => {
    fetchLiveClasses()
    fetchLecturers()
  }, [])

  const changeImageHandler = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()

    reader.readAsDataURL(file)

    reader.onloadend = () => {
      setImagePrev(reader.result)
      setImage(file)
    }
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    setBtnLoading(true)

    const myForm = new FormData()

    myForm.append("meetingId", meetingId)
    myForm.append("passcode", passcode)
    myForm.append("title", title)
    myForm.append("description", description)
    myForm.append("price", price)
    myForm.append("type", type)
    myForm.append("startDateTime", startDateTime)
    myForm.append("endDateTime", endDateTime)
    myForm.append("lectureUsername", lectureUsername) // Add lecture username to form data
    myForm.append("file", image)

    try {
      const { data } = await axios.post(`${server}/api/live-class/new`, myForm, {
        headers: {
          token: localStorage.getItem("token"),
        },
      })

      toast.success(data.message)
      setBtnLoading(false)
      setShowForm(false)
      fetchLiveClasses()

      // Reset form fields
      setMeetingId("")
      setPasscode("")
      setTitle("")
      setDescription("")
      setPrice("")
      setType("liveclass")
      setStartDateTime("")
      setEndDateTime("")
      setLectureUsername("") // Reset lecture username
      setImage("")
      setImagePrev("")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create live class")
      setBtnLoading(false)
    }
  }

  const deleteLiveClass = async (id) => {
    if (confirm("Are you sure you want to delete this live class?")) {
      try {
        const { data } = await axios.delete(`${server}/api/live-class/${id}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        })

        toast.success(data.message)
        fetchLiveClasses()
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete live class")
      }
    }
  }

  return (
    <Layout>
    <div className="admin-live-classes">
      <div className="left">
        <h1>All Live Classes</h1>
        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search live classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="dashboard-content">
          {filteredLiveClasses.length > 0 ? (
            filteredLiveClasses.map((liveClass) => (
              <div key={liveClass._id} className="live-class-card">
                <img src={`${server}/${liveClass.image}`} alt="" />
                <h3>{liveClass.title}</h3>
                <p>Meeting ID: {liveClass.meetingId}</p>
                <p>Password: {liveClass.passcode}</p>
                <p>{liveClass.description}</p>
                <p>Price: ₹{liveClass.price}</p>
                <p>Type: {liveClass.type}</p>
                <p>Assigned Lecturer: {liveClass.lectureUsername || "None"}</p>
                <p>Start: {new Date(liveClass.startDateTime).toLocaleString("en-GB")}</p>
                <p>End: {new Date(liveClass.endDateTime).toLocaleString("en-GB")}</p>
                <button
                  onClick={() => deleteLiveClass(liveClass._id)}
                  className="common-btn"
                  style={{ background: "red" }}
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p>No Live Classes Yet</p>
          )}
        </div>
      </div>

        <div className="right">
          <div className="add-live-class">
            <button onClick={() => setShowForm(!showForm)} className="common-btn">
              {showForm ? "Close" : "Add Live Class"}
            </button>

            {showForm && (
              <div className="live-class-form">
                <h2>Add Live Class</h2>
                <form onSubmit={submitHandler}>
                  <label htmlFor="meetingId">Meeting ID</label>
                  <input type="text" value={meetingId} onChange={(e) => setMeetingId(e.target.value)} required />

                  <label htmlFor="passcode">Passcode</label>
                  <input type="text" value={passcode} onChange={(e) => setPasscode(e.target.value)} required />

                  <label htmlFor="title">Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

                  <label htmlFor="description">Description</label>
                  <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />

                  <label htmlFor="price">Price</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />

                  <label htmlFor="type">Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} required>
                    <option value="liveclass">Live Class</option>
                    <option value="workshop">Workshop</option>
                  </select>

                  <label htmlFor="lectureUsername">Lecture Username</label>
                  <select value={lectureUsername} onChange={(e) => setLectureUsername(e.target.value)} required>
                    <option value="">Select Lecturer</option>
                    {lecturers.map((lecturer) => (
                      <option key={lecturer._id} value={lecturer.email}>
                        {lecturer.name} ({lecturer.email})
                      </option>
                    ))}
                  </select>

                  <label htmlFor="startDateTime">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
                    required
                  />

                  <label htmlFor="endDateTime">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={endDateTime}
                    onChange={(e) => setEndDateTime(e.target.value)}
                    required
                  />

                  <input type="file" required onChange={changeImageHandler} />
                  {imagePrev && <img src={imagePrev || "/placeholder.svg"} alt="" width={300} />}

                  <button type="submit" disabled={btnLoading} className="common-btn">
                    {btnLoading ? "Please Wait..." : "Add"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default LiveClass;

