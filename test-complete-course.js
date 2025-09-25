// Script para marcar un curso como completado y probar certificados
// Ejecutar con: node test-complete-course.js

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://jbvjvzryjpcewwublpjh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impidmp2enJ5anBjZXd3dWJscGpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5OTc2NDAsImV4cCI6MjA3MzU3MzY0MH0.C9r9aHUWkU0-Gkh2q3ecLYZ5pSiy0CaGJ2y9h8Dh9Kg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCertificateSystem() {
  console.log('🎓 PROBANDO SISTEMA DE CERTIFICADOS\n')

  try {
    // 1. Buscar el usuario admin
    console.log('1️⃣ Buscando usuario admin...')
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', 'maikermicha15@gmail.com')
      .single()

    if (adminError || !adminProfile) {
      console.error('❌ Error encontrando usuario admin:', adminError?.message)
      return
    }

    console.log('✅ Usuario admin encontrado:', adminProfile.email)

    // 2. Buscar cursos disponibles
    console.log('\n2️⃣ Buscando cursos disponibles...')
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, instructor_id')
      .limit(3)

    if (coursesError || !courses || courses.length === 0) {
      console.error('❌ Error encontrando cursos:', coursesError?.message)
      return
    }

    console.log('✅ Cursos encontrados:', courses.length)
    courses.forEach(course => {
      console.log(`   📚 ${course.title} (ID: ${course.id})`)
    })

    const testCourse = courses[0]
    console.log(`\n🎯 Usando curso para prueba: ${testCourse.title}`)

    // 3. Verificar enrollments existentes
    console.log('\n3️⃣ Verificando enrollments existentes...')
    const { data: existingEnrollments, error: enrollError } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', adminProfile.id)
      .eq('course_id', testCourse.id)

    if (enrollError) {
      console.error('❌ Error verificando enrollments:', enrollError.message)
      return
    }

    console.log('📊 Enrollments existentes:', existingEnrollments?.length || 0)

    // 4. Crear o actualizar enrollment con progreso 100%
    console.log('\n4️⃣ Marcando curso como completado...')
    const { data: enrollment, error: completeError } = await supabase
      .from('enrollments')
      .upsert({
        user_id: adminProfile.id,
        course_id: testCourse.id,
        progress: 100,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (completeError) {
      console.error('❌ Error marcando curso como completado:', completeError.message)
      console.log('   Detalles:', completeError)
      return
    }

    console.log('✅ Curso marcado como completado!')
    console.log('   📊 Progreso:', enrollment?.progress || 'N/A')

    // 5. Probar la consulta que usa el certificado
    console.log('\n5️⃣ Probando consulta de certificado...')
    const { data: certificateData, error: certError } = await supabase
      .from('enrollments')
      .select(`
        id,
        progress,
        created_at,
        courses (
          id,
          title,
          description,
          profiles (
            full_name
          )
        )
      `)
      .eq('user_id', adminProfile.id)
      .eq('course_id', testCourse.id)
      .eq('progress', 100)
      .maybeSingle()

    if (certError) {
      console.error('❌ Error en consulta de certificado:', certError.message)
      return
    }

    if (!certificateData) {
      console.log('❌ No se encontraron datos para el certificado')
      console.log('   🔍 Verifica que el enrollment tenga progress = 100')
      return
    }

    console.log('🎉 ¡Datos de certificado encontrados!')
    console.log('   📚 Curso:', certificateData.courses?.title)
    console.log('   👨‍🏫 Instructor:', certificateData.courses?.profiles?.full_name || 'Sin nombre')
    console.log('   📅 Completado:', certificateData.created_at)

    // 6. Generar URL de certificado
    const certificateUrl = `http://localhost:3000/certificado/${testCourse.id}`
    console.log('\n🔗 URL del certificado:', certificateUrl)

    console.log('\n📋 RESUMEN:')
    console.log('✅ Usuario admin configurado')
    console.log('✅ Curso marcado como completado (100%)')
    console.log('✅ Consulta de certificado funcional')
    console.log('🎯 Ve a la URL del certificado para probarlo')

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

testCertificateSystem()
