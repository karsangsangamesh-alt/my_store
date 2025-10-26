'use client';

import Link from 'next/link';
import { Category } from '@/types/Category';

interface MegaMenuProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

export default function MegaMenu({ categories, isOpen, onClose }: MegaMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 w-full bg-white shadow-lg border-t z-40">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-8">
          {categories.map((category) => (
            <div key={category.id}>
              <Link
                href={`/category/${category.slug}`}
                className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition"
                onClick={onClose}
              >
                {category.name}
              </Link>
              {category.subcategories && category.subcategories.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {category.subcategories.map((sub) => (
                    <li key={sub.id}>
                      <Link
                        href={`/category/${category.slug}/${sub.slug}`}
                        className="text-sm text-gray-600 hover:text-blue-600 transition"
                        onClick={onClose}
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}