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

export type Nullable<T> = {
  [K in keyof T]: T[K] | null
};

export type NotNull<T> = {
  [K in keyof T]: Exclude<T[K], null>
};

export type Undefinedable<T> = {
  [K in keyof T]: T[K] | undefined
};

export const validateDtoForPatchReq = <T>(dto: Nullable<T>) => {
  const keys = Object.keys(dto) as Array<keyof T>;
  let count = 0;
  keys.filter((e) => e.toString().toLowerCase().match(/uuid/g) !== null).forEach((key) => {
    if (dto[key] !== null) {
      count += 1;
    }
  });

  return count > 0 && count < keys.length;
};
