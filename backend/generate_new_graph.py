import os
import json
from typing import Any, Dict, List

from pydantic import ValidationError
from models import GraphBase

try:
    import anthropic
except ImportError:  # pragma: no cover
    anthropic = None  # We will validate at runtime


GRAPH_PROMPT_PREAMBLE = (
    "You are a precise data engineer. Generate ONE chart definition that our app can save "
    "and render. Be concise and return STRICT JSON with the following keys: type, title, "
    "sql_query, extra. Do not include any commentary."
)

GRAPH_SCHEMA_INSTRUCTIONS = (
    """
GRAPH TYPES & SQL FORMAT REQUIREMENTS

Table: events (always use FROM events)

Rules for properties access:
- Text: properties->>'property_name'
- Numeric: (properties->>'property_name')::NUMERIC

Allowed chart types and required SQL output columns:
- bar: (category TEXT, value NUMERIC) | extra: {"y_axis_label"?}
- line: (time INT8, value NUMERIC)   | extra: {"x_axis_label"?, "y_axis_label"?}
- pie:  (slice TEXT, value NUMERIC)
- area: (time INT8, value NUMERIC)   | extra: {"x_axis_label"?, "y_axis_label"?}
- scatter: (x_value NUMERIC, y_value NUMERIC, size NUMERIC NULL, label TEXT NULL) | extra: {"x_axis_label"?, "y_axis_label"?}

Output JSON shape:
{
  "type": "bar|line|pie|area|scatter",
  "title": "Human readable chart title",
  "sql_query": "SELECT ... FROM events ...",
  "extra": {"x_axis_label"?: string, "y_axis_label"?: string}
}

Constraints:
- Use table "events" only.
- SQL must be valid Postgres and reference columns available on events.
- Do not include LIMIT in the query; our backend handles time windowing.
- Ensure column aliases exactly match the required schema names above.
"""
)


def _build_prompt(user_request: str, recent_events_sample: List[Dict[str, Any]]) -> str:
    sample_preview = json.dumps(recent_events_sample[:5], indent=2) if recent_events_sample else "[]"
    return (
        f"{GRAPH_PROMPT_PREAMBLE}\n\n"
        f"User request: {user_request}\n\n"
        f"Recent events sample (JSON, first 5 rows):\n{sample_preview}\n\n"
        f"{GRAPH_SCHEMA_INSTRUCTIONS}\n\n"
        "Return ONLY the JSON object, no code fences."
    )

def call_anthropic_generate_graph(prompt: str) -> GraphBase:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is not set")

    if anthropic is None:
        raise RuntimeError(
            "The 'anthropic' package is not installed. Please add it to requirements.txt"
        )

    client = anthropic.Anthropic(api_key=api_key)
    resp = client.messages.create(
        model="claude-3-5-sonnet-20240620",
        max_tokens=800,
        temperature=0,
        messages=[{"role": "user", "content": prompt}],
    )
    # Extract text content
    parts = getattr(resp, "content", [])
    text = "".join([p.text for p in parts if hasattr(p, "text")]) if parts else ""
    if not text:
        raise RuntimeError("Empty response from Anthropic")

    # Try to parse JSON
    text = text.strip()
    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        # Sometimes models wrap in code-fences; try to strip them
        if text.startswith("```"):
            stripped = text
            # Remove optional language tag
            if stripped.startswith("```json"):
                stripped = stripped[len("```json"):]
            else:
                stripped = stripped[len("```"):]
            if stripped.endswith("```"):
                stripped = stripped[:-3]
            text_stripped = stripped.strip()
            try:
                data = json.loads(text_stripped)
            except Exception:
                raise RuntimeError(f"Failed to parse LLM JSON: {e}: {text[:200]}")
        else:
            raise RuntimeError(f"Failed to parse LLM JSON: {e}: {text[:200]}")

    try:
        graph = GraphBase(**data)
    except ValidationError as e:
        raise RuntimeError(f"LLM returned invalid graph schema: {e}")

    # Normalize
    normalized = GraphBase(
        type=graph.type.lower().strip(),
        title=graph.title.strip(),
        sql_query=graph.sql_query.strip(),
        extra=graph.extra or {},
    )
    return normalized


def generate_graph_from_request(
    user_request: str,
    recent_events: List[Dict[str, Any]] | None = None,
) -> GraphBase:
    prompt = _build_prompt(
        user_request,
        recent_events or [],
    )
    return call_anthropic_generate_graph(prompt)


