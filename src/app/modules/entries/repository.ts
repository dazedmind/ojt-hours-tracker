import { Entries, Users } from "@/generated/client";
import { prisma } from "@/utils/prisma";


export async function getRequiredHoursByUser(uuid: string): Promise<Users | null> {

  try{
    const requiredHours = await prisma.users.findUnique({
      where: {
        id: uuid,
      },
    });
    console.log("[Repository] Query successful, found:", requiredHours);
    return requiredHours;
  } catch (error) {
    console.error("[Repository] Database query error:", error);
    throw error;
  }
}  

export async function getEntriesByUser(uuid: string): Promise<Entries[]> {
  console.log("[Repository] Fetching entries for user:", uuid);
  
  try {
    const entries = await prisma.entries.findMany({
      where: {
        created_by: uuid,
      },
      orderBy: {
        id: "asc",
      },
    });
    
    console.log("[Repository] Query successful, found:", entries.length, "entries");
    return entries;
  } catch (error) {
    console.error("[Repository] Database query error:", error);
    throw error;
  }
}

export async function getEntriesByID(
  id: number,
  uuid: string
): Promise<Entries | null> {
  return await prisma.entries.findUnique({
    where: {
      id,
      created_by: uuid,
    },
  });
}

export async function createEntry(
  data: Omit<Entries, "id" | "created_at">
): Promise<Entries> {
  return await prisma.entries.create({ data });
}

export async function updateEntry(
  id: number,
  uuid: string,
  data: Omit<Entries, "id" | "created_at" | "created_by">
) {
  return await prisma.entries.update({
    data,
    where: {
      id,
      created_by: uuid,
    },
  });
}

export async function deleteEntry(id: number, uuid: string): Promise<Entries> {
  return await prisma.entries.delete({
    where: {
      id,
      created_by: uuid,
    },
  });
}

export async function setRequiredHours(userID: string, requiredHours: number): Promise<Users> {
  return await prisma.users.update({
    where: {
      id: userID,
    },
    data: { req_hours: requiredHours },
  });
}