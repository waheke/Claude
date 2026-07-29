import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { PersonIcon } from './icons';
import { colorForOwner, hexToRgba } from '../lib/ownerColor';

interface OwnerBadgeProps {
  owner: string;
  owners: string[];
  onChange: (owner: string) => void;
}

export function OwnerBadge({ owner, owners, onChange }: OwnerBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [draftOwner, setDraftOwner] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      setIsOpen(false);
    }
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    function handleClose() {
      setIsOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleClose, true);
    window.addEventListener('resize', handleClose);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleClose, true);
      window.removeEventListener('resize', handleClose);
    };
  }, [isOpen]);

  function openPicker() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) setPosition({ top: rect.bottom + 4, left: rect.left });
    setDraftOwner('');
    setIsOpen(true);
  }

  function choose(name: string) {
    onChange(name.trim());
    setIsOpen(false);
  }

  function handleAddNew() {
    const name = draftOwner.trim();
    if (!name) return;
    choose(name);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddNew();
    }
  }

  const color = owner ? colorForOwner(owner) : null;
  const otherOwners = owners.filter((name) => name !== owner);

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        className={`feature-card__owner${owner ? '' : ' feature-card__owner--empty'}`}
        style={color ? { backgroundColor: hexToRgba(color, 0.1), color } : undefined}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          openPicker();
        }}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <PersonIcon />
        <span>{owner || 'Add owner'}</span>
      </button>
      {isOpen &&
        position &&
        createPortal(
          <div ref={popoverRef} className="owner-picker" style={{ top: position.top, left: position.left }}>
            {owner && (
              <button type="button" className="owner-picker__option owner-picker__option--clear" onClick={() => choose('')}>
                No owner
              </button>
            )}
            {otherOwners.map((name) => (
              <button key={name} type="button" className="owner-picker__option" onClick={() => choose(name)}>
                <span className="owner-picker__dot" style={{ backgroundColor: colorForOwner(name) }} />
                {name}
              </button>
            ))}
            <div className="owner-picker__new">
              <label className="visually-hidden" htmlFor="owner-picker-new-input">
                New owner name
              </label>
              <input
                id="owner-picker-new-input"
                type="text"
                className="owner-picker__input"
                placeholder="Add new owner"
                value={draftOwner}
                onChange={(e) => setDraftOwner(e.target.value)}
                onKeyDown={handleInputKeyDown}
                autoFocus
              />
              <button type="button" className="owner-picker__add" onClick={handleAddNew}>
                Add
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
