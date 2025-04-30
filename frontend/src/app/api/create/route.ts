import { connectDB } from "@/lib/dbConnect";
import { Appointment } from "@/models/Appointment";

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  const { studentId, counselorId, scheduledDateTime, scheduledDurationMinutes } = body;

  const start = new Date(scheduledDateTime);
  const end = new Date(start.getTime() + scheduledDurationMinutes * 60000); // convert minutes to milliseconds

  // Check for overlapping appointments for either the student or the counselor
  const overlappingAppointment = await Appointment.findOne({
    $or: [
      { studentId },
      { counselorId }
    ],
    $and: [
      { scheduledDateTime: { $lt: end } }, // existing appointment starts before this ends
      { 
        $expr: {
          $lt: [
            "$scheduledDateTime", // existing start
            end
          ]
        }
      },
      {
        $expr: {
          $gt: [
            { $add: ["$scheduledDateTime", { $multiply: ["$scheduledDurationMinutes", 60000] }] },
            start
          ]
        }
      }
    ]
  });

  if (overlappingAppointment) {
    return Response.json(
      { success: false, message: "An overlapping appointment already exists for the student or counselor." },
      { status: 409 }
    );
  }

  const appointment = await Appointment.create({
    studentId,
    counselorId,
    scheduledDateTime: start,
    scheduledDurationMinutes,
  });

  return Response.json({ success: true, appointment });
}
