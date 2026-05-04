import { useState } from 'react';
import { Loader2, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

interface SurveyQuestion {
  id: string;
  question: string;
  type: 'radio' | 'textarea';
  options?: string[];
}

const QUESTIONS: SurveyQuestion[] = [
  {
    id: 'ease_of_use',
    question: '¿Qué tan fácil fue usar la plataforma?',
    type: 'radio',
    options: ['Muy difícil', 'Difícil', 'Regular', 'Fácil', 'Muy fácil'],
  },
  {
    id: 'booking_experience',
    question: '¿Cómo calificarías la experiencia de reserva?',
    type: 'radio',
    options: ['Muy mala', 'Mala', 'Regular', 'Buena', 'Excelente'],
  },
  {
    id: 'notifications',
    question: '¿Fueron útiles las notificaciones de recordatorio?',
    type: 'radio',
    options: ['Nada útiles', 'Poco útiles', 'Neutral', 'Útiles', 'Muy útiles'],
  },
  {
    id: 'open_feedback',
    question: '¿Tienes algún comentario o sugerencia?',
    type: 'textarea',
  },
];

interface FeedbackSurveyProps {
  appointmentId?: string;
  onComplete?: () => void;
  onDismiss?: () => void;
}

export function FeedbackSurvey({ appointmentId: _appointmentId, onComplete, onDismiss }: FeedbackSurveyProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const currentQuestion = QUESTIONS[currentStep];
  const isLastStep = currentStep === QUESTIONS.length - 1;
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((s) => Math.max(0, s - 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Submit survey answers (mock for now)
      await new Promise((r) => setTimeout(r, 800));
      setIsDone(true);
      toast.success('¡Gracias por tu feedback!');
      setTimeout(() => onComplete?.(), 1500);
    } catch {
      toast.error('Error al enviar el feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDone) {
    return (
      <div className="text-center py-8 space-y-3">
        <div className="w-14 h-14 bg-success-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-7 h-7 text-success-600" />
        </div>
        <h3 className="text-base font-semibold text-gray-900">¡Gracias!</h3>
        <p className="text-sm text-gray-500">Tu feedback es muy valioso para nosotros.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
          <span>Pregunta {currentStep + 1} de {QUESTIONS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="space-y-4 min-h-[160px]">
        <p className="text-base font-medium text-gray-900">{currentQuestion.question}</p>

        {currentQuestion.type === 'radio' && currentQuestion.options && (
          <div className="space-y-2">
            {currentQuestion.options.map((option) => (
              <label
                key={option}
                className={clsx(
                  'flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all',
                  answers[currentQuestion.id] === option
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                )}
              >
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option}
                  checked={answers[currentQuestion.id] === option}
                  onChange={() => handleAnswer(option)}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span
                  className={clsx(
                    'text-sm font-medium',
                    answers[currentQuestion.id] === option
                      ? 'text-primary-700'
                      : 'text-gray-700'
                  )}
                >
                  {option}
                </span>
              </label>
            ))}
          </div>
        )}

        {currentQuestion.type === 'textarea' && (
          <textarea
            rows={4}
            placeholder="Escribe aquí tu comentario..."
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            className="input-base resize-none"
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        {currentStep > 0 && (
          <button
            type="button"
            onClick={handlePrev}
            className="btn-ghost flex items-center gap-1.5 px-4 py-2.5"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
        )}

        <div className="flex-1" />

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-sm text-gray-400 hover:text-gray-600 px-3"
          >
            Omitir
          </button>
        )}

        {isLastStep ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary flex items-center gap-2 px-6 py-2.5"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Enviar'
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={currentQuestion.type === 'radio' && !answers[currentQuestion.id]}
            className="btn-primary flex items-center gap-1.5 px-6 py-2.5"
          >
            Siguiente <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
