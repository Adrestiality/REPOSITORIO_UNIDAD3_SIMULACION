# Nadie lo verá completo

Juego web 3D desarrollado con **Three.js** (versión fija `0.160.0`), JavaScript con módulos ES nativos, sin build ni empaquetadores: únicamente archivos estáticos listos para servidor local y despliegue directo en GitHub Pages.

---

## Tema y Visión

Un jardinero cuida el pequeño jardín de una cafetería. De día hay ruido, visitantes elegantes de los años 60 y una presión sutil que va en aumento; de noche hay calma, silencio, objetos olvidados que cuentan historias no dichas y la voz interior del jardinero, que duda y exige perfección. Crear es traducir el caos interior, y los demás siempre lo entienden a medias.

---

## Características Implementadas (Módulos 1 al 7)

1. **Cafetería 3D Abierta (No Isométrica):**
   - Vista frontal diorama sin pared delantera (`PerspectiveCamera` ligeramente elevada).
   - Estética low-poly en tonos café pastel grisáceos, molduras y ventanales translúcidos.
   - Iluminación dinámica de día cálido a noche tenue y azulada con faroles.
   - Jardín central delimitado que se sincroniza dinámicamente con la cuadrícula de 5x5 (`state.gardenGrid`).

2. **Personajes y Visitantes Años 60 (`src/scene/people.js` y `src/data/peopleData.js`):**
   - Personajes elegantes con trajes, chalecos, vestidos corte A y sombreros.
   - Variaciones estéticas y paletas de color distintas para cada uno de los 4 ciclos.
   - Animaciones suaves de respiración, charla y levantamiento de tazas.

3. **El Jardinero (`src/scene/gardener.js`):**
   - Delantal verde militar/oliva y sombrero de paja.
   - **Control Point & Click:** Clic en el piso para caminar esquivando el jardín central.
   - **Patrullaje Idle:** Si no se interactúa por unos segundos, camina en círculos alrededor del jardín y las mesas.
   - **Pesadez ante el estrés:** Pasados los 60 segundos de día, el cursor y el jardinero responden con pesadez.

4. **Objetos Olvidados Nocturnos y Desbloqueo (`src/scene/objects.js` y `src/data/objects.js`):**
   - **12 objetos olvidados en total (3 por ciclo nocturno)** modelados procedimentalmente con geometrías simples:
     - *Ciclo 1:* Chaqueta de paño, taza humeante, libreta con poema.
     - *Ciclo 2:* Reloj de bolsillo detenido, guantes de terciopelo, carta sin remitente.
     - *Ciclo 3:* Espejo de mano plateado, llave antigua de latón, caja de música de madera.
     - *Ciclo 4:* Fotografía en blanco y negro, semilla oscura, tijeras de poda gastadas.
   - Al tocarlos, el jardinero reflexiona y cesa su brillo.
   - Desbloqueo del jardín tras tocar 3 objetos (o 1 póster y 2 objetos).

5. **Pósters Motivacionales y Tazas con Citas (`src/scene/posters.js`):**
   - 4 pósters en la pared y 2 tazas interactivas con modales ampliados de reflexión.

6. **Taller de Macetas 3D - Módulo 4 (`src/editors/potEditor.js`):**
   - Poda voxel 12x12x12 con `InstancedMesh`, paleta de 6 flores vívidas, dudas y 6 confirmaciones insistentes.
   - Guarda macetas que se incorporan automáticamente a la cuadrícula.

7. **Editor del Jardín 5×5 - Módulo 5 (`src/editors/gardenEditor.js`):**
   - Vista ortográfica isométrica centrada en el jardín.
   - Arrastre para mover plantas, clic derecho para retirar (con regla de permanencia >1 planta).
   - Nombramiento del jardín con 3 cuestionamientos consecutivos.
   - Cambios ejecutables (`applyChange`) y renderizador de miniaturas (`renderMiniature`).

8. **El Bucle Completo de 4 Días - Módulo 6:**
   - **Ciclos:** 4 días completos de juego.
   - **Recogida Matutina:** Al abrir el letrero por la mañana tras la noche, los dueños de los objetos olvidados entran, recogen sus pertenencias y salen. Luego entran los nuevos clientes del ciclo.
   - **Visitantes que Opinan (`src/data/visitors.js`):**
     - 10 personajes únicos que opinan sobre el `{gardenName}`.
     - Pausa muda de 2 segundos frente al jardín antes de mostrar la burbuja de diálogo (`💬`).
     - Diálogo con 3 botones: **Refutar**, **Considerar** y **Aceptar**.
     - Exactamente 2 personajes amables (Lucía y Mateo) con frases afectuosas.
     - Detección sutil del Jardinero Automático (*"Es muy perfecto... pero no sé a quién pertenece"*).
   - **Menús Nocturnos:** Botones fijos de **💭 Pensamientos** (historial) y **📋 Pendientes** (con miniaturas generadas por `renderMiniature` y notificación con badge animado).
   - **Desenlace Final:** Evaluación de decisiones en el Ciclo 4. Aplausos del público (muchos o pocos según mayoría aceptada), silencio total vs duda persistente, cafetería vacía y la pregunta final:
     > *"¿Lo habrías creado igual si supieras que nadie lo vería completo?"*

9. **Sistema de Audio Procedural con Web Audio API - Módulo 7 (`src/audio/audio.js`):**
   - **100% sintetizado:** Sin archivos `.mp3`/`.wav` externos ni librerías, utilizando osciladores, envolventes ADSR, filtros pasa bajos y reverb simulada mediante red de retardos cruzados con amortiguación.
   - **Música relajante estilo ambient C418 (Minecraft):**
     - Notas largas de piano sintético con fundamental y segundo armónico cálido ligeramente desafinado.
     - **3 Temas Generados:**
       - *Día:* Cálido y tranquilo (Fa/Do Mayor pentatónico, filtro cálido a 1400Hz).
       - *Noche:* Frío y espaciado (Re menor/Dórico, notas aisladas, filtro oscuro a 950Hz).
       - *Edición de Jardín:* Mínimo y contemplativo (notas cristalinas altas y pausas meditativas).
     - Transición suave de 1 segundo (crossfade) entre temas.
     - Inicio automático tras el primer clic o interacción del jugador (cumpliendo la política de autoplay del navegador).
   - **Cortes secos de música (silencio real):**
     - La música se detiene de golpe (ganancia inmediata a cero) ante:
       - *(a)* Pensamientos del jardinero (`onThoughtStart` / vuelve con fade en `onThoughtEnd`).
       - *(b)* Apertura de pósters o tazas (`onPosterOpen` / vuelve en `onPosterClose`).
       - *(c)* Confirmaciones del editor de macetas (`onConfirmOpen` / vuelve en `onConfirmClose`).
       - *(d)* Pausa muda del visitante frente al jardín (`onVisitorPauseStart`: silencio absoluto donde solo se oye un leve respirar de ruido filtrado; `onVisitorPauseEnd`).
   - **Silencios especiales:**
     - Al voltear el letrero: El murmullo se apaga barriendo un filtro pasa bajos que se cierra hasta 80Hz, dejando solo el zumbido de la cafetería vacía (room drone).
     - De noche: Goteo lejano muy tenue sintetizado con caída de frecuencia y reverb larga.
     - Si el jugador aceptó más cambios de los que refutó, la noche siguiente tiene el goteo pero **ninguna música**.
     - En el final con aplausos **no hay música**.
   - **Efectos de sonido (SFX):**
     - *Murmullo del café:* Ruido filtrado que escala dinámicamente en volumen y densidad con el temporizador de estrés rojo (`state.estres`).
     - *Pasos suaves del jardinero:* Sonido sordo amortiguado sincronizado con la caminata.
     - *Clic táctil:* Interacción con letrero, objetos olvidados, pósters y botones.
     - *Sonido de borrado de voxels:* Poda vegetal con tijeras al esculpir en el taller de macetas.
     - *Aplausos procedurales:* Síntesis de ráfagas aleatorias filtradas para el desenlace.

---

## Estructura del Repositorio

```text
├── .gitignore
├── .nojekyll                 # Compatibilidad con GitHub Pages
├── package.json              # Script npm run dev
├── README.md                 # Documentación e instrucciones completas
├── index.html                # HTML estático con importmap, overlay y ui-layer
├── style.css                 # Estilos: diorama, HUD nocturno, modales, editor de macetas y jardín
├── libs/
│   └── three/
│       └── three.module.js   # Three.js v0.160.0 (copia local oficial)
└── src/
    ├── main.js               # Orquestación de ciclos, animación, raycaster e interacción
    ├── state.js              # Estado reactivo, cuadrícula 5x5, contador de respuestas y pendientes
    ├── audio/
    │   └── audio.js          # Síntesis Web Audio API pura: música C418, cortes, ambiente y SFX
    ├── data/
    │   ├── dialogues.js      # Pensamientos espontáneos y dudas de jardín
    │   ├── gameConfig.js     # Configuración de tiempos y límites
    │   ├── gardenData.js     # Plantas iniciales del jardín 5x5 y alertas
    │   ├── objects.js        # 12 objetos olvidados (3 por ciclo) y reflexiones
    │   ├── peopleData.js     # Visitantes de los años 60 y aspectos por ciclo
    │   ├── posters.js        # Pósters y tazas con citas
    │   └── visitors.js       # 10 visitantes opinantes, banco de opiniones y textos del Módulo 6
    ├── editors/
    │   ├── gardenEditor.js   # Editor 5x5: vista isométrica, applyChange y renderMiniature
    │   └── potEditor.js      # Editor de macetas 3D: poda 12x12x12 y confirmaciones
    ├── scene/
    │   ├── cafeteria.js      # Cafetería 3D y jardín dinámico sincronizado
    │   ├── clock.js          # Reloj de pared 3D funcional
    │   ├── gardener.js       # Jardinero con point & click y pasos sonoros
    │   ├── objects.js        # Modelos 3D de los 12 objetos olvidados con brillo
    │   ├── people.js         # Gestión de visitantes, caminatas, dueños y aplausos
    │   └── posters.js        # Pósters en la pared y tazas interactivas
    └── ui/
        └── dialogs.js        # Diálogos, burbujas de opinión, menús nocturnos y pantalla final
```

---

## Cómo Abrir y Ejecutar el Proyecto

### Opción 1: Con el servidor de desarrollo local
```bash
npm run dev
```
Abre en tu navegador la dirección indicada: `http://localhost:5173`.

### Opción 2: Con un servidor HTTP simple (Python)
```bash
python -m http.server 8000
```
Abre en tu navegador: `http://localhost:8000`.

---

## Comprobación y Verificación del Audio y Juego

1. **Inicio de Audio:**
   - Abre `http://localhost:5173`. Tras el primer clic del ratón en la pantalla o al mover al jardinero, comenzará la música ambient suave de piano cálido estilo C418.
2. **Murmullo y Pasos:**
   - Al caminar el jardinero, se escucharán pasos suaves sobre la madera.
   - Durante el día, a medida que el temporizador avanza y el estrés sube (filtro rojo), el murmullo de fondo del café se vuelve más denso y presente.
3. **Cortes Secos de Música (Silencio Real):**
   - Cuando aparece un pensamiento espontáneo del jardinero, la música se corta de golpe en silencio absoluto, y vuelve con un fade suave al desaparecer.
   - Al hacer clic en un póster o taza, la música se corta de inmediato.
   - En el taller de macetas, al llegar a las confirmaciones insistentes, la música se detiene.
   - En el Ciclo 2 o 3, cuando un visitante opinante llega frente al jardín, la música se corta en seco y se percibe un tenue respirar filtrado durante los 2 segundos de pausa muda.
4. **Poda de Voxels:**
   - En el Taller de Macetas, al podar voxels con el ratón se escucha el sonido nítido de tijeras de jardín.
5. **Silencios Nocturnos y Goteo:**
   - Al hacer clic en el letrero `ABIERTO` para cerrar, el sonido se apaga cerrando el filtro pasa bajos, dejando un zumbido tenue de lugar vacío y gotas de agua lejanas y espaciadas con reverb.
   - Si aceptaste más cambios de los que refutaste, la noche transcurre sin música, únicamente con el goteo y el zumbido.
6. **Desenlace con Aplausos:**
   - Al llegar al final del Ciclo 4, la música se apaga por completo y suenan los aplausos procedurales del público, seguidos del silencio absoluto ante la pregunta final:
     > *"¿Lo habrías creado igual si supieras que nadie lo vería completo?"*
7. **Comandos de consola útiles para pruebas rápidas:**
   - `window.spawnOpinionVisitor()`: Dispara inmediatamente un visitante opinante.
   - `window.triggerEnding('silencio')` / `window.triggerEnding('duda')`: Prueba ambos finales y sus aplausos.
   - `window.startNight(2)` / `window.startDay(2)`: Cambia de fase y ciclo.

---

## Despliegue en GitHub Pages

1. Sube todos los archivos a la rama `main` de tu repositorio de GitHub.
2. Entra en **Settings > Pages** del repositorio.
3. En **Build and deployment > Source**, selecciona **Deploy from a branch**.
4. Selecciona la rama `main` y la carpeta `/ (root)`.
5. Haz clic en **Save**. En un par de minutos tu juego estará publicado y funcionando sin builds ni dependencias externas.
