import { query } from './taskDB'; // or wherever your shared query function is located

// Journal CRUD operations

export async function getJournalsByUserId(userId: string) {
    const result = await query(
        'SELECT * FROM "Journal" WHERE "userId" = $1 ORDER BY "date" DESC',
        [userId]
    );
    return result.rows;
}

export async function getJournalByDate(userId: string, date: string) {
    const result = await query(
        'SELECT * FROM "Journal" WHERE "userId" = $1 AND "date"::date = $2::date',
        [userId, date]
    );
    return result.rows[0];
}


export async function createJournal({
    userId,
    date,
    content,
    image,
}: {
    userId: string;
    date: string;
    content: string;
    image?: string;
}) {
    const result = await query(
        `INSERT INTO "Journal" (id, "userId", "date", "content", "image", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
        [userId, date, content, image || null]
    );
    return result.rows[0];
}

export async function updateJournal(date: string, userId: string, updates: Partial<{ content: string; image: string }>) {
    const setClause = Object.keys(updates)
        .map((key, index) => `"${key}" = $${index + 3}`)
        .join(', ');
    const values = Object.values(updates);

    const result = await query(
        `UPDATE "Journal" SET ${setClause}, "updatedAt" = NOW() WHERE "date" = $1 AND "userId" = $2 RETURNING *`,
        [date, userId, ...values]
    );

    return result.rows[0];
}

export async function deleteJournal(userId: string, date: string) {
    const result = await query(
        'DELETE FROM "Journal" WHERE "userId" = $1 AND "date" = $2 RETURNING *',
        [userId, date]
    );
    return result.rows[0];
}
