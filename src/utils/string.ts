export const leftPad = (text: string, len: number, padding: string): string => {
  const lenToPad = len - text.length;
  return lenToPad > 0
    ? `${padding.repeat(lenToPad)}${text}`
    : text;
}