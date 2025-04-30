import { connectDB } from "@/lib/dbConnect";
import { Appointment } from "@/models/Appointment";

type Params = {
  params: {
    userId: string;
  };
};

export async function GET(req: Request, { params }: Params) {
  await connectDB();

  const { userId } = params;

  const inCallAppointment = await Appointment.findOne({
    is_in_call: true,
    $or: [
      { studentId: userId },
      { counselorId: userId }
    ]
  });

  if (!inCallAppointment) {
    return Response.json({ success: true, isInCall: false });
  }

  return Response.json({
    success: true,
    isInCall: true,
    appointment: {
      id: inCallAppointment._id,
      studentId: inCallAppointment.studentId,
      counselorId: inCallAppointment.counselorId,
      room_id: inCallAppointment.room_id,
      scheduledDateTime: inCallAppointment.scheduledDateTime,
    }
  });
}
