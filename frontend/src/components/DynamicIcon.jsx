import * as Icons from 'lucide-react';

// Convertit un nom d'icône stocké en base ("terminal-square") au nom du
// composant Lucide correspondant ("TerminalSquare").
function toPascalCase(str) {
  return str
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export default function DynamicIcon({ name, size = 24, className = '', ...props }) {
  const componentName = toPascalCase(name || 'circle');
  const IconComponent = Icons[componentName] || Icons.Wrench;
  return <IconComponent size={size} className={className} aria-hidden="true" {...props} />;
}
