import { Link } from 'react-router-dom';
import { Calendar, ArrowLeft } from 'lucide-react';
import { LoginForm } from '@/components/Auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left — Gradient panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-500 p-12 flex-col justify-between overflow-hidden">
        {/* Background circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary-500/20 rounded-full translate-y-1/3 -translate-x-1/4" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">AppointmentHub</span>
        </div>

        {/* Content */}
        <div className="relative">
          <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Gestiona tus citas de forma inteligente
          </h1>
          <p className="text-primary-100 text-lg leading-relaxed mb-8">
            Automatiza recordatorios, sincroniza tu calendario y usa IA para ofrecer la mejor experiencia a tus clientes.
          </p>

          {/* Feature bullets */}
          <ul className="space-y-3">
            {[
              'Recordatorios automáticos por WhatsApp',
              'Sincronización con Google Calendar',
              'Chat con IA disponible 24/7',
              'Analytics en tiempo real',
            ].map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-primary-100">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">✓</span>
                </div>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonial */}
        <div className="relative bg-white/10 border border-white/20 rounded-2xl p-5 backdrop-blur-sm">
          <p className="text-white text-sm italic leading-relaxed mb-3">
            "Aumenté mis citas un 40% desde que empecé a usar AppointmentHub. Los clientes adoran la facilidad de reservar."
          </p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-white text-xs font-bold">
              CL
            </div>
            <div>
              <p className="text-white text-xs font-semibold">Carlos López</p>
              <p className="text-primary-200 text-xs">Médico Dermatólogo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Back to home */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              Appointment<span className="text-primary-600">Hub</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Bienvenido de vuelta</h2>
          <p className="text-gray-500 text-sm mb-8">
            Ingresa tus credenciales para continuar
          </p>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
