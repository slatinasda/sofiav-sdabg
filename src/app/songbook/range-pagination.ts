export class RangePagination {
  constructor(
    private currentPage: number,
    private perPage: number,
    private total: number,
  ) { }

  getCurrentPage(): number {
    return this.currentPage;
  }

  getPerPage(): number {
    return this.perPage;
  }

  getTotal(): number {
    return this.total;
  }

  setPreviousPage(): void {
    const newPage = this.currentPage - 1;
    if (newPage < 1) {
      return;
    }

    this.currentPage = newPage;
  }

  setNextPage(): void {
    const newPage = this.currentPage + 1;
    if (newPage > Math.ceil(this.total / this.perPage)) {
      return;
    }

    this.currentPage = newPage;
  }

  getCurrentRange(): [number, number] {
    const start = (this.currentPage - 1) * this.perPage;
    const end = Math.min(this.total, this.currentPage * this.perPage);
    return [start, end];
  }
}
