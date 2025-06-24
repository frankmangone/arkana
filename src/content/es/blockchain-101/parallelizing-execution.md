---
title: 'Blockchain 101: Paralelizando la Ejecución'
author: frank-mangone
date: '2025-06-24'
thumbnail: /images/blockchain-101/parallelizing-execution/leap-of-faith.jpg
tags:
  - blockchain
  - aptos
  - sui
  - parallelization
description: >-
  Continuando, exploramos dos Blockchains modernos enfocados en la ejecución
  paralela: Aptos y Sui
readingTime: 10 min
contentHash: 2bc78b592a218c1690800062f0de0c4dcb6a23276ef2619171ac604219c21e16
supabaseId: null
---

> Este artículo es parte de una serie más larga sobre Blockchain. Si este es el primer artículo que encuentras, te recomiendo comenzar por el [inicio de la serie](/es/blog/blockchain-101/how-it-all-began).

Gracias al [capítulo anterior](/es/blog/blockchain-101/blockchain-safari), hemos **duplicado** nuestro conocimiento de los paradigmas existentes en el diseño de sistemas Blockchain. Lenta pero seguramente, nuestro arsenal de ideas y conceptos está creciendo — y con él, nuestra capacidad para evaluar los pros y contras de cada arquitectura.

Al elegir una Blockchain para usar de esta amplia gama de posibilidades, uno de los elementos más importantes a considerar es la **velocidad**. Queremos que nuestras transacciones se procesen **rápidamente** — y a veces, estamos dispuestos a sacrificar otros aspectos como la descentralización a favor de mejores tiempos de procesamiento.

Pero idealmente, querríamos sacrificar **lo menos posible**. Así que hoy, hablaremos sobre algunos enfoques modernos que presentan alternativas nuevas y frescas a este viejo problema.

¡Abróchate el cinturón y vamos directo al grano!

---

## Paralelización {#parallelization}

Antes de profundizar más, creo que vale la pena entender el concepto de **paralelización**. Lo hemos mencionado un par de veces, pero no hemos sido muy precisos al respecto. Creo que ahora es un buen momento.

Cada Blockchain pasa por múltiples fases para avanzar el **estado global**: validación de transacciones, consenso, ejecución, y también posiblemente finalidad.

Hoy, hablaremos sobre paralelización en el contexto de la **fase de ejecución**: el cálculo real de lo que sucede cuando las transacciones se ejecutan.

> Es importante notar que otros procesos en el sistema también podrían ser paralelizados, pero dejaremos esa discusión para un artículo posterior.

<figure>
	<img
		src="/images/blockchain-101/parallelizing-execution/state-transition.png"
		alt="Esquemas de transición de estado"
		title="[zoom] Transacciones modificando el estado a través de una Función de Transición de Estado (STF)."
	/>
</figure>

Hay esencialmente **dos formas** de abordar la ejecución: podemos procesar las transacciones **una por una**, o intentar ejecutar múltiples de ellas **al mismo tiempo**.

El procesamiento secuencial (uno por uno) tiene un beneficio claro: aseguramos que **no existan conflictos**. Y esto es genial, porque no terminaremos con un desastre de un estado inconsistente.

> Así que por ejemplo, no puedo transferir un NFT a la cuenta $A$, y luego transferir el mismo NFT a la cuenta $B$. ¡No tendría sentido, porque después de la primera transacción, ya no soy dueño del activo! Este es el viejo doble gasto, y necesitamos evitarlo a toda costa — pero pueden existir otras situaciones similares.

A veces, sin embargo, dos o más transacciones pueden ser **completamente independientes**, en el sentido de que no entrarían en conflicto entre sí, incluso si se ejecutaran al mismo tiempo. Esa es la idea de la **paralelización**: calcular este nuevo estado de la Blockchain ejecutando múltiples transacciones a la vez.

<figure>
	<img
		src="/images/blockchain-101/parallelizing-execution/parallel-execution.png"
		alt="Esquemas de ejecución paralela"
		title="[zoom] Algo como esto"
	/>
</figure>

En este punto, supongo que es importante preguntarnos: ¿qué tan importante es la paralelización de todos modos? ¿Deberíamos preocuparnos por ella?

### Cuellos de Botella {#performance-bottlenecks}

Bueno, como mencioné brevemente en la introducción, la **alta velocidad de procesamiento** es muy importante para que las Blockchains logren.

Qué tan rápido podemos ejecutar transacciones impacta directamente la velocidad de la red. Por supuesto, esto es solo uno de los componentes que comprenden la "velocidad" general de la red (ya que el consenso y la validación siguen siendo necesarios), pero es uno importante, ya que cada nodo necesita ejecutar transacciones para determinar si son una transición de estado válida o no.

> Aún así, porque el consenso general tiene varios pasos, idealmente querríamos identificar dónde está el cuello de botella, y tratar de enfocar nuestros esfuerzos en optimizar dicho paso. Por ejemplo, en Ethereum, la parte más crítica del consenso es la [agregación de atestaciones](https://www.paradigm.xyz/2023/04/mev-boost-ethereum-consensus#slots-sub-slot-periods:~:text=The%20most%20critical,t%3D). ¡Es importante siempre mirar el panorama completo!

Lograr altas velocidades de procesamiento es desafiante si solo se nos permite ejecutar transacciones **secuencialmente** — ¿así que por qué no simplemente ejecutar todo en paralelo?

La cosa es que no siempre es fácil determinar si múltiples transacciones son verdaderamente independientes entre sí.

Si miramos los paradigmas que ya hemos explorado, las Blockchains basadas en cuentas como la mayoría de las basadas en EVM tienen más dificultades para determinar esta independencia, así que eligen no ejecutar transacciones en paralelo, y van por el enfoque secuencial. Incluso [Solana](/es/blog/blockchain-101/solana), que tiene cierto grado de paralelización gracias a la separación de lógica y estado, tiene sus limitaciones.

En el otro extremo del espectro, tenemos los UTXOs, que están mucho mejor adaptados para la paralelización. Cada UTXO es una pieza de estado **completamente independiente** e **inmutable**, que solo está destinada a ser consumida. Esto es genial, pero hace que agregar lógica a la mezcla sea complejo — y aunque algunas soluciones como Cardano han propuesto mejoras, aún tienen otras limitaciones propias.

Por lo tanto, la pregunta para hoy es: **¿qué más se puede hacer al respecto**? Y aquí es donde algunos ex-ingenieros de Meta entran en nuestra historia.

---

## El Proyecto Diem {#the-diem-project}

En 2019, [Meta](https://www.meta.com/about/?utm_source=about.meta.com&utm_medium=redirect) (entonces Facebook) anunció un proyecto ambicioso: una moneda digital global llamada [Diem](https://www.diem.com/en-us/) (originalmente Libra).

> ¡No la misma Libra del [escándalo de Twitter](https://en.wikipedia.org/wiki/$Libra_cryptocurrency_scandal) de hace unos meses!

Se propusieron crear una Blockchain que pudiera manejar miles de millones de usuarios con la velocidad y confiabilidad de los sistemas de pago tradicionales.

En ese momento, esto era verdaderamente desafiante: las arquitecturas Blockchain existentes simplemente no podían manejar tal escala. Incluso las Blockchains más rápidas en ese momento (probablemente [EOS](https://eosnetwork.com/) y Ripple, manejando unos pocos miles de transacciones por segundo) se derrumbarían bajo la carga que estos ingenieros de Meta estaban tratando de atender — la carga de la base de usuarios de Facebook.

Así que decidieron **empezar desde cero**. Al hacer esto, no solo construyeron una nueva Blockchain — construyeron un nuevo lenguaje de programación, específicamente diseñado para activos digitales y ejecución paralela. Este lenguaje se llamaba [Move](https://sui.io/move).

> Puedes aprender Move con el muy detallado [Move Book](https://move-book.com/).

Más que el lenguaje en sí, lo que necesitamos enfocar es cómo propone una nueva forma de pensar sobre el **estado de la Blockchain**: los activos digitales son tratados como **recursos** en lugar de datos en cuentas. Literalmente, posees **objetos digitales** distintos que pueden moverse y modificarse.

¿Por qué es esto importante, preguntas? Bueno, si cada activo es un **objeto distinto** con **propiedad clara**, ¡entonces las transacciones que involucran diferentes objetos pueden procesarse en paralelo sin conflictos!

<figure>
	<img
		src="/images/blockchain-101/parallelizing-execution/giga-brain.png"
		alt="Meme de cerebro gigante"
		width="600"
	/>
</figure>

Era una perspectiva realmente prometedora... Hasta que, en un desafortunado giro de eventos, el proyecto Diem [se derrumbó bajo presión regulatoria en 2022](https://www.bbc.com/news/technology-60156682), y fue cerrado.

### De las Cenizas {#from-the-ashes}

Podría haber terminado ahí, y probablemente no estaría escribiendo sobre esto hoy.

Afortunadamente, los ingenieros detrás de estas ideas estaban convencidos de que estaban en algo, y decidieron perseverar a través de las dificultades. En lugar de desaparecer silenciosamente en la noche, se dispersaron y formaron nuevos proyectos, llevándose sus aprendizajes con ellos.

Estos proyectos ahora se llaman **Aptos** y **Sui**, y serán nuestros protagonistas hoy.

---

## Aptos {#aptos}

Empecemos con el primero en lanzarse: [Aptos](https://aptosfoundation.org/).

<figure>
	<img
		src="/images/blockchain-101/parallelizing-execution/aptos.png"
		alt="Logo de Aptos"
		width="500"
	/>
</figure>

Este primer equipo no se alejó demasiado de las ideas que hemos explorado hasta ahora: Aptos es una Blockchain construida con el familiar modelo basado en cuentas en mente.

> ¡Sí, nuestro viejo amigo confiable!

Pero espera... ¿No dijimos como hace 2 minutos que el modelo de cuentas **no era bueno** para la paralelización? ¿Y no era Move todo sobre reemplazar cuentas con recursos? ¿Cuál es la trampa?

<figure>
	<img
		src="/images/blockchain-101/parallelizing-execution/suspicious-lizard.png"
		alt="Una lagartija con mirada sospechosa"
		width="500"
	/>
</figure>

Bueno... Aptos usa cuentas, eso es un hecho. Aprovecha el sistema de tipos de Move para un mejor manejo del estado, pero eso es más un detalle de experiencia del desarrollador.

Dicho esto, sabemos de hecho que un sistema basado en cuentas tendrá problemas con la paralelización. Los conflictos **ocurrirán**, y un sistema de tipos rico hará poco para mitigar esto.

> Piensa en ello: si tanto Alice como Bob intentan enviar dinero a la cuenta de Charlie al mismo tiempo, va a haber un conflicto. No importa si llamamos al balance de Charlie un "recurso" o simplemente "datos" — dos transacciones siguen tratando de modificar la misma cosa simultáneamente.

Entonces, ¿cómo logra Aptos la ejecución paralela?

### Paralelismo Optimista {#paralelismo-optimista}

La solución de Aptos es simple en concepto: en lugar de tratar de prevenir conflictos, los **abraza**.

Cuando llega un conjunto de nuevas transacciones, Aptos no analiza cuidadosamente qué transacciones podrían entrar en conflicto y las procesa secuencialmente. En su lugar, toma un **enfoque optimista**: simplemente ejecuta todas las transacciones al mismo tiempo, asumiendo que **la mayoría** no se pisarán entre sí. Un pequeño salto de fe.

<figure>
	<img
		src="/images/blockchain-101/parallelizing-execution/leap-of-faith.jpg"
		alt="Leap of Faith de Assassin's Creed"
		title="¡Weee~"
		width="500"
	/>
</figure>

Ahora, apuesto a que tus sentidos arácnidos están hormigueando: ¿qué pasa cuando los conflictos **sí ocurren**?

Aptos usa un motor de ejecución que llaman [Block-STM](https://aptos.dev/en/network/blockchain/execution) (Software Transactional Memory). Este sistema está constantemente **monitoreando** estas situaciones conflictivas. Cuando detecta que dos transacciones han intentado modificar la misma cuenta, todo lo que hace es **revertirlas**, y **re-ejecutarlas** en el orden correcto.

> ¡Como tener una funcionalidad inteligente de deshacer. ¡Tan simple como eso!

Cuando la mayoría de las transacciones en un bloque son verdaderamente independientes (el mejor escenario para esta estrategia de ejecución), Aptos puede lograr mejoras asombrosas en la velocidad de procesamiento, porque la ejecución es verdaderamente paralela. Sin embargo, también habrá escenarios del peor caso donde muchas transacciones entren en conflicto. En esa situación, el sistema opera más cerca del procesamiento secuencial debido a todas las reversiones y re-ejecuciones.

La consecuencia interesante es que este enfoque es **adaptativo**. Y bajo las circunstancias correctas, la red será **velocísima**.

¡Me parece maravilloso cómo tal propiedad emerge de la simple elección de ejecutar transacciones de manera optimista!

---

## Sui {#sui}

Ahora cambiemos de marcha, y hablemos de [Sui](https://sui.io/), el otro proyecto nacido de las cenizas de Diem.

<figure>
	<img
		src="/images/blockchain-101/parallelizing-execution/sui.png"
		alt="Logo de Sui"
		width="500"
	/>
</figure>

Mientras que Aptos decidió mantener el familiar modelo de cuentas y hacerlo funcionar con paralelización, el equipo de Sui tomó un **enfoque completamente diferente**. Decidieron **rediseñar todo** desde cero para **máxima paralelización**.

Y su diseño fue bastante radical: Sui **no usa cuentas en absoluto**.

### Objetos al Rescate {#objetos-al-rescate}

En Sui, todo es un [Objeto](https://docs.sui.io/concepts/object-model). ¿Tus tokens? Objetos. ¿Tus NFTs? Objetos. ¿Estado de contratos inteligentes? Sí, Objetos.

> ¡Los objetos de Sui son esencialmente el modelo de recursos completamente realizado originalmente visionado por Move!

Usar objetos tiene beneficios geniales para la paralelización — pero primero, necesitamos una idea aproximada de qué son. Y para esto, comparémoslos con los modelos que ya conocemos: **basado en cuentas**, y **UTXO**.

- Una cuenta puede ser la propietaria de múltiples Objetos, que en conjunto representan su **estado general**. Por lo tanto, este es un tipo de representación **más fina** o **más granular** que el modelo de cuentas, y es más fácil determinar cuándo dos objetos son **independientes** entre sí.
- Cuando se compara con UTXOs, la diferencia reside principalmente en la **mutabilidad**. Los UTXOs pueden pensarse como un tipo de **objeto inmutable** (que solo puede ser creado o destruido), mientras que los Objetos de Sui son generalmente **mutables** (con la excepción de los [objetos inmutables](https://docs.sui.io/concepts/object-ownership/immutable) nativos).

¡Así que de alguna manera, los Objetos representan un **punto dulce** entre estos otros dos modelos!

Los UTXOs ofrecen paralelización casi perfecta (en términos de ejecución) pero son demasiado rígidos — solo puedes consumirlos, nunca **modificarlos**. Las cuentas son flexibles, pero crean **cuellos de botella** ya que múltiples tipos de activos comparten el mismo espacio de cuenta. Los **Objetos** te dan lo mejor de ambos: son **flexibles** como las cuentas, pero **independientes** como los UTXOs.

Y la cereza del pastel: [las transacciones en Sui](https://docs.sui.io/concepts/transactions) declaran exactamente qué Objetos necesitan desde el principio — ¡y gracias a su granularidad, el sistema inmediatamente sabe si estas transacciones pueden ejecutarse en paralelo!

> ¡Si la transacción de Alice usa el Objeto A y la transacción de Bob usa el Objeto B, entonces pueden ejecutarse simultáneamente sin ningún conflicto!

<figure>
	<img
		src="/images/blockchain-101/parallelizing-execution/clapping.jpg"
		alt="Leonardo Di Caprio aplaudiendo en una escena de El Lobo de Wall Street" 
		title="Impresionante"
		width="500"
	/>
</figure>

En términos de propiedad, los Objetos pueden ser:

- [Objetos propios](https://docs.sui.io/concepts/object-ownership/address-owned), propiedad de una sola cuenta
- [Objetos compartidos](https://docs.sui.io/concepts/object-ownership/shared), y accesibles por todos
- [Inmutables](https://docs.sui.io/concepts/object-ownership/immutable), y no pueden ser modificados por nadie
- [Propiedad de otros Objetos](https://docs.sui.io/concepts/object-ownership/wrapped), permitiendo composabilidad

> Más sobre esto en la [documentación oficial de Sui](https://docs.sui.io/guides/developer/sui-101/shared-owned).

La mayoría de los Objetos en Sui son **Objetos propios**. Y si todo lo que hemos dicho no fuera lo suficientemente genial, esto tiene otra consecuencia poderosa: ¡las transacciones que involucran solo Objetos propios pueden **ejecutarse más rápido** que las que involucran Objetos compartidos!

Sui en realidad usa **dos tipos diferentes de consenso** dependiendo de qué toque tu transacción. Para Objetos propios, Sui solo necesita verificar que tu transacción sea válida — esto es, que eres dueño de los Objetos, y que no estás haciendo doble gasto. Una vez que suficientes validadores están de acuerdo en que tu transacción es válida, entonces ¡boom — ejecución inmediata! No hay necesidad de esperar y ver en qué orden debería ir en relación con otras transacciones.

Los Objetos compartidos requieren un tratamiento más cuidadoso, porque múltiples personas podrían intentar modificar el mismo Objeto a la vez. Sui primero necesita decidir el orden de las transacciones a través de su mecanismo de consenso [Mysticeti](https://docs.sui.io/concepts/sui-architecture/consensus).

Como resultado, las transferencias simples y pagos suceden en [menos de medio segundo](https://blog.sui.io/sui-performance-update/), mientras que operaciones más complejas de estado compartido pueden tomar un poco más de tiempo, pero aún funcionan eficientemente. La mayoría de las operaciones simples de Blockchain (como enviar tokens) se sentirán **casi instantáneas** en Sui.

Concedido — necesitarás pensar ligeramente diferente al diseñar aplicaciones en Sui, pero si estás dispuesto a poner el tiempo y esfuerzo, ¡es una Blockchain rápida de verdad!

---

Ambos enfoques representan diferentes filosofías. **Aptos** propone hacer el modelo familiar más rápido, mientras que **Sui** repiensa el modelo completamente. Ninguno es universalmente mejor — depende del caso de uso específico.

Para transferencias simples y pagos, ambos sobresalen. Pero para protocolos más complejos y definiciones de lógica, donde se usan muchos estados compartidos, entonces las cosas pueden complicarse. En Aptos, el rendimiento puede tomar un golpe fuerte. En Sui, diseñar estas aplicaciones puede volverse excesivamente complejo, y más propenso a errores.

¡Y de nuevo, no hay **soluciones perfectas**!

---

## Resumen {#resumen}

Los restos del proyecto Diem ciertamente dejaron algo interesante para el ecosistema Blockchain: dos enfoques muy diferentes y ricos para la ejecución paralela.

En particular, esta arquitectura orientada a objetos es una adición valiosa a nuestro conjunto de patrones de diseño, ya que resulta ser un excelente punto medio entre los paradigmas existentes (UTXO y basado en cuentas).

Tanto Aptos como Sui representan un avance significativo en mejorar la velocidad de ejecución, pero no son los únicos nuevos en la ciudad. El espacio Blockchain está lleno de enfoques innovadores, cada uno tomando diferentes caminos filosóficos y técnicos.

Algunos proyectos se enfocan en la paralelización dentro de una sola cadena, como hemos visto hoy. Otros hacen **preguntas completamente diferentes**.

Así, en nuestro próximo encuentro, planteando estas preguntas picantes, que llevarán a algunas soluciones muy exóticas.

¡Salud!
