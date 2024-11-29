"use client"
import { placeOrder } from "@lib/data/cart"
import { Toaster, useToast } from "@medusajs/ui"
import { Spinner } from "@medusajs/icons"
import { useEffect } from "react"

//when someone redirects to this page, we will place the order
//and show the spinner

 const PaymentPage = () => {
  const toast = useToast()
  useEffect(() => {
    const placeOrderAsync = async () => {
      await placeOrder().then(() => {
        toast.toast({ variant: "success", title: `Payment is completed` })
      })
    }
    placeOrderAsync()
  }, [])

  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner className="w-10 h-10 animate-spin" />
      <Toaster />
    </div>
  )
}
export default PaymentPage
