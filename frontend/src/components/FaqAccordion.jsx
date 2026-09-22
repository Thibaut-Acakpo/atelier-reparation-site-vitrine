import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqAccordion({ items }) {
  const [openId, setOpenId] = useState(null);

  if (!items || items.length === 0) {
    return <p className="text-gris-texte">Aucune question pour le moment.</p>;
  }

  return (
    <div className="divide-y divide-gray-200 rounded-2xl bg-white shadow-sm ring-1 ring-bleu-nuit/5">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${item.id}`}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-titre font-semibold text-bleu-nuit sm:px-6"
              >
                <span>{item.question}</span>
                <ChevronDown
                  size={20}
                  className={`shrink-0 text-bleu-technique transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={`faq-panel-${item.id}`}
              role="region"
              className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="min-h-0 px-5 pb-4 text-gris-texte sm:px-6">{item.reponse}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
