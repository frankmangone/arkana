---
title: "Blockchain 101: Redondeando de Bitcoin"
date: "2024-10-15"
author: "frank-mangone"
thumbnail: "/images/blockchain-101/wrapping-up-bitcoin/inception.webp"
tags: ["blockchain", "bitcoin", "transactions", "consensus"]
description: "Con este cuarto artículo, finalizamos nuestro breve recorrido por Bitcoin analizando algunos puntos clave faltantes."
readingTime: "10 min"
mediumUrl: "https://medium.com/@francomangone18/blockchain-101-wrapping-up-bitcoin-c01cb572021e"
---

> Esto es parte de una serie más larga de artículos sobre Blockchain. Si este es el primer artículo que encuentras, te recomiendo comenzar desde el [inicio de la serie](/es/blog/blockchain-101/how-it-all-began).

Hace algunos años, cuando no sabía mucho sobre Blockchain, recuerdo sentir que el conocimiento estaba envuelto en una especie de velo de misterio. Supongo que la razón era que una comprensión básica involucraba muchos conceptos y términos nuevos, y tenía que asimilar algunas ideas que no se sentían del todo naturales como usuario de sistemas más tradicionales.

Pero a estas alturas, ya hemos cubierto la mayoría de los conceptos básicos. Sabemos qué son las [transacciones](/es/blog/blockchain-101/transactions), cómo se [firman](/es/blog/blockchain-101/transactions/#private-and-public-keys) y se [agrupan en bloques](/es/blog/blockchain-101/how-it-all-began/#a-chain-of-blocks), que luego son [distribuidos a través de la red](/es/blog/blockchain-101/a-primer-on-consensus/#a-bigger-network), y gracias a un [mecanismo de consenso](/es/blog/blockchain-101/a-primer-on-consensus), todos pueden hacer crecer su copia separada de la Blockchain sabiendo que será consistente con la de sus pares.

Con estas herramientas, deberíamos entender suficiente de la jerga (o lenguaje específico) para avanzar hacia otros sistemas Blockchain.

Sin embargo, hay muchos huecos que necesitamos llenar para que esta historia de Bitcoin esté completa. Antes de pasar a otras tecnologías, quiero dedicar este artículo a intentar cubrir estas preguntas pendientes. Y así, este artículo será una especie de **popurrí** de conceptos y discusiones, para cerrar el capítulo de Bitcoin.

Una breve nota: por supuesto que no estoy cubriendo **todo** lo que hay que saber sobre Bitcoin aquí. Lo más probable es que aún tengas algunas preguntas después de leer estos primeros cuatro artículos, y eso está perfectamente bien. De nuevo, las Blockchains son sistemas complejos — hay mucho que aprender. ¡Todo lo que puedo decir es que no hay mejor manera de aprender que seguir tu propia curiosidad!

> ¡Pero hey, también estoy aquí para ayudar! ¡Déjame saber cualquier pregunta que tengas!

Después de una introducción bastante larga, ¡vamos!

---

## Enviando una Transacción {#submitting-a-transaction}

La teoría es genial — nodos, consenso, todas las cosas buenas. Pero, ¿cómo **usamos** realmente Bitcoin? Esta es una red que debería ser utilizable por cualquiera, siempre que tenga una [billetera](/es/blog/blockchain-101/transactions/#addresses-and-wallets).

Para que una transacción sea procesada, debe ser recibida por un nodo en la red, y luego **transmitida** a través del protocolo de gossiping del que ya hemos hablado.

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-bitcoin/gossiping.webp" 
    alt="El mecanismo de gossiping en acción"
    title="[zoom]"
    className="bg-white"
  />
</figure>

Hay dos opciones aquí:

- si tenemos un **nodo de Bitcoin** ejecutándose en nuestra computadora, podemos enviar la transacción directamente usando un comando; algo como esto:

```bash
$ bitcoin-cli sendrawtransaction "0x123ce9819addce1878144fae..."
```

- de lo contrario, necesitamos una forma de **anunciar** nuestra transacción firmada a un nodo — esto significa que el nodo necesita exponer alguna manera para que los usuarios se comuniquen con él.

> La mayoría de las personas solo quieren usar Bitcoin, y no están ejecutando un nodo - así que el segundo escenario es el más común.

¿Y cómo exponemos un programa a internet? A través de una [API](https://en.wikipedia.org/wiki/Web_API), ¡por supuesto!

Los nodos de Bitcoin pueden configurarse para exponer lo que se llama una API de [Remote Procedure Call](https://mobterest.medium.com/demystifying-remote-procedure-calls-rpc-for-beginners-a-comprehensive-guide-7e639c92ea17) (o **RPC**). A través de esta API, los usuarios pueden enviar una **llamada** (por ejemplo, "enviar transacción"), que luego será ejecutada por el nodo.

> Algunas plataformas como [Quicknode](https://www.quicknode.com/docs/bitcoin) incluso exponen esta API como servicio.

### El Viaje de una Transacción {#a-transactions-journey}

Entonces, acabas de anunciar tu transacción a un **único nodo**. En este punto, este es el único nodo en la red que conoce tu transacción.

Pero recuerda, las probabilidades de que dicho nodo encuentre un bloque válido son similares a las de **ganar la lotería**. En otras palabras, es poco probable que bajo estas condiciones, tu transacción sea incluida en un bloque pronto.

Entonces... ¿Cómo logra Bitcoin incluir nuestras transacciones? ¿Aliens?

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-bitcoin/aliens.webp" 
    alt="No digo que fuimos nosotros... Pero fuimos nosotros"
    title="Por supuesto que siempre son aliens"
    width="600"
  />
</figure>

Resolver esto es tan simple como **transmitir las transacciones**, al igual que los bloques. Y una vez que un nodo recibe una transacción, la coloca en una especie de **bolsa**, llamada **pool de transacciones** o **mempool**.

Esto es como una **sala de espera**. Cada nodo decidirá qué transacciones quiere incluir en un bloque, y luego comienza a minar.

> Usualmente, seleccionan las transacciones que les dan un mejor incentivo — recuerda que hay una recompensa asociada a cada transacción.

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-bitcoin/transaction-pool.webp" 
    alt="Transacciones fluyendo hacia el pool de transacciones"
    title="[zoom]"
    className="bg-white"
  />
</figure>

Finalmente, al recibir un bloque, cada nodo **verificará** y **procesará** las transacciones en él, para llegar al **nuevo estado** de la red. Al hacerlo, verificará si alguna de las transacciones incluidas está presente en el mempool, y eliminará cualquier duplicado.

> Es un proceso de limpieza importante que evita el uso innecesario de memoria.

Y, como dicen, el resto es historia.

---

## Una Mirada más Cercana a los Bloques {#a-closer-look-at-blocks}

Hasta ahora, nuestro modelo mental para los **bloques** ha sido el de una **caja** que contiene un montón de **transacciones**, un **nonce**, y un **hash** que apunta al bloque anterior. Si bien esto no está lejos del modelo real, hemos sido bastante flexibles al definir algunos puntos.

Echemos un vistazo más de cerca. Por ejemplo, ¿qué más podemos decir sobre ese **hash** en nuestros bloques?

Desde nuestra perspectiva actual, todo lo que nos importa es poder **apuntar al bloque anterior**, formando así la Blockchain misma. Estamos pensando en este hash como un **identificador** (que lo es), que debería estar determinado únicamente por las transacciones incluidas en un bloque.

Lo que no estamos pensando es en la **eficiencia de lectura**. Imagina esto: quieres verificar si una transacción que publicaste hace un tiempo está incluida en la Blockchain. Es tan fácil como leer bloques y verificar si tu transacción está allí o no, ¿verdad?

Bueno, sí — pero considerando que los bloques pueden tener hasta un par de miles de transacciones por bloque, ¡podrías estar gastando tiempo innecesario leyendo a través de una larga lista de transacciones que no te importan!

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-bitcoin/spongebob-scroll.webp" 
    alt="Bob Esponja leyendo un pergamino muy largo"
    width="450"
  />
</figure>

Hay una forma muy especial en la que podemos organizar las transacciones para proporcionar una manera más eficiente de leerlas: usando [árboles de Merkle](/es/blog/cryptography-101/hashing/#merkle-trees).

> Ya he hablado sobre estos en la serie [Cryptography 101](/es/reading-lists/cryptography-101), específicamente en [este artículo](/es/blog/cryptography-101/hashing). ¡Para una mejor comprensión de la estructura, sugiero revisar eso!

Con los árboles de Merkle, lo que podemos hacer es generar una **prueba corta** del hecho de que una transacción está incluida en un bloque. Para esto, primero necesitamos calcular lo que se llama una **raíz de Merkle** a partir de todas las transacciones:

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-bitcoin/merkle-tree.webp" 
    alt="Un árbol de merkle"
    title="[zoom] La raíz de Merkle se calcula hasheando dos hojas a la vez, hasta obtener un único hash"
  />
</figure>

La raíz de Merkle funciona como una especie de **huella digital** para las transacciones con las que comenzamos — cambia una **sola transacción**, y la raíz cambia completamente. Pero esto no es lo único interesante que aporta: también nos permite crear una **prueba** de que una transacción está asociada a una **raíz**, sin proporcionar todas las transacciones iniciales.

> ¡De nuevo, los detalles sobre el proceso están [aquí](/es/blog/cryptography-101/hashing/#merkle-trees)!

No estoy seguro si esto es suficiente para convencerte, pero sí, la raíz de Merkle es realmente importante para la lectura eficiente de bloques. También es importante para la gestión eficiente de memoria de los nodos.

¡Incluyámosla entonces! Pero **¿dónde**?

### Organizando Bloques {#organizing-blocks}

¿Qué tal si organizamos la información contenida en un bloque un poco? Hay al menos **dos tipos obvios** de datos que queremos almacenar en un bloque:

- **Transacciones**, que son lo que impulsa el sistema hacia adelante,
- **Otros datos** que se utilizan para diferentes propósitos, pero principalmente, **verificación**.

Y así, podemos separar los bloques en dos partes: el **encabezado**, donde viven estos otros datos, y el **cuerpo**, que contiene las transacciones.

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-bitcoin/block-structure.webp" 
    alt="Un bloque, dividido en cuerpo y encabezado"
    title="[zoom] Ahora esto está más cerca de cómo se ve un bloque"
    className="bg-white"
    width="600"
  />
</figure>

> Nota que hay un par de cosas más en los encabezados. No te preocupes por esas — ¡solo recuerda que son necesarias para un correcto funcionamiento de la red!

Esto prácticamente redondea los detalles técnicos que quería presentar en esta breve introducción a Bitcoin. Para un giro, inclinémonos ahora hacia aspectos más filosóficos de la tecnología.

---

## ¿Es Bitcoin Bueno? {#is-bitcoin-good}

Como tecnología, Bitcoin fue revolucionario sin duda, y pavimentó el camino para que surgiera una miríada de nuevas tecnologías, trayendo nuevos y diversos paradigmas a la mesa.

Pero ciertamente hubo dudas. Diablos, **todavía** hay muchas dudas al respecto.

Y supongo que la pregunta **"¿es Bitcoin bueno?"** puede interpretarse de varias maneras: ¿ha resistido la tecnología la prueba del tiempo a lo largo de estos primeros 15 años desde su concepción? ¿Es lo suficientemente eficiente en comparación con otras tecnologías? ¿**Realmente** vale la pena como alternativa a los enfoques centralizados tradicionales?

Intentaré abordar algunas de esas, pero estos son solo mis pensamientos y opiniones (y ocasionalmente, algunos hechos). Estas preguntas no tienen una única respuesta, por supuesto — solo toma el resto de este artículo con un grano de sal.

### Consumo de Energía {#energy-consumption}

Uno de los principales puntos de debate alrededor de las Blockchains (y particularmente, las Blockchains de **Prueba de Trabajo**) es que mantener la red consume mucha energía. Un enorme esfuerzo computacional se dedica a resolver un rompecabezas por **prueba y error**, lo que significa que la mayoría de la energía simplemente se desperdicia en **intentos fallidos**.

Esto se traduce en que Bitcoin consume **mucha** electricidad. ¿Cuánta, te preguntarás? Según algunas fuentes [aquí](https://digiconomist.net/bitcoin-energy-consumption) y [aquí](https://ccaf.io/cbnsi/cbeci), suficiente para alimentar un país aproximadamente del tamaño de Polonia. Generar esta energía también contribuye con **emisiones de carbono**, que se consideran dañinas para el medio ambiente.

> Es importante nunca perder la perspectiva sin embargo — la aviación global tiene una huella de carbono al menos [diez veces mayor](https://www.sustainabilitybynumbers.com/p/aviation-climate-part-one#:~:text=This%20is%20shown%20in%20the%20chart%20%E2%80%93%20one%20line%20shows%20CO2%20emissions%20only%2C%20and%20the%20other%20is%20shown%20in%20CO2%2Dequivalents%2C%20with%20altitude%20impacts%20included.), y aún así solo representa alrededor del 3% de las emisiones globales de carbono. ¡Así que si es el medio ambiente lo que nos preocupa, tal vez hay otras cosas en las que deberíamos enfocarnos!

Ya sea que te importen o no las cosas que señalé antes, lo que está claro es que Bitcoin es **ineficiente** en cómo asigna recursos computacionales. ¡Diablos, incluso hay una casa de baños en Nueva York que [usa el calor residual de la minería de Bitcoin para calentar su agua](https://www.reddit.com/r/Bitcoin/comments/14gtlzl/new_yorks_bath_house_spa_uses_bitcoin_miners_to/)!

Es natural preguntarnos: **¿podemos hacerlo mejor**? Otras Blockchains han cambiado paradigmas para tratar de hacer sus redes más eficientes, como veremos en futuros artículos.

### Velocidad {#speed}

Los bloques en Bitcoin se producen aproximadamente [cada 10 minutos](https://www.coinbase.com/learn/crypto-basics/bitcoin-block-reward-block-size-block-time-whats-the-difference#:~:text=process%20larger%20blocks.-,What%20is%20Bitcoin%20Block%20Time%3F,-Block%20time%20refers). Esto fue elegido para tratar de lograr un buen equilibrio entre qué tan rápido se crean nuevos bloques, y el tiempo necesario para que los validadores reciban nuevos bloques, los validen y los añadan a sus Blockchains.

> La espera puede ser incluso más larga si queremos un cierto número de **confirmaciones** encima del bloque que incluye nuestras transacciones.

Supongo que la pregunta correcta es: ¿es Bitcoin lo **suficientemente rápido**? Y honestamente, la respuesta es que **depende**.

Cuando pagas tu café matutino en Starbucks, donde necesitas usar tu tarjeta en un POS y esperar el mensaje de "aprobado". Esto no debería tomar más de unos segundos. Bitcoin ciertamente **no es adecuado** para eso.

Pero ¿qué hay de los pagos transfronterizos, u operaciones que pueden tomar días? Esperar media hora no se ve **tan mal** en comparación con esos, ¿eh?

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-bitcoin/inception.webp" 
    alt="Leo DiCaprio sospechoso de Inception"
    title="Ya veo lo que hiciste ahí"
    width="600"
  />
</figure>

Y no olvidemos: esta demora, aunque puede verse como un costo, viene con el beneficio de una transacción **inmutable** e **imparable**. Lo que me lleva al siguiente punto.

### Centralización vs Descentralización {#centralization-vs-decentralization}

Finalmente, la pregunta es... ¿Nos importa siquiera la inmutabilidad? ¿Nos importa que nadie pueda impedirnos enviar una transacción? ¿Queremos ese tipo de poder?

De nuevo... Depende. A veces, es bueno tener un banco que pueda hacerse cargo de una situación que involucre robo, o queremos poder darles una llamada telefónica y amablemente pedir que reviertan una transferencia que fue enviada a una cuenta equivocada.

En Bitcoin, esto simplemente no es posible. ¿Escribiste mal el destinatario de tu transacción? Mala suerte, amigo. ¿Te robaron tus claves? Despídete de tus fondos.

Tener tanto poder sobre tus finanzas tiene un costo, como una vez Spiderman escuchó del Tío Ben:

::: big-quote
Un gran poder conlleva una gran responsabilidad
:::

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-bitcoin/crying-peter.webp" 
    alt="Peter Parker llorando"
    width="600"
  />
</figure>

> Incluso hay un tipo que tenía 7500 BTC y los perdió, porque su clave estaba en un disco duro que [tiró a la basura](https://news.bitcoin.com/british-man-who-lost-7500-btc-sues-for-right-to-search-council-landfill/). Y realmente no hay mucho que hacer al respecto.

En resumen: la decisión de usar Bitcoin depende de si estás dispuesto a manejar tu dinero bajo tu propio riesgo. Algunas personas prosperan haciendo esto, mientras que otras preferirían una solución que ofrezca otras garantías. Y también hay puntos intermedios, como tener algo de dinero en bancos y algo de dinero en Bitcoin.

Pero a algunos bancos realmente no les gustan las criptomonedas como Bitcoin (hablaremos de otras en futuros artículos), y pueden optar por cerrar tu cuenta si detectan actividad sospechosa (y por sospechosa, ellos entienden **cripto**).

La regulación alrededor de estas cosas ha sido una especie de montaña rusa de emociones a lo largo de los años, y varía de país a país. Es difícil decir dónde terminará todo. ¡Solo el tiempo lo dirá!

---

## Resumen {#summary}

Con esto, hemos cubierto prácticamente todo lo que quería tocar sobre Bitcoin. Todavía hay más por aprender por supuesto, pero creo que este es un buen lugar para detenernos. Si quieres una **inmersión completa** en Bitcoin, te sugiero leer [Mastering Bitcoin](https://www.amazon.com/Mastering-Bitcoin-Programming-Open-Blockchain/dp/1098150090).

---

Originalmente, Bitcoin se propuso resolver un **único problema**: crear un sistema de **dinero digital** descentralizado. En eso, tuvo éxito.

En realidad, podemos querer crear otros tipos de **aplicaciones descentralizadas**. En este sentido, Bitcoin no posee tanta diversidad, ya que está diseñado para representar solo efectivo.

¿Qué pasa si queremos, por ejemplo, crear un sistema de votación descentralizado? ¿O si queremos tener múltiples monedas? ¿O si queremos hacer préstamos en la Blockchain?

Podríamos diseñar otro tipo de sistema de transacciones adaptado para cualquiera de esos propósitos. Pero a medida que se nos requiere construir más y más tipos diferentes de aplicaciones, tal enfoque rápidamente se vuelve impráctico.

Para acomodar nuestras necesidades, necesitaríamos algo como una **Blockchain programable**. Un sistema que resuelva el consenso, pero nos permita crear diversas aplicaciones dependiendo de nuestro caso de uso. Un sistema que pueda manejar un **estado generalizado**.

Esto es lo que los creadores de [Ethereum](https://ethereum.org/en/) se propusieron resolver [allá por 2013](https://en.wikipedia.org/wiki/Ethereum#:~:text=Ethereum%20was%20conceived%20in%202013%20by%20programmer%20Vitalik%20Buterin) — ¡y aprenderemos cómo lo hicieron, y cómo tomaron el mundo por sorpresa, comenzando en el [próximo artículo](/es/blog/blockchain-101/enter-ethereum)!
