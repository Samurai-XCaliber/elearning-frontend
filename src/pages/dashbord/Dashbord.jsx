import { useState } from "react"
import "./dashbord.css"
import { CourseData } from "../../context/CourseContext"
import { LiveClassData } from "../../context/LiveClassContext"
import CourseCard from "../../components/coursecard/CourseCard"
import LiveClassCard from "../../components/liveclasscard/LiveClassCard"

const Dashbord = () => {
  const { mycourse } = CourseData()
  const { liveClasses } = LiveClassData()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("courses")

  // Filter purchased live classes
  const myLiveClasses = liveClasses.filter((liveClass) => liveClass.purchased)

  // Filter based on search query
  const filteredCourses = mycourse.filter((course) => course.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const filteredLiveClasses = myLiveClasses.filter((liveClass) =>
    liveClass.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <>
      <div>
        <h1>Dashboard</h1>
        <div className="search-container">
          <input
            className="search-input"
            type="text"
            placeholder="Search your enrolled courses and live classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="dashboard-tabs">
          <button
            className={`tab-button ${activeTab === "courses" ? "active" : ""}`}
            onClick={() => setActiveTab("courses")}
          >
            Courses
          </button>
          <button
            className={`tab-button ${activeTab === "liveClasses" ? "active" : ""}`}
            onClick={() => setActiveTab("liveClasses")}
          >
            Live Classes
          </button>
        </div>
      </div>

      {activeTab === "courses" && (
        <div className="student-dashboard">
          <h2>All Enrolled Courses</h2>
          <div className="dashboard-content">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => <CourseCard key={course._id} course={course} />)
            ) : searchQuery ? (
              <p>No courses found matching "{searchQuery}"</p>
            ) : (
              <p>No courses enrolled yet</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "liveClasses" && (
        <div className="student-dashboard">
          <h2>All Enrolled Live Classes</h2>
          <div className="dashboard-content">
            {filteredLiveClasses.length > 0 ? (
              filteredLiveClasses.map((liveClass) => <LiveClassCard key={liveClass._id} liveClass={liveClass} />)
            ) : searchQuery ? (
              <p>No live classes found matching "{searchQuery}"</p>
            ) : (
              <p>No live classes enrolled yet</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Dashbord;