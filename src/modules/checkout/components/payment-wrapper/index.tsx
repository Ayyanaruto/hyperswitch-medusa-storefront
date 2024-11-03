"use client"

import { Cart, PaymentSession } from "@medusajs/medusa"
import { loadStripe } from "@stripe/stripe-js"
import StripeWrapper from "./stripe-wrapper"
import { PayPalScriptProvider } from "@paypal/react-paypal-js"
import HyperSwitchWrapper from "./hyperswitch-wrapper"
import { createContext, useState, useEffect } from "react"

type WrapperProps = {
  cart: Omit<Cart, "refundable_amount" | "refunded_total">
  children: React.ReactNode
}

export const StripeContext = createContext(false)

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_KEY
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

const hyperKey = process.env.NEXT_PUBLIC_HYPERSWITCH_KEY

const Wrapper: React.FC<WrapperProps> = ({ cart, children }) => {
  const paymentSession = cart.payment_session as PaymentSession

  const isStripe = paymentSession?.provider_id?.includes("stripe")

  const [isHyperSwitchLoaded, setIsHyperSwitchLoaded] = useState(false)

  useEffect(() => {
    if (paymentSession?.provider_id === "hyperswitch" && hyperKey) {
      // Simulate loading HyperSwitch elements
      const loadHyperSwitch = async () => {
        // Add your actual loading logic here
        await new Promise((resolve) => setTimeout(resolve, 3000)) // Simulate a delay
        setIsHyperSwitchLoaded(true)
      }
      loadHyperSwitch()
    }
  }, [paymentSession])

  if (isStripe && paymentSession && stripePromise) {
    return (
      <StripeContext.Provider value={true}>
        <StripeWrapper
          paymentSession={paymentSession}
          stripeKey={stripeKey}
          stripePromise={stripePromise}
        >
          {children}
        </StripeWrapper>
      </StripeContext.Provider>
    )
  }

  if (
    paymentSession?.provider_id === "paypal" &&
    paypalClientId !== undefined &&
    cart
  ) {
    return (
      <PayPalScriptProvider
        options={{
          "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
          currency: cart?.region.currency_code.toUpperCase(),
          intent: "authorize",
          components: "buttons",
        }}
      >
        {children}
      </PayPalScriptProvider>
    )
  }

  // if (paymentSession?.provider_id === "hyperswitch") {
  //   return (
  //     <HyperSwitchWrapper paymentSession={paymentSession} hyperKey={hyperKey}>
  //       {children}
  //     </HyperSwitchWrapper>
  //   )
  // }

  return <div>{children}</div>
}

export default Wrapper
