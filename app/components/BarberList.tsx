"use client";
import React, { useEffect, useState } from "react";
import BookingForm from "./BookingForm";

type Barber = { id: number; name: string };
type Service = { id: number; name: string; duration: number; price: number };

export default function BarberList() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/barbers").then((r) => r.json()).then(setBarbers);
    fetch("/api/services").then((r) => r.json()).then(setServices);
  }, []);

  return (
    <div>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h2>Barbers</h2>
          {barbers.map((b) => (
            <div key={b.id} style={{ marginBottom: 8 }}>
              <button onClick={() => setSelectedBarber(b.id)}>{b.name}</button>
            </div>
          ))}
        </div>

        <div style={{ flex: 2 }}>
          <h2>Booking</h2>
          {selectedBarber ? (
            <BookingForm barberId={selectedBarber} services={services} />
          ) : (
            <p>Select a barber to book.</p>
          )}
        </div>
      </div>
    </div>
  );
}