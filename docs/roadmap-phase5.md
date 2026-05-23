# 📋 Roadmap del proyecto TradingView Personal – Fase 5: PWA y Mobile

## Subfase 5.1 – PWA Manifest
- ⬜ Crear `manifest.json` con name, short_name, icons, start_url, display: standalone.
- ⬜ Íconos PWA en múltiples tamaños (192x192, 512x512) generados desde el logo.
- ⬜ Meta tags PWA en `layout.tsx`: theme-color, apple-mobile-web-app-capable.
- ⬜ Service Worker con Workbox (`next-pwa` o `@serwist/next`) para cache de assets estáticos.
- ⬜ Install prompt personalizado (beforeinstallprompt event).
- ⬜ Offline shell: página básica funcional sin conexión.

## Subfase 5.2 – Layout Mobile
- ⬜ Bottom navigation bar para mobile (Chart, Watchlist, Scanner, Settings).
- ⬜ Gestos touch: pinch-to-zoom en gráfico, swipe entre timeframes.
- ⬜ Gráfico full-screen en mobile con overlay de controles.
- ⬜ Sidebar completamente oculta en mobile, accesible via hamburger menu.
- ⬜ BottomPanel colapsable en mobile (tap para expandir).
- ⬜ Safe area insets para dispositivos con notch (env-safe-area-inset).

## Subfase 5.3 – Push Notifications
- ⬜ Web Push API con VAPID keys (generar par de keys).
- ⬜ Endpoint de suscripción en Next.js API route (`/api/push/subscribe`).
- ⬜ Integración con alert-store: cuando se dispara una alerta, enviar push notification.
- ⬜ UI de gestión de suscripciones push en Settings.
- ⬜ Permisos de notificación request con UX amigable (no bloqueante).

## Subfase 5.4 – Offline y Sync
- ⬜ Cache de datos de mercado con Service Worker (stale-while-revalidate).
- ⬜ IndexedDB para almacenar datos históricos offline (klines, tickers).
- ⬜ Background Sync API para enviar acciones pendientes cuando hay conexión.
- ⬜ Indicador visual de estado de conexión (online/offline banner).
- ⬜ Estrategia de cache: network-first para datos críticos, cache-first para assets.

## Subfase 5.5 – Deploy y CI/CD
- ⬜ Configuración Vercel deployment con environment variables.
- ⬜ Preview deployments automáticos para cada PR.
- ⬜ Health check endpoint (`/api/health`) para monitoreo.
- ⬜ CSP headers y seguridad para producción.
- ⬜ Analytics de uso básico (PostHog self-hosted o Plausible).
- ⬜ Error tracking con Sentry (o alternativa self-hosted como GlitchTip).

---

## Estado de la implementación

| Subfase | Completado | Pendiente | Porcentaje |
|---------|-----------|-----------|------------|
| 5.1 PWA Manifest | 0/6 | 6 | 0% |
| 5.2 Layout Mobile | 0/6 | 6 | 0% |
| 5.3 Push Notifications | 0/5 | 5 | 0% |
| 5.4 Offline y Sync | 0/5 | 5 | 0% |
| 5.5 Deploy y CI/CD | 0/6 | 6 | 0% |
| **Total** | **0/28** | **28** | **0%** |

---

> **Próximo paso**: la Fase 5 es la última y depende de que las Fases 2, 3 y 4 estén completas. Se recomienda empezar por 5.1 (PWA Manifest) y 5.5 (Deploy) ya que son independientes del layout mobile.
