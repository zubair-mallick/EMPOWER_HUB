import { connectDB } from '@/lib/dbConnect';
import { Appointment } from '@/models/Appointment';
import { NextRequest, NextResponse } from 'next/server';

import { v4 as uuidv4 } from 'uuid';

export async function GET(
  req: NextRequest,
  { params }: { params: { appointmentId: string } }
) {
  await connectDB(); // Ensure DB is connected
  const { appointmentId } = params;

  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
    }

    if (appointment.status !== 'confirmed') {
      return NextResponse.json(
        { success: false, message: 'Appointment is not confirmed' },
        { status: 400 }
      );
    }

    const now = new Date();
    const startTime = new Date(appointment.scheduledDateTime);
    const endTime = new Date(
      startTime.getTime() + appointment.scheduledDurationMinutes * 60000
    );

    if (now < startTime) {
      return NextResponse.json(
        { success: false, message: 'Call cannot start before the scheduled time' },
        { status: 403 }
      );
    }

    if (now > endTime) {
      return NextResponse.json(
        { success: false, message: 'Call time has expired' },
        { status: 403 }
      );
    }

    if (!appointment.room_id) {
      appointment.room_id = uuidv4(); // or any room ID format you prefer
    }

    appointment.is_in_call = true;
    await appointment.save();

    return NextResponse.json({
      success: true,
      message: 'Call started',
      room_id: appointment.room_id,
      appointment,
    });
  } catch (error) {
    console.error('[JOIN_CALL_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
