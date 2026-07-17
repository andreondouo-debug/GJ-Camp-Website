import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/App.css';

const TermsOfServicePage = () => {
  return (
    <div className="container" style={{ paddingTop: '80px', paddingBottom: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="form-container" style={{ maxWidth: '900px', width: '100%' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--color-red)' }}>
          Conditions Générales d'Utilisation
        </h1>
        
        <div style={{ lineHeight: '1.8', fontSize: '15px', textAlign: 'justify' }}>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            <strong>Dernière mise à jour :</strong> 28 novembre 2025 | <strong>Version :</strong> 1.0
          </p>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>1. Objet</h2>
            <p>
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation du site web 
              et de la plateforme <span className="brand-name-gold">ELIJAH'GOD</span>, accessible à l'adresse www.elijahgod.fr.
            </p>
            <p style={{ marginTop: '10px' }}>
              En créant un compte et en utilisant nos services, vous acceptez sans réserve les présentes CGU.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>2. Éditeur du site</h2>
            <ul style={{ marginLeft: '20px' }}>
              <li><strong>Nom :</strong> <span className="brand-name-gold">ELIJAH'GOD</span></li>
              <li><strong>Nature :</strong> Organisation à but non lucratif</li>
              <li><strong>Email :</strong> contact@elijahgod.fr</li>
              <li><strong>Hébergeur :</strong> MongoDB Atlas (Amazon Web Services)</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>3. Accès au service</h2>
            
            <h3 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>3.1 Création de compte</h3>
            <p>Pour accéder aux services, vous devez créer un compte en fournissant :</p>
            <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
              <li>Des informations exactes et à jour</li>
              <li>Une adresse email valide</li>
              <li>Un mot de passe sécurisé (minimum 6 caractères)</li>
            </ul>
            <p style={{ marginTop: '10px' }}>
              Vous vous engagez à maintenir la confidentialité de vos identifiants et à nous informer 
              immédiatement de toute utilisation non autorisée de votre compte.
            </p>

            <h3 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>3.2 Vérification email</h3>
            <p>
              La vérification de votre adresse email est obligatoire pour accéder à certaines fonctionnalités, 
              notamment l'inscription aux camps.
            </p>

            <h3 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>3.3 Conditions d'âge</h3>
            <p>
              Pour créer un compte, vous devez avoir au moins 13 ans. Les mineurs doivent obtenir l'autorisation 
              de leurs parents ou tuteurs légaux avant de créer un compte.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>4. Services proposés</h2>
            <p>La plateforme <span className="brand-name-gold">ELIJAH'GOD</span> offre les services suivants :</p>
            <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
              <li>Gestion de profil utilisateur</li>
              <li>Demande de devis personnalisés</li>
              <li>Sélection d'activités</li>
              <li>Accès aux programmes et plannings</li>
              <li>Communication avec les organisateurs</li>
              <li>Tableau de bord personnalisé</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>5. Inscription aux camps</h2>
            
            <h3 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>5.1 Conditions</h3>
            <ul style={{ marginLeft: '20px' }}>
              <li>Compte vérifié requis</li>
              <li>Formulaire d'inscription complet et exact</li>
              <li>Paiement minimum : 20€ (tarif total : 120€)</li>
              <li>Acceptation des conditions spécifiques au camp</li>
            </ul>

            <h3 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>5.2 Paiement</h3>
            <p>
              Le paiement se fait selon les modalités communiquées lors de l'inscription. Le montant minimum 
              de 20€ doit être versé pour valider l'inscription. Le solde peut être réglé ultérieurement 
              selon les échéances convenues.
            </p>

            <h3 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>5.3 Annulation</h3>
            <p>
              Les conditions d'annulation et de remboursement sont communiquées lors de l'inscription. 
              Tout remboursement est soumis aux frais de dossier applicables.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>6. Obligations de l'utilisateur</h2>
            <p>En utilisant notre plateforme, vous vous engagez à :</p>
            <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
              <li>Fournir des informations exactes et véridiques</li>
              <li>Ne pas usurper l'identité d'autrui</li>
              <li>Ne pas utiliser le service à des fins illégales ou frauduleuses</li>
              <li>Ne pas perturber le fonctionnement du site</li>
              <li>Respecter les droits de propriété intellectuelle</li>
              <li>Ne pas extraire ou copier massivement des données</li>
              <li>Maintenir la confidentialité de vos identifiants</li>
              <li>Informer immédiatement de toute faille de sécurité</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>7. Propriété intellectuelle</h2>
            <p>
              Tous les contenus présents sur le site (textes, images, logos, vidéos, graphiques, etc.) 
              sont protégés par le droit d'auteur et appartiennent à Génération Josué ou à leurs auteurs respectifs.
            </p>
            <p style={{ marginTop: '10px' }}>
              Toute reproduction, distribution, modification ou utilisation sans autorisation préalable est interdite.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>8. Protection des données personnelles</h2>
            <p>
              Le traitement de vos données personnelles est détaillé dans notre{' '}
              <Link to="/politique-confidentialite" style={{ color: 'var(--color-red)' }}>
                Politique de Confidentialité
              </Link>
              , conforme au RGPD.
            </p>
            <p style={{ marginTop: '10px' }}>
              Vous disposez notamment des droits d'accès, de rectification, d'effacement et de portabilité 
              de vos données personnelles.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>9. Responsabilité</h2>
            
            <h3 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>9.1 Disponibilité du service</h3>
            <p>
              Nous nous efforçons d'assurer la disponibilité continue du service, mais ne garantissons pas 
              un accès ininterrompu. Des interruptions peuvent survenir pour maintenance ou raisons techniques.
            </p>

            <h3 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>9.2 Limitation de responsabilité</h3>
            <p>
              <span className="brand-name-gold">ELIJAH'GOD</span> ne saurait être tenu responsable :
            </p>
            <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
              <li>Des dommages indirects résultant de l'utilisation du service</li>
              <li>De la perte de données en cas de problème technique</li>
              <li>Des actes malveillants de tiers</li>
              <li>De l'utilisation frauduleuse de votre compte par un tiers</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>10. Suspension et résiliation</h2>
            
            <h3 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>10.1 Par l'utilisateur</h3>
            <p>
              Vous pouvez supprimer votre compte à tout moment depuis votre{' '}
              <Link to="/gestion-donnees" style={{ color: 'var(--color-red)' }}>
                page de gestion des données
              </Link>
              . Cette action entraîne l'anonymisation de vos données personnelles.
            </p>

            <h3 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>10.2 Par <span className="brand-name-gold">ELIJAH'GOD</span></h3>
            <p>
              Nous nous réservons le droit de suspendre ou supprimer votre compte en cas de :
            </p>
            <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
              <li>Violation des présentes CGU</li>
              <li>Utilisation frauduleuse du service</li>
              <li>Fourniture d'informations fausses</li>
              <li>Comportement nuisible envers d'autres utilisateurs</li>
              <li>Inactivité prolongée (compte non vérifié > 30 jours)</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>11. Modifications des CGU</h2>
            <p>
              Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les utilisateurs 
              seront informés des modifications substantielles par email.
            </p>
            <p style={{ marginTop: '10px' }}>
              L'utilisation continue du service après modification vaut acceptation des nouvelles CGU.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>12. Droit applicable et juridiction</h2>
            <p>
              Les présentes CGU sont régies par le droit français. En cas de litige, les parties s'efforceront 
              de trouver une solution amiable. À défaut, les tribunaux français seront seuls compétents.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>13. Contact</h2>
            <p>Pour toute question concernant les présentes CGU :</p>
            <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
              <li><strong>Email :</strong> contact@elijahgod.fr</li>
              <li><strong>Support :</strong> Via votre tableau de bord utilisateur</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>14. Acceptation des CGU</h2>
            <p>
              En cochant la case "J'accepte les Conditions Générales d'Utilisation" lors de votre inscription, 
              vous reconnaissez avoir lu, compris et accepté l'intégralité des présentes CGU.
            </p>
          </section>

          <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
            <Link to="/politique-confidentialite" className="btn-primary" style={{ marginRight: '15px' }}>
              Politique de confidentialité
            </Link>
            <Link to="/" className="btn-secondary">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
