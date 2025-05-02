import { clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const response = await clerkClient();
  let users:any = await response.users.getUserList();
  users= users.data
  console.log(users);
  
    const counselors = users
      .filter((user:any) => user.unsafeMetadata?.role === "councellor")
      .map((user:any) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses[0]?.emailAddress,
        profileImageUrl: user.imageUrl,
        unsafeMetadata: user.unsafeMetadata
      }));

    return Response.json({ success: true, counselors });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, message: "Failed to fetch counselors" }, { status: 500 });
  }
}
