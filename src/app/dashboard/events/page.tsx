'use client';

import { Event } from '@/types/event';
import { eventStorage } from '@/utils/eventstorage';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EventsPage() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const response = await fetch('/api/me', {
                    method: 'GET',
                    credentials: 'include',
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Not authenticated');
                }

                setUserId(data.userId);
            } catch (error) {
                console.error('Error verifying auth:', error);
                router.push('/auth/login');
            }
        };

        verifyAuth();
    }, [router]);

    useEffect(() => {
        async function fetchEvents(userId: string) {
            try {
                const data = await eventStorage.getEvents(userId);
                setEvents(data);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Unknown error');
            } finally {
                setLoading(false);
            }
        }

        if (userId) {
            fetchEvents(userId);
        }
    }, [userId]);

    const handleDelete = async (eventId: string) => {
        const confirm = window.confirm('Are you sure you want to delete this event?');
        if (!confirm) return;

        try {
            setDeletingId(eventId);
            const res = await fetch(`/api/events?eventId=${eventId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete event');
            }

            // Refresh events after delete
            setEvents((prev) => prev.filter((event) => event.id !== eventId));
        } catch (err: any) {
            console.error(err);
            alert(err.message || 'Error deleting event');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (iso: string) => {
        const date = new Date(iso);
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }).format(date);
    };

    const formatTime = (timeStr: string) => {
        const [hour, minute] = timeStr.split(':');
        const date = new Date();
        date.setHours(Number(hour), Number(minute));
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        }).format(date);
    };

    if (loading) return <p className="p-4">Loading events...</p>;
    if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">📆 Upcoming Events Timeline</h1>
                <button
                    onClick={() => router.push('/dashboard/events/new')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    ➕ Create Event
                </button>
            </div>

            {events.length === 0 ? (
                <p className="text-center text-gray-600">No events found.</p>
            ) : (
                <div className="relative border-l-4 border-blue-600 pl-6 space-y-10">
                    {events.map((event) => (
                        <div key={event.id} className="relative">
                            <div className="absolute -left-[11px] top-1 w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-md"></div>

                            <div className="bg-gray-50 p-5 rounded-xl shadow-sm hover:shadow-md transition">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                                    <div>
                                        <h2 className="text-xl font-semibold text-blue-700">{event.name}</h2>
                                        <p className="text-sm text-gray-500 mb-2">
                                            {formatDate(event.eventDate)} at {formatTime(event.eventTime)}
                                        </p>
                                        <p className="text-gray-700"><strong>📍 Venue:</strong> {event.venue}</p>
                                        <p className="text-gray-700"><strong>🕒 Duration:</strong> {event.duration} day(s)</p>
                                    </div>
                                    <div className="mt-4 md:mt-0 text-right space-y-2">
                                        <span className={`inline-block px-3 py-1 text-sm rounded-full font-medium ${event.shouldNotify ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                                            🔔 {event.shouldNotify ? `Notify ${event.notifyBeforeMinutes} min before` : 'No notification'}
                                        </span>
                                        <br />
                                        <button
                                            onClick={() => handleDelete(event.id)}
                                            disabled={deletingId === event.id}
                                            className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-md border border-red-500 text-red-600 hover:bg-red-50 transition 
                                            ${deletingId === event.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            🗑️ {deletingId === event.id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
