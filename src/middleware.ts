import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const isAuth = !!req.nextauth.token;
        const isAdmin = req.nextauth.token?.role === "ADMIN";
        const path = req.nextUrl.pathname;

        if (path.startsWith("/admin")) {
            if (path === "/admin/login") {
                if (isAuth && isAdmin) {
                    return NextResponse.redirect(new URL("/admin", req.url));
                }
                return null; // Allow access to login page
            }

            if (!isAuth) {
                return NextResponse.redirect(new URL("/admin/login", req.url));
            }
            if (!isAdmin) {
                return NextResponse.redirect(new URL("/dashboard", req.url));
            }
        }
        return null;
    },
    {
        callbacks: {
            authorized: ({ token }) => true, // Let middleware function handle logic
        },
    }
);

export const config = {
    matcher: ["/admin/:path*"],
};
