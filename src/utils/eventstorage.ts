export const eventStorage = {
  async getEvents(userId: string) {
    try {
      const response = await fetch(`/api/events?userId=${userId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting events:', error);
      throw error;
    }
  },

  async addEvent(event: {
    name: string;
    venue: string;
    duration: number;
    shouldNotify: boolean;
    date: string;
    time: string;
  }) {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...event,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  },

  async updateEvent(eventId: string, updates: Partial<{
    name: string;
    venue: string;
    duration: number;
    shouldNotify: boolean;
    date: string;
    time: string;
  }>) {
    try {
      const response = await fetch('/api/events', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ eventId, updates }),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  async deleteEvent(eventId: string) {
    try {
      const response = await fetch(`/api/events?eventId=${eventId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },
};
