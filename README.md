# English Quest CR

> **Aprendé inglés por niveles. Superá retos. Fortalecé Reading y Listening.**

[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-0b1020?logo=github&logoColor=white)](https://pages.github.com/)
[![Tecnologías](https://img.shields.io/badge/Stack-HTML%20%7C%20CSS%20%7C%20JavaScript-00d4ff)](#tecnologías)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-62e6b8)](LICENSE)
[![Accesibilidad](https://img.shields.io/badge/Accesibilidad-WCAG%202.2-7dd3fc)](docs/accessibility.md)


English Quest CR es una plataforma educativa gratuita, estática y de código abierto para estudiantes de secundaria de Costa Rica.

Su propósito es reforzar el aprendizaje del inglés mediante rutas por nivel, misiones originales, ejercicios de Reading y Listening, retroalimentación formativa, retos cortos y un sistema de progreso con XP, rachas e insignias.

🌐 **Sitio web:**  
https://echo506.github.io/ruta-ingles-secundaria-cr/

---

## Importante

English Quest CR es un recurso educativo **independiente**.

- No está afiliado, aprobado, patrocinado ni administrado por el Ministerio de Educación Pública de Costa Rica (MEP).
- No sustituye las clases, materiales, programas, evaluaciones ni disposiciones oficiales.
- No reproduce, adapta ni distribuye pruebas, audios, textos, preguntas ni materiales protegidos del MEP.
- Todo ejercicio, lectura, diálogo, guion de Listening y pregunta incluidos en la plataforma debe ser contenido original o utilizar recursos con licencia compatible.
- Los programas, criterios y disposiciones oficiales pueden cambiar; consultá siempre las fuentes oficiales del MEP.

---

## Objetivos

- Ofrecer una ruta clara de inglés desde Séptimo hasta Undécimo año.
- Reforzar vocabulario y gramática funcional mediante ejemplos prácticos.
- Practicar Reading y Listening con contenido original.
- Desarrollar comprensión de idea principal, detalles, inferencias, propósito comunicativo y vocabulario en contexto.
- Motivar la práctica constante mediante XP, insignias, rachas y retos diarios.
- Brindar explicaciones sencillas en español con ejemplos en inglés.
- Proteger la privacidad del estudiante: no hay cuentas obligatorias ni recopilación de datos personales.

---

## Rutas de aprendizaje

| Nivel | Ruta | Nivel estimado | Enfoque |
|---|---|---|---|
| Séptimo año | Foundations | Pre-A1–A1 | Bases del inglés cotidiano |
| Octavo año | Everyday English | A1 | Situaciones diarias y comunicación básica |
| Noveno año | Real-Life Communication | A1–A2 | Inglés para contextos reales |
| Décimo año | Academic Growth | A2 | Comunicación académica y funcional |
| Undécimo año | Exam Challenge | A2–B1 | Lectura crítica, argumentación y preparación final |

Cada ruta contiene misiones progresivas. Al completar una misión, la persona estudiante recibe XP y desbloquea el avance hacia la siguiente.

---

## Características

- Diseño responsivo para teléfono, tableta y computadora.
- Interfaz en español con práctica de inglés contextualizada.
- Misiones organizadas por nivel académico.
- Contenido educativo original.
- Ejercicios de vocabulario, gramática funcional, Reading y Listening.
- Retroalimentación inmediata en los cuestionarios.
- XP por misiones completadas.
- Sistema de rachas de estudio.
- Insignias por avance y constancia.
- Reto diario con XP adicional.
- Página de progreso con estado de misiones.
- Navegación mediante teclado y foco visible.
- Modo de alto contraste.
- Respeto por `prefers-reduced-motion`.
- Progreso almacenado localmente en el navegador mediante `localStorage`.

---

## Tecnologías

El sitio utiliza tecnologías web estándar:

- HTML5 semántico.
- CSS3 responsivo.
- JavaScript vanilla.
- Archivos JavaScript para organizar las misiones por nivel.
- `localStorage` para almacenar progreso local.
- GitHub Pages para publicación.

No utiliza frameworks obligatorios, cuentas de usuario ni un backend requerido para el funcionamiento principal del sitio.

---

## Estructura del proyecto

```text
ruta-ingles-secundaria-cr/
├── index.html
├── README.md
├── LICENSE
├── Estructrura
├── supabase-progress.sql
│
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── app.js
│   ├── audio/
│   └── images/
│
├── data/
│   ├── levels.json
│   ├── seventh-missions.js
│   ├── eighth-missions.js
│   ├── ninth-missions.js
│   ├── tenth-missions.js
│   └── eleventh-missions.js
│
├── pages/
│   ├── levels.html
│   ├── mission.html
│   ├── progress.html
│   ├── challenge.html
│   ├── resources.html
│   └── about.html
│
├── quality-assurance/
│   └── Documentación y listas de revisión de calidad
│
└── supabase/
    └── Archivos relacionados con configuración o alternativas de persistencia
```

> La funcionalidad pública principal del sitio se mantiene como una plataforma estática. El progreso de la persona estudiante se guarda localmente en el navegador.

---

## Datos de misiones

Las misiones se organizan por nivel dentro de la carpeta `data/`.

| Archivo | Variable global |
|---|---|
| `data/seventh-missions.js` | `window.seventhMissions` |
| `data/eighth-missions.js` | `window.eighthMissions` |
| `data/ninth-missions.js` | `window.ninthMissions` |
| `data/tenth-missions.js` | `window.tenthMissions` |
| `data/eleventh-missions.js` | `window.eleventhMissions` |

La página principal carga estos archivos antes de `assets/js/app.js`, lo que permite renderizar las cinco rutas de aprendizaje.

---

## Uso local

Para probar el proyecto en tu computadora, cloná el repositorio:

```bash
git clone [https://github.com/Echo506/ruta-ingles-secundaria-cr.git](https://github.com/Echo506/ruta-ingles-secundaria-cr.git)
cd ruta-ingles-secundaria-cr
```

Se recomienda usar un servidor local en vez de abrir `index.html` directamente.

### Opción 1: Python

```bash
python -m http.server 8000
```

Luego abrí:

```text
http://localhost:8000
```

### Opción 2: Visual Studio Code

1. Abrí la carpeta del proyecto en Visual Studio Code.
2. Instalá la extensión **Live Server**.
3. Hacé clic derecho sobre `index.html`.
4. Seleccioná **Open with Live Server**.

---

## Publicación con GitHub Pages

El proyecto está preparado para publicarse desde la rama `main`.

1. Abrí el repositorio en GitHub.
2. Seleccioná **Settings**.
3. En el menú lateral, abrí **Pages**.
4. En **Build and deployment**, seleccioná **Deploy from a branch**.
5. En **Branch**, seleccioná `main`.
6. En la carpeta, seleccioná `/(root)`.
7. Presioná **Save**.
8. Esperá a que GitHub termine el despliegue.

La dirección pública del proyecto es:

```text
[https://echo506.github.io/ruta-ingles-secundaria-cr/](https://echo506.github.io/ruta-ingles-secundaria-cr/)
```

Después de subir cambios, puede tomar unos minutos para que GitHub Pages actualice el sitio. Si no ves los cambios, recargá usando `Ctrl + F5` o limpiá la caché del navegador.

---

## Privacidad

English Quest CR no recopila información personal.

El progreso, XP, insignias, rachas y preferencia de alto contraste se guardan únicamente en el navegador de cada persona mediante `localStorage`.

Si se borran los datos del navegador, se usa otro dispositivo o se navega en modo incógnito, el progreso local puede perderse.

---

## Accesibilidad

El proyecto busca aplicar buenas prácticas basadas en WCAG 2.2:

- Uso de HTML semántico.
- Enlace para saltar al contenido principal.
- Navegación por teclado.
- Indicadores de foco visibles.
- Etiquetas y nombres descriptivos para controles.
- Información que no depende únicamente del color.
- Modo de alto contraste.
- Compatibilidad con `prefers-reduced-motion`.
- Textos alternativos cuando corresponda.
- Retroalimentación visible en ejercicios y formularios.

---

## Contribuciones

Las contribuciones son bienvenidas, especialmente para:

- Crear ejercicios originales y adecuados para cada nivel.
- Mejorar explicaciones, vocabulario, diálogos y preguntas.
- Corregir errores de idioma.
- Mejorar accesibilidad y experiencia de usuario.
- Añadir audios propios con licencia compatible y sus transcripciones.
- Revisar enlaces rotos, rutas relativas y funcionamiento de GitHub Pages.
- Mejorar documentación y listas de control de calidad.

Antes de contribuir:

1. Revisá que el contenido educativo sea original o tenga una licencia compatible.
2. Evitá incluir materiales protegidos del MEP.
3. Probá los cambios en computadora y celular.
4. Verificá que no se rompa el progreso almacenado en `localStorage`.
5. Usá mensajes de commit claros y descriptivos.

---

## Estado del proyecto

🚧 **Proyecto en desarrollo continuo.**

- [x] Portada e identidad visual.
- [x] Rutas de aprendizaje de Séptimo a Undécimo.
- [x] Misiones educativas organizadas por nivel.
- [x] Sistema de XP, rachas e insignias.
- [x] Página de progreso.
- [x] Reto diario.
- [x] Modo de alto contraste.
- [x] Corrección de carga de rutas en la portada.
- [ ] Ampliación de recursos educativos.
- [ ] Más prácticas de Listening con audio original y transcripciones.
- [ ] Revisión continua de accesibilidad, contenido y experiencia móvil.

---

## Licencia

Este proyecto se distribuye bajo la licencia [MIT](LICENSE).

El contenido educativo agregado debe ser original o contar con una licencia que permita su uso, modificación y distribución dentro de este proyecto.

---

## Descargo de responsabilidad

English Quest CR es una iniciativa independiente de apoyo educativo.

La referencia al currículo de secundaria de Costa Rica tiene un propósito orientativo y no implica relación institucional con el Ministerio de Educación Pública de Costa Rica.

Para conocer programas, lineamientos, evaluaciones y comunicaciones vigentes, consultá siempre los canales oficiales del MEP.iones iniciales y motor de quizzes.
- [ ] Fase 3: progreso, XP, insignias, rachas y retos diarios.
- [ ] Fase 4: páginas de recursos, progreso y sobre el proyecto.
- [ ] Fase 5: simulacro de undécimo, pruebas de accesibilidad y revisión final.

---

## Descargo de responsabilidad

English Quest CR es una iniciativa independiente de apoyo educativo. La referencia al currículo de secundaria de Costa Rica tiene un propósito orientativo y no implica relación institucional con el MEP. Para conocer programas, lineamientos, evaluaciones y comunicaciones vigentes, consulta siempre los canales oficiales del Ministerio de Educación Pública de Costa Rica.
