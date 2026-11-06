import { useTranslation } from 'react-i18next';
import Icon from './Icon';
import FavoriteButton from './FavoriteButton';
import { imageName } from '../utils/imageName';
import Panel from './Panel';
import SavePrompt from './promptbuilder/SavePrompt';
import SelectedOptions, { type SelectedOptionsProps } from './promptbuilder/SelectedOptions';
import type { GalleryTile } from '../types';
interface Props {
  image: GalleryTile;
  photo: boolean;
  bookmarked: boolean;
  stylePrompt: string;
  savePreview: string;
  saveOptions: Omit<SelectedOptionsProps, 'remove'>;
  save: () => boolean;
  copy: (text: string) => void;
  toggleBookmark: () => void;
  close: () => void;
  preview: () => void;
}
export default function ImageDetail(p: Props) {
  const { t } = useTranslation();
  const image = p.image;
  return (
    <Panel className="detail" label={t('Image detail')} close={p.close}>
      <div className="panel-heading">
        <div className="detail-name">
          <h2 className="detail-title">{imageName(image)}</h2>
          <button
            className="detail-name-copy"
            aria-label={t('Copy image name')}
            onClick={() => p.copy(imageName(image))}
          >
            <Icon name="content_copy" size="16" />
          </button>
        </div>
        <button
          className="icon-button close-button"
          aria-label={t('Close image detail')}
          onClick={p.close}
        >
          <Icon name="close" size="24" className="w200" />
        </button>
      </div>
      <div className="detail-scroll">
        <div
          className="detail-preview"
          style={{
            backgroundColor: image.color,
            aspectRatio: `${image.width} / ${image.height}`,
          }}
        >
          <button
            className="detail-preview-open"
            aria-label={t('Preview {{name}}', { name: imageName(image) })}
            onClick={p.preview}
          />
          <FavoriteButton
            active={p.bookmarked}
            label={t(
              p.bookmarked ? 'Remove {{name}} from favorites' : 'Add {{name}} to favorites',
              { name: imageName(image) },
            )}
            toggle={p.toggleBookmark}
          />
        </div>
        <SelectedOptions {...p.saveOptions} english />
        <section className="detail-section">
          <h3>
            {t('Style prompt')}
            <button
              className="icon-button"
              aria-label={t('Copy style prompt')}
              onClick={() => p.copy(p.stylePrompt)}
            >
              <Icon name="content_copy" size="16" />
            </button>
          </h3>
          <p className="detail-prompt" aria-label={t('Selected style prompt')} tabIndex={0}>
            {p.stylePrompt}
          </p>
        </section>
      </div>
      <div className="prompt-actions detail-actions">
        <SavePrompt key={image.id} prompt={p.savePreview} save={p.save} selected={p.saveOptions} />
        <button
          className="primary"
          disabled
          title={t('Add an image and connect an authorized publishing workflow to publish')}
        >
          <Icon name="cloud_upload" size="14" />
          {t('Publish')}
        </button>
      </div>
    </Panel>
  );
}
