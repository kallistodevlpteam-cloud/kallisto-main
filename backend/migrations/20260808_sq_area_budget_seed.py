"""Update sq_area and estimated_overall_budget for all projects (test data).

Sets distinct built-up area and estimated overall budget values on every
project so the Enquiry Detail stat cards render varied backend data.
Budget rows that do not exist yet are inserted.

Run from the backend directory:

    python migrations/20260808_sq_area_budget_seed.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline, rows  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

SQ_AREA_BY_PROJECT: dict[int, str] = {
    1: "4,200 sq ft",
    2: "3,600 sq ft",
    3: "2,150 sq ft",
    4: "1,480 sq ft",
    5: "2,750 sq ft",
    6: "12,000 sq ft",
    7: "2,300 sq ft",
}

BUDGET_BY_PROJECT: dict[int, int] = {
    1: 38_000_000,
    2: 28_500_000,
    3: 14_500_000,
    4: 32_000_000,
    5: 19_500_000,
    6: 85_000_000,
    7: 16_000_000,
}


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    for project_id in sorted(SQ_AREA_BY_PROJECT):
        sq_area = SQ_AREA_BY_PROJECT[project_id]
        pipeline(
            ["UPDATE projects SET sq_area = ? WHERE id = ?"],
            [[sq_area, project_id]],
        )
        print(f"project {project_id}: sq_area -> {sq_area}")

    for project_id in sorted(BUDGET_BY_PROJECT):
        budget = BUDGET_BY_PROJECT[project_id]
        exists = pipeline(
            ["SELECT 1 FROM project_budget WHERE project_id = ?"],
            [[project_id]],
        )[0]
        if rows(exists):
            pipeline(
                ["UPDATE project_budget SET estimated_overall_budget = ? WHERE project_id = ?"],
                [[budget, project_id]],
            )
            action = "updated"
        else:
            pipeline(
                [
                    "INSERT INTO project_budget (project_id, estimated_overall_budget) "
                    "VALUES (?, ?)"
                ],
                [[project_id, budget]],
            )
            action = "inserted"
        print(f"project {project_id}: budget {action} -> {budget}")

    verify = pipeline(
        [
            "SELECT p.id, p.sq_area, pb.estimated_overall_budget "
            "FROM projects p LEFT JOIN project_budget pb ON pb.project_id = p.id "
            "ORDER BY p.id"
        ]
    )[0]
    for row in rows(verify):
        print(f"VERIFY project {row[0]}: sq_area={row[1]}, budget={row[2]}")


if __name__ == "__main__":
    main()