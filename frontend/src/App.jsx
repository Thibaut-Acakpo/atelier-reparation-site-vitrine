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
import AdminLayout from './admin/components/AdminLayout';

import AdminLogin from './admin/pages/Login';
import AdminDashboard from './admin/pages/Dashboard';
import AdminDemandes from './admin/pages/Demandes';
import AdminRendezVous from './admin/pages/RendezVous';
import AdminReparations from './admin/pages/Reparations';
import AdminReparationDetail from './admin/pages/ReparationDetail';
import AdminClients from './admin/pages/Clients';
import AdminClientDetail from './admin/pages/ClientDetail';
import AdminAvis from './admin/pages/Avis';
import AdminContacts from './admin/pages/Contacts';
import AdminRealisations from './admin/pages/Realisations';
import AdminContenu from './admin/pages/Contenu';
import AdminPieces from './admin/pages/Pieces';


/* =========================================================
   ESPACE DÉVELOPPEUR
   ========================================================= */

import {
  DeveloperAuthProvider,
} from './gestion/context/DeveloperAuthContext';

import DeveloperProtectedRoute from './gestion/components/DeveloperProtectedRoute';
import DeveloperLayout from './gestion/components/DeveloperLayout';

import SiteIntrouvable from './components/SiteIntrouvable';
import { useAtelier } from './context/AtelierContext';
import DeveloperLogin from './gestion/pages/Login';
import DeveloperDashboard from './gestion/pages/Dashboard';
import DeveloperNouveauClient from './gestion/pages/NouveauClient';
import DeveloperAcces from './gestion/pages/Acces';
import DeveloperIdentite from './gestion/pages/Identite';
import DeveloperApparence from './gestion/pages/Apparence';
import DeveloperContact from './gestion/pages/Contact';
import DeveloperServices from './gestion/pages/Services';
import DeveloperAppareils from './gestion/pages/Appareils';
import DeveloperFaq from './gestion/pages/Faq';
import DeveloperRealisations from './gestion/pages/Realisations';
import DeveloperReseauxSociaux from './gestion/pages/ReseauxSociaux';
import DeveloperSeo from './gestion/pages/Seo';
import DeveloperDomaine from './gestion/pages/Domaine';


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

      </DeveloperAuthProvider>

      </AuthProvider>
    </ToastProvider>
  );
}