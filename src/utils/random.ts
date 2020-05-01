export const pickOneAtRandom = <T>(items: T[]): T =>
  items[Math.floor(items.length * Math.random())];