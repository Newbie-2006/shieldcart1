import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Public routes that don't need auth
    const publicRoutes = ['/', '/login', '/signup', '/marketplace', '/api/payment/webhook', '/api/auth/signup', '/api/chat'];
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/api/payment/webhook'));

    if (isPublicRoute) {
        return supabaseResponse;
    }

    // Protected routes: redirect to login if not authenticated
    if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    // Role-based route protection
    if (pathname.startsWith('/inspector') || pathname.startsWith('/admin')) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (pathname.startsWith('/inspector') && profile?.role !== 'inspector' && profile?.role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        if (pathname.startsWith('/admin') && profile?.role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
