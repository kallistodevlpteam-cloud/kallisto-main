"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Plus, ChevronDown, Check } from "lucide-react";
import styles from "../home-workspace.module.css";

export interface TemplateCardItem {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  isMyTemplate?: boolean;
}

const INITIAL_TEMPLATES: TemplateCardItem[] = [
  {
    id: "tpl-1",
    title: "Create a product shot grid",
    description: "Turn one product photo into nine styled shots.",
    category: "Product Shots",
    imageUrl: "/assets/template_product_grid.png",
    isMyTemplate: false,
  },
  {
    id: "tpl-2",
    title: "Convert portrait to street shoot",
    description: "Turn portraits into street-style images.",
    category: "Character and Portrait",
    imageUrl: "/assets/template_street_shoot.png",
    isMyTemplate: false,
  },
  {
    id: "tpl-3",
    title: "Show on a smartphone screen",
    description: "Place your image onto the screen of a smartphone.",
    category: "Mockups",
    imageUrl: "/assets/template_smartphone_screen.png",
    isMyTemplate: true,
  },
];

const CATEGORIES = ["All", "Product Shots", "Character and Portrait", "Mockups"];

export function TemplatesSection() {
  const [activeTab, setActiveTab] = useState<"explore" | "my-templates">("explore");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTemplates = INITIAL_TEMPLATES.filter((tpl) => {
    // Filter by tab
    if (activeTab === "my-templates" && !tpl.isMyTemplate) {
      return false;
    }
    // Filter by category
    if (selectedCategory !== "All" && tpl.category !== selectedCategory) {
      return false;
    }
    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = tpl.title.toLowerCase().includes(q);
      const matchDesc = tpl.description.toLowerCase().includes(q);
      const matchCat = tpl.category.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchCat;
    }
    return true;
  });

  return (
    <section className={styles.templatesSectionContainer}>
      {/* 1. Header Row */}
      <div className={styles.templatesHeaderRow}>
        <div className={styles.templatesTitleGroup}>
          <h2 className={styles.templatesTitle}>Templates</h2>
          <span className={styles.betaBadge}>Beta</span>
        </div>

        <button type="button" className={styles.btnNewTemplate}>
          <Plus size={15} />
          <span>New Template</span>
        </button>
      </div>

      {/* 2. Tabs Row */}
      <div className={styles.templatesTabRow}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === "explore" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("explore")}
        >
          Explore
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === "my-templates" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("my-templates")}
        >
          My Templates
        </button>
      </div>

      {/* 3. Search and Category Filter Row */}
      <div className={styles.templatesFilterControls}>
        <div className={styles.templateSearchInputWrap}>
          <Search size={16} className={styles.templateSearchIcon} />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.templateSearchInput}
          />
        </div>

        <div className={styles.categoryDropdownContainer} ref={categoryMenuRef}>
          <button
            type="button"
            className={`${styles.btnCategoryFilter} ${selectedCategory !== "All" ? styles.categoryFilterActive : ""}`}
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          >
            <Plus size={13} />
            <span>
              {selectedCategory === "All" ? "Category" : selectedCategory}
            </span>
            <ChevronDown size={14} className={styles.chevronIcon} />
          </button>

          {isCategoryOpen && (
            <div className={styles.categoryDropdownMenu} role="menu">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`${styles.categoryMenuItem} ${
                    selectedCategory === cat ? styles.categoryMenuItemSelected : ""
                  }`}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setIsCategoryOpen(false);
                  }}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. 3-Column Template Grid */}
      <div className={styles.templatesGrid}>
        {filteredTemplates.length === 0 ? (
          <div className={styles.emptyTemplatesState}>
            <p>No templates found matching your criteria.</p>
          </div>
        ) : (
          filteredTemplates.map((tpl) => (
            <div key={tpl.id} className={styles.templateCard}>
              <div className={styles.templateImageContainer}>
                <Image
                  src={tpl.imageUrl}
                  alt={tpl.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={styles.templateCardImg}
                  unoptimized
                />
              </div>

              <div className={styles.templateCardBody}>
                <h3 className={styles.templateCardTitle}>{tpl.title}</h3>
                <p className={styles.templateCardDesc}>{tpl.description}</p>
                <span className={styles.templateCategoryPill}>{tpl.category}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
