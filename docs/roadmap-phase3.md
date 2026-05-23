# 📋 Roadmap del proyecto TradingView Personal – Fase 3: Funcionalidades Avanzadas

## Subfase 3.1 – Indicadores Técnicos Avanzados
- ✅ Implementar RSI, MACD, Bandas de Bollinger, Estocástico (vía `lightweight-charts-indicators`).
- ✅ Implementar indicadores oakscript: Trend, Breakout, Momentum, Volatility (vía `oakscriptjs`).
- ✅ Configuración de parámetros personalizados para cada indicador.
- ✅ Cálculo en tiempo real o histórico.
- ✅ Visualización en gráfico con líneas, histogramas, nubes.
- ⬜ Alertas basadas en cruces de indicadores (hook `useAlertNotifications` implementado, UI pendiente).

## Subfase 3.2 – Herramientas de Dibujo
- ✅ Herramientas de medición (distancia, ángulo) — `MeasureOverlay`.
- ⬜ Líneas de tendencia, canales, retrocesos de Fibonacci.
- ⬜ Formas geométricas (rectángulos, círculos, triángulos).
- ⬜ Texto y etiquetas.
- ⬜ Guardado y carga de dibujos en localStorage.

## Subfase 3.3 – Alertas y Notificaciones
- ✅ Sistema de alertas por precio, volumen, indicador (`alert-store.ts` con Zustand + persist).
- ✅ Configuración de condiciones (ej: "RSI > 70", "Precio cruza media").
- ✅ Hook de notificaciones de alertas (`useAlertNotifications.ts`) con Browser Notification API.
- ✅ Historial de alertas activadas (últimas 50 en memoria).
- ⬜ Notificaciones push (Web Push API) y email.
- ⬜ Suscripción a alertas desde el gráfico (UI pendiente).

## Subfase 3.4 – Backtesting y Estrategias
- ✅ Motor de backtesting para estrategias basadas en indicadores (`src/lib/backtest/engine.ts`).
- ✅ Configuración de fechas, capital inicial, comisiones.
- ✅ Resultados: equity curve, drawdown, Sharpe ratio, trades, win rate, profit factor.
- ✅ Exportación de resultados a CSV/JSON (`src/lib/export/data-export.ts`).
- ⬜ Integración con `oakscriptjs` para definir estrategias personalizadas.
- ⬜ UI para configurar y ejecutar backtests.

## Subfase 3.5 – Exportación de Datos
- ✅ Descarga de datos históricos en CSV y JSON.
- ✅ Filtro por símbolo y timeframe.
- ⬜ Exportación de gráficos como imagen (PNG, SVG).
- ⬜ API pública para acceder a datos (con autenticación).

## Subfase 3.6 – Múltiples Timeframes y Símbolos
- ⬜ Gráfico con múltiples timeframes simultáneos (candle overlay).
- ⬜ Comparación de símbolos en el mismo gráfico.
- ⬜ Sincronización de zoom y scroll entre timeframes.

---

## Estado de la implementación

### Archivos nuevos creados en Fase 3
| Archivo | Descripción |
|---------|-------------|
| `src/lib/backtest/engine.ts` | Motor de backtesting con equity curve, drawdown, Sharpe ratio |
| `src/lib/backtest/index.ts` | Barrel export del módulo de backtesting |
| `src/lib/export/data-export.ts` | Utilidades de exportación CSV/JSON + descarga browser |
| `src/lib/export/index.ts` | Barrel export del módulo de exportación |
| `src/hooks/useAlertNotifications.ts` | Hook de notificaciones de alertas con Browser Notification API |

### Archivos modificados en Fase 3
| Archivo | Cambio |
|---------|--------|
| `src/lib/indicators/index.ts` | Añadidos Bollinger Bands y Estocástico |
| `src/lib/store/alert-store.ts` | Store Zustand completo para alertas |
| `src/lib/oakscript/indicators/trend.ts` | Implementación real (era stub) |
| `src/lib/oakscript/indicators/breakout.ts` | Implementación real (era stub) |
| `src/lib/oakscript/indicators/momentum.ts` | Implementación real (era stub) |
| `src/lib/oakscript/indicators/volatility.ts` | Implementación real (era stub) |
| `src/lib/oakscript/indicators/turtle-miura.ts` | Implementación real (era stub) |
| `src/lib/oakscript/indicators/relative-strength.ts` | Implementación real (era stub) |
| `src/lib/signal/engine.ts` | Motor de señales usando indicadores reales |
| `src/hooks/useChartWS.ts` | Corregido subscribeKline a args posicionales |
| `src/hooks/useChartData.ts` | Corregido fetchKlines a 3 args |
| `src/components/chart/PriceChart.tsx` | Múltiples correcciones de imports y sintaxis |

### Verificación
- ✅ Build exitoso: `next build` compila sin errores
- ✅ Tests: 57/57 pasan (10 archivos de test)
- ✅ TypeScript: Sin errores de tipo

---

> **Próximo paso**: al completar la Fase 3, se realizará un commit separado y se actualizará el repositorio. Después se iniciará la Fase 4 (UX/UI y Accesibilidad).
