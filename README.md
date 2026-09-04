# English Quest CR

> **Aprendé inglés por niveles. Superá retos. Fortalecé Reading y Listening.**

[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-0b1020?logo=github&logoColor=white)](https://pages.github.com/)
[![Tecnologías](https://img.shields.io/badge/Stack-HTML%20%7C%20CSS%20%7C%20JavaScript-00d4ff)](#tecnologías)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-62e6b8)](LICENSE)
[![Accesibilidad](https://img.shields.io/badge/Accesibilidad-WCAG%202.2-7dd3fc)](docs/accessibility.md)

**English Quest CR** es una plataforma educativa gratuita, estática y de código abierto para estudiantes de secundaria de Costa Rica. Su propósito es reforzar el aprendizaje del inglés por niveles y practicar habilidades de comprensión lectora (**Reading**) y comprensión auditiva (**Listening**) mediante contenido original, retos y retroalimentación formativa.

Cada reto completado te acerca a tu meta.

---

## Importante

Este proyecto es un recurso educativo **independiente**.

- No está afiliado, aprobado, patrocinado ni administrado por el Ministerio de Educación Pública de Costa Rica (MEP).
- No sustituye las clases, materiales, programas, evaluaciones ni disposiciones oficiales.
- No reproduce, adapta ni distribuye pruebas, audios, textos, preguntas o materiales protegidos del MEP.
- Todo ejercicio, lectura, guion de listening y pregunta incluidos en la plataforma debe ser contenido original o utilizar recursos con licencia compatible.
- Los programas, criterios y disposiciones oficiales pueden cambiar; consulta siempre las fuentes oficiales del MEP.

---

## Objetivos

- Ofrecer una ruta clara de inglés desde séptimo hasta undécimo año.
- Reforzar vocabulario, gramática funcional, Reading y Listening.
- Presentar práctica original basada en competencias generales: idea principal, detalles, inferencias, propósito comunicativo y vocabulario en contexto.
- Motivar mediante XP, insignias, rachas y retos cortos.
- Brindar explicaciones sencillas en español con ejemplos prácticos en inglés.
- Mantener la privacidad del estudiante: no hay cuentas, backend ni recopilación de datos personales.

---

## Rutas de aprendizaje

| Nivel | Ruta | Nivel estimado | Enfoque |
|---|---|---:|---|
| Séptimo | Foundations | Pre-A1–A1 | Bases del inglés cotidiano |
| Octavo | Everyday English | A1 | Situaciones diarias y comunicación básica |
| Noveno | Real-Life Communication | A1–A2 | Inglés para contextos reales |
| Décimo | Academic Growth | A2 | Comunicación académica y funcional |
| Undécimo | Exam Challenge | A2–B1 | Estrategias de Reading y Listening |

---

## Características

- Diseño mobile-first para teléfono, tableta y computadora.
- Modo oscuro predeterminado y modo opcional de alto contraste.
- Navegación con teclado y foco visible.
- Contenido separado de la lógica mediante archivos JSON.
- Progreso almacenado únicamente en `localStorage`.
- Misiones progresivas y opción de exploración libre.
- XP, insignias, rachas y mensajes motivadores.
- Modo **Practice** sin límite de tiempo.
- Modo **Challenge** con temporizador, puntaje e intentos.
- Transcripciones para los ejercicios de Listening.
- Simulacro final original para undécimo año.

---

## Tecnologías

Este sitio utiliza únicamente tecnologías web estándar:

- HTML5 semántico.
- CSS3 responsivo.
- JavaScript vanilla.
- JSON para niveles, vocabulario, quizzes e insignias.
- `localStorage` para progreso local.
- GitHub Pages para publicación.

No utiliza frameworks, backend, bases de datos, cuentas de usuario, APIs externas ni bibliotecas obligatorias.

---

## Estructura

```text
ingles-mep-secundaria/
├── index.html
├── assets/
│   ├── css/styles.css
│   ├── js/
│   │   ├── app.js
│   │   ├── quiz-engine.js
│   │   ├── progress.js
│   │   └── content-loader.js
│   ├── audio/
│   └── images/
├── data/
│   ├── levels.json
│   ├── badges.json
│   ├── quizzes.json
│   └── vocabulary.json
├── pages/
└── docs/
```

---

## Uso local

Debido a que la portada carga `data/levels.json`, se recomienda ejecutar un servidor local en lugar de abrir `index.html` directamente.

### Opción 1: Python

```bash
git clone https://github.com/TU-USUARIO/ingles-mep-secundaria.git
cd ingles-mep-secundaria
python -m http.server 8000
```

Abre:

```text
http://localhost:8000
```

### Opción 2: Visual Studio Code

1. Abre el proyecto en Visual Studio Code.
2. Instala la extensión **Live Server**.
3. Haz clic derecho sobre `index.html`.
4. Selecciona **Open with Live Server**.

---

## Publicación con GitHub Pages

1. Crea un repositorio público llamado `ingles-mep-secundaria`.
2. Sube los archivos a la rama `main`.
3. En GitHub, abre **Settings**.
4. En el menú lateral, abre **Pages**.
5. En **Build and deployment**, selecciona **Deploy from a branch**.
6. Elige la rama `main` y la carpeta `/(root)`.
7. Presiona **Save**.
8. Espera la publicación y abre la URL proporcionada por GitHub.

La dirección usual será:

```text
https://TU-USUARIO.github.io/ingles-mep-secundaria/
```

---

## Privacidad

English Quest CR no recopila información personal.

El progreso, XP, insignias, configuraciones visuales y rachas se guardan exclusivamente en el navegador de cada persona mediante `localStorage`. Si el usuario borra los datos del navegador, el progreso local puede eliminarse.

---

## Accesibilidad

El proyecto busca seguir principios de WCAG 2.2:

- Estructura HTML semántica.
- Navegación por teclado.
- Indicadores de foco visibles.
- Contraste elevado.
- Información no dependiente solo del color.
- Respeto por `prefers-reduced-motion`.
- Controles con nombres descriptivos.
- Transcripciones para contenido de audio.

Consulta [docs/accessibility.md](docs/accessibility.md) para conocer la guía de accesibilidad del proyecto.

---

## Contribuir

Las contribuciones son bienvenidas, especialmente para:

- Crear ejercicios originales y apropiados por nivel.
- Mejorar la accesibilidad.
- Corregir errores de idioma o experiencia de usuario.
- Añadir transcripciones y audios propios con licencia compatible.
- Mejorar documentación y pruebas manuales.

Lee primero:

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [docs/content-guidelines.md](docs/content-guidelines.md)

---

## Licencia

Este proyecto se distribuye bajo la licencia [MIT](LICENSE).

El contenido educativo agregado debe ser original o tener una licencia que permita su uso, modificación y distribución dentro de este proyecto.

---

## Estado del proyecto

🚧 En desarrollo por fases.

- [x] Fase 1: portada, identidad visual, estructura base y niveles.
- [ ] Fase 2: navegación interna, misiones iniciales y motor de quizzes.
- [ ] Fase 3: progreso, XP, insignias, rachas y retos diarios.
- [ ] Fase 4: páginas de recursos, progreso y sobre el proyecto.
- [ ] Fase 5: simulacro de undécimo, pruebas de accesibilidad y revisión final.

---

## Descargo de responsabilidad

English Quest CR es una iniciativa independiente de apoyo educativo. La referencia al currículo de secundaria de Costa Rica tiene un propósito orientativo y no implica relación institucional con el MEP. Para conocer programas, lineamientos, evaluaciones y comunicaciones vigentes, consulta siempre los canales oficiales del Ministerio de Educación Pública de Costa Rica.
