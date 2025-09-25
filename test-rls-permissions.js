// Script para probar las políticas RLS después de aplicar las correcciones
// Ejecutar con: node test-rls-permissions.js

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://jbvjvzryjpcewwublpjh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impidmp2enJ5anBjZXd3dWJscGpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5OTc2NDAsImV4cCI6MjA3MzU3MzY0MH0.C9r9aHUWkU0-Gkh2q3ecLYZ5pSiy0CaGJ2y9h8Dh9Kg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRLSPermissions() {
  try {
    console.log('🔐 Probando políticas RLS (Row Level Security)...\n')

    // 1. Verificar perfil de admin
    console.log('1️⃣ Verificando perfil de administrador...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role, full_name')
      .eq('email', 'maikermicha15@gmail.com')
      .single()

    if (profileError || !profile) {
      console.error('❌ Error obteniendo perfil:', profileError?.message)
      return
    }

    console.log('✅ Perfil encontrado:', profile.email, '- Rol:', profile.role)

    // 2. Simular autenticación (esto normalmente se hace con signIn)
    console.log('\n2️⃣ Probando acceso a categorías...')
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(3)

    if (categoriesError) {
      console.error('❌ Error accediendo a categorías:', categoriesError.message)
    } else {
      console.log('✅ Categorías accesibles:', categories?.length || 0)
    }

    // 3. Probar acceso a cursos
    console.log('\n3️⃣ Probando acceso a cursos...')
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, is_published, instructor_id')
      .limit(3)

    if (coursesError) {
      console.error('❌ Error accediendo a cursos:', coursesError.message)
    } else {
      console.log('✅ Cursos accesibles:', courses?.length || 0)
      courses?.forEach(course => {
        console.log(`   📚 ${course.title} (${course.is_published ? 'Publicado' : 'Borrador'})`)
      })
    }

    // 4. Probar acceso a lecciones (aquí estaba el problema)
    console.log('\n4️⃣ Probando acceso a lecciones...')
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, title, course_id, is_free')
      .limit(3)

    if (lessonsError) {
      console.error('❌ Error accediendo a lecciones:', lessonsError.message)
      console.log('   🔍 Detalles:', lessonsError)
    } else {
      console.log('✅ Lecciones accesibles:', lessons?.length || 0)
      lessons?.forEach(lesson => {
        console.log(`   📝 ${lesson.title} (${lesson.is_free ? 'Gratis' : 'Premium'})`)
      })
    }

    // 5. Probar creación de lección (la operación que estaba fallando)
    if (courses && courses.length > 0) {
      console.log('\n5️⃣ Probando creación de lección...')
      
      const testLesson = {
        course_id: courses[0].id,
        title: 'Lección de Prueba RLS - ' + new Date().toISOString(),
        description: 'Lección creada para probar políticas RLS',
        content: 'Contenido de prueba',
        duration: 5,
        order_index: 999,
        is_free: true
      }

      const { data: newLesson, error: createError } = await supabase
        .from('lessons')
        .insert(testLesson)
        .select()
        .single()

      if (createError) {
        console.error('❌ Error creando lección:', createError.message)
        console.log('   🔍 Código de error:', createError.code)
        console.log('   🔍 Detalles:', createError.details)
        
        if (createError.message.includes('row-level security')) {
          console.log('\n🚨 PROBLEMA DETECTADO: Las políticas RLS están bloqueando la creación')
          console.log('📋 SOLUCIÓN: Ejecuta el script fix-rls-policies.sql en Supabase')
        }
      } else {
        console.log('🎉 ¡Lección creada exitosamente!')
        console.log('   📝 ID:', newLesson.id)
        console.log('   📚 Título:', newLesson.title)
        
        // Limpiar - eliminar la lección de prueba
        console.log('\n🧹 Limpiando lección de prueba...')
        const { error: deleteError } = await supabase
          .from('lessons')
          .delete()
          .eq('id', newLesson.id)
        
        if (deleteError) {
          console.log('⚠️  No se pudo eliminar la lección de prueba:', deleteError.message)
        } else {
          console.log('✅ Lección de prueba eliminada')
        }
      }
    }

    console.log('\n📊 RESUMEN:')
    console.log('- Si ves errores de "row-level security", ejecuta fix-rls-policies.sql')
    console.log('- Si todo funciona, ¡las políticas RLS están correctas!')

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

testRLSPermissions()
