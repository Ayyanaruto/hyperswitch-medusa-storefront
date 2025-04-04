import { HttpTypes } from "@medusajs/types"
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { Button, useToast } from "@medusajs/ui"
import { ErrorPage } from "app/[countryCode]/(main)/payment/page"
import { placeOrder } from "@lib/data/cart"
import { redirect, usePathname, useRouter } from "next/navigation"


interface ButtonProps {
    cart: Omit<HttpTypes.StoreCart, "refundable_amount" | "refunded_total">
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

        return cart?.payment_collection?.payment_sessions?.[0]?.data?.client_secret ?? null
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

            const appearance = {
                theme: cart?.payment_collection?.payment_sessions?.[0]?.data?.theme ?? "light",
            }
            const styles =
                typeof cart?.payment_collection?.payment_sessions?.[0]?.data?.styles === "object"
                    ? cart?.payment_collection?.payment_sessions?.[0]?.data?.styles
                    : "{}"

            const unifiedCheckoutOptions = {
                ...(styles
                    ? { ...(styles as any) }
                    : {
                        layout: "tabs",
                    }),
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
                return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment`,
            },
            redirect: "if_required", // if you wish to redirect always, otherwise it is defaulted to "if_required",
        })
        // if(status === "succeeded") {x

        if (status === "succeeded" || status === "requires_capture") {
            checkoutComponent.current.unmount()
            await placeOrder()
            setIsLoading(false)
            toast.toast({ variant: "success", title: `Payment is completed` })
        } else {
            setIsLoading(false)
            // Show toast for any failure case
            toast.toast({ 
                variant: "error", 
                title: error ? `Payment failed: ${error.message || ''}` : 'Payment could not be completed' 
            })
            
            if (error) {
                console.error(error)
                // Delay redirect to allow toast to be visible
                setTimeout(() => {
                    router.replace(`${process.env.NEXT_PUBLIC_BASE_URL}/payment-error`)
                }, 1500)
            } else {
                // Handle case where status is not successful but no error exists
                console.error(`Payment failed with status: ${status}`)
                setTimeout(() => {
                    router.replace(`${process.env.NEXT_PUBLIC_BASE_URL}/payment-error`)
                }, 1500)
            }
        }
    }, [cart.metadata?.provider_id, hyper, pathname, router, widgets])

    return (
        <form id="payment-form">
            <div id="unified-checkout"></div>
            <Button
                onClick={handlePayment}
                size="large"
                style={{ marginTop: "10px" }}
                disabled={notReady}
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