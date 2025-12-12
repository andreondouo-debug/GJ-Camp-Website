# UptimeRobot - Garder Backend Actif GRATUITEMENT

## Probleme

Render Free backend s'eteint apres 15 min inactivite
→ Premiere visite = 30 secondes d'attente
→ Mauvaise experience utilisateur

## Solution Gratuite

UptimeRobot ping le backend toutes les 5 minutes
→ Backend reste actif 24/7
→ Site toujours rapide

## Configuration

### Etape 1 : Creer compte

1. Aller sur : https://uptimerobot.com
2. Sign up (gratuit, pas de carte bancaire)
3. Verifier email

### Etape 2 : Ajouter Monitor

1. Dashboard → Add New Monitor
2. Configuration :

```
Monitor Type: HTTP(s)
Friendly Name: GJ Camp Backend
URL: https://gj-camp-backend-xxxx.onrender.com/api/health
Monitoring Interval: 5 minutes (gratuit)
```

3. Create Monitor

### Etape 3 : Verifier

- Status devrait etre "Up" (vert)
- UptimeRobot ping toutes les 5 min
- Backend Render reste actif

## Limites Plan Gratuit

- 50 monitors max (vous n'en avez besoin que d'1)
- Check toutes les 5 min (suffisant)
- Email alerts inclus

## Resultat

Backend reste actif ~23h/jour au lieu de s'eteindre
→ Experience utilisateur comme un site payant
→ 100% gratuit

## Alternative (si besoin)

Cron-job.org (meme principe, gratuit)
