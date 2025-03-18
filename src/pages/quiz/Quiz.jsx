import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../main";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./Quiz.css"; // Import the CSS file

const Quiz = ({ user }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
  const [randomQuestions, setRandomQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, [params.id]);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft, timerActive]);

  const fetchQuizzes = async () => {
    try {
      const { data } = await axios.get(`${server}/api/quiz/course/${params.id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      console.log("Quizzes data fetched:", data);
      setQuizzes(data.quizzes);
    } catch (error) {
      console.log("Error fetching quizzes data:", error);
    }
  };

  const fetchQuiz = async (quizId) => {
    try {
      const { data } = await axios.get(`${server}/api/quiz/${quizId}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      console.log("Quiz data fetched:", data);
      setQuiz(data.quiz);
      if (data.quiz.questions.length > 5) {
        const shuffledQuestions = data.quiz.questions.sort(() => 0.5 - Math.random());
        setRandomQuestions(shuffledQuestions.slice(0, 5));
      } else {
        setRandomQuestions(data.quiz.questions);
      }
      fetchResult(quizId); // Fetch the result if it exists
      setTimerActive(true); // Start the timer
    } catch (error) {
      console.log("Error fetching quiz data:", error);
    }
  };

  const fetchResult = async (quizId) => {
    try {
      const { data } = await axios.get(`${server}/api/quiz/${quizId}/result`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      console.log("Result data fetched:", data);
      setResult(data.result);
      setTimerActive(false); // Stop the timer if result exists
    } catch (error) {
      console.log("Error fetching result data:", error);
    }
  };

  const handleAnswerChange = (questionId, optionIndex) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const handleSubmit = async () => {
    if (window.confirm("Are you sure you want to submit the quiz?")) {
      try {
        const { data } = await axios.post(
          `${server}/api/quiz/${quiz._id}/submit`,
          { answers, seenQuestions: randomQuestions }, // Send seenQuestions to the backend
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );
        setResult(data.result);
        toast.success("Quiz submitted successfully!");

        // Add progress for the quiz
        await axios.post(
          `${server}/api/user/progress?course=${params.id}&lectureId=${quiz._id}`,
          {},
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );

        // Mark quiz as completed
        await axios.post(
          `${server}/api/user/quiz-progress?course=${params.id}&quizId=${quiz._id}`,
          {},
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );

        setTimerActive(false); // Stop the timer
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  const handleQuizFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${server}/api/quiz`,
        { title, description, questions, courseId: params.id },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      toast.success("Quiz added successfully!");
      setShowQuizForm(false);
      setTitle("");
      setDescription("");
      setQuestions([{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
      fetchQuizzes(); // Re-fetch the quizzes data after adding a new quiz
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (questionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].correctAnswer = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
  };

  const deleteQuiz = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        const { data } = await axios.delete(`${server}/api/quiz/${quizId}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });
        toast.success(data.message);
        fetchQuizzes(); // Re-fetch the quizzes data after deleting a quiz
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  return (
    <div className="quiz-page">
      {quizzes.length > 0 && (
        <div className="quiz-list">
          <h2>Available Quizzes</h2>
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="quiz-item">
              <h3>{quiz.title}</h3>
              <p>{quiz.description}</p>
              <button onClick={() => fetchQuiz(quiz._id)} className="common-btn" disabled={!!result}>
                Take Quiz
              </button>
              {user && (user.role === "admin" || user.role === "superadmin") && (
                <button onClick={() => deleteQuiz(quiz._id)} className="common-btn" style={{ background: "red" }}>
                  Delete Quiz
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {quiz && (
        <>
          <h1>{quiz.title}</h1>
          <p>{quiz.description}</p>
          {timerActive && <p>Time Left: {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? '0' : ''}{timeLeft % 60}</p>}
          {randomQuestions.length > 0 && randomQuestions.map((question, index) => (
            <div key={index} className="quiz-question">
              <h3>{question.question}</h3>
              {question.options.map((option, i) => (
                <div key={i}>
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={i}
                    onChange={() => handleAnswerChange(question._id, i)}
                    disabled={!!result} // Disable radio buttons if the quiz is submitted
                    checked={answers[question._id] === i} // Show the selected option
                  />
                  <label>{option}</label>
                </div>
              ))}
            </div>
          ))}
          {!result && (
            <button onClick={handleSubmit} className="common-btn">
              Submit Quiz
            </button>
          )}
          {result && (
            <div className="quiz-result">
              <h2>{result.pass ? "Pass" : "Fail"}</h2>
              <p>Score: {result.score} / 5</p>
              <h3>Correct Answers:</h3>
              {randomQuestions.map((question, index) => (
                <div key={index}>
                  <p>{question.question}</p>
                  <p>Your Answer: {question.options[answers[question._id]]}</p>
                  <p>Correct Answer: {question.options[question.correctAnswer]}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {user && (user.role === "admin" || user.role === "superadmin") && (
        <>
          <button className="common-btn" onClick={() => setShowQuizForm(!showQuizForm)}>
            {showQuizForm ? "Close" : "Add Quiz +"}
          </button>
          {showQuizForm && (
            <div className="quiz-form">
              <h2>Add Quiz</h2>
              <form onSubmit={handleQuizFormSubmit}>
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <label htmlFor="description">Description</label>
                <input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
                {questions.map((question, qIndex) => (
                  <div key={qIndex} className="quiz-question-form">
                    <label htmlFor={`question-${qIndex}`}>Question {qIndex + 1}</label>
                    <input
                      type="text"
                      id={`question-${qIndex}`}
                      value={question.question}
                      onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                      required
                    />
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex}>
                        <label htmlFor={`option-${qIndex}-${oIndex}`}>Option {oIndex + 1}</label>
                        <input
                          type="text"
                          id={`option-${qIndex}-${oIndex}`}
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          required
                        />
                      </div>
                    ))}
                    <label htmlFor={`correctAnswer-${qIndex}`}>Correct Answer</label>
                    <select
                      id={`correctAnswer-${qIndex}`}
                      value={question.correctAnswer}
                      onChange={(e) => handleCorrectAnswerChange(qIndex, parseInt(e.target.value))}
                      required
                    >
                      {question.options.map((_, oIndex) => (
                        <option key={oIndex} value={oIndex}>
                          Option {oIndex + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <button type="button" onClick={addQuestion} className="common-btn">
                  Add Question
                </button>
                <button type="submit" className="common-btn">
                  Submit Quiz
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Quiz;