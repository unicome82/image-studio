import { useTranslation } from 'react-i18next';
import Icon from '../Icon';
import { defaultDepiction, type Option, type Selection } from '../../utils/promptBuilder';
import { selectedBuilderOptions } from '../../utils/selectedOptions';
import { optionLabelKey } from '../../utils/optionChoices';
export interface SelectedOptionsProps {
  catalog: Option[];
  selection: Selection;
  fields: Record<string, string>;
  photo: boolean;
  design?: boolean;
  remove?: (category: string, id: string) => void;
  english?: boolean;
  /** Mockup settings show the depiction level instead of a single image's ratio. */
  mockup?: boolean;
}
export default function SelectedOptions({
  catalog,
  selection,
  fields,
  photo,
  design = false,
  remove,
  english = false,
  mockup = false,
}: SelectedOptionsProps) {
  const { t } = useTranslation(undefined, english ? { lng: 'en' } : undefined);
  const options = selectedBuilderOptions(catalog, selection, photo, design).filter(
    (option) => option.category !== 'Outline',
  );
  const outline =
    !photo && !design
      ? catalog.find(
          (option) => option.category === 'Outline' && option.id === selection.Outline?.[0],
        )
      : undefined;
  const depiction = catalog.find(
    (option) =>
      option.category === 'Depiction' &&
      option.id === (selection.Depiction?.[0] ?? defaultDepiction),
  );
  const fixedOptions = [
    {
      key: 'type',
      title: t('Type'),
      label: t(design ? 'Design' : photo ? 'Photo' : 'Illustration'),
    },
    ...(mockup || !fields['Aspect Ratio']
      ? []
      : [{ key: 'ratio', title: t('Aspect ratio'), label: fields['Aspect Ratio'] }]),
    ...(outline ? [{ key: 'outline', title: t('Outline'), label: t(outline.label) }] : []),
    ...(mockup && depiction
      ? [{ key: 'depiction', title: t('Depiction'), label: t(optionLabelKey(depiction)) }]
      : []),
  ];
  const optionLabel = (option: Option) => t(optionLabelKey(option));
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
            {tag.label}
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
