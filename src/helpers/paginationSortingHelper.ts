type PaginationOptions = {
  page?: string | number | undefined;
  limit?: string | number | undefined;
};

type PaginationResult = {
  page: number;
  limit: number;
  skip: number;
};

const calculatePagination = (options: PaginationOptions): PaginationResult => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export { calculatePagination };
export type { PaginationOptions, PaginationResult };