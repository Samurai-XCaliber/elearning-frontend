import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import "./certificate.css";
import { UserData } from "../../context/UserContext";
import { CourseData } from "../../context/CourseContext";
import Loading from "../../components/loading/Loading";
import html2pdf from "html2pdf.js";

const Certificate = () => {
  const { user } = UserData();
  const { fetchCourse, course } = CourseData();
  const params = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse(params.id);
    if (user.role !== "admin" && user.role !== "superadmin") {
      fetchResult();
    } else {
      setLoading(false);
    }
  }, [params.id]);

  const fetchResult = async () => {
    try {
      const { data } = await axios.get(`${server}/api/quiz/${params.id}/course-result`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setResult(data.result);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const getRankText = (score) => {
    if (score === 5) return "1st rank holder";
    if (score === 4) return "2nd rank holder";
    if (score === 3) return "3rd rank holder";    
    if (score === 2) return "Participation certificate";    
    if (score === 1) return "Participation certificate";    
    if (score === 0) return "Participation certificate";    
    return "";
  };

  const downloadCertificate = () => {
    const element = document.getElementById("certificate");
    const opt = {
      margin: 1,
      filename: `certificate_${user.name}_${course.title}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf().from(element).set(opt).save();
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="certificate-page">
          <div id="certificate" className="certificate">
            {/* ISO Certificate and E-Learning Logos */}
            <div className="certificate-logos">
              <img src="../../../public/iso-logo.png" alt="ISO Certified" className="iso-logo" />
              <img src="../../../public/E learning.png" alt="E-Learning Logo" className="elearning-logo" />
            </div>

            <h1>E-LEARNING</h1>
            <h2>Course Completion Certificate</h2>
            <p>This certificate is provided to</p>
            <h2>{user.name}</h2>
            <p>for successfully completing the course</p>
            <h3>{course.title}</h3>
            {(result || user.role === "admin" || user.role === "superadmin") && (
              <>
                <p>Duration: {course.duration} weeks</p> {/* Display duration as weeks */}
                {result && result.score >= 0 && <p>{getRankText(result.score)}</p>}
              </>
            )}
            <p>Certificate Provider: {course.createdBy}</p>
            <p>Date: {new Date().toLocaleDateString("en-GB")}</p> {/* Format date as date/month/year */}
          </div>
          {(result || user.role === "admin" || user.role === "superadmin") && (
            <button onClick={downloadCertificate} className="common-bt">
              Download Certificate
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default Certificate;