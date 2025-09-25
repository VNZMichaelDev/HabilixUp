// Esquemas de validación para HabilixUp
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export class ValidationService {
  // Validar email
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = []
    
    if (!email) {
      errors.push('El email es requerido')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('El formato del email no es válido')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validar nombre completo
  static validateFullName(fullName: string): ValidationResult {
    const errors: string[] = []
    
    if (!fullName) {
      errors.push('El nombre completo es requerido')
    } else if (fullName.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres')
    } else if (fullName.trim().length > 100) {
      errors.push('El nombre no puede exceder 100 caracteres')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validar contraseña
  static validatePassword(password: string): ValidationResult {
    const errors: string[] = []
    
    if (!password) {
      errors.push('La contraseña es requerida')
    } else {
      if (password.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres')
      }
      if (!/(?=.*[a-z])/.test(password)) {
        errors.push('La contraseña debe contener al menos una letra minúscula')
      }
      if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('La contraseña debe contener al menos una letra mayúscula')
      }
      if (!/(?=.*\d)/.test(password)) {
        errors.push('La contraseña debe contener al menos un número')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validar código de verificación
  static validateVerificationCode(code: string): ValidationResult {
    const errors: string[] = []
    
    if (!code) {
      errors.push('El código de verificación es requerido')
    } else if (!/^[A-Z0-9]{8}$/.test(code)) {
      errors.push('El código debe tener 8 caracteres alfanuméricos en mayúsculas')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validar URL
  static validateUrl(url: string): ValidationResult {
    const errors: string[] = []
    
    if (!url) {
      errors.push('La URL es requerida')
    } else {
      try {
        new URL(url)
      } catch {
        errors.push('El formato de la URL no es válido')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validar datos de perfil completo
  static validateProfile(profile: {
    email?: string
    fullName?: string
    avatarUrl?: string
  }): ValidationResult {
    const errors: string[] = []

    if (profile.email) {
      const emailValidation = this.validateEmail(profile.email)
      if (!emailValidation.isValid) {
        errors.push(...emailValidation.errors)
      }
    }

    if (profile.fullName) {
      const nameValidation = this.validateFullName(profile.fullName)
      if (!nameValidation.isValid) {
        errors.push(...nameValidation.errors)
      }
    }

    if (profile.avatarUrl) {
      const urlValidation = this.validateUrl(profile.avatarUrl)
      if (!urlValidation.isValid) {
        errors.push(...urlValidation.errors.map(e => `Avatar URL: ${e}`))
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Sanitizar texto para prevenir XSS
  static sanitizeText(text: string): string {
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  // Validar entrada de búsqueda
  static validateSearchQuery(query: string): ValidationResult {
    const errors: string[] = []
    
    if (!query) {
      errors.push('La consulta de búsqueda no puede estar vacía')
    } else if (query.length < 2) {
      errors.push('La búsqueda debe tener al menos 2 caracteres')
    } else if (query.length > 100) {
      errors.push('La búsqueda no puede exceder 100 caracteres')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Funciones de utilidad para validación rápida
export const isValidEmail = (email: string): boolean => 
  ValidationService.validateEmail(email).isValid

export const isValidPassword = (password: string): boolean => 
  ValidationService.validatePassword(password).isValid

export const isValidVerificationCode = (code: string): boolean => 
  ValidationService.validateVerificationCode(code).isValid

export const sanitize = (text: string): string => 
  ValidationService.sanitizeText(text)
