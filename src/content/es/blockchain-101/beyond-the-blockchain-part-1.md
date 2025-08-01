---
title: "Blockchain 101: Más Allá de la Blockchain (Parte 1)"
date: "2025-07-01"
author: frank-mangone
thumbnail: /images/blockchain-101/beyond-the-blockchain-part-1/dag.png
tags:
  - hedera
  - hashgraph
  - consensus
  - blockchain
  - dag
description: >-
  No todo necesita ser una Blockchain para calificar como una Tecnología de
  Ledger Distribuido — ¡y hoy, comenzamos a mirar otras estructuras!
readingTime: 14 min
contentHash: 1171537de2b4e6b2b21215365674d1bc0d58ff3621735fffa4baf19714fd3fcd
supabaseId: 94dbc661-f2f9-40da-97f6-825942ca2aa6
---

> Esto es parte de una serie más larga de artículos sobre Blockchain. Si este es el primer artículo que encuentras, te recomiendo comenzar desde el [inicio de la serie](/es/blog/blockchain-101/how-it-all-began).

El factor común a lo largo de nuestro viaje juntos ha sido la mismísima estructura que le da nombre a esta serie: el **Blockchain**.

Aparte de nuestro breve vistazo a Ripple, cada sistema que hemos analizado hasta ahora se centra alrededor de la idea de una Blockchain — la estructura de datos — como un medio para organizar transacciones en una historia compartida única de eventos.

Muchas veces, hemos dejado la estructura misma en el fondo prácticamente intacta, y nos hemos enfocado en otros aspectos como cómo se logra el consenso, o cómo procesar transacciones más rápido. Al hacerlo, hemos renunciado a analizar si la **Blockchain en sí** era una buena decisión arquitectónica.

Recapitulando brevemente lo que hablamos cerca del inicio de la serie, sabemos que una Blockchain es este tipo de **lista enlazada** donde las referencias al elemento anterior — o **bloque** — se almacenan como el hash de dicho elemento. En consecuencia, cada bloque está vinculado criptográficamente a todos sus descendientes, haciendo toda la cadena **inmutable**.

Suena bien — y la mayor parte del ecosistema está construido alrededor de esta estructura de datos. Pero quiero que nos detengamos por un momento y nos preguntemos: ¿podríamos usar **otra estructura de datos**?

Hoy, abordaremos esta pregunta mirando un sistema con el cual hemos estado trabajando por un par de años en [SpaceDev](https://spacedev.io/), y que propone un modelo completamente diferente: **Hedera**.

---

## Volviendo al Principio {#back-to-the-beginning}

Desde el principio de la serie, hemos elogiado la Blockchain (la estructura de datos) como una buena manera de organizar una **historia de eventos**. Vimos alguna ligera variación con la [Prueba de Historia](/es/blog/blockchain-101/solana/#timestamping-in-action) de Solana y sus capacidades de marcado temporal, pero al final, todo sigue colocándose en una Blockchain.

Nuestro requisito original era simplemente poder **ordenar transacciones**. Todo lo que realmente necesitamos es determinar un orden correcto de ejecución. Si pudiéramos encontrar otra manera de hacerlo de forma descentralizada, ¡podríamos haber encontrado una alternativa a las Blockchains!

Una de estas soluciones es la implementada por [Hedera](https://hedera.com/). La estructura y consenso que usan se llama el [Mecanismo de Consenso Hashgraph](https://docs.hedera.com/hedera/core-concepts/hashgraph-consensus-algorithms), y te prometo — no es **nada** parecido a lo que estamos acostumbrados.

---

## El Hashgraph {#the-hashgraph}

Entonces, ¿cómo funciona esto?

Primero, hablemos de qué es un [**Grafo Acíclico Dirigido**](https://www.geeksforgeeks.org/dsa/introduction-to-directed-acyclic-graph/) (DAG, por sus siglas en inglés). Como podrías haber adivinado por el nombre bastante descriptivo, es un grafo con aristas dirigidas. Y crucialmente, no tiene **ciclos**: si empiezas en cualquier nodo y comienzas a seguir aristas, nunca regresarás al mismo nodo de inicio.

<figure>
    <img
        src="/images/blockchain-101/beyond-the-blockchain-part-1/dag.png"
        alt="Un Grafo Acíclico Dirigido (DAG)" 
        title="[zoom] ¡Así! Por más que trates, no encontrarás ningún ciclo"
    />
</figure>

El **Hashgraph** es simplemente un DAG, donde las aristas son punteros al **hash de otro nodo**. Implícitamente, estamos diciendo que cada nodo tiene algún contenido, muy parecido a como los bloques en una Blockchain también tienen contenido que puede ser hasheado para producir un identificador único.

Es importante aclarar esto temprano, porque todo el mecanismo de consenso para Hedera está basado en las propiedades de esta estructura de datos.

> Para motivar lo que sigue (y dar una pista de la utilidad de un DAG), regresemos a la Prueba de Trabajo por un momento. Cuando dos mineros crean nuevos bloques al mismo tiempo, la red tiene que elegir uno y descartar el otro. Cuando escalamos a más y más mineros, esto vuelve al proceso **extremadamente ineficiente**, ya que la mayoría de los bloques son descartados.

La idea clave es que podríamos tratar de evitar tirar todo ese esfuerzo valioso e información perfectamente válida — y aquí es donde entra el **Hashgraph**: permitiendo la incorporación de múltiples fuentes de datos simultáneamente.

---

## Consenso Hashgraph {#hashgraph-consensus}

Muy bien, tenemos la estructura en su lugar. ¿Qué usamos exactamente para qué? ¿Y qué se supone que son los nodos en el Hashgraph de todos modos?

Todo comienza con el **protocolo de chismes** (gossip protocol) de Hedera. Ya hemos hablado sobre esto [anteriormente en la serie](/es/blog/blockchain-101/a-primer-on-consensus/#a-bigger-network), y ya deberíamos estar familiarizados con la idea general: pasar mensajes entre pares, para que lleguen a cada miembro de la red **eventualmente**.

Pero el protocolo de chismes de Hedera [es diferente](https://docs.hedera.com/hedera/core-concepts/hashgraph-consensus-algorithms/gossip-about-gossip). Se comunican en **eventos**, que son estructuras de datos simples que contienen algunos elementos: una **marca temporal**, un **arreglo de transacciones**, una **firma** (probando la identidad del remitente), y **dos hashes** (apuntando a otros eventos), y por supuesto, su propio **hash**.

<figure>
    <img
        src="/images/blockchain-101/beyond-the-blockchain-part-1/event-structure.png"
        alt="La estructura de un evento"
        title="[zoom]" 
    />
</figure>

Todos esos elementos son clave para que el proceso general tenga éxito — pero antes de especificar el rol de cada uno, quiero primero enfocar nuestra atención en ese **par de hashes** en el evento.

Los eventos se intercambian entre nodos al azar como resultado de **sincronizar** sobre el **estado observado** de la red.

> No te preocupes, tendrá sentido pronto.

Entonces imaginemos que Alicia y Bruno están a punto de sincronizar. Intercambian sus **últimos eventos observados**, lo que significa que ahora poseen dos eventos cada uno: su propio último evento observado, y el último evento observado de la otra parte. Estos son el **evento padre-propio**, y el **evento padre-otro** respectivamente.

Y es en el siguiente paso que las cosas empiezan a encajar, **literalmente**: tanto Alicia como Bruno crean un **nuevo evento** apuntando a los dos eventos antiguos, a través de sus hashes. Este se convertirá en su nuevo **último evento observado**, así que en la siguiente comunicación con otro nodo, sincronizarán usando este evento fresco.

Nota que después de la sincronización, tanto Alicia como Bruno habrán creado eventos separados que son **imágenes espejo** uno del otro — su única diferencia siendo el orden del hash del padre-propio y el hash del padre-otro. En esencia, sin embargo, llevan la **misma información**.

<figure>
    <img
        src="/images/blockchain-101/beyond-the-blockchain-part-1/syncing.png"
        alt="Sincronización en acción"
        title="[zoom]" 
    />
</figure>

> Como una nota importante: el arreglo de transacciones en el nuevo evento está **vacío**, o incluye **nuevas transacciones** que cada nodo quiere incluir en la red. Las transacciones anteriores no se copian al nuevo evento. ¡Esta es también una de las fuentes de diferencias entre estos dos eventos hermanos!

Durante la sincronización, los participantes también intercambian **toda su historia de eventos** — o al menos, todos los eventos que el otro nodo no ha visto aún. Así que ahora, ambos tienen casi la misma historia de eventos — el mismo Hashgraph.

Esto tiene una consecuencia importante: Alicia puede saber sobre los eventos pasados de Carlos sin sincronizar jamás con él, siempre que él haya sincronizado con Bruno previamente.

<figure>
    <img
        src="/images/blockchain-101/beyond-the-blockchain-part-1/hashgraph-example.png"
        alt="Un pequeño ejemplo de un hashgraph" 
        title="[zoom] Sí, se vuelve confuso rápidamente"
    />
</figure>

Como puedes ver en el diagrama arriba, después de sincronizar con solo dos nodos, obtenemos información de eventos producidos por **otros nodos**, debido a sincronizaciones previas entre pares. ¡Bastante genial!

Al agregar más jugadores a este juego de sincronización (a través de emparejamientos aleatorios), lo que sucede es que con el tiempo, cada par en la red **eventualmente** tendrá el mismo Hashgraph. ¡Y eso formará la base para el consenso!

### Marcas Temporales de Transacciones {#transaction-timestamps}

Sin embargo, no perdamos de vista nuestro objetivo aquí: necesitamos poner **marcas temporales** en las transacciones, para poder **ordenarlas** apropiadamente.

Como participantes de la red, tenemos este grafo en constante crecimiento a nuestra disposición — entonces ¿qué tal si tratamos de **derivar una marca temporal** de él?

El Hashgraph contiene una gran cantidad de información. Importante, cada evento tiene una marca temporal, pero el asunto es que podría estar **incorrecta o ser maliciosa**. Sin embargo, con suficiente información la red puede decidir colectiva y justamente cuándo ocurrió cada transacción, a través de un proceso llamado [**votación virtual**](https://docs.hedera.com/hedera/core-concepts/hashgraph-consensus-algorithms/virtual-voting).

---

## Votación Virtual {#virtual-voting}

Normalmente, **votar** involucra intercambiar mensajes con votos entre pares. Esto se traduce en latencia, y un mecanismo de consenso en general más lento.

Pero al analizar la estructura del Hashgraph, Hedera hace algo brillante: cada nodo puede **determinar determinísticamente** cómo cada otro nodo **votaría** sobre cuándo ocurrió cada transacción, sin intercambiar explícitamente ningún voto.

<figure>
    <img
        src="/images/blockchain-101/beyond-the-blockchain-part-1/whaaat.png"
        alt="Un plátano con cara humana con expresión confundida" 
        title="¿Quiiii?"
        width="600"
    />
</figure>

Sí, es un mecanismo bastante elegante. Tratemos de tomarlo con calma. Por favor ten paciencia conmigo por un segundo.

> Y también está la [explicación del equipo de Hedera](https://docs.hedera.com/hedera/core-concepts/hashgraph-consensus-algorithms/virtual-voting). ¡También podrías querer echarle un vistazo!

El algoritmo se trata de **visibilidad**. Se basa en la idea de **eventos testigo** (witness events), que podemos pensar como checkpoints. Y el proceso se divide en tres pasos:

- División de rondas (y creación de testigos)
- Determinación de fama
- Ordenamiento

### División de Rondas {#round-division}

Cuando un nodo publica su primer evento, lo consideramos como su primer **evento testigo**, indicando el inicio de la ronda $1$. Las rondas servirán como una medida para dividir el tiempo en bloques discretos, y ayudar con el proceso de marcado temporal.

> Los eventos testigo son simplemente el primer evento creado por un nodo en cada ronda. Veremos cómo determinamos esto en un momento.

Entonces, el nodo comenzará a participar en chismorrear, aprendiendo sobre más y más eventos. Eventualmente, tendrá visibilidad (al atravesar el Hashgraph) de los eventos testigo de **otros nodos** para la ronda actual, $r$.

Y aquí, debemos hacer una distinción. **Ver** un evento significa que hay algún **camino** de un evento $A$ a un evento $B$ en alguna versión actual del Hashgraph mantenida por un nodo. Pero **ver fuertemente** significa que podemos encontrar caminos independientes de $A$ a $B$ que **pasen a través** de **eventos testigo** de al menos 2/3 (una **supermayoría**) de los participantes de la red.

> Sí, lee eso otra vez. Toma un momento entenderlo.

Algo así:

<figure>
    <img
        src="/images/blockchain-101/beyond-the-blockchain-part-1/strongly-seeing.png"
        alt="'Ver fuertemente' puesto en un DAG de muestra"
        title="[zoom]" 
    />
</figure>

> En la imagen, el evento morado ve fuertemente al evento naranja, ya que podemos encontrar caminos independientes que pasan por los eventos testigo (en azul) de 3 de 5 participantes.

Cuando un nodo crea un evento que puede ver fuertemente eventos testigo para la ronda $r - 1$ para más de 2/3 de los participantes de la red, entonces ese evento se convierte en un evento testigo para la ronda $r + 1$, marcando el inicio de una nueva ronda para ese nodo.

> La idea detrás de esto es que los nodos confirman que la ronda anterior está bien establecida antes de seguir adelante. Y pueden hacer esto cuando tienen suficiente conocimiento y observabilidad del estado de la red.

Como es un poco complicado, tratemos de ponerlo en práctica examinando un ejemplo simple, en forma de una red de juguete de tres participantes. Eso es suficiente para entender algunas advertencias aquí y allá.

Supongamos que tenemos tres nodos $A$, $B$, y $C$, y cada uno de ellos crea su primer evento. Etiquetemos esos $A_1$, $B_1$, y $C_1$, ya que todos son testigos de ronda $1$. A continuación, sigamos algunos ciclos de sincronización:

- **Sync 1: A + B**: $A$ crea $A_2$ (apuntando a $A_1$ y $B_1$), y $B$ crea $B_2$ (apuntando a $B_1$ y $A_1$)
- **Sync 2: A + C**: $A$ crea $A_3$ (apuntando a $A_2$ y $C_1$), y $C$ crea $C_2$ (apuntando a $C_1$ y $A_2$)
- **Sync 3: B + C**: $B$ crea $B_3$ (apuntando a $B_2$ y $C_2$), y $C$ crea $C_3$ (apuntando a $C_2$ y $B_3$)

Todo eso se ve así:

<figure>
    <img
        src="/images/blockchain-101/beyond-the-blockchain-part-1/three-participant.png"
        alt="Primeras rondas de sincronización de una red de tres participantes"
        title="[zoom]" 
    />
</figure>

Ahora necesitamos desentrañar, y ver si podemos determinar quiénes son los eventos testigo para la ronda $2$.

> Recuerda, la condición para avanzar a la siguiente ronda es que los eventos testigo sean vistos fuertemente.

Desde la perspectiva de $A$, tenemos que $A_3$ es el primer evento que puede ver más de 2/3 de los eventos testigo de la ronda anterior. ¡Pero necesitamos ver fuertemente, no solo ver!

Lo que significa que hay un problema - y esto requiere un caso especial: todos los eventos de la ronda $1$ se consideran vistos fuertemente. Esta es una condición importante de arranque - sin ella, la red no podría llegar a consenso en absoluto.

Con esta consideración en mente, $A_3$ es el evento testigo para la ronda $2$ para $A$. Del mismo modo, $B_3$ y $C_3$ se convierten en testigos para la ronda $2$ para $B$ y $C$ respectivamente.

Una vez que tenemos dos rondas, podemos continuar el proceso y avanzar exitosamente la red. Siguiendo la misma lógica, así es como se vería el Hashgraph después de algunas sincronizaciones más, con eventos testigo marcados en azul:

<figure>
    <img
        src="/images/blockchain-101/beyond-the-blockchain-part-1/extended-3-participant.png"
        alt="Algunas rondas más simuladas después del ejemplo anterior"
        title="[zoom] ¡Trata de seguir las aristas tú mismo!" 
    />
</figure>

Debo señalar que los eventos testigo no tienen marcadores especiales en ellos — cualquiera puede determinar si un evento es un testigo puramente de la estructura del Hashgraph. Y sí los marcan, pero **localmente**.

Eventos testigo, listo. Ahora, ¿cómo los usamos?

### Determinando Fama {#determining-fame}

Ahora llegamos al corazón de la votación virtual: determinar qué eventos testigo son **famosos**.

<figure>
    <img
        src="/images/blockchain-101/beyond-the-blockchain-part-1/famous.png"
        alt="Una chica con el título 'no me toques, soy famosa'"
        width="600"
    />
</figure>

Bromas aparte, la **fama** es un mecanismo para filtrar testigos. En resumen, no todos los testigos se vuelven famosos, y solo los testigos famosos se convierten en **puntos de control legítimos** para la red — y se toman en cuenta para decisiones de consenso.

Esa es la teoría, al menos. Pero ¿cómo determinamos la fama, y qué pasa una vez que lo hacemos?

Para determinar la fama de un testigo, miramos el Hashgraph, elegimos un testigo para la ronda $r$ (llamémoslo $A$), y nos preguntamos: ¿el testigo para la ronda $r + 1$ del nodo $X$ ve a $A$?

<figure>
    <img
        src="/images/blockchain-101/beyond-the-blockchain-part-1/fame-determination.png"
        alt="Cómo determinar la fama de testigos, en acción"
        title="[zoom]" 
    />
</figure>

> ¡Nota que requerimos solamente **ver** aquí — **cualquier camino** entre los dos testigos servirá!

Conceptualmente, lo que estamos preguntando es si algún nodo **conoce** a un testigo, y si lo hace, cuenta como un voto por su fama.

Cuando un testigo reúne una supermayoría de votos (más de 2/3), entonces se vuelve **famoso**. Y otra vez, esto es como decir:

> La mayoría de la red conoce este testigo

¡Genial! Ya casi llegamos.

### Ordenamiento de Transacciones {#transaction-ordering}

Así que hemos dividido el tiempo en rondas, identificado eventos testigo, y determinado cuáles son famosos. Ahora viene el paso final: usar estos testigos famosos para determinar exactamente cuándo ocurrió cada transacción.

> Recuerda: nuestro objetivo es determinar una marca temporal para un evento — y también las transacciones contenidas en él.

Digamos que queremos marcar temporalmente el evento $A$. En realidad, este evento (y todos los eventos) tendrá **su propia marca temporal** — pero como se mencionó previamente, el problema es que no podemos saber si esta marca temporal no está desfasada en el reloj, o incluso si es maliciosa. Simplemente no podemos confiar en ella. Así que necesitaremos un **enfoque diferente**.

Definimos el momento cuando un testigo **primero aprendió** de algún evento $A$ como la marca temporal del descendiente inmediato de $A$, que también es un ancestro del testigo. Creo que una imagen ayudará:

<figure>
    <img
        src="/images/blockchain-101/beyond-the-blockchain-part-1/first-learning.png"
        alt="Ayuda visual para explicar el concepto anterior"
        title="[zoom]" 
    />
</figure>

Habiendo definido esto, entonces el proceso es muy directo, y tiene solo dos pasos:

- El algoritmo comienza determinando la ronda donde todos los testigos famosos pueden ver nuestro evento $A$. Esto es importante — necesitamos visibilidad completa del panel de jueces (es decir, el conjunto de testigos famosos) antes de poder tomar una decisión de marca temporal.
- Luego, simplemente tomamos la media de los momentos cuando los testigos famosos **primero aprendieron** sobre el evento $A$.

¡Y eso es todo! Es como si cada testigo famoso **votara con una marca temporal**, y luego, para ser completamente justos, simplemente asignamos el mismo peso a cada voto.

<figure>
    <img
        src="/images/blockchain-101/beyond-the-blockchain-part-1/tehc.webp"
        alt="Meme de cara de stonks, con leyenda 'Tehc'"
        width="500"
    />
</figure>

Finalmente, una vez que un evento tiene marca temporal, entonces las transacciones contenidas en ese evento recibirán la misma marca temporal de consenso. Y si múltiples transacciones comparten la misma marca temporal (lo que puede suceder), entonces se ordenan por algún criterio adicional como **firmas**.

> Muy probablemente [lexicográficamente](https://en.wikipedia.org/wiki/Lexicographic_order), lo que significa alfabéticamente pero en binario o hexadecimal. Aunque no encontré el método exacto.

¡Esto logra nuestro objetivo final: obtener un **ordenamiento total** de todas las transacciones a través de toda la red! Y lo que es verdaderamente notable es que cada nodo llegará al mismo ordenamiento, sin intercambiar jamás ningún voto.

### Un Par de Notas {#a-couple-notes}

Si has estado siguiendo de cerca, podrías tener una pregunta persistente. Verás, establecimos que necesitamos una supermayoría (2/3) de votantes para determinar la marca temporal de un evento. Pero ¿cómo podemos estar seguros de que dos nodos no tienen **conjuntos supermayoritarios diferentes**?

¡Y tendrías toda la razón al preguntar! Es uno de los aspectos más sutiles del mecanismo de consenso Hashgraph.

Cuando combinamos los tres mecanismos anteriores, podemos usar algunos resultados de la **teoría de conjuntos** para probar que hay suficiente superposición para asegurar que todos llegarán a la misma conclusión. Sí, los nodos tendrán vistas temporalmente diferentes del Hashgraph, pero la magia radica en solo marcar temporalmente eventos que están "suficientemente profundos" en el DAG.

Pero esto solo si 2/3 de los nodos **son honestos**. Cada sistema distribuido tiene este tipo de umbral para **operación correcta** — o en palabras más técnicas, el umbral que garantiza [Tolerancia a Fallas Bizantinas](https://en.wikipedia.org/wiki/Byzantine_fault). Hedera tiene un umbral relativamente alto, así que es un requisito fundamental que los nodos sean **muy confiables**.

Por esta razón, Hedera opera como un **modelo de consorcio** en lugar de ser completamente sin permisos. La red está gobernada por un [consejo](https://hederacouncil.org/) de organizaciones establecidas — compañías como Google, IBM, y otras — que ejecutan los nodos de consenso. A diferencia de Bitcoin, donde cualquiera puede unirse como minero, Hedera cuidadosamente elige a sus participantes de consenso para asegurar que la suposición de 2/3 honestos se mantenga en la práctica.

<figure>
    <img
        src="/images/blockchain-101/beyond-the-blockchain-part-1/jedi-council.webp"
        alt="El consejo jedi hablando con el niño Anakin Skywalker" 
        title="Analizaremos tu propuesta, hijo"
        width="600"
    />
</figure>

Como siempre, es un compromiso: obtienes velocidad increíble y finalidad, pero sacrificas algo de **descentralización** por confiabilidad.

---

Otro aspecto a considerar es que a diferencia de una Blockchain, esta estructura Hashgraph **no puede crecer indefinidamente** — simplemente consumiría demasiada memoria. Debido a esta restricción, una vez que los eventos son **suficientemente antiguos** y su consenso ha sido finalizado, los nodos **podan** las porciones antiguas del Hashgraph.

Lo que permanece es la **historia ordenada de transacciones** — el estado final que resulta de aplicar transacciones en su orden de consenso. El Hashgraph en sí es solo una maquinaria temporal usada para consenso, pero necesita mantenerse bajo control en términos de tamaño.

Por prometedor que esto suene, vale la pena señalar que hay otro compromiso importante: mientras el Hashgraph logra consenso rápido y alto rendimiento, sacrifica las **garantías de inmutabilidad completa** de la Blockchain. En otras palabras, una Blockchain te permite **rastrear hacia atrás** todas las transacciones hasta el mismísimo bloque génesis, y verificar toda la historia si es necesario. Con el enfoque de Hedera, estás **confiando** en que el consenso podado fue computado y almacenado correctamente.

> ¡Apuesto a que no viste esa venir!

Así que otra vez, **nada es gratis**. Siento que he repetido esto mucho últimamente, ¡pero es un hecho que simplemente no puede ser subestimado!

---

## Resumen {#summary}

Hemos discutido algo súper valioso hoy: la **Blockchain** en sí no es la única solución disponible para tecnologías de libro mayor distribuido, o consenso distribuido. Y por lo que sabemos, **podría ni siquiera ser la mejor**.

> Quiero decir, ¡ni siquiera llevamos 20 años en la historia de la Blockchain aún! Quién sabe...

El enfoque de Hedera es ciertamente muy diferente, ya que no tenemos mineros o validadores — solo nodos colaborando a través de chismes. Y la estructura Hashgraph simplemente captura la **historia de comunicación completa** de la red, y no descarta nada.

El avance radica en el mecanismo de votación virtual. Puede ser un poco difícil de entender, así que recomiendo darle un par de lecturas si es necesario.

> ¡Admito que tuve que leerlo un par de veces mientras escribía este artículo!

Si algo, la solución de Hedera muestra que a veces las soluciones más elegantes emergen de cuestionar nuestras **suposiciones fundamentales**, o al menos las suposiciones de la tecnología. Al final, ¡el mensaje es mantener nuestras mentes abiertas a nuevas ideas y posibilidades!

Y solo para aclarar, no estoy tratando de vender Hedera aquí, como realmente no lo he hecho con ningún otra Blockchain en la serie. Recuerda que viene acoplado con algunos compromisos también, y en última instancia depende de nosotros, los usuarios y desarrolladores, elegir la red que mejor se adapte a nuestras necesidades.

---

¡Bueno! Eso es suficiente evangelización para un solo artículo.

En el [siguiente artículo](/es/blog/blockchain-101/beyond-the-blockchain-part-2), quiero seguir explorando estas desviaciones del modelo estándar, pero tratemos de mantenerlo más familiar. Veremos una reversión de un viejo amigo, la Prueba de Trabajo, y qué podemos hacer para evitar desperdiciar trabajo computacional.

¡Hasta entonces, mis amigos!
