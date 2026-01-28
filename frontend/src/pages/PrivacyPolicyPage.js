import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/App.css';

const PrivacyPolicyPage = () => {
  return (
    <div className="container" style={{ paddingTop: '80px', paddingBottom: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="form-container" style={{ maxWidth: '900px', width: '100%' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--color-red)' }}>
          Politique de Confidentialité
        </h1>
        
        <div style={{ lineHeight: '1.8', fontSize: '15px', textAlign: 'justify' }}>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            <strong>Dernière mise à jour :</strong> 28 novembre 2025 | <strong>Version :</strong> 1.0
          </p>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données personnelles collectées sur ce site est :
            </p>
            <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
              <li><strong>Organisation :</strong> Génération Josué (GJ Camp)</li>
              <li><strong>Email de contact :</strong> contact@gj-camp.fr</li>
              <li><strong>Délégué à la protection des données (DPO) :</strong> dpo@gj-camp.fr</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>2. Données personnelles collectées</h2>
            <p>Nous collectons les catégories de données suivantes :</p>
            
            <h3 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>2.1 Données d'identification</h3>
            <ul style={{ marginLeft: '20px' }}>
              <li>Prénom et nom</li>
              <li>Adresse email</li>
              <li>Mot de passe (crypté)</li>
              <li>Numéro de téléphone (optionnel)</li>
              <li>Date de naissance (pour inscriptions camp)</li>
            </ul>

            <h3 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>2.2 Données de profil</h3>
            <ul style={{ marginLeft: '20px' }}>
              <li>Photo de profil</li>
              <li>Site web de l'église</li>
              <li>Rôle ministériel</li>
              <li>Biographie</li>
              <li>Liens vers réseaux sociaux</li>
            </ul>

            <h3 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>2.3 Données sensibles (avec consentement explicite)</h3>
            <ul style={{ marginLeft: '20px' }}>
              <li>Informations de santé (allergies alimentaires uniquement dans le cadre des inscriptions camp)</li>
              <li>Ces données ne sont collectées qu'avec votre consentement explicite et sont strictement nécessaires pour assurer votre sécurité</li>
            </ul>

            <h3 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>2.4 Données techniques</h3>
            <ul style={{ marginLeft: '20px' }}>
              <li>Adresse IP</li>
              <li>Données de navigation (cookies)</li>
              <li>Date et heure de connexion</li>
              <li>Type de navigateur</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>3. Finalités du traitement</h2>
            <p>Vos données sont collectées pour les finalités suivantes :</p>
            <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
              <li><strong>Gestion des comptes utilisateurs :</strong> création, authentification, gestion du profil</li>
              <li><strong>Inscription aux camps :</strong> traitement des inscriptions, gestion des paiements, organisation logistique</li>
              <li><strong>Communication :</strong> envoi d'emails de vérification, notifications importantes, newsletters (avec consentement)</li>
              <li><strong>Sécurité :</strong> prévention de la fraude, respect des allergies alimentaires</li>
              <li><strong>Conformité légale :</strong> respect des obligations légales et réglementaires</li>
              <li><strong>Amélioration du service :</strong> analyse statistique anonymisée</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>4. Base légale du traitement</h2>
            <p>Conformément au RGPD, nous traitons vos données sur les bases légales suivantes :</p>
            <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
              <li><strong>Exécution du contrat :</strong> gestion de votre compte et des inscriptions</li>
              <li><strong>Consentement :</strong> traitement des données sensibles (santé), marketing, cookies non essentiels</li>
              <li><strong>Intérêt légitime :</strong> sécurité du site, prévention de la fraude</li>
              <li><strong>Obligation légale :</strong> conservation des données comptables</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>5. Durée de conservation</h2>
            <ul style={{ marginLeft: '20px' }}>
              <li><strong>Comptes actifs :</strong> tant que votre compte est actif</li>
              <li><strong>Comptes non vérifiés :</strong> suppression automatique après 30 jours</li>
              <li><strong>Inscriptions camp :</strong> 3 ans après la fin du camp (obligations comptables)</li>
              <li><strong>Données de santé :</strong> suppression immédiate après le camp</li>
              <li><strong>Logs de consentement :</strong> 3 ans (preuve de conformité RGPD)</li>
              <li><strong>Comptes supprimés :</strong> anonymisation immédiate, conservation uniquement des données requises légalement</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>6. Partage des données</h2>
            <p>Nous ne vendons jamais vos données personnelles. Vos données peuvent être partagées uniquement dans les cas suivants :</p>
            <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
              <li><strong>Prestataires techniques :</strong> hébergement (MongoDB Atlas), emails (Brevo), avec garanties contractuelles RGPD</li>
              <li><strong>Autorités légales :</strong> sur réquisition judiciaire uniquement</li>
              <li><strong>Organisateurs du camp :</strong> données strictement nécessaires à l'organisation (avec votre consentement)</li>
            </ul>
            <p style={{ marginTop: '10px' }}>
              Tous nos sous-traitants sont situés dans l'Union Européenne ou offrent des garanties équivalentes (clauses contractuelles types).
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>7. Vos droits RGPD</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles</li>
              <li><strong>Droit de rectification :</strong> corriger vos données inexactes ou incomplètes</li>
              <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
              <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
              <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré (JSON)</li>
              <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
              <li><strong>Droit de retirer votre consentement :</strong> à tout moment pour les traitements basés sur le consentement</li>
              <li><strong>Droit de réclamation :</strong> déposer une plainte auprès de la CNIL</li>
            </ul>
            <p style={{ marginTop: '15px' }}>
              Pour exercer vos droits, rendez-vous sur votre <Link to="/gestion-donnees" style={{ color: 'var(--color-red)' }}>page de gestion des données</Link> ou contactez-nous à : <strong>dpo@gj-camp.fr</strong>
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>8. Sécurité des données</h2>
            <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées :</p>
            <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
              <li>Cryptage des mots de passe (bcrypt)</li>
              <li>Transmission sécurisée (HTTPS)</li>
              <li>Authentification par tokens JWT</li>
              <li>Accès restreint aux données (principe du moindre privilège)</li>
              <li>Sauvegardes régulières</li>
              <li>Surveillance et logs d'accès</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>9. Cookies et Acceptation Implicite</h2>
            <p style={{ fontWeight: 'bold', marginBottom: '15px', color: 'var(--color-red)' }}>
              ⚠️ En utilisant ce site, vous acceptez automatiquement l'utilisation des cookies nécessaires à son fonctionnement.
            </p>
            <p style={{ marginBottom: '10px' }}>
              Nous utilisons uniquement des cookies strictement nécessaires au fonctionnement du site :
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
              <li><strong>Token d'authentification :</strong> pour maintenir votre session connectée de manière sécurisée</li>
              <li><strong>Préférences utilisateur :</strong> pour mémoriser vos choix (paramètres, préférences)</li>
              <li><strong>Données de session :</strong> pour assurer le bon fonctionnement de l'application</li>
            </ul>
            <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>
              ✅ Aucun cookie publicitaire, de tracking tiers ou de profilage n'est utilisé sur ce site.
            </p>
            <p style={{ marginBottom: '10px' }}>
              Ces cookies sont indispensables au fonctionnement du site et ne peuvent être désactivés sans compromettre votre expérience utilisateur. 
              Ils ne collectent aucune donnée personnelle identifiable à des fins commerciales.
            </p>
            <p style={{ marginTop: '10px' }}>
              Si vous souhaitez refuser ces cookies, vous pouvez configurer votre navigateur pour bloquer tous les cookies, 
              mais cela rendra le site inutilisable (impossibilité de se connecter, perte des fonctionnalités, etc.).
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>10. Transferts de données hors UE</h2>
            <p>
              Nos données sont hébergées sur MongoDB Atlas. En cas de transfert hors UE, nous nous assurons que des garanties 
              appropriées sont en place (clauses contractuelles types de la Commission européenne).
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>11. Modifications de la politique</h2>
            <p>
              Cette politique peut être mise à jour. Toute modification substantielle vous sera notifiée par email. 
              La version actuellement en vigueur est toujours accessible sur cette page avec sa date de mise à jour.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>12. Contact</h2>
            <p>Pour toute question concernant cette politique de confidentialité ou vos données personnelles :</p>
            <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
              <li><strong>Email DPO :</strong> dpo@gj-camp.fr</li>
              <li><strong>Email général :</strong> contact@gj-camp.fr</li>
              <li><strong>CNIL :</strong> <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-red)' }}>www.cnil.fr</a></li>
            </ul>
          </section>

          <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
            <Link to="/gestion-donnees" className="btn-primary" style={{ marginRight: '15px' }}>
              Gérer mes données
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

export default PrivacyPolicyPage;
