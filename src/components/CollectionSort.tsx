import { useTranslation } from 'react-i18next';
import BuilderSelect from './promptbuilder/BuilderSelect';
import type { CollectionSort as SortOrder } from '../utils/collectionSort';
export default function CollectionSort({
  value,
  change,
}: {
  value: SortOrder;
  change: (value: SortOrder) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="collection-sort">
      <BuilderSelect
        label={t('Sort')}
        value={value}
        change={(next) => change(next as SortOrder)}
        options={[
          { value: 'newest', label: t('Newest') },
          { value: 'oldest', label: t('Oldest') },
          { value: 'name-asc', label: t('A–Z') },
        ]}
      />
    </div>
  );
}
