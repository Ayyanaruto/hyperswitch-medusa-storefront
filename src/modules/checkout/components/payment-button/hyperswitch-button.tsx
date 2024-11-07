import { Cart } from "@medusajs/medusa"
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { Button, useToast } from "@medusajs/ui"
import {
  // deletePaymentSessionForCart,
  placeOrder,
} from "@modules/checkout/actions"
import { usePathname, useRouter } from "next/navigation"

interface ButtonProps {
  cart: Omit<Cart, "refundable_amount" | "refunded_total">
  notReady: boolean
  "data-testid"?: string
}

export const HyperswitchPaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: ButtonProps) => {
  const [hyper, setHyper] = useState<any>()
  const [widgets, setWidgets] = useState<any>()
  const checkoutComponent = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const router = useRouter()
  const pathname = usePathname()

  const clientSecret = useMemo(() => {
    return cart.payment_session?.data.client_secret as string
  }, [cart])

  useEffect(() => {
    if (!clientSecret) {
      return
    }
    const scriptTag = document.createElement("script")
    scriptTag.setAttribute(
      "src",
      "https://beta.hyperswitch.io/v1/HyperLoader.js"
    )

    const load = async () => {
      // @ts-ignore
      const hyper = Hyper(process.env.NEXT_PUBLIC_HYPERSWITCH_KEY, {
        //You can configure this as an endpoint for all the api calls such as session, payments, confirm call.
      })
      setHyper(hyper)

      const appearance = { theme: cart?.payment_session?.data?.theme }
      const styles = JSON.parse(
        cart?.payment_session?.data?.appearance as string
      )
      const unifiedCheckoutOptions = styles
        ? { ...styles }
        : {
            layout: "tabs",
            wallets: {
              walletReturnUrl: "https://example.com/complete",
            },
          }
      const widgets = hyper.widgets({ appearance, clientSecret })
      setWidgets(widgets)
      
      const unifiedCheckout = widgets.create("payment", unifiedCheckoutOptions)
      checkoutComponent.current = unifiedCheckout
      unifiedCheckout.mount("#unified-checkout")
    }
    scriptTag.onload = () => {
      load()
    }
    document.body.appendChild(scriptTag)
  }, [clientSecret, cart])

  const handlePayment = useCallback(async () => {
    if (!hyper || !widgets) {
      return
    }

    setIsLoading(true)

    const { error, status } = await hyper.confirmPayment({
      widgets,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/complete`,
      },
      redirect: "if_required", // if you wish to redirect always, otherwise it is defaulted to "if_required",
    })
    // if(status === "succeeded") {x
    if (error?.type === "invalid_request") {
      // await deletePaymentSessionForCart(cart.payment_session?.provider_id ?? "")
      router.replace(pathname + "?step=delivery")
    }
    console.log(status, error, "hello")
    if (status === "succeeded") {
      checkoutComponent.current.unmount()
      await placeOrder()
      setIsLoading(false)
      toast.toast({ variant: "success", title: `Payment is completed` })
    } else {
      toast.toast({ variant: "info", title: `Payment Info ${status}` })
      router.replace("/")
    }
  }, [cart.payment_session?.provider_id, hyper, pathname, router, widgets])

  return (
    <form id="payment-form">
      <div id="unified-checkout"></div>
      <Button
        onClick={handlePayment}
        size="large"
        style={{ marginTop: "10px" }}
        // disabled={disabled || notReady}
        isLoading={isLoading}
        type="submit"
        data-testid={dataTestId}
      >
        Place order
      </Button>
      <div id="payment-message" className="hidden"></div>
    </form>
  )
}