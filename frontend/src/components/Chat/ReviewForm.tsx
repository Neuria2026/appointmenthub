import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Star, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { reviewSchema, type ReviewFormValues } from '@/utils/validators';
import { API_BASE_URL, TOKEN_KEY } from '@/utils/constants';

interface ReviewFormProps {
  appointmentId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ appointmentId, onSuccess, onCancel }: ReviewFormProps) {
  const queryClient = useQueryClient();
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0 },
  });

  const selectedRating = watch('rating');

  const createReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await axios.post(
        `${API_BASE_URL}/api/appointments/${appointmentId}/reviews`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', appointmentId] });
      setSubmitted(true);
      toast.success('¡Reseña enviada!');
      onSuccess?.();
    },
    onError: () => {
      toast.error('Error al enviar la reseña');
    },
  });

  if (submitted) {
    return (
      <div className="text-center py-8 space-y-3">
        <div className="w-14 h-14 bg-success-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-7 h-7 text-success-600" />
        </div>
        <h3 className="text-base font-semibold text-gray-900">¡Gracias por tu reseña!</h3>
        <p className="text-sm text-gray-500">Tu opinión nos ayuda a mejorar el servicio.</p>
      </div>
    );
  }

  const ratingLabels = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];

  return (
    <form onSubmit={handleSubmit((data) => createReviewMutation.mutate(data))} className="space-y-5">
      <div className="text-center">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Califica tu experiencia</h3>
        <p className="text-sm text-gray-500">¿Cómo fue tu cita?</p>
      </div>

      {/* Star Rating */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setValue('rating', star)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <Star
                className={clsx(
                  'w-9 h-9 transition-colors',
                  (hoverRating || selectedRating) >= star
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-200 fill-gray-200'
                )}
              />
            </button>
          ))}
        </div>
        {(hoverRating || selectedRating) > 0 && (
          <p className="text-sm font-medium text-amber-600">
            {ratingLabels[hoverRating || selectedRating]}
          </p>
        )}
        {errors.rating && <p className="error-text">{errors.rating.message}</p>}
      </div>

      {/* Comment */}
      <div>
        <label className="label-base">Comentario (opcional)</label>
        <textarea
          rows={4}
          placeholder="Cuéntanos más sobre tu experiencia..."
          className={clsx(errors.comment ? 'input-error' : 'input-base', 'resize-none')}
          {...register('comment')}
        />
        {errors.comment && <p className="error-text">{errors.comment.message}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost flex-1 py-2.5">
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={createReviewMutation.isPending || !selectedRating}
          className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5"
        >
          {createReviewMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Enviar Reseña'
          )}
        </button>
      </div>
    </form>
  );
}
