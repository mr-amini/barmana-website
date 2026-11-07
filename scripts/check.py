"""Verify that the published HTML and CSS reference existing local files."""

from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import unquote, urljoin, urlsplit

OUTPUT = Path(__file__).resolve().parents[1] / "dist"
CSS_URL = re.compile(r"""url\(\s*['"]?([^)'"]+)['"]?\s*\)""")
REFERENCE_ATTRIBUTES = ("href", "src", "poster", "data-src")


class PageReferences(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = set()
        self.in_language_select = False

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        self.references.update(values.get(name) for name in REFERENCE_ATTRIBUTES)

        if tag == "select":
            self.in_language_select = values.get("aria-label") in {
                "Select language", "انتخاب زبان",
            }
        if tag == "option" and self.in_language_select:
            self.references.add(values.get("value"))

        srcset = values.get("srcset", "")
        if srcset and not srcset.startswith("data:"):
            self.references.update(item.split()[0] for item in srcset.split(",") if item.strip())

    def handle_endtag(self, tag):
        if tag == "select":
            self.in_language_select = False


def local_target(source, reference):
    if not reference:
        return None

    url = urlsplit(reference.strip())
    if url.scheme or url.netloc or not url.path:
        return None

    route = "/" + source.relative_to(OUTPUT).as_posix().removesuffix("index.html")
    target = unquote(urlsplit(urljoin(route, reference.strip())).path)
    return OUTPUT / target.lstrip("/")


def main():
    pages = sorted(OUTPUT.rglob("*.html"))
    if not pages:
        raise SystemExit("Build the website first with npm run build.")

    broken = []
    checked = 0
    for source in [*pages, *sorted(OUTPUT.rglob("*.css"))]:
        contents = source.read_text()
        if source.suffix == ".html":
            parser = PageReferences()
            parser.feed(contents)
            references = parser.references | set(CSS_URL.findall(contents))
        else:
            references = set(CSS_URL.findall(contents))

        for reference in sorted(value for value in references if value):
            target = local_target(source, reference)
            if target is None:
                continue
            checked += 1
            if target.is_dir():
                target /= "index.html"
            if not target.is_file():
                broken.append(f"{source.relative_to(OUTPUT)}: {reference}")

    if broken:
        raise SystemExit("\n".join(broken))

    print(f"Checked {len(pages)} pages and {checked} local references. No broken links or assets.")


if __name__ == "__main__":
    main()
