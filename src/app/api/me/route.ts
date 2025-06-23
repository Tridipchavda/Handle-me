import { NextResponse } from 'next/server';
import { VerifyJWT } from '@/utils/verifyJwt';

export async function GET() {
  try {
    const userData = VerifyJWT();
    return NextResponse.json({
      userId: userData.userId,
      email: userData.email
    });
  } catch (error: any) {
    console.error('Error in /me endpoint:', error);
    if (error.message === 'No token found' || error.message === 'Invalid token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 