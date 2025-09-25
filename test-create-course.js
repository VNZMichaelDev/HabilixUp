// Script de prueba para verificar la creación de cursos
// Ejecutar con: node test-create-course.js

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://jbvjvzryjpcewwublpjh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impidmp2enJ5anBjZXd3dWJscGpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5OTc2NDAsImV4cCI6MjA3MzU3MzY0MH0.C9r9aHUWkU0-Gkh2q3ecLYZ5pSiy0CaGJ2y9h8Dh9Kg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCourseCreation() {
  try {
    console.log('🔍 Verificando permisos de administrador...')
    
    // Verificar perfil admin
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

    if (profile.role !== 'admin') {
      console.log('❌ No tienes rol de administrador')
      return
    }

    console.log('🔍 Verificando categorías...')
    
    // Verificar categorías
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (categoriesError) {
      console.error('❌ Error obteniendo categorías:', categoriesError.message)
      return
    }

    console.log('✅ Categorías encontradas:', categories?.length || 0)
    categories?.forEach(cat => {
      console.log('   📂', cat.name, `(${cat.slug})`)
    })

    if (!categories || categories.length === 0) {
      console.log('⚠️  No hay categorías. Creando categorías básicas...')
      
      const { error: insertError } = await supabase
        .from('categories')
        .insert([
          { name: 'Desarrollo Web', slug: 'desarrollo-web', description: 'Aprende a crear sitios web' },
          { name: 'Diseño', slug: 'diseno', description: 'Diseño gráfico y UX/UI' },
          { name: 'Marketing Digital', slug: 'marketing-digital', description: 'Marketing online' }
        ])

      if (insertError) {
        console.error('❌ Error creando categorías:', insertError.message)
      } else {
        console.log('✅ Categorías creadas exitosamente')
      }
    }

    console.log('🧪 Probando creación de curso de prueba...')
    
    // Intentar crear un curso de prueba
    const testCourse = {
      title: 'Curso de Prueba - ' + new Date().toISOString(),
      description: 'Este es un curso de prueba creado automáticamente',
      short_description: 'Curso de prueba',
      category_id: categories?.[0]?.id,
      price: 0,
      duration: '2 semanas',
      level: 'Principiante',
      is_published: false,
      instructor_id: profile.id,
      rating: 0,
      students_count: 0
    }

    const { data: newCourse, error: courseError } = await supabase
      .from('courses')
      .insert(testCourse)
      .select()
      .single()

    if (courseError) {
      console.error('❌ Error creando curso:', courseError.message)
      console.log('Detalles del error:', courseError)
    } else {
      console.log('🎉 ¡Curso creado exitosamente!')
      console.log('   📚 ID:', newCourse.id)
      console.log('   📝 Título:', newCourse.title)
      
      // Limpiar - eliminar el curso de prueba
      console.log('🧹 Limpiando curso de prueba...')
      await supabase
        .from('courses')
        .delete()
        .eq('id', newCourse.id)
      console.log('✅ Curso de prueba eliminado')
    }

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

testCourseCreation()
