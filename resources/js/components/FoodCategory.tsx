import { Link } from '@inertiajs/react';
import { catalogUrl, type Filters } from '@/types/catalog';

export const categoryImages: Record<string, string> = {
  Ayam: 'rice',
  Pizza: 'pizza',
  Bakar: 'grill',
  Kopi: 'coffee',
  Segar: 'salad',
  Burger: 'burger',
  Mie: 'noodles',
  Roti: 'toast',
};

export default function FoodCategory({ categories, filters }: { categories: string[]; filters: Filters }) {
  return (
    <nav className="food-categories" aria-label="Kategori makanan">
      {categories.map(category => {
        const isSelected = filters.category === category;
        const targetUrl = catalogUrl({
          ...filters,
          category: isSelected ? null : category,
        });

        return (
          <Link
            key={category}
            href={targetUrl}
            className={`food-category ${isSelected ? 'selected' : ''}`}
            aria-current={isSelected ? 'true' : undefined}
          >
            <span className="category-picture">
              <img
                src={`/images/demo/${categoryImages[category] ?? 'rice'}.jpg`}
                alt=""
                width="72"
                height="72"
                loading="lazy"
              />
            </span>
            <span className="category-label">{category}</span>
          </Link>
        );
      })}
    </nav>
  );
}
