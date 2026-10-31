'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  titleId?: string;
  ariaLabel?: string;
  maxWidth?: string;
  showCloseButton?: boolean;
  disableEscape?: boolean;
  disableBackdropClick?: boolean;
  zIndex?: string;
  contentClassName?: string;
  backdropClassName?: string;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Reusable, fully accessible modal dialog shell conforming to WCAG 2.2 AA.
 * Features:
 * - Tab and Shift+Tab keyboard focus trapping
 * - Automatic focus restoration to the trigger element on close
 * - Intelligent initial focus targeting inside the dialog
 * - Escape key dismissal with optional override
 * - Screen-reader semantics: role="dialog", aria-modal="true", aria-labelledby
 * - Body scroll lock while modal is visible
 * - Click-outside backdrop dismissal
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  titleId,
  ariaLabel,
  maxWidth = 'max-w-md',
  showCloseButton = false,
  disableEscape = false,
  disableBackdropClick = false,
  zIndex = 'z-50',
  contentClassName = '',
  backdropClassName = '',
  initialFocusRef,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // 1. Capture trigger focus, lock body scroll, and set initial dialog focus
  useEffect(() => {
    if (!isOpen) return;

    // Capture currently focused element for restoration when dialog closes
    previousActiveElementRef.current = document.activeElement as HTMLElement | null;

    // Prevent background scrolling while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Set initial focus
    const focusRaf = requestAnimationFrame(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length > 0) {
          // Prefer focusing the first input/textarea/select if present, else first focusable
          const firstInput = Array.from(focusables).find(
            (el) => el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT'
          );
          (firstInput || focusables[0]).focus();
        } else {
          modalRef.current.focus();
        }
      }
    });

    return () => {
      cancelAnimationFrame(focusRaf);
      document.body.style.overflow = originalOverflow;
      // Restore focus to the trigger element that opened the modal
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen, initialFocusRef]);

  // 2. Handle Escape key and Tab/Shift+Tab focus trapping
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Escape key dismissal
      if (e.key === 'Escape') {
        if (!disableEscape) {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
        return;
      }

      // Tab and Shift+Tab focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        // If focus managed to escape to outside the modal dialog, pull it back
        if (!modalRef.current.contains(document.activeElement)) {
          e.preventDefault();
          firstElement.focus();
          return;
        }

        if (e.shiftKey) {
          // Shift + Tab moving backwards
          if (document.activeElement === firstElement || document.activeElement === modalRef.current) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab moving forwards
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [isOpen, disableEscape, onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !disableBackdropClick) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 ${backdropClassName}`}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-label={ariaLabel}
        tabIndex={-1}
        className={`w-full ${maxWidth} rounded-2xl glass-card p-6 shadow-2xl relative border border-slate-200 dark:border-slate-800 text-left outline-none ${contentClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
};


