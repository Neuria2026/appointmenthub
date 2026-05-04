import { Link } from 'react-router-dom';
import { Calendar, Zap, ArrowLeft } from 'lucide-react';
import { RegisterForm } from '@/components/Auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left — Gradient panel */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-gradient-to-br from-secondary-600 via-primary-600 to-primary-700 p-12 flex-col justify-between overflow-hidden">
        {/* Decorations */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-secondary-400/20 rounded-full translate-x-1/4 translate-y-1/4" />

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">AppointmentHub</span>
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-white text-xs font-medium mb-5 border border-white/20">
            <Zap className="w-3 h-3 text-yellow-300" />
            14 días gratis en Premium
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-4 leading-tight">
            Únete a más de 2,000 profesionales
          </h1>
          <p className="text-primary-100 text-base leading-relaxed">
            Empieza gratis y escala tu negocio con herramientas de IA, automatización y analítica.
          </p>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-2 gap-4">
          {[
            { value: '2,000+', label: 'Profesionales activos' },
            { value: '50,000+', label: 'Citas gestionadas' },
            { value: '98%', label: 'Satisfacción' },
            { value: '40%', label: 'Más eficiencia' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white/10 rounded-xl p-3 border border-white/20">
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-xs text-primary-200">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Back to home */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              Appointment<span className="text-primary-600">Hub</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Crear cuenta gratis</h2>
          <p className="text-gray-500 text-sm mb-6">
            Empieza a gestionar tus citas en minutos
          </p>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
