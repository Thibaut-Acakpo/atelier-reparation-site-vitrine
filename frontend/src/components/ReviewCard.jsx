import { Quote } from 'lucide-react';
import StarRating from './StarRating';

export default function ReviewCard({ nom, note, commentaire }) {
  return (
    <div className="card flex h-full flex-col">
      <Quote size={22} className="mb-3 text-or-discret/70" aria-hidden="true" />
      <p className="flex-1 text-gris-texte">&laquo;&nbsp;{commentaire}&nbsp;&raquo;</p>
      <div className="mt-4 flex items-center justify-between">
        <p className="font-titre font-semibold text-bleu-nuit">{nom}</p>
        <StarRating note={note} />
      </div>
    </div>
  );
}
