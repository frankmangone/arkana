---
title: "Blockchain 101: Cerrando con Ethereum"
date: "2025-04-07"
author: "frank-mangone"
thumbnail: "/images/blockchain-101/wrapping-up-ethereum/ethereum-coin.webp"
tags: ["blockchain", "ethereum", "hardFork", "ether", "gas"]
description: "Algunos comentarios finales sobre aspectos arquitectónicos importantes de Ethereum, ¡cerrando la sección sobre esta Blockchain!"
readingTime: "11 min"
mediumUrl: "https://medium.com/@francomangone18/blockchain-101-ro-ethereum-8493b8072862"
---

> Este artículo es parte de una serie más larga sobre Blockchain. Si este es el primer artículo que encuentras, te recomiendo comenzar por el [inicio de la serie](/es/blog/blockchain-101/how-it-all-began).

Ya que hemos cubierto bastantes conceptos clave de Ethereum, creo que deberíamos comenzar este artículo con un rápido repaso.

- Comenzamos presentando algunas de las ideas más grandes y revolucionarias [introducidas por Ethereum](/es/blog/blockchain-101/enter-ethereum) – y crucialmente, los **Contratos Inteligentes**.
- Luego, nos sumergimos en el funcionamiento interno de estos Contratos Inteligentes, explorando cómo manejan el [almacenamiento](/es/blog/blockchain-101/storage), y cómo son capaces de [ejecutar lógica compleja definida por el usuario](/es/blog/blockchain-101/smart-contracts).
- Finalmente, hablamos brevemente sobre el actual [mecanismo de consenso](/es/blog/blockchain-101/consensus-revisited) que es responsable de asegurar la historia de la red.

Naturalmente, hay mucho más que decir sobre Ethereum. Hoy, abordaremos algunos de los aspectos que hemos dejado sin cubrir hasta ahora – pero de nuevo, esta no será la historia completa.

> ¡Piensa en esto como una introducción no tan superficial!

Con esto en mente, ¡vamos directo al asunto!

---

## Actualizando Ethereum {#updating-ethereum}

En el artículo anterior, mencionamos cómo hubo **un evento** en el que Ethereum dejó de usar Prueba de Trabajo como su mecanismo de consenso elegido, y cambió a Prueba de Participación.

¿Qué fue exactamente este evento? ¿Y cómo funcionó?

> Quiero decir, suena simple, pero por supuesto, no lo es.

Tratemos de reflexionar sobre las implicaciones de este tipo de cambio.

Las Blockchains son, en su esencia, **sistemas distribuidos**. Cambiar el mecanismo de consenso esencialmente significa cambiar las **reglas** del juego — es decir, las reglas que los nodos en este sistema necesitan seguir para participar en la red, y ayudar a hacer crecer la Blockchain.

Y como ya hemos mencionado, estas reglas están **programadas** en los nodos de la red. Así que, resumiendo:

::: big-quote
Actualizar la red significa cambiar el código fuente de los nodos
:::

Y hay un detalle — y uno muy importante: las Blockchains son, como ya mencionamos, **sistemas distribuidos**.

En otras palabras, además de la [estructura de datos](/es/blog/blockchain-101/how-it-all-began/#a-chain-of-blocks) real, la "Blockchain" es un conjunto de nodos distribuidos por todo el mundo, propiedad de diferentes personas o grupos de personas, y comunicándose entre sí.

No se puede simplemente apagar los nodos antiguos y encender unos nuevos. La **coordinación** es esencial. Además, hay otro aspecto a considerar: no tenemos **ninguna garantía** de que todos migrarán a la nueva versión del nodo.

Lo que plantea una pregunta: ¿qué pasa con aquellos nodos que optan por **no** hacer la actualización?

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-ethereum/thinking-statue.webp" 
    alt="Una estatua en posición pensante"
    title="Muy intrigante, de hecho."
    width="600"
  />
</figure>

### Hard Forks {#hard-forks}

Obviamente, la versión anterior era una implementación perfectamente válida en algún momento, que originalmente podía comunicarse con otros nodos. Dependiendo del tipo de cambio, los nodos antiguos pueden volverse incompatibles con los nuevos — ¡pero seguirán siendo compatibles con otros antiguos!

Esto lleva a una situación interesante: los nodos antiguos existentes que no quieren cambiar a una versión más nueva podrían comunicarse entre sí y acordar nuevos bloques. Mientras tanto, los nuevos nodos harán lo mismo, pero acordarán **bloques diferentes**. Así que la Blockchain **se dividiría**.

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-ethereum/hard-fork.webp" 
    alt="Un hard fork, mostrando cómo se divide la blockchain"
    title="[zoom]"
  />
</figure>

Esto es lo que se conoce como un **hard fork**.

A medida que los nodos actualizados comienzan a poner en acción las nuevas reglas, se empiezan a generar nuevos bloques, y a medida que más nodos actualizados entran en juego, se adhieren a la nueva historia. ¡Pero los nodos antiguos no pueden entender eso — así que acuerdan una historia diferente!

Normalmente esperamos que todos hagan la actualización en algún momento, para que la bifurcación antigua se extinga orgánicamente. ¡Aunque esto puede no suceder por completo!

> De hecho, [Ethereum PoW](https://www.oklink.com/ethw) todavía está funcionando, pero ya no lo identificamos como "Ethereum".

### Soft Forks {#soft-forks}

No todos los cambios son iguales. Algunos son más extremos que otros. Por ejemplo, imaginemos una situación donde mantenemos el mismo conjunto de reglas antiguas, pero solo agregamos **algunas nuevas**. La "actualización" es solo una versión ligeramente más restrictiva del código antiguo. ¿Qué sucede entonces?

Bueno, los bloques producidos por nodos actualizados **parecerán válidos** para los nodos antiguos, pero **no al revés**.

Esto crea una situación de **compatibilidad hacia atrás parcial**. Los nodos antiguos podrían seguir participando en el consenso — aunque pueden perderse algunas de las nuevas características y restricciones. ¡Y aceptarán bloques de nodos actualizados, porque estos bloques siguen el conjunto de reglas antiguo!

Y hay otra consecuencia interesante: los nodos antiguos podrían **temporalmente** acordar nuevos bloques que son **inválidos** a los ojos de los nuevos nodos. Esto significa que podrían seguir temporalmente una cadena que es inválida para los nuevos nodos, quienes estarán mirando una cadena diferente que se ajusta a las nuevas reglas.

Así que esto también es una bifurcación en la cadena — aunque, de un tipo diferente: un **soft fork**.

La diferencia es que, siempre y cuando la mayoría de la red esté actualizada, cualquier soft fork morirá naturalmente, ya que será descartada por los nodos actualizados. Así que la belleza es que no arriesgamos dividir la red en **cadenas competidoras**.

### Historia de Actualizaciones {#update-history}

En la historia de Ethereum, muchas actualizaciones han sido soft forks. A diferencia del cambio dramático a Prueba de Participación (un hard fork), los soft forks han introducido cambios más sutiles como nuevos opcodes, ajustes de costos de gas, o mejoras de seguridad — todo mientras se mantiene la compatibilidad con nodos más antiguos.

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-ethereum/history.webp" 
    alt="Una línea de tiempo que muestra las diferentes actualizaciones de Ethereum"
    title="[zoom]"
  />
</figure>

> Puedes encontrar la historia completa de cambios [aquí](https://ethereum.org/en/history/).

Notarás que después del Merge, las actualizaciones comenzaron a usar estos nombres extravagantes — y hay una buena razón para eso. Los nodos se dividieron en dos partes: un **cliente de ejecución**, responsable de manejar la lógica de las transacciones, y un **cliente de consenso**, que es responsable de... bueno, el consenso.

> No quiero arruinar toda la diversión, así que para más información, consulta este [artículo](https://medium.com/topic-crypto/how-ethereum-names-updates-why-its-confusing-b1a07f0de4d0).

La próxima actualización en línea es Pectra, que viene repleta de algunas nuevas características interesantes, como una nueva forma de manejar la [abstracción de cuentas](/es/blog/ethereum/the-gem-of-pectra/#a-short-story-about-ethereums-updates).

---

## Evolucionando la Red {#evolving-the-network}

¡Bien! Ahora tenemos una mejor idea de cómo ocurren las actualizaciones a la red.

Las actualizaciones son algo bueno. Después de todo, las Blockchains son sistemas bastante jóvenes — y hay mucho espacio para mejorar, ya sea a través de nuevas características, mejor rendimiento, o primitivas criptográficas más poderosas.

Pero ¿quién o qué decide qué nuevas características incluir en la red?

### Propuestas de Mejora de Ethereum {#ethereum-improvement-proposals}

A diferencia del software más tradicional, no hay una sola empresa o persona que sea dueña Ethereum directamente. En su lugar, las mejoras deben seguir un **proceso** centrado en propuestas comunitarias, llamadas **Propuestas de Mejora de Ethereum**, o **EIPs** para abreviar.

Una EIP es simplemente un documento que propone un nuevo cambio o característica para la red. Establece no solo las razones del cambio, sino que también describe cómo debe implementarse.

Estos documentos tienen un ciclo de vida estandarizado:

1. **Idea**: Alguien tiene una idea para mejorar Ethereum.
2. **Borrador**: La idea se formaliza en un documento EIP adecuado.
3. **Revisión**: La comunidad discute y proporciona retroalimentación.
4. **Última Llamada**: Última oportunidad para comentarios antes de avanzar.
5. **Final/Aceptada**: La propuesta es aceptada y lista para implementación.
6. **Implementación**: Los desarrolladores incorporan los cambios en el software del cliente.

Para que una EIP se convierta en parte de Ethereum, necesita obtener la aprobación de los desarrolladores principales, los equipos de clientes, y más generalmente, de la comunidad en general. En este sentido, el sistema abraza la **descentralización** en su evolución, asegurando que las buenas ideas y el mérito impulsen el progreso, en lugar de la autoridad.

### Probando Cambios {#testing-changes}

Ahora, todo esto está muy bien — hasta que recordamos que estamos hablando de **software**. Escrito por nosotros los humanos, que constantemente cometemos errores.

Y las Blockchains son estos sistemas altamente coordinados que necesitan trabajar en nada menos que una **armonía perfecta** para operar correctamente. ¿Cómo nos aseguramos de que las actualizaciones no rompan todo?

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-ethereum/how-much-did-you-break.webp" 
    alt="Meme de Thanos y Gamora, con Thanos diciendo cómo rompió todo el código"
    width="600"
  />
</figure>

Necesitamos una forma de **probar los cambios** antes de que lleguen a la red. El desarrollo de software tradicional resuelve esto teniendo múltiples entornos — entonces, ¿por qué no podemos **hacer lo mismo**?

Aquí es donde entran en juego las **redes de desarrollo**. Las **redes de desarrollo** también están conformadas por nodos que se comunican entre sí, que comparten alguna historia impresa en la Blockchain, pero que están **totalmente desvinculadas** de la Blockchain principal y canónica que llamamos "Ethereum" — la **red principal**.

Es en estas redes de desarrollo donde primero se prueban las actualizaciones. Esencialmente, es **el** lugar para estropear las cosas, encontrar errores, resolverlos e iterar.

Una vez que los cambios son lo suficientemente estables, **todavía no van a la red principal**. Hay otro paso intermedio — la **red de pruebas**.

En circunstancias normales, la **red de pruebas** es el lugar donde los desarrolladores de Contratos Inteligentes prueban sus creaciones antes de que entren en funcionamiento en la red principal, donde hay **valor real**. Dicho de otra manera: no quieres gastar dinero real desplegando un contrato defectuoso — sería mejor probarlo primero en un entorno controlado que simule la red principal, pero donde todavía eres libre de cometer errores.

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-ethereum/ok-statue.webp" 
    alt="Una estatua dando un pulgar hacia arriba"
    title="Genial, hermano."
    width="600"
  />
</figure>

Las actualizaciones se promueven de las redes de desarrollo a las redes de pruebas antes de entrar en funcionamiento. El razonamiento aquí es que ahora, más desarrolladores tienen acceso a las nuevas características, y pueden usarlas para aplicaciones reales — así que es el escenario perfecto para encontrar cualquier tipo de error de último minuto que necesite ser corregido antes de que no haya vuelta atrás.

¡Y supongo que eso es todo, en pocas palabras!

Por supuesto, hay mucho más que decir sobre la evolución de Ethereum — por ejemplo, hay toda una [hoja de ruta](https://ethereum.org/en/roadmap/) de cambios planificados destinados a mejorar la red.

> Incluso hay cambios planificados que han perdido algo de tracción o han sido diferidos a futuras actualizaciones, como [danksharding](https://ethereum.org/en/roadmap/danksharding/).

Y hay mucho que decir sobre cosas que se construyen **encima de Ethereum** — las llamadas soluciones de **Capa 2** (L2). Ese será un tema para [otra ocasión](/es/blog/blockchain-101/rollups). Por ahora, pongamos un punto final en la evolución de Ethereum, y en su lugar centrémonos en otro aspecto crucial.

---

## Ether y Gas {#ether-and-gas}

No podría terminar ninguna discusión seria sobre Ethereum sin hablar de cómo maneja su **moneda nativa**, **Ether**.

Es importante destacar que la emisión total de Ether funciona muy diferente a la de Bitcoin. Ya hablamos sobre cómo hay un límite en la [cantidad de Bitcoin que existirá jamás](/es/blog/blockchain-101/a-primer-on-consensus/#incentives) — una limitación que no existe en Ethereum.

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-ethereum/lambos.webp" 
    alt="Me dijeron que habría lambos"
    title="Me dijeron que habría lambos"
    width="600"
  />
</figure>

Eso no significa que la cantidad de Ether crecerá sin control. Principalmente porque tiene **dos propósitos**: es una reserva de valor (como Bitcoin), pero también es el **combustible** para la red.

¿Qué quiero decir con esto, te preguntarás? Que Ethereum literalmente **necesita Ether para funcionar**, a diferencia de Bitcoin.

> No es solo dinero digital — es el recurso esencial que el sistema requiere para su correcto funcionamiento.

Y la emisión de Ether tiene una estrecha relación con otro concepto clave: el **gas**.

### Entendiendo el Gas {#understanding-gas}

Ya hemos hablado sobre esta dinámica de "combustible" [anteriormente en la serie](/es/blog/blockchain-101/enter-ethereum/#gas). En resumen, es una medida de esfuerzo computacional, y nos permite poner un límite a cuánta computación puede ejecutar un solo programa.

> Lo que a su vez ayuda a evitar bucles infinitos.

Cada operación en Ethereum cuesta algo de gas. Como, literalmente, cada opcode individual tiene un [costo mínimo de gas](https://www.evm.codes/). Por lo tanto, una transferencia simple cuesta alrededor de [21,000 unidades de gas](https://www.kucoin.com/learn/web3/understanding-ethereum-gas-fees#:~:text=A%20simple%20ETH%20transfer%20typically%20requires%2021%2C000%20gas%20units), mientras que una llamada a un Contrato Inteligente podría costar cientos de miles o incluso millones de unidades de gas.

La filosofía es entonces **pagar según se usa** — o al menos, en proporción a tus necesidades. El precio real que pagas se calcula como:

$$
\textrm{Tarifa de Gas} \ = \ \textrm{Unidades de Gas} \ \times \ \textrm{Precio del Gas}
$$

Ahora, las unidades de gas están estrictamente relacionadas con cuánto trabajo computacional requieres. Sin embargo, el **precio** del gas es una historia diferente.

El precio del gas se mide en **gwei** — 1 mil millonésima de un Ether — , y fluctúa según la **demanda de la red**.

Cuando muchas personas intentan usar Ethereum al mismo tiempo (otra forma de decir esto es **concurrentemente**, o **simultáneamente**), los precios del gas suben.

> Así que vas "oye, ¿por qué mi transferencia de diez dólares está costando 20 dólares en tarifas de gas?", lo que te hace abandonar furioso.

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-ethereum/not-stonks.webp" 
    alt="No stonks"
    width="600"
  />
</figure>

Funciona como un **incentivo negativo**. A medida que los precios de las transacciones se disparan, menos personas estarán dispuestas a pagar el alto "impuesto", y por lo tanto dejarán de bombardear la red con solicitudes.

Pero no es la red la que decide el precio del gas — son los **usuarios**. O al menos, así es como solía ser.

### La Reforma del Mercado de Tarifas {#the-fee-market-reform}

Antes de [EIP-1559](https://eips.ethereum.org/EIPS/eip-1559), los usuarios simplemente ofertaban cuánto estaban dispuestos a pagar por el gas en una **subasta simple**. Una especie de competencia — que resultaba en picos de tarifas impredecibles e ineficiencias.

El sistema actual utiliza una estructura de tarifa de dos partes:

- **Tarifa Base**: Establecida automáticamente por la red según la demanda y completamente **quemada**. O **destruida**, podríamos decir.
- **Tarifa de Prioridad**: Una propina opcional para los validadores para incentivarlos a incluir tu transacción más pronto.

Este diseño hace que las tarifas sean más predecibles, mientras que aún permite a los usuarios priorizar transacciones urgentes cuando sea necesario.

Si juntamos todas estas cosas, podemos ver que hay un complejo **ciclo económico** sucediendo mientras Ethereum opera:

- Los usuarios pagan tarifas de gas para usar la red.
- Parte de esas tarifas se queman, (potencialmente) reduciendo la oferta.
- Los validadores reciben las tarifas restantes más recompensas de nueva emisión (nota que aquí es donde se genera nuevo Ether).
- Esto incentiva más staking, aumentando la seguridad de la red.
- Una mayor seguridad y utilidad impulsa más adopción.
- Más adopción significa más usuarios de la red, y volvemos al paso $1$.

En resumen, este es un **modelo económico** más elaborado que el de Bitcoin. Llamamos a este tipo de análisis la **tokenomía** de Ether, y son resultado del papel de Ethereum como plataforma computacional, en lugar de solo una moneda.

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-ethereum/ethereum-coin.webp"
    alt="Una moneda con el símbolo de Ethereum"
    title="Pero sigue siendo una moneda, por supuesto"
    width="600"
  />
</figure>

### Límites de Gas por Bloque {#block-gas-limits}

Finalmente, los bloques de Ethereum tienen un **límite de gas objetivo** — una cantidad máxima de gas que puede ser usado en un solo bloque.

Esto establece un límite a cuántas transacciones pueden incluirse en cada bloque, lo que sirve como un **mecanismo de protección**.

> Sin él, los validadores podrían incluir tantas transacciones que otros nodos no podrían validar en un solo [slot](/es/blog/blockchain-101/consensus-revisited/#finality-in-ethereum), potencialmente llevando a inestabilidad en la red.

El límite de gas puede ajustarse ligeramente con el tiempo, permitiendo que la red escale gradualmente, siempre y cuando no se comprometa la estabilidad.

---

## Resumen {#summary}

¡Bien, creo que ese es un buen lugar para detenernos!

¡Ha sido todo un viaje! Lo cual no es de extrañar — Ethereum es un ecosistema muy rico, y una pieza de tecnología muy sólida.

> ¡Y apenas hemos arañado la superficie!

Pero sí, no hay forma de que pueda cubrir todo en solo unos pocos artículos. No es mi intención, de todos modos — quiero mantener esto relativamente amigable, y este es un tema realmente profundo.

Aún así, creo que hemos cubierto suficientes puntos para tener una idea sólida de qué es Ethereum, cómo funciona, y qué nuevas ideas trajo a la mesa de las Blockchains.

Ahora, debo admitir... Mentí cuando dije que esto sería un cierre sobre Ethereum. De alguna manera, lo es — pero hay algo que todavía necesitamos cubrir antes de poder pasar a otras Blockchains.

Necesitamos hablar sobre los **rollups**, mejor conocidos como Blockchains de **Capa 2** (L2). Estos se sitúan **encima** de Ethereum — pero el concepto es más general, y se extiende a otros ecosistemas.

¡Ese será el tema de nuestro [próximo encuentro](/es/blog/blockchain-101/rollups)!
