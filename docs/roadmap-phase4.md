# 📋 Roadmap del proyecto TradingView Personal – Fase 4: UX/UI y Accesibilidad

## Subfase 4.1 – Diseño Responsive
- ⬜ Layout adaptativo para tablets (768px–1024px) con CSS Grid/Flexbox.
- ⬜ Sidebar colapsable en pantallas medianas.
- ⬜ Gráfico ocupa full-width cuando sidebar está colapsado.
- ⬜ BottomPanel responsive con stats apilables.
- ⬜ Breakpoints consistentes: sm(640), md(768), lg(1024), xl(1280).

## Subfase 4.2 – Accesibilidad (a11y)
- ⬜ ARIA labels en todos los componentes interactivos (botones, selects, inputs).
- ⬜ Navegación completa por teclado (Tab, Enter, Escape, flechas).
- ⬜ Contraste de colores WCAG 2.1 AA (mínimo 4.5:1 texto normal, 3:1 texto grande).
- ⬜ Focus visible en todos los elementos interactivos (ring outline).
- ⬜ Screen reader testing con NVDA/VoiceOver.
- ⬜ Skip-to-content link para navegación por teclado.
- ⬜ `role` y `aria-live` para contenido dinámico (alertas, señales, precios).

## Subfase 4.3 – Temas y Personalización
- ⬜ Sistema de temas con CSS custom properties (dark/light).
- ⬜ Tema claro completo con variables CSS para fondo, texto, bordes, paneles.
- ⬜ Toggle de tema en Header con persistencia en localStorage.
- ⬜ Colores de gráfico personalizables (velas bullish/bearish, grid, crosshair).
- ⬜ Layout guardable: posición de paneles, indicadores activos, tamaño de sidebar.

## Subfase 4.4 – Onboarding y Tooltips
- ⬜ Tutorial guiado para nuevos usuarios (primer visitante).
- ⬜ Tooltips contextuales en herramientas de dibujo e indicadores.
- ⬜ Documentación de atajos de teclado accesible con `?`.
- ⬜ Atajos de teclado para acciones frecuentes: cambiar símbolo, timeframe, toggle indicadores.
- ⬜ Badge "nuevo" en features recién implementadas.

## Subfase 4.5 – Internacionalización (i18n)
- ⬜ Configurar `next-intl` para soporte multi-idioma.
- ⬜ Diccionarios ES (español) y EN (inglés) como mínimo.
- ⬜ Selector de idioma en Header.
- ⬜ Formato de números/fechas según locale (coma vs punto decimal).
- ⬜ Persistencia de idioma preferido en localStorage.

---

## Estado de la implementación

| Subfase | Completado | Pendiente | Porcentaje |
|---------|-----------|-----------|------------|
| 4.1 Responsive | 0/5 | 5 | 0% |
| 4.2 Accesibilidad | 0/7 | 7 | 0% |
| 4.3 Temas | 0/5 | 5 | 0% |
| 4.4 Onboarding | 0/5 | 5 | 0% |
| 4.5 i18n | 0/5 | 5 | 0% |
| **Total** | **0/27** | **27** | **0%** |

---

> **Próximo paso**: al completar las Fases 2 y 3, se iniciará la Fase 4. Se recomienda empezar por 4.2 (Accesibilidad) ya que mejora la experiencia para todos los usuarios y es base para 4.1 (Responsive).
