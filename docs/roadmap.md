# 📋 Roadmap del proyecto TradingView Personal

## Fase 1: Seguridad

### Subfase 1.1 – Refuerzo de API Proxy
- ✅ Validación estricta de endpoints (lista blanca) en `src/app/api/binance/[...path]/route.ts`.
- ✅ Sanitización y validación de parámetros (símbolos, intervalos, límites, batch).
- ✅ Implementación de rate‑limiting en memoria (100 peticiones/min por IP).
- ✅ Manejo de errores con respuestas genéricas en producción y logs detallados en desarrollo.
- ✅ Cabecera `Cache‑Control` adecuada para datos públicos.

### Subfase 1.2 – Autenticación y Validación WebSocket
- ✅ Expresión regular para símbolos Binance (`^[A-Z0-9]{2,20}USDT$`).
- ✅ Validación de `Timeframe` contra lista permitida.
- ✅ Autenticación opcional mediante token (`WS_TOKEN`).
- ✅ Rate‑limiting de suscripciones (máx. 10 por IP).
- ✅ Validación de la estructura de mensajes antes de procesar.
- ✅ Mensajes de advertencia (`logger.warn`) en caso de datos incompletos.

### Subfase 1.3 – Logging y Monitoreo
- ✅ Creación de utilidad de logging centralizada (`src/lib/logger.ts`) con niveles `info`, `warn` y `error`.
- ✅ Reemplazo de `console.error` por `logger.error` en puntos críticos del código.
- ✅ Preparación para integrar un servicio de monitoreo externo (Sentry, Datadog) en el futuro.

---

> **Próximos pasos**: una vez completada la Fase 1, se crearán commits separados para cada subfase y se actualizará el repositorio. Después se procederá a la Fase 2 (Rendimiento y Escalabilidad).
