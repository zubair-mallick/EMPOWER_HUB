import { connectDB } from "@/lib/dbConnect";
import { Appointment } from "@/models/Appointment";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const body = await req.json();

  const updatedAppointment = await Appointment.findByIdAndUpdate(params.id, body, { new: true });

  return Response.json({ success: true, updatedAppointment });
}
