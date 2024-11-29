"use client"
import { placeOrder } from "@lib/data/cart"
import { Toaster, useToast } from "@medusajs/ui"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"

export const ErrorPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Payment Failed</h1>
      <p className="text-gray-600 mb-6">There was an error processing your payment.</p>
      <button
        onClick={() => window.location.href = '/'}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Return to Home
      </button>
    </div>
  )
}

const PaymentPage = () => {
  const toast = useToast()
  const [error, setError] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get('status')
    console.log(status, "status")

    const handlePayment = async () => {
      if (status === 'succeeded'|| status === 'requires_capture') { 
        await placeOrder()
        toast.toast({ variant: "success", title: `Payment is completed` })
      } else if (status === 'failed') {
        setError(true)
      }
    }

    handlePayment()
  }, [toast])

  if (error) {
  redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/payment-error`)
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <Toaster />
    </div>
  )
}
export default PaymentPage
