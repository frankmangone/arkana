---
title: "Blockchain 101: Llega Ethereum"
date: "2024-11-09"
author: "frank-mangone"
thumbnail: "/images/blockchain-101/enter-ethereum/galaxy-brain.webp"
tags: ["ethereum", "blockchain", "smartContracts"]
description: "Es hora de pasar al segundo gran hito en la historia de Blockchain: Ethereum"
readingTime: "8 min"
mediumUrl: "https://medium.com/@francomangone18/blockchain-101-enter-ethereum-e24f5f6453ac"
---

> Este artículo es parte de una serie más larga sobre Blockchain. Si este es el primer artículo que encuentras, te recomiendo comenzar por el [inicio de la serie](/es/blog/blockchain-101/how-it-all-began).

Tenemos que agradecer a [Bitcoin](/es/blog/blockchain-101/wrapping-up-bitcoin) por introducir al mundo los conceptos fundamentales de la tecnología Blockchain. Transacciones y bloques, incentivos y consenso — estas son ideas centrales que se manifiestan de diferentes formas en diferentes Blockchains, pero los conceptos siguen siendo aproximadamente los mismos.

Sin embargo, hay un límite en lo que Bitcoin puede hacer. Después de todo, fue concebido como un **sistema de dinero digital** — y no puede satisfacer otras necesidades.

No estuve ahí para verlo, pero supongo que en ese momento debió sentirse como si la tecnología tuviera mucho **potencial sin explotar**. Si tan solo las características y garantías de seguridad de Bitcoin pudieran traducirse a otros tipos de aplicaciones...

¡Las posibilidades!

Tomaría alrededor de 7 años para que el siguiente salto cuántico en la historia de Blockchain se materializara en **Ethereum**, que [salió a la luz en 2015](https://en.wikipedia.org/wiki/Ethereum#:~:text=went%20live%20on-,30%20July%202015,-.%5B6), trayendo consigo un enorme cambio de paradigma en términos de funcionalidad.

> Dato curioso: ¡el desarrollo de Ethereum fue [financiado colectivamente en Bitcoin](<https://cryptopotato.com/ethereums-history-from-whitepaper-to-hardforks-and-the-eth-merge/#:~:text=The%20Foundation%20created%2060%20million%20ether%20(ETH)%2C%20the%20native%20cryptocurrency%20of%20the%20Ethereum%20ecosystem%2C%20for%20public%20sale.%20The%20company%20sold%202%2C000%20ether%20per%20bitcoin%20(BTC)%20for%20the%20first%20two%20weeks%20of%20the%20ICO%20and%201%2C399%20ETH%20per%20BTC%20for%20the%20remainder%20of%20the%20token%20sale%20event.>)!

¿Qué fue tan importante sobre esta nueva tecnología? Para entenderlo mejor, necesitamos alejarnos un poco y tratar de cambiar nuestro modelo mental.

¡Toma una taza de café y empecemos!

---

## Repensando la Blockchain {#rethinking-the-blockchain}

¿Qué es una **Blockchain**?

En términos simples, una Blockchain es una secuencia de bloques que contienen transacciones, acordada por todos los participantes en una red. Esta secuencia establece una **historia compartida de cambios**.

Si lo piensas, toda la Blockchain es simplemente una receta de cómo llegar desde un **estado inicial** hasta algún **estado final** — una prescripción de cómo ir de $A$ a $B$.

> Por ejemplo, en Bitcoin, la Blockchain establece cómo llegamos desde el estado inicial de la red (algunos usuarios teniendo un balance inicial), hasta el estado actual, que son muchos usuarios teniendo muchos UTXOs.

<figure>
  <img
    src="/images/blockchain-101/enter-ethereum/state-evolution.webp" 
    alt="Estado evolucionando a medida que crece la blockchain"
    title="[zoom]"
    className="bg-white"
  />
</figure>

Por supuesto, como ya sabemos, las transacciones en Bitcoin están puramente relacionadas con **transferencias de dinero**. Así que los posibles **estados** son solo balances de usuarios, en forma de múltiples **UTXOs**.

Pero ¿qué pasaría si hubiera una forma de representar **otros tipos de estados**? Comenzaríamos con algún estado inicial, y luego las transacciones llegarían y lo mutarían a lo largo del tiempo. Así es como funciona una [máquina de estados](https://stately.ai/blog/2023-10-05-what-is-a-state-machine), y las transacciones en este contexto representan **transiciones de estado**: formas válidas de pasar de un estado a otro. Aquí hay un ejemplo muy simple:

<figure>
  <img
    src="/images/blockchain-101/enter-ethereum/state-machine.webp" 
    alt="Un ejemplo simple de una máquina de estados"
    title="[zoom] Estados representados en gris, y transiciones en púrpura"
    className="bg-white"
  />
</figure>

> ¡En el ejemplo anterior, no hay "balances"!
>
> Además, no hay forma de pasar directamente del estado **Dormido** al estado **Trabajando**. Solo después de tomar un par de pasos válidos es que podemos pasar de un estado a otro.

Y aquí está la idea brillante: ¿qué tal si permitimos a los usuarios enviar **estados personalizados** y definir sus propias **reglas** para las transiciones de estado? Entonces, la red solo necesita proporcionar un conjunto de funcionalidades base — como manejar el consenso — , mientras que los usuarios pueden **construir** máquinas de estados más pequeñas para satisfacer sus necesidades.

<figure>
  <img
    src="/images/blockchain-101/enter-ethereum/galaxy-brain.webp" 
    alt="Meme de expansión cerebral, edición galaxia"
    title="Vaya. Eso es inteligente."
  />
</figure>

::: big-quote
Esa es la principal innovación de Ethereum: empoderar a sus usuarios permitiéndoles definir comportamiento personalizado.
:::

La importancia de lograr esto **no puede subestimarse**. Le da a los usuarios la libertad de construir cualquier tipo de programa que deseen, mientras aprovechan todo el poder que la Blockchain proporciona — inmutabilidad de estado, resistencia a la censura, ya sabes, todas las cosas buenas.

**¿Pero cómo**? ¿Cómo puede manejar todo esto? Tendremos que posponer los detalles para una discusión posterior en la serie. Por ahora, es suficiente tener en mente que Ethereum fue la primera Blockchain en poner la **personalización** al alcance de sus usuarios.

Centrémonos en algunos otros aspectos de Ethereum que también representan un cambio importante en cómo debemos pensar sobre esta Blockchain.

---

## El Modelo de Cuentas {#the-account-model}

A diferencia del modelo UTXO de Bitcoin, Ethereum utiliza un modelo basado en cuentas. Esto probablemente nos resulte más familiar: como usuario, poseemos una cuenta, y todos nuestros activos están asociados a ella. Es una forma más **natural** de pensar sobre el estado.

> Tu cuenta es como tu "usuario" de la Blockchain, si se quiere.

La primera consecuencia de esto es que el balance de una cuenta se almacena como un **único valor**. En Bitcoin, este no es el caso — tu balance total es la suma de todos tus UTXOs disponibles.

Este balance se mide en la **moneda** o **token nativo** de Ethereum, llamado **Ether**. Al estar almacenado en un solo lugar significa que la lectura es más eficiente que leer un balance de Bitcoin, que está distribuido entre muchos UTXOs.

<figure>
  <img
    src="/images/blockchain-101/enter-ethereum/accounts.webp" 
    alt="Cuentas con balances"
    title="[zoom]"
    className="bg-white"
  />
</figure>

Ahora, prometí un estado **flexible** y **personalizable** hace unos párrafos. Mantener un registro del balance de un único usuario simplemente no será suficiente. ¿Cómo representamos otros estados diferentes a los balances nativos de los usuarios?

Esto es posible gracias a un **tipo especial de cuenta**.

### Tipos de Cuentas {#account-types}

Las cuentas de las que hemos estado hablando hasta ahora se llaman en realidad **Cuentas de Propiedad Externa** (EOAs, por sus siglas en inglés). Externas, porque pertenecen a usuarios "fuera" de la Blockchain, que poseen una **clave privada** (asociada a una **dirección**), y tienen la capacidad de firmar transacciones con ella.

Luego, tenemos **Cuentas de Contrato** — y aquí es donde ocurre la magia.

<figure>
  <img
    src="/images/blockchain-101/enter-ethereum/interested-snape.webp" 
    alt="Snape de Harry Potter, interesado en aprender más"
    title="Cuéntame más"
    width="600"
  />
</figure>

Estas cuentas contienen **programas** creados por usuarios — programas que definen un estado personalizado y transiciones de estado personalizadas. Imponen un conjunto de reglas que los usuarios deben seguir — en este sentido, son como nuestros contratos del mundo físico, pero un poco mejores: las reglas son impuestas por código, y no por autoridades o simplemente personas, que son propensas a cometer errores. Por esta razón, estos programas se llaman **Contratos Inteligentes**.

> Es importante destacar que no son "propiedad" de nadie en el sentido tradicional. Aunque las cuentas de contrato tienen direcciones que las identifican, no tienen una clave privada asociada.

Las cuentas de contrato funcionan fundamentalmente diferente de las EOAs: están controladas por su **programa asociado**, o **código**. Su único propósito es definir y manejar algún **estado personalizado**.

> Sin embargo, los Contratos Inteligentes pueden llamar a otros contratos, pero la llamada inicial debe ser realizada por una EOA.

<figure>
  <img
    src="/images/blockchain-101/enter-ethereum/contract-call-flow.webp" 
    alt="El flujo de ejecución de contratos inteligentes"
    title="[zoom]"
    className="bg-white"
  />
</figure>

Apenas estamos rascando la superficie aquí, pero estos conceptos de alto nivel son una buena manera de empezar. Como he mencionado antes, tendremos tiempo para llegar a los detalles más finos.

---

Independientemente de **cómo** se ejecuten los Contratos Inteligentes, lo que sabemos hasta ahora es que son **programas** que pueden ser ejecutados en la Blockchain. En este sentido, la Blockchain funciona como una computadora distribuida gigante — a menudo referida como la **Máquina Virtual de Ethereum** (o **EVM** para abreviar).

Dado que cualquiera puede enviar cualquier código arbitrario, hay un problema particular que debemos abordar. Imagina que alguien envía un **bucle infinito**, algo como:

```javascript
while (true) {
  // Hacer algo
}
```

> El lenguaje no es importante aquí — solo la idea de un bucle infinito. Aunque, por supuesto, hay lenguajes especiales para desarrollar Contratos Inteligentes, como [Solidity](https://soliditylang.org/).

Cada transición de estado necesita ser **verificada** para asegurar su validez y calcular el siguiente estado. La única forma de hacerlo es ejecutando el código del Contrato Inteligente.

Cualquier nodo que intente ejecutar este código se **quedaría atascado en este bucle**, quedando efectivamente congelado. Claramente, la red no puede ser detenida por un pequeño y simple error en nuestro código. Solo imagina: tuviste un pequeño error en el programa que acabas de enviar, y toda la Blockchain dice "no puedo manejar eso, voy a dejar de funcionar, chau.".

<figure>
  <img
    src="/images/blockchain-101/enter-ethereum/kill-yourself.webp" 
    alt="Meme de matarse"
    title="Sí, no, gracias."
    width="350"
  />
</figure>

**Debe** haber una forma de protegerse contra esto, ¿verdad?

---

## Gas {#gas}

¡En efecto, la hay! Y es también otro aspecto fundamental de cómo funciona Ethereum.

Nuestro objetivo es evitar la ejecución excesiva o bucles infinitos en el código de los Contratos Inteligentes. Una cosa que puede resolver esto es limitar la cantidad de código que puede ser ejecutado por una transacción. ¡Simple, pero efectivo!

<figure>
  <img
    src="/images/blockchain-101/enter-ethereum/borat.webp" 
    alt="Meme de Borat, con la leyenda 'Gran éxito'"
    width="500"
  />
</figure>

El enfoque de Ethereum se explica mejor mediante una analogía.

Imagina que cada transacción es un **auto**, al cual le cargarás algo de **combustible**, y luego saldrás a la carretera. Si tu destino está cerca, el combustible que cargaste probablemente será suficiente. Pero naturalmente, si por alguna razón necesitas conducir más lejos, ¡te quedarás sin combustible en algún punto!

El **Gas** funciona igual que el combustible en la analogía, y se consume con cada línea de código ejecutada en un Contrato Inteligente. Si alguna vez te encuentras con un bucle infinito, la ejecución procederá normalmente, mientras consume gas — y en algún punto, se acabará, y tu transacción fallará.

Esto significa que cada transacción debe especificar cuál es la cantidad máxima de gas que está dispuesta a consumir.

Y finalmente, ¡los usuarios deben **pagar** por este gas! Hay múltiples razones por las que pagar por gas es importante — pero ahora no es el momento de reflexionar sobre ellas. Todo lo que quiero discutir por el momento es **cómo** pagas por el gas.

Sí, probablemente lo adivinaste: pagas con **Ether**, la moneda nativa. Hay un detalle, sin embargo: las unidades de gas miden recursos computacionales utilizados. Para transformar la cantidad total de unidades de gas utilizadas en la cantidad de Ether a pagar como tarifa de transacción, necesitamos un **precio**:

$$
\textrm{Tarifa de Gas} \ = \ \textrm{Unidades de Gas} \ \times \ \textrm{Precio del Gas}
$$

Este precio se mide en **Ether por unidad de gas** (en realidad, en [wei](<https://www.investopedia.com/terms/w/wei.asp#:~:text=Wei%20is%20the%20smallest%20unit,1%2C000%2C000%2C000%2C000%2C000%2C000%20wei%20(1018).>) por unidad de gas). Curiosamente, este precio **cambia** con el tiempo, dependiendo de factores que discutiremos en futuros artículos. La consecuencia de esto es obvia: la misma operación puede tener diferentes tarifas de gas en diferentes momentos.

---

¡Y eso es suficiente para esta breve introducción de alto nivel, amigos! Confía en mí - tendremos **mucho tiempo** para expandir cada una de estas nuevas ideas.

<figure>
  <img
    src="/images/blockchain-101/enter-ethereum/gandalf.webp" 
    alt="Gandalf sonriendo"
    title="¡De acuerdo!"
    width="600"
  />
</figure>

---

## Resumen {#summary}

Un sabio profesor mío una vez me dijo que la mejor manera de abordar un nuevo tema es ir de los conceptos simples a los complejos, y de lo general a lo particular.

Esto es exactamente lo que hicimos hoy: solo presentamos una visión general de algunas de las diferencias clave entre Ethereum y Bitcoin.

Aunque, esta breve introducción ciertamente trae una buena cantidad de nuevas ideas: cuentas de usuario y de contrato, programas en la cadena, y una nueva forma de pensar sobre las tarifas. ¡Y lo mejor es que ni siquiera hemos comenzado a entender **cómo diablos funciona todo esto**!

Para hacerlo, **tenemos que ir más profundo**.

<figure>
  <img
    src="/images/blockchain-101/enter-ethereum/deeper-inception.webp" 
    alt="Leo DiCaprio sorprendido en una escena de Inception"
    width="600"
  />
</figure>

Así que en el [próximo artículo](/es/blog/blockchain-101/storage), comenzaremos a sumergirnos en el funcionamiento interno de Ethereum que hace todo esto posible. ¡Nos vemos pronto!
