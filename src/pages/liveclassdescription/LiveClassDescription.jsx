"use client"

import { useEffect, useState } from "react"
import "./liveclassdescription.css"
import { useNavigate, useParams } from "react-router-dom"
import { LiveClassData } from "../../context/LiveClassContext"
import { server } from "../../main"
import axios from "axios"
import toast from "react-hot-toast"
import { UserData } from "../../context/UserContext"
import Loading from "../../components/loading/Loading"

const LiveClassDescription = ({ user }) => {
  const params = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { fetchUser } = UserData()
  const { fetchLiveClass, liveClass, fetchLiveClasses } = LiveClassData()
  const [remainingTime, setRemainingTime] = useState("")
  const [isAvailable, setIsAvailable] = useState(true)

  useEffect(() => {
    fetchLiveClass(params.id)
  }, [params.id])

  // Check if the class is available (not purchased by someone else)
  useEffect(() => {
    if (liveClass) {
      const checkAvailability = async () => {
        try {
          const { data } = await axios.get(`${server}/api/live-class/check-availability/${params.id}`, {
            headers: {
              token: localStorage.getItem("token"),
            },
          })
          setIsAvailable(data.isAvailable)
        } catch (error) {
          console.error("Error checking availability:", error)
        }
      }

      checkAvailability()
    }
  }, [liveClass, params.id])

  // Calculate and update remaining time
  useEffect(() => {
    if (liveClass) {
      const interval = setInterval(() => {
        const now = new Date().getTime()
        const endTime = new Date(liveClass.endDateTime).getTime()
        const timeDifference = endTime - now

        if (timeDifference <= 0) {
          setRemainingTime("Expired")
          clearInterval(interval)
          return
        }

        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000)

        setRemainingTime(`${days}d ${hours}h ${minutes}m ${seconds}s`)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [liveClass])

  const checkoutHandler = async () => {
    if (!isAvailable) {
      toast.error("This live class is no longer available for purchase.")
      return
    }

    const token = localStorage.getItem("token")
    setLoading(true)

    try {
      const { data } = await axios.post(
        `${server}/api/live-class/checkout/${params.id}`,
        {},
        {
          headers: {
            token,
          },
        },
      )

      const options = {
        key: "rzp_test_4GsmPA7FycdMnH", // Replace with your Razorpay test key
        amount: data.order.amount,
        currency: "INR",
        name: "E-Learning Platform",
        description: "Purchase Live Class",
        order_id: data.order.id,
        handler: async (response) => {
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response

          try {
            const { data: verificationData } = await axios.post(
              `${server}/api/live-class/verification/${params.id}`,
              {
                razorpay_payment_id,
                razorpay_order_id,
                razorpay_signature,
              },
              {
                headers: {
                  token,
                },
              },
            )

            await fetchUser()
            await fetchLiveClasses()
            toast.success(verificationData.message)
            setLoading(false)
            navigate(`/payment-success/${razorpay_payment_id}`)
          } catch (error) {
            toast.error(error.response.data.message)
            setLoading(false)
          }
        },
        theme: {
          color: "#8a4baf",
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      toast.error(error.response.data.message)
      setLoading(false)
    }
  }

  const handleJoinClass = (id) => {
    navigate(`/zoom-meeting/${id}`)
  }

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          {liveClass && (
            <div className="live-class-description">
              <div className="live-class-header">
                <img src={`${server}/${liveClass.image}`} alt="" className="live-class-image" />
                <div className="live-class-info">
                  <h2>{liveClass.title}</h2>
                  <p>Type: {liveClass.type}</p>
                  <p>Start: {new Date(liveClass.startDateTime).toLocaleString("en-GB")}</p>
                  <p>End: {new Date(liveClass.endDateTime).toLocaleString("en-GB")}</p>
                  <p>Available Period: {remainingTime}</p>
                </div>
              </div>

              <p>{liveClass.description}</p>

              <p>Let's get started with this live class at ₹{liveClass.price}</p>

              {user && user.subscription.includes(liveClass._id) ? (
                <button onClick={() => handleJoinClass(liveClass._id)} className="common-btn">
                  Join Class
                </button>
              ) : !isAvailable ? (
                <button
                  className="common-btn"
                  disabled={true}
                  style={{ backgroundColor: "#ccc", cursor: "not-allowed" }}
                >
                  Not Available
                </button>
              ) : (
                <button onClick={checkoutHandler} className="common-btn">
                  Buy Now
                </button>
              )}
            </div>
          )}
        </>
      )}
    </>
  )
}

export default LiveClassDescription

