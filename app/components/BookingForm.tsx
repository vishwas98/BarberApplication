"use client";
import React, { useEffect, useMemo, useState } from "react";

type Props = {
  barberId: number;
  services: { id: number; name: string; duration: number; price: number }[];
};

type Booking = {
  id: number;
  start: string;
  end: string;
};

const WORK_START = 9; // 09:00
const WORK_END = 17; // 17:00
const SLOT_MINUTES = 30;

function roundToSlot(d: Date) {
  d.setMinutes(Math.floor(d.getMinutes() / SLOT_MINUTES) * SLOT_MINUTES, 0, 0);
  return d;
}

export default function BookingForm({ barberId, services }: Props) {
  const [date, setDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [serviceId, setServiceId] = useState<number | null>(services[0]?.id ?? null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!barberId || !date) return;
    fetch(`/api/bookings?barberId=${barberId}&date=${date}`)
      .then((r) => r.json())
      .then((data) => setBookings(data || []))
      .catch(() => setBookings([]));
  }, [barberId, date]);

  useEffect(() => {
    if (services.length && serviceId === null) setServiceId(services[0].id);
  }, [services, serviceId]);

  const service = services.find((s) => s.id === serviceId) || null;

  const slots = useMemo(() => {
    if (!service) return [];
    const slotsArr: string[] = [];
    const y = date;
    for (let hour = WORK_START; hour < WORK_END; hour++) {
      for (let m = 0; m < 60; m += SLOT_MINUTES) {
        const dt = new Date(`${y}T${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`);
        const end = new Date(dt.getTime() + service.duration * 60 * 1000);
        // Check within working hours
        if (end.getHours() >= WORK_END && end.getMinutes() > 0) continue;
        // check conflicts
        const overlapping = bookings.some((b) => {
          const bs = new Date(b.start);
          const be = new Date(b.end);
          return dt < be && bs < end;
        });
        if (!overlapping) slotsArr.push(dt.toTimeString().slice(0,5));
      }
    }
    return slotsArr;
  }, [bookings, service, date]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    if (!service || !time) {
      setStatus("Select a service and time.");
      return;
    }
    const startISO = new Date(`${date}T${time}:00`).toISOString();
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        barberId,
        serviceId: service.id,
        start: startISO,
        customerName: name,
        customerEmail: email,
        customerPhone: phone
      })
    });

    if (res.status === 201) {
      setStatus("Booked successfully!");
      // refresh bookings to update local availability
      fetch(`/api/bookings?barberId=${barberId}&date=${date}`)
        .then((r) => r.json())
        .then(setBookings);
    } else if (res.status === 409) {
      setStatus("Time conflict — slot taken. Please choose another time.");
    } else {
      const text = await res.text();
      setStatus("Error: " + text);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Date: <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>

      <div>
        <label>
          Service:
          <select value={serviceId ?? ""} onChange={(e) => setServiceId(Number(e.target.value))}>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.duration}m) — ${s.price}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <label>Available times:</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {slots.length ? (
            slots.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setTime(t)}
                style={{
                  padding: "6px 8px",
                  background: t === time ? "#111" : "#eee",
                  color: t === time ? "#fff" : "#000",
                  border: "none",
                  borderRadius: 4,
                }}
              >
                {t}
              </button>
            ))
          ) : (
            <div>No available slots for selected date/service.</div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label>
          Name: <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <br />
        <label>
          Email: <input value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <br />
        <label>
          Phone: <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        <button type="submit">Book {service ? `— ${service.name}` : ""}</button>
      </div>

      {status && <p style={{ marginTop: 8 }}>{status}</p>}
    </form>
  );
}