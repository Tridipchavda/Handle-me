export const taskStorage = {
  async getTasks(userId: string) {
    try {
      const response = await fetch(`/api/tasks?userId=${userId}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  },

  async addTask(task: { title: string; description: string; label: string }) {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...task,
          status:201
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },

  async updateTask(taskId: string, updates: Partial<{ title: string; description: string; label: string; isPinned: boolean }>) {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          taskId,
          updates,
        }),
      });

      if (response.status !== 200) {
        throw new Error('Failed to update task');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  async deleteTask(taskId: string) {
    try {
      const response = await fetch(`/api/tasks?taskId=${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
}; 