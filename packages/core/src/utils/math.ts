export const round = (value: number, precision = 3): number =>
  parseFloat(value.toFixed(precision))

export const clamp = (value: number, min = 0, max = 100): number =>
  Math.min(Math.max(value, min), max)

export const adjust = (
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number,
): number =>
  round(toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin))

export const distance = (x1: number, y1: number, x2: number, y2: number): number =>
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
