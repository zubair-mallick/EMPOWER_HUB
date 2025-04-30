// app/unauthorized/page.tsx
export default function UnauthorizedPage() {
    return (
      <div className="min-h-screen flex items-center justify-center  px-4">
        <div className=" p-8 rounded-2xl shadow-md max-w-md text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
          <p className="text-gray-600 mb-6">
            You do not have permission to view this page. Please log in with an appropriate account role.
          </p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }
  