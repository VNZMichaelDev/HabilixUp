import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Verificar sesión del usuario
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Rutas protegidas que requieren autenticación
  const protectedRoutes = [
    '/dashboard',
    '/admin',
    '/mi-cv',
    '/curso', // Proteger rutas de cursos
  ]

  // Verificar si es una ruta protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Si es una lección, verificar autenticación y inscripción
  if (pathname.includes('/leccion/')) {
    if (!session) {
      // Redirigir a login con la URL de retorno
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Extraer el ID del curso de la URL (ahora usando /curso/ en lugar de /cursos/)
    const courseIdMatch = pathname.match(/\/curso\/([^\/]+)\//)
    const courseId = courseIdMatch?.[1]

    if (courseId) {
      // Verificar si el usuario está inscrito en el curso
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('course_id', courseId)
        .single()

      if (!enrollment) {
        // Redirigir a la página del curso para inscribirse
        return NextResponse.redirect(new URL(`/curso/${courseId}`, req.url))
      }
    }
  }

  // Verificar otras rutas protegidas
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/mi-cv/:path*',
    '/curso/:path*',
  ]
}
