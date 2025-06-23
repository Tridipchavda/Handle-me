'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { taskStorage } from '@/utils/taskStorage';
import { Task } from '@/types/task';

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log('Attempting to verify auth...');
        const response = await fetch('/api/me', {
          method: 'GET',
          credentials: 'include',
        });

        console.log('Auth response status:', response.status);
        const data = await response.json();
        console.log('Auth response data:', data);

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
    if (userId) {
      loadTasks();
    }
  }, [userId]);

  const loadTasks = async () => {
    if (!userId) return;
    
    try {
      const userTasks = await taskStorage.getTasks(userId);
      setTasks(userTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePin = async (taskId: string, currentPinState: boolean) => {
    try {
      const updatedTask = await taskStorage.updateTask(taskId, { isPinned: !currentPinState });
      if (updatedTask) {
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, isPinned: !currentPinState } : task
        ));
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    setDeletingTaskId(taskId);
    try {
      await taskStorage.deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again.');
    } finally {
      setDeletingTaskId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm h-48"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Handle Me</h1>
          <p className="mt-2 text-gray-600">Manage your tasks efficiently</p>
        </div>

        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/tasks/new')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Add New Task
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No tasks yet. Create your first task!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white p-6 rounded-lg shadow-sm ${
                  task.isPinned ? 'border-l-4 border-indigo-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => togglePin(task.id, task.isPinned)}
                      className="text-gray-400 hover:text-indigo-500"
                    >
                      {task.isPinned ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 4.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V4.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 4.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V4.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/tasks/${task.id}/edit`)}
                      className="p-1 rounded-full text-blue-500 hover:text-white hover:bg-blue-500 transition-colors duration-150"
                      title="Edit Task"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className={`p-1 rounded-full text-red-500 hover:text-white hover:bg-red-500 transition-colors duration-150 ${deletingTaskId === task.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={deletingTaskId === task.id}
                      title="Delete Task"
                    >
                      {deletingTaskId === task.id ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zm3.46-9.88a1 1 0 10-1.92.76l1 8a1 1 0 001.92-.76l-1-8zm5.08 0a1 1 0 10-1.92.76l1 8a1 1 0 001.92-.76l-1-8zM19 4h-3.5l-1-1h-5l-1 1H5a1 1 0 100 2h14a1 1 0 100-2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{task.description}</p>
                <div className="flex justify-between items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLabelColor(task.label)}`}>
                    {task.label}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 