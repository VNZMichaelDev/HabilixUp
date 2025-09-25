import { NextResponse } from 'next/server'
import { createClientSupabaseClient } from '@/lib/supabaseClient'

export async function GET() {
  try {
    // Verificar conexión a Supabase
    const supabase = createClientSupabaseClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (error) {
      throw error
    }

    // Verificar variables de entorno críticas
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ]

    const missingEnvVars = requiredEnvVars.filter(
      envVar => !process.env[envVar]
    )

    if (missingEnvVars.length > 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing environment variables',
          missing: missingEnvVars,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'HabilixUp API is running correctly',
      database: 'connected',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      features: {
        studyTime: 'enabled',
        profileVerification: 'enabled',
        pdfGeneration: 'enabled',
        notifications: 'enabled'
      }
    })

  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
