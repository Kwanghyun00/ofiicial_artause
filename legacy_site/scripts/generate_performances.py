import csv
import json
from datetime import datetime, timezone
from pathlib import Path

COL_PROJECT_NUMBER = "\uD504\uB85C\uC81D\uD2B8 \uB118\uBC84"
COL_PROJECT_NAME = "\uD504\uB85C\uC81D\uD2B8\uBA85"
COL_STATUS = "\uC9C4\uD589 \uC0C1\uD669"
COL_ROLE = "\uC54C\uD130\uC988 \uC5ED\uD560"
COL_GENRE = "\uC7A5\uB974"
COL_REGION = "\uC9C0\uC5ED"
COL_ORGANIZATION = "\uACF5\uC5F0 \uB2E8\uCCB4"
COL_PERIOD = "\uACF5\uC5F0\uC77C\uC790"
COL_VENUE = "\uACF5\uC5F0\uC7A5"
COL_TASKS = "\uC218\uD589\uC5C5\uBB34"

ROLE_PROMOTION = "\uACF5\uC5F0 \uD64D\uBCF4 \uB300\uD589"
STATUS_COMPLETED = "\uC644\uB8CC"
ARTAUSE = "\uC544\uD130\uC6B0\uC2A4"

SOURCE_PATH = Path("data") / "\uACF5\uC5F0DB.csv"
OUTPUT_PATH = Path("data") / "performances.json"
PLACEHOLDERS = [
    "images/project_placeholder_1.jpg",
    "images/project_placeholder_2.jpg",
    "images/project_placeholder_3.jpg",
]


def normalize(text: str) -> str:
    return (text or "").strip()


def normalize_tasks(raw: str):
    text = normalize(raw)
    if not text:
        return []
    buffer = (
        text.replace("\u2027", ",")
        .replace("\u00b7", ",")
        .replace(";", ",")
        .replace("/", ",")
    )
    tokens = []
    for part in buffer.split(","):
        item = part.strip()
        if item:
            tokens.append(item)
    return tokens


def map_status(value: str) -> str:
    status_value = normalize(value)
    if status_value == STATUS_COMPLETED:
        return "completed"
    if status_value:
        return "ongoing"
    return "planned"


def build_synopsis(title: str, genre: str, organization: str, period: str, venue: str, tasks):
    title_text = title or "\uC774 \uACF5\uC5F0"
    descriptor_parts = []
    if organization:
        descriptor_parts.append(f"{organization}\uC758")
    if genre:
        descriptor_parts.append(f"{genre} \uC791\uD488")
    opening_subject = " ".join(descriptor_parts + [title_text]) if descriptor_parts else title_text
    pieces = [opening_subject + "."]

    if period and venue:
        pieces.append(f"{period} \uB3D9\uC548 {venue}\uC5D0\uC11C \uACF5\uC5F0\uB418\uC5C8\uC2B5\uB2C8\uB2E4.")
    elif period:
        pieces.append(f"{period}\uC5D0 \uC9C4\uD589\uB418\uC5C8\uC2B5\uB2C8\uB2E4.")
    elif venue:
        pieces.append(f"{venue}\uC5D0\uC11C \uC9C4\uD589\uB418\uC5C8\uC2B5\uB2C8\uB2E4.")

    if tasks:
        task_text = " \u00b7 ".join(tasks)
        pieces.append(
            f"{ARTAUSE}\uB294 {task_text} \uB4F1\uC744 \uC218\uD589\uD574 \uD64D\uBCF4\uB97C \uB2F4\uB2C8\uC600\uC2B5\uB2C8\uB2E4."
        )
    else:
        pieces.append(f"{ARTAUSE}\uAC00 \uD64D\uBCF4\uB97C \uB2F4\uB2C8\uC600\uC2B5\uB2E4.")

    return " ".join(pieces)


def main():
    if not SOURCE_PATH.exists():
        raise SystemExit(f"Source CSV not found: {SOURCE_PATH}")

    with SOURCE_PATH.open("r", encoding="utf-8-sig") as fh:
        reader = csv.DictReader(fh)
        performances = []
        used_ids = set()

        for row in reader:
            role = normalize(row.get(COL_ROLE))
            if role != ROLE_PROMOTION:
                continue

            title = normalize(row.get(COL_PROJECT_NAME))
            genre = normalize(row.get(COL_GENRE))
            region = normalize(row.get(COL_REGION))
            organization = normalize(row.get(COL_ORGANIZATION))
            period = normalize(row.get(COL_PERIOD))
            venue = normalize(row.get(COL_VENUE))
            tasks = normalize_tasks(row.get(COL_TASKS))
            status = map_status(row.get(COL_STATUS))

            raw_number = normalize(row.get(COL_PROJECT_NUMBER))
            candidate = ""
            if raw_number.isdigit():
                candidate = f"perf-{int(raw_number):03d}"
            elif raw_number:
                cleaned = "".join(ch for ch in raw_number if ch.isalnum())
                candidate = f"perf-{cleaned.lower()}" if cleaned else ""
            if not candidate:
                candidate = f"perf-{len(performances) + 1:03d}"
            base_candidate = candidate
            suffix = 1
            while candidate in used_ids:
                candidate = f"{base_candidate}-{suffix}"
                suffix += 1
            used_ids.add(candidate)

            poster_url = PLACEHOLDERS[len(performances) % len(PLACEHOLDERS)]
            subtitle_bits = [part for part in (region, venue) if part]
            subtitle = " \u00b7 ".join(subtitle_bits)
            synopsis = build_synopsis(title, genre, organization, period, venue, tasks)

            tags = [value for value in (genre, region, organization) if value]

            performances.append(
                {
                    "id": candidate,
                    "title": title or "\uC81C\uBAA9 \uBBF8\uC815",
                    "status": status,
                    "category": genre or "\uC7A5\uB974 \uBBF8\uC815",
                    "region": region,
                    "organization": organization,
                    "period": period,
                    "venue": venue,
                    "role": role,
                    "tasks": tasks,
                    "poster_url": poster_url,
                    "synopsis": synopsis,
                    "subtitle": subtitle,
                    "tags": tags,
                }
            )

    timestamp = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    if timestamp.endswith("+00:00"):
        timestamp = timestamp[:-6] + "Z"

    payload = {
        "generatedAt": timestamp,
        "source": str(SOURCE_PATH),
        "total": len(performances),
        "performances": performances,
    }

    OUTPUT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Wrote {len(performances)} performances to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
