import {
  BoqItem,
  BoqSection,
  BoqSubsection,
  ProjectBoqSnapshot,
} from "@/types/domain/project-boq";
import { calculateBoqAmount } from "../services/project-boq-calculations";

export interface BoqItemContext {
  section: BoqSection;
  subsection: BoqSubsection | null;
  item: BoqItem;
}

/**
 * Ordering Contract:
 * Direct section items render first -> Subsections in stored array order -> Items inside each group in stored array order.
 * Cross-group ordering is not inferred from item codes.
 */

export function getSubsectionItems(subsection: BoqSubsection): BoqItem[] {
  return subsection.items ?? [];
}

export function getSectionItems(section: BoqSection): BoqItem[] {
  const directItems = section.directItems ?? [];
  const subsectionItems = (section.subsections ?? []).flatMap((sub) => sub.items ?? []);
  return [...directItems, ...subsectionItems];
}

export function getAllBoqItems(snapshot: ProjectBoqSnapshot): BoqItem[] {
  return (snapshot.sections ?? []).flatMap((sec) => getSectionItems(sec));
}

export function getSubsectionItemCount(subsection: BoqSubsection): number {
  return (subsection.items ?? []).length;
}

export function getSectionItemCount(section: BoqSection): number {
  const directCount = (section.directItems ?? []).length;
  const subCount = (section.subsections ?? []).reduce(
    (acc, sub) => acc + getSubsectionItemCount(sub),
    0
  );
  return directCount + subCount;
}

export function calculateSubsectionSubtotal(subsection: BoqSubsection): number {
  return (subsection.items ?? []).reduce((acc, item) => {
    return item.amount !== null && item.amount !== undefined ? acc + item.amount : acc;
  }, 0);
}

export function calculateSectionSubtotal(section: BoqSection): number {
  const directSubtotal = (section.directItems ?? []).reduce((acc, item) => {
    return item.amount !== null && item.amount !== undefined ? acc + item.amount : acc;
  }, 0);

  const subsectionsSubtotal = (section.subsections ?? []).reduce(
    (acc, sub) => acc + calculateSubsectionSubtotal(sub),
    0
  );

  return directSubtotal + subsectionsSubtotal;
}

export function findBoqItem(
  snapshot: ProjectBoqSnapshot,
  itemId: string
): BoqItem | null {
  const context = findBoqItemContext(snapshot, itemId);
  return context ? context.item : null;
}

export function findBoqItemContext(
  snapshot: ProjectBoqSnapshot,
  itemId: string
): BoqItemContext | null {
  for (const section of snapshot.sections ?? []) {
    for (const item of section.directItems ?? []) {
      if (item.id === itemId) {
        return { section, subsection: null, item };
      }
    }

    for (const subsection of section.subsections ?? []) {
      for (const item of subsection.items ?? []) {
        if (item.id === itemId) {
          return { section, subsection, item };
        }
      }
    }
  }

  return null;
}

/**
 * Immutable Hierarchy Recalculation:
 * Returns a new snapshot object with updated derived section/subsection counts and subtotals,
 * preserving unchanged item references while guaranteeing input immutability.
 */
export function recalculateBoqHierarchy(
  snapshot: ProjectBoqSnapshot
): ProjectBoqSnapshot {
  let totalWorkItems = 0;

  const nextSections: BoqSection[] = (snapshot.sections ?? []).map((section) => {
    const nextDirectItems: BoqItem[] = (section.directItems ?? []).map((item) => {
      const amount = calculateBoqAmount(item.quantity, item.rate);
      return amount === item.amount ? item : { ...item, amount };
    });

    const nextSubsections: BoqSubsection[] = (section.subsections ?? []).map(
      (subsection) => {
        const nextSubItems: BoqItem[] = (subsection.items ?? []).map((item) => {
          const amount = calculateBoqAmount(item.quantity, item.rate);
          return amount === item.amount ? item : { ...item, amount };
        });

        const subtotal = nextSubItems.reduce((acc, item) => {
          return item.amount !== null && item.amount !== undefined ? acc + item.amount : acc;
        }, 0);

        totalWorkItems += nextSubItems.length;

        return {
          ...subsection,
          itemCount: nextSubItems.length,
          subtotal,
          items: nextSubItems,
        };
      }
    );

    totalWorkItems += nextDirectItems.length;

    const directSubtotal = nextDirectItems.reduce((acc, item) => {
      return item.amount !== null && item.amount !== undefined ? acc + item.amount : acc;
    }, 0);

    const subtotal =
      directSubtotal + nextSubsections.reduce((acc, sub) => acc + sub.subtotal, 0);
    const itemCount =
      nextDirectItems.length +
      nextSubsections.reduce((acc, sub) => acc + sub.itemCount, 0);

    return {
      ...section,
      itemCount,
      subtotal,
      directItems: nextDirectItems,
      subsections: nextSubsections,
    };
  });

  return {
    ...snapshot,
    sectionCount: nextSections.length,
    workItemCount: totalWorkItems,
    sections: nextSections,
  };
}
