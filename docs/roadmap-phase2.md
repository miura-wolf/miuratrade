# 📋 Roadmap del proyecto TradingView Personal – Fase 2: Rendimiento y Escalabilidad

## Subfase 2.1 – Cache y Optimización de Gráficos
- ✅ Implementar SWR para datos de mercado en `useMarketData.ts` (3 hooks: `useMarketData`, `useTickerData`, `useExchangeInfo`).
- ⬜ Configurar `revalidateOnFocus: false` y `refreshInterval` configurable en todos los hooks SWR.
- ⬜ Utilizar `next/image` para optimizar imágenes de indicadores y símbolos.
- ⬜ Añadir `loading="lazy"` a elementos no críticos.

## Subfase 2.2 – Bundle Splitting y Lazy Loading
- ✅ Analizar bundle con `@next/bundle-analyzer` e instalar como devDependency (`ANALYZE=true npm run build`).
- ✅ Dividir código de `oakscriptjs` (~50KB) y `lightweight-charts-indicators` (~30KB) mediante `import()` dinámico con preload pattern.
- ✅ Implementar `next/dynamic` para cargar componentes bajo demanda: PriceChart, IndicatorSettingsDialog, RightSidebar, Watchlist — con skeleton loaders (`ChartSkeleton`, `SidebarSkeleton`, `DialogSkeleton`).
- ✅ Definir puntos de carga según prioridad: `ssr: false` para componentes de gráfico, skeletons como fallback visual, preload en mount para librerías pesadas.

## Subfase 2.3 – Web Workers para Cálculos Pesados
- ⬜ Migrar cálculo de indicadores (RSI, MACD, ATR, BB, Estocástico) a Web Workers.
- ⬜ Comunicación asíncrona mediante `postMessage` entre worker y UI thread.
- ⬜ Cachear resultados de indicadores en `useMemo` con `maxAge` configurable.
- ⬜ Fallback a cálculo sincrónico si el navegador no soporta workers.

## Subfase 2.4 – Escalado de WebSocket
- ⬜ Implementar pool de conexiones WebSocket para soportar miles de suscripciones.
- ⬜ Balanceador de carga entre workers mediante `worker_threads` (server-side).
- ⬜ Monitoreo de número de conexiones activas y reconexiones automáticas.
- ⬜ Persistencia de suscripciones en `IndexedDB` para recuperación tras reconexión.

## Subfase 2.5 – Monitoreo de Rendimiento
- ⬜ Integrar `web-vitals` para medir LCP, FID, CLS.
- ⬜ Exportar métricas a un servicio de analítica (por ejemplo, Plausible o PostHog).
- ⬜ Alertas cuando el tiempo de carga del gráfico supere umbrales definidos.

---

## Estado de la implementación

### Progreso real
| Subfase | Completado | Pendiente | Porcentaje |
|---------|-----------|-----------|------------|
| 2.1 Cache | 1/4 | 3 | 25% |
| 2.2 Bundle | 4/4 | 0 | 100% |
| 2.3 Workers | 0/4 | 4 | 0% |
| 2.4 WS Scaling | 0/4 | 4 | 0% |
| 2.5 Monitoreo | 0/3 | 3 | 0% |
| **Total** | **5/19** | **14** | **26%** |

### Nota
El roadmap anterior marcaba todos los items como ✅, pero la auditoría de código reveló que solo SWR está implementado en `useMarketData.ts`. Los items 2.2–2.5 no tienen código correspondiente en el repositorio.

---

> **Próximo paso**: completar los items pendientes de la Fase 2 antes de avanzar a Fase 4. Se recomienda seguir con 2.1 (SWR config) o 2.3 (Web Workers) según prioridad.
