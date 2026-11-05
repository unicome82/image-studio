import { useTranslation } from 'react-i18next';
import Icon from './Icon';
import Panel from './Panel';
import SavePrompt from './promptbuilder/SavePrompt';
import type { GalleryTile } from '../types';
import './ImageDetail.scss';
interface Props {
  image: GalleryTile;
  photo: boolean;
  bookmarked: boolean;
  stylePrompt: string;
  savePreview: string;
  save: (name: string) => boolean;
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
        <span>{t('IMAGE DETAIL')}</span>
        <button className="icon-button" aria-label={t('Close image detail')} onClick={p.close}>
          <Icon name="close" size={17} />
        </button>
      </div>
      <div className="detail-scroll">
        <div
          className="detail-preview"
          style={{ backgroundColor: image.color, aspectRatio: `${image.width} / ${image.height}` }}
        >
          <button className="icon-button" aria-label={t('Expand preview')} onClick={p.preview}>
            <Icon name="fullscreen" size={15} />
          </button>
        </div>
        <div className="detail-title">
          <h2>
            {t(image.label)} {String(image.index + 1).padStart(2, '0')}
          </h2>
          <button
            className="icon-button"
            aria-label={t('Bookmark selected placeholder')}
            aria-pressed={p.bookmarked}
            onClick={p.toggleBookmark}
          >
            <Icon name="bookmark" size={19} />
          </button>
        </div>
        <div className="tags">
          <span>#{image.group}</span>
          <span>#{p.photo ? 'photo' : 'illustration'}</span>
        </div>
        <section className="detail-section">
          <h3>
            {t('Style prompt')}
            <button
              className="icon-button"
              aria-label={t('Copy style prompt')}
              onClick={() => p.copy(p.stylePrompt)}
            >
              <Icon name="content_copy" size={13} />
            </button>
          </h3>
          <p className="detail-prompt" aria-label={t('Selected style prompt')}>
            {p.stylePrompt}
          </p>
          <div className="prompt-actions">
            <SavePrompt key={image.id} prompt={p.savePreview} save={p.save} />
            <button
              className="primary"
              disabled
              title={t('Add an image and connect an authorized publishing workflow to publish')}
            >
              <Icon name="cloud_upload" size={14} />
              {t('Publish')}
            </button>
          </div>
        </section>
      </div>
    </Panel>
  );
}
