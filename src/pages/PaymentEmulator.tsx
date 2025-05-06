import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast"; // Adjust this import path if needed

const PaymentEmulator: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const state = location.state as {
    priceToPay: number;
    fieldName: string;
    location: string;
    startDate: string | Date;
    endDate: string | Date;
    hours: number;
  } | undefined;

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-4">
            Acces interzis. Te rugăm să alegi un teren înainte de a plăti.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            Înapoi la pagina principală
          </button>
        </div>
      </div>
    );
  }

  const { priceToPay, fieldName, location: fieldLocation, startDate, endDate, hours } = state;

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const handlePayment = () => {
    if (!cardName || !cardNumber || !expiry || !cvc) {
      toast({
        title: "Date incomplete",
        description: "Te rugăm să completezi toate câmpurile pentru a continua.",
        variant: "destructive",
      });
      return;
    }

    // Validate card number
    const numericCard = cardNumber.replace(/\s+/g, "");
    if (
      numericCard.length !== 16 ||
      !/^\d+$/.test(numericCard) ||
      numericCard.slice(0, 2) !== "90" ||
      numericCard.slice(4, 6) !== "24"
    ) {
      toast({
        title: "Card invalid",
        description: "Numărul cardului este incorect sau nesuportat.",
        variant: "destructive",
      });
      return;
    }

    // Validate expiry
    const [monthStr, yearStr] = expiry.split("/");
    const now = new Date();
    const cardDate = new Date(Number("20" + yearStr), Number(monthStr) - 1);

    if (!monthStr || !yearStr || isNaN(cardDate.getTime()) || cardDate < now) {
      toast({
        title: "Card expirat",
        description: "Data de expirare a cardului este invalidă sau a trecut.",
        variant: "destructive",
      });
      return;
    }

    // Simulate success
    setTimeout(() => {
      toast({
        title: "Plată reușită!",
        description: "Rezervarea a fost confirmată. Vei primi un email în curând.",
        variant: "default",
      });
      navigate("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Plată Emulată</h2>

        <div className="mb-4 text-sm">
          <p>
            <strong>Teren:</strong> {fieldName}
          </p>
          <p>
            <strong>Locație:</strong> {fieldLocation}
          </p>
          <p>
            <strong>Durată:</strong> {hours} ore (
            {new Date(startDate).toLocaleDateString()} → {new Date(endDate).toLocaleDateString()})
          </p>
          <p className="font-bold">
            <strong>Total:</strong> €{priceToPay}
          </p>
        </div>

        {/* Card Owner */}
        <label className="block mb-2 font-medium">Nume pe card</label>
        <input
          type="text"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder="John Doe"
          className="w-full p-2 border rounded mb-4"
        />

        {/* Card Number */}
        <label className="block mb-2 font-medium">Număr card</label>
        <input
          type="text"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          placeholder="1234 1234 1234 1234"
          className="w-full p-2 border rounded mb-4"
        />

        <div className="flex gap-4 mb-4">
          {/* Expiry */}
          <div className="flex-1">
            <label className="block mb-2 font-medium">Expirare</label>
            <input
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="MM/YY"
              className="w-full p-2 border rounded"
            />
          </div>

          {/* CVC */}
          <div className="flex-1">
            <label className="block mb-2 font-medium">CVC</label>
            <input
              type="text"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              placeholder="123"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <button
          onClick={handlePayment}
          className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-500 transition"
        >
          Plătește €{priceToPay}
        </button>
      </div>
    </div>
  );

}

export default PaymentEmulator;