import type { Prisma } from "@/lib/generated/prisma/client";
import type { AdminNoteDTO } from "@/lib/types";

export function parseAdminNotes(value: unknown): AdminNoteDTO[] {
  if (!Array.isArray(value)) return [];
  return value as AdminNoteDTO[];
}

export function appendAdminNote(existing: unknown, note: string): Prisma.InputJsonValue {
  const notes = [...parseAdminNotes(existing), { note, createdAt: new Date().toISOString() }];
  return notes as unknown as Prisma.InputJsonValue;
}
