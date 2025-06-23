import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

let pool: Pool | null = null;

// Initialize pool only on server side
if (typeof window === 'undefined') {
  const connectionString = process.env.DATABASE_URL || 'postgresql://handle_me_user:handle_me_password@localhost:5432/handle_me_db';
  pool = new Pool({
    connectionString,
    ssl: false
  });
}

export async function POST(request: Request) {
  if (!pool) {
    return NextResponse.json(
      { error: 'Database connection not available' },
      { status: 500 }
    );
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      // Get user from database
      const result = await client.query(
        'SELECT * FROM "User" WHERE email = $1',
        [email]
      );

      const user = result.rows[0];

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Verify password
      const isValidPassword = await compare(password, user.password);

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );
      console.log('Generated token:', token);

      // Set HTTP-only cookie
      const response = NextResponse.json(
        { 
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            username: user.username
          }
        },
        { status: 200 }
      );

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
      console.log('Cookie set in response');

      return response;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error during signin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 