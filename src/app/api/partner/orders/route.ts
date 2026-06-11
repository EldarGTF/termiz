import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== "RESTAURANT_OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
  });

  if (!restaurant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const orders = await prisma.order.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { createdAt: "desc" },
    include: { items: true, user: true, pickupLocation: true },
  });

  return NextResponse.json(orders);
}
