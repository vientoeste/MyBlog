export const getDateForDb = () => new Date().toISOString().replace(/T|Z/g, ' ').slice(0, -5);

export class CustomError extends Error {
  constructor(message: string, status?: number) {
    super(message);
    Object.defineProperty(this, 'name', {
      configurable: true,
      writable: false,
      value: 'Error',
    });
    if (status) {
      this.status = status;
    }
  }

  status?: number;
}
