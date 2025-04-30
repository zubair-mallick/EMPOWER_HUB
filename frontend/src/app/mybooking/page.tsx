'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

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

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl: string;
  unsafeMetadata: {
    role: string;
  };
}

export default function MyBookingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [confirmedAppointments, setConfirmedAppointments] = useState<Appointment[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const role = user?.unsafeMetadata?.role;
    if (role !== 'councellor') {
      router.push('/unauthorized');
      return;
    }

    const fetchAppointmentsAndStudents = async () => {
      try {
        const [confirmedRes, pendingRes, studentsRes] = await Promise.all([
          fetch(`/api/appointments/counselor/${user.id}?status=confirmed`),
          fetch(`/api/appointments/counselor/${user.id}?status=pending`),
          fetch(`http://localhost:8000/api/getStudents`),
        ]);

        const confirmedData = await confirmedRes.json();
        const pendingData = await pendingRes.json();
        const studentData = await studentsRes.json();

        setConfirmedAppointments(confirmedData.appointments || []);
        setPendingAppointments(pendingData.appointments || []);
        setStudents(studentData.students || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentsAndStudents();
  }, [isLoaded, user, router]);

  const updateStatus = async (appointmentId: string, newStatus: 'confirmed' | 'cancel') => {
    try {
      const res = await fetch(`/api/appointments/update/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (data.success) {
        setPendingAppointments(prev => prev.filter(app => app._id !== appointmentId));
        if (newStatus === 'confirmed') {
          setConfirmedAppointments(prev => [...prev, data.updatedAppointment]);
        }
      }
    } catch (error) {
      console.error('Failed to update appointment:', error);
    }
  };

  const formatDateTime = (datetime: string) =>
    new Date(datetime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  const getStudentDetails = (studentId: string) => {
    return students.find(s => s.id === studentId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="p-6 mt-14 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-10">My Appointments</h1>

      {/* Confirmed Appointments */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">✅ Scheduled Appointments</h2>
        {confirmedAppointments.length === 0 ? (
          <p className="text-gray-600">No confirmed appointments.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {confirmedAppointments.map(app => {
              const student = getStudentDetails(app.studentId);
              return (
                <div key={app._id} className="border p-4 rounded-lg shadow-md">
                  {student ? (
                    <>
                      <div className="flex items-center gap-3 mb-2">
                        <img src={student.profileImageUrl} alt={student.firstName} className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="font-semibold">{student.firstName} {student.lastName}</p>
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-red-500">Student not found</p>
                  )}
                  <p><strong>Date & Time:</strong> {formatDateTime(app.scheduledDateTime)}</p>
                  <p><strong>Duration:</strong> {app.scheduledDurationMinutes} mins</p>
                  <p className="text-green-600 font-medium mt-2">Status: {app.status}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Pending Appointments */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">🕒 Requested Appointments</h2>
        {pendingAppointments.length === 0 ? (
          <p className="text-gray-600">No pending requests.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingAppointments.map(app => {
              const student = getStudentDetails(app.studentId);
              return (
                <div key={app._id} className="border p-4 rounded-lg shadow-md">
                  {student ? (
                    <>
                      <div className="flex items-center gap-3 mb-2">
                        <img src={student.profileImageUrl} alt={student.firstName} className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="font-semibold">{student.firstName} {student.lastName}</p>
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-red-500">Student not found</p>
                  )}
                  <p><strong>Date & Time:</strong> {formatDateTime(app.scheduledDateTime)}</p>
                  <p><strong>Duration:</strong> {app.scheduledDurationMinutes} mins</p>
                  <p className="text-yellow-500 font-medium mt-2">Status: {app.status}</p>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => updateStatus(app._id, 'confirmed')}
                      className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => updateStatus(app._id, 'cancel')}
                      className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
