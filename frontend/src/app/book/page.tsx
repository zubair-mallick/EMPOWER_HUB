"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";

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
    if (role !== "student") {
      router.push("/unauthorized");
      return;
    }

    const fetchCounselors = async () => {
      const res = await fetch("/api/getCouncellors");
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

  const joinMeet = async (appointmentId: string) => {
    try {
      const res = await fetch(`/api/appointments/join-call/${appointmentId}`);
      const data = await res.json();

      if (data.success && data.room_id) {
        const username =
          user?.username || `${user?.firstName}${user?.lastName}`;
        const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/call_and_chat/${data.room_id}/${username}`;
        window.location.href = redirectUrl;
      } else {
        console.error("Room ID not received or join failed");
      }
    } catch (err) {
      console.error("Error joining meet:", err);
    }
  };

  // Find the selected counselor based on the URL param
  const selectedCounselor = counselors.find((c) => c.id === id);

  return (
    <div className="p-6 mt-14 min-h-screen">
      {/* Bookings Section */}
      <h2 className="text-2xl font-semibold text-center mb-6">My Bookings</h2>

      {loading ? (
        <div className="flex justify-center items-center">
          <span className="text-lg text-gray-600">
            Loading your bookings...
          </span>
        </div>
      ) : appointments.filter((app) => {
        const endTime = new Date(
          new Date(app.scheduledDateTime).getTime() +
            app.scheduledDurationMinutes * 60000
        );
        return new Date() <= endTime;
      }).length === 0 ? (
        <div className="flex justify-center items-center">
          <span className="text-lg text-gray-600">
            You have no pending bookings.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {appointments
            .filter((app) => {
              const endTime = new Date(
                new Date(app.scheduledDateTime).getTime() +
                  app.scheduledDurationMinutes * 60000
              );
              return new Date() <= endTime;
            })
            .map((appointment) => {
              // **ONLY render if we have a counselor for this appointment**
              const counselor = counselors.find(
                (c) => c.id === appointment.counselorId
              );
              if (!counselor) return null;

              const scheduledDateTime = new Date(
                appointment.scheduledDateTime
              );
              const formattedDateTime = scheduledDateTime.toLocaleString();

              return (
                <div
                  key={appointment._id}
                  className="border p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 w-full max-w-md mx-auto"
                >
                  <div className="flex items-center mb-2">
                    <img
                      src={counselor.profileImageUrl}
                      alt="profile"
                      className="w-16 h-16 rounded-full"
                    />
                    <p className="text-xl font-semibold ml-4">
                      {counselor.firstName} {counselor.lastName}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Scheduled for: {formattedDateTime}
                  </p>
                  <p className="text-sm text-gray-500">
                    Duration: {appointment.scheduledDurationMinutes} minutes
                  </p>
                  <p className="text-sm mt-2 font-semibold w-fit flex items-center space-x-1">
                    <span>Status:</span>
                    <span
                      className={`${
                        appointment.status === "pending"
                          ? "text-yellow-400"
                          : appointment.status === "cancelled"
                          ? "text-red-400"
                          : appointment.status === "confirmed"
                          ? "text-green-400"
                          : "text-gray-400"
                      }`}
                    >
                      {appointment.status.charAt(0).toUpperCase() +
                        appointment.status.slice(1)}
                    </span>
                  </p>

                  {(() => {
                    const now = new Date();
                    const startTime = new Date(
                      appointment.scheduledDateTime
                    );
                    const endTime = new Date(
                      startTime.getTime() +
                        appointment.scheduledDurationMinutes * 60000
                    );

                    if (now >= startTime && now <= endTime) {
                      return (
                        <button
                          onClick={() => joinMeet(appointment._id)}
                          className="mt-3 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Join Meet
                        </button>
                      );
                    }

                    return null;
                  })()}
                </div>
              );
            })}
        </div>
      )}

      <h1 className="text-3xl font-semibold text-center mb-8 mt-14">
        Available Counselors
      </h1>

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
            <p className="text-xl font-semibold">
              {counselor.firstName} {counselor.lastName}
            </p>
            <p className="text-sm text-gray-500">{counselor.email}</p>
            <p className="text-sm text-gray-600 mt-1">
              {counselor.unsafeMetadata.speciality} |{" "}
              {counselor.unsafeMetadata.field}
            </p>

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
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Counselor Details
          </h2>
          <div className="flex items-center space-x-6">
            <img
              src={selectedCounselor.profileImageUrl}
              alt="profile"
              className="h-24 w-24 rounded-full"
            />
            <div>
              <p className="text-xl font-bold">
                {selectedCounselor.firstName}{" "}
                {selectedCounselor.lastName}
              </p>
              <p className="text-gray-600">{selectedCounselor.email}</p>
              <p className="text-gray-600">
                {selectedCounselor.unsafeMetadata.speciality}
              </p>
              <p className="text-gray-600">
                {selectedCounselor.unsafeMetadata.field}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
