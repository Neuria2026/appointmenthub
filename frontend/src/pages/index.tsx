import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MessageSquare,
  Bell,
  Shield,
  Zap,
  Star,
  Check,
  ArrowRight,
  ChevronDown,
  BarChart,
  Clock,
  Smartphone,
  Globe,
  Users,
  Menu,
  X,
} from 'lucide-react';
import { APP_NAME } from '@/utils/constants';

const FEATURES = [
  {
    icon: Calendar,
    title: 'Agenda inteligente',
    description: 'Reservas online 24/7. Tus clientes agendan sin llamadas, tú recibes confirmaciones al instante.',
    color: 'bg-primary-100 text-primary-600',
  },
  {
    icon: Bell,
    title: 'Recordatorios automáticos',
    description: 'WhatsApp, Telegram o email. Reduce las ausencias hasta un 80% con avisos personalizados.',
    color: 'bg-secondary-100 text-secondary-600',
  },
  {
    icon: MessageSquare,
    title: 'Asistente IA 24/7',
    description: 'Chat con inteligencia artificial que responde dudas y gestiona reservas mientras duermes.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Globe,
    title: 'Tu propio dominio',
    description: 'La plataforma con tu marca, en tu dominio. Tus clientes lo verán como tuyo.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: BarChart,
    title: 'Analytics en tiempo real',
    description: 'Ingresos, ocupación y tendencias. Toma decisiones basadas en datos reales de tu negocio.',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: Shield,
    title: 'Seguro y confiable',
    description: 'Datos cifrados, backups automáticos y 99.9% de uptime garantizado.',
    color: 'bg-amber-100 text-amber-600',
  },
];

const STEPS = [
  { number: '01', title: 'Contáctanos', description: 'Cuéntanos sobre tu negocio y te preparamos la plataforma personalizada en menos de 24h.' },
  { number: '02', title: 'Personalizamos tu plataforma', description: 'Configuramos tu marca, servicios, horarios y canales de notificación a tu medida.' },
  { number: '03', title: 'La publicamos en tu dominio', description: 'Desplegamos la app en tu propio dominio. Tus clientes la verán como parte de tu negocio.' },
  { number: '04', title: 'Creces con datos', description: 'Analytics, IA y automatización hacen crecer tu agenda mientras tú te enfocas en lo importante.' },
];

const TESTIMONIALS = [
  {
    name: 'Sofía Martínez',
    role: 'Nutrióloga — Clínica NutriVida',
    avatar: 'SM',
    text: 'Antes perdía 2 horas al día en llamadas. Ahora todo es automático y mis clientes adoran agendar desde el móvil. Las ausencias bajaron un 70%.',
    rating: 5,
  },
  {
    name: 'Carlos López',
    role: 'Médico Dermatólogo',
    avatar: 'CL',
    text: 'El asistente de IA responde a mis pacientes a las 3am. Increíble. Mis consultas aumentaron un 40% el primer mes.',
    rating: 5,
  },
  {
    name: 'Ana García',
    role: 'Directora — Salón Belleza & Co.',
    avatar: 'AG',
    text: 'Tengo la plataforma con mi propio logo y dominio. Mis clientas piensan que la desarrollé especialmente para el salón. Profesionalidad al 100%.',
    rating: 5,
  },
];

const PRICING = [
  {
    name: 'Esencial',
    price: '49',
    period: '/mes',
    description: 'Para profesionales independientes',
    features: [
      'Hasta 100 citas/mes',
      'Hasta 3 servicios',
      'Notificaciones por email',
      'Dashboard y analytics básico',
      'Tu propio dominio',
      'Soporte por chat',
    ],
    cta: 'Empezar ahora',
    highlighted: false,
  },
  {
    name: 'Profesional',
    price: '99',
    period: '/mes',
    description: 'Para negocios en crecimiento',
    badge: 'Más popular',
    features: [
      'Citas ilimitadas',
      'Servicios ilimitados',
      'WhatsApp + Telegram + Email',
      'Asistente IA incluido',
      'Google Calendar sync',
      'Analytics avanzado',
      'Tu propio dominio y marca',
      'Soporte prioritario',
    ],
    cta: 'Empezar con 14 días gratis',
    highlighted: true,
  },
];

const FAQS = [
  {
    question: '¿Necesito conocimientos técnicos para usar la plataforma?',
    answer: 'No. Nosotros nos encargamos de toda la configuración técnica. Tú solo necesitas contarnos cómo es tu negocio.',
  },
  {
    question: '¿La plataforma tiene mi marca y mi dominio?',
    answer: 'Sí. La app se despliega en tu propio dominio (por ejemplo citas.tunegocio.com) y con el nombre de tu negocio. Tus clientes la verán como parte de tu marca.',
  },
  {
    question: '¿Qué pasa si quiero cancelar?',
    answer: 'Puedes cancelar en cualquier momento sin penalizaciones. Exportamos todos tus datos antes de cerrar.',
  },
  {
    question: '¿Puedo integrar WhatsApp para notificaciones?',
    answer: 'Sí. En el plan Profesional incluimos integración con WhatsApp, Telegram y email para recordatorios automáticos.',
  },
  {
    question: '¿Cuánto tarda en estar lista mi plataforma?',
    answer: 'En menos de 24 horas tendrás tu plataforma personalizada y funcionando en tu dominio.',
  },
  {
    question: '¿Ofrecéis soporte después del lanzamiento?',
    answer: 'Sí. Todos los planes incluyen soporte continuo. El plan Profesional tiene soporte prioritario con respuesta en menos de 4 horas.',
  },
];

const STATS = [
  { value: '2.000+', label: 'Negocios activos' },
  { value: '50.000+', label: 'Citas gestionadas' },
  { value: '80%', label: 'Menos ausencias' },
  { value: '24h', label: 'Tiempo de activación' },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">{APP_NAME}</span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
              <a href="#features" className="hover:text-primary-600 transition-colors">Características</a>
              <a href="#how-it-works" className="hover:text-primary-600 transition-colors">Cómo funciona</a>
              <a href="#pricing" className="hover:text-primary-600 transition-colors">Precios</a>
              <a href="#faq" className="hover:text-primary-600 transition-colors">FAQ</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2">
                Iniciar sesión
              </Link>
              <Link to="/register" className="text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors">
                Solicitar demo
              </Link>
            </div>

            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
            <a href="#features" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMobileMenuOpen(false)}>Características</a>
            <a href="#how-it-works" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMobileMenuOpen(false)}>Cómo funciona</a>
            <a href="#pricing" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMobileMenuOpen(false)}>Precios</a>
            <a href="#faq" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/login" className="text-center text-sm font-medium text-gray-700 border border-gray-300 py-2.5 rounded-lg">Iniciar sesión</Link>
              <Link to="/register" className="text-center text-sm font-semibold bg-primary-600 text-white py-2.5 rounded-lg">Solicitar demo</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-800 to-secondary-700">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-secondary-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 sm:pt-32 sm:pb-40 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-white text-xs font-semibold mb-8 backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            Plataforma con IA · Tu marca · Tu dominio
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
            La plataforma de citas{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-secondary-300">
              con tu marca
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-primary-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            Gestión de citas profesional, asistente IA, recordatorios automáticos y analytics avanzado.
            Todo bajo tu dominio y con la imagen de tu negocio.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="flex items-center gap-2 bg-white text-primary-700 hover:bg-primary-50 font-bold px-8 py-4 rounded-xl text-base transition-all shadow-xl hover:shadow-2xl active:scale-95 w-full sm:w-auto justify-center"
            >
              Solicitar mi plataforma
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl text-base border border-white/30 transition-all w-full sm:w-auto justify-center"
            >
              Ver la demo
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-primary-300 text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              Sin permanencia
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              14 días gratis
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              Lista en 24 horas
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L80 68C160 56 320 32 480 24C640 16 800 24 960 32C1120 40 1280 48 1360 52L1440 56V80H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-12 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-extrabold text-primary-600 mb-1">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-primary-600 text-sm font-bold uppercase tracking-widest bg-primary-50 px-4 py-1.5 rounded-full mb-4">
            Características
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Todo lo que necesita tu negocio
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Una plataforma completa que trabaja por ti mientras tú atiendes a tus clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              className="p-7 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-200 group bg-white"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-primary-600 text-sm font-bold uppercase tracking-widest bg-primary-50 px-4 py-1.5 rounded-full mb-4">
              Proceso
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Tu plataforma lista en 24 horas
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Sin complicaciones técnicas. Nosotros lo configuramos todo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map(({ number, title, description }, index) => (
              <div key={number} className="relative">
                {index < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary-200 to-transparent -translate-x-4 z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mb-5 shadow-lg shadow-primary-200">
                    <span className="text-xl font-extrabold text-white">{number}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-primary-600 text-sm font-bold uppercase tracking-widest bg-primary-50 px-4 py-1.5 rounded-full mb-4">
            Testimonios
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Negocios que ya confían en nosotros
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, role, avatar, text, rating }) => (
            <div key={name} className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-6 italic">"{text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{name}</p>
                  <p className="text-xs text-gray-400">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-primary-600 text-sm font-bold uppercase tracking-widest bg-primary-100 px-4 py-1.5 rounded-full mb-4">
              Precios
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Planes claros, sin sorpresas
            </h2>
            <p className="text-lg text-gray-500">14 días gratis en todos los planes. Sin tarjeta de crédito.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-primary-600 to-secondary-500 text-white ring-4 ring-primary-300 ring-offset-4'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1 rounded-full">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-lg font-bold mb-3 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={`text-5xl font-extrabold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                      €{plan.price}
                    </span>
                    <span className={plan.highlighted ? 'text-primary-200' : 'text-gray-400'}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={`text-sm ${plan.highlighted ? 'text-primary-100' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        plan.highlighted ? 'bg-white/25' : 'bg-primary-100'
                      }`}>
                        <Check className={`w-3 h-3 ${plan.highlighted ? 'text-white' : 'text-primary-600'}`} />
                      </div>
                      <span className={`text-sm leading-snug ${plan.highlighted ? 'text-white' : 'text-gray-700'}`}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`block text-center py-3.5 px-6 rounded-xl font-bold text-sm transition-all ${
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

          <p className="text-center text-sm text-gray-400 mt-8">
            ¿Necesitas algo personalizado?{' '}
            <a href="mailto:hola@neurian.es" className="text-primary-600 font-medium hover:underline">
              Contáctanos
            </a>{' '}
            y te hacemos un presupuesto a medida.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-primary-600 text-sm font-bold uppercase tracking-widest bg-primary-50 px-4 py-1.5 rounded-full mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Preguntas frecuentes
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map(({ question, answer }, index) => (
            <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span className="text-sm font-semibold text-gray-900 pr-4">{question}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === index && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-gray-600 leading-relaxed">{answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-500">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
            ¿Listo para tener tu propia plataforma?
          </h2>
          <p className="text-lg text-primary-100 mb-10 max-w-xl mx-auto">
            En menos de 24 horas tienes tu plataforma de citas con tu marca, tu dominio y todo configurado.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="flex items-center gap-2 bg-white text-primary-700 hover:bg-primary-50 font-bold px-10 py-4 rounded-xl text-base shadow-xl hover:shadow-2xl transition-all active:scale-95 w-full sm:w-auto justify-center"
            >
              Solicitar mi plataforma gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-primary-300 text-sm mt-5">
            14 días gratis · Sin tarjeta de crédito · Cancela cuando quieras
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold text-lg">{APP_NAME}</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                Plataforma de gestión de citas con IA para negocios profesionales. Tu marca, tu dominio, tu plataforma.
              </p>
              <p className="text-xs mt-4">
                ¿Preguntas?{' '}
                <a href="mailto:hola@neurian.es" className="text-primary-400 hover:text-primary-300 transition-colors">
                  hola@neurian.es
                </a>
              </p>
            </div>

            <div>
              <h4 className="text-white text-sm font-semibold mb-4">Producto</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Acceder</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-sm font-semibold mb-4">Legal</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Términos de uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>© {new Date().getFullYear()} {APP_NAME}. Todos los derechos reservados.</p>
            <p>Hecho con ❤️ por <a href="https://neurian.es" className="text-primary-400 hover:text-primary-300 transition-colors">Neurian</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
