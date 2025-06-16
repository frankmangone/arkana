---
title: "Blockchain 101: Safari de Blockchain"
date: "2025-06-16"
author: frank-mangone
thumbnail: /images/blockchain-101/blockchain-safari/cheetah.webp
tags:
  - blockchain
  - sidechain
  - privacy
  - consensus
  - utxo
description: >-
  Para marcar nuestra partida hacia nuevos horizontes, hacemos una breve desviación para mirar algunas ideas geniales propuestas por otras Blockchains.
readingTime: 16 min
---

> Este es parte de una serie más grande de artículos sobre Blockchain. Si este es el primer artículo que encuentras, te recomiendo fuertemente comenzar desde el [inicio de la serie](/es/blog/blockchain-101/how-it-all-began).

Nuestro viaje ya nos ha llevado a través del funcionamiento interno de algunas de las Blockchains más grandes que existen — [Bitcoin](/es/blog/blockchain-101/how-it-all-began), [Ethereum](/es/blog/blockchain-101/enter-ethereum), y [Solana](/es/blog/blockchain-101/solana).

Es mucho para asimilar, sí... Pero el panorama web3 es enorme, y tenemos mucho, **mucho** más por cubrir todavía.

Confío en que con toda la información que hemos procesado hasta ahora, estaremos más o menos familiarizados con las ideas generales en Blockchain, y podremos procesar nuevos conceptos e ideas fácilmente.

Así que hoy, quiero hacer algo un poco fuera de lo común, y no enfocarme en una sola Blockchain, sino en **múltiples**, y explorar las ideas centrales que persiguieron en su diseño. Un breve tour turístico del espacio Blockchain, por así decirlo.

<figure>
  <img
    src="/images/blockchain-101/blockchain-safari/cheetah.webp" 
    alt="Un guepardo trepando encima de un jeep"
    title="Disculpe señor, ¿tiene un minuto para hablar sobre Blockchain?"
    width="600"
  />
</figure>

Para mantener el artículo breve, repasaré las ideas más importantes de las Blockchains de las que hablaremos hoy. Esto significa que no entraremos realmente en los detalles más finos, así que te animo a continuar tu investigación por tu cuenta si alguna de ellas te interesa.

> Recuerda, el objetivo de esta serie no es profundizar completamente en ninguna de estas Blockchains, sino aprender los conceptos centrales detrás de ellas, y las innovaciones que han transformado — y siguen transformando — la industria.

¿Listo? ¡Acción!

---

## Extendiendo UTXO {#extending-utxo}

En los [primeros capítulos](/es/blog/blockchain-101/transactions) de esta serie, estudiamos Bitcoin, y cómo propuso un enfoque inicial para modelar el dinero: el [Modelo de Salidas de Transacción no Gastadas](/es/blog/blockchain-101/transactions/#unspent-transaction-outputs), o simplemente UTXO por sus siglas en inglés.

Inmediatamente después, hablamos sobre Ethereum y Solana, y este modelo UTXO fue relegado a un segundo plano mientras las **cuentas** (accounts) tomaban el escenario principal. ¿Por qué es eso?

La respuesta es muy simple, realmente: **programabilidad**.

Los modelos basados en cuentas condensan el estado de la Blockchain en **cuentas individuales** — ya sean cuentas de usuario, cuentas de contrato o programa, etc. El **estado** de toda la red está ordenadamente empaquetado en estas cajas de almacenamiento más pequeñas, una por cuenta.

> Incluso podríamos pensar en estas piezas de estado como una estructura grande y única que representa cada cuenta, manteniendo su estado. No quiero decir "objeto" porque eso puede ser confuso para el próximo artículo... Pero sí, algo así como objetos.

Esta arquitectura hace que sea realmente fácil acceder y modificar el estado, porque sabemos dónde están los datos: ¡en cada cuenta! Decimos que las cuentas **tienen estado** (stateful) — mantienen un estado mutable.

Contrasta esto con el modelo UTXO de Bitcoin, que está **disperso** por todas partes. Además, cada UTXO no mantiene realmente ningún estado mutable — solo un **valor inmutable**. En este sentido, se dice que Bitcoin **no tiene estado** (stateless), en referencia a cada UTXO.

Intentar implementar lógica sobre este estado disperso y rígido de la Blockchain parece ser una tarea complicada — y exactamente la razón por la que otras plataformas como Ethereum eligieron usar **cuentas** para la programabilidad.

Cuando lo ponemos así, suena como si UTXO fuera el modelo "inferior" — pero en realidad, tiene algunas **cualidades inherentes** interesantes en áreas donde el modelo de cuentas tiene problemas. En particular, permite naturalmente mejor paralelización, y una validación de transacciones más clara (y simple).

<figure>
  <img
    src="/images/blockchain-101/blockchain-safari/ha.webp" 
    alt="Jack Black riendo"
    title="¡Ha! ¡Toma eso!"
    width="600"
  />
</figure>

Así que acá va una pregunta: ¿podríamos de alguna manera soportar lógica en sistemas UTXO, sin perder estos beneficios?

### Una Nota Sobre Bitcoin {#a-note-about-bitcoin}

Antes de pasar al protagonista de esta sección, necesitamos volver a cómo funcionan realmente los UTXOs en Bitcoin. Esto nos ayudará a entender mejor lo que viene después.

Para poder gastar un UTXO, necesitamos cumplir ciertas condiciones. Estas condiciones se establecen en forma de [scripts de bloqueo](https://learnmeabitcoin.com/technical/transaction/output/scriptpubkey/), que definen las condiciones bajo las cuales cada UTXO particular puede ser consumido (gastado).

> Estos scripts están escritos en [Script](https://learnmeabitcoin.com/technical/script/), un lenguaje de programación "mini" (no es [Turing-completo](https://en.wikipedia.org/wiki/Turing_completeness)).

Si bien esto significa que Bitcoin soporta lógica en cierta medida menor, los UTXOs normalmente usan un pequeño conjunto de [bloqueos estándar](https://learnmeabitcoin.com/technical/script/#segwit), que involucran alguna forma de firma digital simple del gastador para desbloquear (y consumir) el UTXO.

Realmente, cuando nos preguntamos si podemos agregar **lógica** a este modelo, estamos pidiendo un poco más que estos bloqueos — ¡queremos soportar completamente operaciones lógicas! Entonces, ¿cómo lo hacemos?

### Cardano {#cardano}

Si bien ha habido muchos intentos de agregar programabilidad sobre redes basadas en UTXO (como [Rootstack](https://rootstock.io/)), creo que uno de los enfoques más elegantes e ingeniosos para **extender** el modelo central es el propuesto por [Cardano](https://cardano.org/), en forma de lo que llaman el modelo [UTXO Extendido](https://docs.cardano.org/about-cardano/learn/eutxo-explainer) (EUTXO).

<figure>
  <img
    src="/images/blockchain-101/blockchain-safari/cardano.webp" 
    alt="Logo de Cardano"
    width="500"
  />
</figure>

No nos enfocaremos realmente en el algoritmo de consenso de Cardano hoy, porque no hay muchas sorpresas allí: Cardano fue una de las primeras redes [Proof of Stake](/es/blog/blockchain-101/consensus-revisited), con su protocolo [Ouroboros](https://cardano.org/ouroboros/).

> ¡Vale la pena echar un vistazo, si te interesa!

Entonces, ¿cómo funciona esta extensión? Bueno, en lugar de bloqueos, Cardano agrega algo de complejidad a la mezcla permitiendo que cada UTXO lleve algunos nuevos elementos exóticos junto con su valor: **datos arbitrarios** y **scripts de validación**.

<figure>
  <img
    src="/images/blockchain-101/blockchain-safari/eutxo.webp" 
    alt="Diagrama EUTXO"
    title="[zoom]"
    width="500"
  />
</figure>

Al agregar estos scripts de validación, podemos imponer **condiciones más complejas** al proceso de desbloqueo. Podemos colocar restricciones de firma como lo hicimos en Bitcoin, pero ahora podemos requerir otras condiciones lógicas, como [timelocks](https://en.bitcoin.it/wiki/Timelock).

> Estos scripts de validación están escritos en un lenguaje llamado [Plutus](https://developers.cardano.org/docs/smart-contracts/plutus/).

Dicho de otra manera: los scripts de validación definen las condiciones bajo las cuales el UTXO puede ser gastado. Toda la lógica y los datos necesarios para validar una transacción se proporcionan como parte de la **transacción misma** — no se requieren verificaciones de estado externas.

Lo interesante de este diseño es que se mantienen todos los beneficios de usar UTXO, porque cada transacción es autocontenida. La red puede paralelizar fácilmente la validación, que en sí misma es mucho más simple que en Blockchains basadas en cuentas.

Pero por supuesto, esto viene con limitaciones. Es particularmente difícil establecer interacciones entre piezas separadas de estado (UTXOs), ya que no hay un **estado global** fácilmente accesible, ordenada y mutablemente almacenado.

El enfoque de Cardano nuevamente muestra un tema central en el diseño de Blockchain: no hay **solución perfecta**, solo diferentes compensaciones.

> Vale la pena notar que cuando gastas dinero en Cardano, no solo estás moviendo valor — también estás **programando** las condiciones de cómo se puede gastar ese dinero la próxima vez. Cada creador de transacción se convierte en un "programador" de los nuevos UTXOs que crea, decidiendo qué scripts y condiciones gobernarán esas salidas.

Así que sí, mientras que EUTXO te da los beneficios de no tener estado y paralelización, hace que las interacciones de estado complejas sean más difíciles que los sistemas basados en cuentas. Diferentes problemas, diferentes soluciones — y eso es exactamente lo que hace que este espacio sea tan interesante.

¡Bien, uno menos! ¿Qué sigue?

---

## Consenso y Confianza {#consensus-and-trust}

Como sistemas descentralizados, todas las Blockchains dependen de alguna forma de **consenso descentralizado** para asegurar sus redes.

> ¡Solo hemos cubierto Proof of Work (PoW) y Proof of Stake (PoS) — pero están prácticamente en todas partes!

Estos algoritmos de consenso son maravillosas muestras de ingeniería, pero vienen con algunas complicaciones adjuntas. Por ejemplo, PoW es muy ineficiente energéticamente, y PoS es un baile de varios pasos bastante complicado de coordinación descentralizada precisa.

Ya sabemos que hay una razón por la que esto existe: mantener las cosas **sin confianza**. Dado que cualquiera puede unirse a la red como minero o validador (siempre que cumplan con las condiciones requeridas), **no podemos confiar en los nodos** para que sean honestos, y por lo tanto necesitamos poner medidas en su lugar para que todo el sistema funcione perfectamente.

Pero, ¿y si **no necesitáramos todo eso**? ¿Y si el consenso pudiera ocurrir mucho más rápido, y sin todas estas complicaciones?

### Ripple {#ripple}

Esto es lo que [Ripple](https://ripple.com/) intentó lograr con su red, el [XRP Ledger](https://xrpl.org/).

> Y para evitar cualquier confusión desde el principio, quiero aclarar que el XRP Ledger a menudo se conoce como Ripple también.

<figure>
  <img
    src="/images/blockchain-101/blockchain-safari/ripple.webp" 
    alt="Logo de Ripple"
    width="500"
  />
</figure>

Ripple toma un enfoque radicalmente diferente al consenso. En lugar de abrir la participación a todos, tiene un conjunto de **participantes de confianza** que colectivamente acuerdan el estado de la red.

Estos participantes se llaman **validadores** — pero son fundamentalmente diferentes de los validadores en PoS.

Y mientras estamos en eso, **técnicamente hablando**, el libro mayor XRP **no es una Blockchain**, en el sentido de que no usa la misma estructura de datos subyacente. En cambio, es una **Tecnología de Libro Mayor Distribuido** (DLT), donde los validadores acuerdan directamente el siguiente estado del libro mayor sin ninguna minería o producción de bloques.

> Tendemos a llamar a estos tipos de sistemas "Blockchains" de todos modos. Es sobre funcionalidad más que implementación real.

La distinción clave aquí es que el consenso ocurre a través de **acuerdo entre nodos de confianza**, en lugar de a través de competencia o selección aleatoria. Y dado que los validadores no necesitan realizar cálculos pesados o apostar tokens para proponer bloques, la red puede procesar transacciones muy rápidamente — a menudo liquidando pagos en solo unos segundos.

Pero entonces... ¿Qué hay de nuestro lema habitual **no confíes, verifica**?

<figure>
  <img
    src="/images/blockchain-101/blockchain-safari/suspicious.webp" 
    alt="Un perro con una mirada sospechosa"
    title="Sospechoso"
    width="500"
  />
</figure>

Bueno, por supuesto, esto viene con una **compensación importante**: velocidad y eficiencia, a costa de un **modelo de confianza semi-permitido**.

> Los validadores son típicamente **entidades conocidas**, lo que puede ayudar a tranquilizarnos — pero la confianza es finalmente requerida.

Sí, esto no es tan descentralizado como otras Blockchains podrían serlo. ¿Pero sabes qué? Es **extremadamente efectivo** para el caso de uso principal de Ripple: pagos rápidos y de bajo costo y transferencias transfronterizas.

Si algo, esto demuestra que la descentralización no es un concepto estático, sino más bien un **espectro**. Diferentes aplicaciones pueden requerir diferentes equilibrios entre apertura, confianza y eficiencia.

> ¡Y de nuevo, esto es el [trilema](/es/blog/blockchain-101/rollups/#the-blockchain-trilemma) en acción!

---

## Más Alternativas de Consenso {#more-consensus-alternatives}

Por ahora, nuestro repertorio de mecanismos de consenso conocidos está compuesto por solo 3 estrategias generales: Proof of Work, Proof of Stake, y el protocolo Ripple.

Para mí, este número aún se siente pequeño. Como en, **imaginaría** que hay otras estrategias por ahí.

> ¡Peor aún, si tratamos a Ripple como un caso atípico, entonces solo tenemos dos alternativas para elegir!

Simplemente no puede ser todo lo que hay en el consenso, ¿verdad?

Otras estrategias existen, pero para ser justos, el consenso no es un problema fácil de resolver. Es muy importante que cualquier mecanismo que diseñemos sea muy resistente a **condiciones adversas**, lo que generalmente significa qué tan tolerante es la red tanto a fallas no intencionales como intencionales.

> Lo que es más, hay diferentes **variantes** de PoW y PoS. Su nombre podría ser el mismo, pero eso es una simplificación excesiva del mecanismo subyacente.

Con esto en mente, examinemos otro algoritmo de consenso, y cómo se compara con los que ya conocemos.

### Avalanche {#avalanche}

La [red Avalanche](https://www.avax.network/) usa una solución completamente diferente, donde no tenemos nodos compitiendo entre sí, ni tenemos que turnarse — en cambio, se basa en comunicación constante y muestreo.

<figure>
  <img
    src="/images/blockchain-101/blockchain-safari/avalanche.webp" 
    alt="Logo de Avalanche"
    width="500"
  />
</figure>

Su mecanismo se llama el [Protocolo Snowman](https://build.avax.network/academy/avalanche-fundamentals/02-avalanche-consensus-intro/03-snowman-consensus).

> La documentación en su sitio es fantástica y muy didáctica, así que recomiendo echar un vistazo.

Se basa en una idea bellamente simple: cuando un validador necesita tomar una decisión, como el orden de dos transacciones en conflicto (como en, un intento de [doble gasto](https://en.wikipedia.org/wiki/Double-spending)), toma una muestra aleatoria de un pequeño grupo de otros validadores y pregunta "**¿qué piensas sobre esto?**".

<figure>
  <img
    src="/images/blockchain-101/blockchain-safari/snowman.webp" 
    alt="Esquema de Snowman"
    title="[zoom]"
  />
</figure>

Basado en las respuestas, el validador **podría cambiar su propia preferencia**. Y luego, pregunta a otro conjunto aleatorio de validadores. Y luego otro. Y este proceso se repite hasta que el validador se vuelve **lo suficientemente confiado** en una elección particular para finalizarla.

Lo que hace que este enfoque sea tan interesante es que **no tiene líder** (leaderless) — no hay un solo validador a cargo de proponer bloques o tomar decisiones. Cada validador está haciendo el mismo trabajo de muestreo en simultáneo, y bajo las **condiciones correctas**, todos terminan llegando a un acuerdo.

> Es una solución **metaestable** — el sistema se mueve naturalmente hacia estados de consenso, similar a cómo una pelota se moverá hacia el fondo de una colina. O en términos físicos, es como si se moviera hacia un estado de [menor potencial](https://physics.stackexchange.com/questions/328487/why-are-lower-energy-systems-stable).

Pero ese es precisamente el punto: ¿cuáles son esas **condiciones correctas**?

Para responder esto, necesitamos analizar qué sucede cuando los nodos **se salen de control**, y dejan de seguir las reglas establecidas. Llamamos a estos **nodos maliciosos**.

<figure>
  <img
    src="/images/blockchain-101/blockchain-safari/evil-woody.webp" 
    alt="Woody de Toy Story con una risa malvada"
    width="600"
  />
</figure>

Los mecanismos de consenso tradicionales como Proof of Work pueden tolerar hasta $49%$ (o realmente, $50% - 1$) nodos maliciosos. Otros, como [Tolerancia a Fallos Bizantinos Práctica](https://www.geeksforgeeks.org/computer-networks/practical-byzantine-fault-tolerancepbft/) (que no hemos cubierto en la serie), pueden resistir hasta $33%$ nodos maliciosos. Avalanche, sin embargo, solo puede manejar una fracción más pequeña — en teoría, un [máximo](https://arxiv.org/abs/2210.03423) de $\sqrt{n}$ participantes maliciosos, donde $n$ es el número total de nodos.

En principio, eso suena **peor**. Naturalmente, podemos preguntar qué hay que ganar con este sacrificio — y la respuesta es **velocidad**. Las transacciones se finalizan **realmente rápido** en Avalanche: no toma más de 1-2 segundos para que una transacción se finalice.

> Eso es como, realmente jodidamente rápido.

Entonces, ¿cómo hacemos que los nodos se comporten correctamente? Bueno, no podemos **forzarlos** a hacerlo, pero podemos poner algunos incentivos económicos en su lugar, en forma de **staking**.

Y sé lo que podrías estar pensando — pero Frank, ¿entonces no es una solución **Proof of Stake**? Bueno, en cierto sentido, sí.

Lo que quiero destacar acá es que el mecanismo general es muy diferente de, digamos, el de Ethereum. Exactamente el punto que planteaba antes: solo porque dos usen una solución Proof of Stake, no significa que **funcionen igual**.

¡Bien, así que ese es el consenso de Avalanche en pocas palabras! Es una solución **probabilística** elegante, que logra altas velocidades a costa de algunas garantías de seguridad.

Avalanche tiene algunos otros trucos bajo la manga, como su [arquitectura multi-cadena](https://build.avax.network/academy/avalanche-fundamentals/03-multi-chain-architecture-intro/01-multi-chain-architecture). Volveremos a estas ideas más tarde en la serie, pero no enfocándonos en Avalanche — ¡así que te animo a leer más sobre esta Blockchain por tu cuenta!

---

## Privacidad {#privacy}

Otro factor común en todas las Blockchains que hemos visto hasta ahora es el hecho de que son **públicas**.

Con esto, me refiero a que todos pueden ver cada transacción, cada saldo, cada billetera — **todo** es público. Después de todo, eso es parte del atractivo: el sistema es verificable por cualquiera, en cualquier momento.

Pausemos por un segundo allí, y reflexionemos sobre las implicaciones. ¿Es esto **siempre** algo bueno?

Dado que todo es público y transparente, cualquiera podría ver tu saldo. Alguien que tiene mucho dinero podría calificar como un objetivo principal para ataques. Entonces, podríamos argumentar que en este tipo de escenario, algún grado de privacidad podría ser algo bueno.

Tiempo para otra pregunta entonces: ¿cómo logramos **privacidad** en una **Blockchain pública**?

### Monero {#monero}

Si bien hay múltiples soluciones a este problema (como veremos más tarde en la serie), una de las más tempranas fue propuesta por [Monero](https://www.getmonero.org/).

<figure>
  <img
    src="/images/blockchain-101/blockchain-safari/monero.webp" 
    alt="Logo de Monero"
    width="500"
  />
</figure>

Esta Blockchain es una de las pocas redes PoW restantes. Las innovaciones centrales no están en el algoritmo de consenso — sino en cómo el diseño y la arquitectura están construidos alrededor de la idea de **privacidad por defecto**.

Monero oculta tres piezas clave de información: el **remitente** de la transacción, el **destinatario**, y la **cantidad enviada**.

> ¡Prácticamente todo!

Veamos brevemente cómo se oculta cada uno de estos elementos. Primero, hablemos del **remitente**. En circunstancias normales, un remitente simplemente necesitaría producir una **firma estándar** (ECDSA) — pero eso no oculta su identidad. Así que en su lugar, se usa una **firma en anillo**. Esencialmente, tomas un montón de claves públicas que sirven como **señuelos**, y usas una construcción que produce una firma de tal manera que no es posible distinguir al firmante real de los señuelos.

<figure>
  <img
    src="/images/blockchain-101/blockchain-safari/ring-signature.webp" 
    alt="Esquema de firma en anillo"
    title="[zoom]"
  />
</figure>

> ¡Si estás interesado, puedes encontrar más sobre los detalles específicos de este algoritmo [aquí](/es/blog/cryptography-101/signatures-recharged/#ring-signatures)!

A continuación, necesitamos ocultar el **destinatario**. Lo que queremos es evitar que alguien **vigile** nuestra dirección, y sepa sobre nuestra actividad. Y la solución es excepcionalmente simple: [direcciones stealth](https://www.getmonero.org/resources/moneropedia/stealthaddress.html). Una dirección stealth es una dirección derivada de tus pares de claves originales. A través de una **ruta de derivación**, obtienes una dirección que parece completamente no relacionada con tu dirección real, pero está **criptográficamente** vinculada a ella. ¡Y la parte inteligente es que puedes obtener fácilmente la clave privada asociada, usando la misma ruta de derivación, y tu **clave privada original** — así que efectivamente **posees** esta dirección stealth derivada!

<figure>
  <img
    src="/images/blockchain-101/blockchain-safari/derivation.webp" 
    alt="Esquema de derivación de dirección stealth"
    title="[zoom]"
  />
</figure>

Y finalmente, [RingCT](https://www.getmonero.org/resources/moneropedia/ringCT.html) (Ring Confidential Transactions) oculta la **cantidad transada**. Esto se logra a través de una técnica llamada [compromisos de Pedersen](/es/blog/cryptography-101/protocols-galore/#creating-the-commitment) para probar que una transacción es válida. ¡Es como poner tanto las entradas como las salidas de una transacción en sobres separados, y probar matemáticamente que contienen la misma cantidad de dinero — ¡sin abrir nunca el sobre!

> ¡Es una técnica bastante simple y elegante, y te animo a leer sobre ella [aquí](/es/blog/cryptography-101/protocols-galore/#creating-the-commitment)!

En general, Monero combina estas primitivas criptográficas maravillosamente, y crea un marco de privacidad de extremo a extremo: nadie puede ver quién envió fondos, quién los recibió, o cuánto se transfirió.

Aparte de no permitir lógica (no soporta Contratos Inteligentes), debemos preguntarnos cuáles son las consecuencias de este nivel de privacidad. Por ejemplo, la **auditoría** es más difícil, lo que podría plantear preocupaciones regulatorias. ¡La promesa de privacidad puede atraer usuarios no deseados buscando una plataforma donde puedan mantener sus actividades cuestionables ocultas!

<figure>
  <img
    src="/images/blockchain-101/blockchain-safari/meth.webp" 
    alt="Bryan Cranston de Breaking Bad en una escena icónica con texto 'Al carajo, voy a hacer metanfetamina'"
    width="600"
  />
</figure>

Sin embargo, desde una perspectiva puramente técnica, Monero representa una implementación verdaderamente avanzada de criptografía aplicada en Blockchain.

La privacidad es un problema difícil — y Monero muestra lo que es posible cuando la pones en el centro de tu diseño.

---

## Sidechains {#sidechains}

Para terminar por hoy, hablemos de **sidechains**.

Hace unos artículos, hablamos sobre [rollups](/es/blog/blockchain-101/rollups), o Blockchains de capa 2 (L2). La idea propuesta era simple: realizamos cálculos fuera de la cadena, pero luego comprometemos información a la Blockchain base — la capa 1 (L1) — como la fuente última de verdad.

A menudo, esto se expresa como "**la L2 hereda la seguridad de L1**". No me gusta esta forma de decirlo — es demasiado simplista, y al menos para mí, no captura la verdadera esencia del asunto.

Lo que realmente sucede es que la L2 **depende** de la L1 para avanzar — no tienen su propio mecanismo de consenso.

> Si tienes tiempo y quieres investigar, intenta buscar cosas como "mecanismo de consenso de Arbitrum" o "mecanismo de consenso de Optimism". ¡Rápidamente encontrarás que estos sistemas no tienen un mecanismo de consenso completo propio, sino una especificación de **cómo** y **cuándo** comprometer información a Ethereum!

Por "seguridad", lo que realmente queremos decir es que estas L2s dependen de la seguridad proporcionada por el mecanismo de consenso de la L1.

Con esta nueva información, es mucho más fácil definir qué es una **sidechain**: es simplemente una Blockchain **completamente independiente**, con su propio mecanismo de consenso, que elige publicar su estado actual a otra Blockchain como una especie de **punto de control**.

Entonces, ¿cuáles son algunos ejemplos de sidechains? Por casualidad, tuve una conversación sobre esto con algunos compañeros de trabajo en el momento de escribir esto, y nos encontramos con algo interesante: ¡resulta que uno de los ejemplos más citados de L2s es de hecho una **sidechain** — y es una Blockchain muy conocida!

### Polygon {#polygon}

> ¡Sí, leíste bien!

<figure>
  <img
    src="/images/blockchain-101/blockchain-safari/polygon.webp" 
    alt="Logo de Polygon"
    width="500"
  />
</figure>

La red Polygon que la mayoría de la gente usa — **Polygon PoS** — es de hecho una **sidechain**, no una capa 2.

Polygon PoS tiene su propio conjunto de validadores — alrededor de 100 de ellos — ejecutando su propio mecanismo de consenso. Estos validadores procesan transacciones, crean bloques, y aseguran la red completamente independientemente de Ethereum. Y de vez en cuando, Polygon simplemente publica estos **snapshots** a Ethereum.

Esto tiene un par de consecuencias:

- Por un lado, si Ethereum se desconecta mañana, Polygon **seguiría funcionando perfectamente**.
- Pero por otro lado, si los validadores de Polygon decidieran coludirse (es decir, trabajar juntos) y robar los fondos de todos... Bueno, **podrían**, porque la seguridad de Polygon depende de **su propio conjunto de validadores**, no de los de Ethereum.

Así que de nuevo (y no sorprendentemente por ahora), es una cuestión de **compensaciones**.

Sacrificamos un poco de **descentralización** confiando en un conjunto más pequeño e independiente de validadores, pero a cambio de **transacciones más baratas y rápidas**.

Una pregunta que puede surgir en tu mente en este punto es "**okay, pero ¿por qué publicar un snapshot a Ethereum, si Polygon es completamente independiente?**". Bueno, hay **varias razones** por las que esto podría ser importante. A saber:

- **Resolución de disputas**: si alguna vez hay una disputa importante sobre el estado de Polygon, entonces los puntos de control de Ethereum podrían servir como último recurso para resolverlos. ¡En tal escenario, **sí dependemos** de la seguridad de Ethereum!
- **Seguridad de puentes**: Para mover activos entre Ethereum y Polygon, necesitas **puentes**, porque tienen estados desconectados. Al proporcionar estos snapshots, damos a Ethereum información verificada sobre el estado de Polygon, haciendo que los puentes sean mucho más seguros.
- Garantías de salida: En teoría, si los validadores de Polygon **se volvieran maliciosos**, los usuarios podrían probar sus saldos en Polygon a través de estos puntos de control, y potencialmente **salir de vuelta** (recuperar sus tokens) a Ethereum. Sería complejo, pero en teoría, podría hacerse.

En resumen, es una cuestión de **credibilidad**.

El enfoque de Polygon ha sido **increíblemente exitoso**. Sin embargo, Polygon (la empresa) está trabajando en otras soluciones junto con su sidechain original. En particular, **Polygon zkEVM** es su último desarrollo — ¡y este es una verdadera solución L2 que [ya hemos cubierto](/es/blog/blockchain-101/rollups/#zero-knowledge-rollups)!

Aparte de las confusiones de terminología, ¡es importante entender las diferencias de diseño de estos tipos de sistemas, y las implicaciones que pueden tener!

---

## Resumen {#summary}

¡Y eso es todo por ahora!

Hemos cubierto mucho terreno hoy. Parte de la idea era mostrar cuánta diversidad hay en el mundo Blockchain. ¡Creo que es crucial familiarizarse con las ideas y conceptos centrales que existen para navegar mejor este campo!

> ¡Solo espero que no haya sido terriblemente confuso!

Lo que está claro es que no hay una única solución que sirva para todo en el diseño de Blockchain — o al menos no **todavía**. Cada elección implica compensaciones, y diferentes aplicaciones requieren diferentes enfoques. EUTXO intercambia interacciones de estado complejas por paralelización. Ripple intercambia descentralización por velocidad. Avalanche intercambia seguridad por velocidad. Polygon intercambia algo de seguridad por rendimiento. Y el caso de Monero es un poco diferente, porque hay un debate moral más sutil alrededor.

<figure>
  <img
    src="/images/blockchain-101/blockchain-safari/tough-decisions.webp" 
    alt="Un letrero que dice 'decisiones difíciles por delante'"
    width="600"
  />
</figure>

Entender estas compensaciones es clave para navegar el panorama web3.

> ¡Y al menos para mí, llegar a entenderlas es una de las razones por las que encuentro este tema tan fascinante!

Incluso después de este compendio de nuevas ideas, todavía tenemos mucho por cubrir.

La próxima vez, echaremos un vistazo a la **paralelización** en Blockchain, y cubriremos dos soluciones modernas: **Aptos** y **Sui**.

¡Hasta entonces!
