'use client';

import { useLanguageStore } from '@/lib/stores';
import { t } from '@/lib/i18n';
import { Category } from '@/lib/types';
import { OCCASIONS } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface FilterState {
  minPrice?: string;
  maxPrice?: string;
  occasion?: string;
  color?: string;
  categories?: string[];
  sort?: string;
}

interface ProductFiltersProps {
  categories: Category[];
  selectedFilters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClear: () => void;
  isMobile?: boolean;
}

const COLORS = [
  { name: 'Red', value: 'red', hex: '#EF4444' },
  { name: 'Pink', value: 'pink', hex: '#EC4899' },
  { name: 'White', value: 'white', hex: '#F9FAFB' },
  { name: 'Purple', value: 'purple', hex: '#A855F7' },
  { name: 'Yellow', value: 'yellow', hex: '#EAB308' },
  { name: 'Mixed', value: 'mixed', hex: 'conic-gradient(#EF4444, #EC4899, #A855F7, #EAB308, #22C55E, #3B82F6, #EF4444)' },
];

export default function ProductFilters({
  categories,
  selectedFilters,
  onFilterChange,
  onClear,
  isMobile = false,
}: ProductFiltersProps) {
  const { locale } = useLanguageStore();
  const hasFilters =
    !!selectedFilters.minPrice ||
    !!selectedFilters.maxPrice ||
    !!selectedFilters.occasion ||
    !!selectedFilters.color ||
    (selectedFilters.categories && selectedFilters.categories.length > 0);

  const handleCategoryToggle = (catId: string) => {
    const current = selectedFilters.categories || [];
    const next = current.includes(catId)
      ? current.filter((c) => c !== catId)
      : [...current, catId];
    onFilterChange({ ...selectedFilters, categories: next.length > 0 ? next : undefined });
  };

  const handlePriceChange = (key: 'minPrice' | 'maxPrice', value: string) => {
    onFilterChange({ ...selectedFilters, [key]: value || undefined });
  };

  const handleOccasionChange = (value: string) => {
    onFilterChange({
      ...selectedFilters,
      occasion: selectedFilters.occasion === value ? undefined : value,
    });
  };

  const handleColorChange = (value: string) => {
    onFilterChange({
      ...selectedFilters,
      color: selectedFilters.color === value ? undefined : value,
    });
  };

  const handleSortChange = (value: string) => {
    onFilterChange({ ...selectedFilters, sort: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-charcoal">{t('common.filters', locale)}</h3>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-destructive text-xs p-0 h-auto hover:text-destructive"
          >
            {t('filter.clearAll', locale)}
          </Button>
        )}
      </div>

      <Separator />

      {/* Sort */}
      <div>
        <Label className="text-sm font-medium text-charcoal mb-3 block">
          {t('common.sort', locale)}
        </Label>
        <Select
          value={selectedFilters.sort || 'newest'}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t('filter.newest', locale)}</SelectItem>
            <SelectItem value="price_low">{t('filter.priceLowHigh', locale)}</SelectItem>
            <SelectItem value="price_high">{t('filter.priceHighLow', locale)}</SelectItem>
            <SelectItem value="popular">{t('filter.mostPopular', locale)}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Categories */}
      <div>
        <h4 className="text-sm font-medium text-charcoal mb-3">
          {t('common.categories', locale)}
        </h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <Checkbox
                checked={selectedFilters.categories?.includes(cat.id) || false}
                onCheckedChange={() => handleCategoryToggle(cat.id)}
                className="rounded border-border data-[state=checked]:bg-gold data-[state=checked]:border-gold"
              />
              <span className="text-sm text-charcoal-light group-hover:text-charcoal transition-colors">
                {locale === 'ar' ? cat.nameAr : cat.nameEn}
              </span>
            </label>
          ))}
          {categories.length === 0 && (
            <p className="text-xs text-muted-foreground">No categories</p>
          )}
        </div>
      </div>

      <Separator />

      {/* Occasions */}
      <div>
        <h4 className="text-sm font-medium text-charcoal mb-3">
          {t('filter.occasion', locale)}
        </h4>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
          {OCCASIONS.map((occ) => (
            <button
              key={occ.id}
              onClick={() => handleOccasionChange(occ.id)}
              className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                selectedFilters.occasion === occ.id
                  ? 'bg-gold text-white shadow-sm'
                  : 'bg-cream text-charcoal-light hover:bg-accent'
              }`}
            >
              {locale === 'ar' ? occ.nameAr : occ.nameEn}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-medium text-charcoal mb-3">
          {t('filter.priceRange', locale)}
        </h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={selectedFilters.minPrice || ''}
            onChange={(e) => handlePriceChange('minPrice', e.target.value)}
            className="h-9 text-sm"
            min="0"
          />
          <span className="text-muted-foreground text-sm">—</span>
          <Input
            type="number"
            placeholder="Max"
            value={selectedFilters.maxPrice || ''}
            onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
            className="h-9 text-sm"
            min="0"
          />
        </div>
      </div>

      <Separator />

      {/* Color */}
      <div>
        <h4 className="text-sm font-medium text-charcoal mb-3">
          {t('filter.color', locale)}
        </h4>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorChange(color.value)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                selectedFilters.color === color.value
                  ? 'border-gold scale-110 ring-2 ring-gold/30'
                  : 'border-border hover:border-gold/50'
              }`}
              style={{
                backgroundColor: color.value === 'mixed' ? undefined : color.hex,
                background: color.value === 'mixed' ? color.hex : undefined,
              }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Mobile apply button */}
      {isMobile && (
        <>
          <Separator />
          <Button
            onClick={onClear}
            variant="outline"
            className="w-full rounded-xl"
          >
            {t('filter.clearAll', locale)}
          </Button>
        </>
      )}
    </div>
  );
}
