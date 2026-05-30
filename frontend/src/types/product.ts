export interface Variant {
  id: any;
  sku?: string;
  color?: string;
  size?: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  imageUrl?: string;
}

export interface Product {
  id: any;
  name: string;
  description?: string;
  price: number;
  salePrice?: number;
  brandId?: number;
  brand?: string;
  brandName?: string;
  categoryId?: number;
  category?: string;
  categoryName?: string;
  totalQuantity?: number;
  sizes?: string;
  sizeOptions?: string[];
  thumbnailUrl?: string;
  imageUrl?: string;
  variants?: Variant[];
}

export interface ProductFilters {
  keyword?: string;
  minPrice?: string;
  maxPrice?: string;
  brandId?: number | string;
  brand?: string;
  categoryId?: number | string;
  category?: string;
  page?: number;
  size?: number;
  sort?: string;
}
