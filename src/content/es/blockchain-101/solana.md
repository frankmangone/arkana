---
title: 'Blockchain 101: Solana'
date: '2025-05-13'
author: frank-mangone
thumbnail: /images/blockchain-101/solana/solana.webp
tags:
  - solana
  - blockchain
  - proofOfHistory
  - consensus
description: >-
  Nuestro viaje ahora nos lleva a otro gran jugador en el espacio Blockchain:
  Solana
readingTime: 10 min
mediumUrl: 'https://medium.com/@francomangone18/blockchain-101-solana-177128bf1501'
contentHash: a0d8886001e45fcfa71fa2bd914a207b9432a019b75639f4091647a02dac9a50
supabaseId: b3cb9a00-a261-4d8b-a08d-a127f6694592
---

> Este artículo es parte de una serie más larga sobre Blockchain. Si este es el primer artículo que encuentras, te recomiendo comenzar desde el [inicio de la serie](/es/blog/blockchain-101/how-it-all-began).

Blockchain sigue siendo una tecnología muy de nicho. Especialmente con lo grande que es la IA hoy en día, y dado que la mayoría de los desarrolladores se inclinan hacia sistemas más tradicionales.

Incluso entre los desarrolladores de Blockchain, es común ver que se enfocan en perfeccionar sus habilidades en una tecnología particular — y normalmente, la elección suele ser [Ethereum](/es/blog/blockchain-101/wrapping-up-ethereum) (o sistemas compatibles con EVM).

Sin embargo, como hemos insinuado a lo largo de la serie, hay mucho más en Blockchain que solo Ethereum — otros jugadores han asumido el desafío de crear estos registros distribuidos, programables e inmutables. Y un ejemplo de ello es **Solana**.

Lo interesante de Solana es que adopta un enfoque completamente diferente para resolver algunos de los problemas característicos que hemos discutido antes — como el [consenso](/es/blog/blockchain-101/consensus-revisited). Al hacerlo, algunas cosas se ganan y otras se pierden — algo que deberíamos esperar ahora que conocemos el [trilema](/es/blog/blockchain-101/rollups/#the-blockchain-trilemma).

Pero quizás más importante, esta es otra maravillosa pieza de ingeniería por derecho propio, y como tal, vale mucho la pena explorarla.

¡Suficiente de introducciones! ¡Veamos cómo esta Blockchain hace las cosas!

<figure>
  <img
    src="/images/blockchain-101/solana/solana.webp" 
    alt="Una representación de un token SOL"
    title="¡Aquí vamos!"
    width="600"
  />
</figure>

---

## Marcas de Tiempo {#timestamping}

Comenzaremos nuestra discusión mirando directamente al corazón del sistema: su **mecanismo de consenso**. Supongo que no hay necesidad de que diga esto a estas alturas, pero sin consenso, no puede haber Blockchain — después de todo, es la capacidad de los nodos para conectarse y acordar una secuencia de eventos lo que justifica la existencia de estas tecnologías.

> La gente de Solana tiene [algunos recursos excelentes](https://solana.com/news/proof-of-history) que puedes consultar para más referencias — ¡yo solo intentaré explicarlo de la manera que lo entiendo, como siempre!

Cuando comenzamos a hablar de Bitcoin, mencionamos cómo uno de nuestros principales objetivos era [ordenar transacciones](/es/blog/blockchain-101/how-it-all-began/#transaction-ordering). El orden está determinado por los bloques — una transacción en el bloque $1$ debe haber ocurrido antes que una transacción en el bloque $2$. Pero también, al momento de crear un bloque, se le asigna una **marca de tiempo** — determinando cuándo se minó el bloque, y cuándo "ocurrió" un bloque en el tiempo.

Estoy dispuesto a apostar que después de pasar por los artículos anteriores, ahora estás pensando "**ok, pero ¿quién determina esa marca de tiempo?**"

<figure>
  <img
    src="/images/blockchain-101/solana/sherlock.webp" 
    alt="Sherlock Holmes pensando"
    title="Elemental, mi querido Watson"
    width="450"
  />
</figure>

En Bitcoin, por ejemplo, los mineros mismos asignan una marca de tiempo a los bloques cuando son producidos. Los mineros no pueden colocar cualquier marca de tiempo que quieran en un bloque — hay algunas **reglas** para tratar de mantener estos valores honestos. Pero las reglas son [bastante laxas](https://learnmeabitcoin.com/technical/block/time/), e incluso hay casos donde un bloque tiene una marca de tiempo más antigua que algún bloque que aparece antes en la cadena.

> Lo que significa que como sistema de marcas de tiempo, Bitcoin no es tan confiable.

Ethereum adopta un enfoque similar pero ligeramente más restrictivo. Cada marca de tiempo debe ser mayor que la del bloque padre, y no debe estar demasiado lejos en el futuro. Los validadores verifican estas restricciones y rechazan cualquier bloque que viole estas reglas.

Aunque suena genial, esta solución tiene algunos problemas. Aparte de la posibilidad de que los relojes locales de los nodos se desvíen, también está el hecho de que los validadores necesitan comunicarse entre sí para acordar estas marcas de tiempo — lo que **toma tiempo**, e impacta directamente en la **escalabilidad** y el **tiempo de producción de bloques**.

¡Bien! Este es un nuevo problema con el que estamos lidiando. La pregunta es:

::: big-quote
¿Cómo podemos acordar precisamente las marcas de tiempo de manera distribuida, sin comprometer la escalabilidad?
:::

Y aquí es donde Solana entra con una solución inteligente.

### Retraso Verificable {#verifiable-delay}

¿Qué pasaría si te dijera que el **paso del tiempo en sí mismo** puede ser verificado matemáticamente, e incorporado en la propia estructura de la Blockchain?

<figure>
  <img
    src="/images/blockchain-101/solana/morpheus.webp" 
    alt="Morfeo de Matrix"
    title="¿Qué pasaría si te dijera que dejes un like y te suscribas..."
    width="500"
  />
</figure>

¿Qué? ¿Cómo?

Para lograr esto, primero debemos encontrar alguna construcción que se comporte como un **reloj**.

Solana utiliza una [función de hash](/es/blog/cryptography-101/hashing) para este propósito: [SHA-256](https://en.wikipedia.org/wiki/SHA-2).

> ¡Es en realidad la misma utilizada para el [minado de Bitcoin](https://en.bitcoin.it/wiki/Block_hashing_algorithm)!

Pero espera... ¿Qué? Las funciones de hash fueron diseñadas para ser una especie de licuadoras criptográficas — ¿qué tienen que ver con el **tiempo**?

La idea clave aquí es que ejecutar esta función de hash toma una **cantidad de tiempo predecible**. Aunque, por "predecible", no quiero decir que sepamos exactamente cuánto tiempo tomará (en milisegundos) calcular un hash — esto por supuesto depende del hardware. La predictibilidad aquí debe significar entonces **algo diferente**.

Para ayudarnos a entender, hagamos un pequeño ejercicio mental.

> Toma algunos datos de entrada y ejecútalos a través de la función de hash SHA256.
>
> Ahora toma la salida y ejecútala a través de la función SHA256 **nuevamente** — obtendrás una nueva salida. Y luego, repite esto **millones de veces**.
>
> Cada ejecución de SHA256 toma un tiempo algo predecible — probablemente podrías compararlo, y obtendrías algún tiempo promedio. En ese sentido, cada ejecución de la función es como un **tic en un reloj** — cada tic tomando ese tiempo promedio que mencionamos antes.

<figure>
  <img
    src="/images/blockchain-101/solana/hash-chain.webp" 
    alt="Una cadena de hashes"
    title="[zoom]"
  />
</figure>

Para llegar a ese último hash, **debes** pasar por los pasos $N$ para llegar al hash final — saltarse simplemente no es posible. Lo que significa que si eres capaz de obtener una **salida** válida $N$, ¡eso es prueba de que has pasado el tiempo de ejecutar la función de hash $N$ veces!

Esta es la base de lo que se conoce como **Función de Retraso Verificable**, o **VDF** para abreviar. Y es exactamente con este mecanismo que Solana marca el tiempo de las cosas.

> Bueno, estrictamente hablando, esto **se comporta** como una Función de Retraso Verificable, pero técnicamente no lo es. Realmente es solo una cadena de hash secuencial. Si estás interesado, aquí hay [un paper](https://eprint.iacr.org/2018/601.pdf) que define los VDFs en su forma verdadera.

<figure>
  <img
    src="/images/blockchain-101/solana/fried-brain-patrick.webp" 
    alt="Patricio Estrella con el cerebro frito"
    width="500"
  />
</figure>

---

## Marcas de Tiempo en Acción {#timestamping-in-action}

Ok, genial. Ahora tenemos este tipo de reloj criptográfico que hace literalmente tictac a nuestra disposición. ¿Cómo lo usamos en una Blockchain?

Aquí, necesitamos hacer un par de observaciones:

- Bueno, en primer lugar, nuestra cadena de hashes funciona como una **línea de tiempo** — y la usaremos en lugar del "tiempo estándar". No marcaremos las cosas con el tiempo del mundo real, sino con algún punto en este reloj criptográfico.
- En segundo lugar, necesitamos al menos a **alguien** calculando nuevos hashes todo el tiempo, para que el reloj avance.
- Y por último, ¡necesitamos **algo** para marcar con tiempo! ¿Son transacciones? ¿Son bloques?

Bien, digamos que quieres enviar una transacción en Solana. La envías a través de RPC como de costumbre, viaja a través de la red de nodos, hasta que llega a lo que se llama un **validador líder**. Este validador hace algo bastante interesante: **incrusta** la transacción recibida en la cadena de hash. Algo como esto:

<figure>
  <img
    src="/images/blockchain-101/solana/transaction-embedding.webp" 
    alt="Incrustación de transacciones en la cadena de hashes"
    title="[zoom] Construcción de la Función de Retraso Verificable"
  />
</figure>

Al hacer esto, las transacciones mismas están entrelazadas con el reloj de Solana — y esto es lo que constituye la llamada **Prueba de Historia**. ¡Cada transacción tiene una marca de tiempo precisa correspondiente a su hash en la secuencia!

Prestando más atención, podríamos notar que esto no es realmente un **mecanismo de consenso** — es solo un mecanismo para construir una secuencia ordenada de transacciones.

> Y también tenemos un validador líder, lo que suena un poco... ¿Centralizado?

Entonces, ¿dónde vive realmente el consenso en todo esto?

---

## Consenso {#consensus}

El mecanismo de "consenso real" en Solana es el sistema de **Prueba de Participación** (PoS), que se enlaza con la secuencia de Prueba de Historia (PoH).

<figure>
  <img
    src="/images/blockchain-101/solana/busted.webp" 
    alt="Un gato contra una pared"
    title="Atrapado"
    width="500"
  />
</figure>

Solana utiliza lo que llaman **Tower BFT** (Tolerancia a Fallos Bizantinos), que combina PoS y PoH para crear un mecanismo de consenso completo.

La selección de validadores funciona de manera muy similar a otros sistemas PoS — los validadores depositan la moneda nativa (SOL) como garantía. Cuantos más tokens depositen, mayor será la probabilidad de ser seleccionados como **líder**.

> No es un proceso completamente aleatorio como en Ethereum. Puedes leer más sobre eso [aquí](https://docs.anza.xyz/consensus/leader-rotation#leader-schedule-generation-algorithm).

El tiempo se divide en [slots](/es/blog/blockchain-101/consensus-revisited/#finality-in-ethereum), y cada slot tiene un líder. Pero a diferencia de Ethereum, los slots están determinados por la secuencia PoH.

Durante sus slots asignados, que abarcan [400 milisegundos](https://www.helius.dev/blog/solana-slots-blocks-and-epochs#defining-slots-in-solana), el líder debe mantener la secuencia PoH (es decir, debe marcar el tiempo de las transacciones), y también tiene la capacidad de proponer un **bloque**, que se transmite a la red para su validación.

Luego, a la moda clásica de PoS, otros nodos validan el bloque (básicamente, que el líder siguió las reglas), y votan para confirmarlo — con votos ponderados por la participación. Una vez que se logra una mayoría absoluta de votos, entonces el bloque se **finaliza**.

### ¿Por Qué Prueba de Historia? {#why-proof-of-history}

Supongo que te estás preguntando qué valor aporta realmente la Prueba de Historia a la mezcla, si el mecanismo de consenso es Prueba de Participación. ¿Tengo razón?

<figure>
  <img
    src="/images/blockchain-101/solana/pooh.webp" 
    alt="Winnie the Pooh mirando seriamente un papel"
    width="500"
  />
</figure>

Básicamente, lo que dijimos antes: las marcas de tiempo de las transacciones ya no son algo que los validadores necesiten perder tiempo verificando. Debido a que las transacciones mismas están vinculadas al reloj VDF, tienen una marca de tiempo única y determinista.

Y en palabras de [Anatoly Yakovenko](https://solana.com/news/proof-of-history#:~:text=Every%20block%20producer%20has%20to%20crank%20through%20the%20VDF%2C%20this%20proof%20of%20history%2C%20to%20get%20to%20their%20assigned%20slot%20and%20produce%20a%20block), la [mente maestra detrás de PoH](https://solana.com/solana-whitepaper.pdf), y cofundador de Solana:

::: big-quote
Cada productor de bloques tiene que pasar por el VDF, esta prueba de historia, para llegar a su slot asignado y producir un bloque
:::

Lo que significa que cada validador solo necesita **observar** la Función de Retraso Verificable — la cadena de hashes — para seguir el reloj de la red, y estar sincronizado cuando sea su momento de ser el líder.

<figure>
  <img
    src="/images/blockchain-101/solana/validators-watching.webp" 
    alt="Validadores observando la cadena ordenada de transacciones y hashes"
    title="[zoom]"
  />
</figure>

---

## Consecuencias {#consequences}

Todo está genial con este reloj criptográfico y todo, pero ¿cuál es el impacto real de hacer las cosas de esta manera?

Hablemos primero de los **beneficios**. El principal beneficio es una **velocidad de procesamiento de transacciones muy alta**. Al eliminar la sobrecarga de la validación de marcas de tiempo, Solana puede lograr [valores de transacciones por segundo (TPS) muy buenos](https://explorer.solana.com/). En teoría, podría alcanzar hasta [65,000 TPS](https://www.gemini.com/cryptopedia/solana-blockchain#:~:text=for%20blockchain%20projects.-,What%20Are%20Solana%E2%80%99s%20Key%20Features%3F,-What%20if%20there) — un número muy bueno, considerando que una red bien establecida como Visa procesa [aproximadamente el mismo número de transacciones por segundo](https://www.visa.co.uk/dam/VCOM/download/corporate/media/visanet-technology/aboutvisafactsheet.pdf).

> Por supuesto, los límites teóricos son geniales, ¡pero típicamente no son una buena representación de la capacidad real de la red operativa!
>
> Ah, y por cierto, [las tarifas de red](https://solana.com/docs/core/fees) también son bastante bajas!

Sin embargo, no todo son ventajas. Siempre hay un lado negativo. ¿Cuál podría ser el compromiso aquí?

Como ya hemos insinuado al comienzo del artículo, no podemos escapar del [trilema de la Blockchain](/es/blog/blockchain-101/rollups/#the-blockchain-trilemma). Bajo esta lente, examinemos dónde ha hecho Solana sus compromisos.

- Para mantener la secuencia PoH y procesar miles de transacciones por segundo, los validadores de Solana necesitan **hardware de gama alta** con CPUs potentes, grandes cantidades de RAM y SSDs muy rápidos. Estos requisitos son considerablemente más altos que los de otras Blockchains, creando una barrera de entrada más alta para los validadores.
- Además, la arquitectura de Solana es bastante compleja. Si bien esto se puede decir de otras Blockchains también, también es cierto que Solana ha tenido interrupciones ocasionales durante períodos de carga extrema. La estabilidad ha mejorado con el tiempo, pero la arquitectura compleja sigue siendo una fuente potencial de vulnerabilidades o comportamientos inesperados.

¿Dónde colocamos a Solana en el triángulo del trilema entonces?

Claramente, esta red ha sido optimizada en gran medida para la **escalabilidad**, pero haciendo compromisos principalmente en la **descentralización** (debido a los requisitos de hardware), y en cierta medida menor en la **seguridad** (a través de la complejidad arquitectónica).

Las decisiones de diseño colocan a esta red en un lugar diferente al de Bitcoin o Ethereum. Aquí, debo ser muy claro: esto no significa que Solana sea ni mejor ni peor que esas redes — es simplemente **diferente**.

Para casos de uso donde el alto rendimiento y las bajas tarifas son de suma importancia, estos compromisos pueden no solo ser aceptables, sino **deseables**. Pero si la descentralización es la prioridad, entonces otras blockchains podrían ser más adecuadas.

¡Es tu elección como desarrollador — y esa es parte de la belleza!

<figure>
  <img
    src="/images/blockchain-101/solana/excited.webp" 
    alt="El legendario desarrollador feliz"
    title="Bueno, tal vez no estés TAN emocionado."
    width="450"
  />
</figure>

---

## Resumen {#summary}

En resumen, Solana trae una idea muy innovadora a la mesa, con su reloj criptográfico (la **Prueba de Historia** — una **Función de Retraso Verificable**), y cómo se integra en su mecanismo de **Prueba de Participación**.

Creo que aprender sobre las ideas detrás de estos sistemas es muy enriquecedor, y en última instancia nos da más herramientas como ingenieros y desarrolladores para dar forma al futuro de la industria Blockchain.

El enfoque para hoy fueron las innovaciones en el consenso lideradas por Solana — ¡y realmente espero haber podido explicarlas de una manera comprensible!

> Pero si quieres otra perspectiva sobre el tema, consulta [este artículo](https://www.helius.dev/blog/solana-slots-blocks-and-epochs#defining-slots-in-solana).

Aunque hemos cubierto bastante hoy, esto está lejos de ser el final de nuestro viaje a través de Solana. Porque esta red también es **programable**, al igual que Ethereum — ¡pero no es **compatible con EVM**!

Esto significa que Solana tiene su propia forma de definir programas ejecutables, diferente de lo que hemos visto hasta ahora. ¡Y cubriremos cómo funcionan estos programas en el [próximo artículo](/es/blog/blockchain-101/solana-programs)!
