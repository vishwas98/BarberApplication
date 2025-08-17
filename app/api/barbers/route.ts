import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  const barbers = await prisma.barber.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(barbers);
}