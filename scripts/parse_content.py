#!/usr/bin/env python3
"""Parsea los 23 archivos .md del curso de latín a JSON estructurado para la web."""
import json, re, os
from pathlib import Path

# Rutas relativas a la raíz del repo (independientes de dónde esté clonado)
BASE = Path(__file__).resolve().parent.parent
UP = BASE / "content"
OUT = BASE / "src" / "data"
os.makedirs(OUT, exist_ok=True)

def read(name):
    with open(os.path.join(UP, name), encoding="utf-8") as f:
        return f.read()

def clean(t):
    """Quita asteriscos de énfasis de una celda (también entre líneas)."""
    t = t.strip()
    t = re.sub(r"\*\*(.+?)\*\*", r"\1", t, flags=re.S)
    t = re.sub(r"\*(.+?)\*", r"\1", t, flags=re.S)
    return re.sub(r"\s+", " ", t).strip()

def split_lesson_sections(text):
    """Divide por cabeceras ## conservando el orden."""
    parts = re.split(r"^## ", text, flags=re.M)
    return [p.strip() for p in parts if p.strip()]

HEADER_WORDS = ("latín", "caso", "persona", "letra", "conj.", "tiempo", "participio",
                "tipo", "pronombre", "verbo", "positivo", "larga", "palabra",
                "num", "quina", "via", "quōmodo")

def parse_table_rows(section):
    """Extrae filas | a | b | ... de una sección (sin cabecera ni separador)."""
    rows = []
    for line in section.splitlines():
        line = line.strip()
        if not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if all(re.fullmatch(r":?-{2,}:?", c) for c in cells if c):
            continue
        rows.append(cells)
    return rows

def is_header_row(cells):
    first = clean(cells[0]).lower() if cells else ""
    if len(cells) >= 2:
        second = clean(cells[1]).lower()
        if second in ("español", "f. sg", "fem.", "qué pasa", "español sg", "sentido",
                      "clásica", "eclesiástica", "español", "rēx (pl)"):
            return True
    return first in HEADER_WORDS

# ---------------------------------------------------------------- LECCIONES
def parse_lessons():
    lessons = []
    for i in range(1, 13):
        raw = read(f"leccion_{i:02d}.md")
        lines = raw.splitlines()
        title_line = lines[0].lstrip("#").strip()
        m = re.match(r"Lección (\d+) — (.+)", title_line)
        num = int(m.group(1)); tpart = m.group(2)
        if ":" in tpart:
            short, subtitle = tpart.split(":", 1)
        else:
            short, subtitle = tpart, ""
        short, subtitle = short.strip(), subtitle.strip()

        meta = {}
        bq_lines = []
        for l in lines[1:]:
            if l.startswith(">"):
                bq_lines.append(l.lstrip("> "))
            elif bq_lines and l.strip() == "":
                if not any(bq_lines[-1].endswith(c) for c in (".", "·", ":")) or len(bq_lines) > 4:
                    break
            elif bq_lines:
                break
        bq = "\n".join(bq_lines[:6])
        mm = re.search(r"\*\*Gramática:\*\*(.+?)(?:\*\*Escenario:\*\*|\*\*Lectura:\*\*|$)", bq, re.S)
        if mm: meta["gramatica"] = clean(mm.group(1)).strip(" ·")
        mm = re.search(r"\*\*Escenario:\*\*(.+?)(?:\*\*Lectura:\*\*|$)", bq, re.S)
        if mm: meta["escenario"] = clean(mm.group(1)).strip(" ·")
        mm = re.search(r"\*\*Lectura:\*\*(.+)", bq, re.S)
        if mm: meta["lectura"] = clean(mm.group(1)).strip(" ·")

        sections = split_lesson_sections(raw)
        lesson = {"num": num, "short": short, "subtitle": subtitle, "meta": meta,
                  "colloquium": [], "colloquium_note": "", "vocab": [],
                  "grammatica": "", "lectio": "", "glossary": [], "cultura": "",
                  "pronuntia": "", "exercitia": []}
        for sec in sections:
            if sec.startswith("Colloquium"):
                body = sec[len("Colloquium"):]
                rows = [r for r in parse_table_rows(body) if not is_header_row(r)]
                lesson["colloquium"] = [
                    {"la": clean(r[0]).lstrip("—").strip(), "es": clean(r[1]).lstrip("—").strip()}
                    for r in rows if len(r) >= 2]
                note = re.search(r"\*\((.+?)\)\*", body, re.S)
                if note: lesson["colloquium_note"] = clean(note.group(1))
            elif sec.startswith("Vocabula nova"):
                rows = [r for r in parse_table_rows(sec) if not is_header_row(r)]
                for r in rows:
                    if len(r) >= 2:
                        lesson["vocab"].append({"la": clean(r[0]), "es": clean(r[1]),
                                                "der": clean(r[2]) if len(r) > 2 else ""})
            elif sec.startswith("Grammatica"):
                lesson["grammatica"] = sec[len("Grammatica"):].strip()
            elif sec.startswith("Lectio"):
                body = sec[len("Lectio"):]
                if "Versión definitiva" in body:
                    body = "**Versión definitiva:**" + body.split("**Versión definitiva:**", 1)[1]
                g = re.search(r"\*\*Glosario:\*\*(.+?)(?:\n\n|$)", body, re.S)
                if g:
                    entries = []
                    for piece in g.group(1).split("·"):
                        piece = piece.strip()
                        if not piece: continue
                        pm = re.match(r"\*(.+?)\*\s+(.+)", piece, re.S)
                        if pm:
                            es = clean(pm.group(2))
                            es = es.rstrip(".") if not es.endswith(("...")) else es
                            entries.append({"la": clean(pm.group(1)), "es": es})
                    lesson["glossary"] = entries
                lesson["lectio"] = body.strip()
            elif sec.startswith("Cultura"):
                lesson["cultura"] = sec.split("\n", 1)[1].strip() if "\n" in sec else sec
            elif sec.startswith("Pronūntia"):
                lesson["pronuntia"] = sec.split("\n", 1)[1].strip() if "\n" in sec else sec
            elif sec.startswith("Exercitia"):
                body = sec.split("\n", 1)[1] if "\n" in sec else sec
                ex = []
                cur = None
                trail = ""
                for line in body.splitlines():
                    line = line.strip()
                    if not line: continue
                    hm = re.match(r"\*\*([A-D])\.\s*(.+?)\*\*(.*)$", line)
                    if hm:
                        title = clean(hm.group(2))
                        title = re.sub(r"\s*\(.*?\)\s*$", "", title).rstrip(":").strip()
                        cur = {"letter": hm.group(1), "title": title,
                               "note": clean(hm.group(3)).strip(" ():*"), "items": []}
                        trail = re.sub(r"^\s*\(.*?\)\s*", "", hm.group(3)).strip(" :()").strip()
                        if trail.startswith("*") or "(" in hm.group(3):
                            trail = hm.group(3).strip(" :*")
                        ex.append(cur)
                        continue
                    if line.startswith("*("): continue
                    if cur is None: continue
                    im = re.match(r"^(\d+)\.\s*(.+)$", line)
                    if im:
                        cur["items"].append({"n": int(im.group(1)), "text": im.group(2).strip()})
                    elif cur["items"] and not line.startswith("**"):
                        cur["items"][-1]["text"] += " " + line
                    elif not cur["items"]:
                        trail = (trail + " " + line).strip()
                for e in ex:
                    for it in e["items"]:
                        it["text"] = clean(it["text"])
                    if not e["items"] and trail:
                        e["items"].append({"n": 0, "text": clean(trail)})
                lesson["exercitia"] = ex
        lessons.append(lesson)
    return lessons

# ---------------------------------------------------------------- RESPUESTAS
def parse_answers():
    raw = read("17_clave_de_respuestas.md")
    raw = raw.split("## Autoevaluación")[0]
    parts = re.split(r"^## ", raw, flags=re.M)
    out = {}
    for part in parts[1:]:
        m = re.match(r"Lección (\d+)", part)
        if not m: continue
        num = int(m.group(1))
        data = {}
        for lm in re.finditer(r"\*\*([A-D])\.\*\*(.*?)(?=\*\*[A-D]\.\*\*|\Z)", part, re.S):
            letter, block = lm.group(1), lm.group(2)
            items = {}
            idx = [m2.start() for m2 in re.finditer(r"(?m)(\d+)\.\s", block)]
            if not idx:
                data[letter] = {"free": clean(block)}
                continue
            for k, start in enumerate(idx):
                end = idx[k+1] if k+1 < len(idx) else len(block)
                seg = block[start:end]
                n = int(re.match(r"(\d+)", seg).group(1))
                txt = re.sub(r"^\d+\.\s*", "", clean(seg))
                items[str(n)] = txt
            data[letter] = {"items": items}
        out[num] = data
    return out

# ---------------------------------------------------------------- VOCABULARIO NÚCLEO
def parse_vocab():
    raw = read("14_vocabulario_nucleo.md")
    parts = re.split(r"^## ", raw, flags=re.M)
    cats = []
    for part in parts[1:]:
        title = part.splitlines()[0].strip()
        entries = []
        rows = [r for r in parse_table_rows(part) if not is_header_row(r)]
        for r in rows:
            if len(r) < 2: continue
            cells = [clean(c) for c in r]
            # secciones de verbos con 4 columnas: latín | conjugación | perfecto | español
            if (len(cells) >= 4 and re.fullmatch(r"(semi)?dep\. \d|[1-5]|irreg\.", cells[1])):
                la = f"{cells[0]} ({cells[1]})"; es = cells[3]
                der = cells[2].strip("* ").strip() if len(cells) > 2 else ""
                dm = re.search(r"\(([1-5]|irreg\.|dep\. \d|semi dep\. \d)\)\s*$", la)
                decl = dm.group(1).replace("dep. ", "") if dm else ""
                entries.append({"la": la, "es": es, "der": der or "—", "decl": decl})
                continue
            la = cells[0]; es = cells[1]; der = cells[2] if len(cells) > 2 else ""
            dm = re.search(r"\(([1-5]|irreg\.)\)\s*$", la)
            decl = dm.group(1) if dm else ""
            entries.append({"la": la, "es": es, "der": der, "decl": decl})
        if entries:
            cats.append({"cat": re.sub(r"^\d+\.\s*", "", title), "entries": entries})
    return cats

# ---------------------------------------------------------------- TEORÍA
def parse_theory():
    chapters = []
    specs = [
        ("01_historia_del_latin.md", 1, "Historia del latín", "De los pastores del Lacio a la lengua eterna"),
        ("02_pronunciacion.md", 2, "Pronunciación y fonología", "Cómo SUENA el latín: clásica vs eclesiástica"),
        ("03_sustantivos_casos.md", 3, "Sustantivos y casos", "Las 5 declinaciones"),
        ("04_adjetivos_pronombres.md", 4, "Adjetivos, adverbios y pronombres", "Concordancia, grados y numerales"),
        ("05_verbos.md", 5, "Verbos", "Las 4 conjugaciones y todos los sistemas"),
        ("06_sintaxis.md", 6, "Sintaxis", "Los casos en acción y las subordinadas"),
        ("13_frases_para_hablar.md", 13, "Frases para hablar", "Tu banco conversacional"),
        ("16_metodo_y_recursos.md", 16, "Método y recursos", "Mantener el latín vivo"),
    ]
    for fname, num, short, sub in specs:
        raw = read(fname)
        intro, rest = raw.split("## ", 1)
        intro = "\n".join(intro.splitlines()[1:]).strip()
        secs = []
        for part in re.split(r"^## ", rest, flags=re.M):
            part = part.strip()
            if not part: continue
            head, _, body = part.partition("\n")
            secs.append({"head": head.strip(), "body": body.strip()})
        chapters.append({"num": num, "short": short, "subtitle": sub,
                         "intro": intro, "sections": secs})
    return chapters

# ---------------------------------------------------------------- TABLAS MAESTRAS
def parse_tables():
    raw = read("15_tablas_maestras.md")
    parts = re.split(r"^## ", raw, flags=re.M)
    first = parts[0].split("\n", 1)
    secs = []
    for part in parts[1:]:
        part = part.strip()
        head, _, body = part.partition("\n")
        secs.append({"head": head.strip(), "body": body.strip()})
    return {"intro": first[1].strip() if len(first) > 1 else "", "sections": secs}

# ---------------------------------------------------------------- AUTOEVALUACIÓN
def parse_autoeval():
    raw = read("17_clave_de_respuestas.md")
    raw = raw.split("## Autoevaluación")[1]
    body = raw.split("*(Las respuestas")[0]
    idx = [m.start() for m in re.finditer(r"(?m)(\d+)\.\s", body)]
    qs = []
    for k, start in enumerate(idx):
        end = idx[k+1] if k+1 < len(idx) else len(body)
        seg = body[start:end]
        qs.append(re.sub(r"^\d+\.\s*", "", clean(seg)))
    return qs

if __name__ == "__main__":
    data = {
        "lessons": parse_lessons(),
        "answers": parse_answers(),
        "vocabCats": parse_vocab(),
        "theory": parse_theory(),
        "tables": parse_tables(),
        "autoeval": parse_autoeval(),
    }
    with open(os.path.join(OUT, "course.json"), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    print("lessons:", len(data["lessons"]))
    print("answers lessons:", len(data["answers"]))
    print("vocab entries:", sum(len(c["entries"]) for c in data["vocabCats"]), "cats:", len(data["vocabCats"]))
    print("theory chapters:", len(data["theory"]))
    print("tables sections:", len(data["tables"]["sections"]))
    l1 = data["lessons"][0]
    print("L1 colloquium:", len(l1["colloquium"]), "vocab:", len(l1["vocab"]),
          "exercitia:", [(e["letter"], len(e["items"])) for e in l1["exercitia"]])
    print("L9 lectio has Vipera:", "Vīpera" in data["lessons"][8]["lectio"])
    print("L12 meta:", data["lessons"][11]["meta"])
    print("answers L1 A1:", data["answers"][1]["A"]["items"]["1"])
    print("vocab cat1 first:", data["vocabCats"][0]["entries"][0])
    print("L1 D items:", data["lessons"][0]["exercitia"][3]["items"][0]["text"][:60])
    print("L12 meta:", data["lessons"][11]["meta"])
    print("L12 ex:", [(e["letter"], len(e["items"])) for e in data["lessons"][11]["exercitia"]])
    print("autoeval:", len(data["autoeval"]), data["autoeval"][0][:50])
