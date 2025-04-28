import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
  },
  counselorId: {
    type: String,
    required: true,
  },
  scheduledDateTime: {
    type: Date,
    required: true,
  },
  scheduledDurationMinutes: {
    type: Number,
    enum: [30, 45, 60],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending",
  },
  is_in_call: {
    type: Boolean,
    default: false,
  },
  room_id: {
    type: String,
    default: null,
  },
}, { timestamps: true }); // will automatically add createdAt and updatedAt

export const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);
