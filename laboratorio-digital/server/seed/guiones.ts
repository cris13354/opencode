// 10 guiones completos y 3 vídeos en fase de investigación.
// Reglas aplicadas en todos los guiones:
// - Ningún dato numérico real sin fuente: los ejemplos con cifras se declaran ficticios.
// - Los guiones de experimento dejan los resultados como [PENDIENTE] hasta ejecutarlos.
// - Las capturas de herramientas deben ser reales y grabadas durante la producción.

type Scene = { description: string; visual: string; onscreen: string; seconds: number }

type Script = {
  idea: string
  stage: "investigacion" | "guion"
  duration: number
  hook: string
  narration?: string
  scenes?: Scene[]
  visual_resources?: string
  onscreen_text?: string
  cta?: string
  sources: string
  notes?: string
}

const FACELESS =
  "Estilo de marca: fondo oscuro, acentos azul eléctrico y violeta, tipografía de la marca. Sin rostro: voz en off, grabaciones de pantalla y gráficos animados propios."

export const SCRIPTS: Script[] = [
  {
    idea: "prompt-5-piezas",
    stage: "guion",
    duration: 60,
    hook: "Si la IA te responde cosas genéricas, probablemente el problema no es la IA. Es el prompt.",
    narration: `Si la IA te responde cosas genéricas, probablemente el problema no es la IA. Es el prompt.

Vamos a ponerlo a prueba. Primero, la petición típica: «Escríbeme un post sobre productividad». Resultado: un texto correcto que podría haber escrito cualquiera.

Ahora, la misma petición en cinco piezas.
Uno, rol: «Actúa como editor de una newsletter para autónomos».
Dos, contexto: «Mis lectores trabajan solos y tienen poco tiempo».
Tres, tarea: «Escribe un post sobre cómo planificar la semana en quince minutos».
Cuatro, formato: «Máximo 150 palabras, tres pasos numerados y una frase final».
Cinco, límites: «Sin frases motivacionales y sin inventar estadísticas».

Compara las dos respuestas. No le hemos pedido a la IA que sea más lista: le hemos dado la información que necesitaba.

Guarda este vídeo como plantilla. La próxima vez que escribas un prompt, repasa las cinco piezas. Y cuéntanos en comentarios cuál sueles olvidar.`,
    scenes: [
      {
        description: "Gancho. Se plantea el problema sin saludar.",
        visual: "Fondo oscuro con un cursor parpadeando; la frase se escribe letra a letra.",
        onscreen: "¿Respuestas genéricas?",
        seconds: 5,
      },
      {
        description: "Prueba A: el prompt típico y su respuesta.",
        visual: "Grabación de pantalla real escribiendo el prompt vago y la respuesta obtenida.",
        onscreen: "Prompt típico",
        seconds: 10,
      },
      {
        description: "Las cinco piezas, una a una.",
        visual: "Gráfico animado: cinco bloques que encajan entre sí, cada uno con su texto.",
        onscreen: "Rol · Contexto · Tarea · Formato · Límites",
        seconds: 25,
      },
      {
        description: "Comparación de resultados.",
        visual: "Pantalla dividida con las dos respuestas reales; se resaltan las diferencias.",
        onscreen: "Misma IA. Distinta información.",
        seconds: 12,
      },
      {
        description: "Cierre y llamada a la acción.",
        visual: "Plantilla de las cinco piezas a pantalla completa, lista para capturar.",
        onscreen: "Guárdalo como plantilla",
        seconds: 8,
      },
    ],
    visual_resources: `${FACELESS}
- Grabaciones de pantalla propias de la herramienta usada (indicar herramienta y fecha en pantalla).
- Gráfico de los cinco bloques: diseño propio con los colores de la marca.
- Música: pista con licencia que permita uso comercial; guardar el justificante en la Biblioteca.`,
    onscreen_text: `¿Respuestas genéricas?
Prompt típico
1 Rol · 2 Contexto · 3 Tarea · 4 Formato · 5 Límites
Misma IA. Distinta información.
Guárdalo como plantilla`,
    cta: "Guarda el vídeo como plantilla y comenta qué pieza sueles olvidar.",
    sources: `- No se cita ningún dato externo.
- Las dos respuestas deben ser capturas reales obtenidas al grabar. No se redactan a mano.
- Opcional: contrastar la estructura con la guía oficial de prompts del proveedor elegido y citarla en la descripción.`,
  },
  {
    idea: "alucinaciones",
    stage: "guion",
    duration: 70,
    hook: "La IA puede darte un dato falso con la misma seguridad que uno verdadero. Y no lo hace a propósito.",
    narration: `La IA puede darte un dato falso con la misma seguridad que uno verdadero. Y no lo hace a propósito.

Salvo que la herramienta esté buscando en internet en ese momento, un modelo de lenguaje no consulta una enciclopedia para responderte. Genera el texto que considera más probable a partir de lo que aprendió durante su entrenamiento. Muchas veces, lo probable y lo cierto coinciden. Cuando no coinciden, aparece lo que se conoce como alucinación: una respuesta que suena perfecta y está mal.

Las zonas de riesgo son bastante predecibles: fechas, cifras, citas textuales, títulos de estudios y enlaces.

Por eso, en El Laboratorio Digital seguimos una rutina de cuatro pasos.
Uno: pide la fuente concreta, no solo la respuesta.
Dos: abre esa fuente tú. Si no existe o no dice eso, descarta el dato.
Tres: pregunta lo mismo de otra forma y compara.
Cuatro: todo lo que vaya a publicarse se contrasta con una fuente primaria.

La IA es una gran herramienta para pensar y redactar. Para afirmar hechos, el último paso siempre es tuyo.

La rutina está en el último fotograma. Guárdala.`,
    scenes: [
      {
        description: "Gancho: seguridad no es lo mismo que verdad.",
        visual: "Una tarjeta con «Dato verificado» se transforma en «Dato inventado» con una transición sobria.",
        onscreen: "Seguro ≠ cierto",
        seconds: 6,
      },
      {
        description: "Cómo genera texto un modelo de lenguaje.",
        visual: "Animación propia: una frase se construye palabra a palabra con barras de probabilidad sobre las candidatas.",
        onscreen: "Genera lo más probable, no lo comprobado",
        seconds: 20,
      },
      {
        description: "Dónde suele fallar.",
        visual: "Cinco iconos lineales minimalistas: calendario, número, comillas, documento y enlace.",
        onscreen: "Fechas · Cifras · Citas · Estudios · Enlaces",
        seconds: 10,
      },
      {
        description: "La rutina de verificación en cuatro pasos.",
        visual: "Checklist que se marca paso a paso.",
        onscreen: "1 Pide la fuente · 2 Ábrela · 3 Reformula · 4 Fuente primaria",
        seconds: 24,
      },
      {
        description: "Cierre con fotograma resumen para guardar.",
        visual: "Tarjeta final con la rutina completa y el símbolo de la marca.",
        onscreen: "Para afirmar hechos, el último paso es tuyo.",
        seconds: 10,
      },
    ],
    visual_resources: `${FACELESS}
- Animación de probabilidades: diseño propio; es una ilustración simplificada, no una representación exacta del modelo (decirlo en la descripción).
- Si se muestra un ejemplo de alucinación, debe ser una captura real reproducida durante la producción, con herramienta y fecha.`,
    onscreen_text: `Seguro ≠ cierto
Genera lo más probable, no lo comprobado
Fechas · Cifras · Citas · Estudios · Enlaces
1 Pide la fuente · 2 Ábrela · 3 Reformula · 4 Fuente primaria
Para afirmar hechos, el último paso es tuyo.`,
    cta: "Guarda la rutina y compártela con quien use IA para trabajar.",
    sources: `- Contrastar la explicación del funcionamiento con documentación técnica de al menos un proveedor de modelos y con material divulgativo académico. Citar ambos en la descripción.
- No mostrar ejemplos de errores inventados por nosotros.`,
  },
  {
    idea: "privacidad-ia",
    stage: "guion",
    duration: 65,
    hook: "Antes de pegar los datos de un cliente en una IA, haz esta comprobación de un minuto.",
    narration: `Antes de pegar los datos de un cliente en una IA, haz esta comprobación de un minuto.

Uno. ¿Se usan tus conversaciones para entrenar el modelo? Muchas herramientas lo explican en su política de privacidad y algunas permiten desactivarlo en los ajustes. Búscalo antes, no después.

Dos. ¿Cuánto tiempo se guardan los datos y puedes borrarlos? Busca el apartado de conservación o retención de datos.

Tres. ¿Dónde se procesan y quién más puede acceder a ellos? Si trabajas con datos personales de clientes, esto puede tener implicaciones legales según tu país.

Cuatro. ¿Necesitas de verdad los datos reales? En muchas tareas puedes sustituir nombres, correos y cifras por datos ficticios y obtener la misma ayuda.

Y una regla sencilla: si no lo publicarías en internet, piénsalo dos veces antes de pegarlo en una herramienta que no controlas.

Esto no es asesoramiento legal. Si manejas datos sensibles, consulta con un profesional.

Guarda esta lista y compártela con quien trabaje contigo.`,
    scenes: [
      {
        description: "Gancho con la acción cotidiana de copiar y pegar.",
        visual: "Primer plano de un cursor a punto de pegar un texto con datos claramente ficticios.",
        onscreen: "Espera. Un minuto.",
        seconds: 6,
      },
      {
        description: "Pregunta 1: entrenamiento.",
        visual: "Página de ajustes genérica diseñada por nosotros (no imitar la interfaz de una marca real).",
        onscreen: "1 · ¿Entrenan con tus datos?",
        seconds: 12,
      },
      {
        description: "Preguntas 2 y 3: conservación y acceso.",
        visual: "Iconos de reloj y de candado sobre un documento abstracto.",
        onscreen: "2 · ¿Cuánto los guardan?  3 · ¿Quién accede?",
        seconds: 18,
      },
      {
        description: "Pregunta 4: anonimizar.",
        visual: "Un texto donde nombres y correos se sustituyen por [CLIENTE] y [EMAIL].",
        onscreen: "4 · ¿Necesitas los datos reales?",
        seconds: 14,
      },
      {
        description: "Regla final, aviso legal y llamada a la acción.",
        visual: "Tarjeta resumen con las cuatro preguntas.",
        onscreen: "Si no lo publicarías, no lo pegues sin pensar.",
        seconds: 15,
      },
    ],
    visual_resources: `${FACELESS}
- Todas las interfaces son maquetas propias y genéricas. No mostrar logotipos ni capturas de marcas sin revisar sus condiciones de uso.
- Los datos que aparecen en pantalla son ficticios y deben parecerlo (por ejemplo, «cliente@ejemplo.com»).`,
    onscreen_text: `Espera. Un minuto.
1 · ¿Entrenan con tus datos?
2 · ¿Cuánto los guardan?
3 · ¿Quién accede?
4 · ¿Necesitas los datos reales?
Si no lo publicarías, no lo pegues sin pensar.
No es asesoramiento legal.`,
    cta: "Guarda la lista y compártela con tu equipo.",
    sources: `- Revisar, en la fecha de grabación, la política de privacidad de dos o tres herramientas populares para confirmar que los apartados mencionados existen. No citar condiciones concretas sin enlazarlas.
- Si se menciona normativa (por ejemplo, RGPD en la UE), enlazar la fuente oficial.`,
  },
  {
    idea: "validar-48h",
    stage: "guion",
    duration: 75,
    hook: "Antes de gastar un euro en tu idea, dale 48 horas para que intente demostrar que no funciona.",
    narration: `Antes de gastar un euro en tu idea, dale 48 horas para que intente demostrar que no funciona.

Fase uno, las primeras 12 horas: el problema. Escribe en una frase qué problema resuelves y para quién. Si no cabe en una frase, todavía no es una idea; es una intuición.

Fase dos, de la hora 12 a la 36: las señales. Busca dónde habla ya la gente de ese problema: foros, comentarios, reseñas de productos parecidos. Copia las frases exactas que usan. Si nadie lo menciona, es una señal. Si hay personas pagando por soluciones imperfectas, es otra muy distinta.

Fase tres, las últimas 12 horas: el compromiso. Prepara una página sencilla que explique la solución y pida algo pequeño pero real: apuntarse a una lista, responder una encuesta o pedir más información.

Y lo más importante: decide antes de empezar qué resultado te haría seguir y cuál te haría parar. Si lo decides después, siempre encontrarás una excusa para seguir.

Cuarenta y ocho horas no garantizan que una idea funcione. Pero pueden ahorrarte meses en una que no.

¿Qué idea pondrías a prueba? Escríbela en comentarios.`,
    scenes: [
      {
        description: "Gancho: invertir el objetivo de la validación.",
        visual: "Cronómetro de 48:00:00 que empieza a correr.",
        onscreen: "48 horas para intentar tumbar tu idea",
        seconds: 6,
      },
      {
        description: "Fase 1: el problema en una frase.",
        visual: "Plantilla en pantalla: «Ayudo a ___ a resolver ___».",
        onscreen: "Fase 1 · El problema (0–12 h)",
        seconds: 14,
      },
      {
        description: "Fase 2: buscar señales donde ya se habla del problema.",
        visual: "Tarjetas abstractas de comentarios con frases subrayadas (texto de ejemplo, no capturas de personas reales).",
        onscreen: "Fase 2 · Las señales (12–36 h)",
        seconds: 20,
      },
      {
        description: "Fase 3: pedir un compromiso pequeño.",
        visual: "Maqueta de una página sencilla con un único botón.",
        onscreen: "Fase 3 · El compromiso (36–48 h)",
        seconds: 15,
      },
      {
        description: "La regla de decidir antes, cierre y llamada a la acción.",
        visual: "Dos columnas: «Sigo si…» / «Paro si…».",
        onscreen: "Decide el criterio ANTES de mirar los datos",
        seconds: 20,
      },
    ],
    visual_resources: `${FACELESS}
- No mostrar comentarios reales de personas identificables; usar textos de ejemplo rotulados como tal.
- Maqueta de página: diseño propio.`,
    onscreen_text: `48 horas para intentar tumbar tu idea
Fase 1 · El problema (0–12 h)
Fase 2 · Las señales (12–36 h)
Fase 3 · El compromiso (36–48 h)
Sigo si… / Paro si…
Decide el criterio ANTES de mirar los datos`,
    cta: "Escribe en comentarios qué idea pondrías a prueba.",
    sources: `- Método de elaboración propia inspirado en prácticas habituales de validación de clientes. Si se cita un autor o libro concreto, añadir la referencia exacta.
- Si la página recoge correos electrónicos, recordar en la descripción que hay que cumplir la normativa de protección de datos aplicable.`,
  },
  {
    idea: "precio-horas",
    stage: "guion",
    duration: 75,
    hook: "Si cobras por horas, es posible que estés calculando tu precio al revés.",
    narration: `Si cobras por horas, es posible que estés calculando tu precio al revés.

Lo habitual es mirar cuánto cobran otros. Vamos a hacerlo desde tus números. Ejemplo con cifras inventadas.

Imagina una diseñadora autónoma. Su negocio tiene 400 euros de gastos al mes. Quiere que le queden limpios 2.000 euros. Y en este ejemplo reservamos 900 euros al mes para impuestos y cotizaciones. Total necesario: 3.300 euros al mes.

Ahora las horas. Trabaja 40 horas a la semana, pero no todas se pueden facturar: correos, reuniones, buscar clientes, facturas. En el ejemplo, factura 20 de esas 40. En cuatro semanas, 80 horas facturables.

3.300 entre 80: su precio mínimo es de unos 41 euros la hora.

Si estuviera cobrando 30 euros, con esas mismas 80 horas, después de gastos y reserva le quedarían 1.100 euros, no 2.000.

La fórmula: gastos, más lo que quieres ganar, más la reserva de impuestos, dividido entre horas realmente facturables.

Las cifras son un ejemplo. Los impuestos dependen de tu país y tu situación: confírmalos con una gestoría.

Haz tu cuenta y cuéntanos si te ha sorprendido.`,
    scenes: [
      {
        description: "Gancho.",
        visual: "Etiqueta de precio que gira y muestra una flecha invertida.",
        onscreen: "¿Tu precio cubre tus horas?",
        seconds: 5,
      },
      {
        description: "Planteamiento del ejemplo ficticio y suma de necesidades.",
        visual: "Tres bloques apilados: 400 + 2.000 + 900 = 3.300 €.",
        onscreen: "EJEMPLO CON CIFRAS INVENTADAS",
        seconds: 20,
      },
      {
        description: "Horas trabajadas frente a horas facturables.",
        visual: "Barra de 40 h que se divide en 20 h facturables y 20 h no facturables.",
        onscreen: "40 h trabajadas ≠ 40 h facturables",
        seconds: 15,
      },
      {
        description: "Resultado y comparación con 30 €/h.",
        visual: "3.300 ÷ 80 = 41,25 €/h. Después: 30 € × 80 h = 2.400 € − 1.300 € = 1.100 €.",
        onscreen: "Precio mínimo ≈ 41 €/h",
        seconds: 17,
      },
      {
        description: "Fórmula, aviso y llamada a la acción.",
        visual: "Tarjeta con la fórmula completa.",
        onscreen: "(Gastos + Objetivo + Impuestos) ÷ Horas facturables",
        seconds: 18,
      },
    ],
    visual_resources: `${FACELESS}
- La rotulación «EJEMPLO CON CIFRAS INVENTADAS» debe verse durante todo el cálculo.
- Gráficos de barras y bloques: diseño propio.`,
    onscreen_text: `¿Tu precio cubre tus horas?
EJEMPLO CON CIFRAS INVENTADAS
400 € + 2.000 € + 900 € = 3.300 € / mes
40 h trabajadas ≠ 40 h facturables
3.300 € ÷ 80 h ≈ 41 €/h
(Gastos + Objetivo + Impuestos) ÷ Horas facturables
Confirma los impuestos con una gestoría.`,
    cta: "Haz tu propia cuenta y comenta si te ha sorprendido el resultado.",
    sources: `- Cálculo comprobado: 400 + 2.000 + 900 = 3.300; 20 h × 4 semanas = 80 h; 3.300 ÷ 80 = 41,25; 30 × 80 = 2.400; 2.400 − 400 − 900 = 1.100.
- Todas las cifras son ficticias. No afirmar tipos impositivos de ningún país.`,
  },
  {
    idea: "anatomia-gancho",
    stage: "guion",
    duration: 70,
    hook: "«Hola, en este vídeo te voy a hablar de…». Si tu vídeo empieza así, ya has gastado tus mejores segundos.",
    narration: `«Hola, en este vídeo te voy a hablar de…». Si tu vídeo empieza así, ya has gastado tus mejores segundos.

Vamos a arreglarlo con una frase débil: «Hoy vamos a ver cómo usar la IA para escribir correos». Cuatro maneras de convertirla en un gancho.

Uno, la pregunta que toca un problema: «¿Por qué tus correos tardan veinte minutos si la respuesta tiene tres líneas?».

Dos, la contradicción: «Usar IA para escribir correos puede hacerte perder tiempo. Salvo que hagas esto».

Tres, la promesa concreta: «Una instrucción que convierte cualquier borrador en un correo claro de cinco líneas».

Cuatro, la escena en curso: empezar en mitad de la acción, con el correo ya en pantalla y el cursor a punto de enviar.

Y una regla que no se negocia: el gancho promete, el vídeo cumple. Un gancho que engaña puede conseguir un clic, pero gasta la confianza de quien te ve.

¿Cuál de los cuatro usarías tú? Comenta el número.`,
    scenes: [
      {
        description: "Gancho: el inicio típico se detiene en seco.",
        visual: "Texto «Hola, en este vídeo…» que se congela y se tacha.",
        onscreen: "Tus mejores segundos",
        seconds: 6,
      },
      {
        description: "Presentar la frase débil que vamos a reescribir.",
        visual: "Frase en gris sobre fondo oscuro con la etiqueta «antes».",
        onscreen: "ANTES: «Hoy vamos a ver cómo…»",
        seconds: 8,
      },
      {
        description: "Tipos 1 y 2: pregunta y contradicción.",
        visual: "La frase se reescribe en directo con un efecto de máquina de escribir.",
        onscreen: "1 · Pregunta   2 · Contradicción",
        seconds: 20,
      },
      {
        description: "Tipos 3 y 4: promesa concreta y escena en curso.",
        visual: "Para la escena en curso, grabación de pantalla con un correo de ejemplo ficticio.",
        onscreen: "3 · Promesa concreta   4 · Escena en curso",
        seconds: 20,
      },
      {
        description: "Regla ética y llamada a la acción.",
        visual: "Tarjeta: «El gancho promete. El vídeo cumple.»",
        onscreen: "¿Cuál usarías? Comenta 1, 2, 3 o 4",
        seconds: 16,
      },
    ],
    visual_resources: `${FACELESS}
- Correo de ejemplo con remitente y destinatario ficticios.
- Efecto máquina de escribir: animación propia, discreta.`,
    onscreen_text: `Tus mejores segundos
ANTES: «Hoy vamos a ver cómo usar la IA para escribir correos»
1 · Pregunta
2 · Contradicción
3 · Promesa concreta
4 · Escena en curso
El gancho promete. El vídeo cumple.`,
    cta: "Comenta qué tipo de gancho usarías: 1, 2, 3 o 4.",
    sources: `- Clasificación de ganchos de elaboración propia. No afirmar cuántos segundos «decide» el espectador: no tenemos una fuente fiable y depende de cada plataforma.
- Si en el futuro se cita un dato de retención, debe proceder de las analíticas propias registradas en el Studio.`,
  },
  {
    idea: "metricas-vanidad",
    stage: "guion",
    duration: 70,
    hook: "Un vídeo con muchas visualizaciones puede ser un fracaso. Y uno con pocas, un éxito. Depende de una sola pregunta.",
    narration: `Un vídeo con muchas visualizaciones puede ser un fracaso. Y uno con pocas, un éxito. Depende de una sola pregunta: ¿para qué lo hiciste?

Si el objetivo era el alcance, que te descubra gente nueva, mira visualizaciones y cuántas personas llegan por primera vez.

Si el objetivo era el interés, mira los guardados. Un guardado suele querer decir «esto me servirá más tarde».

Si el objetivo era la confianza, mira comentarios y compartidos: alguien ha decidido poner su nombre al lado de tu contenido.

Una métrica de vanidad es una cifra que sube, sienta bien y no cambia ninguna decisión.

Así que nuestra regla es esta: antes de publicar, escribimos el objetivo y la métrica principal. Después, comparamos solo publicaciones con el mismo objetivo.

En El Laboratorio Digital registramos visualizaciones, comentarios, compartidos y guardados de cada publicación. Cuando tengamos datos suficientes, te enseñaremos lo que dicen. Sin adornos.

Si quieres ver esos resultados, síguenos.`,
    scenes: [
      {
        description: "Gancho con la paradoja.",
        visual: "Dos contadores: uno muy alto en gris apagado y otro bajo resaltado en azul eléctrico (cifras genéricas, sin dato real).",
        onscreen: "¿Éxito o fracaso?",
        seconds: 8,
      },
      {
        description: "Objetivo alcance.",
        visual: "Icono de ondas expandiéndose.",
        onscreen: "Alcance → visualizaciones",
        seconds: 12,
      },
      {
        description: "Objetivo interés.",
        visual: "Icono de marcador que se guarda.",
        onscreen: "Interés → guardados",
        seconds: 12,
      },
      {
        description: "Objetivo confianza y definición de métrica de vanidad.",
        visual: "Icono de diálogo y flecha de compartir; después, una cifra que sube sin mover nada.",
        onscreen: "Confianza → comentarios y compartidos",
        seconds: 18,
      },
      {
        description: "La regla y el compromiso de transparencia.",
        visual: "Vista del módulo de Analíticas del Studio con datos vacíos o reales, nunca simulados.",
        onscreen: "Objetivo primero. Métrica después.",
        seconds: 20,
      },
    ],
    visual_resources: `${FACELESS}
- Los contadores de la primera escena usan cifras abstractas (por ejemplo, «████»), no números concretos.
- Si se muestra el Studio, solo con datos reales registrados o vacío.`,
    onscreen_text: `¿Éxito o fracaso?
Alcance → visualizaciones
Interés → guardados
Confianza → comentarios y compartidos
Métrica de vanidad: sube, sienta bien, no cambia nada
Objetivo primero. Métrica después.`,
    cta: "Síguenos para ver los resultados reales cuando tengamos datos suficientes.",
    sources: `- La interpretación de cada métrica es orientativa y de elaboración propia; presentarla como criterio, no como regla universal.
- Revisar qué métricas ofrece cada plataforma en la fecha de publicación (los nombres cambian).`,
  },
  {
    idea: "exp-semana-ia",
    stage: "guion",
    duration: 90,
    hook: "Durante siete días, una IA ha decidido cómo organizo mi semana de trabajo. Estas fueron las reglas, y esto es lo que pasó.",
    narration: `Durante siete días, una IA ha decidido cómo organizo mi semana de trabajo. Estas fueron las reglas, y esto es lo que pasó.

Las reglas: cada mañana le doy mi lista de tareas, mis citas fijas y las horas disponibles. La IA decide el orden y los bloques de tiempo. Yo solo puedo seguir el plan o anotar por qué no he podido.

Lo que medimos: tareas planificadas frente a completadas, cuántas veces me salté el plan y por qué, y una nota de energía al final del día, del uno al cinco.

Días uno a tres: [PENDIENTE — resumir el registro real de esos días].

Días cuatro a siete: [PENDIENTE — resumir el registro real].

Lo que mejor funcionó: [PENDIENTE].

Lo que no funcionó: [PENDIENTE].

Una advertencia honesta: esto es una sola persona durante una semana. No demuestra nada en general, pero sí te da una idea de qué probar.

Conclusión: [PENDIENTE — escribir solo lo que el registro permita afirmar].

La plantilla de registro está en la descripción. Si haces el experimento, cuéntanos tu resultado.`,
    scenes: [
      {
        description: "Gancho: siete días cediendo el control.",
        visual: "Calendario semanal vacío que se va rellenando solo con bloques de color.",
        onscreen: "7 días · La IA decide mi semana",
        seconds: 7,
      },
      {
        description: "Reglas del experimento.",
        visual: "Tres tarjetas: entrada (tareas, citas, horas), decisión (IA), salida (seguir o anotar).",
        onscreen: "Reglas del experimento",
        seconds: 15,
      },
      {
        description: "Qué se mide.",
        visual: "Tabla de registro vacía con las columnas del experimento.",
        onscreen: "Planificado · Completado · Saltos · Energía 1–5",
        seconds: 12,
      },
      {
        description: "Resultados día a día.",
        visual: "Gráfico con los datos reales del registro (crearlo tras el experimento).",
        onscreen: "[PENDIENTE — datos reales]",
        seconds: 30,
      },
      {
        description: "Lo que funcionó, lo que no y advertencia de alcance.",
        visual: "Dos columnas ✓ / ✗ con los hallazgos reales.",
        onscreen: "1 persona · 7 días · No es una prueba científica",
        seconds: 16,
      },
      {
        description: "Conclusión y llamada a la acción.",
        visual: "Plantilla de registro descargable (en el futuro).",
        onscreen: "Haz el experimento tú",
        seconds: 10,
      },
    ],
    visual_resources: `${FACELESS}
- Capturas reales de las conversaciones con la IA (sin datos personales ni de terceros).
- Gráfico de resultados generado a partir del registro del experimento en la Biblioteca.`,
    onscreen_text: `7 días · La IA decide mi semana
Reglas del experimento
Planificado · Completado · Saltos · Energía 1–5
[PENDIENTE — resultados reales]
1 persona · 7 días · No es una prueba científica
Haz el experimento tú`,
    cta: "Haz el experimento con la plantilla y cuéntanos tu resultado.",
    sources: `- Fuente única: el registro diario del experimento (ver ficha en Biblioteca → Experimentos).
- No publicar hasta que todos los [PENDIENTE] estén sustituidos por datos reales.`,
    notes: "Guion plantilla: la estructura está cerrada; los resultados se escriben después de ejecutar el experimento.",
  },
  {
    idea: "exp-producto-finde",
    stage: "guion",
    duration: 90,
    hook: "Reto: crear un producto digital en un fin de semana, sin gastar nada. Cronometramos cada fase.",
    narration: `Reto: crear un producto digital en un fin de semana, sin gastar nada. Cronometramos cada fase.

El producto: una plantilla de planificación de contenido en hoja de cálculo. Las reglas: 48 horas, solo herramientas gratuitas y nada de vender. Si al final existe, se ofrecerá gratis para comprobar si a alguien le resulta útil.

Las fases y su tiempo real:
Definir el problema y el público: [PENDIENTE — minutos].
Diseñar la estructura: [PENDIENTE].
Crear el contenido y las fórmulas: [PENDIENTE].
Probarla con un caso ficticio: [PENDIENTE].
Preparar una página de presentación: [PENDIENTE].

Lo que se terminó: [PENDIENTE].
Lo que se quedó a medias: [PENDIENTE].
Lo que haríamos distinto: [PENDIENTE].

Lo que este experimento no demuestra: que el producto sea bueno ni que alguien lo quiera. Eso solo se sabe cuando lo usan personas reales.

¿Qué producto digital intentarías crear tú en un fin de semana?`,
    scenes: [
      {
        description: "Gancho con el reto y el cronómetro.",
        visual: "Cuenta atrás de 48 h y una hoja de cálculo en blanco.",
        onscreen: "48 h · 0 € · 1 producto",
        seconds: 7,
      },
      {
        description: "Producto y reglas.",
        visual: "Tarjetas con las tres reglas.",
        onscreen: "Solo herramientas gratuitas · Sin vender",
        seconds: 13,
      },
      {
        description: "Las cinco fases cronometradas.",
        visual: "Línea de tiempo con cinco tramos cuya longitud se rellena con los tiempos reales.",
        onscreen: "[PENDIENTE — tiempos reales]",
        seconds: 35,
      },
      {
        description: "Terminado, a medias y aprendizajes.",
        visual: "Grabación de pantalla real del resultado final.",
        onscreen: "Terminado · A medias · Lo cambiaríamos",
        seconds: 20,
      },
      {
        description: "Límites del experimento y llamada a la acción.",
        visual: "Texto sobrio sobre fondo oscuro.",
        onscreen: "Que exista ≠ que sea útil",
        seconds: 15,
      },
    ],
    visual_resources: `${FACELESS}
- Grabaciones de pantalla del proceso real (acelerar en edición, indicarlo en pantalla).
- Cronómetro y línea de tiempo: gráficos propios.`,
    onscreen_text: `48 h · 0 € · 1 producto
Solo herramientas gratuitas · Sin vender
[PENDIENTE — tiempos reales por fase]
Terminado · A medias · Lo cambiaríamos
Que exista ≠ que sea útil`,
    cta: "Comenta qué producto digital crearías en un fin de semana.",
    sources: `- Fuente única: el registro de tiempos del experimento (Biblioteca → Experimentos).
- Comprobar las condiciones de los planes gratuitos usados en la fecha del experimento.`,
    notes: "Relacionado con la hipótesis de negocio «Plantilla de planificación de contenido».",
  },
  {
    idea: "exp-plan-negocio",
    stage: "guion",
    duration: 85,
    hook: "Le pedimos a una IA un plan de negocio completo. Después, revisamos cada frase. Esta es la auditoría.",
    narration: `Le pedimos a una IA un plan de negocio completo. Después, revisamos cada frase. Esta es la auditoría.

El negocio es ficticio: un servicio de edición de vídeo para pequeños comercios. El prompt es siempre el mismo y lo tienes en pantalla.

Cada afirmación del plan va a una de cuatro categorías:
Verificable y correcta.
Verificable e incorrecta.
Genérica: valdría para cualquier negocio.
No verificable: suena bien, pero no hay forma de comprobarla.

El plan tenía [PENDIENTE] afirmaciones.
Verificables y correctas: [PENDIENTE].
Verificables e incorrectas: [PENDIENTE].
Genéricas: [PENDIENTE].
No verificables: [PENDIENTE].

El ejemplo más útil: [PENDIENTE].
El error más llamativo: [PENDIENTE].

La conclusión, sin exagerar: [PENDIENTE — solo lo que permita la tabla]. Un único plan con una única herramienta no sirve para juzgar a todas las IA.

Si quieres la tabla completa, guarda el vídeo: la publicaremos junto al experimento.`,
    scenes: [
      {
        description: "Gancho.",
        visual: "Documento largo que se desplaza y se cubre de marcas de revisión.",
        onscreen: "Auditoría línea a línea",
        seconds: 7,
      },
      {
        description: "Negocio ficticio y prompt fijo.",
        visual: "El prompt completo en pantalla durante varios segundos para que pueda leerse.",
        onscreen: "NEGOCIO FICTICIO",
        seconds: 13,
      },
      {
        description: "Las cuatro categorías.",
        visual: "Cuatro etiquetas de color: correcta, incorrecta, genérica, no verificable.",
        onscreen: "✓ Correcta · ✗ Incorrecta · ≈ Genérica · ? No verificable",
        seconds: 15,
      },
      {
        description: "Recuento y ejemplos reales.",
        visual: "Tabla con el recuento real y dos fragmentos destacados del plan.",
        onscreen: "[PENDIENTE — recuento real]",
        seconds: 32,
      },
      {
        description: "Conclusión prudente y llamada a la acción.",
        visual: "Tarjeta final con el alcance del experimento.",
        onscreen: "1 plan · 1 herramienta · conclusiones limitadas",
        seconds: 18,
      },
    ],
    visual_resources: `${FACELESS}
- Capturas reales del plan generado, indicando herramienta y fecha.
- Tabla de auditoría exportada desde la ficha del experimento.`,
    onscreen_text: `Auditoría línea a línea
NEGOCIO FICTICIO
✓ Correcta · ✗ Incorrecta · ≈ Genérica · ? No verificable
[PENDIENTE — recuento real]
1 plan · 1 herramienta · conclusiones limitadas`,
    cta: "Guarda el vídeo para consultar la tabla completa cuando la publiquemos.",
    sources: `- Cada afirmación clasificada como «correcta» o «incorrecta» debe llevar su fuente en la tabla de auditoría.
- Guardar el prompt y la respuesta íntegra en la ficha del experimento.`,
  },

  // Vídeos en fase de investigación (sin guion todavía) ---------------------
  {
    idea: "ventana-contexto",
    stage: "investigacion",
    duration: 60,
    hook: "¿Por qué la IA se «olvida» de lo que le dijiste al principio de la conversación?",
    sources: `- Investigar: qué es la ventana de contexto y cómo la explica la documentación oficial de dos proveedores.
- No dar cifras de tamaño de contexto sin fuente y fecha: cambian con frecuencia.
- Validar que la metáfora de la mesa de trabajo no induce a error.`,
    notes: "Borrador de gancho. Pendiente: guion completo tras la investigación.",
  },
  {
    idea: "reutilizacion",
    stage: "investigacion",
    duration: 60,
    hook: "Este vídeo no es un vídeo. Es el primero de siete contenidos.",
    sources: `- Usar como ejemplo real uno de nuestros guiones ya publicados (no inventar métricas de rendimiento).
- Revisar los formatos y límites actuales de cada plataforma antes de grabar.
- Basarse en la estrategia de reutilización documentada en docs/estrategia-contenido.md.`,
    notes: "Grabar cuando exista al menos un vídeo publicado para mostrar el proceso real.",
  },
  {
    idea: "negocio-pasivo",
    stage: "investigacion",
    duration: 70,
    hook: "Nadie te cuenta cuánto trabajo cuesta un «ingreso pasivo».",
    sources: `- Elaborar la lista de tareas recurrentes a partir de la experiencia propia del experimento del producto de fin de semana.
- No afirmar ingresos medios ni porcentajes de éxito sin fuente.`,
    notes: "Depende del experimento «producto digital en un fin de semana».",
  },
]
