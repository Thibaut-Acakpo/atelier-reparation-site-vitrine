export default function SiteIntrouvable() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
      <div>
        <p className="text-5xl" aria-hidden="true">🔧</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Site introuvable</h1>
        <p className="mx-auto mt-3 max-w-md text-slate-600">
          Ce lien ne correspond à aucun site actif. Vérifiez l’adresse saisie ou
          contactez l’atelier concerné.
        </p>
      </div>
    </main>
  );
}
