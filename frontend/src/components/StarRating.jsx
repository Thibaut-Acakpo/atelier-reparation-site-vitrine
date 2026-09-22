import { Star } from 'lucide-react';

export default function StarRating({ note, max = 5 }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`Note : ${note} sur ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < note ? 'fill-or-discret text-or-discret' : 'text-gray-300'}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
