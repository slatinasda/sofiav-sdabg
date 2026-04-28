export class RangePagination {
  private currentPage: number;

  constructor(
    private startRange: number,
    private endRange: number,
    private perPage: number,
  ) {
    this.currentPage = 1;
  }

  getCurrentPage(): number {
    return this.currentPage;
  }

  getPerPage(): number {
    return this.perPage;
  }

  getCurrentRange(): [number, number] {
    const start = this.startRange - 1 + (this.currentPage - 1) * this.perPage;
    const end = Math.min(this.endRange, start + this.perPage);
    return [start, end];
  }

  getTotalPages(): number {
    const totalItems = this.endRange - (this.startRange + 1);
    return Math.ceil(totalItems / this.perPage);
  }

  hasPreviousPage(): boolean {
    const previousPage = this.currentPage - 1;
    return previousPage >= 1;
  }

  setPreviousPage(): void {
    if (!this.hasPreviousPage()) {
      return;
    }

    const newPage = this.currentPage - 1;
    this.currentPage = newPage;
  }

  hasNextPage(): boolean {
    const nextPage = this.currentPage + 1;
    return nextPage <= this.getTotalPages();
  }

  setNextPage(): void {
    if (!this.hasNextPage()) {
      return;
    }

    const newPage = this.currentPage + 1;
    this.currentPage = newPage;
  }
}
