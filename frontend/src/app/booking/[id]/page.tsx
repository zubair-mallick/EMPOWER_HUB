'use client';

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker-dark.css";

interface Counselor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl: string;
  unsafeMetadata: {
    speciality: string;
    field: string;
  };
}

const BookingPage = ({ params }: { params: { id: string } }) => {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState(30);
  const [message, setMessage] = useState("");
  const [counselor, setCounselor] = useState<Counselor | null>(null);
  const [dataSuccess, setDataSuccess] = useState<Boolean>(false);


  useEffect(() => {
    if (isLoaded && user) {
      const role = user?.unsafeMetadata?.role;
      if (role !== "student") {
        router.push("/");
      }
    }
  }, [isLoaded, user]);

  useEffect(() => {
    const fetchCounselors = async () => {
      const res = await fetch('/api/getCouncellors');
      const data = await res.json();
      const found = data.counselors.find((c: Counselor) => c.id === params.id);
      setCounselor(found);
    };

    fetchCounselors();
  }, [params.id]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !user?.id) return;

    // Combine date and time into a single Date object
    const combinedDateTime = new Date(selectedDate);
    combinedDateTime.setHours(selectedTime.getHours());
    combinedDateTime.setMinutes(selectedTime.getMinutes());
    combinedDateTime.setSeconds(0);
    combinedDateTime.setMilliseconds(0);

    const res = await fetch("/api/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: user.id,
        counselorId: params.id,
        scheduledDateTime: combinedDateTime,
        scheduledDurationMinutes: duration,
      }),
    });

    const data = await res.json();
    if (data.success) {
      setDataSuccess(true)
      setMessage("Appointment booked successfully!");
    } else {
      setDataSuccess(false)
      setMessage(data.message || "Failed to book.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-20 p-6">
      {/* Counselor Card */}
      {counselor && (
        <div className="border p-6 rounded-lg shadow-md bg-gray-900 border-gray-700 mb-10 text-white">
          <div className="flex items-center space-x-6">
            <img
              src={counselor.profileImageUrl}
              alt="Counselor"
              className="h-24 w-24 rounded-full border border-gray-600"
            />
            <div>
              <p className="text-xl font-bold">{counselor.firstName} {counselor.lastName}</p>
              <p className="text-gray-300">{counselor.email}</p>
              <p className="text-gray-400">{counselor.unsafeMetadata.speciality}</p>
              <p className="text-gray-500 italic">{counselor.unsafeMetadata.field}</p>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form */}
      <div className="p-6 border rounded-xl shadow-md bg-gray-900 border-gray-700">
        <h2 className="text-2xl font-semibold mb-4 text-center text-white">
          Book Appointment
        </h2>

        {/* <label className="block mb-2 font-medium text-gray-300">Select:</label> */}
        <div className="flex space-x-4 mb-4">
          <div className="w-1/2">
            <label className="block mb-2 font-medium text-gray-300">Date:</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="yyyy-MM-dd"
              minDate={new Date()}
              className="w-full px-3 py-2 border rounded-md text-white border-gray-600 bg-gray-800"
            />
          </div>

          <div className="w-1/2">
            <label className="block mb-2 font-medium text-gray-300">Time:</label>
            <DatePicker
              selected={selectedTime}
              onChange={(time) => setSelectedTime(time)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={30}
              timeCaption="Time"
              dateFormat="h:mm aa"
              className="w-full px-3 py-2 border rounded-md text-white border-gray-600 bg-gray-800"
            />
          </div>
        </div>

        <label className="block mb-2 font-medium text-gray-300">
          Duration (Minutes):
        </label>
        <select
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full px-3 py-2 border rounded-md mb-4 bg-gray-800 text-white border-gray-600"
        >
          <option value={30}>30</option>
          <option value={45}>45</option>
          <option value={60}>60</option>
        </select>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition"
        >
          Book Now
        </button>

        {message && dataSuccess && (
          <p className="mt-4 text-center text-sm font-medium text-green-400">
            {message}
          </p>
        )}
         {message && !dataSuccess && (
          <p className="mt-4 text-center text-sm font-medium text-red-400">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
