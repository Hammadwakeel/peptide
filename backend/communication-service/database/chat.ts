import { query } from "@frontier/shared/database";
import type { Conversation, Message } from "@frontier/shared/database/types";

export async function getOrCreateConversation(
  clinicId: string,
  patientId: string,
): Promise<Conversation> {
  const existing = await query<Conversation>(
    "SELECT * FROM conversations WHERE clinic_id = $1 AND patient_id = $2 LIMIT 1",
    [clinicId, patientId],
  );
  if (existing.rows[0]) return existing.rows[0];

  const created = await query<Conversation>(
    `INSERT INTO conversations (clinic_id, patient_id)
     VALUES ($1, $2)
     RETURNING *`,
    [clinicId, patientId],
  );
  return created.rows[0];
}

export async function listMessages(conversationId: string, limit = 100) {
  return query<Message>(
    `SELECT m.*, u.email AS sender_email
     FROM messages m
     JOIN users u ON u.id = m.sender_user_id
     WHERE m.conversation_id = $1
     ORDER BY m.created_at ASC
     LIMIT $2`,
    [conversationId, limit],
  );
}

export async function sendMessage(data: {
  conversation_id: string;
  sender_user_id: string;
  message: string;
}): Promise<Message> {
  const result = await query<Message>(
    `INSERT INTO messages (conversation_id, sender_user_id, message)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [data.conversation_id, data.sender_user_id, data.message],
  );
  await query(
    "UPDATE conversations SET updated_at = NOW() WHERE id = $1",
    [data.conversation_id],
  );
  return result.rows[0];
}

export async function listMessageTemplates(clinicId?: string) {
  if (clinicId) {
    return query(
      `SELECT * FROM message_templates
       WHERE (clinic_id = $1 OR clinic_id IS NULL) AND active = TRUE
       ORDER BY sort_order`,
      [clinicId],
    );
  }
  return query(
    "SELECT * FROM message_templates WHERE clinic_id IS NULL AND active = TRUE ORDER BY sort_order",
  );
}
