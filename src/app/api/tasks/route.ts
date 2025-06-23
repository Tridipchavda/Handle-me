import { NextResponse } from 'next/server';
import { getTasksByUserId, createTask, updateTask, deleteTask } from '@/lib/taskDB';
import { VerifyJWT } from '@/utils/verifyJwt';
import { console } from 'inspector';

export async function GET(request: Request) {
  try {
    const verifiedUser = VerifyJWT();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Verify that the requesting user matches the userId
    if (verifiedUser.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }


    const tasks = await getTasksByUserId(userId);
    return NextResponse.json(tasks);
  } catch (error: any) {
    if (error.message === 'No token found' || error.message === 'Invalid token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const verifiedUser = VerifyJWT();
    const body = await request.json();
    const { title, description, label } = body;

    if (!title || !description || !label) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const task = await createTask(title, description, label, verifiedUser.userId);
    return NextResponse.json({task:task,status:"success"},{status:201});
  } catch (error: any) {
    if (error.message === 'No token found' || error.message === 'Invalid token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
  
}

export async function PUT(request: Request) {
  try {
    const verifiedUser = VerifyJWT();
    const body = await request.json();
    const { taskId, updates } = body;

    if (!taskId || !updates) {
      return NextResponse.json(
        { error: 'Task ID and updates are required' },
        { status: 400 }
      );
    }

    const updatedTask = await updateTask(taskId, updates);
    if (!updatedTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Verify that the task belongs to the user
    if (updatedTask.userId !== verifiedUser.userId) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    return NextResponse.json({task:updatedTask},{status:200});
  } catch (error: any) {
    if (error.message === 'No token found' || error.message === 'Invalid token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const verifiedUser = VerifyJWT();
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Verify task ownership before deletion
    const task = await getTasksByUserId(verifiedUser.userId);
    const taskToDelete = task.find(t => t.id === taskId);
    
    if (!taskToDelete) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    await deleteTask(taskId);
    return NextResponse.json({ success: true },{status:200});
  } catch (error: any) {
    if (error.message === 'No token found' || error.message === 'Invalid token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}