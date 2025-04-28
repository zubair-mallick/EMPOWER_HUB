import { connectDB } from "@/lib/dbConnect";
import { Appointment } from "@/models/Appointment";

type Params = {
  params: {
    userId: string;
  };
};

export async function GET(req: Request, { params }: Params) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  await connectDB();

  const { userId } = params;

  const filter: any = { studentId: userId };
  if (status) filter.status = status;
  

  const appointments = await Appointment.find(filter).sort({ scheduledDateTime: 1 });
  return Response.json({ success: true, appointments });
}
