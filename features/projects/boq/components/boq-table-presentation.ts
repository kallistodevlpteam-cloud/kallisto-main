import { BoqItem, BoqSection, BoqSubsection } from "@/types/domain/project-boq";

export interface BoqDisplaySubsection {
  id: string;
  code: string;
  title: string;
  itemCount: number;
  subtotal: number;
  items: BoqItem[];
}

export interface BoqDisplaySection {
  id: string;
  code: string;
  title: string;
  itemCount: number;
  subtotal: number;
  directItems: BoqItem[];
  subsections: BoqDisplaySubsection[];
}

/**
 * Maps domain BoqSection[] to presentation BoqDisplaySection[]
 * preserving canonical 3-level hierarchy (directItems + subsections).
 */
export function toDisplaySections(sections: BoqSection[]): BoqDisplaySection[] {
  return (sections ?? []).map((section) => ({
    id: section.id,
    code: section.code,
    title: section.title,
    itemCount: section.itemCount,
    subtotal: section.subtotal,
    directItems: section.directItems ?? [],
    subsections: (section.subsections ?? []).map((sub) => ({
      id: sub.id,
      code: sub.code,
      title: sub.title,
      itemCount: sub.itemCount,
      subtotal: sub.subtotal,
      items: sub.items ?? [],
    })),
  }));
}
