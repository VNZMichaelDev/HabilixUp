// Script para diagnosticar el problema de admin y cursos
// Ejecutar con: node diagnose-admin-issue.js

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://jbvjvzryjpcewwublpjh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impidmp2enJ5anBjZXd3dWJscGpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5OTc2NDAsImV4cCI6MjA3MzU3MzY0MH0.C9r9aHUWkU0-Gkh2q3ecLYZ5pSiy0CaGJ2y9h8Dh9Kg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnoseAdminIssue() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DE PROBLEMAS DE ADMIN\n')

  try {
    // 1. Verificar acceso básico a profiles
    console.log('1️⃣ Probando acceso básico a la tabla profiles...')
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role, full_name')
      .limit(5)

    if (profilesError) {
      console.error('❌ Error accediendo a profiles:', profilesError.message)
      console.log('   Código:', profilesError.code)
      console.log('   Detalles:', profilesError.details)
    } else {
      console.log('✅ Acceso a profiles exitoso:', allProfiles?.length || 0, 'perfiles encontrados')
      allProfiles?.forEach(profile => {
        console.log(`   👤 ${profile.email} - Rol: ${profile.role || 'sin rol'}`)
      })
    }

    // 2. Buscar específicamente el perfil admin
    console.log('\n2️⃣ Buscando perfil de maikermicha15@gmail.com...')
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'maikermicha15@gmail.com')
      .single()

    if (adminError) {
      console.error('❌ Error buscando perfil admin:', adminError.message)
      if (adminError.code === 'PGRST116') {
        console.log('   🔍 El perfil no existe o no es accesible')
      }
    } else {
      console.log('✅ Perfil admin encontrado:')
      console.log('   📧 Email:', adminProfile.email)
      console.log('   🔑 Rol:', adminProfile.role)
      console.log('   👤 Nombre:', adminProfile.full_name)
      console.log('   🆔 ID:', adminProfile.id)
      console.log('   📅 Creado:', adminProfile.created_at)
    }

    // 3. Probar acceso a cursos
    console.log('\n3️⃣ Probando acceso a la tabla courses...')
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, instructor_id, is_published')
      .limit(5)

    if (coursesError) {
      console.error('❌ Error accediendo a courses:', coursesError.message)
      console.log('   Código:', coursesError.code)
      console.log('   Detalles:', coursesError.details)
    } else {
      console.log('✅ Acceso a courses exitoso:', courses?.length || 0, 'cursos encontrados')
      courses?.forEach(course => {
        console.log(`   📚 ${course.title} - Publicado: ${course.is_published}`)
      })
    }

    // 4. Probar acceso a lecciones
    console.log('\n4️⃣ Probando acceso a la tabla lessons...')
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, title, course_id')
      .limit(3)

    if (lessonsError) {
      console.error('❌ Error accediendo a lessons:', lessonsError.message)
      console.log('   Código:', lessonsError.code)
      console.log('   Detalles:', lessonsError.details)
    } else {
      console.log('✅ Acceso a lessons exitoso:', lessons?.length || 0, 'lecciones encontradas')
    }

    // 5. Verificar políticas RLS
    console.log('\n5️⃣ Verificando estado de RLS...')
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('check_rls_status')
      .select()

    if (rlsError) {
      console.log('⚠️  No se pudo verificar RLS automáticamente')
    }

    // 6. Intentar una operación de inserción simple
    console.log('\n6️⃣ Probando inserción en categories (debería funcionar)...')
    const { data: newCategory, error: insertError } = await supabase
      .from('categories')
      .insert({
        name: 'Categoría de Prueba - ' + Date.now(),
        slug: 'categoria-prueba-' + Date.now(),
        description: 'Categoría temporal para pruebas'
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Error insertando categoría:', insertError.message)
      console.log('   Código:', insertError.code)
    } else {
      console.log('✅ Inserción exitosa en categories')
      
      // Limpiar - eliminar la categoría de prueba
      await supabase
        .from('categories')
        .delete()
        .eq('id', newCategory.id)
      console.log('🧹 Categoría de prueba eliminada')
    }

    console.log('\n📊 RESUMEN DEL DIAGNÓSTICO:')
    console.log('- Si hay errores de RLS, las políticas están muy restrictivas')
    console.log('- Si no se encuentra el perfil admin, hay que crearlo/actualizarlo')
    console.log('- Si no se muestran cursos, las políticas de courses están bloqueando')
    
    console.log('\n💡 RECOMENDACIÓN:')
    console.log('Ejecuta fix-rls-simple.sql para políticas más permisivas')

  } catch (error) {
    console.error('❌ Error general en diagnóstico:', error.message)
  }
}

diagnoseAdminIssue()
