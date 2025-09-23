---
title: 'Blockchain 101: Coretime'
date: '2025-09-01'
author: frank-mangone
thumbnail: /images/blockchain-101/coretime/0*5hVpbbmaF_GTFVIK-7.jpg
tags:
  - polkadot
  - blockchain
  - validation
  - coretime
description: >-
  Acceder a los recursos de validación de Polkadot se puede hacer a través de
  una forma novedosa de pagar por el uso de Blockchain: Coretime.
readingTime: 10 min
contentHash: 619680a880e8ede0a2afd5b26269bbfe81f4d7e7d7fa90a2da77dea85130b59b
supabaseId: 45ad865f-4296-439e-8330-512eba99b2cf
---

> Esto es parte de una serie más larga de artículos sobre Blockchain. Si este es el primer artículo que encuentras, te recomiendo comenzar desde el [inicio de la serie](/es/blog/blockchain-101/how-it-all-began).

Hasta ahora, hemos cubierto la [arquitectura general de Polkadot](/es/blog/blockchain-101/polkadot) y su [mecanismo de consenso](/es/blog/blockchain-101/polkadot-consensus).

Es importante aclarar que no hemos cubierto **todo lo que hay para saber** sobre estos temas. Por ejemplo, no dijimos nada sobre los [requisitos para ejecutar un validador](https://docs.polkadot.com/infrastructure/running-a-validator/requirements/), o sobre cómo se logra la finalidad a través de [GRANDPA](https://arxiv.org/pdf/2007.01560), o cómo [BABE](https://polkadot.com/blog/polkadot-consensus-part-3-babe/) (o su evolución, [SAFROLE](https://wiki.polkadot.com/learn/learn-safrole/)) maneja la asignación pseudoaleatoria de validadores. Te dejo estas cosas para que las investigues por tu cuenta, para así enfocarnos en el panorama general.

Cerramos la [entrega anterior](/es/blog/blockchain-101/polkadot-consensus) con un poco de suspenso: ¿cómo los Rollups **obtienen acceso** a la validación de la Relay chain?

Validar un bloque completo es mucho más costoso que simplemente verificar si una sola transacción es válida. Además, los validadores de la Relay chain necesitan cargar y ejecutar el Runtime específico del Rollup, lo que también significa que necesita haber sido **registrado** en la cadena en algún momento.

> Quizás podamos hacer el paralelo con un Contrato Inteligente siendo desplegado y luego aceptando transacciones — la principal diferencia siendo que con los Contratos Inteligentes, los validadores L1 tienen acceso directo a **todo el estado** que necesitan para la validación. Con los Rollups, sin embargo, los validadores necesitan entender Runtimes completamente diferentes y manejar sistemas de estado separados.

Y luego está la pregunta de cuántos validadores asignamos a cada cadena, y por qué — recuerda que [ELVES](/es/blog/blockchain-101/polkadot-consensus/#elves-protocol), el algoritmo de consenso, asigna validadores dinámicamente a diferentes rollups.

Esto está impulsado por un problema fundamental de asignación de recursos: los validadores son costosos y limitados, pero los Rollups tienen requisitos muy heterogéneos. Algunos necesitan validación constante — otros solo ocasionalmente. ¿Cómo distribuimos de manera justa y eficiente este recurso precioso que es **el tiempo de cómputo del validador**?

La solución viene en forma de [Agile Coretime](https://polkadot.com/agile-coretime/). Pero las cosas no siempre funcionaron así, y el viaje desde el diseño original de Polkadot hasta el sistema flexible de hoy revela mucho sobre los desafíos de construir una infraestructura Blockchain escalable.

Con eso, el contexto está definido. ¡Vamos!

---

## La Solución Original {#the-original-solution}

Cuando Polkadot se lanzó por primera vez — la versión a la que ahora nos referimos como [Polkadot 1.0](https://wiki.polkadot.com/general/polkadot-v1/) —, lo hizo con un [sistema de subastas](https://polkadot.com/blog/obtaining-a-parachain-slot-on-polkadot/).

Simplificando un poco, había períodos de subasta en los que podías hacer ofertas (en DOT, la moneda nativa de Polkadot), y la oferta ganadora aseguraría un arrendamiento en un **slot de Parachain** por exactamente 96 semanas (alrededor de dos años).

> ¡Me referiré a los Rollups como Parachains por ahora, ya que era la jerga de la época!

Asegurar un slot era esencialmente lo mismo que comprarte un lugar garantizado en la planificación de la validación de Polkadot. Es decir, tu Parachain sería asignada validadores para cada bloque de la Relay chain, asegurando tiempos de bloque consistentes de 12 segundos. A cambio, los DOTs que ofertaste serían **bloqueados** durante toda la duración del arrendamiento. Perderías acceso a esos DOTs completamente durante ese período — era un compromiso de capital masivo.

<figure>
	<img
		src="/images/blockchain-101/coretime/0*tx2_EuavD1HxOXhm-1.jpg"
		alt="Dinero bloqueado" 
	/>
</figure>

Después de leer eso, apuesto a que tienes algunas dudas. Y es que si, este sistema tiene algunos problemas. Tendrás preguntas como:

- ¿Cuánto tiempo toman las subastas?
- ¿Cuánto DOT necesito ofertar y bloquear?
- ¿Qué pasa si no gano la subasta? ¿Me quedo fuera de la validación de Polkadot?
- Si mi Parachain no está produciendo bloques, ¿no estoy desperdiciando recursos de la red?

Bueno... Sí. Si bien las subastas [no eran muy largas](https://polkadot.com/auctions/#auctions-timetable), las ofertas podían escalar a [cantidades absurdas](https://coinmarketcap.com/polkadot-parachains/polkadot/auction/), a menudo excediendo millones de DOTs — estamos hablando de **decenas de millones de dólares** bloqueados durante dos años completos. Que por supuesto, no eran líquidos durante los períodos de arrendamiento.

Las subastas se ejecutaban alrededor de cada 15 días, y si no ganabas tu slot, estabas **completamente excluido** de Polkadot. Punto. Sin validación, sin interoperabilidad, sin seguridad compartida — nada.

Por último, algunas Parachains tenían períodos de baja actividad o inactividad total, en los que Polkadot esencialmente **no validaba nada**. Un slot podría ser asignado a una cadena que no estaba haciendo nada.

> A menudo se les llamaba **cadenas fantasma**. Slots "caros" produciendo bloques vacíos mientras otros proyectos se sentaban al margen, sin poder acceder a la red en absoluto.

Así que sí, la situación era un poco un desastre. El proceso de oferta no era muy atractivo, y si tu Parachain tenía poco tráfico, simplemente contribuiría a hacer la asignación de recursos más ineficiente.

<figure>
	<img
		src="/images/blockchain-101/coretime/1*g1fwMIAJjjsMIIBvDEg4Gg-2.png"
		alt="Meme 'Esto está bien'" 
	/>
</figure>

Era obvio que esto **no podía escalar**. Supongo que por eso solo se celebraron solamente [20 subastas](https://coinmarketcap.com/polkadot-parachains/polkadot/auction/) antes de que el sistema fuera descartado, a favor de una solución más escalable que había sido puesta en marcha meses antes: **Agile Coretime**.

---

## Rediseñando el Sistema {#redesigning-the-system}

Una cosa estaba súper clara: si Polkadot iba a ser una Blockchain escalable, necesitaba una mejor estrategia para asignar recursos de validación.

Empecemos por abordar el elefante en la habitación: ¿por qué diablos necesitamos **arrendamientos de 2 años**? Ese es un compromiso realmente a largo plazo, y nada garantiza que las Parachains tendrán tráfico y actividad consistentes durante ese período.

Bien, descartemos eso entonces. Pero ahora... ¿Cómo elegimos qué Parachain validar en cada bloque? Necesitamos una forma flexible de permitir que estos sistemas paguen por **tiempo de validación** cuando lo necesiten.

Eso suena como un **recurso** que puedes vender. Y uno naturalmente escaso — solo existen una cierta cantidad de validadores, y los bloques de la Relay chain tienen un espacio limitado, así que solo puedes validar una cantidad establecida de bloques de Rollup por ciclo.

> Sí, voy a empezar a llamarlos Rollups desde este punto en adelante. Creo que así es como la comunidad quiere que se les llame, ¡así que mantengámonos con eso!

Así, nació el concepto de [blockspace](https://polkadot.com/blockspace/) como un recurso (commodity). Cuando necesitas que la Relay chain valide tu Rollup, simplemente compras el blockspace que necesitas, cuando lo necesitas.

Todo lo que queda es determinar cómo se ofrece y consume este recurso.

La solución que surgió de estas nuevas ideas se llama **Agile Coretime**. Está construida alrededor de esta percepción simple pero poderosa de que diferentes proyectos pueden tener necesidades muy diferentes.

Coretime se centra alrededor de la idea de **cores**.

<figure>
	<img
		src="/images/blockchain-101/coretime/0*JAylL9NHVCOlJ46w-3.jpg"
		alt="Jack Sparrow con una sonrisa confundida"
		title="¿Qué?"
	/>
</figure>

Sí, cores.

No es más que un concepto abstracto, que puede pensarse como un slot de validación garantizado en Polkadot. Esencialmente, cuando compras Coretime, estás reservando un lugar en la cola de validación.

Polkadot tiene un **número limitado** de estos cores (actualmente alrededor de 80, con planes de escalar más alto). Cada core representa la **capacidad de validar un bloque de Rollup por bloque de Relay chain**. Cuando es hora de validar bloques, el algoritmo de consenso (ELVES) mira qué Rollups han comprado Coretime, y asigna validadores en consecuencia.

> En el sistema antiguo, alquilar un slot significaba exactamente lo mismo que alquilar un core por dos años — asegurando recursos de validación para tu Rollup.

Hablando de eso, estos conjuntos de validadores a cargo de verificar un bloque de Rollup están haciendo **trabajo computacional real**. Así que en cada ronda de consenso, cada grupo de validadores es lo que **realmente** comprende un core.

<figure>
	<img
		src="/images/blockchain-101/coretime/1*wjBkwSPk6Sd529pIynja_g-4.png"
		alt="Un bloque siendo validado por múltiples validadores, representando un core"
		title="[zoom]"
	/>
</figure>

Así, podemos pensar en un core como una **CPU virtual** de la red Polkadot, que ejecuta un **solo programa** en cada bloque — y estos "programas" son simplemente la validación de un solo Rollup.

> Nota que este concepto de **core** es naturalmente escaso — cada core representa la capacidad de validar **un bloque de Rollup por bloque de Relay chain**, así que solo puedes validar tantos rollups simultáneamente como cores tengas disponibles.

¡Y así, Polkadot mismo puede pensarse como una **computadora distribuida multi-core gigante**, capaz de ejecutar todos estos programas de Rollup en paralelo!

Eso es bastante genial, si me preguntas.

---

## Comprando Coretime {#purchasing-coretime}

Ahora que entendemos qué son los cores, la siguiente pregunta es obvia: ¿cómo **realmente compras Coretime**?

Y aquí, Agile Coretime tiene un par de trucos súper inteligentes. Hay **dos formas** de comprar Coretime: **al por mayor**, y **bajo demanda**. Vamos a desglosarlas.

El primer modelo funciona de manera similar a una suscripción mensual, como la que tienes para Netflix.

<figure>
	<img
		src="/images/blockchain-101/coretime/0*DKqdvKN96rr_zKW6-5.jpg"
		alt="Cuenta de Netflix representando cómo compartimos el sistema hasta el extremo" 
		title="A menos que... Ya sabes"
	/>
</figure>

Pagas por adelantado por un período fijo, y a cambio, obtienes acceso predecible al servicio.

Lo que realmente compras son trozos de 28 días del tiempo de un core, llamados **regiones**. Durante esos 28 días, ese core es tuyo para usar como quieras — obtienes validación garantizada para **cada bloque de Relay chain**.

Esto es por supuesto perfecto para **proyectos bien establecidos** que necesitan validación consistente. Tal vez un [DEX](https://www.coinbase.com/learn/crypto-basics/what-is-a-dex) ocupado procesando miles de transacciones diariamente, o tal vez un bridge manejando transferencias cross-chain regulares — estos son los tipos de aplicaciones que se benefician del Coretime al por mayor.

Pero no termina ahí. Estas regiones no son solo suscripciones simples. En realidad son **NFTs** que existen en la [Coretime chain](https://docs.polkadot.com/polkadot-protocol/architecture/system-chains/coretime/) — un System Rollup dedicado. Estos NFTs pueden ser divididos, compartidos y comercializados en mercados secundarios, permitiendo algunos comportamientos muy geniales como:

- **Interlacing**: si quieres compartir los costos de un core con otro proyecto, puedes usar [interlacing](https://docs.polkadot.com/develop/parachains/deployment/manage-coretime/#interlace), y programar quién usa el core en cada bloque. Por ejemplo, podría haber dos proyectos usando un core, y podrían obtener bloques alternados (uno obtiene bloques pares, el otro obtiene bloques impares).
- **Partitioning**: en lugar de definir un horario de bloques usando interlacing, otra opción es usar [partitioning](https://docs.polkadot.com/develop/parachains/deployment/manage-coretime/#partition) para dividir una región en dos trozos más pequeños. Esto crea dos regiones disjuntas cuyo tiempo total iguala la región original. ¡Y la parte genial: puedes dividirla donde quieras!
- **Pooling**: si tienes regiones al por mayor sin usar, puedes [colocarlas en un pool](https://docs.polkadot.com/develop/parachains/deployment/manage-coretime/#pool) para que otros servicios las consuman, mientras ganas recompensas.
- **Pipelining**: mientras que interlacing y partitioning son técnicas para compartir Coretime, [pipelining](https://wiki.polkadot.com/learn/learn-async-backing/) (o async backing) es una forma de aprovechar al máximo los cores. Al no esperar la inclusión de bloques en la Relay chain antes de comenzar el backing de uno nuevo, la validación puede suceder más rápido.

<figure>
	<img
		src="/images/blockchain-101/coretime/1*mso91iKh30-JEY1bGoH63g-6.png"
		alt="Diagrama de interlacing"
        title="[zoom] Interlacing en acción" 
	/>
</figure>

> Otra característica genial es que si asignas toda tu región a un solo Rollup sin dividirla o hacer interlacing, obtienes **derechos de renovación** con protección de precio. Esto significa que puedes renovar tu core para el próximo período de 28 días a un aumento de precio limitado, protegiéndote de picos de precio repentinos.

¡Es un modelo muy flexible, prácticamente **sin precedentes** en sistemas Blockchain! Y tiene el potencial de crear modelos económicos completamente nuevos para compartir costos de infraestructura.

En el otro extremo del espectro, tenemos Coretime bajo demanda.

> Para continuar con las analogías de apps, piénsalo como el Uber de la validación de bloques — ¡solo pagas por ello cuando lo necesitas!

En lugar de comprar todo un mes por adelantado, **ofertas por validación** en una base bloque por bloque. ¿Necesitas tu Rollup validado ahora mismo? Haz una oferta, y si es lo suficientemente alta, obtienes el siguiente slot disponible.

Esto es perfecto para:

- Nuevos proyectos probando sus rollups
- Aplicaciones con patrones de uso irregulares
- Cadenas de gobernanza que solo se activan durante períodos de votación
- Cualquiera que quiera experimentar sin un compromiso masivo por adelantado

Por supuesto, necesitas **cores** para cualquier actividad de validación. ¿Entonces de dónde vienen estos cores? Bueno, la acción de [pooling](https://docs.polkadot.com/develop/parachains/deployment/manage-coretime/#pool) que describimos hace un momento en realidad contabiliza esta disponibilidad de tiempo computacional, ¡y estos recursos "excesivos" se ponen a disposición a través de Coretime bajo demanda!

El precio es dinámico — cuanto más demanda hay, más alto va el precio. Pero cuando la red está tranquila, la validación es más barata.

---

En general, este sistema resuelve el **problema de las cadenas fantasma** que vimos antes. Los cores ya no se quedarán inactivos — o al menos, si lo están, será por acción deliberada de un comprador de Coretime.

---

## Resumen {#summary}

Polkadot ha recorrido un largo camino desde esas subastas rígidas de 2 años, evolucionando hacia este sistema de Coretime flexible e impulsado por el mercado.

Agile Coretime es un gran cambio en cómo pensamos sobre los recursos Blockchain. Se enfoca en **asignación eficiente**, que es clave para la escalabilidad. Y como sabemos, la escalabilidad es uno de los grandes pilares en el diseño Blockchain.

Y esto es solo el comienzo. El modelo Coretime es relativamente nuevo, y ya estamos viendo el surgimiento de mercados secundarios como [RegionX](https://hub.regionx.tech/?network=polkadot), y formas creativas de compartir costos.

> ¡Es una propuesta de valor muy diferente, eso seguro!

Sistemas como estos tienen la tendencia a desarrollarse de maneras sorprendentes e inesperadas. Así que supongo que, como con muchas cosas en la esfera de Polkadot, ¡tendremos que esperar y ver qué depara el futuro!

---

Además, Polkadot no se detiene ahí. La próxima evolución importante ya **está en desarrollo**.

Porque total, si tenemos la capacidad de asignar recursos computacionales eficientemente... ¿Deberíamos limitarnos a **Rollups**? ¿No podemos generalizar a **cualquier tipo de computación**?

<figure>
	<img
		src="/images/blockchain-101/coretime/0*5hVpbbmaF_GTFVIK-7.jpg"
		alt="Meme de cerebro galáctico" 
		title="Momento de cerebro galáctico"
	/>
</figure>

Cubriremos eso y más en el [próximo artículo](/es/blog/blockchain-101/jam). ¡Nos vemos ahí!
