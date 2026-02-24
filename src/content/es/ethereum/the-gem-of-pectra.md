---
title: 'La Joya de Pectra: EIP-7702, la Transacción SetCode'
date: '2025-03-31'
author: gonzalo-bustos
thumbnail: /images/ethereum/the-gem-of-pectra/7702.webp
tags:
  - ethereum
  - eip
  - setCode
  - pectra
description: >-
  Explora la actualización Pectra de Ethereum y EIP-7702, que mejora la
  Abstracción de Cuentas permitiendo que las EOAs adopten funcionalidad de
  contratos inteligentes.
readingTime: 7 min
contentHash: fb99826e268e0f36081c979cb6d8cc541fba73d0ad552e5c0a3620e1d2319292
---

Al principio dudé si escribir este artículo.

Siempre he querido que mis artículos sean **interesantes**, **útiles** y, sobre todo, fáciles de **entender**. Pero con tantos artículos geniales por ahí, no podía determinar si este sería alguna de esas cosas. Sin embargo, un gran colega mío me sugirió que simplemente lo hiciera. Así que pensé, **¿por qué no?**

> Este artículo cubre conceptos que deberían ser accesibles sin conocimiento profundo de la **Máquina Virtual de Ethereum** (EVM) o desarrollo en **Solidity**. Sin embargo, aunque trato de mantener las cosas lo más simples posible, aparecerá algo de **terminología** y **funcionalidad** fundamental de Ethereum, por lo que la familiaridad con el **ecosistema** y los **EIPs** puede ser útil.

Este artículo será un intento de introducir una de las características más buscadas de la actualización Pectra de Ethereum: [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702), también conocido como la **Transacción Set Code**.

<figure>
  <img
    src="/images/ethereum/the-gem-of-pectra/7702.webp" 
    alt="EIP 7702"
    width="600"
  />
</figure>

Para hacer eso, siento que podría ser necesario proporcionar un poco de contexto sobre el estado actual de Ethereum.

---

## Una breve historia sobre las actualizaciones de Ethereum {#una-breve-historia-sobre-las-actualizaciones-de-ethereum}

Vitalik Buterin presentó formalmente la **[hoja de ruta](https://ethroadmap.com/) centrada en rollups** en octubre de 2020, declarando que Ethereum ya no se enfocaría en manejar todo como una L1, sino en ser la mejor cadena para [rollups](https://medium.com/@onlylayer/ethereum-rollups-optimistic-and-zero-knowledge-rollups-explained-247607b43193), manteniendo la cadena L1 lo más segura y robusta posible mientras también permite que las L2s [manejen la escalabilidad de la red](https://polynya.medium.com/understanding-ethereums-rollup-centric-roadmap-1c60d30c060f).

> Recuerda que los [rollups](/es/blog/blockchain-101/rollups/) agrupan (o 'enrollan') transacciones en lotes que se ejecutan fuera de la cadena, esencialmente manteniendo un registro en cadena de que cada una de esas transacciones ocurrió sin tener que enviarlas por separado.
>
> Esto reduce la cantidad de datos que necesitan ser publicados en la blockchain, por lo tanto aumentando la escalabilidad.

Este cambio de perspectiva ha impactado enormemente el curso de las actualizaciones y mejoras hechas al ecosistema de Ethereum (y cómo operan las L2s, bibliotecas y herramientas).

Junto con la hoja de ruta centrada en rollups, las actualizaciones de Ethereum fueron muy influenciadas por la mayor actualización de su existencia: **The Merge** (15 de septiembre de 2022).

The Merge permitió la transición completa de un sistema distribuido de **Proof-of-Work** (como se propuso inicialmente en el whitepaper de Bitcoin) a un sistema de **Proof-of-Stake** que introdujo la idea de dos capas separadas:

- Una que se encarga de la **ejecución** de transacciones y [cambios de estado](https://ethereum.org/en/developers/docs/evm/#from-ledger-to-state-machine), que podemos llamar el "**Cliente de ejecución**" (como Geth, Reth, Besu, etc),
- y otra que implementa el **algoritmo de consenso** proof-of-stake que puede llamarse el "**Cliente de consenso**" (como Lighthouse, Lodestar, Prysm, etc).

<figure>
  <img
    src="/images/ethereum/the-gem-of-pectra/clients.webp" 
    alt="Diagrama de clientes después de The Merge"
    title="[zoom] Diagrama de clientes de la Documentación de Ethereum"
  />
</figure>

> Cada nueva actualización de Ethereum se describe por una lista de **EIPs** (**Propuestas de Mejora de Ethereum**), que detallan los **cambios propuestos**, su **justificación**, y cómo deberían implementarse en la nueva versión de la cadena y clientes. Por ejemplo, introducir nuevos **opcodes** al EVM en un EIP y modificar **estructuras de datos** existentes en otro.

¿Es todo esto relevante? Bueno, **¡por supuesto que sí!** Pero además de su importancia inherente en cómo funciona Ethereum a bajo nivel, esta separación en dos capas también dicta la **nomenclatura** de las actualizaciones generales.

Consisten en cambios tanto al **EL** como al **CL**, cada uno con su propio nombre:

- Las actualizaciones del EL se nombran según las **ciudades que albergan la conferencia Devcon**,
- Las del CL se nombran según **estrellas ordenadas alfabéticamente** (así es, estrellas 🌟).

Para representar todo el hard-fork, ambos nombres se **combinan**.

El EIP del que hablaremos hoy es parte de la Actualización **Pectra**, nombrada por la conferencia **Prague Devcon** y la **estrella Electra**.

Si quieres entender más sobre cómo funciona la nomenclatura de las actualizaciones de Ethereum, te sugiero revisar el siguiente artículo: [How Ethereum Names Updates & Why It's Confusing](https://medium.com/topic-crypto/how-ethereum-names-updates-why-its-confusing-b1a07f0de4d0).

<figure>
  <img
    src="/images/ethereum/the-gem-of-pectra/pectra.webp" 
    alt="Prague + Electra = Pectra"
    width="500"
  />
</figure>

---

Ahora que entendemos un poco mejor dónde estamos parados, deberíamos estar conscientes del concepto que ha **impulsado** la existencia del EIP: [Abstracción de Cuentas](https://ethereum.org/en/roadmap/account-abstraction/).

Cuando hablamos de abstracción de cuentas, nos referimos principalmente a **abstraer** la necesidad de que los usuarios usen una [Cuenta de Propiedad Externa](/es/blog/blockchain-101/ethereum/#account-types) (EOA) para interactuar con la blockchain.

Actualmente, la única manera de "hacer cosas" en Ethereum es a través de EOAs, lo que puede llevar a una experiencia de incorporación **frustrante** de usuarios Web2 a Web3, quienes **no saben** o **no les importa** manejar billeteras y claves privadas, y a soluciones no estandarizadas que tienden a ser excesivamente complejas.

Sin embargo, si lográramos implementar una buena solución de Abstracción de Cuentas, podríamos:

- **patrocinar transacciones** (por ejemplo, permitir que usuarios Web2 se incorporen sin tener que pagar para transaccionar),
- **agrupar transacciones** (una característica tan útil que Solana la implementó nativamente en su diseño SVM),
- manejar **des-escalación de privilegios** (permitir que otros usuarios accedan a los recursos de una cuenta si es necesario),

¡y desbloquear muchas más características interesantes!

Por eso la Abstracción de Cuentas ha sido un **tema candente** durante los últimos años. Imagina encontrar una manera de mantener todas las características de **seguridad** y **robustez** de Ethereum mientras también incorporas fácilmente nuevos usuarios (y extiendes las capacidades de las EOAs como bonus).

> Ten en cuenta que, a través de los años, ha habido muchas propuestas (como [EIP-3074](https://eips.ethereum.org/EIPS/eip-3074), [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337), etc) tratando de abordar este problema, pero actualmente **no hay un solo EIP** que resuelva todo.

La historia de los EIPs de Abstracción de Cuentas y las discusiones en Ethereum es bastante interesante y podría ser un buen tema para otro artículo, pero por ahora presentemos la última adición a la lista de contribuciones (¡y una muy buena!).

[EIP-7702](https://eips.ethereum.org/EIPS/eip-7702), también conocido como el EIP para la **Transacción SetCode**, propone un cambio en cómo operan las EOAs a nivel **nativo**.

<figure>
  <img
    src="/images/ethereum/the-gem-of-pectra/ollivander.webp" 
    alt="Ollivander de Harry Potter con la leyenda 'eso siempre ha sido claro para aquellos de nosotros que estudiamos Ethereum'"
    width="600"
  />
</figure>

> Como Ollivander le dijo a Harry: "La varita elige al mago, Sr. Potter. Eso siempre ha sido claro para aquellos de nosotros que hemos estudiado la ciencia de las varitas".

Bueno, para aquellos de nosotros que estudiamos Ethereum, la [diferencia entre EOAs y Cuentas de Contratos Inteligentes](https://info.etherscan.com/understanding-ethereum-accounts/) siempre ha sido clara: **las EOAs no pueden almacenar código pero pueden activar transacciones y las Cuentas de Contratos Inteligentes pueden almacenar código pero no pueden activar transacciones por sí mismas**.

La Transacción SetCode está aquí para cambiar eso **permitiendo que las EOAs almacenen código**.

---

Okay, mentí — en realidad no van a **almacenar** código, pero después de 7702, almacenarán lo que se llama un **designador de delegación**, que puedes pensar básicamente como un **puntero** al Contrato Inteligente que almacena el código que quieres ejecutar.

> ¡Este es un cambio enorme, básicamente estás **transformando** tu EOA en una Cuenta Inteligente simplemente enviando una transacción!

El proceso que un usuario tiene que seguir para hacer esto es **bastante simple**, como se explica en el siguiente diagrama (basado en el diagrama de [@tinchoabbate](https://x.com/tinchoabbate), que lo presentó tan claramente que me resultó difícil no usar todo el diagrama).

<figure>
  <img
    src="/images/ethereum/the-gem-of-pectra/set-code.webp" 
    alt="La transacción SetCode en acción"
    title="[zoom]"
  />
</figure>

Como muestra el diagrama, si un usuario regular quisiera **transformar** su EOA en una Cuenta Inteligente, necesitaría **elegir qué contrato va a proporcionar la lógica a su cuenta** (va sin decir que el contrato ya debe estar desplegado en cadena), **firmar una nueva transacción tipo-4** (siguiendo el estándar [EIP-2718](https://eips.ethereum.org/EIPS/eip-2718)), y pueden enviarlo ellos mismos o simplemente **hacer que alguien más lo envíe**.

No hay mucho más que hacer después de eso, si la transacción pasó, entonces deberían haber transformado exitosamente su EOA en una Cuenta Inteligente que puede ejecutar código tan complejo como su Contrato Inteligente lo permita.

<figure>
  <img
    src="/images/ethereum/the-gem-of-pectra/happy-anakin.webp" 
    alt="Anakin Skywalker feliz, con leyenda 'aquí es donde comienza la diversión'"
    width="500"
  />
</figure>

¿No suena **maravillosamente fácil**?

Pero no nos emocionemos todavía, esta fue solo una presentación de **alto nivel** de lo que EIP-7702 permitirá una vez que el HardFork Pectra esté activo, pero hay mucho más por revisar si queremos usarlo en la vida real...

Si eres tan curioso como yo, podrías tener algunas preguntas persistentes:

- ¿Puede **cualquiera** enviar esta transacción y transformar mi cuenta en una Cuenta Inteligente?
- ¿Dónde vive el **estado** de la nueva Cuenta Inteligente?
- ¿Puedo transformar mi Cuenta Inteligente **de vuelta a una EOA**?
- ¿Qué pasa si el Contrato Inteligente al que apunta mi EOA es vulnerable? **¿Puedo actualizarlo?**
- ¿Qué pasa con el **nonce** de mi cuenta una vez que la transformo en una Cuenta Inteligente?
- ¿Cómo puedo empezar a usarlo? ¿Puedo probarlo antes de que la Actualización Pectra esté activa?
- ¿En qué se **diferencia** esto de todos los otros EIPs de Abstracción de Cuentas, como 4337?
- ¿Qué pasa con usar mi EOA en **múltiples cadenas**?
- Los proveedores de billeteras y aplicaciones muy probablemente **determinarán** qué Contratos Inteligentes son lo suficientemente seguros para que los usuarios regulares los usen como contratos de delegación, ya que la mayoría de ellos no podrán decidir por sí mismos. ¿Va esto en contra de la descentralización? **¿Esto presenta algún riesgo?**
- ¿Es este el **Deus ex machina** de la Abstracción de Cuentas? (Spoiler, no lo es).

No te preocupes, tengo la intención de revisar todas estas y más preguntas en los siguientes artículos.

---

## ¡Resumen rápido! {#resumen-rapido}

En este artículo hemos hablado sobre cómo la **actualización Pectra** (nombrada por el evento Prague Devcon y la estrella Electra), la más reciente en una larga lista de actualizaciones de Ethereum, introducirá la **transacción setCode** como se especifica en **EIP-7702**, entre otras características.

Esta nueva transacción permite que una **EOA** aproveche un **Contrato Inteligente** para **extender su funcionalidad** más allá de simplemente activar transacciones — habilitando características como **patrocinio de transacciones**, **agrupación**, y **des-escalación de privilegios** — efectivamente convirtiéndola en lo que llamaríamos una Cuenta Inteligente. Esta es una contribución significativa al concepto de **Abstracción de Cuentas**, que ha sido un tema principal de conversación en el ecosistema de Ethereum.

Aunque transformar una EOA en una Cuenta Inteligente parece sencillo, aún necesitamos analizar exactamente cómo la transacción setCode utiliza el código de un Contrato Inteligente dentro del contexto de una cuenta de usuario para entender sus limitaciones y riesgos potenciales.
