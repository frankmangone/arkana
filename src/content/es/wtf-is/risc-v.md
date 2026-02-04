---
title: WTF es RISC-V
date: '2025-07-15'
author: frank-mangone
thumbnail: /images/wtf-is/risc-v/cpu.jpg
tags:
  - cpu
  - riscv
  - computerScience
description: >-
  Una introducción gentil al mundo de las unidades de procesamiento modulares de
  código abierto.
readingTime: 10 min
contentHash: 45d1c6bdd6ae4dc5c1b4c926c6a4247ad98dc1159cbf465062ee4d1e07e7c56e
supabaseId: 89f46326-83bd-4359-b32e-4f298f2a4147
---

Últimamente, he estado escuchando mucho sobre RISC-V.

Desde ser bastante útil para la [criptografía moderna](https://risczero.com/) y sistemas embebidos, hasta economías fuertes [invirtiendo fuertemente en la tecnología](https://www.reuters.com/technology/china-publish-policy-boost-risc-v-chip-use-nationwide-sources-2025-03-04/), RISC-V parece estar en todas partes, y se posiciona para convertirse en un nuevo gran jugador en el mercado.

Como tal, es pertinente al menos intentar entender el concepto. En mi caso, esta es una de esas cosas que he descuidado por bastante tiempo — y aunque sentía que tenía una comprensión del tema, cada uno de mis intentos de explicar algo al respecto terminaba en un miserable fracaso.

<figure>
  <img
    src="/images/wtf-is/risc-v/confusion-everywhere.jpg" 
    alt="Woody en el meme clásico con Buzz Lightyear"
    width="500"
  />
</figure>

Así que hoy, me gustaría dedicar este artículo a explorar qué es realmente esta tecnología, qué aporta, y cómo podría afectar los sistemas que conocemos y amamos.

Sin embargo, esta historia no puede comenzar en RISC-V. Primero, necesitamos entender un par de cosas sobre cómo funcionan las **computadoras**.

---

## Computadoras Detrás de Escenas {#computers-under-the-hood}

Es difícil imaginar la vida sin computadoras, ¿verdad?

Quiero decir, están **en todas partes**, y nos ayudan de muchas maneras — desde ayudas simples para las tareas del día a día, hasta tareas altamente sofisticadas como simular estructuras complejas o ayudar a desarrollar nuevos medicamentos.

> O, ya sabes, para tu propio entretenimiento cuando le pides a tu GPT de elección que te [insulte](https://www.reddit.com/r/ChatGPT/comments/1g6pnuw/i_asked_chatgpt_to_roast_me_based_on_my_previous/).

Lo que encuentro desconcertante es cómo estas funcionalidades diversas surgen de bloques de construcción muy simples. Las [puertas lógicas](https://en.wikipedia.org/wiki/Logic_gate) se disponen de tal manera que se pueden crear [unidades de memoria](https://en.wikipedia.org/wiki/Random-access_memory), que a su vez nos permiten realizar operaciones complejas y programables.

En este último aspecto, debemos detenernos y enfocarnos en el componente clave en las computadoras que hace todo esto posible: la **Unidad Central de Procesamiento**, o **CPU**.

<figure>
  <img
    src="/images/wtf-is/risc-v/cpu.jpg" 
    alt="Una CPU"
    width="600"
  />
</figure>

La CPU es esencialmente el **cerebro** de cualquier computadora. Es un componente capaz de recibir y ejecutar **instrucciones**, que cuando se secuencian correctamente, pueden expresar una cantidad extraordinaria de comportamientos diferentes.

> Estas secuencias son lo que normalmente llamaríamos **programas**.

Pero acá está el asunto: solo pueden entender instrucciones muy específicas y en realidad bastante **simples**. No puedes realísticamente pedirles que hagan cosas como "reproducir este video", pero puedes requerirles que sumen dos números juntos, o muevan algunos datos de un lugar a otro.

Cuando diseñamos una CPU, debemos establecer **exactamente** cuáles son estas instrucciones, y estas serán las herramientas que nosotros los desarrolladores tendremos para crear programas — o para instruir a la CPU a realizar los cálculos que necesitamos que realice.

> Aunque, esto usualmente sucede detrás de escena. Raramente escribimos estas instrucciones directamente. ¡Más sobre esto más adelante!

Un conjunto de instrucciones se llama una **Arquitectura de Conjunto de Instrucciones** (o **ISA** por la sigla en inglés). Y esto está en el centro de la discusión de hoy, porque las elecciones que hacemos cuando la **diseñamos** tendrán consecuencias considerables en el camino.

---

## Diseñando una ISA {#designing-an-isa}

Supongamos por un momento que no sabemos nada sobre los ISAs existentes, y queremos crear un conjunto razonable de instrucciones con las que podamos hacer prácticamente cualquier cosa. ¿Cómo abordaríamos este problema?

Ya mencionamos un par de cosas evidentes, como sumar números juntos, o mover datos de un lado a otro. Otros candidatos obvios podrían incluir restar, multiplicar y dividir números. Probablemente querríamos comparar valores — ya sabes, verificar si un número es más grande que otro, o si dos valores son iguales.

Pero entonces, las cosas podrían volverse más complicadas. ¿Qué hay de operaciones más complejas? ¿Deberíamos tener una sola instrucción que pueda, digamos, calcular una **raíz cuadrada**? ¿O hacer **manipulación de texto**? ¿Qué hay de algo tan complejo como **ordenar una lista** de números de una vez?

> Admito que esa última es casi absurda y creo que ninguna ISA incluye una instrucción para eso.

Esto muy rápidamente se convierte en un **rompecabezas de diseño** complicado. Y como adelanté anteriormente, las decisiones que tomamos tienen consecuencias importantes: cuantas más instrucciones queramos soportar, más compleja necesitará ser la CPU para interpretarlas.

Esto se traduce en:

- Más transistores
- Más costos de fabricación
- Más consumo de energía
- Y en general, más oportunidades para que las cosas salgan mal

En el otro extremo del espectro, si tenemos muy pocas instrucciones, podríamos no poder hacer ciertas operaciones. Incluso si nuestro conjunto es lo suficientemente expresivo, nuestros programas se vuelven más largos, ya que necesitaremos muchas instrucciones simples para lograr lo que una instrucción compleja podría hacer.

> Y aunque este tipo de CPUs son más fáciles de construir y optimizar, ¡programas más largos podrían llevar a más errores!

En general, esto se siente como un **acto de equilibrio** — uno en el que necesitamos ser muy conscientes de nuestras decisiones.

Afortunadamente, no necesitamos resolver este problema desde cero.

<figure>
  <img
    src="/images/wtf-is/risc-v/norris.jpg" 
    alt="Chuck Norris dando el pulgar hacia arriba en Dodgeball"
    width="600"
  />
</figure>

### Filosofías de Diseño {#design-philosophies}

El problema que describimos es en realidad uno muy difícil.

> Es un problema complejo de optimización matemática, donde nuestra ponderación de costos y propensión al error podría afectar nuestro resultado final.

En otras palabras, no hay una **solución óptima** única. En su lugar, lo que la gente ha hecho históricamente es crear buenas **reglas generales** (**heurísticas**) para diseñar ISAs, que se han desarrollado en **dos filosofías principales**:

- El primer enfoque propone hacer las instrucciones **tan poderosas y completas como sea posible** (sin perder generalidad). Esto se llama **Computación de Conjunto de Instrucciones Complejas**, o **CISC**.
- En contraste, el segundo enfoque busca mantener las instrucciones simples y rápidas, en lo que se llama **Computación de Conjunto de Instrucciones Reducidas**, o **RISC**.

> Sí, exactamente — ¡ese es el RISC en RISC-V!

Con este panorama, tenderíamos a pensar que no hay un ganador claro aquí, ya que ambos sistemas tienen sus ventajas y desventajas.

Sin embargo, el mercado ha contado una historia diferente durante muchos años.

---

## Historia del Mercado {#market-history}

La filosofía CISC dominó el mercado durante bastante tiempo.

Podría no ser evidente por qué las instrucciones más largas y complejas de CISC serían útiles, pero en realidad hay una muy buena razón: la **memoria**.

Nuestros programas (nuevamente, secuencias de instrucciones) tienen que almacenarse **en algún lugar de la memoria** para que una CPU los ejecute. Y cuando las computadoras comenzaron a poblar los hogares en los **70s** y **80s**, la memoria era costosa y escasa.

<figure>
  <img
    src="/images/wtf-is/risc-v/old-computer.jpg" 
    alt="Una computadora antigua"
    width="600"
  />
</figure>

Por supuesto, un programa más corto significaba que se necesitaba menos memoria. Dado que una arquitectura CISC podía empaquetar mucha funcionalidad en programas más cortos (y así, conjuntos de instrucciones más cortos), esto significaba costos de fabricación significativamente reducidos, y una ventaja económica genuina.

Esto llevó a otro factor para la popularidad de CISC: **compatibilidad de software**.

[Intel](https://www.intel.com/content/www/us/en/homepage.html) rápidamente estableció [x86](https://en.wikipedia.org/wiki/X86) como un estándar. Como consecuencia, la mayoría de los programas estaban hechos a medida para esta arquitectura. Así que si por alguna razón querías usar una ISA diferente, tendrías que reescribir todo tu software existente (programas).

> ¡Y te puedes imaginar que las empresas que habían invertido millones en desarrollar programas que se ejecutaban en x86 no iban a abandonar ligeramente sus inversiones!

Como consecuencia, CISC tenía un **control firme del mercado**. Incluso cuando la memoria se volvió más barata y las ventajas de RISC se volvieron más claras, los clientes siguieron usando procesadores CISC. El mercado estaba bloqueado porque todos dependían del mismo estándar.

Pasó el tiempo, y la memoria se volvió más barata. También surgieron nuevos mercados donde RISC podría brillar — por ejemplo, las **computadoras móviles** (alias tu smartphone) requerían procesadores más eficientes para que pudieran funcionar con baterías, y las **granjas masivas de servidores** (con la llegada de la [Internet](/es/blog/wtf-is/the-internet)) estaban muy preocupadas por mantener los costos de energía bajos.

Naturalmente, RISC rápidamente dominó el mercado en estas áreas. Y nuevamente, algunas empresas establecieron rápidamente estándares que ataron a los clientes en su tecnología una vez más. Así que aunque el resurgimiento de RISC fue muy interesante desde una perspectiva tecnológica, parece claro que había otro problema.

Ambos mercados sufrían del **mismo dilema fundamental**: quien controlaba la ISA, **controlaba el mercado**.

Es esencialmente un problema alrededor del **control propietario**. Si querías usar una arquitectura particular, tenías que jugar por las reglas de su propietario, pagar sus tarifas de licenciamiento, y también esperar que no hicieran cambios impactantes de repente.

<figure>
  <img
    src="/images/wtf-is/risc-v/pay-here.png" 
    alt="Una pintura antigua de un hombre pidiendo pago"
    width="500"
  />
</figure>

Ese fue el contexto y la tensión que finalmente motivó el desarrollo de **una alternativa**.

---

## RISC-V {#risc-v}

> Se pronuncia "risk-five".

RISC-V fue desarrollado originalmente en [Berkeley en 2010](https://en.wikipedia.org/wiki/RISC-V), motivado por una sola idea: ¿qué pasaría si los bloques de construcción de la computación **no fueran propiedad de nadie**?

Quiero decir, suena casi absurdo ponerlo de esa manera — pero la realidad del mercado claramente sugería lo contrario.

Así, RISC-V es **completamente de código abierto**. Cualquiera puede usarlo, modificarlo, o construir procesadores basados en él sin pagar tarifas de licenciamiento o pedir permiso.

Sin embargo, el atractivo de RISC-V no está solo en sus políticas de uso — fue diseñado desde cero para ser **modular** y **extensible**.

¿Qué quiero decir con esto? Bueno, primero de todo hay un **conjunto de instrucciones base** que es **mínimo por diseño**. Como, solo lo suficiente para ejecutar software básico. Desde ahí, puedes agregar **extensiones estandarizadas** para adaptarse a necesidades específicas, como aritmética de punto flotante, operaciones vectoriales, e incluso [criptografía](/es/reading-lists/cryptography-101).

> Muy parecido a legos para CPUs. Aunque Lego es propietario... ¡Pero entiendes el punto!

<figure>
  <img
    src="/images/wtf-is/risc-v/lego.png" 
    alt="El meme clásico de Homer en el arbusto, pero en lego"
    width="600"
  />
</figure>

La **modularidad** resuelve un problema sobre las soluciones existentes que en realidad no hemos abordado aún: **abultamiento**.

A lo largo de las décadas, las arquitecturas RISC y CISC propietarias han ido y acumulado cientos de instrucciones para satisfacer **muchos casos de uso diferentes**. Como consecuencia, el procesador de tu smartphone lleva instrucciones para algunas situaciones que nunca encontrará. Y tu laptop podría llevar instrucciones heredadas de los 80s que el software moderno raramente usa.

> ¡Después de todo, convertirse en el estándar significa que necesitas atender todo tipo de aplicaciones y mercados!

Con RISC-V, **solo incluyes lo que necesitas**, lo que se traduce directamente en procesadores más pequeños y eficientes para aplicaciones específicas.

---

Bien, esto suena muy prometedor.

Hay un pequeño problema sin embargo: usualmente no escribimos programas en lenguaje ISA, sino que elegimos algún **lenguaje de programación**, y lo usamos para crear nuestros programas.

> A menos que seas un loco y te guste escribir programas directamente en instrucciones de CPU. Conozco algunos amigos que disfrutarían profundamente eso — pero quizás también podrían beneficiarse de una visita a un psicólogo.

Entonces, ¿puedo simplemente escribir un programa C++ que se ejecute en RISC-V? ¿Cómo funcionaría eso?

---

## Compiladores {#compilers}

Aquí es donde entran en juego los **compiladores** — y esta es una de las mayores historias de éxito de RISC-V.

Un [compilador](https://en.wikipedia.org/wiki/Compiler) es esencialmente un traductor. Toma programas escritos en tus típicos lenguajes de alto nivel — C, Python, o Rust —, y los convierte en las instrucciones que un procesador entenderá.

Por supuesto, diferentes arquitecturas de procesador necesitan **diferentes compiladores**, para generar el conjunto correcto de instrucciones. Esto parece ser algo problemático: ya que RISC-V es modular, ¡el conjunto de instrucciones depende de qué módulos elijas usar!

Pero en realidad, esto **no es ningún problema en absoluto** — la modularidad ofrecida por RISC-V puede incluso hacer el trabajo del compilador **más fácil**. Dado que el conjunto de instrucciones es limpio y bien estructurado, se puede decir a los compiladores exactamente qué extensiones están disponibles en el procesador objetivo, y aprovechar cualquier instrucción especializada para hacer tu código más rápido.

Hoy, todas las principales cadenas de herramientas de compilación (como [GCC](https://gcc.gnu.org/), [LLVM/Clang](https://clang.llvm.org/), etc.) soportan RISC-V. Esto significa que si tienes un programa escrito en C, C++, Rust, o uno de muchos otros lenguajes, puedes compilarlo para ejecutarse en procesadores RISC-V con **mínimos** o **ningún cambio en absoluto** a tu código.

Este soporte es en realidad **crucial** para el éxito de RISC-V — significa que **no tiene que empezar desde cero**. El software existente puede potencialmente ejecutarse en RISC-V sin mucho problema.

> ¡Si recuerdas, esta fue una de las principales razones para el dominio del mercado de las arquitecturas propietarias!

---

## Usos en el Mundo Real {#real-world-uses}

Entonces, ¿se está usando RISC-V? ¿Dónde?

Últimamente, la adopción ha sido [rápida](https://www.eetimes.com/risc-v-turns-15-with-fast-global-adoption/) — quizás más rápida de lo que muchos esperaban. Impulsando esta celeridad están tanto razones **económicas** como **geopolíticas**.

En el frente geopolítico, China ha estado [invirtiendo fuertemente en el desarrollo de RISC-V](https://www.thestandard.com.hk/market/article/70650/China-embraces-RISC-V-chips-as-TSMC-pumps-US100b-into-US) como parte de su estrategia para reducir la dependencia de las arquitecturas de chips occidentales. Las tensiones comerciales y los desacuerdos políticos pueden cortar el acceso a tecnologías críticas en un abrir y cerrar de ojos — así que tener un estándar abierto podría convertirse en un factor estratégico crítico, o incluso una cuestión de seguridad nacional.

Sin embargo, no todo es geopolítica. Las principales empresas tecnológicas también se han mojado los pies con RISC-V. Google [experimentó con RISC-V para dispositivos Android](https://www.androidauthority.com/android-drop-risc-v-kernel-3438330/) por un tiempo, mientras que empresas como [SiFive](https://www.sifive.com/) (que fue fundada por los creadores originales de RISC-V) ya están construyendo procesadores comerciales.

La industria Blockchain y web3 también está tomando nota, y lentamente trayendo RISC-V al juego. Como sabemos, la eficiencia debe reinar en estos sistemas para que la escalabilidad sea una cosa alcanzable, lo que significa suelo fértil para esta nueva tecnología.

Relacionado con esto, los mecanismos de prueba de [conocimiento cero](/es/blog/cryptography-101/zero-knowledge-proofs-part-2) también se están construyendo alrededor de RISC-V, lo que promete hacerlos más eficientes y versátiles.

> Y hay algunos estudios de caso más que puedes revisar en la [página oficial](https://riscv.org/industries/case-studies/).

---

## Resumen {#summary}

Todavía estamos en las etapas tempranas, pero RISC-V ciertamente ha tomado impulso, y definitivamente es una alternativa que vale la pena explorar en el escenario correcto.

Creo que con esto, deberías estar saliendo de este artículo con una buena idea de qué se trata RISC-V — y un poco extra sobre computadoras también.

Ahora, si deberías preocuparte por esto o no realmente depende de tu propia curiosidad, y de qué se tratan tus proyectos. No necesariamente necesitas empezar a construir CPUs modulares, o preocuparte por compilar tus programas a ISAs específicas.

> En realidad, me atrevería a decir que la mayoría de nosotros los mortales no estaremos jugando con estas cosas pronto.

Pero la tecnología está ahí, lentamente abriéndose camino en nuestros sistemas. Quién sabe — podría ser cuestión de tiempo antes de que estés leyendo esto en un dispositivo alimentado por RISC-V.

Solo el tiempo lo dirá. ¡Mejor estar preparado!
