import { prisma } from "../src/lib/prisma";

async function createDummyChatroom() {
  try {
    console.log("🔍 Fetching existing data...");

    // Get a booking with payment
    const booking = await prisma.booking.findFirst({
      where: { status: "CONFIRMED" },
      include: {
        student: true,
        tutorProfile: true,
        payment: true,
      },
    });

    if (!booking) {
      console.error("❌ No CONFIRMED booking found");
      process.exit(1);
    }

    console.log("✅ Found booking:", {
      id: booking.id,
      studentId: booking.studentId,
      studentName: booking.student.name,
      tutorProfileId: booking.tutorProfile.id,
      tutorUserId: booking.tutorProfile.userId,
      tutorName: booking.tutorProfile.user?.name || "N/A",
      paymentStatus: booking.payment?.status,
    });

    // Check if chatroom already exists
    const existingChatroom = await prisma.chatRoom.findFirst({
      where: { bookingId: booking.id },
    });

    if (existingChatroom) {
      console.log("⚠️  Chatroom already exists:", existingChatroom);
      process.exit(0);
    }

    // Create the chatroom
    console.log("\n📝 Creating chatroom...");
    const chatroom = await prisma.chatRoom.create({
      data: {
        bookingId: booking.id,
        studentId: booking.studentId,
        tutorId: booking.tutorProfile.userId, // ⚠️ IMPORTANT: Use userId, not profileId
      },
      include: {
        student: { select: { name: true, email: true } },
        tutor: { select: { name: true, email: true } },
      },
    });

    console.log("✅ Chatroom created successfully:");
    console.log(chatroom);

    // Create a test message
    console.log("\n💬 Creating test message...");
    const message = await prisma.message.create({
      data: {
        chatRoomId: chatroom.id,
        senderId: booking.studentId,
        content: "Hello! This is a test message from the student.",
      },
    });

    console.log("✅ Message created:", message);

    // Fetch all messages in the room
    const messages = await prisma.message.findMany({
      where: { chatRoomId: chatroom.id },
      include: {
        sender: { select: { name: true, email: true } },
      },
    });

    console.log("\n📨 All messages in chatroom:");
    messages.forEach((msg) => {
      console.log(`  [${msg.sender.name}]: ${msg.content}`);
    });
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    if (error.code === "P2025") {
      console.error("   → Record not found. Possible foreign key issue.");
    }
    if (error.code === "P2002") {
      console.error(
        "   → Unique constraint violation. Chatroom might already exist.",
      );
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createDummyChatroom();
