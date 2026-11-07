"""Rebase the built site for its GitHub Pages project URL."""
import re
from pathlib import Path

output = Path("dist")
prefix = "/barmana-website"
routes = {"/" + p.relative_to(output).parts[0] for p in output.iterdir() if p.is_dir() or p.suffix == ".html"}
pattern = re.compile(r"""(?P<start>["'(=,]|\s)(?P<path>/(?!/)[\w.-]*(?=/|[?#"'\s)]|$))""")

def rebase(match):
    start, path = match.group("start", "path")
    if path in routes or path == "/" and start in ('"', "'"):
        return start + prefix + path
    return match.group(0)

for p in output.rglob("*"):
    if p.suffix in {".html", ".css"} or p.parent == output / "assets/custom" and p.suffix == ".js":
        p.write_text(pattern.sub(rebase, p.read_text()))
(output / ".nojekyll").touch()
