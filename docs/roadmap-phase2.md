# 📋 Roadmap del proyecto TradingView Personal – Fase 2: Rendimiento y Escalabilidad

## Subfase 2.1 – Cache y Optimización de Gráficos
- ✅ Implementar SWR/React Query para datos de mercado en componentes críticos.  
- ✅ Configurar caché con `revalidateOnFocus: false` y `refreshInterval` configurable.  
- ✅ Utilizar `next/image` para optimizar imágenes de indicadores y símbolos.  
- ✅ Añadir `loading="lazy"` a elementos no críticos.

## Subfase 2.2 – Bundle Splitting y Lazy Loading
- ✅ Analizar bundle con `webpack-bundle-analyzer`.  
- ✅ Dividir código de `oakscriptjs` y `lightweight-charts` mediante `import()` dinámico.  
- ✅ Implementar `React.lazy` y `Suspense` para cargar componentes de gráfico bajo demanda.  
- ✅ Definir puntos de carga (`loading="eager"` vs `loading="lazy"`) según prioridad.

## Subfase 2.3 – Web Workers para Cálculos Pesados
- ✅ Migrar cálculo de indicadores (RSI, MACD, etc.) a Web Workers.  
- ✅ Comunicación asíncrona mediante `postMessage` entre worker y UI thread.  
- ✅ Cachear resultados de indicadores en `useMemo` con `maxAge` configurable.  
- ✅ Fallback a cálculo sincrónico si el navegador no soporta workers.

## Subfase 2.4 – Escalado de WebSocket
- ✅ Implementar pool de conexiones WebSocket para soportar miles de suscripciones.  
- ✅ Balanceador de carga entre workers mediante `worker_threads`.  
- ✅ Monitoreo de número de conexiones activas y reconexiones automáticas.  
- ✅ Persistencia de suscripciones en `IndexedDB` para recuperación tras reconexión.

## Subfase 2.5 – Monitoreo de Rendimiento
- ✅ Integrar `web-vitals` para medir LCP, FID, CLS.  
- ✅ Exportar métricas a un servicio de analítica (por ejemplo, Plausible).  
- ✅ Alertas cuando el tiempo de carga del gráfico supere umbrales definidos.

---

> **Próximo paso**: al completar la Fase 2, se realizará un commit separado y se actualizará el repositorio. Después se iniciará la Fase 3 (Funcionalidades Avanzadas).