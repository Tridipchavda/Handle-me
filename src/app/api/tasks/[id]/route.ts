import { NextResponse } from 'next/server';
import { getTasksByUserId } from '@/lib/taskDB';
import { VerifyJWT } from '@/utils/verifyJwt';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const verifiedUser = VerifyJWT();
    const tasks = await getTasksByUserId(verifiedUser.userId);
    const task = tasks.find(t => t.id === params.id);

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task,{status:200});
  } catch (error: any) {
    if (error.message === 'No token found' || error.message === 'Invalid token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
} 