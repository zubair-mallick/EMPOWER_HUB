import { connectDB } from "@/lib/dbConnect";
import { Appointment } from "@/models/Appointment";
import { Error } from "mongoose";

type Params = {
  params: {
    userId: string;
  };
};

export async function GET(req: Request, { params }: Params) {
 try{
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  console.log("here");
  await connectDB();

  const { userId } = params;

  const filter: any = { studentId: userId };
  if (status) filter.status = status;
  let appointments =null
  
  console.log("before db");
   appointments = await Appointment.find(filter).sort({ scheduledDateTime: 1 });
   console.log("after db");
  return Response.json({ success: true, appointments });
 }
 catch(e){
  return Response.json({ success: false, message:e });
  console.log(e)
 }
}
