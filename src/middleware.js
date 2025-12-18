import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Strict check for admin role (optional, but good practice)
    if (req.nextUrl.pathname.startsWith("/add-chapter") && req.nextauth.token?.role !== "admin") {
      return NextResponse.rewrite(new URL("/login", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // User must be logged in
    },
  }
);

export const config = {
  matcher: ["/add-chapter/:path*"], // Protects this route and any sub-routes
};
