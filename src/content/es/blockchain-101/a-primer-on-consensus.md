---
title: "Blockchain 101: Una Introducción al Consenso"
date: "2024-09-25"
author: "frank-mangone"
thumbnail: "/images/blockchain-101/a-primer-on-consensus/smaug.webp"
tags: ["blockchain", "bitcoin", "consensus", "proofOfWork", "mining"]
description: "Cambiemos nuestro enfoque a cómo un sistema descentralizado puede acordar una única verdad: a través del consenso."
readingTime: "10 min"
mediumUrl: "https://medium.com/@francomangone18/blockchain-101-a-primer-on-consensus-505388eaee80"
---

> Esto es parte de una serie más larga de artículos sobre Blockchain. Si este es el primer artículo que encuentras, te recomiendo comenzar desde el [inicio de la serie](/es/blog/blockchain-101/how-it-all-began).

En teoría, tenemos todos los componentes que necesitamos para construir una Blockchain. Ya sabemos cómo se estructuran las [transacciones](/es/blog/blockchain-101/transactions) (al menos en Bitcoin), y cómo se [agrupan en bloques y se encadenan](/es/blog/blockchain-101/how-it-all-began/#a-chain-of-blocks) para formar la estructura que nombramos tan acertadamente.

Aunque podemos unir la estructura, una Blockchain es **mucho más** que eso. Recuerda que el objetivo principal era construir una historia compartida de eventos — por lo tanto, la forma en que se almacenan los datos es **tan importante** como entender cómo dicha historia **evoluciona** o **crece** a lo largo del tiempo.

Dado que cada participante en la red tiene una copia de toda la Blockchain, es crucial que todos **estén de acuerdo** sobre cómo deberían evolucionar estas copias separadas. Pero, ¿cómo lo hacen?

Las estrategias utilizadas por los pares en la red — o nodos — para acordar una historia compartida se conocen como **mecanismos de consenso**, ¡que será el tema de hoy!

Los mecanismos de consenso vienen en diferentes sabores. Tendremos mucho tiempo para examinar algunos de ellos. Por ahora, dado que solo hemos cubierto Bitcoin hasta el momento, veamos cómo esta Blockchain en particular resuelve este problema.

Antes de entrar en lo sustancial, quiero reiterar esta idea, para que la tengan siempre presente:

::: big-quote
Una Blockchain no es solo la estructura de datos real, sino también la red de participantes que se comunican entre sí y acuerdan cómo evoluciona el sistema a lo largo del tiempo.
:::

> Además de algunas cosas más.

Con esto en mente, ¡veamos de qué se trata todo esto!

---

## Un ejemplo simplificado {#a-toy-example}

Supongo que podríamos comenzar preguntándonos: ¿cómo interactúan entre sí los participantes de la red (nodos)? Lo hacen a través de un **protocolo de mensajería**. No quiero adelantar el final aquí, comencemos con un ejemplo más simple.

Siguiendo nuestras tradiciones, supongamos que Alicia, Bruno y Carlos quieren establecer una red Blockchain entre ellos.

Sin embargo, esta vez no estarán en un chat grupal, y no tendrán una hoja de cálculo. En cambio, cada uno de ellos simplemente escuchará los mensajes de cualquiera de los otros participantes.

Y por el momento, podemos suponer que estos mensajes que se envían entre sí no serán otra cosa que **nuevos bloques**.

<figure>
  <img
    src="/images/blockchain-101/a-primer-on-consensus/block-transmission.webp" 
    alt="Alicia enviando bloques a otros participantes"
    title="[zoom]"
    className="bg-white"
    width="500"
  />
</figure>

> Algunos de ustedes pueden estar pensando: pero espera, ¿no necesitamos transacciones para construir bloques? Y estás completamente en lo cierto. Ten la seguridad de que pronto aprenderemos sobre dónde se almacenan las transacciones y cómo se comunican a la red.

Por supuesto, estos bloques deben ser **válidos**. Esto significa que deben apuntar al último bloque de la cadena, y que deben tener un **hash válido**. Recuerda que el hash está estrechamente relacionado con un [rompecabezas criptográfico](/es/blog/blockchain-101/how-it-all-began/#working-for-blocks), que también sirve como medida para aleatorizar tanto **quién** encuentra un bloque válido, como **cuándo** lo encuentra.

<figure>
  <img
    src="/images/blockchain-101/a-primer-on-consensus/nonce-variation.webp" 
    alt="Hashing con un nonce"
    title="[zoom] El nonce se cambia hasta encontrar un hash válido"
    className="bg-white"
    width="700"
  />
</figure>

Supongamos que esta aleatoriedad es suficiente para garantizar que los bloques válidos **nunca se produzcan al mismo tiempo**.

> Quiero enfatizar que esto no es suficiente en un entorno más general, pero veremos por qué más adelante en este artículo.

¿Qué podría salir mal en un sistema tan simple? Resulta que... **prácticamente todo**.

<figure>
  <img
    src="/images/blockchain-101/a-primer-on-consensus/eeek.webp" 
    alt="Un hámster chillando en pánico"
    title="¡Aaaah!"
    width="350"
  />
</figure>

Aquí, aquí, déjame explicarte.

¿Recuerdas ese rompecabezas criptográfico del que hemos estado hablando? Bueno, implica **calcular hashes**. La versión corta de la historia es que si una persona puede calcular hashes **más rápido** que los otros en la red, entonces esa persona siempre tiene una mayor probabilidad de encontrar el siguiente bloque válido.

> Para reforzar esta idea, llévalo a un extremo: Bruno tiene una supercomputadora en su patio trasero, mientras que Alicia y Carlos calculan hashes usando sus portátiles. Está bastante claro quién ganará esta carrera.

¿Puedes ver el problema ahora? Con suficiente poder de cómputo, Bruno siempre podría adelantarse a Alicia y Carlos, y esencialmente ser el **único productor de bloques en la red**. Un sistema centralizado.

<figure>
  <img
    src="/images/blockchain-101/a-primer-on-consensus/you-swore.webp" 
    alt="Obi-Wan con el icónico 'Te has convertido en aquello que juraste destruir'"
    title="¿Por qué Bruno, por qué?"
  />
</figure>

Este es un tipo de **ataque** muy conocido contra Bitcoin: un [ataque del 51%](https://hacken.io/discover/51-percent-attack/). En un sistema con solo 3 nodos, es plausible que esto suceda. Pero a medida que **ampliamos la red** a miles de nodos, se vuelve cada vez más difícil que un solo nodo sea tan poderoso, o que una sola entidad controle tantos nodos.

Parece que este primer problema es solo una cuestión de **escala**. Así que ampliemos la red, y veamos qué sucede.

---

## Una red más grande {#a-bigger-network}

Como es de esperar, Bitcoin es una [red grande](https://bitnodes.io/).

Puede que no sorprenda que en este escenario, los nodos no se comunican con todos los demás. Sería poco práctico, ya que la única forma de hacerlo sería mantener una lista de **todos** los nodos disponibles, que puede cambiar con el tiempo y sería bastante grande.

En cambio, lo que sucede es que los nodos mantienen una **lista corta** de otros nodos conocidos. Al recibir un mensaje, lo **transmiten** a los nodos en esa lista. Y luego, cada receptor transmite el mensaje a su propia lista de nodos conocidos. Se repite el proceso, y en algún momento, todos en la red recibirán el mensaje. Esto se conoce como **protocolo de chismes** (gossip protocol).

<figure>
  <img
    src="/images/blockchain-101/a-primer-on-consensus/gossiping.webp" 
    alt="Chismorreo en acción"
    title="[zoom] Es fácil ver cómo el número de receptores crece exponencialmente rápido"
    className="bg-white"
    width="600"
  />
</figure>

> Para una vista más interactiva, mira este [simulador realmente genial](https://ctufaro.github.io/GossipPlot/index.html) de cómo los mensajes se chismorrearían en una red.

Aquí hay una complicación: **chismorrear lleva tiempo**. Esto es algo que no tuvimos que tener en cuenta en nuestro sistema con 3 participantes.

Imagina entonces esta situación:

- El nodo 1 (llamémosle Alicia) encuentra un bloque válido $A$, y lo transmite.
- Unos momentos después, el nodo 2 (Bruno) encuentra otro bloque válido $B$, pero aún no ha recibido el bloque de Alicia. Debido a esto, también transmite el nuevo bloque.
- El nodo 3 (Carlos), que está en algún lugar intermedio, recibe dos bloques válidos. Ambos son candidatos válidos para ser el siguiente bloque en la cadena.

> Consejo: otra forma de referirse a esto es tener dos bloques a la misma **altura**.

<figure>
  <img
    src="/images/blockchain-101/a-primer-on-consensus/two-valid-blocks.webp" 
    alt="Carlos recibiendo dos bloques válidos, sin saber cuál aceptar"
    title="[zoom] Tanto el bloque rosa como el púrpura son válidos - ¿cuál elegimos?"
    className="bg-white"
  />
</figure>

¿Y ahora qué? ¿Cuál es el **correcto**?

Solo observando el bloque, **no hay forma de saberlo**. En consecuencia, **ambos** deben adjuntarse al final de nuestra cadena. Lo que está claro es que este estado no debe perdurar en el tiempo: el objetivo de las Blockchains es establecer una **única historia compartida**.

Esta situación se conoce como una **bifurcación temporal** o **división de cadena**.

> No confundir con soft forks o hard forks. Veremos esos en el futuro.

### Resolución de bifurcaciones {#fork-resolution}

Lo creas o no, todo lo que Carlos necesita hacer en este escenario es **esperar**. Sí.

Algunos nodos en la red adjuntarán el bloque de Alicia a sus Blockchains, y algunos nodos habrán adjuntado el de Bruno. Carlos no es una excepción: elegirá cualquiera que reciba primero, pero también llevará un registro de la otra bifurcación divergente.

Comenzarán a trabajar en encontrar el siguiente bloque válido inmediatamente después: no hay tiempo que perder, como veremos en un minuto.

Así que esto se convierte en una cuestión de **qué bifurcación crece más rápido**. De manera similar al ataque del 51%, si la mayoría de la red ha añadido el bloque $A$, entonces es muy probable que aparezca un nuevo bloque más rápido en esa bifurcación, y no en la que contiene $B$.

Y si la mayoría está trabajando en una bifurcación y no en la otra, entonces dicha bifurcación eventualmente será la única que crezca, y la bifurcación obsoleta morirá naturalmente.

::: big-quote
En resumen: una bifurcación crecerá más rápido.
:::

Otra forma de decirlo es que una bifurcación tiene más **trabajo computacional** en ella, porque se ha puesto más esfuerzo en encontrar los hashes correctos. Esta es la razón por la que este mecanismo de consenso se llama **Prueba de Trabajo** (Proof of Work).

<figure>
  <img
    src="/images/blockchain-101/a-primer-on-consensus/longer-chain.webp" 
    alt="La cadena más larga es la aceptada, ¡porque tiene más trabajo!"
    title="[zoom]"
    className="bg-white"
  />
</figure>

En resumen, después de esperar un tiempo, Carlos verá que la bifurcación $A$ crece más rápido, y se quedará con ella porque es en la que trabaja la **mayoría de los nodos**. Se queda con lo que se suele llamar la **cadena canónica**.

Si Carlos estaba trabajando en encontrar el siguiente bloque en la bifurcación $B$, querrá **cambiar a la bifurcación** $A$, y descartar la bifurcación $B$. Esto se llama [reorg](https://learnmeabitcoin.com/technical/blockchain/chain-reorganisation/) (abreviatura de **reorganización**).

> Y en caso de que te lo preguntes, las transacciones en la bifurcación $B$ se pierden para siempre después de una reorganización. Esto puede y **ocurre** en Bitcoin.
>
> La buena noticia es que todo lo que tienes que hacer para remediar esta situación es volver a enviar la transacción.

Esto tiene una consecuencia negativa: no hay garantía de que una transacción se incluya efectivamente en la Blockchain una vez que vive en un bloque, porque pueden ocurrir reorganizaciones. Tenemos que esperar a que existan suficientes bloques **después** de aquel donde se incluye la transacción.

Esto se conoce como esperar **confirmaciones de bloque**, y es un patrón muy común en algunos mecanismos de consenso. Probablemente volveremos a esto cuando discutamos la **finalidad de bloque**.

<figure>
  <img
    src="/images/blockchain-101/a-primer-on-consensus/confirmations.webp" 
    alt="Es menos probable que un bloque sea reorganizado si hay muchos bloques después de él"
    title="[zoom] ¡Una vez que se colocan suficientes bloques encima de nuestro bloque objetivo, las posibilidades de reorganización se vuelven muy escasas!"
    className="bg-white"
  />
</figure>

---

¡Maravilloso! Esta estrategia de **Prueba de Trabajo** (PoW) nos permite resolver bifurcaciones temporales y seguir haciendo crecer la red. También resulta útil contra personas que intentan hacer cosas desagradables como controlar qué transacciones se incluyen en la Blockchain o no: simplemente no tienen suficiente poder de cómputo para vencer al resto de los nodos juntos.

Pero queda una pregunta... ¿Por qué alguien querría gastar sus recursos de cómputo en encontrar nuevos bloques? ¿Por qué no usar sus potentes máquinas para jugar a Fortnite en 4K?

<figure>
  <img
    src="/images/blockchain-101/a-primer-on-consensus/shrek.webp" 
    alt="Shrek señalando con su dedo y sonriendo"
    title="En realidad no es una mala idea"
    width="600"
  />
</figure>

Ahí es donde entra la última pieza del rompecabezas: deben poder **ganar algo** por hacer esto — deben tener un **incentivo**.

---

## Incentivos {#incentives}

Bitcoin sí tiene tal incentivo. Encontrar el siguiente bloque válido te da una pequeña recompensa en forma de — probablemente lo adivinaste — **Bitcoin**!

<figure>
  <img
    src="/images/blockchain-101/a-primer-on-consensus/smaug.webp" 
    alt="Smaug de El Hobbit, con mucho oro detrás de él"
    title="Genial"
    width="600"
  />
</figure>

En este punto, puedes preguntarte **de dónde demonios** viene esa recompensa. No hay una autoridad central que pueda pagarla. ¿Qué es entonces, se genera de la nada?

> En este punto, puedes preguntarte de dónde demonios viene esa recompensa. No hay una autoridad central que pueda pagarla. ¿Qué es entonces, se genera de la nada?

Los bloques incluyen un montón de transacciones "normales". Lo que no mencionamos hasta ahora es que también incluyen una **especial**, llamada la **transacción coinbase**.

<figure>
  <img
    src="/images/blockchain-101/a-primer-on-consensus/coinbase.webp" 
    alt="Transacción coinbase en un bloque"
    title="[zoom]"
    className="bg-white"
    width="600"
  />
</figure>

La transacción coinbase simplemente acredita algunos Bitcoin (en forma de UTXOs) a la dirección (o direcciones) del creador del bloque, como recompensa por su arduo trabajo. No cualquier cantidad arbitraria de Bitcoin, sin embargo — la **recompensa del bloque** está compuesta por:

- Una cantidad base llamada el **subsidio del bloque**, que a partir de 2024, es [exactamente 3.125 BTC](https://river.com/learn/terms/c/coinbase/#:~:text=which%20is%20currently%203.125%20BTC%20per%20block),
- Una **tarifa** por las transacciones incluidas en el bloque. Volveremos a esto en futuros artículos, pero esta cantidad es variable.

> Por cierto: BTC es la abreviatura de Bitcoin. A menudo se utiliza como símbolo de la moneda, de la misma manera que USD se usa a menudo como símbolo para los Dólares de Estados Unidos.

En otras palabras: sí, nuevos Bitcoin son **generados mágicamente** por cada bloque producido.

<figure>
  <img
    src="/images/blockchain-101/a-primer-on-consensus/stonks.webp" 
    alt="Meme de Stonks"
    width="600"
  />
</figure>

Y es por eso que el proceso de encontrar nuevos bloques válidos se llama **minería**. ¡Es como si estuvieras minando nuevos Bitcoin!

Notablemente, esto no significa que la cantidad de Bitcoin seguirá creciendo sin límites. En momentos determinados en el tiempo, el subsidio se **reduce a la mitad**, en un evento conocido como el [halving de Bitcoin](https://www.coinbase.com/bitcoin-halving). Esto hace que la cantidad total de Bitcoin que jamás se generará esté [limitada a 21 millones](https://www.kraken.com/learn/how-many-bitcoin-are-there-bitcoin-supply-explained).

> Esto es porque, matemáticamente, este comportamiento corresponde a una [serie geométrica](https://es.wikipedia.org/wiki/Serie_geom%C3%A9trica). Bajo ciertas condiciones, las series geométricas convergen a un valor finito — ese es el caso de Bitcoin, y ese valor es la emisión máxima que jamás habrá.

---

## Resumen {#summary}

¡Bien, hagamos un recuento rápido!

A estas alturas, sabemos:

- Cómo se estructuran las transacciones, cómo se combinan en bloques y cómo los bloques se vinculan entre sí formando la Blockchain.
- Cómo una red de participantes está incentivada para continuar haciendo crecer la red, utilizando un sistema que no se basa en vibraciones de **confía en mí**, sino en un poderoso mecanismo de consenso.
- Qué es la **minería**: encontrar un nuevo bloque y cosechar su recompensa.

¡Diría que hemos recorrido un largo camino en estos tres primeros artículos! Todo lo que queda es cubrir algunas brechas en cómo opera Bitcoin, y mayormente habremos terminado con esta Blockchain.

Es importante explicar estos detalles faltantes ahora, porque estas son ideas que en su mayoría se repetirán en otros sistemas. Es una bendición que podamos centrarnos en estos conceptos ahora, antes de que las cosas se vuelvan más complejas.

Y así, ¡te veré en el próximo artículo para los [toques finales sobre Bitcoin](/es/blog/blockchain-101/wrapping-up-bitcoin)!
