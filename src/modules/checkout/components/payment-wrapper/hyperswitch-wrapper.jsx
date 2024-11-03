"use client"
import React, { useState, useEffect } from "react"
import { loadHyper } from "@juspay-tech/hyper-js"
import { HyperElements } from "@juspay-tech/react-hyper-js"

function HyperWrapper({ children, paymentSession, hyperKey }) {
  const [options, setOptions] = useState({})
  
  const hyperPromise = loadHyper(hyperKey, {
    customBackendUrl: "https://sandbox.hyperswitch.io",
  })

  useEffect(() => {
    if (paymentSession?.data?.client_secret) {
      setOptions({
        clientSecret: paymentSession.data.client_secret,
        appearance: {
          theme: "default",
        },
      })
    }
  }, [paymentSession])

  return options.clientSecret ? (
    <HyperElements options={options} hyper={hyperPromise}>
      {children}
    </HyperElements>
  ) : null
}

export default HyperWrapper