export class RangePagination {
  private currentPage: number;

  constructor(
    private startRange: number,
    private endRange: number,
    private perPage: number,
  ) {
    this.currentPage = 1;
  }

  getCurrentRange(): [number, number] {
    const start = this.startRange - 1 + (this.currentPage - 1) * this.perPage;
    const end = Math.min(this.endRange, start + this.perPage);
    return [start, end];
  }

  getTotalPages(): number {
    const totalItems = this.endRange - this.startRange + 1;
    return Math.ceil(totalItems / this.perPage);
  }

  hasPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  setPreviousPage(): void {
    if (this.hasPreviousPage()) {
      this.currentPage -= 1;
    }
  }

  hasNextPage(): boolean {
    return this.currentPage < this.getTotalPages();
  }

  setNextPage(): void {
    if (this.hasNextPage()) {
      this.currentPage += 1;
    }
  }

  setPage(page: number): void {
    const totalPages = this.getTotalPages();
    this.currentPage = Math.min(Math.max(page, 1), totalPages);
  }

  getPageForItem(item: number): number {
    return Math.floor((item - this.startRange) / this.perPage) + 1;
  }
}
