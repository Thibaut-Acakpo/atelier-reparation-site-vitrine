import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '../data/constants';

export default function WhatsAppFloatingButton() {
  return (
    <a
      href={whatsappLink('Bonjour, je souhaite avoir des informations sur une réparation.')}
      target="_blank"
      rel="noreferrer"
      aria-label="Contacter l'atelier sur WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <MessageCircle size={26} aria-hidden="true" />
    </a>
  );
}
