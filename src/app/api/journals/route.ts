// app/api/journals/route.ts
import { NextResponse } from 'next/server';
import { getJournalsByUserId, getJournalByDate, createJournal, updateJournal, deleteJournal } from '@/lib/journalDB';
import { VerifyJWT } from '@/utils/verifyJwt';

export async function GET(request: Request) {
  try {
    const verifiedUser = VerifyJWT();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!verifiedUser?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (date) {
      console.log(date)
      const journal = await getJournalByDate(verifiedUser.userId, date);
      if (!journal) {
        return NextResponse.json({ message: 'Journal not found' }, { status: 200 });
      }
      return NextResponse.json(journal);
    }

    const journals = await getJournalsByUserId(verifiedUser.userId);
    return NextResponse.json(journals);
  } catch (error) {
    console.error('GET journal error:', error);
    return NextResponse.json({ error: 'Failed to fetch journals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const verifiedUser = VerifyJWT();
    const body = await request.json();
    const { date, content, image } = body;

    if (!verifiedUser?.userId || !date || typeof content !== 'string') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const journal = await createJournal({
      userId: verifiedUser.userId,
      date,
      content,
      image,
    });

    return NextResponse.json(journal, { status: 201 });
  } catch (error) {
    console.error('POST journal error:', error);
    return NextResponse.json({ error: 'Failed to create journal' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const verifiedUser = VerifyJWT();
    const body = await request.json();
    const { date, content, image } = body;

    if (!verifiedUser?.userId || !date) {
      return NextResponse.json({ error: 'Date and user authentication required' }, { status: 400 });
    }

    const journal = await updateJournal(date, verifiedUser.userId, {
      content,
      image,
    });

    return NextResponse.json(journal);
  } catch (error) {
    console.error('PUT journal error:', error);
    return NextResponse.json({ error: 'Failed to update journal' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const verifiedUser = VerifyJWT();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!verifiedUser?.userId || !date) {
      return NextResponse.json({ error: 'Date and user authentication required' }, { status: 400 });
    }

    await deleteJournal(verifiedUser.userId, date);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE journal error:', error);
    return NextResponse.json({ error: 'Failed to delete journal' }, { status: 500 });
  }
}
