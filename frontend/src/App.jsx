import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

/* =========================================================
   SITE VITRINE
   ========================================================= */

import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppFloatingButton from './components/WhatsAppFloatingButton';

import Home from './pages/Home';
import Services from './pages/Services';
import Appareils from './pages/Appareils';
import Realisations from './pages/Realisations';
import About from './pages/About';
import Suivi from './pages/Suivi';
import DemandeReparation from './pages/DemandeReparation';
import RendezVous from './pages/RendezVous';
import Faq from './pages/Faq';
import Contact from './pages/Contact';
import Confidentialite from './pages/Confidentialite';
import Conditions from './pages/Conditions';
import NotFound from './pages/NotFound';


/* =========================================================
   ESPACE CLIENT / ADMIN
   ========================================================= */

import { AuthProvider } from './admin/context/AuthContext';
import { ToastProvider } from './gestion/components/ui';
import ProtectedRoute from './admin/components/ProtectedRoute';
const AdminLayout = lazy(() => import('./admin/components/AdminLayout'));

const AdminLogin = lazy(() => import('./admin/pages/Login'));
const AdminDashboard = lazy(() => import('./admin/pages/Dashboard'));
const AdminDemandes = lazy(() => import('./admin/pages/Demandes'));
const AdminRendezVous = lazy(() => import('./admin/pages/RendezVous'));
const AdminReparations = lazy(() => import('./admin/pages/Reparations'));
const AdminReparationDetail = lazy(() => import('./admin/pages/ReparationDetail'));
const AdminClients = lazy(() => import('./admin/pages/Clients'));
const AdminClientDetail = lazy(() => import('./admin/pages/ClientDetail'));
const AdminAvis = lazy(() => import('./admin/pages/Avis'));
const AdminContacts = lazy(() => import('./admin/pages/Contacts'));
const AdminRealisations = lazy(() => import('./admin/pages/Realisations'));
const AdminContenu = lazy(() => import('./admin/pages/Contenu'));
const AdminPieces = lazy(() => import('./admin/pages/Pieces'));


/* =========================================================
   ESPACE DÉVELOPPEUR
   ========================================================= */

import {
  DeveloperAuthProvider,
} from './gestion/context/DeveloperAuthContext';

import DeveloperProtectedRoute from './gestion/components/DeveloperProtectedRoute';
const DeveloperLayout = lazy(() => import('./gestion/components/DeveloperLayout'));

import SiteIntrouvable from './components/SiteIntrouvable';
import { useAtelier } from './context/AtelierContext';
const DeveloperLogin = lazy(() => import('./gestion/pages/Login'));
const DeveloperDashboard = lazy(() => import('./gestion/pages/Dashboard'));
const DeveloperNouveauClient = lazy(() => import('./gestion/pages/NouveauClient'));
const DeveloperAcces = lazy(() => import('./gestion/pages/Acces'));
const DeveloperIdentite = lazy(() => import('./gestion/pages/Identite'));
const DeveloperApparence = lazy(() => import('./gestion/pages/Apparence'));
const DeveloperContact = lazy(() => import('./gestion/pages/Contact'));
const DeveloperServices = lazy(() => import('./gestion/pages/Services'));
const DeveloperAppareils = lazy(() => import('./gestion/pages/Appareils'));
const DeveloperFaq = lazy(() => import('./gestion/pages/Faq'));
const DeveloperRealisations = lazy(() => import('./gestion/pages/Realisations'));
const DeveloperReseauxSociaux = lazy(() => import('./gestion/pages/ReseauxSociaux'));
const DeveloperSeo = lazy(() => import('./gestion/pages/Seo'));
const DeveloperDomaine = lazy(() => import('./gestion/pages/Domaine'));


/* =========================================================
   SITE VITRINE PUBLIC
   ========================================================= */

function SiteVitrine() {
  const { introuvable } = useAtelier();

  if (introuvable) return <SiteIntrouvable />;

  return (
    <div className="flex min-h-screen flex-col">

      <a
        href="#contenu-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
      >
        Aller au contenu principal
      </a>

      <Header />

      <main
        id="contenu-principal"
        className="flex-1"
      >
        <Routes>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/services"
            element={<Services />}
          />

          <Route
            path="/appareils"
            element={<Appareils />}
          />

          <Route
            path="/realisations"
            element={<Realisations />}
          />

          <Route
            path="/a-propos"
            element={<About />}
          />

          <Route
            path="/suivi"
            element={<Suivi />}
          />

          <Route
            path="/deposer"
            element={<DemandeReparation />}
          />

          <Route
            path="/rendez-vous"
            element={<RendezVous />}
          />

          <Route
            path="/faq"
            element={<Faq />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />

          <Route
            path="/confidentialite"
            element={<Confidentialite />}
          />

          <Route
            path="/conditions"
            element={<Conditions />}
          />

          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>
      </main>

      <Footer />

      <WhatsAppFloatingButton />

    </div>
  );
}


/* =========================================================
   APPLICATION PRINCIPALE
   ========================================================= */

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>

      <DeveloperAuthProvider>

        <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gris-texte" role="status">Chargement…</div>}>
        <Routes>

          {/* =================================================
              ESPACE CLIENT / ADMIN
              ================================================= */}

          <Route
            path="/admin/connexion"
            element={<AdminLogin />}
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >

            <Route
              index
              element={<AdminDashboard />}
            />

            <Route
              path="demandes"
              element={<AdminDemandes />}
            />

            <Route
              path="rendez-vous"
              element={<AdminRendezVous />}
            />

            <Route
              path="reparations"
              element={<AdminReparations />}
            />

            <Route
              path="reparations/:id"
              element={<AdminReparationDetail />}
            />

            <Route
              path="clients"
              element={<AdminClients />}
            />

            <Route
              path="clients/:id"
              element={<AdminClientDetail />}
            />

            <Route
              path="avis"
              element={<AdminAvis />}
            />

            <Route
              path="contacts"
              element={<AdminContacts />}
            />

            <Route
              path="realisations"
              element={<AdminRealisations />}
            />

            <Route
              path="contenu"
              element={<AdminContenu />}
            />

            <Route
              path="pieces"
              element={<AdminPieces />}
            />

          </Route>


          {/* =================================================
              ESPACE DÉVELOPPEUR
              ================================================= */}

          {/* Connexion développeur */}

          <Route
            path="/gestion/connexion"
            element={<DeveloperLogin />}
          />


          {/* Espace développeur protégé */}

          <Route
            path="/gestion"
            element={
              <DeveloperProtectedRoute>
                <DeveloperLayout />
              </DeveloperProtectedRoute>
            }
          >
            <Route index element={<DeveloperDashboard />} />
            <Route path="nouveau" element={<DeveloperNouveauClient />} />
            <Route path="acces" element={<DeveloperAcces />} />
            <Route path="identite" element={<DeveloperIdentite />} />
            <Route path="apparence" element={<DeveloperApparence />} />
            <Route path="contact" element={<DeveloperContact />} />
            <Route path="services" element={<DeveloperServices />} />
            <Route path="appareils" element={<DeveloperAppareils />} />
            <Route path="faq" element={<DeveloperFaq />} />
            <Route path="realisations" element={<DeveloperRealisations />} />
            <Route path="reseaux-sociaux" element={<DeveloperReseauxSociaux />} />
            <Route path="seo" element={<DeveloperSeo />} />
            <Route path="domaine" element={<DeveloperDomaine />} />
          </Route>


          {/* =================================================
              SITE PUBLIC
              ================================================= */}

          <Route
            path="/*"
            element={<SiteVitrine />}
          />

        </Routes>
        </Suspense>

      </DeveloperAuthProvider>

      </AuthProvider>
    </ToastProvider>
  );
}