import React, { useEffect, useState } from "react";
import "./lecture.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Loading from "../../components/loading/Loading";
import toast from "react-hot-toast";
import { TiTick } from "react-icons/ti";
import { FaLock, FaUnlock } from "react-icons/fa";

const Lecture = ({ user }) => {
  const [lectures, setLectures] = useState([]);
  const [lecture, setLecture] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lecLoading, setLecLoading] = useState(false);
  const [show, setShow] = useState(false);
  const params = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setvideo] = useState("");
  const [videoPrev, setVideoPrev] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  const [completed, setCompleted] = useState(0);
  const [completedLec, setCompletedLec] = useState(0);
  const [lectLength, setLectLength] = useState(0);
  const [progress, setProgress] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [viewingFeedback, setViewingFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState([]);

  if (user && user.role !== "admin" && !user.subscription.includes(params.id))
    return navigate("/");

  async function fetchLectures() {
    try {
      const { data } = await axios.get(`${server}/api/lectures/${params.id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setLectures(data.lectures);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  async function fetchLecture(id) {
    setLecLoading(true);
    try {
      const { data } = await axios.get(`${server}/api/lecture/${id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setLecture(data.lecture);
      setLecLoading(false);
    } catch (error) {
      console.log(error);
      setLecLoading(false);
    }
  }

  const changeVideoHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setVideoPrev(reader.result);
      setvideo(file);
    };
  };

  const submitHandler = async (e) => {
    setBtnLoading(true);
    e.preventDefault();
    const myForm = new FormData();

    myForm.append("title", title);
    myForm.append("description", description);
    myForm.append("file", video);

    try {
      const { data } = await axios.post(
        `${server}/api/course/${params.id}`,
        myForm,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      toast.success(data.message);
      setBtnLoading(false);
      setShow(false);
      fetchLectures();
      fetchProgress(); // Re-fetch progress after adding a lecture
      setTitle("");
      setDescription("");
      setvideo("");
      setVideoPrev("");
    } catch (error) {
      toast.error(error.response.data.message);
      setBtnLoading(false);
    }
  };

  const deleteHandler = async (id) => {
    if (confirm("Are you sure you want to delete this lecture")) {
      try {
        const { data } = await axios.delete(`${server}/api/lecture/${id}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });

        toast.success(data.message);
        fetchLectures();
        fetchProgress(); // Re-fetch progress after deleting a lecture
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  async function fetchProgress() {
    try {
      const { data } = await axios.get(
        `${server}/api/user/progress?course=${params.id}`,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      setCompletedLec(data.completedLectures.length); // Ensure this is the length of completed lectures
      setProgress(data.progress);
      console.log("Progress fetched:", data);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchQuizProgress() {
    try {
      const { data } = await axios.get(
        `${server}/api/user/quiz-progress?course=${params.id}`,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      setQuizCompleted(data.quizCompleted);
    } catch (error) {
      console.log(error);
    }
  }

  const addProgress = async (id) => {
    try {
      const { data } = await axios.post(
        `${server}/api/user/progress?course=${params.id}&lectureId=${id}`,
        {},
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      console.log(data.message);
      fetchProgress();
    } catch (error) {
      console.log(error);
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      const { data } = await axios.post(
        `${server}/api/feedback`,
        {
          courseId: params.id,
          rating,
          comment,
        },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
  
      toast.success(data.message);
      setFeedbackSubmitted(true);
      setShowFeedbackForm(false);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const fetchFeedback = async () => {
    try {
      const { data } = await axios.get(
        `${server}/api/feedback/${params.id}`,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      setFeedbackData(data.feedback);
      setViewingFeedback(true);
      toast.success("Feedback fetched successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  // New useEffect to check if the current user has already submitted feedback
  useEffect(() => {
    if (user && (user.role === "user" || user.role === "lect")) {
      const fetchUserFeedbackStatus = async () => {
        try {
          const { data } = await axios.get(
            `${server}/api/feedback/${params.id}`,
            {
              headers: {
                token: localStorage.getItem("token"),
              },
            }
          );
          const userFeedback = data.feedback.find(
            (fb) => fb.user.email === user.email
          );
          if (userFeedback) {
            setFeedbackSubmitted(true);
          }
        } catch (error) {
          console.log(error);
        }
      };
      fetchUserFeedbackStatus();
    }
  }, [user, params.id]);

  useEffect(() => {
    fetchLectures();
    fetchProgress();
    fetchQuizProgress();
  }, []);

  useEffect(() => {
    if (lectures.length > 0) {
      const availableLectures = lectures.filter(
        (lecture) => !lecture.deleted
      );
      const availableLectLength = availableLectures.length;
      setLectLength(availableLectLength);
      const completedLectures =
        progress[0]?.completedLectures.filter((lectureId) =>
          availableLectures.some((lecture) => lecture._id === lectureId)
        ).length || 0;
      setCompletedLec(completedLectures);
      setCompleted((completedLectures / availableLectLength) * 100); // Recalculate progress percentage when lectures or completed lectures change
    }
  }, [lectures, progress]);

  const isLectureAccessible = (index) => {
    if (user.role === "admin" || user.role === "superadmin") return true; // Admin and superadmin can access all lectures
    if (index === 0) return true; // First lecture is always accessible
    return progress[0]?.completedLectures.includes(lectures[index - 1]._id);
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="progress">
            Lecture completed - {completedLec} out of {lectLength} <br />
            <progress value={completed} max={100}></progress>{" "}
            {isNaN(completed) ? 0 : completed.toFixed(2)} %
          </div>
          <div className="lecture-page">
            <div className="left">
              {lecLoading ? (
                <Loading />
              ) : (
                <>
                  {lecture.video ? (
                    <>
                      <div className="video-card">
                        <video
                          src={`${server}/${lecture.video}`}
                          width={"100%"}
                          controls
                          controlsList="nodownload noremoteplayback"
                          disablePictureInPicture
                          disableRemotePlayback
                          autoPlay
                          onEnded={() => addProgress(lecture._id)}
                        ></video>
                      </div>
                      <div className="video-details">
                        <h1>{lecture.title}</h1>
                        <h3>{lecture.description}</h3>
                      </div>
                    </>
                  ) : (
                    <h1 className="lecture">Please Select a Lecture</h1>
                  )}
                </>
              )}
            </div>
            <div className="right">
              {user && user.role === "admin" && (
                <button className="common-btn" onClick={() => setShow(!show)}>
                  {show ? "Close" : "Add Lecture +"}
                </button>
              )}

              {show && (
                <div className="lecture-form">
                  <h2>Add Lecture</h2>
                  <form onSubmit={submitHandler}>
                    <label htmlFor="text">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />

                    <label htmlFor="text">Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />

                    <input
                      type="file"
                      placeholder="choose video"
                      onChange={changeVideoHandler}
                      required
                    />
                    <div className="video-preview">
                      {videoPrev && (
                        <video
                          className="video-container"
                          src={videoPrev}
                          alt=""
                          width={300}
                          controls
                        ></video>
                      )}
                    </div>
                    <button
                      disabled={btnLoading}
                      type="submit"
                      className="common-btn"
                    >
                      {btnLoading ? "Please Wait..." : "Add"}
                    </button>
                  </form>
                </div>
              )}

              {lectures && lectures.length > 0 ? (
                lectures.map((e, i) => (
                  <div key={i}>
                    <div
                      onClick={() =>
                        isLectureAccessible(i) && fetchLecture(e._id)
                      }
                      className={`lecture-number ${
                        lecture._id === e._id && "active"
                      } ${!isLectureAccessible(i) && "locked"}`}
                    >
                      {i + 1}. {e.title}{" "}
                      {progress[0] &&
                        progress[0].completedLectures.includes(e._id) && (
                          <span
                            style={{
                              background: "red",
                              padding: "2px",
                              borderRadius: "6px",
                              color: "greenyellow",
                            }}
                          >
                            <TiTick />
                          </span>
                        )}
                      {!isLectureAccessible(i) ? (
                        <FaLock
                          style={{ marginLeft: "10px", color: "red" }}
                        />
                      ) : (
                        <FaUnlock
                          style={{ marginLeft: "10px", color: "green" }}
                        />
                      )}
                    </div>
                    {user && user.role === "admin" && (
                      <button
                        className="common-btn"
                        style={{
                          background: "red",
                          width: "100%",
                          color: "white",
                          padding: "12px",
                          fontsize: "16px",
                          border: "none",
                          borderradius: "5px",
                          cursor: "pointer",
                          margintop: "10px",
                        }}
                        onClick={() => deleteHandler(e._id)}
                      >
                        Delete {e.title}
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p>No Lectures Yet!</p>
              )}
              {(completed === 100 ||
                user.role === "admin" ||
                user.role === "superadmin") && (
                <button
                  className="common-btn"
                  onClick={() => navigate(`/quiz/${params.id}`)}
                  disabled={
                    quizCompleted &&
                    (user.role === "user" || user.role === "lect")
                  }
                >
                  Take Quiz
                  {quizCompleted && (
                    <span
                      style={{
                        background: "red",
                        padding: "2px",
                        borderRadius: "6px",
                        color: "greenyellow",
                        marginLeft: "10px",
                      }}
                    >
                      <TiTick />
                    </span>
                  )}
                </button>
              )}
              {(quizCompleted ||
                user.role === "admin" ||
                user.role === "superadmin") && (
                <>
                  {user.role === "user" || user.role === "lect" ? (
                    <>
                      <button
                        className="common-btn"
                        onClick={() =>
                          !feedbackSubmitted &&
                          setShowFeedbackForm(!showFeedbackForm)
                        }
                        disabled={feedbackSubmitted}
                      >
                        Give Feedback{" "}
                        {feedbackSubmitted && (
                          <span
                            style={{
                              background: "red",
                              padding: "2px",
                              borderRadius: "6px",
                              color: "greenyellow",
                              marginLeft: "10px",
                            }}
                          >
                            <TiTick />
                          </span>
                        )}
                      </button>
                      {feedbackSubmitted && (
                        <button
                          className="common-btn"
                          onClick={() =>
                            navigate(`/certificate/${params.id}`)
                          }
                        >
                          View Certificate
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        className="common-btn"
                        onClick={() => {
                          if (viewingFeedback) {
                            setViewingFeedback(false);
                          } else {
                            fetchFeedback();
                          }
                        }}
                      >
                        {viewingFeedback ? "Close Feedback" : "View Feedback"}
                      </button>
                      <button
                        className="common-btn"
                        onClick={() =>
                          navigate(`/certificate/${params.id}`)
                        }
                      >
                        View Certificate
                      </button>
                    </>
                  )}
                  {showFeedbackForm && (
                    <div className="feedback-form">
                      <h2>Feedback</h2>
                      <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            style={{
                              cursor: "pointer",
                              color: star <= rating ? "gold" : "gray",
                              fontSize: "24px",
                            }}
                            onClick={() => setRating(star)}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Enter your feedback..."
                        rows="4"
                        cols="50"
                      />
                      <button
                        className="common-btn"
                        onClick={handleFeedbackSubmit}
                      >
                        Submit Feedback
                      </button>
                    </div>
                  )}
                  {viewingFeedback && (
                    <div className="feedback-view">
                      <h2>Feedback from Users</h2>
                      {feedbackData.length > 0 ? (
                        feedbackData.map((feedback) => (
                          <div
                            key={feedback._id}
                            className="feedback-item"
                          >
                            <p>
                              <strong>{feedback.user.name}</strong> (
                              {feedback.user.email})
                            </p>
                            <p>Rating: {feedback.rating} stars</p>
                            <p>Comment: {feedback.comment}</p>
                          </div>
                        ))
                      ) : (
                        <p>No feedback available yet.</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Lecture;