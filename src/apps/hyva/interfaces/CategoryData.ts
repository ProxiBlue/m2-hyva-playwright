// CategoryData.ts

export interface CategoryData {
  default: {
    url?: string;
    header_title?: string;
    page_title_text?: string;
    filter_heading?: string;
    sorter_price?: string;
    sorter_position?: string;
    sorter_name?: string;
    ascending?: string;
    filters?: Record<string, Record<string, number>>;
    limiter?: string[];
    breadcrumbs?: string[];
    grid_mode?: string;
    list_mode?: string;
  };
}
