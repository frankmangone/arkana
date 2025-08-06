---
title: "Blockchain 101: Polkadot"
author: frank-mangone
date: "2025-08-05"
thumbnail: "/images/blockchain-101/polkadot/0*2X_pmsJZlxGr-E_N-8.jpg"
tags:
  - polkadot
  - blockchain
  - rollup
description: >-
  Finalmente es momento de descubrir los secretos de una favorita personal: Polkadot
readingTime: 11 min
contentHash: # TODO: Add content hash
supabaseId: # TODO: Add supabase ID
---

> Este artículo es parte de una serie más larga sobre Blockchain. Si este es el primer artículo que encuentras, te recomiendo comenzar desde el [inicio de la serie](/es/blog/blockchain-101/how-it-all-began).

Este es un artículo muy especial para mí.

Soy ex alumno de la [Polkadot Blockchain Academy](https://polkadot.academy/). Asistí a la academia cuando era completamente presencial, y cuando aún se estaban puliendo algunas asperezas.

<figure>
	<img
		src="/images/blockchain-101/polkadot/1*U3dp-7w_-KNgESLridUBCw-1.png"
		alt="Una foto mía con un par de amigos de la academia" 
		title="Ese soy yo en el medio, necesitando urgentemente un corte de pelo, junto con mis compañeros guerreros Emiliano y Ernesto"
	/>
</figure>

Fue un mes increíble. Recuerdo estar fascinado por la tecnología. Y aunque fue una de las experiencias más difíciles de mi vida, el desafío fue realmente interesane.

> ¡Recomiendo de todo corazón a cualquiera que quiera aprender o consolidar su conocimiento en Blockchain a que se inscriba!

Algunos estudiantes continuaron trabajando en el ecosistema de Polkadot después de la academia, pero yo no. Inicialmente, el producto en el que estaba trabajando en ese momento iba a ser onboardeado a Polkadot, pero al final no hubo un acuerdo comercial. Así que con el tiempo, los detalles que había aprendido comenzaron a esfumarse de mi memoria. Además, Polkadot siguió evolucionando, y simplemente no pude mantenerme al día en ese entonces.

Pero ahora sí puedo. Así que estos artículos son tanto para ti, querido lector, como para mí: este es mi intento de ponerme al día, mientras te cuento todo sobre esta fantástica tecnología.

---

Polkadot es una **bestia** de sistema. Esto va a tomar más de un solo artículo para una cobertura completa, así que comenzaremos con una introducción a las características geniales que esta Blockchain tiene para ofrecer.

¡Suficiente de esta larga introducción! No perdamos más de tu valioso tiempo, ¡y saltemos directo al asunto!

---

## Revisitando los Rollups {#revisiting-rollups}

No hace mucho tiempo, exploramos la definición de [Rollups](/es/blog/blockchain-101/rollups), también conocidos como layer 2s, o L2s. Como recordatorio, un **Rollup** es una tecnología de ledger distribuido que delega la carga de trabajo de consenso a una Blockchain padre, a menudo llamada layer 1 (L1).

> Y como [mencioné antes](/es/blog/blockchain-101/blockchain-safari/#sidechains), esto generalmente se expresa como que el L2 **hereda** la seguridad del L1.

Tal vez sea solo yo, pero siento que la mayoría de las personas asociarían inmediatamente la idea de **Rollups** con el **ecosistema de Ethereum**. Quiero decir, no sería una suposición tan incorrecta, dado que la lista de Rollups en Ethereum es bastante larga.

Sin embargo, un Rollup es en realidad un **concepto más general**. Incluso Bitcoin tiene algunas soluciones L2 como [Rootstock](https://rootstock.io/) o [Lightning Network](https://lightning.network/), y leí no hace mucho que algunos sistemas L2 [también están apareciendo en el ecosistema de Solana](https://solanacompass.com/projects/category/infrastructure/scaling).

Parece que la comunidad Blockchain hoy en día reconoce que los L2s son soluciones útiles... Pero no siempre fue así.

El hecho es que ninguna de las tecnologías L1 que he mencionado hasta ahora fueron diseñadas **con los Rollups en mente**. Fueron concebidas como sistemas aislados; una solución única para todo. Y eso está bien — la idea simplemente no existía cuando fueron creados por primera vez.

Esto ha llevado a algunas complicaciones, siendo la más importante lo que se llama **fragmentación del estado**. En pocas palabras, esto significa que el **estado global** de todos los L2s en un ecosistema está **disperso**, con cada L2 teniendo su propio pedacito de estado independiente.

Además, mover activos de un L2 a otro L2 es bastante problemático. Esto es lo que generalmente llamamos **interoperabilidad** — permitir que diferentes sistemas se entiendan entre sí, y transfieran activos de uno a otro. Pero como la mayoría de los Rollups también fueron concebidos como sistemas aislados, la interoperabilidad simplemente no era parte del plan, y en consecuencia, la fragmentación del estado siguió siendo un problema.

Sé que [se está poniendo mucho esfuerzo](https://cointelegraph.com/magazine/ethereum-l2s-interoperability-roadmap-complete-guide/) en lograr esta interoperabilidad, y es algo realmente encomiable. Aún así, no puedo evitar preguntarme: si hubiéramos conocido la preponderancia que tendrían los Rollups hoy, ¿no habríamos querido crear una Blockchain diseñada para **soportarlos completamente** desde el inicio, con interoperabilidad completa y todo?

Afortunadamente, esa pregunta **sí tiene una respuesta**. [Gavin Wood](https://en.wikipedia.org/wiki/Gavin_Wood), uno de los creadores de [Ethereum](/es/blog/blockchain-101/ethereum), tuvo esta misma pregunta en los primeros días de Blockchain, y decidió dejar su equipo original para perseguir sus ideas sobre cómo construir un sistema capaz de soportar completamente estos Rollups satélite, y darles la infraestructura necesaria para una interoperabilidad perfecta.

Y esas ideas se convirtieron en Polkadot.

<figure>
	<img
		src="/images/blockchain-101/polkadot/0*jOoz3YYCD0qIAhjQ-2.png"
		alt="El logo de Polkadot" 
	/>
</figure>

---

## Empezando Desde Cero {#starting-from-scratch}

Entonces, ¿cómo diseñamos este sistema desde cero?

Primero lo primero: queremos que los Rollups sean los **protagonistas**. Construiremos una capa base, pero no estará destinada directamente para usuarios. Nuestra intención es que los Rollups sean los consumidores de esta capa base, y que los usuarios usen los Rollups. Por lo tanto, la capa base se enfoca en resolver el **consenso**, para que los Rollups puedan implementar lógica personalizada.

En otras palabras:

::: big-quote
La capa base no necesita soportar Contratos Inteligentes
:::

Sí, lo sé — suena un poco extraño. La capacidad de crear programas es lo que hizo a Ethereum tan revolucionario, y acá estoy, diciéndote que los fundamentos de Polkadot **deliberadamente los evitan**. Pero ese es exactamente el punto: no descartaremos completamente la capacidad de definir lógica personalizada — simplemente la colocaremos en otro lugar.

> Como si Ethereum no soportara Contratos Inteligentes, y solo los Rollups lo hicieran.

Bueno, esa es una idea interesante. Sin embargo, no resuelve el otro problema fundamental: la **fragmentación del estado**.

La segunda pieza del rompecabezas es que deberíamos idear alguna forma para que los Rollups se comuniquen entre sí **nativamente**. Es decir, debería existir algún tipo de **protocolo** que sea entendido tanto por la capa base como por los Rollups, y que permita que las cosas se muevan de un Rollup a otro.

No iremos más lejos en nuestro experimento mental, ya que ya tenemos algunas pautas importantes para nuestro diseño (¡y no tenemos el tiempo para inventar una Blockchain en este post!), a saber:

- Capa base mínima
- Comunicación nativa entre Blockchains (o entre Rollups)

Todo lo que queda es ver cómo Polkadot da vida a estas ideas.

<figure>
	<img
		src="/images/blockchain-101/polkadot/0*SQMSBMpGYE6rM8Tl-3.jpg"
		alt="Una imagen de la película Frankenstein, con el subtítulo '¡está vivo!'" 
	/>
</figure>

---

## Una Blockchain de Blockchains {#a-blockchain-of-blockchains}

En Polkadot, la capa base de la que hemos estado hablando se llama **Relay chain**.

Es exactamente lo que esperarías: intencionalmente mínima, enfocándose únicamente en **consenso** y **coordinación**. No tiene soporte para Contratos Inteligentes ni lógica de aplicación compleja — solo lo esencial para mantener toda la red segura y sincronizada.

Hablaremos sobre la Relay chain en el próximo artículo. Por ahora, enfoquémonos en los otros componentes: los Rollups, que es **donde vive la lógica**.

Podemos dividirlos en dos categorías:

- Las [System chains](https://docs.polkadot.com/polkadot-protocol/architecture/system-chains/), que proporcionan funcionalidad esencial.
- Y los otros Rollups **personalizados**, originalmente llamados [Parachains](https://docs.polkadot.com/polkadot-protocol/architecture/parachains/).

> Por cierto, la comunidad de Polkadot está lentamente reemplazando el término **Parachain** por simplemente **Rollup**. Esto tiene una razón de ser, pero tendrá más sentido una vez que hablemos de [JAM](https://wiki.polkadot.network/learn/learn-jam-chain/) en futuros artículos.

Dos aspectos clave deben ser discutidos aquí: primero, necesitamos entender cómo se **expresa** la lógica. En segundo lugar — y no de menor importancia —, también necesitamos entender cómo la Relay chain **proporciona consenso** a estos Rollups.

Respondamos uno a la vez. El resto de este artículo se dedicará a la primera pregunta, y tendremos una **entrega completa** para responder la segunda.

---

## Lógica en Rollups {#logic-in-rollups}

Normalmente, pensamos en la lógica en términos de **Contratos Inteligentes**, o artefactos similares — como [Programas en Solana](/es/blog/blockchain-101/solana-programs), o [Scripts de Validación en Cardano](/es/blog/blockchain-101/blockchain-safari/#cardano). Hay un patrón claro aquí: el usuario puede definir cualquier lógica personalizada, y la Blockchain está preparada para interpretar y ejecutar estas instrucciones.

Pero rara vez nos detenemos a pensar en las implicaciones. Si recuerdas nuestro breve paso por el [almacenamiento](/es/blog/blockchain-101/storage) y los [contratos](/es/blog/blockchain-101/smart-contracts) en Ethereum, tuvimos que crear muchas herramientas para permitir que las cosas fueran almacenadas ordenadamente, y procesadas a través de una lista de instrucciones (opcodes). Sin duda, la maquinaria es impresionante, pero está **diseñada para la generalidad**.

> Lo cual es un oxímoron, ahora que lo pienso.

<figure>
	<img
		src="/images/blockchain-101/polkadot/0*-87c1cRlv30RmeId-4.jpg"
		alt="Meme de como un caballero" 
		title="Ah sí, muy preciso"
	/>
</figure>

Piénsalo. Significa que cada nodo en una red EVM o SVM necesita hablar el lenguaje de su respectiva máquina virtual — debe ejecutar sin fallas cada posible instrucción, manejar pilas virtuales, lidiar con layouts de memoria arbitrarios, y tratar con el consumo impredecible de recursos de cualquier código que alguien pueda desplegar.

Y toda esta generalidad **tiene un costo**. Ambos sistemas sufren de estar en el extremo un poco más lento y costoso de la ejecución, porque tienen que estar **preparados para cualquier cosa**, y esto a menudo lleva a ineficiencias.

En algunos escenarios, sin embargo, esto podría no ser necesario. Imaginemos por un momento que queremos diseñar una Blockchain donde solo puedas crear y transferir tokens fungibles (palabra elegante para monedas).

> Algo como Bitcoin, pero con soporte para múltiples tokens.

No necesitas la capacidad de ejecutar **cualquier** tipo de instrucción — solo **unas pocas funcionalidades simples** harán el trabajo. No necesitarías comunicarte con una llamada general `sendTransaction` — en su lugar, instrucciones simples como `mintTokens` podrían enfocarse en tareas específicas.

De nuevo, otra idea poco familiar y curiosa. Pero ¿cómo hacemos eso?

### Runtime {#runtime}

En Polkadot, en lugar de desplegar Contratos Inteligentes o Programas individuales a una VM de propósito general, se define **toda la lógica de tu Blockchain** como un solo programa, llamado [Runtime](https://docs.polkadot.com/polkadot-protocol/parachain-basics/node-and-runtime/#runtime).

Un Runtime define **cada regla** que tu Blockchain debería seguir. Especifica las operaciones permitidas, cómo procesarlas, cómo manejar cuentas, cómo se calculan las comisiones — todo. ¡Así que es esencialmente **toda tu lógica de transición de estado**!

Naturalmente, te estarás preguntando cómo **empezar** siquiera a escribir ese tipo de código.

No te preocupes, no tienes que empezar desde cero — hay todo un conjunto de herramientas para hacer esto, llamado [Polkadot SDK](https://polkadot.com/platform/sdk/) (anteriormente conocido como [Substrate](https://github.com/paritytech/substrate)). Allí, encontrarás bloques de construcción modulares llamados **pallets** — componentes pre-construidos, cuidadosamente elaborados y optimizados (pero con opiniones) listos para usar en la lógica de tu Blockchain.

> Por ejemplo, hay un pallet para el manejo de cuentas. Y uno para multifirmas. Y si quieres construir algo más complejo como un DEX, solo necesitas combinar algunos pallets existentes, y agregar algo de lógica personalizada encima — a través de un conjunto de utilidades llamadas [FRAME](https://docs.polkadot.com/develop/parachains/customize-parachain/overview/) (Framework for Runtime Aggregation of Modularized Entities).

Curiosamente, hay pallets para **agregar funcionalidad de Contratos Inteligentes** a un Rollup. Aunque contraintuitivo al principio, la idea es que los desarrolladores pueden **optar por** el comportamiento si así lo desean.

Hubo un impulso para un nuevo lenguaje de Contratos Inteligentes basado en Rust llamado [Ink!](https://use.ink/), que solo requería la adición de [pallet-contracts](https://use.ink/docs/v5/how-it-works). Y mientras Ink! sigue en desarrollo activo, creo que últimamente el enfoque de la comunidad se ha desplazado a [PolkaVM](https://docs.polkadot.com/polkadot-protocol/smart-contract-basics/polkavm-design/), que promete una experiencia más optimizada a través de algunos otros pallets especializados. ¡No te preocupes, hablaremos de esto más tarde!

Finalmente, este Runtime se compila a código binario. Tradicionalmente, el objetivo de compilación era [WebAssembly](https://webassembly.org/), aunque el ecosistema está evolucionando lentamente hacia arquitecturas [RISC-V](https://riscv.org/) para mejor rendimiento.

Pero aún no hemos **terminado ni con la mitad**. Digamos que hemos logrado crear el binario para nuestra Blockchain. Genial. Pero ¿cómo continúa la historia? ¿Quién ejecuta este código, y cómo?

---

## Arquitectura del Nodo {#node-architecture}

Ya sabemos bien que una Blockchain está conformada por **nodos** que entienden la lógica de transición de estado. Y así, ¡será el trabajo de un nodo de nuestra Parachain (o Rollup) interpretar y ejecutar el código Runtime!

Los nodos de las Parachains consisten en un **cliente** (o **host**) que puede comunicarse con y ejecutar un Runtime. Es esencialmente un entorno de ejecución para nuestro binario compilado — una **mini VM**, si quieres.

En otras palabras, maneja toda la **infraestructura**, mientras que el Runtime está a cargo de la **lógica**. Maneja cosas como:

- una **base de datos** para almacenamiento
- **networking** con otros nodos
- el **pool de transacciones**

> Ya sabes, cosas estándar de nodos.

Pero en lugar de la lógica de ejecución estática que encontrarías en otras Blockchains, estos nodos tienen una especie de **ranura** donde **cualquier Runtime** puede ser insertado. A través de [Runtime APIs](https://paritytech.github.io/polkadot-sdk/book/runtime-api/index.html?highlight=host+function#runtime-apis), el host puede llamar funciones del Runtime, y a través de **funciones host**, el Runtime puede comunicarse con el host para usar algunas de sus funcionalidades, como acceder al almacenamiento de la base de datos.

<figure>
	<img
		src="/images/blockchain-101/polkadot/1*i6Yd6Uj19juEzCX86fQ04Q-5.png"
		alt="Arquitectura del nodo"
	/>
</figure>

Este es un concepto genial, porque nos permite **reutilizar nodos** para todo tipo de Runtimes. Hablando de eso... ¿Dónde se almacena el Runtime?

### Almacenando el Runtime {#storing-the-runtime}

En principio, el Runtime podría almacenarse en cualquier lugar. Una solución simple sería distribuirlo junto con el código fuente de un nodo. Para cada Parachain, simplemente dirías "oye, usa el código cliente estándar, y usa este Runtime en particular".

Pero la gente de Polkadot tenía otro truco bajo la manga — y uno muy inteligente: ¿qué tal almacenar el Runtime **directamente en la Blockchain**?

> ¿No me digas que tu primer pensamiento no fue "¿por qué diablos haría eso"?

Es un pensamiento extraño, sí, pero hay una buena razón para ello: **actualizaciones sin forks.**

<figure>
	<img
		src="/images/blockchain-101/polkadot/0*GgYFTs-u6hK-iIXO-6.jpg"
		alt="Steven He en su clásico meme what the hell" 
		title="¿Qué demonios?"
	/>
</figure>

Verás, como mencionamos antes, la lógica tradicionalmente está integrada directamente en el software del nodo. Esto significa que cuando quieres actualizar cómo se procesan las transacciones, necesitas ya sea un **hard** o **soft fork** — un proceso complejo y riesgoso que requiere que cada operador de nodo **actualice manualmente** el software que está ejecutando.

Ahora, debido a cómo está diseñada la arquitectura del nodo en el Polkadot SDK, podemos hacer algo bastante notable y francamente muy disruptivo aquí: podemos actualizar el código Runtime **sin cambiar la arquitectura del nodo**.

Aún así, necesitaríamos asegurarnos de que todos cambien a la versión correcta del Runtime **al mismo tiempo**, porque de lo contrario aún podríamos tener situaciones de fork. Sin embargo, al almacenar todo el código Runtime **directamente en el estado de la Blockchain** (en una ubicación reservada), todos pueden simplemente usar cualquier Runtime que sea el actual, y no se formarían forks — ¡una **actualización sin forks**!

<figure>
	<img
		src="/images/blockchain-101/polkadot/0*pnKp1id1YOp0Fo6X-7.jpg"
		alt="Meme de mente explotada" 
		title="Hermoso"
	/>
</figure>

> ¡No se necesita coordinación!

**Pero** — siempre hay un pero — también tiene algunos riesgos. Por ejemplo, tenemos un problema que también aflige a otras Blockchains: si no probamos completamente el nuevo Runtime, podríamos estar introduciendo vulnerabilidades o errores en **toda la Blockchain**.

Además de eso, aparecen otros problemas **nuevos**. ¿Qué pasa si el nuevo Runtime no es compatible con el **estado anterior**? En esa situación, necesitaríamos realizar algún tipo de migración — ¡y esto podría no ser una hazaña simple en absoluto! Necesita simulación y pruebas extensas, para que estemos 100% seguros de que todo irá bien cuando se ejecute.

Problemas potenciales aparte, es un concepto indiscutiblemente interesante. ¡Supongo que el tiempo dirá si es una decisión arquitectónica genial o una pesadilla operacional, pero al menos la posibilidad está ahí!

---

## Resumen {#summary}

Creo que este es un buen lugar para parar por ahora.

Las cosas están fluyendo bastante bien después de nuestras preguntas iniciales. Cubrimos una buena cantidad de cómo se maneja la **lógica** en los Rollups de Polkadot, con nodos funcionando como esas consolas de juegos de la vieja escuela con un socket para cartuchos, donde podemos insertar nuestro Runtime personalizado.

<figure>
	<img
		src="/images/blockchain-101/polkadot/0*2X_pmsJZlxGr-E_N-8.jpg"
		alt="Una consola familiar de juegos" 
		title="Ah... Los buenos viejos tiempos"
	/>
</figure>

Ciertamente fue mucho... Pero créelo o no, apenas estamos **arañando la superficie**. ¡Esto es solo el calentamiento!

> Y ni siquiera estoy contando todos los detalles detrás de la arquitectura del nodo. Para ser justos... ¡supongo que esto es cierto para la mayoría de las Blockchains que he cubierto!

Muchas preguntas siguen sin respuesta. En particular no hemos hablado sobre el rol de la **Relay chain**. Dijimos antes que proporciona **consenso** — pero ¿cómo? ¿Qué tipo de comunicación necesita ocurrir entre los Rollups y la Relay chain? ¿Qué información necesita ser compartida?

Intentaré responder estas preguntas y más en nuestro próximo encuentro. ¡Nos vemos pronto!
