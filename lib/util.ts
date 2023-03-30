export const getDateForDb = () => {
  return new Date().toISOString().replace(/T|Z/g, ' ').slice(0, -5);
};
