let index = 0;
export function createUniqueId() {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1000);
  index++;
  return `${timestamp}${random}${index}`;
}
