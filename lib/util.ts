export const getDateForDb = () => new Date().toISOString().replace(/T|Z/g, ' ').slice(0, -5);
