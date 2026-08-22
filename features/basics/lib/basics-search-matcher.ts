/**
 * Intelligent fuzzy matcher, stemming, and spell-mistake tolerant search
 * for Kallisto Basics Provider Discovery.
 */

// Category keyword expansions
const CATEGORY_EXPANSIONS: Record<string, string[]> = {
  design_architecture: ["architecture", "architect", "architectural", "design", "interior", "landscape", "facade", "visualization", "lighting"],
  digital_production: ["bim", "digital", "3d", "revit", "navisworks", "modelling", "rendering", "visualization", "twin", "drafting", "cad"],
  engineering: ["engineering", "engineer", "structural", "structure", "rcc", "steel", "mep", "hvac", "electrical", "plumbing", "fire", "safety", "drainage", "geotechnical", "soil"],
  specialist_consulting: ["consulting", "consultant", "acoustics", "acoustic", "facade", "sustainability", "green", "leed", "igbc", "energy", "specialist"],
  commercial_compliance: ["commercial", "compliance", "quantity", "surveying", "qs", "boq", "cost", "estimation", "permit", "pm", "project management", "kmbr", "kpbr"],
};

// Domain synonym dictionary
const SYNONYM_MAP: Record<string, string[]> = {
  architecture: ["architectural", "architect", "building design", "landscape", "interior", "facade", "visualization", "renderfield", "studio canopy"],
  architectural: ["architecture", "architect", "visualization", "acoustics", "design"],
  architect: ["architecture", "architectural", "designer"],
  mep: ["mechanical", "electrical", "plumbing", "hvac", "integrated mep", "circuit", "enviro", "aqualine", "flow hvac"],
  structural: ["structure", "structures", "rcc", "steel", "seismic", "foundation", "axis", "beamworks", "gridline"],
  structure: ["structural", "structures", "rcc", "steel"],
  bim: ["revit", "navisworks", "3d bim", "digital twin", "modubim", "clash detection", "coordination"],
  hvac: ["cooling", "ventilation", "thermal", "heating", "flow hvac", "ashrae"],
  electrical: ["lighting", "power", "circuit", "substation", "wiring", "luma"],
  plumbing: ["phe", "drainage", "water supply", "sanitary", "aqualine"],
  fire: ["fire safety", "life safety", "nfpa", "safecore", "suppression"],
  cost: ["qs", "quantity surveying", "boq", "estimation", "costcraft", "ledger qs", "rate analysis"],
  qs: ["quantity surveying", "cost", "boq", "estimation", "ledger qs"],
  boq: ["bill of quantities", "quantity surveying", "cost", "estimation"],
  geotechnical: ["geotech", "soil", "soil testing", "foundation", "strata", "terra geotechnics"],
  soil: ["geotechnical", "geotech", "foundation", "terra"],
  acoustics: ["acoustic", "sound", "noise", "echo acoustic lab", "reverberation"],
  sustainability: ["green building", "leed", "igbc", "energy modeling", "greenmetric"],
  landscape: ["landscaping", "gardens", "canopy", "studio canopy", "site planning"],
  permit: ["approvals", "kmbr", "kpbr", "municipal", "sanction", "permitpath"],
  pm: ["project management", "pmc", "construction management", "northgrid"],
};

// Normalize text by removing punctuation and converting to lowercase
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Light stemmer / root extractor for building industry terms
export function stemToken(token: string): string {
  const t = normalizeText(token);
  if (t.length <= 3) return t;

  if (t.startsWith("architect")) return "architect";
  if (t.startsWith("structur")) return "structur";
  if (t.startsWith("electr")) return "electr";
  if (t.startsWith("visual") || t.startsWith("vizual")) return "visual";
  if (t.startsWith("acoust")) return "acoust";
  if (t.startsWith("geotech")) return "geotech";
  if (t.startsWith("sustain")) return "sustain";
  if (t.startsWith("plumb")) return "plumb";
  if (t.startsWith("drain")) return "drain";
  if (t.startsWith("consult")) return "consult";
  if (t.startsWith("engin")) return "engin";
  if (t.startsWith("coordinat")) return "coordinat";
  if (t.startsWith("render")) return "render";
  if (t.startsWith("draft")) return "draft";
  if (t.startsWith("landscap")) return "landscap";
  if (t.startsWith("light")) return "light";
  if (t.startsWith("estimat")) return "estimat";
  if (t.startsWith("manag")) return "manag";

  return t
    .replace(/(?:ing|tion|tions|sion|sions|ed|er|ers|ment|ments|al|als|ic|ics|ive|ives|ly|es|s)$/, "");
}

// Fast Levenshtein distance
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1,     // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Max edit distance threshold based on token length
function maxEditDistance(wordLen: number): number {
  if (wordLen <= 3) return 0;
  if (wordLen <= 5) return 1;
  if (wordLen <= 8) return 2;
  return 3;
}

/**
 * Checks if a search query matches the provider's text with fuzzy/spelling tolerance
 */
export function matchesFuzzyQuery(
  rawQuery: string,
  targetFields: (string | undefined | null)[],
  primaryCategory?: string,
): boolean {
  const cleanQuery = normalizeText(rawQuery);
  if (!cleanQuery) return true;

  // Build target corpus
  const corpusTokens = new Set<string>();
  const rawTargetWords: string[] = [];

  for (const field of targetFields) {
    if (!field) continue;
    const normalized = normalizeText(field);
    if (!normalized) continue;
    const words = normalized.split(/\s+/);
    for (const w of words) {
      if (w.length > 1) {
        corpusTokens.add(w);
        corpusTokens.add(stemToken(w));
        rawTargetWords.push(w);
      }
    }
  }

  // Include primary category expansions
  if (primaryCategory && CATEGORY_EXPANSIONS[primaryCategory]) {
    for (const kw of CATEGORY_EXPANSIONS[primaryCategory]) {
      corpusTokens.add(kw);
      corpusTokens.add(stemToken(kw));
      rawTargetWords.push(kw);
    }
  }

  const queryWords = cleanQuery.split(/\s+/).filter(Boolean);
  const entireCorpusString = Array.from(corpusTokens).join(" ") + " " + rawTargetWords.join(" ");

  // Every word in query should match at least one aspect (AND logic across query tokens)
  return queryWords.every((qWord) => {
    // 1. Direct exact or substring match in corpus
    if (entireCorpusString.includes(qWord)) return true;

    // 2. Stemmed match (e.g. "architecture" stem matches "architectural" stem)
    const qStem = stemToken(qWord);
    if (corpusTokens.has(qStem)) return true;

    for (const token of corpusTokens) {
      if (token.startsWith(qStem) || qStem.startsWith(token)) return true;
    }

    // 3. Synonym dictionary lookup
    const synonyms = SYNONYM_MAP[qWord] || SYNONYM_MAP[qStem] || [];
    for (const syn of synonyms) {
      const synNorm = normalizeText(syn);
      if (entireCorpusString.includes(synNorm)) return true;
      const synStem = stemToken(synNorm);
      if (corpusTokens.has(synStem)) return true;
    }

    // 4. Fuzzy / Spell-mistake tolerance (Levenshtein distance)
    const maxDist = maxEditDistance(qWord.length);
    if (maxDist > 0) {
      for (const targetWord of rawTargetWords) {
        // Compare with full word
        if (Math.abs(targetWord.length - qWord.length) <= maxDist) {
          if (levenshtein(qWord, targetWord) <= maxDist) return true;
        }

        // Compare with target stem if available
        const targetStem = stemToken(targetWord);
        if (Math.abs(targetStem.length - qStem.length) <= maxDist) {
          if (levenshtein(qStem, targetStem) <= maxDist) return true;
        }
      }
    }

    return false;
  });
}
