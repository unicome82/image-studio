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
      <span>{t('Sort')}</span>
      <BuilderSelect
        label={t('Sort')}
        value={value}
        change={(next) => change(next as SortOrder)}
        options={[
          { value: 'newest', label: t('Recently saved') },
          { value: 'oldest', label: t('Oldest saved') },
          { value: 'name-asc', label: t('Name A–Z') },
          { value: 'name-desc', label: t('Name Z–A') },
        ]}
      />
    </div>
  );
}
