import React, { useState, useEffect } from "react";
import "./courses.css";
import { CourseData } from "../../context/CourseContext";
import CourseCard from "../../components/coursecard/CourseCard";

const Courses = () => {
  const { courses } = CourseData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);

  // Filter courses based on search query
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const results = courses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCourses(results);
    } else {
      setFilteredCourses(courses);
    }
  }, [searchQuery, courses]);

  return (
    <div>
      <h1>Courses</h1>
      <div className="search-container">
        <input
          className="search-input"
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="courses">
        <h2>Available Courses</h2>
        <div className="course-container">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))
          ) : searchQuery ? (
            <p>No courses found matching "{searchQuery}"</p>
          ) : (
            <p>No Courses Yet!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;