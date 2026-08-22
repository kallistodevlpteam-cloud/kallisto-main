"""AI-powered requirement analysis using Cerebras LLM with local fallback.

Provides:
  - check_completeness
  - detect_missing_requirements
  - detect_conflicts
  - detect_ambiguity
  - analyze_requirements (router that picks the best analysis; falls back to
    deterministic analysis if Cerebras is unavailable or quota-exhausted)

All functions accept a project payload and return structured insights for the
ODIN Studio panel.
"""

from __future__ import annotations

import json
import os
from typing import Any

# Optional Cerebras import — we catch import errors gracefully
try:
    from cerebras.cloud.sdk import Cerebras
    _CEREBRAS_AVAILABLE = True
except Exception:
    Cerebras = None  # type: ignore
    _CEREBRAS_AVAILABLE = False


def _get_cerebras_client() -> Any:
    api_key = os.environ.get("CEREBRAS_API_KEY")
    if not api_key or not _CEREBRAS_AVAILABLE:
        raise RuntimeError("CEREBRAS_API_KEY not configured or SDK unavailable.")
    return Cerebras(api_key=api_key)  # type: ignore


def _build_project_context(project: dict[str, Any]) -> str:
    """Serialize project data into a concise text block for the LLM prompt."""
    lines: list[str] = []
    lines.append(f"Project: {project.get('project_name', 'Unknown')}")
    lines.append(f"Type: {project.get('project_type', 'Unknown')}")
    lines.append(f"Location: {project.get('place', 'Unknown')}")
    lines.append(f"Client: {project.get('client_name', 'Unknown')}")
    lines.append(f"Budget: {project.get('estimated_overall_budget', 'Not specified')}")
    lines.append(f"Area: {project.get('sq_area', 'Not specified')}")

    requirements = project.get("requirements", [])
    if requirements:
        lines.append("\n--- Requirements ---")
        for req in requirements:
            label = req.get("requirement_name", "Unnamed")
            items = req.get("items", [])
            state = req.get("state", "unknown")
            priority = req.get("priority", "p2")
            lines.append(f"- {label} [{priority}] [{state}] {', '.join(items) if items else ''}")

    scopes = project.get("project_scopes", [])
    if scopes:
        lines.append("\n--- Scope ---")
        for s in scopes:
            lines.append(f"- {s.get('scope_name', '')}: {', '.join(s.get('items', []))}")

    spaces = project.get("project_spaces", [])
    if spaces:
        lines.append("\n--- Spaces ---")
        for sp in spaces:
            lines.append(f"- {sp.get('space_name', '')} (priority: {sp.get('priority', '')}, required: {sp.get('required', '')})")

    priorities = project.get("priorities", [])
    if priorities:
        lines.append("\n--- Client Priorities ---")
        for p in priorities:
            lines.append(f"- {p.get('priority_name', '')}: {', '.join(p.get('details', []))}")

    return "\n".join(lines)


def _call_cerebras(prompt: str, system_message: str | None = None) -> str:
    """Call the Cerebras chat completion API and return the text response."""
    client = _get_cerebras_client()
    messages: list[dict[str, str]] = []
    if system_message:
        messages.append({"role": "system", "content": system_message})
    messages.append({"role": "user", "content": prompt})

    response = client.chat.completions.create(
        messages=messages,
        model="gpt-oss-120b",
        max_tokens=2048,
        temperature=0.3,
    )
    return response.choices[0].message.content or ""


def _parse_insights_json(raw: str) -> list[dict[str, Any]]:
    """Extract a JSON array from the LLM response, with graceful fallback."""
    text = raw.strip()
    if "```json" in text:
        text = text.split("```json")[-1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].strip()
    try:
        parsed = json.loads(text)
        if isinstance(parsed, list):
            return parsed
        if isinstance(parsed, dict) and "insights" in parsed:
            return parsed["insights"]
    except (json.JSONDecodeError, ValueError):
        pass
    return [
        {
            "id": "ai-raw",
            "title": "AI Analysis Result",
            "scopeLabel": "Analysis",
            "summary": text[:500],
            "severity": "recommendation",
            "domainTag": "Scope",
        }
    ]


# ─── LOCAL FALLBACK ANALYSIS (deterministic, no external API) ─────────────

_severity_order: dict[str, int] = {
    "blocker": 0,
    "risk": 1,
    "contradiction": 2,
    "verification": 3,
    "missing_information": 4,
    "recommendation": 5,
    "change": 6,
    "inferred": 7,
    "strength": 8,
}


def _local_check_completeness(project: dict[str, Any]) -> list[dict[str, Any]]:
    """Deterministic completeness check based on presence of key fields."""
    insights: list[dict[str, Any]] = []
    has_budget = bool(project.get("estimated_overall_budget") or project.get("budget"))
    has_area = bool(project.get("sq_area"))
    has_timeline = bool(project.get("project_timeline") or project.get("client_expected_timeline"))
    reqs = project.get("requirements", [])
    has_site_req = any("site" in (r.get("requirement_name", "")).lower() for r in reqs)
    has_tech_req = any(r.get("domain") == "technical" or "technical" in (r.get("requirement_name", "")).lower() for r in reqs)

    if not has_budget:
        insights.append({
            "id": "comp-budget",
            "title": "Budget not specified",
            "scopeLabel": "Completeness",
            "summary": "No overall budget has been recorded for this project, making commercial feasibility impossible to assess.",
            "severity": "blocker",
            "domainTag": "Commercial",
            "whyFlagged": "Missing budget value",
            "affectedArea": "BOQ & Proposal Pricing",
            "suggestedQuestion": "What is the target budget range for this project?",
        })
    if not has_area:
        insights.append({
            "id": "comp-area",
            "title": "Built-up area not specified",
            "scopeLabel": "Completeness",
            "summary": "The built-up area is missing; this blocks space-planning and cost-per-sqft estimation.",
            "severity": "blocker",
            "domainTag": "Scope",
            "whyFlagged": "Missing sq_area",
            "affectedArea": "Space Planning & BOQ",
            "suggestedQuestion": "What is the approximate built-up area in sq ft?",
        })
    if not has_timeline:
        insights.append({
            "id": "comp-timeline",
            "title": "Timeline not defined",
            "scopeLabel": "Completeness",
            "summary": "No client-expected timeline is recorded; scheduling and milestone planning cannot proceed.",
            "severity": "verification",
            "domainTag": "Timeline",
            "whyFlagged": "Missing timeline",
            "affectedArea": "Schedule & Milestones",
            "suggestedQuestion": "What is the desired start and completion date?",
        })
    if not has_site_req:
        insights.append({
            "id": "comp-site",
            "title": "Site requirements incomplete",
            "scopeLabel": "Completeness",
            "summary": "Site-specific requirements (orientation, access, topography) are not yet captured.",
            "severity": "risk",
            "domainTag": "Site",
            "whyFlagged": "Missing site requirements",
            "affectedArea": "Site Planning & Logistics",
            "suggestedQuestion": "Can you provide plot dimensions, orientation, and access details?",
        })
    if not has_tech_req:
        insights.append({
            "id": "comp-technical",
            "title": "Technical requirements incomplete",
            "scopeLabel": "Completeness",
            "summary": "MEP and HVAC system requirements have not been documented.",
            "severity": "risk",
            "domainTag": "Technical",
            "whyFlagged": "Missing technical specs",
            "affectedArea": "MEP Design & Coordination",
            "suggestedQuestion": "What are the preferred HVAC, electrical, and smart-home systems?",
        })
    return insights


def _local_detect_missing(project: dict[str, Any]) -> list[dict[str, Any]]:
    """Deterministic missing-requirement detection."""
    insights: list[dict[str, Any]] = []
    reqs = project.get("requirements", [])
    req_names = {r.get("requirement_name", "").lower() for r in reqs}

    # Critical missing items
    critical_keywords = ["budget", "scope", "site", "structural", "foundation"]
    for kw in critical_keywords:
        if not any(kw in name for name in req_names):
            insights.append({
                "id": f"miss-{kw}",
                "title": f"Missing {kw.title()} requirement",
                "scopeLabel": "Missing Requirements",
                "summary": f"No explicit {kw} requirement was found in the client brief. This blocks downstream deliverables.",
                "severity": "blocker",
                "domainTag": "Scope" if kw in ("scope", "structural", "foundation") else "Site" if kw == "site" else "Commercial",
                "whyFlagged": f"Absent from requirements list",
                "affectedArea": f"{kw.title()} Definition",
                "suggestedQuestion": f"Can you confirm the {kw} requirements for this project?",
            })

    # Important missing items
    important_keywords = ["lighting", "flooring", "kitchen", "bathroom", "parking"]
    for kw in important_keywords:
        if not any(kw in name for name in req_names):
            insights.append({
                "id": f"miss-{kw}",
                "title": f"Missing {kw.title()} detail",
                "scopeLabel": "Missing Requirements",
                "summary": f"No {kw} specification was found; this will affect interior quality and cost accuracy.",
                "severity": "risk",
                "domainTag": "Technical" if kw in ("lighting",) else "Scope",
                "whyFlagged": f"Absent from requirements list",
                "affectedArea": f"{kw.title()} Design",
                "suggestedQuestion": f"What are the {kw} requirements and preferences?",
            })

    # Optional missing items
    optional_keywords = ["landscaping", "smart home", "security", "solar"]
    for kw in optional_keywords:
        if not any(kw in name for name in req_names):
            insights.append({
                "id": f"miss-{kw}",
                "title": f"Optional {kw.title()} not specified",
                "scopeLabel": "Missing Requirements",
                "summary": f"{kw.title()} details were not provided; it can be deferred if not required.",
                "severity": "recommendation",
                "domainTag": "Technical" if kw in ("smart home", "solar", "security") else "Scope",
                "whyFlagged": f"Absent from requirements list",
                "affectedArea": f"{kw.title()} Scope",
                "suggestedQuestion": f"Do you want {kw} included in the scope?",
            })

    return insights


def _local_detect_conflicts(project: dict[str, Any]) -> list[dict[str, Any]]:
    """Deterministic conflict detection."""
    insights: list[dict[str, Any]] = []
    budget = project.get("estimated_overall_budget") or project.get("budget")
    area = project.get("sq_area")
    timeline = project.get("client_expected_timeline") or project.get("project_timeline")
    reqs = project.get("requirements", [])

    # Budget vs area conflict (rough heuristic)
    if budget and area:
        try:
            budget_val = float(budget) if isinstance(budget, (int, float, str)) else 0
            area_val = float(area) if isinstance(area, (int, float, str)) else 1
            if area_val > 0 and budget_val / area_val < 800:  # Very low cost per sqft
                insights.append({
                    "id": "conf-budget-area",
                    "title": "Budget vs area mismatch",
                    "scopeLabel": "Conflicts",
                    "summary": f"The budget (₹{budget_val:,.0f}) appears low for the stated area ({area_val:,.0f} sq ft), suggesting a potential feasibility conflict.",
                    "severity": "blocker",
                    "domainTag": "Commercial",
                    "whyFlagged": "Cost per sq ft below feasible threshold",
                    "affectedArea": "BOQ & Pricing",
                    "suggestedQuestion": "Is the budget inclusive of all taxes, furniture, and MEP works?",
                })
        except (ValueError, TypeError):
            pass

    # Timeline vs multiple phases
    if timeline and isinstance(timeline, str) and any(k in timeline.lower() for k in ("6 month", "3 month", "quick", "fast")):
        room_count = sum(1 for r in reqs if "room" in r.get("requirement_name", "").lower())
        if room_count > 5:
            insights.append({
                "id": "conf-timeline-scope",
                "title": "Timeline vs scope mismatch",
                "scopeLabel": "Conflicts",
                "summary": f"A tight timeline ({timeline}) conflicts with the large room count ({room_count}), suggesting schedule risk.",
                "severity": "risk",
                "domainTag": "Timeline",
                "whyFlagged": "High scope + compressed schedule",
                "affectedArea": "Project Schedule",
                "suggestedQuestion": "Can the timeline be extended or the scope phased?",
            })

    return insights


def _local_detect_ambiguity(project: dict[str, Any]) -> list[dict[str, Any]]:
    """Deterministic ambiguity detection."""
    insights: list[dict[str, Any]] = []
    reqs = project.get("requirements", [])
    vague_phrases = ["good quality", "as needed", "standard", "best", "modern", "nice"]

    for r in reqs:
        value = str(r.get("value", "")).lower()
        for phrase in vague_phrases:
            if phrase in value:
                insights.append({
                    "id": f"amb-{r.get('id', 'unknown')}",
                    "title": f"Ambiguous requirement: {r.get('requirement_name', 'Unnamed')}",
                    "scopeLabel": "Ambiguity",
                    "summary": f"The requirement '{r.get('requirement_name')}' uses vague language ('{phrase}') that cannot be quantified or specified.",
                    "severity": "verification",
                    "domainTag": "Scope",
                    "whyFlagged": f"Contains vague phrase: '{phrase}'",
                    "affectedArea": "Specification & BOQ Accuracy",
                    "suggestedQuestion": f"Can you define the exact standard or specification for '{r.get('requirement_name')}'?",
                })
                break

    # Check for missing quantities on space items
    spaces = project.get("project_spaces", [])
    for sp in spaces:
        if not sp.get("approx_area_size") and not sp.get("quantity"):
            insights.append({
                "id": f"amb-space-{sp.get('space_name', 'unknown')}",
                "title": f"Unclear sizing for {sp.get('space_name', 'space')}",
                "scopeLabel": "Ambiguity",
                "summary": f"The space '{sp.get('space_name')}' lacks area or quantity information, blocking layout planning.",
                "severity": "risk",
                "domainTag": "Scope",
                "whyFlagged": "Missing area/quantity",
                "affectedArea": "Space Planning",
                "suggestedQuestion": f"What is the approximate area or quantity for '{sp.get('space_name')}'?",
            })

    return insights


# ─── AI WRAPPERS WITH FALLBACK ─────────────────────────────────────────────

def _try_ai_then_fallback(
    ai_func: Any, fallback_func: Any, project: dict[str, Any]
) -> list[dict[str, Any]]:
    """Try the Cerebras AI function first; if it fails, use local fallback."""
    try:
        return ai_func(project)
    except Exception:
        return fallback_func(project)


def check_completeness(project: dict[str, Any]) -> list[dict[str, Any]]:
    return _try_ai_then_fallback(_ai_check_completeness, _local_check_completeness, project)


def detect_missing_requirements(project: dict[str, Any]) -> list[dict[str, Any]]:
    return _try_ai_then_fallback(_ai_detect_missing, _local_detect_missing, project)


def detect_conflicts(project: dict[str, Any]) -> list[dict[str, Any]]:
    return _try_ai_then_fallback(_ai_detect_conflicts, _local_detect_conflicts, project)


def detect_ambiguity(project: dict[str, Any]) -> list[dict[str, Any]]:
    return _try_ai_then_fallback(_ai_detect_ambiguity, _local_detect_ambiguity, project)


# ─── RAW AI FUNCTIONS (internal, may raise on failure) ────────────────────

def _ai_check_completeness(project: dict[str, Any]) -> list[dict[str, Any]]:
    context = _build_project_context(project)
    prompt = f"""You are ODIN, an expert architectural-requirements analyst.
Evaluate the completeness of the following project requirements.

Rate each major domain (Space Planning, Exterior, Site, Technical, Budget, Timeline, Regulatory, Documentation, Scope, Client Context) as:
- "complete" — all essential items are present and clearly specified.
- "partial" — some items are present but lack detail or verification.
- "missing" — essential items are absent.

For each domain that is NOT "complete", generate ONE insight with:
- "id": a unique slug (e.g. "comp-<domain>")
- "title": a concise issue title
- "scopeLabel": "Completeness"
- "summary": 1-2 sentences explaining the gap
- "severity": "blocker" if the domain is critical (Site, Budget, Scope), otherwise "verification" or "risk"
- "domainTag": one of Commercial | Site | Technical | Client | Scope | Timeline | Regulatory
- "whyFlagged": brief reason
- "affectedArea": what is affected
- "suggestedQuestion": a question to ask the client

Respond ONLY with a JSON array of insight objects. No prose outside JSON.

Project Context:
{context}
"""
    raw = _call_cerebras(prompt, system_message="You analyze construction-project requirements. Respond only in JSON.")
    return _parse_insights_json(raw)


def _ai_detect_missing(project: dict[str, Any]) -> list[dict[str, Any]]:
    context = _build_project_context(project)
    prompt = f"""You are ODIN, an expert architectural-requirements analyst.
Review the project requirements below and detect MISSING requirements.

Classify each missing item by importance:
- "critical" — blocks design or proposal
- "important" — significantly impacts quality or cost
- "optional" — nice-to-have or can be deferred

For each missing requirement, generate ONE insight with:
- "id": a unique slug (e.g. "miss-<shortname>")
- "title": what is missing
- "scopeLabel": "Missing Requirements"
- "summary": why it matters and what risk it creates
- "severity": "blocker" for critical, "risk" for important, "recommendation" for optional
- "domainTag": one of Commercial | Site | Technical | Client | Scope | Timeline | Regulatory
- "whyFlagged": reason
- "affectedArea": affected deliverable
- "suggestedQuestion": question to ask client

Respond ONLY with a JSON array of insight objects. No prose outside JSON.

Project Context:
{context}
"""
    raw = _call_cerebras(prompt, system_message="You find missing requirements in construction projects. Respond only in JSON.")
    return _parse_insights_json(raw)


def _ai_detect_conflicts(project: dict[str, Any]) -> list[dict[str, Any]]:
    context = _build_project_context(project)
    prompt = f"""You are ODIN, an expert architectural-requirements analyst.
Detect CONTRADICTIONS or CONFLICTS in the project requirements below.

Look for:
- Budget vs scope mismatch
- Timeline vs complexity mismatch
- Spatial adjacency conflicts
- Technical system incompatibilities
- Client-priority conflicts

For each conflict, generate ONE insight with:
- "id": a unique slug (e.g. "conf-<shortname>")
- "title": short conflict description
- "scopeLabel": "Conflicts"
- "summary": the contradiction and its impact
- "severity": "blocker" or "contradiction"
- "domainTag": one of Commercial | Site | Technical | Client | Scope | Timeline | Regulatory
- "whyFlagged": why it is a conflict
- "affectedArea": what is affected
- "suggestedQuestion": question to resolve it

Respond ONLY with a JSON array of insight objects. No prose outside JSON.

Project Context:
{context}
"""
    raw = _call_cerebras(prompt, system_message="You detect contradictions in construction requirements. Respond only in JSON.")
    return _parse_insights_json(raw)


def _ai_detect_ambiguity(project: dict[str, Any]) -> list[dict[str, Any]]:
    context = _build_project_context(project)
    prompt = f"""You are ODIN, an expert architectural-requirements analyst.
Detect AMBIGUITY or VAGUENESS in the project requirements below.

Look for:
- Unclear quantities or dimensions
- Missing material specifications
- Undefined responsibilities
- Vague timelines
- Unqualified statements (e.g. "good quality", "as needed")

For each ambiguity, generate ONE insight with:
- "id": a unique slug (e.g. "amb-<shortname>")
- "title": what is ambiguous
- "scopeLabel": "Ambiguity"
- "summary": the ambiguity and the risk it creates
- "severity": "verification" or "risk"
- "domainTag": one of Commercial | Site | Technical | Client | Scope | Timeline | Regulatory
- "whyFlagged": why it is ambiguous
- "affectedArea": affected area
- "suggestedQuestion": specific question to remove ambiguity

Respond ONLY with a JSON array of insight objects. No prose outside JSON.

Project Context:
{context}
"""
    raw = _call_cerebras(prompt, system_message="You detect ambiguity in construction requirements. Respond only in JSON.")
    return _parse_insights_json(raw)


# ─── ROUTER / SEARCH ─────────────────────────────────────────────────────

_ANALYSIS_FUNCTIONS: dict[str, Any] = {
    "completeness": check_completeness,
    "missing": detect_missing_requirements,
    "conflict": detect_conflicts,
    "ambiguity": detect_ambiguity,
}


def analyze_requirements(
    project: dict[str, Any],
    analysis_type: str | None = None,
) -> list[dict[str, Any]]:
    """Route to the correct analysis function.

    If analysis_type is provided, run that specific analysis.
    If None, run all four analyses and return a merged, deduplicated list
    sorted by severity (blocker > risk > verification > recommendation > strength).
    """
    if analysis_type and analysis_type in _ANALYSIS_FUNCTIONS:
        return _ANALYSIS_FUNCTIONS[analysis_type](project)

    all_insights: list[dict[str, Any]] = []
    for func in _ANALYSIS_FUNCTIONS.values():
        try:
            insights = func(project)
            all_insights.extend(insights)
        except Exception:
            continue

    seen: set[str] = set()
    deduped: list[dict[str, Any]] = []
    for insight in all_insights:
        iid = insight.get("id", "")
        if iid and iid in seen:
            continue
        if iid:
            seen.add(iid)
        deduped.append(insight)

    deduped.sort(key=lambda x: _severity_order.get(x.get("severity", ""), 99))
    return deduped
