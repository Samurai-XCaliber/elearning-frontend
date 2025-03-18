import "./common.css"
import { Link } from "react-router-dom"
import { AiFillHome, AiOutlineLogout } from "react-icons/ai"
import { FaBook, FaUserAlt, FaVideo, FaChalkboardTeacher } from "react-icons/fa"
import { UserData } from "../../context/UserContext"

const Sidebar = () => {
  const { user } = UserData()
  return (
    <div className="sidebar">
      <ul>
        {/* Show Home link for both admin and lecturer */}
        <li>
          <Link to={user && user.role === "lect" ? "/live-classes" : "/admin/dashboard"}>
            <div className="icon">
              <AiFillHome />
            </div>
            <span>Home</span>
          </Link>
        </li>

        {/* Show admin-specific links only for admin */}
        {user && (user.role === "admin" || user.role === "superadmin") && (
          <>
            <li>
              <Link to={"/admin/course"}>
                <div className="icon">
                  <FaBook />
                </div>
                <span>Courses</span>
              </Link>
            </li>

            <li>
              <Link to={"/admin/live-class"}>
                <div className="icon">
                  <FaVideo />
                </div>
                <span>Live Classes</span>
              </Link>
            </li>
          </>
        )}

        {/* Show lecturer-specific links only for lecturer */}
        {user && user.role === "lect" && (
          <li>
            <Link to={"/lecture-dashboard"}>
              <div className="icon">
                <FaChalkboardTeacher />
              </div>
              <span>My Classes</span>
            </Link>
          </li>
        )}

        {/* Show Users link only for superadmin */}
        {user && user.mainrole === "superadmin" && (
          <li>
            <Link to={"/admin/users"}>
              <div className="icon">
                <FaUserAlt />
              </div>
              <span>Users</span>
            </Link>
          </li>
        )}

        <li>
          <Link to={"/account"}>
            <div className="icon">
              <AiOutlineLogout />
            </div>
            <span>Logout</span>
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default Sidebar;

