// Script de prueba rápida para verificar el acceso de administrador
// Ejecutar con: node test-admin.js

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://jbvjvzryjpcewwublpjh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impidmp2enJ5anBjZXd3dWJscGpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5OTc2NDAsImV4cCI6MjA3MzU3MzY0MH0.C9r9aHUWkU0-Gkh2q3ecLYZ5pSiy0CaGJ2y9h8Dh9Kg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAdminAccess() {
  try {
    console.log('🔍 Verificando perfil de administrador...')
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, full_name')
      .eq('email', 'maikermicha15@gmail.com')
      .single()

    if (error) {
      console.error('❌ Error:', error.message)
      return
    }

    if (!data) {
      console.log('❌ Perfil no encontrado')
      return
    }

    console.log('✅ Perfil encontrado:')
    console.log('   📧 Email:', data.email)
    console.log('   👤 Nombre:', data.full_name)
    console.log('   🔑 Rol:', data.role)
    console.log('   🆔 ID:', data.id)

    if (data.role === 'admin') {
      console.log('🎉 ¡PERFECTO! Tienes acceso de administrador')
    } else {
      console.log('⚠️  El rol no es admin, actualizando...')
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('email', 'maikermicha15@gmail.com')

      if (updateError) {
        console.error('❌ Error actualizando:', updateError.message)
      } else {
        console.log('✅ Rol actualizado a admin')
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

testAdminAccess()
