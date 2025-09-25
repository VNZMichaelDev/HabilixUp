'use client'

import { useState } from 'react'
import { Exercise } from '@/types'

interface Props {
  exercise: Exercise
}

export default function ExerciseComponent({ exercise }: Props) {
  const [userAnswer, setUserAnswer] = useState('')
  const [showSolution, setShowSolution] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [currentHint, setCurrentHint] = useState(0)

  const checkAnswer = () => {
    if (exercise.type === 'multiple-choice') {
      return userAnswer === exercise.correctAnswer?.toString()
    }
    if (exercise.type === 'fill-blank') {
      return userAnswer.toLowerCase().trim() === exercise.correctAnswer?.toString().toLowerCase()
    }
    return false
  }

  const isCorrect = userAnswer && checkAnswer()

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 my-4 sm:my-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-3 sm:space-y-0">
        <div className="flex-1">
          <h4 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">
            🎯 Ejercicio: {exercise.title}
          </h4>
          <p className="text-sm sm:text-base text-blue-800 mb-4">{exercise.description}</p>
        </div>
        <div className="flex flex-row sm:flex-col lg:flex-row space-x-2 sm:space-x-0 sm:space-y-2 lg:space-y-0 lg:space-x-2 flex-shrink-0">
          {exercise.hints && exercise.hints.length > 0 && (
            <button
              onClick={() => {
                setShowHint(!showHint)
                if (!showHint) setCurrentHint(0)
              }}
              className="px-3 py-1 bg-yellow-500 text-white rounded text-xs sm:text-sm hover:bg-yellow-600 transition flex-1 sm:flex-none"
            >
              💡 Pista
            </button>
          )}
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="px-3 py-1 bg-green-500 text-white rounded text-xs sm:text-sm hover:bg-green-600 transition flex-1 sm:flex-none"
          >
            ✅ Solución
          </button>
        </div>
      </div>

      {/* Mostrar pista */}
      {showHint && exercise.hints && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
          <p className="text-yellow-800 text-sm">
            <strong>💡 Pista {currentHint + 1}:</strong> {exercise.hints[currentHint]}
          </p>
          {currentHint < exercise.hints.length - 1 && (
            <button
              onClick={() => setCurrentHint(currentHint + 1)}
              className="mt-2 text-xs text-yellow-600 hover:text-yellow-800"
            >
              Siguiente pista →
            </button>
          )}
        </div>
      )}

      {/* Ejercicio según tipo */}
      {exercise.type === 'code' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escribe tu código:
            </label>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder={exercise.initialCode || "// Escribe tu código aquí"}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {exercise.expectedOutput && (
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">
                <strong>Resultado esperado:</strong> {exercise.expectedOutput}
              </p>
            </div>
          )}
        </div>
      )}

      {exercise.type === 'multiple-choice' && (
        <div className="space-y-3">
          {exercise.options?.map((option, index) => (
            <label key={index} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name={`exercise-${exercise.id}`}
                value={index}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}

      {exercise.type === 'fill-blank' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tu respuesta:
          </label>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Escribe tu respuesta aquí..."
          />
        </div>
      )}

      {/* Feedback */}
      {userAnswer && (
        <div className={`mt-4 p-3 rounded ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`text-sm font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
            {isCorrect ? '🎉 ¡Correcto! Excelente trabajo.' : '❌ Incorrecto. Inténtalo de nuevo.'}
          </p>
        </div>
      )}

      {/* Solución */}
      {showSolution && exercise.solution && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded p-4">
          <h5 className="font-semibold text-green-900 mb-2">✅ Solución:</h5>
          <pre className="bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
            <code>{exercise.solution}</code>
          </pre>
        </div>
      )}
    </div>
  )
}
