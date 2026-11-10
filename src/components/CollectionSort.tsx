import { useTranslation } from 'react-i18next';
import BuilderSelect from './promptbuilder/BuilderSelect';
import type { GallerySort } from '../utils/collectionSort';
export default function CollectionSort<T extends GallerySort>({
  value,
  change,
  random = false,
}: {
  value: T;
  change: (value: T) => void;
  // Only the gallery offers its per-visit random order.
  random?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="collection-sort">
      <BuilderSelect
        label={t('Sort')}
        value={value}
        change={(next) => change(next as T)}
        options={[
          ...(random ? [{ value: 'random', label: t('Random') }] : []),
          { value: 'newest', label: t('Newest') },
          { value: 'oldest', label: t('Oldest') },
        ]}
      />
    </div>
  );
}
