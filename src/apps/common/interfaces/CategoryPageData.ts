// CategoryPageData.ts

export interface CategoryPageData {
  default: {
    url?: string;
    header_title?: string;
    page_title_text?: string;
    filter_heading?: string;
    sorter_price?: string;
    sorter_size?: string;
    ascending?: string;
    filters?: Record<string, Record<string, number>>;
    limiter?: string[];
    breadcrumbs?: string[];
    grid_mode?: string;
    list_mode?: string;
  };
}
