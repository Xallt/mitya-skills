# Motion that earns its place

Use motion to move attention or show behavior that a static image cannot convey
as clearly. The default theme intentionally has no slide transitions.

## Focus sequence

A reusable pattern: context → highlight → zoom/isolate → demonstrate change.
Use one DOM element throughout, transformed from its position inside the UI into
the close-up. Fade surrounding context rather than replacing the element with a
second, reset copy. Use a short ease-out transform; avoid bounce and decorative
pulsing. Presenter clicks advance meaningful steps, not individual sentences.

Separate the presentation phase from live application state. A clock can run
while the phase changes. Use a monotonic elapsed-time source such as
performance.now(), not increment-per-frame counters that depend on refresh rate.

For a threshold example: start ticking when the slide becomes visible; preserve
time through highlight and zoom; use a brief explicit fast-forward; then resume
natural elapsed time. A >8:00 rule changes state at 8:01, not 8:00. Numbers in a
demonstration must not be mistaken for measured results.

## Verification

Check entry, each next/previous step, direct navigation, leaving mid-animation,
and revisiting. Cancel stale animation frames on exit and choose a clear reset
policy. Rapid clicks must not leave stale overlays or duplicate timers. Under
prefers-reduced-motion, retain the states and timing meaning while removing
nonessential travel/rolling effects. Notes should describe presenter controls.

Inspect intermediate frames, not just the start and end. Keep text and controls
readable during movement, and avoid clipping as a number changes width.
