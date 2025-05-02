import { connectDB } from "@/lib/dbConnect";
import { Appointment } from "@/models/Appointment";
import { Error } from "mongoose";

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
  let appointments =null
  
try{
  
   appointments = await Appointment.find(filter).sort({ scheduledDateTime: 1 });
}
catch(e:unknown ){
console.log(e)
return Response.json({ success: false, appointments ,message:`${e.message}` });
}
  return Response.json({ success: true, appointments });
}
