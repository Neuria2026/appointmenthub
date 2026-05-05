import { Link } from 'react-router-dom';
import { Calendar, Twitter, Github, Linkedin } from 'lucide-react';
import { APP_NAME } from '@/utils/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">{APP_NAME}</span>
            </div>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              La plataforma de gestión de citas más inteligente para profesionales y sus clientes.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Producto</h4>
            <ul className="space-y-2">
              {['Características', 'Precios', 'Seguridad', 'Changelog'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Empresa</h4>
            <ul className="space-y-2">
              {['Acerca de', 'Blog', 'Contacto', 'Privacidad'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {currentYear} {APP_NAME}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Privacidad
            </Link>
            <Link to="/terms" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Términos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
