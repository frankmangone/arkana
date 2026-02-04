---
title: 'Blockchain 101: Rollups'
date: '2025-04-28'
author: frank-mangone
thumbnail: /images/blockchain-101/rollups/sonic.webp
tags:
  - ethereum
  - blockchain
  - rollup
  - dataAvailability
description: >-
  Antes de pasar a otras soluciones Blockchain, exploremos el ecosistema
  construido alrededor de Ethereum
readingTime: 12 min
mediumUrl: 'https://medium.com/@francomangone18/blockchain-101-rollups-8da114a51f32'
contentHash: cbbf2a0d7ccaec2580856e54c9f3b41df2295581725a6ad66c8d109a79b9eaf2
supabaseId: 9fa56e0d-4876-4577-9192-c5b53f89b465
---

> Este artículo es parte de una serie más larga sobre Blockchain. Si este es el primer artículo que encuentras, te recomiendo comenzar desde el [inicio de la serie](/es/blog/blockchain-101/how-it-all-began).

Con Ethereum detrás de nosotros, uno estaría tentado a pasar a otros grandes nombres de Blockchain como [Solana](https://solana.com/es), [Polkadot](https://polkadot.com/), [Hedera](https://hedera.com/) — solo por nombrar algunos.

> No te preocupes, llegaremos a ellos.

Pero la verdad es que no podemos posiblemente dejar el espacio de Ethereum sin hablar de los **Rollups**. Estos son fundamentales para el éxito del ecosistema a largo plazo — tanto es así que Ethereum ha adoptado una [hoja de ruta centrada en rollups](https://www.gate.io/learn/articles/rollup-centric-roadmap/1935) como su estrategia para el crecimiento y la adopción.

Así que hoy, **realmente** cerraremos con Ethereum hablando de estos **rollups**, que son piezas clave para su ecosistema. ¡Vamos!

---

## El Problema de la Escalabilidad {#the-scaling-problem}

Todo comienza con la búsqueda de una solución a un **problema**.

La tecnología detrás de Ethereum es una fantástica hazaña de ingeniería — no hay duda de eso. Y aunque resuelve muchos problemas con elegancia, todavía tiene sus fallos.

Uno de los principales problemas es el **rendimiento**.

La métrica más común para evaluar el rendimiento es medir las **transacciones por segundo** (TPS). Y en ese campo, Ethereum procesa un gran total de alrededor de [15-20 transacciones por segundo](https://dev.to/fromaline/transaction-per-second-tps-3f8b#:~:text=Ethereum%20TPS%20is%2011.75%20transactions%20per%20second%0AEthereum%20Max%20TPS%20is%2062.34%20transactions%20per%20second).

> ¡No es mucho, si alguna vez queremos tener millones de personas usando la red!

En contraste, las redes que usamos todos los días para procesar nuestras transacciones, como la red Visa, tienen un TPS mucho más alto, alcanzando decenas de miles.

Así que sí, bastante diferencia.

Para que ocurra la adopción masiva, necesitamos que nuestros queridos sistemas Blockchain **procesen las transacciones más rápido**. Así es como funciona.

<figure>
  <img
    src="/images/blockchain-101/rollups/sonic.webp" 
    alt="Sonic, corriendo"
    title="Hay que ir rápido"
    width="700"
  />
</figure>

Pero ya conocemos muchos de los funcionamientos internos de Ethereum a estas alturas. Por lo tanto, podríamos preguntarnos: ¿por qué no podemos ajustar algunas cosas, como el tiempo de slot, y hacer que Ethereum procese las transacciones más rápido?

La respuesta es muy familiar: **no es tan simple**.

### El Trilema de la Blockchain {#the-blockchain-trilemma}

Cada vez que diseñamos una **Blockchain** o **Tecnología de Registro Distribuido** (DLT), hay tres factores que debemos considerar: **seguridad**, **escalabilidad** y **descentralización**.

> Esto es muy similar al [teorema CAP](https://en.wikipedia.org/wiki/CAP_theorem) en el diseño de bases de datos, que establece que es extremadamente difícil proporcionar **consistencia**, **disponibilidad** y **tolerancia a particiones** al mismo tiempo.

Como podrías esperar, el problema es que es **realmente difícil** ser bueno en esos tres puntos al mismo tiempo.

Consideremos nuestro confiable Ethereum. La parte de **seguridad** está muy cubierta, debido a todas las garantías económicas y procesos de validación de los que hemos hablado en artículos anteriores. Luego, la red tiene una [miríada de validadores](https://dune.com/hildobby/eth2-staking), lo que significa que está en el extremo alto de la **descentralización**. Hasta ahora, todo bien.

Pero verás, la **escalabilidad** es un problema — porque la red tiene tantos validadores, necesita tiempo para coordinarlos correctamente y orquestar la producción de bloques. Por diseño, necesita estar en el extremo más lento para no comprometer la seguridad y la descentralización.

Claro, podríamos reducir el número de validadores, pero eso comprometería la **descentralización**.

O podríamos reducir el tiempo de slot, pero eso no daría a los validadores suficiente tiempo para votar correctamente, lo que podría comprometer la **seguridad**.

> Esto es conocido como el **Trilema de la Blockchain**, y es uno de esos conceptos que verás aparecer de vez en cuando.
>
> Mi consejo es: si alguien afirma haberlo resuelto, ¡verifica! ¡Lo más probable es que no lo hayan hecho!

<figure>
  <img
    src="/images/blockchain-101/rollups/blockchain-trilemma.webp" 
    alt="El trilema descrito arriba"
    title="[zoom]"
  />
</figure>

Así que ya ves, es un **acto de equilibrio**. Y al menos con su arquitectura actual, Ethereum no puede esperar resolver todo.

A menos que...

---

## Rollups {#rollups}

¿Y si pudiéramos resolver la escalabilidad **por separado**?

El problema es simple: escalar (obtener un TPS más alto) no se puede lograr sin comprometer otros aspectos importantes de la red. Pero podemos hacer cosas **fuera** de la Blockchain, y usar Ethereum como una especie de **capa de liquidación**. Algo como esto:

<figure>
  <img
    src="/images/blockchain-101/rollups/transaction-bundling.webp" 
    alt="Transacciones agrupadas y liquidadas en Ethereum"
    title="[zoom]"
  />
</figure>

Estos procesadores de transacciones que viven **fuera de la cadena** (no directamente en Ethereum) se llaman **rollups**. También son comúnmente conocidos como **Capa 2** (L2), lo que refleja su papel de agregar funcionalidad mejorada a la capa base, a menudo llamada **Capa 1**.

> En nuestro caso, la Capa 1 es por supuesto Ethereum. Pero el concepto es generalizable a otras Blockchains.

¡Fantástico! Con esto, podríamos ser capaces de hacer algún progreso en términos de escalabilidad.

Hasta que notamos que ahora tenemos un nuevo problema: necesitamos averiguar cómo agrupar transacciones de manera efectiva y segura, y qué escribir en la Capa 1.

<figure>
  <img
    src="/images/blockchain-101/rollups/not-again.webp" 
    alt="Jean-Luc Picard cubriéndose la cara"
    title="No otra vez..."
    width="500"
  />
</figure>

**No entres en pánico**. Tomémoslo con calma.

Revisemos los requisitos de nuevo. Estos rollups solo necesitan recibir transacciones y procesarlas. Recuerda, un conjunto de transacciones nos lleva de algún estado $A$ a algún otro estado $B$ — así que todo lo que necesitamos es **ordenar** dichas transacciones, y entonces tendremos una receta de cómo ocurrió el cambio de estado, y... Espera un segundo...

¡Eso suena **terriblemente como una Blockchain**!

### Rollups como Blockchains {#rollups-as-blockchains}

Seguro que sí, los **rollups** son **también Blockchains**. Organizan transacciones, luego las **comprimen** de alguna manera, y las publican en la Capa 1. Y al hacer esto, el **historial de transacciones** de la Capa 2 está permanentemente disponible en la Capa 1.

Una pregunta podría estar surgiendo en ti en este momento, así que voy a decirla:

::: big-quote
¿No significaría esto que los rollups tienen el mismo problema del trilema?
:::

**Sí, lo tienen**. Pero la idea clave aquí es que estos rollups pueden poner su enfoque en **otras partes del trilema** — no necesitan adherirse a las mismas reglas que Ethereum (la Capa 1).

Entonces, ¿qué estrategias usan? Encontrarás que hay **dos sabores principales** para las estrategias de rollup: **Rollups Optimistas**, y **Rollups de Conocimiento Cero (ZK)**.

Ahora, echemos un vistazo rápido detrás de escena a ambos enfoques.

---

## Rollups Optimistas {#optimistic-rollups}

Como el nombre sugiere, esta estrategia tiene que ver con el **optimismo** — somos optimistas de que **las transacciones son válidas**.

Por defecto, simplemente asumimos que cada transacción es válida, y solo las verificamos si alguien desafía el estado resultante.

Con esta idea, procesar una transacción se vuelve más rápido, porque solo necesitamos agrupar las transacciones en bloques, procesarlas y calcular el nuevo estado. Y luego simplemente publicamos una **afirmación** sobre el nuevo estado en la Capa 1 — por ejemplo, podríamos publicar una afirmación sobre los nuevos saldos de las cuentas.

Ser optimistas sobre la validez de las transacciones tiene el defecto obvio de no poder detectar transacciones **fraudulentas** o **maliciosas**.

<figure>
  <img
    src="/images/blockchain-101/rollups/evil-patrick.webp" 
    alt="Patrick de Bob Esponja con una sonrisa malvada"
    title="Bieeeeen"
    width="500"
  />
</figure>

Hay una solución para esto, por supuesto, y una muy simple y elegante: tener un **período de desafío** donde cualquiera puede disputar una afirmación.

Si alguien identifica una transacción fraudulenta durante este período, puede enviar una **prueba del fraude**, y luego el rollup procede a verificar dicha prueba. Y si la red identifica el fraude como legítimo, entonces esas transacciones simplemente se **revierten**.

Para resumir, una vez que termina el período de desafío para una afirmación, asumimos que esas transacciones están **finalizadas**.

<figure>
  <img
    src="/images/blockchain-101/rollups/optimistic-rollup.webp" 
    alt="Un diagrama del proceso de rollup optimista"
    title="[zoom]"
  />
</figure>

> Así que ya ves, es un **compromiso** nuevamente. La **seguridad** no es tan fuerte como la de Ethereum, pero esto permite un procesamiento de transacciones más rápido, mejorando la **escalabilidad**. ¡El trilema en su máxima expresión!

Un período típico de desafío es de alrededor de $7$ **días**. No es ideal, por supuesto — pero lo que perdemos en este sentido, podemos ganarlo en velocidad. Blockchains como [Arbitrum](https://arbitrum.io/) u [Optimism](https://www.optimism.io/) funcionan usando esta estrategia de rollup, y son **teóricamente** capaces de tener mejores números de TPS.

> Aquí está la comparación de [Ethereum vs Optimism](https://chainspect.app/compare/optimism-vs-ethereum), y [Ethereum vs Arbitrum](https://chainspect.app/compare/arbitrum-vs-ethereum).

¡Así que esa es la idea, en pocas palabras! Como siempre, hay mucho más que decir sobre cada Rollup Optimista, pero dejaremos los detalles más finos para otra ocasión.

Por ahora, hablemos del hermano más **matemático** de los rollups.

---

## Rollups de Conocimiento Cero {#zero-knowledge-rollups}

Estos rollups adoptan un enfoque **radicalmente diferente**.

<figure>
  <img
    src="/images/blockchain-101/rollups/protest.webp" 
    alt="Un cartel en una protesta que dice 'No creo en nada, solo estoy aquí por la violencia'"
    title="No, espera, ¡no ese tipo de radical!"
    width="500"
  />
</figure>

En este tipo de rollups, las transacciones ya no se consideran válidas hasta que se demuestre lo contrario — las transacciones **sí necesitan ser verificadas**. Lo que sucede es que, después de la validación, las transacciones se agrupan, y ocurre algo muy diferente: se genera una **prueba criptográfica** de la validez de las transacciones agrupadas.

Esta prueba es lo que se envía a la capa de liquidación — nuestra Capa 1 (**L1**). Lo interesante es que ahora la **L1** puede verificar la prueba para aceptar la afirmación enviada por la **L2**. Una vez verificada, los datos de transacción comprimidos están disponibles en la L1.

Pero si cada transacción necesita ser verificada, ¿cómo es este tipo de rollup **más rápido** que la capa de liquidación?

El truco está en **dónde** y **cómo** ocurre la verificación.

La verificación de transacciones ocurre fuera de la cadena, en **computadoras potentes** específicamente diseñadas para esta tarea. Estas computadoras también pueden crear una prueba matemática compacta (normalmente un [zk-SNARK](/es/blog/cryptography-101/zero-knowledge-proofs-part-2) o [zk-STARK](/es/blog/cryptography-101/starks)) que esencialmente dice: "hey, he comprobado todas estas transacciones, y todas son válidas".

Generar esta prueba es computacionalmente intensivo, pero **verificar la prueba en Ethereum** es relativamente barato y rápido — así que podemos agrupar cientos o incluso miles de transacciones en una sola prueba enviada a la Capa 1.

Bien, genial. Todos beneficios, hasta ahora — y ni siquiera mencionamos que obtienes una **finalidad muy rápida**. Entonces, ¿cuál es el truco? Siempre hay un truco.

<figure>
  <img
    src="/images/blockchain-101/rollups/suspicious.webp" 
    alt="Un perro con una mirada sospechosa"
    width="500"
  />
</figure>

El principal sacrificio aquí es la **descentralización**. Y por dos razones principales:

- Generar estas pruebas requiere **algoritmos especializados**. La complejidad hace que sea más difícil para los desarrolladores y organizaciones contribuir a estos sistemas de manera significativa — así que podríamos decir que el **conocimiento** está algo centralizado.
- Además, la generación de pruebas requiere **hardware potente**. La mayoría de los Rollups ZK solo tienen unos pocos **secuenciadores**, que son los sistemas encargados de verificar y agrupar transacciones — así que, nuevamente, la capacidad de producir bloques está centralizada.

> Así que sí, ¡nada es gratis!

Los rollups ZK populares incluyen [zkSync](https://www.zksync.io/), [StarkNet](https://www.starknet.io/) y [Polygon zkEVM](https://polygon.technology/polygon-zkevm). Están ganando tracción debido a sus propiedades superiores de finalidad y escalabilidad —aunque para hacer esto, necesitan comprometer un poco la descentralización.

---

## Costos {#costs}

Nos hemos centrado bastante en el TPS, pero la verdad es que este no es el único valor agregado que los rollups aportan a la mesa.

> De hecho, si estabas prestando atención, ¡puede que hayas notado que los números de TPS para los Rollups Optimistas no eran mucho mejores que los de Ethereum!

Hay otra propuesta de valor muy importante en los rollups, y está relacionada con los **costos de transacción**.

### Las Tarifas de Ethereum {#ethereums-fees}

En Ethereum, las tarifas de gas son una parte clave del diseño de la red. Aseguran que la red siga funcionando en períodos de alta demanda — pero al mismo tiempo, hacen que nuestras transacciones sean muy costosas.

La razón fundamental por la que las tarifas de Ethereum son altas es simple: **espacio limitado en los bloques**. Cada bloque solo puede ajustar una cierta cantidad de computación, que medimos en unidades de gas, como vimos en el artículo anterior. Los usuarios compiten por este recurso escaso a través de un **mercado de tarifas**. Cuando la demanda supera la oferta, los precios suben.

Pero nuestro tema principal hoy son los rollups! ¿Qué pueden hacer estos sistemas para reducir costos?

### La Solución de los Rollups {#the-rollup-solution}

Hay esencialmente tres razones (o mecanismos) que ayudan a los rollups a reducir dramáticamente las tarifas: **compresión de datos**, **distribución de costos** y **ejecución fuera de la cadena**.

- Ya vimos cómo los rollups **comprimen datos de transacciones** antes de enviar una afirmación para ser liquidada en Ethereum. Esto significa que ahorramos espacio en los bloques — haciendo que las transacciones del rollup no compitan directamente por el recurso.
- Luego, está el hecho de que al agrupar transacciones, el costo de la transacción de liquidación se distribuye entre todas las transacciones del lote. Si la transacción de liquidación cuesta $1 \ \textrm{ETH}$, y el lote contiene $1000$ transacciones, ¡cada transacción efectivamente costará $0.001 \ \textrm{ETH}$!
- Finalmente, las tarifas de gas están relacionadas con la **computación** — y dado que los rollups ejecutan lógica **fuera de la cadena**, la computación es mucho más barata, y puede seguir otros modelos de tarifas.

Tener tarifas más bajas es un punto de venta muy importante para estas redes. Las altas tarifas de transacción pueden (y lo hacen) alejar a los usuarios de las Blockchains, y una red sin usuarios es solo una pieza inútil de software altamente complejo.

> Hay que ser consciente de tu presupuesto, amigo.

<figure>
  <img
    src="/images/blockchain-101/rollups/huell-money.webp" 
    alt="Huell de Breaking Bad durmiendo sobre una pila de dinero"
    width="500"
  />
</figure>

En definitiva, la conclusión es que los rollups son **muy importantes para el ecosistema**.

---

## Desafíos {#challenges}

¡Bien! Esas fueron las **cosas buenas** sobre los rollups. Es hora de hablar de las **consecuencias no deseadas** y los **desafíos**.

> ¡Porque nada es gratis en el mundo de la Blockchain!

### Fragmentación del Estado {#state-fragmentation}

Los rollups son excelentes para el objetivo general de aumentar el rendimiento y reducir costos. Creo que podemos estar convencidos de eso a estas alturas.

Sin embargo, cada rollup tiene **su propia historia de transacciones**. Los eventos que se registran en **Optimism** son completamente diferentes de los registrados en **Polygon**. No tienen recuerdo uno del otro.

¿Por qué es esto un problema? Imagina esto: Tienes $1 \ \textrm{ETH}$ en **Arbitrum**, y quieres usar una nueva y genial aplicación DeFi que solo está disponible en **zkSync**. ¿Qué haces?

Necesitas **transferir** tus activos de un rollup a otro.

<figure>
  <img
    src="/images/blockchain-101/rollups/broken-bridge.webp" 
    alt="Un puente roto"
    title="¡Oh no!"
    width="500"
  />
</figure>

Este proceso de transferencia cuesta tarifas de gas en ambos lados, lleva tiempo (especialmente para los Rollups Optimistas), introduce riesgos de seguridad adicionales y, sobre todo, **crea una mala experiencia de usuario**.

> Además, podemos hablar de fragmentación de liquidez — la emisión de ETH no está disponible en una sola cadena, sino dispersa en muchos sistemas diferentes. Esto hace que los mercados sean menos eficientes y más caros, lo que a su vez, los hace menos atractivos.

Podríamos estar tentados a descartar esto como un inconveniente menor. Pero no lo es — es un desafío fundamental para la **componibilidad**. La componibilidad significa que cualquier Contrato Inteligente puede interactuar con cualquier otro Contrato Inteligente en una sola transacción. Con los rollups, crear estas interacciones entre rollups es mucho más complejo — y esta característica podría ser muy importante para el éxito del ecosistema.

### Disponibilidad de Datos {#data-availability}

El segundo desafío es ligeramente más técnico, pero igualmente importante: **disponibilidad de datos**.

Para que una blockchain sea segura, los usuarios necesitan poder verificar el estado actual. Esto requiere acceso a los datos (transacciones) que producen ese estado.

Los rollups publican dichos datos en Ethereum, lo que asegura que permanezcan disponibles. Pero esto crea una especie de **tensión**:

- Publicar más datos hace que los sistemas sean más **seguros** y **transparentes**.
- Pero publicar más datos también significa **costos más altos para los usuarios**.

Esto significa que los rollups necesitan **equilibrar** cuántos datos publican. Si publican muy poco, su seguridad podría verse comprometida. Pero si publican demasiado, las tarifas pueden subir, negando uno de los principales beneficios de los rollups.

<figure>
  <img
    src="/images/blockchain-101/rollups/compromise.webp" 
    alt="El meme de los dos botones con la decisión 'comprometer costos' vs 'comprometer seguridad'"
    width="400"
  />
</figure>

Este desafío es tan importante, que se ha convertido en una parte clave de la hoja de ruta de Ethereum centrada en rollups. [Proto-danksharding](https://medium.com/ethereum-on-steroids/what-is-proto-danksharding-and-what-does-it-mean-for-ethereum-7bcbf0bb62ca) (EIP-4844) está específicamente diseñado para hacer que la disponibilidad de datos sea más barata para los rollups.

Mientras tanto, algunos rollups están explorando soluciones alternativas de disponibilidad de datos, incluyendo:

- [Comités de Disponibilidad de Datos](https://docs.arbitrum.io/run-arbitrum-node/data-availability-committees/get-started) (grupos confiables que almacenan datos)
- [Validiums](https://ethereum.org/en/developers/docs/scaling/validium/) (que usan capas externas de disponibilidad de datos)
- Varios enfoques híbridos

Y, como deberías esperar a estas alturas, cada enfoque hace diferentes compromisos entre seguridad, costos y descentralización.

---

## Resumen {#summary}

¡Bien, eso fue todo un viaje!

> Creo que pudo haberse vuelto un poco técnico al final. ¡Lo siento por eso!

Más importante, vimos cómo los rollups adoptan un enfoque pragmático para escalar. En lugar de tratar de resolver el trilema de la blockchain directamente, lo rodean creando una **arquitectura en capas**, donde cada capa puede optimizarse para diferentes propiedades.

Y también vimos cómo esto viene equipado con su propio conjunto de desafíos.

Esta es una historia en curso, y la veremos desarrollarse en los próximos años. ¡De seguro va a ser emocionante!

Mientras tanto, hay **otros ecosistemas** tratando de presentar sus propias soluciones.

Así que [la próxima vez](/es/blog/blockchain-101/solana), comenzaremos a examinar otra Blockchain: **Solana**, uno de los grandes contendientes por ese codiciado tercer lugar en la lista de gigantes de Blockchain. Es otro gran cambio de modelo, así que prepárate para algunas nuevas ideas!

¡Hasta entonces!
