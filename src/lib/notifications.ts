// Sistema de notificaciones para HabilixUp
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface NotificationOptions {
  type?: NotificationType
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export class NotificationService {
  private static instance: NotificationService
  private notifications: Set<HTMLElement> = new Set()

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  show(message: string, options: NotificationOptions = {}): void {
    const {
      type = 'info',
      duration = 4000,
      position = 'top-right'
    } = options

    const notification = this.createNotification(message, type, position)
    document.body.appendChild(notification)
    this.notifications.add(notification)

    // Animación de entrada
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)'
      notification.style.opacity = '1'
    })

    // Auto-remove
    setTimeout(() => {
      this.remove(notification)
    }, duration)

    // Click to dismiss
    notification.addEventListener('click', () => {
      this.remove(notification)
    })
  }

  success(message: string, duration?: number): void {
    this.show(message, { type: 'success', duration })
  }

  error(message: string, duration?: number): void {
    this.show(message, { type: 'error', duration: duration || 6000 })
  }

  warning(message: string, duration?: number): void {
    this.show(message, { type: 'warning', duration })
  }

  info(message: string, duration?: number): void {
    this.show(message, { type: 'info', duration })
  }

  private createNotification(message: string, type: NotificationType, position: string): HTMLElement {
    const notification = document.createElement('div')
    
    // Aplicar estilos directamente para evitar problemas con Tailwind
    const positionStyles = this.getPositionStyles(position)
    const colorStyles = this.getColorStyles(type)
    const icon = this.getIcon(type)
    
    // Estilos base aplicados directamente
    Object.assign(notification.style, {
      position: 'fixed',
      padding: '16px 24px',
      borderRadius: '12px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      zIndex: '9999',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      maxWidth: '400px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '14px',
      fontWeight: '600',
      color: 'white',
      transform: 'translateX(100%)',
      opacity: '0',
      backdropFilter: 'blur(8px)',
      ...positionStyles,
      ...colorStyles
    })
    
    // Crear contenido usando DOM en lugar de innerHTML
    const container = document.createElement('div')
    container.style.display = 'flex'
    container.style.alignItems = 'center'
    container.style.gap = '12px'
    
    // Icono
    const iconSpan = document.createElement('span')
    iconSpan.textContent = icon
    iconSpan.style.fontSize = '24px'
    iconSpan.style.flexShrink = '0'
    
    // Mensaje
    const messageDiv = document.createElement('div')
    messageDiv.style.flex = '1'
    messageDiv.style.minWidth = '0'
    messageDiv.style.wordBreak = 'break-words'
    messageDiv.textContent = message
    
    // Botón cerrar
    const closeButton = document.createElement('button')
    closeButton.textContent = '×'
    closeButton.style.background = 'none'
    closeButton.style.border = 'none'
    closeButton.style.color = 'white'
    closeButton.style.fontSize = '20px'
    closeButton.style.fontWeight = 'bold'
    closeButton.style.cursor = 'pointer'
    closeButton.style.opacity = '0.7'
    closeButton.style.transition = 'opacity 0.2s'
    closeButton.style.flexShrink = '0'
    
    closeButton.onmouseover = () => closeButton.style.opacity = '1'
    closeButton.onmouseout = () => closeButton.style.opacity = '0.7'
    
    container.appendChild(iconSpan)
    container.appendChild(messageDiv)
    container.appendChild(closeButton)
    notification.appendChild(container)

    return notification
  }

  private getPositionStyles(position: string): Partial<CSSStyleDeclaration> {
    switch (position) {
      case 'top-right':
        return { top: '16px', right: '16px' }
      case 'top-left':
        return { top: '16px', left: '16px' }
      case 'bottom-right':
        return { bottom: '16px', right: '16px' }
      case 'bottom-left':
        return { bottom: '16px', left: '16px' }
      default:
        return { top: '16px', right: '16px' }
    }
  }

  private getColorStyles(type: NotificationType): Partial<CSSStyleDeclaration> {
    switch (type) {
      case 'success':
        return {
          background: 'linear-gradient(to right, #10b981, #059669)',
          borderLeft: '4px solid #6ee7b7'
        }
      case 'error':
        return {
          background: 'linear-gradient(to right, #ef4444, #dc2626)',
          borderLeft: '4px solid #fca5a5'
        }
      case 'warning':
        return {
          background: 'linear-gradient(to right, #f59e0b, #ea580c)',
          borderLeft: '4px solid #fcd34d'
        }
      case 'info':
        return {
          background: 'linear-gradient(to right, #3b82f6, #2563eb)',
          borderLeft: '4px solid #93c5fd'
        }
      default:
        return {
          background: 'linear-gradient(to right, #6b7280, #4b5563)',
          borderLeft: '4px solid #d1d5db'
        }
    }
  }

  private getIcon(type: NotificationType): string {
    switch (type) {
      case 'success':
        return '🎉'
      case 'error':
        return '🚨'
      case 'warning':
        return '⚠️'
      case 'info':
        return '💡'
      default:
        return '📢'
    }
  }

  private remove(notification: HTMLElement): void {
    if (!this.notifications.has(notification)) return

    notification.style.transform = 'translateX(100%)'
    notification.style.opacity = '0'

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
      this.notifications.delete(notification)
    }, 300)
  }

  clearAll(): void {
    this.notifications.forEach(notification => {
      this.remove(notification)
    })
  }
}

// Instancia singleton
export const notify = NotificationService.getInstance()

// Funciones de conveniencia
export const showSuccess = (message: string, duration?: number) => notify.success(message, duration)
export const showError = (message: string, duration?: number) => notify.error(message, duration)
export const showWarning = (message: string, duration?: number) => notify.warning(message, duration)
export const showInfo = (message: string, duration?: number) => notify.info(message, duration)
