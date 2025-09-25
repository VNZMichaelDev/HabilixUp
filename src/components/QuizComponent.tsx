'use client'

import { useState } from 'react'
import { Quiz } from '@/types'

interface Props {
  quiz: Quiz
}

export default function QuizComponent({ quiz }: Props) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      setShowResult(true)
    }
  }

  const isCorrect = selectedAnswer === quiz.correctAnswer

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 my-6">
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-purple-900 mb-3">
          🧠 Quiz: {quiz.question}
        </h4>
      </div>

      <div className="space-y-3 mb-4">
        {quiz.options.map((option, index) => (
          <label 
            key={index} 
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition ${
              showResult 
                ? index === quiz.correctAnswer 
                  ? 'bg-green-100 border border-green-300' 
                  : selectedAnswer === index 
                    ? 'bg-red-100 border border-red-300' 
                    : 'bg-white border border-gray-200'
                : selectedAnswer === index 
                  ? 'bg-purple-100 border border-purple-300' 
                  : 'bg-white border border-gray-200 hover:bg-purple-50'
            }`}
          >
            <input
              type="radio"
              name={`quiz-${quiz.id}`}
              value={index}
              checked={selectedAnswer === index}
              onChange={(e) => setSelectedAnswer(parseInt(e.target.value))}
              disabled={showResult}
              className="text-purple-600 focus:ring-purple-500"
            />
            <span className={`flex-1 ${
              showResult && index === quiz.correctAnswer 
                ? 'text-green-800 font-medium' 
                : showResult && selectedAnswer === index && !isCorrect
                  ? 'text-red-800'
                  : 'text-gray-700'
            }`}>
              {option}
            </span>
            {showResult && index === quiz.correctAnswer && (
              <span className="text-green-600">✅</span>
            )}
            {showResult && selectedAnswer === index && !isCorrect && (
              <span className="text-red-600">❌</span>
            )}
          </label>
        ))}
      </div>

      {!showResult ? (
        <button
          onClick={handleSubmit}
          disabled={selectedAnswer === null}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Verificar Respuesta
        </button>
      ) : (
        <div className={`p-4 rounded-lg ${
          isCorrect ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
        }`}>
          <p className={`font-medium mb-2 ${
            isCorrect ? 'text-green-800' : 'text-red-800'
          }`}>
            {isCorrect ? '🎉 ¡Correcto!' : '❌ Incorrecto'}
          </p>
          <p className="text-gray-700 text-sm">
            <strong>Explicación:</strong> {quiz.explanation}
          </p>
        </div>
      )}
    </div>
  )
}
