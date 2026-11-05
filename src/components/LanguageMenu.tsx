import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';
import './LanguageMenu.scss';

export default function LanguageMenu() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const initialFocus = useRef<'first' | 'last' | 'selected'>('selected');
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const items = menu.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]');
    const selected = menu.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]');
    const target =
      initialFocus.current === 'first'
        ? items?.[0]
        : initialFocus.current === 'last'
          ? items?.[items.length - 1]
          : selected;
    target?.focus();
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  return (
    <div
      className="language-menu"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        className={'icon-button language-trigger' + (open ? ' active' : '')}
        aria-label={t('Language')}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          initialFocus.current = 'selected';
          setOpen(!open);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            initialFocus.current = event.key === 'ArrowDown' ? 'first' : 'last';
            setOpen(true);
          }
        }}
      >
        <Icon name="language" size={20} />
      </button>
      {open && (
        <div
          ref={menu}
          id={menuId}
          className="language-dropdown"
          role="menu"
          aria-label={t('Language')}
          onKeyDown={(event) => {
            const items = Array.from(
              menu.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? [],
            );
            const index = items.indexOf(document.activeElement as HTMLButtonElement);
            const next =
              event.key === 'ArrowDown'
                ? (index + 1) % items.length
                : event.key === 'ArrowUp'
                  ? (index - 1 + items.length) % items.length
                  : event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? items.length - 1
                      : undefined;
            if (next !== undefined) {
              event.preventDefault();
              items[next]?.focus();
            }
          }}
        >
          {(
            [
              { code: 'en', label: 'English' },
              { code: 'ko', label: '한국어' },
            ] as const
          ).map(({ code, label }) => (
            <button
              key={code}
              className="language-option"
              role="menuitemradio"
              aria-checked={i18n.resolvedLanguage === code}
              lang={code}
              tabIndex={-1}
              onClick={() => {
                void i18n.changeLanguage(code);
                setOpen(false);
                trigger.current?.focus();
              }}
            >
              {label}
              {i18n.resolvedLanguage === code && <Icon name="check" size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
