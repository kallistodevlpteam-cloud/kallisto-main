import { BoqItem, BoqSection } from "@/types/domain/project-boq";
import { SortValue, StatusFilter } from "../components/boq-filter-popover";
import { isMissingBoqValue } from "../services/project-boq-calculations";

function matchesItemSearch(item: BoqItem, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    item.code.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q) ||
    item.unit.toLowerCase().includes(q)
  );
}

function matchesItemStatus(item: BoqItem, statusFilter: StatusFilter): boolean {
  if (statusFilter === "all") return true;
  if (statusFilter === "draft") return item.status === "Draft";
  if (statusFilter === "reviewed") return item.status === "Reviewed";
  if (statusFilter === "approved") return item.status === "Approved";
  if (statusFilter === "issues") {
    return isMissingBoqValue(item.quantity) || isMissingBoqValue(item.rate);
  }
  return true;
}

function sortItems(items: BoqItem[], sort: SortValue): BoqItem[] {
  const list = [...items];
  list.sort((a, b) => {
    if (sort === "code") {
      return a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: "base" });
    }
    if (sort === "description") {
      return a.description.localeCompare(b.description);
    }
    if (sort === "amount-desc") {
      return (b.amount ?? -1) - (a.amount ?? -1);
    }
    if (sort === "amount-asc") {
      return (a.amount ?? Number.MAX_VALUE) - (b.amount ?? Number.MAX_VALUE);
    }
    return 0;
  });
  return list;
}

export function filterAndSortBoqSections(
  sections: BoqSection[],
  searchQuery: string,
  statusFilter: StatusFilter,
  sort: SortValue
): BoqSection[] {
  const query = searchQuery.trim().toLowerCase();

  return sections
    .map((section) => {
      const sectionMatchesQuery =
        query === "" ||
        section.code.toLowerCase().includes(query) ||
        section.title.toLowerCase().includes(query);

      // Filter direct items
      let directItems = section.directItems.filter((item) => {
        const itemMatches = sectionMatchesQuery || matchesItemSearch(item, query);
        const statusMatches = matchesItemStatus(item, statusFilter);
        return itemMatches && statusMatches;
      });
      directItems = sortItems(directItems, sort);

      // Filter subsections
      const subsections = section.subsections
        .map((subsection) => {
          const subsectionMatchesQuery =
            sectionMatchesQuery ||
            query === "" ||
            subsection.code.toLowerCase().includes(query) ||
            subsection.title.toLowerCase().includes(query);

          let subItems = subsection.items.filter((item) => {
            const itemMatches = subsectionMatchesQuery || matchesItemSearch(item, query);
            const statusMatches = matchesItemStatus(item, statusFilter);
            return itemMatches && statusMatches;
          });
          subItems = sortItems(subItems, sort);

          const subtotal = subItems.reduce((acc, i) => (i.amount !== null ? acc + i.amount : acc), 0);

          return {
            ...subsection,
            itemCount: subItems.length,
            subtotal,
            items: subItems,
          };
        })
        .filter((sub) => sub.items.length > 0);

      const directSubtotal = directItems.reduce((acc, i) => (i.amount !== null ? acc + i.amount : acc), 0);
      const subsectionsSubtotal = subsections.reduce((acc, sub) => acc + sub.subtotal, 0);
      const itemCount = directItems.length + subsections.reduce((acc, sub) => acc + sub.itemCount, 0);

      return {
        ...section,
        itemCount,
        subtotal: directSubtotal + subsectionsSubtotal,
        directItems,
        subsections,
      };
    })
    .filter((sec) => sec.directItems.length > 0 || sec.subsections.length > 0);
}
