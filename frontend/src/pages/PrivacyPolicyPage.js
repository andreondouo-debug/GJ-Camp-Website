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
            <strong>Dernière mise à jour :</strong> 31 janvier 2026 | <strong>Version :</strong> 1.1
          </p>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données personnelles collectées sur ce site est :
            </p>
            <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
              <li><strong>Organisation :</strong> Génération Josué (GJ Camp) - Association cultuelle</li>
              <li><strong>Email de contact RGPD :</strong> contact@gjsdecrpt.fr</li>
              <li><strong>Responsable du traitement :</strong> Équipe GJ Camp</li>
            </ul>
            <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
              <em>Note : En tant qu'association de petite taille (moins de 250 salariés), nous ne sommes pas tenus de désigner un Délégué à la Protection des Données (DPO). Pour toute question relative à vos données personnelles, contactez-nous à l'adresse ci-dessus.</em>
            </p>
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
            <p style={{ marginTop: '10px', fontWeight: 'bold', color: 'var(--color-red)' }}>
              ⚠️ Mineurs de moins de 15 ans : Le consentement d'un parent ou tuteur légal est obligatoire conformément à l'Article 8 du RGPD.
            </p>

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
              <li><strong>Inscriptions camp :</strong> 3 ans après la fin du camp (obligations comptables et légales)</li>
              <li><strong>Données de santé (allergies) :</strong> 1 an après la fin du camp (traçabilité en cas d'incident médical, puis suppression automatique)</li>
              <li><strong>Logs de consentement :</strong> 3 ans (preuve de conformité RGPD, Article 30)</li>
              <li><strong>Comptes supprimés :</strong> anonymisation immédiate des données personnelles, conservation uniquement des données requises légalement (comptabilité)</li>
              <li><strong>Logs de sécurité :</strong> 6 mois maximum</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>6. Partage des données et sous-traitants</h2>
            <p>Nous ne vendons jamais vos données personnelles. Vos données peuvent être partagées uniquement dans les cas suivants :</p>
            
            <h3 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>6.1 Sous-traitants techniques (conformes RGPD)</h3>
            <ul style={{ marginLeft: '20px' }}>
              <li><strong>MongoDB Atlas</strong> (hébergement base de données) - Localisation : UE ou USA avec clauses contractuelles types</li>
              <li><strong>Brevo</strong> (envoi emails transactionnels) - Localisation : France (UE) ✅</li>
              <li><strong>Cloudinary</strong> (stockage photos) - Localisation : USA avec garanties RGPD</li>
              <li><strong>PayPal</strong> (traitement paiements) - Localisation : USA, Privacy Shield successeur</li>
              <li><strong>Vercel</strong> (hébergement frontend) - Localisation : USA/UE avec garanties RGPD</li>
              <li><strong>Render</strong> (hébergement backend) - Localisation : USA/UE avec clauses contractuelles types</li>
            </ul>
            
            <h3 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>6.2 Autres destinataires</h3>
            <ul style={{ marginLeft: '20px' }}>
              <li><strong>Autorités légales :</strong> sur réquisition judiciaire uniquement</li>
              <li><strong>Organisateurs du camp :</strong> données strictement nécessaires à l'organisation (prénom, nom, allergies)</li>
            </ul>
            
            <p style={{ marginTop: '10px', fontWeight: 'bold' }}>
              Tous nos sous-traitants ont signé des engagements de conformité RGPD (clauses contractuelles types de la Commission européenne pour transferts hors UE).
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
              Pour exercer vos droits, rendez-vous sur votre <Link to="/gestion-donnees" style={{ color: 'var(--color-red)' }}>page de gestion des données</Link> ou contactez-nous à : <strong>contact@gjsdecrpt.fr</strong>
            </p>
            <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
              <em>Nous nous engageons à répondre à vos demandes dans un délai maximum de 30 jours conformément à l'Article 12.3 du RGPD. En cas de demande complexe, ce délai peut être prolongé de 2 mois avec justification.</em>
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
              Certains de nos prestataires peuvent stocker ou traiter vos données en dehors de l'Union Européenne :
            </p>
            <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
              <li><strong>MongoDB Atlas :</strong> Données hébergées en UE par défaut, transferts hors UE possibles avec clauses contractuelles types</li>
              <li><strong>Cloudinary (USA) :</strong> Stockage photos avec garanties RGPD et clauses contractuelles types</li>
              <li><strong>PayPal (USA) :</strong> Traitement paiements avec mécanismes de transfert conformes (successeur Privacy Shield)</li>
              <li><strong>Vercel/Render (USA/UE) :</strong> Hébergement avec clauses contractuelles types et certification ISO 27001</li>
            </ul>
            <p style={{ marginTop: '10px' }}>
              Tous ces transferts sont encadrés par les <strong>clauses contractuelles types de la Commission européenne</strong> (Article 46 RGPD), 
              garantissant un niveau de protection équivalent à celui de l'Union Européenne.
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
            <h2 style={{ color: 'var(--color-red)', marginBottom: '15px' }}>12. Contact et réclamations</h2>
            <p>Pour toute question concernant cette politique de confidentialité ou vos données personnelles :</p>
            <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
              <li><strong>Email RGPD :</strong> contact@gjsdecrpt.fr (réponse sous 30 jours)</li>
              <li><strong>Site web :</strong> <a href="https://gjsdecrpt.fr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-red)' }}>gjsdecrpt.fr</a></li>
            </ul>
            <p style={{ marginTop: '15px' }}>
              <strong>Droit de réclamation :</strong> Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer une réclamation auprès de la CNIL :
            </p>
            <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
              <li><strong>CNIL</strong> (Commission Nationale de l'Informatique et des Libertés)</li>
              <li>3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07</li>
              <li>Téléphone : 01 53 73 22 22</li>
              <li>Site : <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-red)' }}>www.cnil.fr/fr/plaintes</a></li>
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
