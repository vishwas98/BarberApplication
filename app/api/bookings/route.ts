import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const barberId = Number(url.searchParams.get("barberId"));
  const date = url.searchParams.get("date"); // YYYY-MM-DD
  if (!barberId || !date) {
    return NextResponse.json([], { status: 200 });
  }
  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const bookings = await prisma.booking.findMany({
    where: {
      barberId,
      start: { gte: start, lt: end }
    },
    orderBy: { start: "asc" }
  });
  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { barberId, serviceId, start, customerName, customerEmail, customerPhone } = body;

  if (!barberId || !serviceId || !start || !customerName || !customerEmail) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const service = await prisma.service.findUnique({ where: { id: Number(serviceId) } });
  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

  const startDt = new Date(start);
  const endDt = new Date(startDt.getTime() + service.duration * 60 * 1000);

  // conflict check: any booking for same barber where times overlap
  const conflicts = await prisma.booking.findFirst({
    where: {
      barberId: Number(barberId),
      AND: [
        { start: { lt: endDt } },
        { end: { gt: startDt } }
      ]
    }
  });

  if (conflicts) {
    return NextResponse.json({ error: "Time conflict" }, { status: 409 });
  }

  const booking = await prisma.booking.create({
    data: {
      barberId: Number(barberId),
      serviceId: Number(serviceId),
      customerName,
      customerEmail,
      customerPhone: customerPhone ?? "",
      start: startDt,
      end: endDt
    }
  });

  return NextResponse.json(booking, { status: 201 });
}