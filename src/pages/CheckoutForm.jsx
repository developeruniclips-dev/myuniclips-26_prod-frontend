// src/components/CheckoutForm.jsx
import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import { Button, Alert } from "react-bootstrap";

export default function CheckoutForm({ video, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!stripe || !elements) return;

    try {
      const cardElement = elements.getElement(CardElement);

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/purchases/create-payment-intent`,
        { videoId: video.id },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } } // use your auth method
      );

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: { card: cardElement },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
      } else if (paymentIntent.status === "succeeded") {
        onSuccess(video.id);
        setLoading(false);
      }
    } catch (err) {
      setError("Payment failed.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      <CardElement options={{ hidePostalCode: true }} />
      <Button type="submit" variant="success" className="mt-3" disabled={!stripe || loading}>
        {loading ? "Processing..." : `Pay $${video.price}`}
      </Button>
    </form>
  );
}
