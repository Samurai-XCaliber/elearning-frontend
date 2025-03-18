import { useState, useEffect } from "react"
import axios from "axios"
import { server } from "../../main"
import { useParams, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import "./ZoomMeeting.css"

const ZoomMeeting = ({ user }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [liveClass, setLiveClass] = useState(null)
  const [loading, setLoading] = useState(true)
  const [meetingId, setMeetingId] = useState("")
  const [passcode, setPasscode] = useState("")
  const [error, setError] = useState("")
  const [isValid, setIsValid] = useState(false)
  const [inputsDisabled, setInputsDisabled] = useState(false)
  const [meetingCreated, setMeetingCreated] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)

  const fetchLiveClass = async () => {
    try {
      const { data } = await axios.get(`${server}/api/live-class/${id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      })
      setLiveClass(data.liveClass)

      // Check if meeting is already created
      if (data.liveClass.meetingStarted) {
        setMeetingCreated(true)
      }

      // Check if user has access to this class
      if (user.role === "lect") {
        const accessResponse = await axios.get(`${server}/api/live-class/validate-access/${id}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        })
        setHasAccess(accessResponse.data.hasAccess)
      } else {
        // Admin or users who purchased the class have access
        setHasAccess(user.role === "admin" || user.subscription.includes(data.liveClass._id))
      }

      setLoading(false)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch live class")
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveClass()
  }, [id])

  const validateCredentials = async () => {
    if (!meetingId || !passcode) {
      setError("Meeting ID and passcode are required.")
      setIsValid(false)
      return
    }

    try {
      const { data } = await axios.post(
        `${server}/api/live-class/validate-credentials`,
        { meetingId, passcode, liveClassId: id },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        },
      )

      if (data.isValid) {
        setError("")
        setIsValid(true)
        setInputsDisabled(true)
      } else {
        setError("Invalid meeting ID or passcode.")
        setIsValid(false)
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to validate credentials.")
      setIsValid(false)
    }
  }

  const createMeeting = async () => {
    if (!isValid) {
      setError("Please enter valid meeting ID and passcode.")
      return
    }

    // Check if user is the assigned lecturer
    if (user.role === "lect" && !hasAccess) {
      setError("You are not authorized to create this meeting.")
      return
    }

    try {
      const { data } = await axios.post(
        `${server}/api/zoom/meeting`,
        { meetingId, passcode },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        },
      )
      if (data.join_url) {
        // Update the live class to indicate meeting has started
        await axios.post(
          `${server}/api/live-class/${id}/start-meeting`,
          {},
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          },
        )
        setMeetingCreated(true)
        toast.success("Meeting created successfully!")
        window.location.href = data.join_url
      } else {
        setError("Failed to create the meeting.")
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create the meeting.")
    }
  }

  const joinMeeting = async () => {
    if (!isValid) {
      setError("Please enter valid meeting ID and passcode.")
      return
    }
    try {
      const { data } = await axios.post(
        `${server}/api/zoom/meeting`,
        { meetingId, passcode },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        },
      )
      if (data.join_url) {
        toast.success("Joining meeting...")
        window.location.href = data.join_url
      } else {
        setError("Failed to join the meeting.")
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to join the meeting.")
    }
  }

  if (loading) return <div>Loading...</div>

  // If user doesn't have access, show error message
  if (!loading && user.role === "lect" && !hasAccess) {
    return (
      <div className="zoom-meeting">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You are not authorized to access this live class.</p>
          <p>Only the assigned lecturer can access this class.</p>
          <button onClick={() => navigate("/lecture-dashboard")} className="common-btn">
            Back to Lecture Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="zoom-meeting">
      <img src={`${server}/${liveClass.image}`} alt="" />
      <h1>{liveClass.title}</h1>
      <p>Meeting ID: {liveClass.meetingId}</p>
      <p>Meeting password: {liveClass.passcode}</p>
      <p>{liveClass.description}</p>
      <p>Start: {new Date(liveClass.startDateTime).toLocaleString()}</p>
      <p>End: {new Date(liveClass.endDateTime).toLocaleString()}</p>
      {liveClass.lectureUsername && <p>Assigned Lecturer: {liveClass.lectureUsername}</p>}

      {user && (user.role === "lect" || user.role === "user" || user.role === "admin") && (
        <div className="input-container">
          <input
            type="text"
            placeholder="Meeting ID"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            disabled={inputsDisabled}
          />
          <input
            type="text"
            placeholder="Passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            disabled={inputsDisabled}
          />
          <button onClick={validateCredentials} className="common-btn">
            Validate Credentials
          </button>
          {error && <p className="error-message">{error}</p>}

          {isValid && (
            <div>
              {/* Show "Create Zoom Meeting" button for lecturers */}
              {user.role === "lect" && hasAccess && (
                <button onClick={createMeeting} className="common-btn">
                  Create Zoom Meeting
                </button>
              )}

              {/* Show "Join Zoom Meeting" button for users */}
              {user.role === "user" && meetingCreated && (
                <button onClick={joinMeeting} className="common-btn">
                  Join Zoom Meeting
                </button>
              )}

              {/* Show waiting message for users if the meeting hasn't started yet */}
              {user.role === "user" && !meetingCreated && (
                <p className="waiting-message">Waiting for lecturer to start the meeting...</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ZoomMeeting;