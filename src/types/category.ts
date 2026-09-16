export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  imagePath?: string | null;
  href?: string | null;
  displayOrder?: number | null;
  isActive?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}
