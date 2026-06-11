import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const order = await prisma.order.findUnique({ where: { id } });

  if (!order) {
    return new Response("Not found", { status: 404 });
  }

  const encoder = new TextEncoder();
  let interval: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    start(controller) {
      const send = async () => {
        const current = await prisma.order.findUnique({ where: { id } });
        if (current) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ status: current.status })}\n\n`),
          );
        }
      };

      send();
      interval = setInterval(send, 3000);
    },
    cancel() {
      clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
