import { Link } from '@inertiajs/react';
import { catalogUrl, type Filters } from '@/types/catalog';
export const categoryImages: Record<string, string> = { Ayam: 'rice', Pizza: 'pizza', Bakar: 'grill', Kopi: 'coffee', Segar: 'salad', Burger: 'burger', Mie: 'noodles', Roti: 'toast' };
export default function FoodCategory({ categories, filters }: { categories: string[]; filters: Filters }) {
  return <nav className="food-categories" aria-label="Kategori makanan">{categories.map(category => <Link key={category} href={catalogUrl({ ...filters, category })} className={`food-category ${filters.category === category ? 'selected' : ''}`}><span className="category-picture"><img src={`/images/demo/${categoryImages[category]}.jpg`} alt="" width="64" height="64" /></span><span>{category}</span></Link>)}</nav>;
}
