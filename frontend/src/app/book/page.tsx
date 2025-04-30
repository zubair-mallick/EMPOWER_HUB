'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';

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

interface Appointment {
  _id: string;
  studentId: string;
  counselorId: string;
  scheduledDateTime: string;
  scheduledDurationMinutes: number;
  status: string;
  is_in_call: boolean;
  room_id: string | null;
}

export default function BookCounselorPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { id } = useParams(); // Get counselor ID from URL
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const role = user?.unsafeMetadata?.role;
    if (role !== 'student') {
      router.push('/unauthorized');
      return;
    }

    const fetchCounselors = async () => {
      const res = await fetch('/api/getCouncellors');
      const users = await res.json();
      setCounselors(users.counselors);
    };

    const fetchAppointments = async () => {
      const res = await fetch(`/api/appointments/student/${user.id}`);
      const data = await res.json();
      setAppointments(data.appointments);
      setLoading(false);
    };

    fetchCounselors();
    fetchAppointments();
  }, [isLoaded, user, router]);

  // Find the selected counselor based on the URL param
  const selectedCounselor = counselors.find((c) => c.id === id);

  return (
    <div className="p-6 mt-14 min-h-screen">
      <h1 className="text-3xl font-semibold text-center mb-8">Available Counselors</h1>

      {/* Counselor Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        {counselors.map((counselor) => (
          <div
            key={counselor.id}
            className="flex flex-col items-center cursor-pointer border p-6 rounded-lg w-full shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <img
              src={counselor.profileImageUrl}
              alt="profile"
              className="h-20 w-20 rounded-full mb-4"
            />
            <p className="text-xl font-semibold">{counselor.firstName} {counselor.lastName}</p>
            <p className="text-sm text-gray-500">{counselor.email}</p>
            <p className="text-sm text-gray-600 mt-1">{counselor.unsafeMetadata.speciality} | {counselor.unsafeMetadata.field}</p>

            <button
              onClick={() => router.push(`/booking/${counselor.id}`)}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
            >
              Book Appointment
            </button>
          </div>
        ))}
      </div>

      {/* Counselor Detail Section (for selected one) */}
      {selectedCounselor && (
        <div className="border p-6 rounded-lg shadow-md mb-10 max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-center">Counselor Details</h2>
          <div className="flex items-center space-x-6">
            <img
              src={selectedCounselor.profileImageUrl}
              alt="profile"
              className="h-24 w-24 rounded-full"
            />
            <div>
              <p className="text-xl font-bold">{selectedCounselor.firstName} {selectedCounselor.lastName}</p>
              <p className="text-gray-600">{selectedCounselor.email}</p>
              <p className="text-gray-600">{selectedCounselor.unsafeMetadata.speciality}</p>
              <p className="text-gray-600">{selectedCounselor.unsafeMetadata.field}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Section */}
    {/* Bookings Section */}
<h2 className="text-2xl font-semibold text-center mb-6">My Bookings</h2>

{loading ? (
  <div className="flex justify-center items-center">
    <span className="text-lg text-gray-600">Loading your bookings...</span>
  </div>
) : appointments.length === 0 ? (
  <div className="flex justify-center items-center">
    <span className="text-lg text-gray-600">You have no pending bookings.</span>
  </div>
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {appointments.map((appointment) => {
      const scheduledDateTime = new Date(appointment.scheduledDateTime);
      const formattedDateTime = scheduledDateTime.toLocaleString();
      const counselor = counselors.find((c) => c.id === appointment.counselorId);

      return (
        <div
          key={appointment._id}
          className="border p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 w-full max-w-md mx-auto"
        >
          {counselor && (
            <>
              <div className="flex items-center mb-2">
                <img
                  src={counselor.profileImageUrl}
                  alt="profile"
                  className="w-16 h-16 rounded-full"
                />
                <p className="text-xl font-semibold ml-4">{counselor.firstName} {counselor.lastName}</p>
              </div>
              <p className="text-sm text-gray-600">Scheduled for: {formattedDateTime}</p>
              <p className="text-sm text-gray-500">Duration: {appointment.scheduledDurationMinutes} minutes</p>
              <p
                className={`text-sm mt-2 ${
                  appointment.status === 'pending' ? 'text-yellow-500' : 'text-green-500'
                }`}
              >
                Status: {appointment.status}
              </p>
            </>
          )}
        </div>
      );
    })}
  </div>
)}

    </div>
  );
}
