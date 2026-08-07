"use client";

import { Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./basics-workspace.module.css";

export function ExpertSearchBar({
  initialValue = "",
  projectId,
}: {
  initialValue?: string;
  projectId?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (projectId) params.set("projectId", projectId);
    router.push(`/basics/experts?${params.toString()}`);
  }

  return (
    <form className={styles.searchPanel} onSubmit={handleSubmit} role="search">
      <label className={styles.searchInputWrap}>
        <span className="sr-only">Search construction specialists</span>
        <Search size={16} aria-hidden="true" />
        <input
          className={styles.searchInput}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search structural engineers, HVAC consultants, BIM specialists..."
        />
      </label>
      <button className={styles.primaryButton} type="submit">
        Search experts
      </button>
    </form>
  );
}

