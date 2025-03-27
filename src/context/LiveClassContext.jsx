import axios from "axios"
import { createContext, useContext, useEffect, useState } from "react"
import { server } from "../main"

const LiveClassContext = createContext()

export const LiveClassContextProvider = ({ children }) => {
  const [liveClasses, setLiveClasses] = useState([])
  const [liveClass, setLiveClass] = useState(null)
  const [myLiveClasses, setMyLiveClasses] = useState([])

  async function fetchLiveClasses() {
    try {
      const { data } = await axios.get(`${server}/api/live-classes`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
  
      setLiveClasses(data.liveClasses); // Update the state with fetched data
    } catch (error) {
      console.log(error);
    }
  }
  
  async function fetchLiveClass(id) {
    try {
      const { data } = await axios.get(`${server}/api/live-class/${id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      })

      setLiveClass(data.liveClass)
    } catch (error) {
      console.log(error)
    }
  }

  async function fetchMyLiveClasses() {
    try {
      const { data } = await axios.get(`${server}/api/my-live-classes`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      })

      setMyLiveClasses(data.liveClasses)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchLiveClasses()
    fetchMyLiveClasses()
  }, [])

  return (
    <LiveClassContext.Provider
      value={{
        liveClasses,
        fetchLiveClasses,
        fetchLiveClass,
        liveClass,
        myLiveClasses,
        fetchMyLiveClasses,
      }}
    >
      {children}
    </LiveClassContext.Provider>
  )
}

export const LiveClassData = () => useContext(LiveClassContext);
