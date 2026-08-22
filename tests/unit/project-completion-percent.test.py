"""Unit tests for project completion percentage calculation.

These tests validate the _calculate_project_completion_percent logic
without requiring a real database by mocking the pipeline and rows
functions imported from turso_client.
"""

from unittest.mock import MagicMock, patch
import pytest
from app import _calculate_project_completion_percent


@pytest.fixture(autouse=True)
def mock_pipeline():
    """Replace the real pipeline with a mock that returns empty results."""
    with patch("app.pipeline") as mock_pipe, patch("app.rows") as mock_rows:
        # Default: project_status = active, no tasks/milestones
        mock_pipe.return_value = [
            {"cols": [{"name": "total"}, {"name": "completed"}], "rows": [[0, 0]]},
            {"cols": [{"name": "total"}, {"name": "completed"}], "rows": [[0, 0]]},
            {"cols": [{"name": "project_status"}], "rows": [["active"]]},
        ]
        mock_rows.side_effect = lambda result: result.get("rows", [])
        yield mock_pipe, mock_rows


def _build_pipeline_mock(task_total: int, task_done: int, ms_total: int, ms_done: int, project_status: str | None = "active"):
    """Build a mock that returns the desired task/milestone/status counts."""
    def _side_effect(statements, params=None):
        # First call = tasks, second = milestones, third = project status
        calls = [
            {"cols": [{"name": "total"}, {"name": "completed"}], "rows": [[task_total, task_done]]},
            {"cols": [{"name": "total"}, {"name": "completed"}], "rows": [[ms_total, ms_done]]},
            {"cols": [{"name": "project_status"}], "rows": [[project_status]]},
        ]
        return [calls[_side_effect.call_count]]
    _side_effect.call_count = -1
    return _side_effect


def test_no_tasks_no_milestones_active_returns_10(mock_pipeline):
    mock_pipe, _ = mock_pipeline
    mock_pipe.side_effect = _build_pipeline_mock(0, 0, 0, 0, "active")
    assert _calculate_project_completion_percent(1) == 10


def test_no_tasks_no_milestones_completed_returns_100(mock_pipeline):
    mock_pipe, _ = mock_pipeline
    mock_pipe.side_effect = _build_pipeline_mock(0, 0, 0, 0, "completed")
    assert _calculate_project_completion_percent(2) == 100


def test_all_tasks_done_no_milestones_returns_100(mock_pipeline):
    mock_pipe, _ = mock_pipeline
    mock_pipe.side_effect = _build_pipeline_mock(5, 5, 0, 0, "active")
    assert _calculate_project_completion_percent(3) == 100


def test_half_tasks_done_no_milestones_returns_50(mock_pipeline):
    mock_pipe, _ = mock_pipeline
    mock_pipe.side_effect = _build_pipeline_mock(10, 5, 0, 0, "active")
    assert _calculate_project_completion_percent(4) == 50


def test_tasks_and_milestones_weighted(mock_pipeline):
    """Tasks 60% weight + Milestones 40% weight."""
    mock_pipe, _ = mock_pipeline
    # 50% tasks (60% weight → 30) + 50% milestones (40% weight → 20) = 50
    mock_pipe.side_effect = _build_pipeline_mock(10, 5, 10, 5, "active")
    assert _calculate_project_completion_percent(5) == 50


def test_only_tasks_done_returns_60(mock_pipeline):
    """All tasks done (60) + no milestones (40*0) = 60."""
    mock_pipe, _ = mock_pipeline
    mock_pipe.side_effect = _build_pipeline_mock(5, 5, 5, 0, "active")
    assert _calculate_project_completion_percent(6) == 60


def test_only_milestones_done_returns_40(mock_pipeline):
    """No tasks (60*0) + all milestones done (40) = 40."""
    mock_pipe, _ = mock_pipeline
    mock_pipe.side_effect = _build_pipeline_mock(5, 0, 5, 5, "active")
    assert _calculate_project_completion_percent(7) == 40


def test_clamped_to_0_when_negative_computation(mock_pipeline):
    # Simulate an edge where math might go negative (won't with current logic, but safe)
    mock_pipe, _ = mock_pipeline
    mock_pipe.side_effect = _build_pipeline_mock(0, 0, 0, 0, None)
    assert _calculate_project_completion_percent(8) == 0


def test_clamped_to_100_when_over_computation(mock_pipeline):
    # Cannot naturally exceed 100 with current logic, but clamp is defensive
    mock_pipe, _ = mock_pipeline
    mock_pipe.side_effect = _build_pipeline_mock(1, 2, 1, 2, "active")
    # 200% tasks + 200% milestones → clamped to 100
    assert _calculate_project_completion_percent(9) == 100
