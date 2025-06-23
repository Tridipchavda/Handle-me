import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

interface UserData {
  userId: string;
  email: string;
}

export function VerifyJWT(): UserData {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token');
  // console.log('Token in VerifyJWT:', token);

  if (!token) {
    throw new Error('No token found');
  }

  try {
    const decoded = verify(token.value, process.env.JWT_SECRET! || "my-secret-725");
    // console.log('Decoded token:', decoded);
    return {
      userId: (decoded as any).userId,
      email: (decoded as any).email
    };
  } catch (error) {
    console.error('Token verification error:', error);
    throw new Error('Invalid token');
  }
} 