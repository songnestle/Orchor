/** Lightweight prompt hash — no crypto deps required for the MVP. */
export function promptHash(prompt: string): string {
  let h = 5381;
  for (let i = 0; i < prompt.length; i++) {
    h = ((h << 5) + h) ^ prompt.charCodeAt(i);
  }
  const hex = (h >>> 0).toString(16).padStart(8, "0");
  return `sf_${hex}_${prompt.length}`;
}
