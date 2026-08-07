import {
  BoqItem,
  BoqSection,
  BoqSubsection,
  ProjectBoqSnapshot,
} from "@/types/domain/project-boq";
import { calculateBoqAmount } from "../services/project-boq-calculations";

export type LegacyOrCurrentSection = Omit<BoqSection, "directItems" | "subsections"> & {
  directItems?: BoqItem[];
  items?: BoqItem[];
  subsections?: Array<
    Omit<BoqSubsection, "items"> & {
      items?: BoqItem[];
    }
  >;
};

export type LegacyOrCurrentProjectBoqSnapshot = Omit<ProjectBoqSnapshot, "sections"> & {
  sections: LegacyOrCurrentSection[];
};

export function normalizeProjectBoqSnapshot(
  snapshot: LegacyOrCurrentProjectBoqSnapshot
): ProjectBoqSnapshot {
  let totalWorkItems = 0;

  const normalizedSections: BoqSection[] = (snapshot.sections ?? []).map((secInput) => {
    // 1. Resolve directItems (handling legacy section.items)
    const rawDirectItems = secInput.directItems ?? secInput.items ?? [];
    const directItems: BoqItem[] = rawDirectItems.map((item) => {
      const amount = calculateBoqAmount(item.quantity, item.rate);
      return {
        ...item,
        sectionId: secInput.id,
        subsectionId: item.subsectionId ?? null,
        amount,
      };
    });

    // 2. Resolve subsections
    const rawSubsections = secInput.subsections ?? [];
    const subsections: BoqSubsection[] = rawSubsections.map((subInput) => {
      const subItems: BoqItem[] = (subInput.items ?? []).map((item) => {
        const amount = calculateBoqAmount(item.quantity, item.rate);
        return {
          ...item,
          sectionId: secInput.id,
          subsectionId: subInput.id,
          amount,
        };
      });

      const subtotal = subItems.reduce((acc, item) => {
        return item.amount !== null ? acc + item.amount : acc;
      }, 0);

      totalWorkItems += subItems.length;

      return {
        id: subInput.id,
        sectionId: secInput.id,
        code: subInput.code,
        title: subInput.title,
        itemCount: subItems.length,
        subtotal,
        items: subItems,
      };
    });

    totalWorkItems += directItems.length;

    const directSubtotal = directItems.reduce((acc, item) => {
      return item.amount !== null ? acc + item.amount : acc;
    }, 0);

    const subsectionsSubtotal = subsections.reduce((acc, sub) => acc + sub.subtotal, 0);

    const sectionItemCount =
      directItems.length + subsections.reduce((acc, sub) => acc + sub.itemCount, 0);

    return {
      id: secInput.id,
      code: secInput.code,
      title: secInput.title,
      itemCount: sectionItemCount,
      subtotal: directSubtotal + subsectionsSubtotal,
      directItems,
      subsections,
    };
  });

  const calculatedBaseTotal = normalizedSections.reduce(
    (acc, sec) => acc + sec.subtotal,
    0
  );

  return {
    ...snapshot,
    baseTotal: calculatedBaseTotal,
    sectionCount: normalizedSections.length,
    workItemCount: totalWorkItems,
    sections: normalizedSections,
  };
}
