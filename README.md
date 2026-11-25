# Aprende Latín — de cero a leer textos clásicos

Aplicación web interactiva para aprender latín en español desde el nivel 0 hasta poder leer textos clásicos. Todo el contenido (23 documentos en Markdown) vive en este repositorio y se transforma en los datos de la app con un parser incluido.

## El método

El curso combina lo mejor de los métodos de aprendizaje de idiomas aplicados al latín:

- **Input comprensible desde el día 1** — cada lección abre con un *Colloquium*, un diálogo en latín vivo con su traducción línea a línea.
- **Lectura graduada con glosario integrado** — las *Lectiōnes* son fábulas y escenarios romanos cuyo vocabulario nuevo aparece anotado al pie.
- **Gramática en contexto** — la *Grammatica* de cada lección explica solo lo que esa lectura necesita, con tablas resumen.
- **Práctica activa con feedback inmediato** — *Exercitia* autocorregidos en la app, con la clave de respuestas integrada.
- **Repaso espaciado** — flashcards de las 676 entradas del vocabulario núcleo, organizadas por categorías.
- **Latín hablado** — banco de frases para conversar y escenarios de la vida romana.

Cada lección sigue la misma estructura: *Colloquium → Vocabula nova → Grammatica → Lectiō → Cultura → Pronūntia → Exercitia*.

## Contenido

- **12 lecciones graduadas** (desde *Salvē!* hasta repaso integral y métrica del hexámetro).
- **6 capítulos de teoría**: historia del latín, pronunciación (clásica y eclesiástica), sustantivos y casos, adjetivos y pronombres, verbos, sintaxis.
- **Referencia**: frases para hablar, vocabulario núcleo, tablas maestras, método de estudio y recursos, y la clave de respuestas con una autoevaluación final de 30 preguntas.

## Funcionalidades de la app

- Recorrido guiado por lecciones con progreso guardado en el navegador.
- *Colloquium* interactivo, vocabulario por lección y glosarios de lectura.
- Ejercicios autocorregidos (comparación tolerante con acentos y macrones).
- Flashcards por categoría con seguimiento de aciertos.
- Sección de teoría y consulta rápida de tablas maestras.
- Autoevaluación final.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · Zustand

## Estructura del repositorio

```
content/                   23 documentos .md fuente del curso
  ├── 01–06_*.md           teoría (historia, pronunciación, casos, adjetivos, verbos, sintaxis)
  ├── leccion_01–12.md     lecciones graduadas
  └── 13–17_*.md           frases, vocabulario núcleo, tablas maestras, método, clave
scripts/parse_content.py   parser: content/*.md → src/data/course.json
src/app/                   página y layout Next.js
src/components/latin/      componentes del curso (lecciones, ejercicios, flashcards…)
src/components/ui/         componentes shadcn/ui utilizados
src/lib/, src/hooks/       carga de contenido y estado (progreso, favoritos)
src/data/course.json       datos estructurados (generado, no versionado)
```

## Ponerlo en marcha

Requisitos: **Bun** (o Node.js 20+) y **Python 3** para regenerar los datos del curso.

```bash
git clone https://github.com/Leonisaurov/aprender-latin.git
cd aprender-latin
bun install        # o npm install
bun run dev        # o npm run dev
```

Antes de arrancar, los scripts `predev`/`prebuild` ejecutan el parser y generan `src/data/course.json` automáticamente. Abre <http://localhost:3000>.

## Regenerar o editar el contenido

El contenido vive en `content/*.md`. Tras editarlo, regenera los datos:

```bash
python3 scripts/parse_content.py
```
