# FamilyLink — Guion de presentación (10–15 min)

**Duración objetivo:** 12 minutos (+ 3 min demo en vivo + preguntas)  
**Archivo slides:** `FamilyLink-TFG-Presentacion.html`  
**Consejo:** No leas las diapositivas. Usa este guion como hilo conductor. Mira al tribunal, no a la pantalla.

---

## Slide 1 — Portada (~45 s)

> "Buenos días/tardes. Soy José y hoy os presento **FamilyLink**, mi TFG de Desarrollo de Aplicaciones Multiplataforma."
>
> "En una frase: es la app para **saber dónde está tu gente cuando ellos quieren decírtelo** — sin convertirte en el FBI de la familia."
>
> "Vamos a ver qué hace, cómo está hecha por dentro, un poco de código real, y al final la probáis vosotros mismos escaneando el QR."

---

## Slide 2 — ¿Qué es FamilyLink? (~50 s)

> "FamilyLink conecta a familia o amigos en un **círculo privado**. Tres ideas:"
>
> - "**Tú decides cuándo** compartes — un toque, no GPS eterno."
> - "**Modo no molestar** — pausas un rato y el grupo lo respeta."
> - "**Círculos cerrados** — solo entra quien invites."
>
> "La frase que me guió todo el proyecto: *estar conectados sí, sentirse espiados, no*."

---

## Slide 3 — El problema (~45 s)

> "¿Por qué otra app de ubicación? Porque las que conocemos **funden la batería** y dan **sensación de vigilancia**."
>
> "Life360 y similares van bien para algunos, pero mucha gente no quiere que su madre vea cada paso del día."
>
> "FamilyLink apuesta por **compartir con sentido**, **modo no molestar** cuando necesitas espacio, y **modo fantasma** si quieres desaparecer sin avisar a nadie — son dos cosas distintas y lo explico luego."

---

## Slide 4 — Cómo lo construí con IA (~1 min)

> "No os voy a vender humo: **no programé solo**. Usé agentes de IA, pero con reglas claras."
>
> "Al principio es tentador copiar y pegar lo que te da ChatGPT. Eso falla. Lo que funcionó fue **orquestar**: uno diseña, otro codea, otro revisa, y **Engram** guarda decisiones para no repetir errores."
>
> "La IA no pensó el TFG por mí — **yo dirigí**, ellos ejecutaron. Eso es lo que quiero que os llevéis."

---

## Slide 5 — Arquitectura (~50 s)

> "Por debajo, el backend sigue **arquitectura hexagonal y DDD**. Suena técnico, pero la idea es simple:"
>
> - En el centro, las **reglas del negocio** — ¿puede compartir? ¿está en la zona?"
> - Alrededor, los **casos de uso** — compartir ubicación, crear círculo…"
> - Fuera, lo conectable — base de datos, websockets, APIs."
>
> "Si mañana cambio de PostgreSQL a otra cosa, el corazón de la app no se rompe."

---

## Slide 6 — Código: compartir ubicación (~1 min)

> "Os enseño **código de verdad**, no pseudocódigo. Este es el caso de uso cuando pulsas *Compartir*."
>
> "Fijaos: primero comprueba si tienes **modo no molestar** activo. Luego mira si entraste o saliste de una zona — Casa, Gym… Guarda en caché y avisa al grupo por websocket."
>
> "La lógica importante no está en Express ni en React. Está en el **dominio**."

---

## Slide 7 — Código: geocercas (~1 min)

> "¿Cómo sabe la app si estás en Casa? Con **geometría** — algoritmo ray-casting."
>
> "En la interfaz **no dibujas a mano alzada**: en móvil tocas el mapa, pones el **centro**, ajustas el **radio** y se genera un círculo. Por dentro es un polígono, y el motor comprueba si estás dentro o fuera."
>
> "Cuando mamá entra en Casa, el grupo lo sabe sin que nadie escriba nada."

---

## Slide 8 — Código: colores y tiempo real (~45 s)

> "Detalle rápido: los colores de zona pasan por un **Value Object** — si el color es inválido, ni llega a la base de datos."
>
> "Y en React, el hook **useSocket** escucha el servidor: cuando alguien se mueve, el mapa se actualiza solo. Sin refrescar como en 2010."

---

## Slide 9 — Avatares futuros (~40 s)

> "Esto es una animación de lo que me gustaría hacer después: **personajes caminando por el mapa**, estilo Animal Crossing o Los Sims."
>
> "Hoy tenéis avatares circulares con estado. El sueño es que ver a tu gente sea **bonito y divertido**, no un punto azul."

---

## Slide 10 — Modos de usuario (~1 min)

> "Aquí está la diferencia que me preguntasteis antes:"
>
> - **Modo no molestar** → pausas la ubicación 15 minutos a 8 horas. **El grupo lo ve.** Máximo 5 veces al día."
> - **Modo fantasma** → **no es lo mismo.** Desapareces y **nadie recibe aviso**. Silencio total."
>
> "También tenéis *Llegué bien* — un botón para que tu madre no te llame tres veces —, estado personalizado y punto verde de *estoy conectado*."

---

## Slide 11 — Roles (~40 s)

> "En cada círculo hay **admin** y **miembros**. El admin invita, expulsa, configura zonas. Los miembros usan la app y ya."
>
> "En la práctica, el admin suele ser mamá. No es opinión, es estadística familiar."

---

## Slide 12 — Mapas (~40 s)

> "El mapa usa **MapLibre** con cuatro estilos: callejero, noche, satélite, minimalista."
>
> "Extras: edificios 3D, el tiempo en tu zona, e historias de dónde ha estado la gente — rollo stories."

---

## Slide 13 — Zonas (~50 s)

> "Para crear una zona: botón **Zonas** → **Crear** → **tocas el mapa** donde quieres el centro → nombre, color, radio con el slider."
>
> "Importante: **arrastrar mueve el mapa**, no dibuja. Es un toque, no un gesto de dibujo libre."
>
> "Hasta 20 zonas por círculo. Casa, trabajo, abuela… cada una con su color."

---

## Slide 14 — Chat (~40 s)

> "El chat va en la misma app — mensajes, GIFs, fotos, encuestas, temas de color."
>
> "El caso de uso típico: *¿Ya llegaste?* — *Sí, llegué bien* — y la app confirma que entraste en la zona Casa."

---

## Slide 15 — Retos (~35 s)

> "Para que no sea aburrido, hay **retos diarios** y medallas. Compartir tres veces, escribir en el chat, activar el fantasma…"
>
> "Suena gamberrada, pero hace que la familia **use** la app, no solo la instale y la olvide."

---

## Slide 16 — Herramientas IA (~40 s)

> "Herramientas que usé: **Engram** para memoria, **MCP** para conectar la IA con el proyecto, **Skills** para no saturar el contexto, y **subagentes** con roles."
>
> "Todo documentado en el repo, por si el tribunal quiere profundizar."

---

## Slide 17 — Reflexión (~50 s)

> "Mensaje que me gustaría dejar: **la IA no nos quita el trabajo**, pero quien sepa usarla bien le ganará al que solo copie y pegue."
>
> "Mi papel fue **entender, dirigir y validar** — no picar código a ciegas."

---

## Slide 18 — Futuro (~45 s)

> "Esto no acaba con el TFG: **Play Store**, avatares animados, iOS, widgets en el reloj…"
>
> "La base ya está desplegada y funcionando."

---

## Slide 19 — Cierre + QR (~1 min)

> "**Menos espía, más cercanía.** Eso es FamilyLink."
>
> "Tenéis tres QR: la **web** para probarla ahora, **GitHub** para el código, y **APK** para Android."
>
> "Si queréis, seguimos con **demo en vivo** — login, mapa, chat y crear una zona en directo."
>
> "Gracias. ¿Preguntas?"

---

## Demo en vivo sugerida (3–5 min, después del cierre o antes)

1. Abrir `https://family-link-rosy.vercel.app` (o localhost si no hay red).
2. Login / registro rápido.
3. Crear o entrar en un círculo.
4. Mapa → compartir ubicación → que se vea el punto.
5. Zonas → tocar mapa → crear "Casa" con radio.
6. Abrir chat → mandar mensaje.
7. (Opcional) Activar modo no molestar y mostrar que desapareces.

---

## Notas para el tribunal

| Tema | Qué decir si preguntan |
|------|------------------------|
| ¿No molestar vs fantasma? | No molestar = pausa visible, límite 5/día. Fantasma = desapareces sin avisar. |
| ¿Se dibuja la zona? | No a mano alzada. Toque + radio circular. |
| ¿IA hizo el TFG? | IA ayudó a implementar; arquitectura, decisiones y validación son mías. |
| ¿Privacidad legal? | Ubicación bajo consentimiento; no tracking continuo. |

---

## Personalizar enlaces APK

En `FamilyLink-TFG-Presentacion.html`, busca `PRESENTATION_LINKS` y cambia `apk` por tu URL directa cuando la tengas (Google Drive, GitHub Release, etc.).
