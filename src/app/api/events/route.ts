import { NextResponse } from 'next/server';
import {
  getEventsByUserId,
  createEvent,
  deleteEvent,
} from '@/lib/eventDB';
import { VerifyJWT } from '@/utils/verifyJwt';
import { notificationQueue } from '@/lib/queue';

// Helper: get future notification time in ms from now
function getNotificationDelay(eventDate: string, eventTime: string, notifyBeforeMinutes: number): number {
  const eventDateTime = new Date(`${eventDate}T${eventTime}:00`);
  const notifyAt = new Date(eventDateTime.getTime() - notifyBeforeMinutes * 60 * 1000);
  return notifyAt.getTime() - Date.now(); // in ms
}

export async function GET(request: Request) {
  try {
    const verifiedUser = VerifyJWT();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (verifiedUser.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const events = await getEventsByUserId(userId);
    return NextResponse.json(events);
  } catch (error: any) {
    if (error.message === 'No token found' || error.message === 'Invalid token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const verifiedUser = VerifyJWT();
    const body = await request.json();
    let { name, venue, duration, shouldNotify, notifyBeforeMinutes, eventDate, eventTime } = body;

    // Convert duration to integer (if it's a string)
    if (typeof duration === 'string') {
      duration = parseInt(duration, 10);
    }

    if (
      typeof name !== 'string' ||
      typeof venue !== 'string' ||
      typeof duration !== 'number' ||
      isNaN(duration) ||
      typeof shouldNotify !== 'boolean' ||
      typeof eventDate !== 'string' ||
      typeof eventTime !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    if (shouldNotify) {
      notifyBeforeMinutes = notifyBeforeMinutes || 30;

      const delay = getNotificationDelay(eventDate, eventTime, notifyBeforeMinutes);
      if (delay > 0) {
        console.log(`📧 Scheduling email to ${verifiedUser.email} in ${Math.round(delay / 1000)} seconds`);
        await notificationQueue.add(
          'send-email',
          {
            to: verifiedUser.email,
            eventName: name,
            notifyBeforeMinutes,
          },
          {
            delay,
            attempts: 3,
          }
        );
      } else {
        console.warn('⚠️ Notification time already passed. Skipping job.');
      }
    }

    const event = await createEvent(
      name,
      venue,
      duration,
      shouldNotify,
      notifyBeforeMinutes,
      eventDate,
      eventTime,
      verifiedUser.userId
    );

    return NextResponse.json({ event, status: 'success' }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'No token found' || error.message === 'Invalid token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const verifiedUser = VerifyJWT();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const events = await getEventsByUserId(verifiedUser.userId);
    const eventToDelete = events.find((e) => e.id === eventId);

    if (!eventToDelete) {
      return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
    }

    await deleteEvent(eventId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'No token found' || error.message === 'Invalid token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
