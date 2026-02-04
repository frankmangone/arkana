---
title: 'Blockchain 101: Consenso Revisitado'
date: '2025-03-17'
author: frank-mangone
thumbnail: /images/blockchain-101/consensus-revisited/slash.webp
tags:
  - ethereum
  - blockchain
  - consensus
  - proofOfStake
  - validator
description: >-
  Explorando el mecanismo de consenso detrás de Ethereum: Prueba de
  Participación
readingTime: 12 min
mediumUrl: >-
  https://medium.com/@francomangone18/blockchain-101-consensus-revisited-3979b59d71a7
contentHash: 0394bd5fab23b524bb93d52570133dfd2773ea93bde8a8b42a53c4cc72e8699d
supabaseId: 29a571c1-e496-4b5e-a63c-f865ee09e83c
---

> Este artículo es parte de una serie más larga sobre Blockchain. Si este es el primer artículo que encuentras, te recomiendo comenzar por el [inicio de la serie](/es/blog/blockchain-101/how-it-all-began).

A lo largo de las dos entregas anteriores, hemos estado enfocándonos fuertemente en la maquinaria que permite a Ethereum (y Blockchains compatibles con EVM) **ejecutar programas** creados por nosotros, los usuarios. No cualquier tipo de programas — [Contratos Inteligentes](/es/blog/blockchain-101/smart-contracts), para ser precisos. Piezas de lógica que son la única forma de cambiar un **estado personalizado** de otro modo inmutable que vive en la Blockchain.

Pero como ya sabemos a estas alturas, eso es solo parte de la historia.

Se puede iniciar una Blockchain (nodo) **local** con herramientas como [Hardhat](https://hardhat.org/) o [Foundry](https://book.getfoundry.sh/) (usando [Anvil](https://book.getfoundry.sh/reference/anvil/)). Estos entenderán cómo ejecutar transacciones y Contratos Inteligentes, pero no serán una verdadera Blockchain — en el sentido de que dicho nodo está **desconectado** del resto del mundo.

Lo que necesitamos para construir una verdadera Blockchain es lograr el [consenso](/es/blog/blockchain-101/a-primer-on-consensus) con otros participantes de la red. Acordar el llamado **estado del mundo** con otros nodos. Y acatar las reglas que esto implica.

Por lo tanto, finalmente es hora de hablar sobre el consenso en Ethereum.

<figure>
  <img
    src="/images/blockchain-101/consensus-revisited/handshake.webp" 
    alt="Un apretón de manos"
    width="600"
    className="bg-white"
  />
</figure>

---

## Ethereum y Consenso {#ethereum-and-consensus}

En los primeros días de la red, el mecanismo de consenso elegido para Ethereum fue **Prueba de Trabajo** (PoW, por sus siglas en inglés) — el mismo mecanismo (al menos en principio) que Bitcoin sigue utilizando hasta la fecha.

Ya hemos [discutido](/es/blog/blockchain-101/wrapping-up-bitcoin/#is-bitcoin-good) algunos de los problemas que tiene este mecanismo: bajo rendimiento (es decir, baja velocidad de procesamiento de transacciones de la red), alto consumo de energía, y también el hecho de que la minería estaba concentrada en grandes granjas de minería, en lugar de ser un sistema verdaderamente descentralizado, donde cualquier persona ejecutando un nodo en su computadora pudiera participar.

> Aunque, debo decir, la verdadera descentralización es realmente difícil de lograr. Discutiremos esto a lo largo de nuestro viaje juntos, no te preocupes.

La [Fundación Ethereum](https://ethereum.foundation/) identificó esas fallas, y buscó dirigir el barco en una dirección diferente.

Desde su concepción, Ethereum fue revolucionario en el sentido de que dio al mundo una **gestión dinámica de estado** en la Blockchain. Pero para ser justos con otras Blockchains, para cuando se propuso el **nuevo mecanismo de consenso**, el ecosistema **web3** (también conocido como basado en Blockchain) ya había florecido, y una gran cantidad de diferentes Blockchains con diferentes propuestas de valor — junto con nuevos mecanismos de consenso — habían surgido.

Lo que quiero decir es que el nuevo algoritmo de consenso, **Prueba de Participación** (PoS, por sus siglas en inglés), no era tan nuevo y disruptivo como la introducción de los Contratos Inteligentes. La forma en que Ethereum hizo el cambio, sin embargo, fue bastante interesante, y hablaremos de eso en el próximo artículo. Ahora, centrémonos en cómo funciona **PoS**.

Pero primero, es necesario un breve repaso de PoW.

### Prueba de Trabajo {#proof-of-work}

Como recordarás de [algunos artículos atrás](/es/blog/blockchain-101/wrapping-up-bitcoin), **Prueba de Trabajo** es un mecanismo de consenso que se basa en un **rompecabezas difícil** para proporcionar equidad. Con esto, queremos decir algunas cosas:

- nadie sabe de antemano quién será el próximo creador de bloques, lo cual es importante para evitar actividades maliciosas dirigidas.
- un nodo malicioso no puede producir bloques más rápido que el resto de la red.
- los nodos están incentivados a buscar nuevos bloques (minar) porque obtienen una **recompensa** por hacerlo.

Pero ese mismo rompecabezas que proporciona todas estas cosas buenas, es también la mayor falla de diseño del mecanismo: es **tremendamente ineficiente**. Se gasta mucho tiempo y recursos computacionales resolviendo el rompecabezas — un problema parcial de preimagen de hash — y no en hacer crecer la Blockchain per se.

Naturalmente, podemos preguntarnos: **¿tiene que ser así?** A lo cual la respuesta es un rotundo **no**. Aunque, no es tan simple como ajustar algunos botones aquí y allá: tenemos que **repensar** completamente cómo abordamos el consenso.

Necesitamos dos ingredientes principales para cualquier buen mecanismo de consenso:

- Una forma de garantizar que los contenidos de los bloques sean válidos (lo que significa que las transacciones son válidas y están correctamente firmadas).
- Una forma de asegurar que ningún actor individual controle la red.

Hablaremos sobre el segundo punto en un momento, pero primero centrémonos en el primero. ¿Cómo hacemos eso?

<figure>
  <img
    src="/images/blockchain-101/consensus-revisited/thincc.webp" 
    alt="Thincc"
    width="500"
  />
</figure>

---

## Validación de Bloques {#block-validation}

En Bitcoin, los nodos producen bloques válidos en **momentos aleatorios**, porque el rompecabezas es resuelto aleatoriamente por algún nodo en la red. Lo que hace que el bloque sea "válido" es la presencia de un cierto [valor nonce](/es/blog/blockchain-101/how-it-all-began/#working-for-blocks), que produce una hash muy específico cuando pasamos todos los contenidos de un bloque a través de una función de hash.

Sin embargo, las transacciones en sí mismas **no son necesariamente válidas**. Debido a esto, cada nodo comprueba cada bloque que recibe. Si alguna transacción es inválida, entonces todo el bloque es rechazado. Podemos decir que un bloque en estas condiciones es efectivamente **rechazado por la red**.

<figure>
  <img
    src="/images/blockchain-101/consensus-revisited/block-validation.webp" 
    alt="Validación de bloques en acción"
    title="[zoom]"
  />
</figure>

En otras palabras, no confiamos en nadie. Lo cual está en línea con el lema habitual:

::: big-quote
No confíes, verifica.
:::

Todo esto proviene del hecho de que los productores de bloques no están controlados de ninguna manera. Solo necesitan hacer el trabajo. Encontrar un nonce válido es suficiente para que un bloque sea válido, pero aún necesitamos inspeccionar las transacciones.

Entonces, en lugar de vivir en un mundo tan **salvaje**, ¿qué tal si intentamos poner algo de orden y asignar roles?

<figure>
  <img
    src="/images/blockchain-101/consensus-revisited/cowboys.webp" 
    alt="Vaqueros en un fondo de atardecer"
    width="600"
  />
</figure>

### Validadores {#validators}

En Prueba de Participación, los [mineros](/es/blog/blockchain-101/a-primer-on-consensus/#incentives) son reemplazados por **validadores**. La idea clave aquí es que los validadores tienen un rol específico: **proponer y validar** bloques. Estos validadores no necesitan resolver ningún rompecabezas criptográfico en absoluto — por lo que esa ineficiencia queda fuera del panorama. Simple, ¿verdad?

¡No del todo! Necesitamos definir algunas cosas para que esto funcione. Por ejemplo:

- ¿Quién o cómo puede un nodo ser un validador?
- ¿Cómo se selecciona un validador para proponer un bloque?
- ¿Cómo aseguramos que los contenidos del bloque sean válidos?

> Está totalmente bien hacer este tipo de preguntas — ¡respuestas sólidas son lo que constituye un mecanismo de consenso confiable!

Comencemos por la última. Algo que podríamos hacer es realizar algún **examen cruzado** de bloques. Por supuesto, los validadores están a cargo de este proceso de validación.

> ¡Duh!

Pero necesitamos preguntarnos: ¿qué sería un **bloque inválido**?

Fundamentalmente, es solo un bloque que contiene transacciones que no siguen las reglas de la red. Una transacción podría ser inválida debido a varias razones, como:

- Intentos de doble gasto (utilizar los mismos fondos dos veces).
- Firmas inválidas (alguien tratando de gastar fondos que no controla).
- Ejecución de contrato inteligente que viola las reglas de la EVM.
- Transacciones con [gas](/es/blog/blockchain-101/ethereum/#gas) insuficiente.

La diferencia clave está en cómo se manejan estos bloques inválidos. Los bloques inválidos **pueden** ser propuestos, pero hay un incentivo para no hacerlo: los validadores (los proponentes) tienen **piel en el juego**.

¿Qué significa esto? Que si propones un bloque inválido y tu intento es detectado por otros validadores, serás **penalizado**.

¿Cómo, preguntas? Bueno, esto nos lleva a una de las preguntas que planteamos anteriormente: ¿**quién** puede ser un validador?

La respuesta está en el nombre del protocolo mismo: participación.

<figure>
  <img
    src="/images/blockchain-101/consensus-revisited/steak.webp" 
    alt="Un jugoso bistec"
    title="No, no ese tipo de filete... Aunque se ve bien..."
    width="600"
  />
</figure>

### Participación {#stake}

Para convertirse en un validador en Ethereum, un nodo debe depositar exactamente $32 ETH$ en el **contrato de staking**. Esto sirve para dos propósitos: te da el privilegio de proponer bloques, pero también es un **depósito de seguridad** o **fianza**.

> Debo admitir, el valor de $32 ETH$ parece bastante aleatorio a primera vista. Pero de hecho, es un valor cuidadosamente elegido, que principalmente busca mantener el número de validadores en una cantidad saludable.

Si los validadores se comportan mal, ya sea proponiendo bloques inválidos o **desconectándose** cuando deberían estar validando, una parte de su participación puede y será **recortada** (confiscada).

Lo que tenemos entonces es un **mecanismo de castigo económico**. Por supuesto, los validadores también tienen **incentivos positivos** para participar en el consenso — al igual que en Bitcoin, reciben recompensas por sus esfuerzos.

Bien, digamos que has depositado $32 ETH$, y ahora estás ejecutando un nodo validador. ¡Felicidades! ¿Qué sucede después?

---

## Prueba de Participación en Acción {#proof-of-stake-in-action}

Ya no tenemos que mantener una carrera computacional para determinar quién propone un bloque — ahora tenemos un conjunto de **validadores** que están dispuestos a poner su participación en juego para proponer bloques válidos.

Todo lo que necesitamos hacer es decidir cómo **orquestamos** la validación — cómo elegimos quién hace qué, y cuándo.

El protocolo PoS de Ethereum utiliza un **proceso de selección pseudo-aleatorio** (utilizando [Funciones Aleatorias Verificables](/es/blog/cryptography-101/protocols-galore/#verifiable-random-functions)) donde cada validador activo tiene la misma probabilidad de ser elegido como el próximo proponente de bloque. Pero recuerda — también necesitamos que otros nodos **validen** el nuevo bloque. Así que además del proponente, también se selecciona un **comité de validadores**.

<figure>
  <img
    src="/images/blockchain-101/consensus-revisited/comittee.webp" 
    alt="Representación del comité validando bloques"
    title="[zoom]"
  />
</figure>

> Típicamente, se seleccionan $128$ atestiguadores. El proponente y el comité de validadores (o **atestiguadores**) rotan cada $12$ segundos, que es el tiempo que Ethereum tarda en producir un Bloque.

Además, los validadores son notificados con un poco de anticipación cuando necesitarán proponer y validar bloques. Esto les permite prepararse adecuadamente, sin desperdiciar recursos mientras están inactivos.

La belleza de este sistema es su **eficiencia**. No se desperdician recursos computacionales resolviendo rompecabezas. La red se basa en el disuasivo económico que es el mecanismo de recorte — la actividad maliciosa de los nodos resulta en que su participación se va:

<figure>
  <img
    src="/images/blockchain-101/consensus-revisited/peace-out.webp" 
    alt="Paz fuera."
    title="Paz."
    width="500"
  />
</figure>

Ahora, el camino feliz es bastante fácil de entender. Los validadores en el comité atestiguarán que el bloque propuesto es válido, y cuando al menos $2/3$ del comité ha atestiguado la validez del bloque, entonces el bloque es "aceptado".

> Vale la pena señalar que las atestaciones tienen cierta estructura — no son solo votos para el nuevo bloque. También tienen algo más de información, como lo que cada atestiguador ve como la **cabeza** de la cadena — el último bloque. ¡Y también están firmadas!

Hablaremos sobre lo que significa "aceptar" en un momento. Pero primero: ¿exactamente qué sucede cuando algún validador detecta algo sospechoso?

### Manejo de Actividad Maliciosa {#handling-maliciousness}

Necesitamos distinguir entre diferentes tipos de comportamiento malicioso:

- **Bloques inválidos**: bloques con transacciones inválidas. Los atestiguadores honestos simplemente no firmarán atestaciones para ellos.
- **Equivocación (Propuestas Dobles)**: esto sucede cuando un proponente esencialmente propone (al menos dos) bloques diferentes, y los transmite a la red durante la atestación.
- **Inactividad**: cuando los validadores o atestiguadores se desconectan durante sus turnos para proponer y validar bloques, afectando efectivamente la red porque la producción de bloques podría detenerse durante sus turnos.

> La última podría no sonar como "actividad maliciosa". Pero recuerda: en un mundo descentralizado, **no podemos confiar en nadie**. Por lo tanto, no podemos distinguir entre una desconexión honesta o inactividad deliberada — por lo que ambas se consideran comportamiento malicioso.

Cada uno de estos escenarios se maneja de manera diferente.

En el caso de que los bloques sean inválidos, si los atestiguadores son honestos, el bloque simplemente no será atestiguado por ellos, y no se alcanzará el requisito de $2/3$ de aceptación. El bloque muere en la orilla, y el validador esencialmente desperdicia su turno para obtener recompensas. Mala suerte.

La **inactividad** es donde comienzan las penalizaciones. Porque esencialmente, la red no producirá bloques si suficientes validadores están inactivos. Esos validadores comienzan a perder una parte de su participación a través de pequeñas penalizaciones, que aumentan con el tiempo.

La **equivocación** se considera más seria. Es como un intento deliberado de causar caos en el sistema. Y hay evidencia criptográfica de esto, porque todas las acciones que un validador toma están **firmadas** — así que esto es lo que llamamos actividad **probablemente maliciosa**. En este escenario, ocurre el **recorte**, el validador que fue atrapado ve una parte de su participación **quemada**.

<figure>
  <img
    src="/images/blockchain-101/consensus-revisited/slash.webp" 
    alt="Slash, el guitarrista"
    title="¡Slash!"
    width="600"
  />
</figure>

Lo inteligente de este diseño es que el **castigo se ajusta al crimen**. Los errores honestos o problemas temporales de conectividad resultan en penalizaciones menores, mientras que las acciones maliciosas deliberadas son castigadas más severamente.

> También vale la pena señalar que el recorte no ocurre inmediatamente. Existe un período de tiempo (llamémoslo el [período de retirabilidad](https://figment.io/insights/ethereum-withdrawals-a-comprehensive-faq/#:~:text=How%20long%20will%20it%20take%20to%20process%20a%20validator%20exiting%20the%20active%20set%3F%C2%A0)), donde el validador recortado no puede retirar sus fondos restantes. Durante este tiempo, el protocolo puede aplicar cualquier penalización adicional si se encuentra nueva evidencia sobre cosas como ataques coordinados.
>
> En este momento, ese tiempo es de aproximadamente $~27$ horas.

---

Así que, eso es **Prueba de Participación** en pocas palabras. Por supuesto, esto es solo lo general, y los detalles de implementación no están cubiertos exhaustivamente — pero esto debería ser más que suficiente para proporcionar una buena idea de cómo funciona el sistema.

Este mecanismo también permite algo que no era posible en Prueba de Trabajo: **finalidad de bloque**. Hablemos de eso a continuación.

---

## Finalidad {#finality}

Hasta ahora, hemos hablado de bloques siendo **"aceptados"**.

En Bitcoin, vimos cómo la red podría presentar [bifurcaciones temporales](/es/blog/blockchain-101/a-primer-on-consensus/#fork-resolution). Esto tenía una consecuencia desagradable: no podemos saber si el último bloque en la Blockchain terminará siendo parte de ella, o si eventualmente será descartado. Así que teníamos que esperar por **confirmaciones de bloque** — bloques encima del que nos interesa.

Claramente, es importante para nosotros los usuarios tener la capacidad de determinar si un bloque está incluido en la Blockchain. De hecho, esta idea tiene su propio nombre: un bloque o transacción es **finalizado** (o **final**, o **tiene finalidad**) cuando podemos estar seguros de que será registrado permanentemente en la Blockchain.

Bitcoin tiene **finalidad probabilística**. Esto significa que nunca estamos 100% seguros de que un bloque está en la Blockchain, pero la probabilidad de que esto no suceda disminuye drásticamente con cada confirmación de bloque. Cuanto más profundo esté el bloque en la Blockchain, menor será la probabilidad.

> Como mínimo, esto no es conveniente.

Con Prueba de Participación, sin embargo, sucede algo realmente interesante — en algún punto cada bloque tendrá finalidad **absoluta** o **determinista**. Pero, ¿cómo sucede esto?

### Finalidad en Ethereum {#finality-in-ethereum}

Ya hemos hablado sobre cómo se organiza el tiempo en Ethereum. Los **slots** son los **períodos de 12 segundos** donde se proponen y votan nuevos bloques.

También hay épocas. Las **épocas** son grupos de $32$ slots (aproximadamente 6 minutos y medio). Y al final de cada época, los validadores votan sobre pares de **puntos de control** — el primer y último bloque en la época.

> Necesitan votar porque este es un sistema distribuido, por lo que podrían tener diferentes visiones del estado actual de la red.

De manera similar a cómo se validan los bloques, cuando un punto de control recibe votos de $2/3$ de los validadores, el punto de control se vuelve **justificado**. Cuando eso sucede, cualquier punto de control justificado previo (más profundo en la Blockchain) se vuelve **finalizado**.

En la práctica, esto significa que después de aproximadamente $2$ épocas (que son aproximadamente 12-15 minutos), tu transacción alcanza **finalidad absoluta**. ¡Y en ese punto, puedes estar absolutamente seguro de que tu transacción será incluida en la Blockchain!

> Bueno, **casi** absolutamente seguro. La verdad es que si la red está dispuesta a perder enormes cantidades de ETH a través de recortes, entonces los validadores podrían en teoría reescribir parte de la historia de la red (la Blockchain misma). Pero hay miles de millones de dólares en ETH en participación — así que la seguridad se basa en el hecho de que nadie está dispuesto a perder tanto.
>
> Lo cual es una suposición bastante sólida.

Este mecanismo de finalidad absoluta se llama **Casper FFG** (Friendly Finality Gadget). Es una de las principales mejoras que se implementaron junto con la transición a PoS.

Bastante genial, ¿no?

---

## Resumen {#summary}

El nuevo y mejorado mecanismo de consenso de Ethereum mitiga muchos de los problemas del antiguo sistema de Prueba de Trabajo. Sin embargo, introduce un conjunto diferente de problemas, que son abordados mediante modelos económicos sólidos y una arquitectura de sistema distribuido inteligente.

Por supuesto, hay mucha más complejidad bajo el capó. Pero nuevamente, esta serie no tiene como objetivo proporcionar todos los conocimientos de nivel súper profundo, pero tampoco ir a un nivel súper alto. Creo que el artículo de hoy se sitúa cómodamente en algún punto intermedio.

La Prueba de Participación viene en diferentes sabores — el enfoque de Ethereum no es el **único** enfoque posible. Otras Blockchains han introducido ajustes y cambios con la esperanza de lograr tiempos de bloque más bajos, mayor rendimiento, finalidad más rápida o garantías de seguridad más fuertes. Lo cual, en última instancia, es algo bueno, creo — a medida que se descubren mejores mecanismos, la experiencia general para nosotros los usuarios debería mejorar.

> Hablaremos sobre variaciones de PoS y otros mecanismos de consenso muy pronto.

Hemos cubierto bastantes cosas sobre Ethereum hasta ahora. La próxima vez, [cerraremos el capítulo sobre esta Blockchain](/es/blog/blockchain-101/wrapping-up-ethereum), para poder avanzar y descubrir nuevos horizontes.

¡Nos vemos pronto!
