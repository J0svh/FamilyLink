# Restricción Global: Coste Cero (COST-1)

## Regla

**THE Sistema SHALL utilizar exclusivamente herramientas, bibliotecas, APIs e infraestructura que dispongan de un plan gratuito perpetuo o de créditos iniciales suficientes para cubrir el desarrollo, las pruebas y la demostración del TFG, sin requerir ningún método de pago por parte del usuario o del evaluador.**

Esta restricción aplica a **todas** las decisiones técnicas del proyecto FamilyLink sin excepción.

---

## Aplicación práctica

Antes de proponer o implementar cualquier tecnología, servicio externo, API o infraestructura, verifica que cumple COST-1. Si no cumple, propón una alternativa gratuita equivalente.

### Alternativas gratuitas recomendadas por categoría

| Categoría | ✅ Usar (gratuito) | ❌ Evitar (de pago) |
|-----------|-------------------|---------------------|
| **Mapas** | Leaflet + OpenStreetMap (tiles gratuitos), Mapbox free tier (50k cargas/mes) | Google Maps Platform (requiere tarjeta) |
| **Base de datos** | PostgreSQL self-hosted, Supabase free tier (500 MB), Railway free tier | AWS RDS, PlanetScale paid |
| **Hosting backend** | Render free tier, Railway free tier, Fly.io free tier | Heroku (eliminó free tier), AWS EC2 sin créditos |
| **Hosting frontend** | Vercel free tier, Netlify free tier, GitHub Pages | Amplify paid |
| **Push notifications** | Firebase Cloud Messaging (FCM) — gratuito ilimitado | OneSignal paid, AWS SNS paid |
| **Email** | Resend free tier (3k emails/mes), Brevo free tier (300/día) | SendGrid paid, AWS SES sin créditos |
| **Autenticación** | JWT propio (sin coste), Supabase Auth (gratuito) | Auth0 paid tiers |
| **Cache** | Redis self-hosted, Upstash free tier (10k req/día) | Redis Cloud paid |
| **CI/CD** | GitHub Actions (2000 min/mes gratis), GitLab CI free | CircleCI paid |
| **Monitorización** | Grafana Cloud free tier, UptimeRobot free | Datadog, New Relic paid |
| **Logs** | Logtail free tier (1 GB/mes), self-hosted | Splunk, Papertrail paid |

---

## Notas importantes

- **Capacitor** (NFR-19): gratuito y open source. ✅
- **OpenStreetMap + Leaflet**: gratuito sin límites para uso no comercial. ✅
- **Firebase FCM**: gratuito sin límite de mensajes. ✅
- **Supabase**: free tier incluye PostgreSQL, Auth, Storage y Realtime. ✅
- Si se usan créditos iniciales (ej. Railway $5 gratis), documentar cuánto se consume para garantizar que el evaluador pueda reproducir el entorno sin coste.
