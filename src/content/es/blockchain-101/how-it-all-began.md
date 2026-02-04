---
title: 'Blockchain 101: Cómo Todo Empezó'
date: '2024-08-31'
author: frank-mangone
thumbnail: /images/blockchain-101/how-it-all-began/el-zorro.webp
tags:
  - blockchain
  - bitcoin
  - cryptocurrency
  - cryptography
description: >-
  Emprendemos un nuevo viaje, donde exploramos la increíble tecnología de las
  Blockchains
readingTime: 10 min
contentHash: a94f6790d1b10ae93907e523618fa4422dedcf73d4ded754aa9279eed34355cd
supabaseId: c4c001f5-f436-4283-9003-a32b23cdc39c
---

Estaba muy indeciso sobre escribir este primer artículo sobre Blockchain. Principalmente porque es una de esas tecnologías que se mueve a **velocidad de la luz**, con innovaciones surgiendo de la nada muy frecuentemente. Es un mundo lleno de ideas geniales y diversas — así que es realmente difícil hacerles justicia en solo unos pocos artículos cortos.

Al mismo tiempo, esto es **exactamente** lo que me impulsó a comenzar a escribir: la enorme cantidad de información para absorber es **gigantesca**, y es fácil perderse en la abundancia de términos específicos y peculiares.

Sé que ese fue **mi** caso, al menos.

Debido a esto, aunque la serie [Criptografía 101](/es/reading-lists/cryptography-101/) aún no ha terminado, decidí embarcarme en este **nuevo camino**, donde exploramos los conceptos e ideas detrás de las tecnologías **Blockchain**. Mi esperanza es darte algunas herramientas para navegar mejor este terreno rocoso — pero la mayor parte de la **exploración** y el **experimentar** dependerá completamente de ti.

> ¡Y para los veteranos de Blockchain, un repaso nunca es una mala idea!

Sin mucho más que agregar, ¡zarpemos en esta nueva aventura! ¡Espero que lo disfrutes!

---

## Contexto {#context}

Antes de siquiera mencionar qué es una Blockchain o cómo funciona, debemos tomar un minuto para entender cómo normalmente **manejamos el dinero**, ya que hay un par de cosas que podrían ser potencialmente problemáticas — y que fueron la motivación inicial para el desarrollo de las Blockchains.

Cómo funciona el dinero es en sí mismo un **tema fascinante**, y probablemente sea demasiado pronto para que nos adentremos en ese agujero de conejo. Lo que nos importa por ahora es que puede ser **físico** o **digital**.

El dinero físico tiene la interesante propiedad inherente de que **no puede gastarse dos veces** — a menos que de alguna manera recuperes el dinero después de pagar, lo cual probablemente sería altamente poco ético.

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/el-zorro.webp" 
    alt="El Zorro"
    title="¡Devuélveme eso, quiero gastarlo de nuevo!"
  />
</figure>

Por el contrario, ir por la ruta digital requiere que **alguien** **procese** nuestras transacciones. Este alguien también está a cargo de asegurar que el dinero **no se gaste dos veces**, y que tanto la cantidad de dinero que tengo (llamado **saldo**) como el **saldo del receptor** se actualicen correctamente.

Dado que este alguien — llamémoslo **procesador** — maneja todas estas operaciones, significa que necesitamos **confiar en ellos** para que hagan un buen trabajo. Ah, y también pagarles por sus servicios.

> Estos procesadores suelen ser **bancos** o están de alguna manera asociados con ellos.

No me malinterpretes, esto funciona bien en su mayor parte. Pero hay **algunas situaciones** que pueden ser engorrosas para nosotros los usuarios.

Solo por nombrar algunas:

- ¿Qué sucede si el procesador es **hackeado**? Podríamos quedarnos sin forma de gastar nuestro dinero, o incluso ver nuestras cuentas vaciadas.
- Si el procesador decide **prohibirnos realizar transacciones**, estaríamos bloqueados de nuestros fondos, ¡sin capacidad de gastar nuestro dinero!
- El procesador comienza a **cobrarte más** por sus servicios.
- Los servidores donde el procesador funciona **explotan repentinamente**. El servicio está caído, y tu información de saldo se pierde para siempre.

> Bueno, esa última puede ser excesivamente extrema — ¡pero nunca se puede descartar los accidentes!

Suelen adoptarse medidas de seguridad para evitar este tipo de situaciones. Pero lo que quiero enfatizar es el hecho de que todos los problemas anteriores provienen de un solo factor: el **procesador centralizado** y **de confianza**.

Podríamos preguntarnos: ¿**eliminar** este intermediario resolvería estos problemas? ¿Cómo **haríamos eso**?

Y así, un [fatídico día en 2008](https://www.onthisday.com/date/2008/october/31), se publicó un artículo de la nada — su autor, Satoshi Nakamoto, aún desconocido hasta hoy —, que cambiaría el juego para siempre: el [artículo de Bitcoin](https://bitcoin.org/bitcoin.pdf).

En su esencia, lo que **Bitcoin** propone es bastante simple: siempre que muchas personas puedan estar de acuerdo en una **historia** de transacciones, entonces todos conocen el estado actual de las cosas.

Para visualizar esto, hagamos un pequeño ejercicio.

---

## Un Ejemplo Juguete {#a-toy-example}

Digamos que Alice, Bob y Charlie quieren crear un sistema de efectivo **sin** un **procesador intermediario**. Deciden que todos comienzan con algo de dinero — quizás $100$ **monedas** —, y todo lo que quieren hacer es **transaccionar entre ellos**.

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/alice-bob-charlie-balance.webp" 
    alt="Alice, Bob y Charlie, cada uno con 100 como saldo inicial"
    title="[zoom]"
    className="bg-white"
  />
</figure>

Estas monedas solo tienen valor para **ellos**.

> Por ejemplo, Alice puede pagarle a Bob $10$ monedas para que arregle su impresora, y Bob puede elegir gastar $15$ monedas para que Alice le enseñe yoga básico. Lo que acuerden, realmente.

Su enfoque es mantener sus saldos en una hoja de cálculo compartida, y modificarlos cuando quieran enviar dinero entre ellos. ¿Super seguro, verdad?

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/smart.webp" 
    alt="Meme de inteligencia"
  />
</figure>

Por supuesto, hay un par de problemas aquí. Digamos que Alice quiere hacer trampa, y escribe en la hoja que Bob le envió $20$ monedas. Bob no consintió esto. Bob no está contento con esto.

Se desata una feroz discusión entre ellos, y para calmar las cosas, Charlie sugiere una idea: ¿qué tal si todos **firman** sus transacciones?

> Por firmar, me refiero a [firmar digitalmente](/es/blog/cryptography-101/encryption-and-digital-signatures/#digital-signatures).

De esta manera, todos realizarían transacciones **solo** cuando **consientan** explícitamente a ellas. Las firmas digitales tienen la agradable propiedad de ser **verificables** — lo que significa que solo Bob puede firmar por Bob, pero todos pueden verificar que Bob firmó una transacción.

Con esto, cualquiera podría entrar en la hoja de cálculo y colocar sus **transacciones**, que estarían estructuradas así:

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/basic-transaction.webp" 
    alt="Una transacción básica, con origen, destino, cantidad y firma"
    title="[zoom]"
    className="bg-white"
  />
</figure>

Cualquiera podría verificar que la transacción es válida comprobando la firma, y así, los saldos pueden actualizarse de manera segura.

### Ordenamiento de Transacciones {#transaction-ordering}

¡Ese es un problema resuelto! Pero hay otros — por ejemplo, intentar gastar **más de lo que tienes**. Esto se evita fácilmente rechazando cualquier transacción que intente mover más monedas de las que tenemos en nuestro saldo.

Sin embargo, hay uno en particular que es **muy complicado**. Supongamos que Alice tiene $10$ monedas. Ella envía dos transacciones: una a Bob por $6$ monedas, y una a Charlie por $5$ monedas. No tiene suficiente dinero para realizar **ambas** transacciones — ¿cómo deberíamos resolver esta situación?

La respuesta es muy simple: la transacción que **ocurra primero** será la **válida**, y la siguiente **no lo será**. Parece que todo lo que tenemos que hacer es adjuntar una **marca de tiempo** a la transacción:

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/timestamp.webp" 
    alt="Transacciones con marcas de tiempo"
    title="[zoom] La segunda será inválida ya que Alice no tiene suficientes fondos"
    className="bg-white"
  />
</figure>

---

Ahora... Una sola hoja de cálculo sigue siendo un **punto único de fallo**. En un mal día, Bob podría simplemente borrar la información en la hoja, y su mini-economía sería destruida en un instante.

> Charlie parece ser el único buen tipo en este ejemplo.

Buscamos algo **más robusto**, si el plan es crear un **sistema de efectivo** para que todos lo usen. Con eso, veamos qué propone Bitcoin.

---

## La Solución de Bitcoin {#the-bitcoin-solution}

Para eliminar intermediarios y hacer el sistema más robusto, Bitcoin propone el uso de una **red**, compuesta por **nodos**, que tienen una forma de estar de acuerdo en una **historia compartida de transacciones**, definiendo así el **estado** actual de la red.

Tendremos tiempo para entender mejor qué es un **nodo** más adelante. En lo que necesitamos enfocarnos es en cómo se ponen de acuerdo en la historia de transacciones — cómo logran lo que llamamos **consenso**.

> Spoiler: es un poco más complicado que una hoja de cálculo.

Para estar de acuerdo en una historia, primero necesitamos tener un **modelo** para ella. Bitcoin propuso representarla como **bloques**.

### Una Cadena de Bloques {#a-chain-of-blocks}

A primera vista, esto se sentirá extraño. Todo lo que realmente queremos es poner una **marca de tiempo** en cada transacción, para determinar cuál viene primero.

El problema es que es muy ineficiente para una red con múltiples actores estar de acuerdo en marcas de tiempo **una por una**. Y también necesitamos decidir cómo **almacenar** esta información — sabemos que no será en una hoja de cálculo, pero... ¿Dónde?

Dividamos esto en dos partes. Primero, en lugar de estar de acuerdo en transacciones individuales, podríamos estar de acuerdo en **grupos** de transacciones — llamemos a dicho grupo un **bloque**. Como este:

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/block.webp" 
    alt="Un bloque simple con algunas transacciones"
    title="[zoom] Nuestro primer acercamiento a un bloque"
    className="bg-white"
    width="500"
  />
</figure>

> ¡Recuerda que cada transacción está **digitalmente firmada** por el remitente!

A continuación, necesitamos establecer un **orden de bloques**. Esto es simple de hacer: necesitamos agregar una **referencia** al bloque anterior. De esta manera, podemos verificar qué sucedió en el bloque anterior, y en el anterior a ese, y así sucesivamente, hasta llegar al **principio de los tiempos**. **Vaya**.

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/woah.webp" 
    alt="Caricatura colorida de un individuo impresionado"
    width="250"
  />
</figure>

Bromeando — solo podemos retroceder hasta el **primer bloque**, que comúnmente se conoce como el **bloque génesis**. Así que nuestra **cadena** (de ahí el nombre **blockchain**) de bloques se vería así:

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/block-chain.webp" 
    alt="Una cadena simple de bloques"
    title="[zoom]"
    className="bg-white"
    width="500"
  />
</figure>

Así, hemos establecido un mecanismo para **ordenar transacciones** — pueden no tener una marca de tiempo explícita asociada a ellas, pero tienen un orden relativo.

> Es decir, la transacción en el **bloque #2** seguramente ocurrió después de las del **bloque #1**. Pero, ya sabes, ¡también podríamos agregar una marca de tiempo por si acaso!

¡Vamos por buen camino con nuestro modelo básico! No sabemos realmente qué es ese **ID de bloque**, pero lo descubriremos muy pronto — porque la siguiente pregunta que tenemos que responder es ¿cómo se ponen todos de acuerdo en **cuál es el orden correcto de los bloques**?

---

## Acuerdo Colectivo {#collective-agreement}

Recapitulando, mencionamos cómo estos **nodos** quieren comunicarse entre sí, y **de alguna manera** estar de acuerdo en una historia compartida. Simplifiquemos, e imaginemos por un momento que estos nodos son **personas**, hablando en un chat grupal.

Alice quiere agregar un bloque a la cadena. Así que toma algunas transacciones (**de dónde** es un asunto que discutiremos en artículos próximos), construye un bloque apuntando al **final actual** de la cadena, y lo envía al chat grupal.

Naturalmente, todos necesitarían verificar que las **transacciones propuestas** son válidas — pero quiero enfocarme en otro problema. Digamos que Bob quiere vengarse de Alice, y envía **otro bloque** al mismo tiempo.

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/conversation.webp" 
    alt="Una conversación simulando la naturaleza asíncrona de las propuestas de bloques"
    title="[zoom] Siempre el pacífico grupo de personas"
    className="bg-white"
    width="600"
  />
</figure>

Nos enfrentamos a un **dilema**: ¿deberíamos incluir el bloque de Alice o el de Bob? Son **ambos válidos**, y ambos apuntan al final de la cadena. ¿Y cómo nos **ponemos todos de acuerdo** en elegir uno de los dos?

---

Bitcoin propuso una solución interesante, ahora llamada **Prueba de Trabajo** (o **PoW** para abreviar). Simplificando un poco, la idea es que proponer un bloque **no es tan trivial** como nuestro ejemplo anterior. Bloquearemos la capacidad de proponer un bloque detrás de un **rompecabezas matemático**.

### Trabajando por Bloques {#working-for-blocks}

Aquí hay una idea: si pudiéramos de alguna manera **aleatorizar** quién puede proponer un bloque válido, entonces podríamos evitar este tipo de problemas de **concurrencia** (también conocido como Bob siendo una molestia). Y hay una herramienta en criptografía que tiene este tipo de comportamiento pseudoaleatorio: ¡**funciones hash**! ¿Qué tal si intentamos aprovechar eso para nuestros propósitos?

> ¡Asumo que entiendes qué es una función hash. Si no, ¡te recomiendo encarecidamente leer [este artículo](/es/blog/cryptography-101/hashing)!

Así que ahora, proponer un bloque tiene dos pasos: seleccionar un conjunto de transacciones, y luego **hashear** el contenido del bloque.

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/hashing.webp" 
    alt="Hashing del contenido de un bloque"
    title="[zoom]"
    className="bg-white"
    width="700"
  />
</figure>

Los **hashes** son solo una **secuencia de bits de tamaño fijo**, que (de nuevo, simplificando) parece aleatoria. Un buen rompecabezas que podríamos plantear es requerir que el hash comience con **algún número de ceros**.

> Algo como 0$00000000001011010101110$...

Las **funciones hash** no son reversibles, lo que significa que no podemos proponer un valor hash, e intentar recuperar las entradas originales — así que todo lo que podemos hacer es **prueba y error**. Esto es, modificar las entradas, y esperar la salida requerida. La dificultad de este rompecabezas depende del **número de ceros** al principio del hash — o **ceros iniciales**. El rompecabezas se resuelve cuando encontramos un **hash ganador**.

> Es como ganar la lotería.

Pero esto es algo poco práctico, ¿verdad? Si queremos cambiar la entrada, necesitamos seleccionar un **conjunto diferente de transacciones** para incluir en el bloque. Alguien creando un bloque **puede no querer hacer eso**. ¿No hay nada que podamos hacer al respecto?

**¡Claro que sí**! Podemos incluir un valor especial en nuestros bloques, llamado **nonce**, que podemos modificar a nuestro antojo, hasta obtener el hash que necesitamos:

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/with-nonce.webp" 
    alt="Hashing con un nonce"
    title="[zoom]"
    className="bg-white"
    width="700"
  />
</figure>

Con esto, hemos hecho que el proceso de generar bloques válidos sea **aleatorio**, y efectivamente hemos frustrado los planes de Bob. Este proceso de cambiar el nonce hasta encontrar un hash válido es a lo que nos referimos como **minería** — volveremos a esto en el futuro.

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/savage.webp" 
    alt="El meme del tipo aplaudiendo en la multitud, impresionado"
    title="Salvaje"
    width="600"
  />
</figure>

Resumiendo, esto permite que todos mantengan una copia de la **blockchain completa**, y pueden hacerla crecer **aceptando bloques válidos**, que solo se producen de una **manera aleatoria** por un usuario que encuentra un **hash ganador**. Esto responde a la pregunta de **dónde** se almacena la información: **en todas partes**.

Un pequeño ajuste más está en orden: el **ID de bloque**, que intencionalmente evitamos mencionar hasta ahora, se establece como el **hash calculado**. Esto tendrá implicaciones interesantes, que discutiremos más adelante.

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/full-blockchain.webp" 
    alt="Blockchain, con punteros de ID"
    title="[zoom]"
    className="bg-white"
  />
</figure>

---

## Resumen {#summary}

Ahora es un buen momento para detenernos, por ahora. Hay **muchos** más detalles que necesitamos cubrir para entender completamente **Bitcoin** — que es solo la **primera de muchas** Blockchains que cubriremos en esta serie, y la más simple de entender.

Es importante destacar que ya hemos introducido algunos conceptos y términos importantes, que serán cruciales en nuestro viaje. Sabemos qué representa una **Blockchain** — una historia compartida de transacciones —, y hemos notado que algunos componentes criptográficos son importantes, específicamente [firmas digitales](/es/blog/cryptography-101/encryption-and-digital-signatures/#digital-signatures) y [funciones hash](/es/blog/cryptography-101/hashing).

Y también comenzamos a entender cómo la red **se pone de acuerdo** en **cómo evoluciona la Blockchain**. Esto es solo la punta del iceberg, ya que nuestro mecanismo de hash resuelve algunos problemas, pero deja otros sin atender.

Antes de aprender sobre el mecanismo de acuerdo, nos centraremos en el alma de una Blockchain: **transacciones**. ¡Ese será el tema para nuestro [próximo encuentro](/es/blog/blockchain-101/transactions)!
