"use client";

import { ChevronRight, Ellipsis } from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ResponsiveBreadcrumbsProps {
  items: readonly BreadcrumbItem[];
}

function BreadcrumbSegment({
  item,
  current = false,
}: {
  item: BreadcrumbItem;
  current?: boolean;
}) {
  if (current) {
    return (
      <span
        className="breadcrumb-current"
        aria-current="page"
        aria-label={item.label}
        title={item.label}
      >
        {item.label}
      </span>
    );
  }

  return item.href ? (
    <Link href={item.href} className="breadcrumb-parent" title={item.label}>
      {item.label}
    </Link>
  ) : (
    <span className="breadcrumb-parent" title={item.label}>
      {item.label}
    </span>
  );
}

export function ResponsiveBreadcrumbs({ items }: ResponsiveBreadcrumbsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLOListElement>(null);
  const [collapseIntermediateItems, setCollapseIntermediateItems] = useState(false);
  const firstItem = items[0];
  const currentItem = items.at(-1);
  const intermediateItems = items.slice(1, -1);

  useEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const measureCapacity = () => {
      setCollapseIntermediateItems(
        intermediateItems.length > 0 &&
          measure.getBoundingClientRect().width > container.clientWidth,
      );
    };

    measureCapacity();
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measureCapacity);
    resizeObserver?.observe(container);

    const mutationObserver = new MutationObserver(measureCapacity);
    mutationObserver.observe(measure, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    window.addEventListener("resize", measureCapacity);
    return () => {
      resizeObserver?.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", measureCapacity);
    };
  }, [intermediateItems.length, items]);

  if (!firstItem || !currentItem) return null;

  return (
    <div className="breadcrumb-layout" ref={containerRef}>
      <ol className="breadcrumb-list">
        {collapseIntermediateItems ? (
          <>
            <li className="breadcrumb-item">
              <BreadcrumbSegment item={firstItem} />
            </li>
            <li className="breadcrumb-overflow-separator" aria-hidden="true">
              <ChevronRight
                size={13}
                className="breadcrumb-separator"
                aria-hidden="true"
              />
            </li>
            <BreadcrumbOverflowMenu items={intermediateItems} />
            <li className="breadcrumb-item">
              <ChevronRight
                size={13}
                className="breadcrumb-separator"
                aria-hidden="true"
              />
              <BreadcrumbSegment item={currentItem} current />
            </li>
          </>
        ) : (
          items.map((item, index) => (
            <li className="breadcrumb-item" key={`${item.label}-${index}`}>
              {index > 0 ? (
                <ChevronRight
                  size={13}
                  className="breadcrumb-separator"
                  aria-hidden="true"
                />
              ) : null}
              <BreadcrumbSegment item={item} current={index === items.length - 1} />
            </li>
          ))
        )}
      </ol>

      <ol
        className="breadcrumb-measure-list"
        ref={measureRef}
        aria-hidden="true"
      >
        {items.map((item, index) => (
          <li className="breadcrumb-item" key={`${item.label}-${index}`}>
            {index > 0 ? (
              <ChevronRight
                size={13}
                className="breadcrumb-separator"
                aria-hidden="true"
              />
            ) : null}
            <span
              className={
                index === items.length - 1
                  ? "breadcrumb-current"
                  : "breadcrumb-parent"
              }
            >
              {item.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

interface BreadcrumbOverflowMenuProps {
  items: readonly BreadcrumbItem[];
}

export function BreadcrumbOverflowMenu({ items }: BreadcrumbOverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    menuRef.current
      ?.querySelector<HTMLElement>("[role='menuitem']")
      ?.focus({ preventScroll: true });
  }, [open]);

  const moveMenuFocus = (
    event: ReactKeyboardEvent<HTMLDivElement>,
    direction: 1 | -1,
  ) => {
    const itemsInMenu = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>("[role='menuitem']"),
    );
    if (itemsInMenu.length === 0) return;

    const currentIndex = itemsInMenu.indexOf(document.activeElement as HTMLElement);
    const nextIndex =
      currentIndex === -1
        ? 0
        : (currentIndex + direction + itemsInMenu.length) % itemsInMenu.length;
    event.preventDefault();
    itemsInMenu[nextIndex]?.focus();
  };

  return (
    <li className="breadcrumb-overflow-item">
      <button
        ref={triggerRef}
        type="button"
        className="breadcrumb-overflow-trigger"
        aria-label="Show hidden breadcrumb items"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <Ellipsis size={16} aria-hidden="true" />
      </button>

      {open ? (
        <div
          id={menuId}
          ref={menuRef}
          className="breadcrumb-overflow-menu"
          role="menu"
          aria-label="Hidden breadcrumb items"
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") moveMenuFocus(event, 1);
            if (event.key === "ArrowUp") moveMenuFocus(event, -1);
            if (event.key === "Home") {
              event.preventDefault();
              event.currentTarget
                .querySelector<HTMLElement>("[role='menuitem']")
                ?.focus();
            }
            if (event.key === "End") {
              const menuItems = event.currentTarget.querySelectorAll<HTMLElement>(
                "[role='menuitem']",
              );
              event.preventDefault();
              menuItems.item(menuItems.length - 1)?.focus();
            }
          }}
        >
          {items.map((item, index) =>
            item.href ? (
              <Link
                key={`${item.label}-${index}`}
                href={item.href}
                className="breadcrumb-overflow-menu-item"
                role="menuitem"
                title={item.label}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={`${item.label}-${index}`}
                type="button"
                className="breadcrumb-overflow-menu-item"
                role="menuitem"
                title={item.label}
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
              >
                {item.label}
              </button>
            ),
          )}
        </div>
      ) : null}
    </li>
  );
}
