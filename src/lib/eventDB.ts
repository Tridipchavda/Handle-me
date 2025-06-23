import { query } from './taskDB'; // assuming your common query function is in `query.ts`

// Event CRUD functions
export async function getEventsByUserId(userId: string) {
  const result = await query('SELECT * FROM "Event" WHERE "userId" = $1 ORDER BY "eventDate", "eventTime"', [userId]);
  return result.rows;
}

export async function createEvent(
  name: string,
  venue: string,
  duration: number,
  shouldNotify: boolean,
  notifyBeforeMinutes: number,
  eventDate: string,
  eventTime: string,
  userId: string
) {
  const result = await query(
    `INSERT INTO "Event" (id, name, venue, duration, "shouldNotify", "notifyBeforeMinutes", "eventDate", "eventTime", "userId", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING *`,
    [name, venue, duration, shouldNotify, notifyBeforeMinutes, eventDate, eventTime, userId]
  );
  
  return result.rows[0];
}

export async function updateEvent(id: string, updates: any) {
  const setClause = Object.keys(updates)
    .map((key, index) => `"${key}" = $${index + 2}`)
    .join(', ');
  const values = Object.values(updates);

  const result = await query(
    `UPDATE "Event" SET ${setClause}, "updatedAt" = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return result.rows[0];
}

export async function deleteEvent(id: string) {
  const result = await query('DELETE FROM "Event" WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
}
