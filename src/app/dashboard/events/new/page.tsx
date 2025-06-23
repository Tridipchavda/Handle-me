'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';

export default function CreateEventPage() {
  const [form, setForm] = useState({
    name: '',
    venue: '',
    eventDate: new Date(),
    eventTime: '12:00',
    duration: 1,
    shouldNotify: false,
    notifyBeforeMinutes: 30,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, type, value } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (type === 'number') {
      setForm((prev) => ({
        ...prev,
        [name]: value === '' ? '' : Number(value),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setForm((prev) => ({ ...prev, eventDate: date }));
    }
  };

  const handleTimeChange = (time: string | null) => {
    if (time) {
      setForm((prev) => ({ ...prev, eventTime: time }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const duration = Number(form.duration);
    const notifyBefore = Number(form.notifyBeforeMinutes);

    if (isNaN(duration) || duration <= 0) {
      setError('Duration must be a positive number');
      setLoading(false);
      return;
    }

    if (form.shouldNotify && (isNaN(notifyBefore) || notifyBefore <= 0)) {
      setError('Notify Before (minutes) must be a positive number');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name,
          venue: form.venue,
          eventDate: form.eventDate.toISOString().split('T')[0],
          eventTime: form.eventTime,
          duration,
          shouldNotify: form.shouldNotify,
          notifyBeforeMinutes: notifyBefore,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create event');
      }

      router.push('/dashboard/events');
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">📝 Create New Event</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-gradient-to-r from-white to-blue-50 shadow-lg p-6 rounded-2xl"
      >
        <input
          type="text"
          name="name"
          placeholder="Event Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          name="venue"
          placeholder="Venue"
          value={form.venue}
          onChange={handleChange}
          required
          className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              📅 Pick a Date
            </label>
            <DatePicker
              selected={form.eventDate}
              onChange={handleDateChange}
              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              dateFormat="MMMM d, yyyy"
              calendarClassName="rounded-xl shadow-md"
              popperPlacement="bottom-start"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              ⏰ Select Time
            </label>
            <TimePicker
              value={form.eventTime}
              onChange={handleTimeChange}
              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disableClock={false}
              clearIcon={null}
            />
          </div>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            🕒 Duration (in days)
          </label>
          <input
            type="number"
            name="duration"
            min={1}
            step={1}
            value={form.duration}
            onChange={handleChange}
            required
            className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 2"
          />
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="shouldNotify"
            checked={form.shouldNotify}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="text-sm text-gray-700">
            🔔 Notify before event?
          </label>
        </div>
        {form.shouldNotify && (
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              ⏳ Notify Before (minutes)
            </label>
            <input
              type="number"
              name="notifyBeforeMinutes"
              min={1}
              step={1}
              value={form.notifyBeforeMinutes}
              onChange={handleChange}
              className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 30"
            />
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all duration-200"
        >
          {loading ? 'Creating...' : 'Create Event'}
        </button>
        {error && (
          <p className="text-red-600 text-sm text-center mt-2">{error}</p>
        )}
      </form>
    </div>
  );
}
