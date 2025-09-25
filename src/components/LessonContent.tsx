'use client'

import { LessonSection } from '@/types'
import ExerciseComponent from './ExerciseComponent'
import QuizComponent from './QuizComponent'

interface Props {
  sections: LessonSection[]
  objectives?: string[]
}

export default function LessonContent({ sections, objectives }: Props) {
  const renderSection = (section: LessonSection, index: number) => {
    switch (section.type) {
      case 'heading':
        return (
          <h2 key={index} className="text-2xl font-semibold text-gray-900 mb-4 mt-8 first:mt-0">
            {section.title}
          </h2>
        )
      
      case 'text':
        return (
          <p key={index} className="text-gray-700 leading-relaxed mb-4">
            {section.content}
          </p>
        )
      
      case 'code':
        return (
          <div key={index} className="mb-6">
            {section.title && (
              <h3 className="text-lg font-medium text-gray-900 mb-2">{section.title}</h3>
            )}
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100">
                <code className={`language-${section.language || 'html'}`}>
                  {section.content}
                </code>
              </pre>
            </div>
          </div>
        )
      
      case 'list':
        return (
          <div key={index} className="mb-4">
            {section.content && (
              <p className="text-gray-700 mb-2">{section.content}</p>
            )}
            <ul className="space-y-2 ml-4">
              {section.items?.map((item, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      
      case 'note':
        return (
          <div key={index} className="bg-blue-50 border-l-4 border-primary-400 p-4 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-primary-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                {section.title && (
                  <h4 className="text-sm font-medium text-primary-800 mb-1">{section.title}</h4>
                )}
                <p className="text-sm text-primary-700">{section.content}</p>
              </div>
            </div>
          </div>
        )
      
      case 'example':
        return (
          <div key={index} className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-emerald-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div>
                {section.title && (
                  <h4 className="text-sm font-medium text-emerald-800 mb-2">{section.title}</h4>
                )}
                <p className="text-sm text-emerald-700">{section.content}</p>
              </div>
            </div>
          </div>
        )
      
      case 'exercise':
        return section.exercise ? (
          <ExerciseComponent key={index} exercise={section.exercise} />
        ) : null
      
      case 'quiz':
        return section.quiz ? (
          <QuizComponent key={index} quiz={section.quiz} />
        ) : null
      
      default:
        return null
    }
  }

  return (
    <div className="prose max-w-none">
      <div className="space-y-4">
        {sections.map((section, index) => renderSection(section, index))}
        
        {objectives && objectives.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Objetivos de Aprendizaje</h3>
            <ul className="space-y-2">
              {objectives.map((objective, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
