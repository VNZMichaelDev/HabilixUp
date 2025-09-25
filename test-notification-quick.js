// Script para probar las notificaciones rápidamente en la consola del navegador
// Copia y pega este código en la consola del navegador (F12 -> Console)

// Función para crear notificación de prueba
function testNotification() {
  // Simular el sistema de notificaciones
  const notification = document.createElement('div');
  
  // Estilos aplicados directamente
  Object.assign(notification.style, {
    position: 'fixed',
    top: '16px',
    right: '16px',
    padding: '16px 24px',
    borderRadius: '12px',
    background: 'linear-gradient(to right, #ef4444, #dc2626)',
    borderLeft: '4px solid #fca5a5',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    zIndex: '9999',
    color: 'white',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '14px',
    fontWeight: '600',
    maxWidth: '400px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  });
  
  // Contenido
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.gap = '12px';
  
  const icon = document.createElement('span');
  icon.textContent = '🚨';
  icon.style.fontSize = '24px';
  
  const message = document.createElement('div');
  message.textContent = 'Error al crear la lección. Verifica los datos e intenta nuevamente.';
  message.style.flex = '1';
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.background = 'none';
  closeBtn.style.border = 'none';
  closeBtn.style.color = 'white';
  closeBtn.style.fontSize = '20px';
  closeBtn.style.cursor = 'pointer';
  
  container.appendChild(icon);
  container.appendChild(message);
  container.appendChild(closeBtn);
  notification.appendChild(container);
  
  // Agregar al DOM
  document.body.appendChild(notification);
  
  // Animación de entrada
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
    notification.style.opacity = '1';
  }, 10);
  
  // Auto-remover después de 5 segundos
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 5000);
  
  // Cerrar al hacer clic
  notification.onclick = () => {
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  };
  
  console.log('✅ Notificación de prueba creada!');
}

// Ejecutar la prueba
testNotification();

console.log('🎯 Si ves una notificación roja con 🚨 en la esquina superior derecha, ¡funciona perfectamente!');
