import { useEffect, useState } from "react"
import "./paymentsuccess.css"
import { Link, useParams } from "react-router-dom"
import axios from "axios"
import { server } from "../../main"

const PaymentSuccess = ({ user }) => {
  const params = useParams()
  const [paymentType, setPaymentType] = useState("")
  const [itemName, setItemName] = useState("")

  useEffect(() => {
    // Determine if this was a course or live class payment
    const checkPaymentType = async () => {
      try {
        const { data } = await axios.get(`${server}/api/payment/${params.id}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        })

        setPaymentType(data.paymentType)
        setItemName(data.itemName)
      } catch (error) {
        console.log(error)
        // Default to course if we can't determine
        setPaymentType("course")
      }
    }

    checkPaymentType()
  }, [params.id])

  return (
    <div className="payment-success-page">
      {user && (
        <div className="success-message">
          <h2>Payment successful</h2>
          <p>Your {paymentType} subscription has been activated</p>
          {itemName && <p>You have successfully purchased: {itemName}</p>}
          <p>Reference no - {params.id}</p>
          <Link to={`/${user._id}/dashboard`} className="common-btn">
            Go to Dashboard
          </Link>
        </div>
      )}
    </div>
  )
}

export default PaymentSuccess;

