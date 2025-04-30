import { clerkClient } from "@clerk/clerk-sdk-node";

export async function GET() {
  try {
    const { data: users } = await clerkClient.users.getUserList();

    const students = users
      .filter((user) => user.unsafeMetadata?.role === "student")
      .map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses[0]?.emailAddress,
        profileImageUrl: user.imageUrl,
        unsafeMetadata: user.unsafeMetadata
      }));

    return Response.json({ success: true, students });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, message: "Failed to fetch students" }, { status: 500 });
  }
}
