import { Facebook, Instagram } from "lucide-react"

const FACEBOOK_URL = "https://facebook.com/rentaverify"
const INSTAGRAM_URL = "https://instagram.com/rentaverify"
const CONTACT_EMAIL = "contacto@rentaverify.com"

export function Footer() {
  return (
    <footer className="bg-[#213A6B] text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Brand */}
          <div>
            <img
              src="/RentaVerify_isotipo_blanco.png"
              alt="Renta Verify"
              className="h-12 w-auto"
            />
            <p className="mt-4 text-sm text-white/80 max-w-md leading-relaxed">
              La plataforma líder en evaluación de inquilinos. Decide con información,
              renta con seguridad.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Contacto</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-sm text-white/80 hover:text-white transition-colors"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href="/contacto"
                  className="text-sm text-white/80 hover:text-white transition-colors"
                >
                  Ayuda y soporte
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Síguenos</h3>
            <div className="mt-4 flex items-center gap-4">
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-white hover:text-white/80 transition-colors"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-white hover:text-white/80 transition-colors"
              >
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/80">
            © {new Date().getFullYear()} Renta Verify. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm text-white/80 hover:text-white transition-colors"
            >
              Aviso de privacidad
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
