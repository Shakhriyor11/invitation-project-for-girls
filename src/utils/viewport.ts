/** Telefon o‘lchamidagi ekranmi? Animatsiyalar sonini kamaytirish uchun ishlatiladi. */
export const isCompactViewport = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches

export const randomBetween = (min: number, max: number): number =>
  min + Math.random() * (max - min)

export const pickRandom = <T,>(items: readonly T[]): T =>
  items[Math.floor(Math.random() * items.length)]
