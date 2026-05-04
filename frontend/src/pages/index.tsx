import { Link } from 'react-router-dom';
import {
  Calendar,
  MessageSquare,
  Bell,
  Shield,
  Zap,
  Users,
  Star,
  Check,
  ArrowRight,
  ChevronRight,
  Smartphone,
  Clock,
  BarChart,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Calendar,
    title: 'Gestión de Citas',
    description: 'Reserva, modifica y cancela citas fácilmente desde cualquier dispositivo.',
    color: 'bg-primary-100 text-primary-600',
  },
  {
    icon: Bell,
    title: 'Recordatorios Inteligentes',
    description: 'Recibe avisos vía WhatsApp, Telegram o email para nunca olvidar una cita.',
    color: 'bg-secondary-100 text-secondary-600',
  },
  {
    icon: MessageSquare,
    title: 'Chat con IA',
    description: 'Asistente inteligente disponible 24/7 para responder preguntas y gestionar reservas.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Calendar,
    title: 'Google Calendar',
    description: 'Sincronización automática con tu Google Calendar para mantener todo organizado.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: BarChart,
    title: 'Analytics',
    description: 'Analítica detallada de tu negocio: ingresos, tendencias y métricas clave.',
    color: 'bg-success-100 text-success-600',
  },
  {
    icon: Shield,
    title: 'Seguro y Confiable',
    description: 'Tus datos protegidos con cifrado de extremo a extremo y backups automáticos.',
    color: 'bg-amber-100 text-amber-600',
  },
];

const STEPS = [
  { number: '01', title: 'Crea tu cuenta', description: 'Regístrate gratis como cliente o proveedor en menos de 2 minutos.' },
  { number: '02', title: 'Configura tu perfil', description: 'Agrega tus servicios, horarios disponibles y canales de notificación.' },
  { number: '03', title: 'Recibe o agenda citas', description: 'Los clientes pueden reservar en línea; tú recibes confirmación al instante.' },
  { number: '04', title: 'Gestiona y crece', description: 'Usa el dashboard y analytics para optimizar tu agenda y aumentar ingresos.' },
];

const TESTIMONIALS = [
  {
    name: 'Sofía Martínez',
    role: 'Nutrióloga',
    avatar: 'SM',
    text: 'AppointmentHub transformó mi clínica. Antes perdía tiempo con llamadas, ahora todo es automático. Mis clientes aman los recordatorios de WhatsApp.',
    rating: 5,
  },
  {
    name: 'Carlos López',
    role: 'Médico Dermatólogo',
    avatar: 'CL',
    text: 'El chat con IA es increíble. Mis pacientes pueden agendar 24/7 y yo recibo solo las citas confirmadas. Aumenté mis consultas un 40%.',
    rating: 5,
  },
  {
    name: 'Ana García',
    role: 'Estilista',
    avatar: 'AG',
    text: 'Simple, bonita y funcional. La sincronización con Google Calendar me salva la vida. Recomiendo AppointmentHub a todos mis colegas.',
    rating: 5,
  },
];

const PRICING = [
  {
    name: 'Básico',
    price: 'Gratis',
    period: 'para siempre',
    description: 'Para empezar a gestionar tus citas',
    features: ['Hasta 20 citas/mes', '1 servicio', 'Notificaciones por email', 'Dashboard básico', 'Soporte por chat'],
    cta: 'Empezar gratis',
    highlighted: false,
  },
  {
    name: 'Premium',
    price: '$29',
    period: '/mes',
    description: 'Para profesionales en crecimiento',
    features: [
      'Citas ilimitadas',
      'Servicios ilimitados',
      'WhatsApp + Telegram + Email',
      'Chat con IA incluido',
      'Google Calendar sync',
      'Analytics avanzado',
      'Soporte prioritario',
    ],
    cta: 'Empezar 14 días gratis',
    highlighted: true,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">
                Appointment<span className="text-primary-600">Hub</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <a href="#features" className="hover:text-gray-900 transition-colors">Características</a>
              <a href="#how-it-works" className="hover:text-gray-900 transition-colors">Cómo funciona</a>
              <a href="#pricing" className="hover:text-gray-900 transition-colors">Precios</a>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">
                Iniciar sesión
              </Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">
                Crear cuenta gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-secondary-600">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-white text-xs font-medium mb-8 backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
              Potenciado por Inteligencia Artificial
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Gestión de Citas{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-secondary-300">
                Inteligente
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-primary-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              La plataforma todo-en-uno para profesionales y negocios. Automatiza reservas,
              recordatorios y análisis con IA para hacer crecer tu negocio.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="flex items-center gap-2 bg-white text-primary-700 hover:bg-primary-50 font-bold px-8 py-4 rounded-xl text-base transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                Empezar gratis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl text-base border border-white/30 transition-all"
              >
                Ver demo
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-primary-200 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {['A', 'B', 'C', 'D'].map((l) => (
                    <div key={l} className="w-7 h-7 rounded-full bg-primary-400 border-2 border-primary-700 flex items-center justify-center text-white text-xs font-bold">
                      {l}
                    </div>
                  ))}
                </div>
                <span>+2,000 profesionales confían en nosotros</span>
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((s) => <Star key={s} className="w-4 h-4 text-yellow-300 fill-yellow-300" />)}
                <span className="ml-1">4.9/5 calificación</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-primary-600 text-sm font-semibold uppercase tracking-wider">Características</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-4">
            Todo lo que necesitas en un solo lugar
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Desde la reserva hasta el análisis, AppointmentHub cubre cada aspecto de tu negocio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description, color }) => (
            <div key={title} className="p-6 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-primary-600 text-sm font-semibold uppercase tracking-wider">Proceso</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-4">
              Empieza en 4 simples pasos
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ number, title, description }) => (
              <div key={number} className="relative">
                <div className="text-5xl font-black text-primary-100 mb-4 leading-none">{number}</div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-primary-600 text-sm font-semibold uppercase tracking-wider">Precios</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-4">
            Planes para cada necesidad
          </h2>
          <p className="text-lg text-gray-500">Empieza gratis, escala cuando estés listo.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {PRICING.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-primary-600 to-secondary-500 text-white ring-2 ring-primary-400 ring-offset-2'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="mb-6">
                <h3 className={`text-lg font-bold mb-1 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-extrabold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className={plan.highlighted ? 'text-primary-200' : 'text-gray-400'}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${plan.highlighted ? 'text-primary-100' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      plan.highlighted ? 'bg-white/20' : 'bg-primary-100'
                    }`}>
                      <Check className={`w-3 h-3 ${plan.highlighted ? 'text-white' : 'text-primary-600'}`} />
                    </div>
                    <span className={`text-sm ${plan.highlighted ? 'text-white' : 'text-gray-700'}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`block text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all ${
                  plan.highlighted
                    ? 'bg-white text-primary-700 hover:bg-primary-50 shadow-lg'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-primary-600 text-sm font-semibold uppercase tracking-wider">Testimonios</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-4">
              Lo que dicen nuestros usuarios
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, avatar, text, rating }) => (
              <div key={name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-0.5 mb-3">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-5">{text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-sm font-bold">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{name}</p>
                    <p className="text-xs text-gray-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-500">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            ¿Listo para transformar tu negocio?
          </h2>
          <p className="text-lg text-primary-100 mb-8">
            Únete a más de 2,000 profesionales que ya usan AppointmentHub para crecer.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="flex items-center gap-2 bg-white text-primary-700 hover:bg-primary-50 font-bold px-8 py-4 rounded-xl text-base shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              Crear cuenta gratis
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-primary-200 text-xs mt-4">
            Sin tarjeta de crédito. Cancela cuando quieras.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold">AppointmentHub</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Términos</a>
              <a href="#" className="hover:text-white transition-colors">Contacto</a>
            </div>
            <p className="text-xs">© {new Date().getFullYear()} AppointmentHub. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
