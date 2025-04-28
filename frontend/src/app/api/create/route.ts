import { connectDB } from "@/lib/dbConnect";
import { Appointment } from "@/models/Appointment";

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  const { studentId, counselorId, scheduledDateTime, scheduledDurationMinutes } = body;

  const appointment = await Appointment.create({
    studentId,
    counselorId,
    scheduledDateTime,
    scheduledDurationMinutes, // <-- add this
  });

  return Response.json({ success: true, appointment });
}
