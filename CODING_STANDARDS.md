# Coding Standards

## CSS units

Pick the unit by what the value must follow. This rule comes from Kevin Powell's video "Are you using the right CSS units?".

| Property | Unit | Reason |
|---|---|---|
| `font-size` | `rem` | It follows the visitor's browser font-size setting. Do not use `px` for font sizes. |
| `padding`, `margin`, `gap` | `rem`. Use `em` when the spacing must scale with the element's own text, for example button padding. | `rem` refers to the root and does not compound when elements are nested. `em` keeps spacing proportional to its own label. |
| Media queries | `em` | Media queries resolve `em` against the browser's default font size, so breakpoints respond correctly when the visitor changes it. |
| `border`, `border-radius`, `box-shadow`, `outline` | `px` | These details must not grow with text size. |
| Heights | `min-height` | Do not set a fixed `height` on a box that holds content: it cuts the content off when the content grows. |
| Widths | `%`, `max-width`, or `ch` for line length | The layout follows the space it is in. |

## Fluid sizes with `clamp()`

Write every fluid size as `clamp(<min>, <preferred>, <max>)`:

- Set `<min>` and `<max>` in `rem`.
- Set `<preferred>` as a `rem` value plus a viewport unit, for example `1rem + min(8vw, 8vh)`. The `rem` part keeps the value tied to the visitor's font-size setting. Use `min(vw, vh)` when the size must also fit the viewport height.

Example:

```css
font-size: clamp(2.25rem, 1rem + min(8vw, 8vh), 6rem);
```

Do not write a fluid size as a viewport unit alone, for example `font-size: 5vw`. It ignores the visitor's font-size setting.
