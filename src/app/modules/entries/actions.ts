"use server";

import { createEntry, deleteEntry, getEntriesByUser, getRequiredHoursByUser, setRequiredHours, updateEntry } from "./repository";
import { Entries, Users } from "@/generated/client";

export async function actionGetEntries(userID: string): Promise<{
  ok: boolean;
  data: Entries[] | null;
}> {
  try {
    console.log("[Server] Fetching entries for user:", userID);
    const entries = await getEntriesByUser(userID);
    console.log("[Server] Found entries:", entries.length);

    return { ok: true, data: entries };
  } catch (error) {
    console.error("[Server] Error fetching entries:", error);
    return { ok: false, data: null };
  }
}

export async function actionGetRequiredHours(userID: string): Promise<{
  ok: boolean;
  data: Users | null;
}> {
  try {
    console.log("[Server] Fetching required hours for user:", userID);
    const requiredHours = await getRequiredHoursByUser(userID);
    console.log("[Server] Found required hours:", requiredHours);

    return { ok: true, data: requiredHours };
  } catch (error) {
    console.error("[Server] Error fetching required hours:", error);
    return { ok: false, data: null };
  }
}

export async function actionSetRequiredHours(
  userID: string,
  requiredHours: number
): Promise<{ ok: boolean; data: Users | null }> {
  try {
    const requiredHoursData = await setRequiredHours(userID, requiredHours);
    console.log("[Server] Required hours set successfully:", requiredHours);
    return { ok: true, data: requiredHoursData };
  } catch (error) {
    console.error("[Server] Error setting required hours:", error);
    return { ok: false, data: null };
  }
}

export async function actionCreateEntry(
  userID: string,
  data: Omit<Entries, "id" | "created_at" | "created_by">
): Promise<{ ok: boolean; data: Entries | null }> {
  try {
    const entry = await createEntry({
      ...data,
      created_by: userID,
    });

    return { ok: true, data: entry };
  } catch (error) {
    console.log(error);
    return { ok: false, data: null };
  }
}

export async function actionUpdateEntry(
  entryID: number,
  userID: string,
  data: Omit<Entries, "id" | "created_at" | "created_by">
): Promise<{ ok: boolean; data: Entries | null }> {
  try {
    const entry = await updateEntry(entryID, userID, data);

    return { ok: true, data: entry };
  } catch (error) {
    console.log(error);
    return { ok: false, data: null };
  }
}

export async function actionDeleteEntry(
  entryID: number,
  userID: string
): Promise<{ ok: boolean }> {
  try {
    await deleteEntry(entryID, userID);

    return { ok: true };
  } catch (error) {
    console.log(error);
    return { ok: false };
  }
}
