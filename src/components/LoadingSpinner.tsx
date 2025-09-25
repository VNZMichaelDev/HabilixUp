interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  fullScreen?: boolean
  className?: string
}

export default function LoadingSpinner({ 
  size = 'md', 
  message = 'Cargando...', 
  fullScreen = false,
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  const containerClasses = fullScreen 
    ? 'min-h-screen bg-gray-50 flex items-center justify-center'
    : 'flex items-center justify-center p-4'

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-primary-600 mx-auto mb-4 ${sizeClasses[size]}`}></div>
        {message && (
          <p className="text-gray-600 text-sm">{message}</p>
        )}
      </div>
    </div>
  )
}
