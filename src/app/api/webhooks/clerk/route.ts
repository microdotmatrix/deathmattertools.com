import { deleteUser, upsertUserWebhook } from "@/lib/db/mutations/auth";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const event = await verifyWebhook(request)

    switch (event.type) {
      case "user.created":
      case "user.updated":
        const clerkData = event.data;
        const email = clerkData.email_addresses.find((e) => e.id === clerkData.primary_email_address_id)?.email_address
        if (email == null) {
          return new Response("No email address found", { status: 400 })
        }
        await upsertUserWebhook({
          id: clerkData.id,
          name: `${clerkData.first_name} ${clerkData.last_name}`,
          email,
          imageUrl: clerkData.image_url,
          createdAt: new Date(clerkData.created_at),
          updatedAt: new Date(clerkData.updated_at),
        })
        break;
      case "user.deleted":
        if (event.data.id == null) {
          return new Response("No user id found", { status: 400 })
        }
        await deleteUser(event.data.id)
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error: Invalid Webhook", { status: 500 })
  }

  return new Response("Webhook executed", { status: 200 })
}