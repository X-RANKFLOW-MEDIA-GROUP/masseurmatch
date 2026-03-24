// Block all access to /wireframes route
import { NextResponse } from 'next/server';

export function middleware() {
  return new NextResponse('Not Found', { status: 404 });
}

export const config = {
  matcher: ['/wireframes/:path*'],
};