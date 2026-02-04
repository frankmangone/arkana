---
title: 'Blockchain 101: Evolucionando una Blockchain'
author: frank-mangone
date: '2026-01-16'
readingTime: 12 min
thumbnail: /images/blockchain-101/evolving-a-blockchain/cheers.webp
tags:
  - blockchain
  - ethereum
  - theMerge
  - danksharding
description: >-
  Para cerrar, echamos un vistazo a algunas pautas importantes para actualizar
  una Blockchain que ya está en funcionamiento.
contentHash: b9d8755a59ae91c0c3adda120727f5aec9d723e7386e06a292b58b40517550e4
supabaseId: null
---

> Este artículo es parte de una serie más larga sobre Blockchain. Si este es el primer artículo que encuentras, te recomiendo comenzar por el [inicio de la serie](/es/blog/blockchain-101/how-it-all-began).

A lo largo de la serie, hemos cubierto varios paradigmas de Blockchain. O para ser más precisos, estudiamos sistemas que logran objetivos similares, pero que no necesitan ser una Blockchain para hacerlo: por ejemplo, tuvimos [sistemas basados en DAG](/es/blog/blockchain-101/beyond-the-blockchain-part-2), las clásicas [Tecnologías de Libro Mayor Distribuido](/es/blog/blockchain-101/blockchain-safari) (DLTs), y cosas más exóticas como [las pruebas recursivas de Mina](/es/blog/blockchain-101/zk-in-blockchain/#hybrid-approaches).

Esto es una prueba de que Blockchain como concepto ha crecido más allá de su caparazón, incluso si la nomenclatura se ha mantenido. La principal conclusión debería ser que esta es un área de estudio amplia, con un ecosistema vibrante y diverso que intenta desarrollar una alternativa para los sistemas tradicionales, intentando mejorar algunos problemas críticos de los que ya hemos hablado extensamente.

A pesar de esta multiplicidad de soluciones y sistemas distribuidos, hay un modelo que, al menos hoy en día, todavía domina la industria. Ya sabes lo que dicen: **el que pega primero, pega más fuerte**.

Por supuesto, estoy hablando de **Ethereum**.

Esta Blockchain ha liderado muchos avances en el campo, y desde entonces ha mantenido su lugar como una especie de modelo a seguir para otras Blockchains, o al menos, una referencia para comparar.

Así que hoy, quiero cerrar la serie hablando de algunas particularidades en cómo un sistema tan complejo **sigue evolucionando**. Por supuesto, al igual que cualquier otro sistema en producción, las actualizaciones no son triviales, y el tiempo de actividad es de suma importancia. Pero también está el hecho de que algunas de estas actualizaciones ni siquiera tenían **ningún precedente** en la historia de Blockchain, y el hecho de que fueron ejecutadas tan perfectamente que si no conoces los detalles, es posible que **ni siquiera te hayas dado cuenta**, es muy notable.

¡Es hora del gran final entonces! ¡Listos o no, allá vamos!

---

## Modificando el Consenso {#modifying-consensus}

Durante sus primeros días, Ethereum eligió usar un mecanismo de consenso muy similar al de Bitcoin: una implementación de [Proof of Work](/es/blog/blockchain-101/a-primer-on-consensus) (PoW). En ese momento, Bitcoin era la gran historia de éxito en el espacio de Blockchain, y casi todos los nuevos en el bloque (juego de palabras intencionado) imitaron su algoritmo de consenso, tal vez por falta de otras referencias sólidas.

Ya sabes que [ya no es el caso](/es/blog/blockchain-101/consensus-revisited). Ethereum ahora ejecuta un algoritmo de **Proof of Stake** (PoS) para alcanzar el consenso, y todo parece funcionar bastante bien. A menos que estés siguiendo propuestas de mejora, no hay muchas preguntas que hacer, supongo.

Vale, genial... Pero ¿te has detenido a pensar cómo **realmente sucedió** el cambio?

<figure>
	<img
		src="/images/blockchain-101/evolving-a-blockchain/switch.webp"
		alt="Un interruptor de encendido y apagado" 
		title="No es tan fácil"
	/>
</figure>

Intentemos medir la complejidad de tal empresa.

- Primero, considera que la red **ya está en funcionamiento**: los usuarios esperan que siga procesando sus transacciones, y que preserve sus balances y demás. Esto prácticamente descarta comenzar una nueva Blockchain desde cero para reemplazar la original.
- En segundo lugar, el nuevo algoritmo PoS **no estaba realmente probado a escala** en ese momento. Incluso si cambiar fuera fácil, nada garantiza que el algoritmo sea robusto, y que no se rompa de la nada.

Estas constituyen dos restricciones importantes para el proceso de cambio: preservar el estado, y garantizar la estabilidad.

Es un problema difícil de resolver. Piensa en ello por un momento: si dependiera de ti, ¿qué estrategia se te ocurriría para **migrar de forma segura**?

Ethereum realmente se lució con esto. Veamos cómo lo hicieron.

### Separación de Clientes {#client-separation}

Debemos comenzar mirando cómo los **mineros** solían operar en PoW.

El proceso de minería se puede dividir en dos pasos (muy) generales: **construcción de bloques**, y **minería de bloques**. Esto es, los mineros primero necesitan construir un bloque con transacciones válidas, ejecutarlas para asegurarse de que se cumplan los límites de gas, y solo entonces comenzarían a minar.

> ¡Recuerda que la [minería](/es/blog/blockchain-101/a-primer-on-consensus) era el proceso de encontrar un hash válido para el bloque!

Y aquí está la observación clave: al pasar a PoS, solo necesitaríamos **reemplazar** la minería de bloques por el proceso de validación de PoS.

<figure>
	<img
		src="/images/blockchain-101/evolving-a-blockchain/fair-enough.webp"
		alt="Jim de The Office con texto 'Fair enough'" 
	/>
</figure>

Lo sé — puede que no parezca mucho. Quiero decir, incluso se siente algo obvio, ¿verdad?

Lo creas o no, este pequeño detalle permite uno de los cambios arquitectónicos más importantes en la historia de Blockchain. Acabamos de identificar que hay dos preocupaciones separadas e independientes en juego aquí: **ejecución de bloques**, y **consenso**.

Entonces, ¿no podemos modularizarlos? ¿Qué tal si **dividimos el programa del nodo** en un programa de ejecución, y un programa de consenso? De esta manera:

- El **programa de ejecución** (o cliente) estaría a cargo de construir bloques.
- El **programa de consenso** (o cliente) recibiría esos bloques, y hablaría con otros clientes de consenso para validar y finalmente aceptar el bloque.

Esta separación tiene **dos consecuencias principales**, una muy importante para el cambio, y otra que es una especie de **efecto secundario agradable**. Nos enfocaremos en la primera.

### La Beacon Chain {#the-beacon-chain}

Evidentemente, los clientes de consenso solo necesitan enfocarse en el consenso.

Solo necesitan validar **algo** creado por los clientes de ejecución, y el resto es una cuestión de coordinación entre validadores — el mecanismo de consenso real en acción.

Lo que Ethereum propuso es lo siguiente: simplemente ejecutar **otra Blockchain**, que incluye estas cosas producidas por los clientes de ejecución — llamadas **execution payloads** — dentro de sus propios bloques.

<figure>
	<img
		src="/images/blockchain-101/evolving-a-blockchain/execution-payloads.webp"
        alt="Execution payloads dentro de bloques de la Beacon chain"
		title="[zoom]" 
	/>
</figure>

Si todavía te rascas la cabeza después de leer eso, está bien — no es inmediatamente evidente por qué esta es una buena decisión. El punto de esto es tener nodos de consenso que comiencen su operación con **execution payloads vacíos**:

<figure>
	<img
		src="/images/blockchain-101/evolving-a-blockchain/empty-payloads.webp"
        alt="Execution payloads vacíos"
		title="[zoom]" 
	/>
</figure>

La genialidad de esto es que ahora tenemos una forma de **probar** el nuevo mecanismo de consenso PoS de forma aislada, sin tener que tocar la red que ya está en funcionamiento.

Y así, antes del cambio, esta nueva Blockchain cobró vida, independiente del Ethereum antiguo en el que los usuarios estaban transaccionando, que continuó usando PoW.

¿El resultado? En ese punto, existían dos Blockchains completamente separadas. Todo lo que quedaba era hacer que este nuevo sistema, llamado la [Beacon chain](https://ethereum.org/roadmap/beacon-chain/), comenzara a recibir **execution payloads reales**.

<figure>
	<img
		src="/images/blockchain-101/evolving-a-blockchain/the-merge.webp"
        alt="El momento del cambio"
		title="[zoom]" 
	/>
</figure>

Después del cambio, los clientes antiguos solo necesitarían detener sus actividades de minería, y en su lugar recibir bloques validados de los clientes de consenso. En consecuencia, lo que los usuarios de Ethereum ven (lo que llegó a conocerse como la **capa de ejecución**) es una especie de espejo de la Blockchain "real" (donde está ocurriendo el consenso), a la que ahora nos referimos como la **capa de consenso**.

Cómo se hizo el cambio no importa demasiado para nosotros hoy. Lo que sí importa es que los usuarios no tuvieron ningún tiempo de inactividad, ni vieron ningún cambio en sus activos: todo continuó funcionando como si **nada hubiera pasado nunca**.

<figure>
	<img
		src="/images/blockchain-101/evolving-a-blockchain/magic.webp"
        alt="Bob Esponja con texto 'magic'"
	/>
</figure>

### El Efecto Secundario {#the-side-effect}

Ahora, mencioné que había una segunda consecuencia "agradable".

La Máquina Virtual de Ethereum es un modelo de ejecución (turing) completo, lo que significa que puede operar con cualquier mecanismo de consenso, siempre que las transacciones estén ordenadas correctamente. La separación de clientes de ejecución y consenso hizo esto bastante evidente: nada nos impide ejecutar un cliente de consenso completamente diferente (digamos, uno de Proof of Work), y aún así usar el EVM (definido en el cliente de ejecución).

Y el EVM en sí tiene mucho valor. Como fue el primer "framework" para la programabilidad en Blockchain, muchos desarrolladores eligieron especializarse en la tecnología, invirtiendo horas y horas para perfeccionar el oficio. Y también, varias aplicaciones importantes fueron diseñadas con el EVM en mente.

Hemos recorrido un largo camino desde ese punto, y han surgido nuevos modelos de ejecución. Sin embargo, hay **fricción** al migrar a ellos: los desarrolladores necesitan aprender nuevos lenguajes, y las aplicaciones necesitan ser refactorizadas para adaptarse al nuevo modelo.

En el polo opuesto, el consenso casi siempre es **completamente transparente** para el desarrollador de Contratos Inteligentes.

Esto lleva a una consecuencia muy natural: han surgido nuevas Blockchains que eligen **cambiar el mecanismo de consenso**, pero **preservar el modelo de ejecución**. Mientras esto se haga correctamente, las aplicaciones preexistentes en Ethereum son más fáciles de migrar a estos nuevos sistemas, y los desarrolladores no están obligados a reaprender todo, así que es un ganar-ganar.

Hay muchas formas de ver esto. En cierto modo, Ethereum abrió la puerta para que los "competidores" se aprovecharan de sus éxitos. Pero argumentaría que esto no es algo malo: hizo que el ecosistema fuera más dinámico, y empoderó a otros actores para continuar impulsando la investigación en el lado del consenso.

Han surgido cosas locas de esto, algunas de las cuales ya hemos mencionado en la serie. Si acaso, este tipo de movimiento es para el beneficio más amplio de la sociedad — y creo que eso es algo muy hermoso.

---

## Pasos Más Pequeños {#smaller-steps}

Si la transición de la Beacon Chain nos enseñó algo, es que tomar un enfoque medido y pragmático para actualizaciones complejas es una buena práctica. Principalmente porque reducimos los riesgos de que las características apresuradas rompan todo.

> Esto es bastante cierto para cualquier sistema en producción, pero es **especialmente** cierto para las Blockchains, que mantienen tanto valor tangible para los usuarios.
>
> Ya sabes, simplemente no pruebes en producción. Nunca.

Naturalmente, esto se traduce en probar primero cualquier cambio en redes de prueba, apropiadamente llamadas **testnets**. Pero la filosofía misma tiene otra dimensión: los cambios no necesitan ser empujados en una sola actualización, y a veces pueden desagregarse en actualizaciones **más pequeñas**, **incrementales**.

Esta es exactamente la estrategia que Ethereum está tomando con una de las propuestas más ambiciosas en su hoja de ruta.

### Danksharding {#danksharding}

La estrategia de Ethereum para la escalabilidad tiene todo que ver con hacer que los datos estén disponibles de manera más eficiente.

> ¡Nuestro encuentro anterior profundizó completamente en los problemas detrás de esto, así que ve a revisarlo si es necesario!

En su concepción, la red no estaba muy bien preparada para procesar grandes volúmenes de datos. Peor aún, toda la [hoja de ruta centrada en rollups](https://ethereum-magicians.org/t/a-rollup-centric-ethereum-roadmap/4698) requiere que este problema de disponibilidad de datos se resuelva con elegancia. De lo contrario, los costos de la red explotarían.

Entonces, uno de los grandes hitos propuestos para la red fue la adición de blobs. Y la realización completa de esta visión ha sido llamada [Danksharding](https://ethereum.org/roadmap/danksharding/).

> En serio, revisa el artículo anterior si necesitas un repaso.

El problema es que agregar muchos blobs todavía no es exactamente una tarea fácil. Por ejemplo, a medida que se aceptan más blobs en un solo bloque, la sobrecarga de comunicación y validación para los validadores se dispara, lo que puede dañar cosas esenciales como el tiempo de bloque.

Es un asunto delicado. Y además de eso, es una tarea titánica.

¿Cómo abordamos esto entonces? Tomamos el **enfoque medido**.

Así lo hizo la comunidad de Ethereum, ya que dividieron la implementación en varios hitos más pequeños, cada uno construyendo sobre los cimientos establecidos por el anterior.

### El Primer Paso {#the-first-step}

Como probablemente puedas esperar, las cosas comenzaron relativamente pequeñas.

El hito inicial llegó junto con EIP-4844, y fue coloquialmente nombrado [Proto-Danksharding](https://eips.ethereum.org/EIPS/eip-4844). La idea era ya introducir blobs a la red, aunque de una manera controlada, limitada y manejable.

Cada bloque podría incluir un **pequeño número de blobs**, y cada nodo de consenso estaba obligado a descargar y verificar cada blob. En otras palabras, el consenso siguió funcionando normalmente, pero con blobs ahora en la mezcla.

Esto fue intencionalmente conservador. El objetivo no era lograr inmediatamente una escalabilidad masiva, sino más bien:

- Probar la infraestructura para manejar datos de blobs en producción
- Validar los mecanismos del mercado de tarifas para blobs
- Dar tiempo a los rollups para integrar este nuevo tipo de datos
- Identificar cualquier problema imprevisto a una escala manejable

Todo sin poner demasiada tensión en los validadores.

Funcionó maravillosamente. Los costos de transacción para los rollups cayeron por un margen considerable, y toda la red ganó una experiencia operativa muy valiosa con el manejo de blobs.

Y quizás lo más importante, **demostró que el concepto era viable**, preparando el escenario para los próximos hitos.

---

No quiero aburrirte con el resto de la historia. Hay cosas muy interesantes que mencionar, como cómo funciona la reciente actualización de [PeerDAS](https://ethereum.org/roadmap/fusaka/peerdas/) (con los [compromisos KZG](/es/blog/cryptography-101/commitment-schemes-revisited) y todo) y cómo ayuda a mover Ethereum más cerca de Danksharding, o por qué la [Separación Propositor-Constructor](https://ethereum.org/roadmap/pbs/) es fundamental para realizar completamente esta visión de escalabilidad.

Podríamos hablar de esos en artículos futuros. Mi punto aquí es solo este:

::: big-quote
Las actualizaciones más pequeñas y controladas son una buena idea en sistemas de alto tráfico y alto valor
:::

Y de nuevo, esto es bastante cierto para cualquier sistema en producción con estas características.

<figure>
	<img
		src="/images/blockchain-101/evolving-a-blockchain/cheers.webp"
		title="Salud a eso"
	/>
</figure>

---

## Hacia el Futuro {#into-the-future}

Hay un desafío a largo plazo más que vale la pena mencionar antes de cerrar: [las computadoras cuánticas](/es/blog/wtf-is/quantum-computing).

En este momento, Ethereum depende en gran medida de [criptografía de curvas elípticas](/es/reading-lists/elliptic-curves-in-depth). Hasta la fecha, esto ha proporcionado una seguridad sólida, asegurando que la red no pueda ser atacada mediante exploits criptográficos.

Las computadoras cuánticas cambian esto, ya que podrían romper nuestras primitivas criptográficas confiables de larga data. Cosas como el [algoritmo de Shor](https://en.wikipedia.org/wiki/Shor%27s_algorithm) podrían realmente, realmente arruinar las cosas. Y una vez que estas paredes criptográficas caigan, toda la red pronto seguirá.

> Para ser justo y poner las cosas en perspectiva, las Blockchains no son los únicos sistemas afectados por esta amenaza inminente. El "Internet seguro" en sí podría verse comprometido.

Ahora, esto no es una amenaza inmediata. Probablemente todavía estamos a años de distancia de que las computadoras cuánticas rompan firmas a escala. Sin embargo, el mundo no tiene el lujo de esperar hasta el último momento.

Tampoco Ethereum. No están simplemente esperando para apresurarse en el último minuto. Y así, el trabajo ya ha comenzado.

### El Desafío {#the-challenge}

La parte complicada es que la mayoría de los esquemas de firmas post-cuánticas son chicos robustos: firmas **decenas de veces más grandes** en tamaño que las que usamos hoy.

<figure>
	<img
		src="/images/blockchain-101/evolving-a-blockchain/chunky.webp"
        alt="Un chico asiático robusto. Sin ofender, solo una mera descripción."
		title="Sí hermano, soy post-cuántico"
	/>
</figure>

Ya sabemos del [artículo anterior](/es/blog/blockchain-101/handling-data) que cada byte cuenta en las Blockchains. El espacio de bloques es un recurso precioso, y las firmas grandes se lo quitan — así que este es un problema real.

Entonces, de nuevo, ¿cuál es la táctica correcta para abordar este problema? Probablemente lo adivinaste: tranquilo y sereno, tomando el enfoque medido.

El problema con este asunto particular es que las nuevas primitivas criptográficas toman **años de investigación**, la consecuencia de esto es que aún no hay una hoja de ruta clara.

Pero esto está totalmente bien. Lo mejor que podemos hacer es poner el esfuerzo donde importa. Mientras ese sea el caso, el cambio a la criptografía post-cuántica será tan metódico, controlado y pragmático como cualquier otro.

¡Mejor estar preparado!

---

## Resumen {#summary}

La idea de hoy era simple: mostrar que evolucionar estos sistemas de Blockchain no es trivial, y que requiere mucha planificación y previsión.

Blockchain como tecnología todavía es bastante nueva: no tan joven que todo sea un gran avance, y no tan antigua que no haya espacio para mejorar. Como estos sistemas están en constante desarrollo, es crucial entender dónde están fallando, para planificar con cuidado.

Como una pepita final de sabiduría, diré que ningún sistema es perfecto. Siempre debemos reflexionar sobre las compensaciones, ser conscientes de los posibles defectos, y saber bajo qué circunstancias se descompone por completo. Esta es la mentalidad con la que estos sistemas distribuidos gigantes deben ser diseñados. En mi opinión, todo lo demás — todas las diferentes estructuras, mecanismos y decisiones que hemos explorado durante la serie — debe derivar de esta simple consideración.

---

¡Bueno, eso será todo!

Hay varios temas que no he tenido la oportunidad de cubrir en esta serie: blockchains privadas, interoperabilidad entre cadenas, demonios, ¡incluso aplicaciones comunes de Contratos Inteligentes!

> ¡Nunca vería el final de esta serie si quisiera cubrir todo!

Además, para cuando termines de aprender sobre una tecnología, es muy probable que pronto lleguen nuevas actualizaciones, así que necesitas aprender sobre esas, y mientras tanto, otras tecnologías siguen evolucionando también — así que es virtualmente imposible saber todo lo que hay que saber sobre Blockchain. Es solo una realidad con la que tenemos que vivir.

Es por esto que mi objetivo en esta serie era darte una vista panorámica del panorama. Es a través del pensamiento crítico y el conocimiento de patrones importantes y deficiencias comunes que podrás navegar más fácilmente el espacio.

¡Y realmente espero, mientras llegamos al final de la serie, que salgas de este artículo con una buena cantidad de herramientas para continuar descubriendo este mundo increíble!

¡Gracias por leer, y nos vemos en mi próximo proyecto!
