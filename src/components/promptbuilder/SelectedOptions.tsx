import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import type { Option, Selection } from '../../utils/promptBuilder';
import { complexityUiLabels as complexityLabels } from '../../utils/promptBuilder';
import { selectedBuilderOptions } from '../../utils/selectedOptions';
export interface SelectedOptionsProps {
  catalog: Option[];
  selection: Selection;
  fields: Record<string, string>;
  photo: boolean;
  design?: boolean;
  complexity: number;
  remove?: (category: string, id: string) => void;
}
export default function SelectedOptions({
  catalog,
  selection,
  fields,
  photo,
  design = false,
  complexity,
  remove,
}: SelectedOptionsProps) {
  const { t } = useTranslation();
  const options = selectedBuilderOptions(catalog, selection, fields, photo, design).filter(
    (option) => option.category !== 'Outline',
  );
  const outline =
    !photo && !design
      ? catalog.find(
          (option) =>
            option.category === 'Outline' && option.id === (selection.Outline?.[0] ?? 'coloronly'),
        )
      : undefined;
  const fixedOptions = [
    { key: 'ratio', title: t('Aspect ratio'), label: fields['Aspect Ratio'] || '1:1' },
    { key: 'complexity', title: t('Complexity'), label: t(complexityLabels[complexity - 1]) },
    ...(outline ? [{ key: 'outline', title: t('Outline'), label: t(outline.label) }] : []),
  ];
  const optionLabel = (option: Option) =>
    t(option.label.replace(' Modern', '').replace(/\s+illustration\b/gi, ''));
  if (!remove) {
    const tags = [
      ...fixedOptions,
      ...options.map((option) => ({
        key: `${option.category}:${option.id}`,
        title: `${t(option.category)}: ${optionLabel(option)}`,
        label: optionLabel(option),
      })),
    ];
    return (
      <div className="option-tags" role="group" aria-label={t('Selected options')}>
        {tags.map((tag) => (
          <span key={tag.key} title={tag.title}>
            #{tag.label}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className="selected-options" role="group" aria-label={t('Selected options')}>
      {fixedOptions.map((option) => (
        <span className="selected-option fixed-option" key={option.key} title={option.title}>
          {option.label}
        </span>
      ))}
      {options.map((option) => {
        const label = optionLabel(option);
        return (
          <span
            className="selected-option"
            key={`${option.category}:${option.id}`}
            title={`${t(option.category)}: ${label}`}
          >
            <span className="selected-option-label">{label}</span>
            <button
              className="selected-option-remove"
              aria-label={t('Remove {{label}} option', { label })}
              onClick={() => remove(option.category, option.id)}
            >
              <Icon name="close" size="16" />
            </button>
          </span>
        );
      })}
    </div>
  );
}
