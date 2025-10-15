---
title: 'Blockchain 101: ZK en Blockchain'
author: frank-mangone
date: '2025-10-15'
thumbnail: /images/blockchain-101/zk-in-blockchain/0*4nlnW5cHm23lYgUp-3.jpg
tags:
  - zeroKnowledgeProofs
  - blockchain
  - rollup
  - alephZero
  - mina
description: >-
  Pasando de Polkadot, ahora cubrimos la intersección entre dos tecnologías de
  vanguardia: blockchain y pruebas de conocimiento cero
readingTime: 11 min
contentHash: 340ae73e15e16af120ce3c59afd12ad9e67e38d8367fd4c1431b8914f6c0e7ad
supabaseId: f8a1d826-9c4a-4485-9798-e1d47f2ac3a8
---

> Esta es parte de una serie más grande de artículos sobre Blockchain. Si este es el primer artículo que encuentras, te recomiendo encarecidamente comenzar desde el [inicio de la serie](/es/blog/blockchain-101/how-it-all-began).

Después de [cuatro](/es/blog/blockchain-101/polkadot) [artículos](/es/blog/blockchain-101/polkadot-consensus) [sobre](/es/blog/blockchain-101/coretime) [Polkadot](/es/blog/blockchain-101/jam), será bueno descomprimir un poco abordando una pregunta más general, en lugar de comprometernos tanto con una sola tecnología una vez más.

> Supongo que fue bastante información, después de todo. ¡Perdón!

Hoy, quiero que exploremos una de las áreas más avanzadas de investigación y desarrollo en criptografía en los últimos años: [Pruebas de Conocimiento Cero](/es/blog/cryptography-101/zero-knowledge-proofs-part-1), usualmente referidas simplemente como **ZK**.

Esta tecnología ha estado haciendo ruido en el espacio de Blockchain por algún tiempo ahora. Incluso la hemos cubierto brevemente en nuestro [pase por rollups](/es/blog/blockchain-101/rollups/#zero-knowledge-rollups). Así que si has estado siguiendo la serie, muy probablemente tienes una idea de qué se trata esto.

Pero hoy, haremos doble clic en lo que significa esta palabra de moda, cómo exactamente se usa, y luego presentaremos algunos ejemplos de aplicación — algunos de ellos más familiares, algunos de ellos bastante salvajes y exóticos.

<figure>
	<img
		src="/images/blockchain-101/zk-in-blockchain/0*_XfvNnoEqtc21OGU-1.jpg"
		alt="Un tipo extravagante con un tigre" 
		title="Oh sí"
	/>
</figure>

Ponte cómodo, y vayamos a la acción.

---

## ¿Qué es ZK? {#what-is-zk}

Antes de llegar a las aplicaciones, debemos ser precisos sobre qué es ZK, y aclarar algunas ideas erróneas comunes — quizás más interesantemente, alrededor del hecho de que el concepto de "conocimiento cero" es a menudo **malentendido**.

Las pruebas de conocimiento cero son protocolos criptográficos que permiten a un probador convencer a un verificador sobre la validez de alguna **declaración** mientras no revela información alguna además de la verdad de la declaración misma.

> Un ejemplo simple sería probar que mi edad es mayor a 21, pero sin revelar mi edad.

Cuando se pone así, suena bastante mágico y esotérico. Pero supongo que realmente estamos aprendiendo sobre esto **al revés** — hay una manera de abordar estas ideas desde una perspectiva más familiar o práctica. Esa manera es hablar sobre **computación verificable**.

Imagina que tienes un programa $P$, y quieres verificar que fue **ejecutado correctamente** para un conjunto dado de entradas $x$, resultando en alguna salida $y$. Algo como:

$$
y = P(x)
$$

La manera trivial de hacer esto es simplemente **procesar la computación**, y verificar si los resultados coinciden — pero esa no es la **única** manera.

Verás, algunas técnicas inteligentes nos permiten codificar información sobre la computación, de manera que podemos verificar su validez con **mucho menos esfuerzo computacional**, a costa de admitir una muy baja probabilidad de aceptar una prueba falsa.

Tales sistemas se conocen como **argumentos de conocimiento**. Se basan en varias técnicas de las que no tendremos el lujo de hablar hoy, porque eso tomaría mucho más tiempo que un solo artículo.

> ¡He escrito algunas cosas sobre esto en mi [serie Cryptography 101](/es/reading-lists/cryptography-101), así que podrías querer revisar eso! No te preocupes sin embargo — cubriremos lo que necesitas saber aquí.

Sin embargo, lo que acabamos de decir es suficiente para ser más precisos sobre esto del conocimiento cero: si tus argumentos de conocimiento resultan no revelar información alguna sobre las **entradas** a la computación, entonces obtienes una prueba de conocimiento cero. Lo que significa que es una **propiedad** que estos argumentos **pueden tener** — y no un requisito estricto.

En su lugar, los argumentos de conocimiento están requeridos a satisfacer otras dos propiedades, llamadas **completitud** y **solidez**: la primera significa que las pruebas válidas siempre serán aceptadas, y la segunda significa que las pruebas falsas son realmente, realmente difíciles de crear.

> Incluso existe la noción más precisa de **solidez de conocimiento**, que en términos generales significa que es muy improbable que una prueba pueda ser creada sin conocimiento de cierta información. La definición misma es más compleja, y requiere que definamos un **extractor eficiente**, así que omitiremos esos detalles técnicos.

A la luz de esto, uno debe preguntarse: ¿cuándo es el conocimiento cero algo de lo que deberíamos preocuparnos?

La verdad sea dicha, no **siempre** nos preocupamos por ZK. De hecho, a veces estamos más interesados en **otras propiedades** de los argumentos de conocimiento — particularmente alrededor de qué tan **pequeñas** pueden ser las pruebas, o qué tan rápido pueden ser **verificadas**.

Solo cuando la privacidad de datos es de la máxima importancia será ZK ventajoso. En el contexto de Blockchain sin embargo, estamos **principalmente** interesados en las otras propiedades que acabamos de mencionar. Todo esto para decir: el término ZK es usualmente **sobreutilizado** (o incluso **mal utilizado**) porque ayuda con los esfuerzos de marketing, pero sepas que **computación verificable** es más a menudo que no el nombre del juego.

¡Muy bien! Con eso en mente, averigüemos cómo ZK (o computación verificable) se usa en Blockchain.

---

## Aplicaciones en Blockchain {#applications-in-blockchain}

En términos generales, las aplicaciones ZK en el espacio de Blockchain pueden dividirse en tres categorías amplias:

- **Escalabilidad**: Usando computación verificable para comprimir operaciones costosas en cadena.
- **Privacidad**: Usando conocimiento cero real para ocultar información sensible.
- **Enfoques Híbridos**: Combinando ambos beneficios para casos de uso más complejos.

Abordaremos las aplicaciones más o menos en este orden, comenzando con las discusiones ya algo familiares alrededor de **escalabilidad**.

---

## Escalabilidad {#scaling}

Como un breve repaso, toda la discusión cuando hablamos sobre [ZK rollups](/es/blog/blockchain-101/rollups/#zero-knowledge-rollups) giraba en torno a poder acumular transacciones fuera de cadena, luego realizar computaciones para avanzar algún estado, y hacer que la capa 1 **verifique** esas computaciones en cadena.

Así que aquí hay una pregunta para ti: ¿crees que nos preocupamos por el conocimiento cero en este caso?

<figure>
	<img
		src="/images/blockchain-101/zk-in-blockchain/0*4nlnW5cHm23lYgUp-3.jpg"
		alt="Una ardilla levantando las manos como si detuviera al lector" 
		title="Pausa e intenta adivinar."
	/>
</figure>

Bueno, en términos generales, **no** — nos preocupamos más por **verificación rápida (y barata)**. La privacidad podría ser importante siempre que el rollup tenga un **estado privado**, y quisiera mantenerlo así — pero eso es más fácil decirlo que hacerlo.

Por lo tanto, nuestro enfoque estará en **verificación rápida**.

Las Blockchains son **sistemas con estado**. Ya conoces el procedimiento: tienen un estado global, que evoluciona gracias a la red procesando transacciones (o entidades similares, como en [JAM](/es/blog/blockchain-101/jam)). En otras palabras, pueden ser descritas por una **función** que toma tanto el estado inicial como un conjunto de transacciones, y produce el siguiente estado.

<figure>
	<img
		src="/images/blockchain-101/zk-in-blockchain/1*V92WpgX8jMADbvpVOQPg2A-4.png"
		alt="Transiciones de estado en acción"
		title="[zoom]"
	/>
</figure>

Ejecutar esta función requiere computación — y esto es particularmente importante porque cada nuevo estado necesita ser **validado** para ser aceptado. ¿Y cómo validamos? Ya sea re-ejecutando todo, o verificando alguna **prueba** de que la computación fue realizada correctamente.

Claramente, estamos interesados en la **última opción**. Estamos tras soluciones que nos ayuden a realizar validación rápida — así que algo en las líneas de SNARKs o STARKs. Y como ya sabemos, el principal atractivo de este enfoque es **ahorrar costos** cuando los validadores de capa 1 verifican el estado de un rollup.

Espera un segundo. Estamos hablando de rollups y validación aquí. Pero... ¿No se necesita validación también en las Blockchains de capa 1?

¡Exactamente!

Las Blockchains L1 ya tienen mecanismos en su lugar para mantener la validación rápida y eficiente. De hecho, discutimos los métodos disponibles [un par de artículos atrás](/es/blog/blockchain-101/polkadot-consensus/#building-the-proofs). Las pruebas ZK eran parte de la lista de posibilidades.

Sin embargo, aunque extremadamente poderosos y versátiles, los argumentos de conocimiento **no son infalibles**. Una limitación particularmente molesta que tienen es que aunque la verificación puede ser rápida, el paso de **generación de pruebas** es usualmente **computacionalmente intensivo**, tomando mucho tiempo, y recursos considerables.

Pensemos en las consecuencias de esto por un segundo. Imagina que un validador está proponiendo un bloque. Querrían generar una prueba para verificación rápida. ¿Qué pasa si tardan demasiado en producir tal prueba?

¡Lo adivinaste — se convierten en un cuello de botella para todo el proceso!

<figure>
	<img
		src="/images/blockchain-101/zk-in-blockchain/0*nWSSVVikXpaeZ6h3-5"
		alt="Una tortuga" 
		title="Espera — casi termino con la prueba"
	/>
</figure>

En general, el paso de generación de pruebas es el principal desafío a abordar si esto va a ganar adopción como reemplazo para las estrategias de validación actuales. Aunque prometedor, la tecnología no está ahí todavía, con la generación de pruebas siendo aún bastante lenta (al momento de escribir esto).

Algunas ideas experimentales ambiciosas como la iniciativa [Beam chain](https://leanroadmap.org/) de Ethereum están explorando la posibilidad de incorporar ZK en la mezcla, y en más lugares que solo validación de estado — por ejemplo, agregación de firmas es otra área donde las pruebas ZK podrían ser útiles.

---

## Privacidad {#privacy}

Ahora volvemos nuestra atención a las cosas reales de conocimiento cero.

La privacidad en Blockchain no es un concepto tan novedoso. Ejemplos tempranos como [Monero](https://en.wikipedia.org/wiki/Monero) (2014) o [Zcash](https://en.wikipedia.org/wiki/Zcash) (2016) fueron pioneros en el área de transacciones **privadas** o **protegidas** para proteger la información financiera de sus usuarios.

> ¡De hecho, [Zcash](https://z.cash/) fue un adoptador temprano de las pruebas de conocimiento cero!

Importante, tanto Monero como Zcash se categorizan como soluciones de pago: funcionan como Bitcoin, pero agregan privacidad encima.

Casi diez años han pasado desde la concepción de esos proyectos, y las soluciones modernas también han explorado agregar privacidad a las Blockchains de propósito general — en otras palabras, agregar privacidad a los **Contratos Inteligentes**.

Un ejemplo de esto es [Aleph Zero](https://alephzero.org/).

<figure>
	<img
		src="/images/blockchain-101/zk-in-blockchain/1*eGrPneuvB3RQ5lD-rA8lgg-6.png"
		alt="Logo de Aleph Zero" 
	/>
</figure>

> Como curiosidad, está construido en Substrate (ahora Polkadot SDK).

La idea central es relativamente directa: Aleph Zero es una plataforma estándar de Contratos Inteligentes donde todo es **público por defecto**, justo como Ethereum. Pero cuando necesitas privacidad, puedes **optar por ella**. Aquí hay una demo de cómo se ve esto:

<video-embed src="https://www.youtube.com/watch?v=eD6TZUmgX3w" />

Cuando quieres hacer una transacción privada o interactuar con un Contrato Inteligente privado, el sistema usa pruebas de conocimiento cero para **ocultar detalles de transacción**, mientras aún prueba a la red que todo es válido.

> Efectivamente estás probando "Tengo el derecho de hacer esta operación" sin revelar qué es la operación realmente.

Esto es interesante por **dos razones**:

- Primero, es una **característica opcional**, como mencionamos antes. No todo necesita ser privado. Tener la capacidad de elegir qué información queremos proteger es genial — porque si hay algo que hemos declarado bastante firmemente hasta ahora, es que las pruebas de conocimiento cero son costosas de generar. En el caso de construir y firmar una transacción privada, ese estrés se coloca en el **usuario final**, lo que daña la **experiencia del usuario**.
- En segundo lugar, la privacidad está **integrada en el protocolo**. Las Blockchains de propósito general pueden permitir cierto grado de privacidad personalizada, pero hay **límites** a lo que se puede hacer. Ejemplos como [Confidential Wrapped Ether](https://ethresear.ch/t/confidential-wrapped-ethereum/22622) o [Zether](https://github.com/Consensys/anonymous-zether) son técnicamente sólidos, pero por ejemplo, carecen de la capacidad de proteger las transacciones mismas (como en, proteger el remitente) porque el **protocolo** (piensa Ethereum, Polkadot, etc.) no se preocupa por eso.

Las pruebas ZK aseguran que aunque las operaciones privadas estén ocultas, los validadores aún pueden **verificar** ciertas cosas como que no se creen tokens de la nada, que se respeten los límites de gasto, y más.

Aleph Zero no está solo en este juego sin embargo — podemos nombrar otros proyectos con propiedades similares, como [Aztec](https://aztec.network/), [Penumbra](https://penumbra.zone/), [Secret Network](https://scrt.network/), y [Oasis](https://oasis.net/).

Sé que he dicho esto varias veces a lo largo de la serie, pero aún es muy temprano para medir el impacto que estas soluciones tendrán.

---

## Enfoques Híbridos {#hybrid-approaches}

<figure>
	<img
		src="/images/blockchain-101/zk-in-blockchain/1*cZJMaVfXeh_kICVqmRFKxA-7.png"
		alt="Un híbrido cebra-caballo" 
		title="Hora de brillar bebé"
	/>
</figure>

Ahora llegamos a las cosas más exóticas.

Aunque hay algunas cosas interesantes de las que hablar como identidad basada en ZK o [ZK Machine Learning](https://0xparc.org/blog/zk-mnist) (ZKML), hay una Blockchain en particular que ha capturado mi atención en cómo usa computación verificable de una manera no convencional e innovadora: [Mina](https://minaprotocol.com/).

<figure>
	<img
		src="/images/blockchain-101/zk-in-blockchain/0*wj_87iQnuq4LAcy_-8.png"
		alt="Logo de Mina"
	/>
</figure>

El enfoque que Mina toma para, bueno, **toda la base de lo que una Blockchain es** difiere bastante dramáticamente del estándar. Hemos visto algunas desviaciones del modelo de Blockchain en la forma de [DAGs](/es/blog/blockchain-101/beyond-the-blockchain-part-2), pero eso es tan loco como las cosas se han puesto.

Mina propone un paradigma completamente nuevo: ¿qué si **toda la Blockchain** fuera solo una sola prueba ZK?

> ¿Quéeeeeee?

¡Bastante alucinante, eh? ¿Pero cómo es esto siquiera posible?

La idea es reemplazar la Blockchain misma con una **prueba recursiva** que prueba que el estado actual de la red es válido.

Sé que esto levantará muchas preguntas, así que déjame tratar de abordarlas preventivamente.

Primero, ¿qué pasa con las transacciones? Mantener solo una pequeña prueba significa que no hay libro mayor con cada transacción jamás hecha — algo a lo que nos hemos acostumbrado. Pero si queremos mantener las cosas privadas... ¿Realmente necesitamos eso?

Así, Mina mantiene solo un **certificado pequeño** que prueba que los balances actuales son correctos. Cada vez que nuevas transacciones suceden, generan un **nuevo certificado** que prueba tanto que las nuevas transacciones son válidas **como** que el certificado anterior era válido. Con esto, tienes una **cadena de pruebas** que se enlaza al mismo génesis de la red, y puedes verificar que toda la progresión es válida.

> En lugar de la cadena de hashes que normalmente obtienes en las Blockchains. Aunque sospecho que el puntero a la prueba anterior es algún tipo de hash también.

¿Cuáles podrían ser las ventajas de adoptar esta estrategia? Bueno, una propiedad realmente genial de Mina es que las pruebas que se están usando son **muy eficientes**, ya que usan [zkSNARKs](https://minaprotocol.com/blog/what-are-zk-snarks). Y las implicaciones son enormes: cualquiera puede descargar y validar el estado de la red **incluso en sus teléfonos móviles**. Esto es posible al no tener que descargar enormes cantidades de datos de transacción, y confiar en tecnología ZK en su lugar.

Por último, quiero mencionar que Mina va aún más lejos con sus [zkApps](https://minaprotocol.com/zkapps): Contratos Inteligentes que se ejecutan fuera de cadena, y solo envían pruebas a la Blockchain. Los datos nunca salen de tu dispositivo, y aún puedes probar cosas sobre ellos a la red.

Es simplemente loco. Mina probablemente representa la reimaginación más radical de la arquitectura de Blockchain que he visto hasta ahora. Y para mí, esto es exactamente por qué la tecnología ZK es tan emocionante.

::: big-quote
No se trata solo de hacer sistemas existentes más rápidos o más privados. Se trata de abrir formas completamente nuevas de pensar sobre lo que Blockchain puede ser.
:::

Estoy confiado de que otras aplicaciones salvajes de ZK y computación verificable en general aparecerán en el futuro cercano. La tecnología aún está evolucionando, y a medida que mejore, seguramente habilitará cosas que eran imposibles hace unos años.

---

## Resumen {#summary}

Las aplicaciones ZK en Blockchain no terminan ahí.

> Solo para nombrar otra, podríamos mencionar algo sobre [puentes entre cadenas](https://zkbridge.com/) explorando ZK para seguridad extra.

Pero creo que este es un buen lugar para parar por ahora.

La conclusión clave es que estamos presenciando la tecnología ZK evolucionar ante nuestros ojos, pasando de herramientas de privacidad de nicho a hacer impacto real en el espacio.

Así, ya no podemos ignorarla. Realmente se siente como que ZK (y computación verificable en general) está preparado para cambiar el panorama de Blockchain a un nivel fundamental en el futuro no tan distante.

¡Y quién sabe — tal vez el próximo avance hará que las ideas "radicales" de hoy se vean como juego de niños!

---

La industria de Blockchain no es para nada estática, y los límites seguirán siendo empujados. Las pruebas ZK son una de las últimas herramientas, y prometen ser particularmente útiles con **privacidad** y **escalabilidad**.

Sin embargo, estos no son los únicos problemas de larga data a resolver.

Otro prominente que hemos tocado algunas veces a lo largo de nuestro viaje juntos es **disponibilidad de datos**.

Esta será una de nuestras últimas paradas en la serie. ¡Te veré ahí!
