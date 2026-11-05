import { useEffect, useId, useRef, useState } from 'react';
import Icon from '../Icon';
import '../LanguageMenu.scss';
import './BuilderSelect.scss';
interface Props {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
  change: (value: string) => void;
}
export default function BuilderSelect({ label, value, options, disabled, change }: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const initialFocus = useRef<'first' | 'last' | 'selected'>('selected');
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const items = menu.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]');
    const selected = menu.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]');
    (initialFocus.current === 'first'
      ? items?.[0]
      : initialFocus.current === 'last'
        ? items?.[items.length - 1]
        : selected
    )?.focus();
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  return (
    <div
      className="builder-select"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        className="builder-select-trigger"
        ref={trigger}
        disabled={disabled}
        aria-label={`${label}: ${options.find((option) => option.value === value)?.label ?? value}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
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
        {options.find((option) => option.value === value)?.label ?? value}
        <span className="builder-select-arrow" aria-hidden="true" />
      </button>
      {open && (
        <div
          className="language-dropdown builder-select-dropdown"
          id={id}
          ref={menu}
          role="menu"
          aria-label={label}
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
          {options.map((option) => (
            <button
              key={option.value}
              className="language-option"
              role="menuitemradio"
              aria-checked={value === option.value}
              tabIndex={-1}
              onClick={() => {
                change(option.value);
                setOpen(false);
                trigger.current?.focus();
              }}
            >
              {option.label}
              {value === option.value && <Icon name="check" size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
