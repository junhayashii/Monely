"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function getNotifications() {
  try {
    const user = await getAuthenticatedUser();
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50, // 最新50件まで
    });
    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    const user = await getAuthenticatedUser();
    await prisma.notification.update({
      where: { id, userId: user.id },
      data: { read: true },
    });
    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const user = await getAuthenticatedUser();
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
    revalidatePath("/notifications");
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
  }
}

export async function deleteNotification(id: string) {
  try {
    const user = await getAuthenticatedUser();
    await prisma.notification.delete({
      where: { id, userId: user.id },
    });
    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false };
  }
}

export async function getUnreadNotificationCount() {
  try {
    const user = await getAuthenticatedUser();
    const count = await prisma.notification.count({
      where: { userId: user.id, read: false },
    });
    return count;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
}

