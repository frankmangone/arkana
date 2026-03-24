---
title: 'Las Crónicas de ZK: Esquemas de Compromiso (Parte 1)'
author: frank-mangone
date: '2026-03-08'
readingTime: 14 min
thumbnail: /images/the-zk-chronicles/commitment-schemes-part-1/penn-teller-1.webp
tags:
  - zeroKnowledgeProofs
  - pedersenCommitments
  - homomorphism
description: >-
  ¡Es hora de empezar a construir sobre las primitivas que conocemos hasta
  ahora!
contentHash: 6d79005fb2ebbfd84cdbd3f5836f2143b598110ade21c9bc8048c04a05d14f91
---

Después de recorrer el último [par](/es/blog/the-zk-chronicles/enter-hashing) de [artículos](/es/blog/the-zk-chronicles/groups), ya deberíamos tener varias de las piezas centrales que hacen funcionar al cómputo verificable.

A medida que empezamos a combinar estos elementos, comienzan a emerger comportamientos ricos: comportamientos que se van a convertir en las capas mismas que componen los algoritmos modernos a los que venimos haciendo referencia desde hace rato.

Hoy vamos a explorar una de esas familias de construcciones. Es una de las ideas más simples en criptografía y, aun así, tiene un rol crucial en una enorme cantidad de protocolos, incluso fuera del alcance del cómputo verificable.

¡Espero que eso alcance para engancharte con lo que viene! Si ese es el caso, vamos a meternos de lleno.

---

## Compromisos {#commitments}

El tema central de hoy son los **compromisos criptográficos**.

> ¡Como si no lo hubiera spoileado el título!

Lo primero que queremos entender es qué es exactamente un compromiso. Informalmente, **comprometerse con** algo significa hacer una **promesa** (o incluso podríamos decir un tipo especial de promesa), atando a quien la hace a un cierto curso de acción.

Si eso no sonó muy intuitivo, no te preocupes. Hay una analogía muy buena para visualizar mejor cómo se ve esto en la práctica.

Imagina por un segundo que estás viendo un show de magia. En algún momento, el mago escribe una **predicción** sobre un resultado futuro en un papel, la coloca en un **sobre sellado** y deja ese sobre en una mesa mientras el show continúa.

Nosotros, como audiencia, no podemos saber qué hay dentro de ese sobre. Y mientras el show sigue, alguien elige una carta al azar de un mazo, e inmediatamente después el mago abre el sobre para revelar la predicción... ¡y boom! Coincide.

<figure>
	<img
		src="/images/the-zk-chronicles/commitment-schemes-part-1/penn-teller-1.webp"
		alt="Penn y Teller aplaudiendo"
		title="¡Bravo!"
	/>
</figure>

La razón por la que nos impresiona es porque la predicción fue hecha **antes** de la elección, y el mago hizo un **compromiso** con su decisión al ponerla en el sobre, lo cual transmite un mensaje muy simple pero muy poderoso: una vez dentro del sobre, el mago **ya no puede cambiar su predicción**.

> Lo gracioso es que, después de meterme en magia durante varios años, sé que el truco usualmente está en otra parte... ¡Pero no le arruinemos la diversión a quienes todavía creen!

Además, la predicción queda **oculta** para nosotros hasta la gran revelación.

Ambas características —que el mensaje esté oculto y que la predicción se haya hecho antes de la elección— son cruciales para que el truco funcione. Creo que estarás de acuerdo conmigo en que no sería lo mismo sin ese dramatismo.

Y esa es la idea central: te comprometes con un valor oculto, y luego "abres el sobre" para revelarlo.

<figure>
	<img
		src="/images/the-zk-chronicles/commitment-schemes-part-1/envelope.webp"
		alt="Ejemplo de apertura de un sobre"
        title="[zoom]"
	/>
</figure>

### Compromisos Criptográficos {#cryptographic-commitments}

Es una buena analogía, pero digamos lo obvio: ninguna de las herramientas matemáticas que tenemos a mano funciona como un sobre.

Entonces... ¿qué tal si **construimos uno**?

Veamos. Sabemos que el mecanismo que queremos crear necesita tener dos propiedades que ya mencionamos en el ejemplo de arriba:

- Debe ser **hiding**: no deberíamos poder aprender cuál es el valor comprometido mirando el compromiso (igual que no podemos ver dentro del sobre).
- Debe ser **binding**: el compromiso tiene un único valor asociado válido (igual que obtenemos un único valor cuando abrimos el sobre).

¿Cómo hacemos eso? Imagina esto: construimos una función `commit()` que toma el valor original, al que vamos a llamar $v$, y produce otro valor al que llamaremos $c$, el **compromiso de** $v$.

Ahora, en lugar de abrir literalmente los compromisos, queremos verificar si un valor provisto coincide con el compromiso. Para eso, construimos **otra función** `verify()` que toma tanto $c$ como $v$, y devuelve $0$ o $1$, donde el resultado indica si el valor provisto $v$ coincide con el compromiso o no.

<figure>
	<img
		src="/images/the-zk-chronicles/commitment-schemes-part-1/commitment.webp"
		alt="Flujo de un compromiso"
        title="[zoom]"
	/>
</figure>

Hay múltiples maneras de hacer esto, cada una con sus propias particularidades interesantes. Pero hay una estrategia que es bellamente simple, y al mismo tiempo revela otro aspecto importante que tenemos que tener en cuenta.

### Un Enfoque Básico {#a-basic-approach}

¡La cosa más simple que podemos hacer, y que funciona como esquema de compromiso, es usar **funciones hash**! De forma ingenua, podemos comprometernos con un valor simplemente **hasheándolo**:

$$
c = H(v)
$$

Piénsalo:

- A primera vista, el requisito de **hiding** se cumple. En general, sabemos que recuperar $v$ analizando $c$ es inviable para funciones hash seguras.
- Si una función hash es resistente a colisiones, tienes la garantía de que encontrar otro valor distinto de $v$ (digamos, $v’$) que comparta el mismo hash también es muy difícil. Entonces, encontrar **dos aperturas válidas** no va a pasar, y el mecanismo es **binding**.

Además, abrir el compromiso es súper fácil: solo hasheas $v$ y comparas contra $c$.

Y ahí podría terminar la historia. Pero... hay un gran problema.

<figure>
	<img
		src="/images/the-zk-chronicles/commitment-schemes-part-1/gollum.webp"
		alt="Gollum, preocupado"
		title="Oh no..."
	/>
</figure>

Veamos un ejemplo. Imagina que estamos jugando piedra-papel-tijera por **turnos**.

Sí, juego raro, ¿no? Sobre todo porque quien juega primero tiene garantizado perder. A menos, claro, que en lugar de jugar directamente, primero hagamos un **compromiso** de la jugada.

Sería algo así:

- Alice juega tijera, pero le envía a Bob un compromiso de su jugada, o sea $H(\text{scissors})$.
- Luego Bob juega papel enviándole el valor a Alice.
- Finalmente, Alice revela su jugada original, y Bob puede verificar la integridad de ese reclamo gracias al compromiso original.

Hasta ahí, todo bien. Ahora, ¿qué pasa si juegan una **segunda ronda**? Si Alice vuelve a jugar tijera, como los hashes son **determinísticos**, Bob recibiría exactamente el mismo valor $H(\text{scissors})$ otra vez. Entonces puede deducir la decisión de Alice, jugar piedra y ganar.

¿Qué salió mal? Simple: el compromiso **dejó de ser hiding**. Y esto nos lleva a una conclusión muy importante:

::: big-quote
Compromisos sucesivos del mismo valor deben ser distintos
:::

Esto se resuelve fácilmente eligiendo un valor aleatorio cada vez que nos comprometemos con un valor y metiéndolo en la mezcla:

$$
r \overset{\$}{\leftarrow} \{0,1\}^k
$$

$$
c = H(v, r)
$$

> Para aclarar, la primera expresión de arriba significa muestrear aleatoriamente $k$ bits. Y el hash tradicionalmente se calcula **concatenando** los valores de $v$ y $r$.

Este nuevo elemento, llamado **aleatoriedad** (o **nonce**), tiene la responsabilidad de **cegar** los compromisos, para que no haya dos compromisos del mismo valor que se vean iguales. Claro, esto requiere proveer $r$ junto con $v$ al momento de abrir, pero es un precio menor para que el mecanismo tenga sentido.

Y ahora Alice puede volver a jugar tijera en paz.

<figure>
	<img
		src="/images/the-zk-chronicles/commitment-schemes-part-1/oogway.webp"
		alt="Maestro Oogway con la frase 'finally, inner peace'"
	/>
</figure>

Con este pequeño ajuste, ya tenemos un **esquema de compromiso utilizable**. A pesar de su simpleza, es perfectamente adecuado para la aplicación correcta.

### Limitaciones {#limitations}

Sin embargo, el cómputo verificable demanda un poco más de **estructura**. Verás, el esquema basado en hashes que describimos produce un valor de compromiso que no es más que una **cadena de bits**. Más allá de abrirlo, no hay mucho más que podamos hacer. Y para nosotros, eso es una limitación.

En muchos protocolos criptográficos, en especial los que estamos estudiando, vamos a necesitar probar afirmaciones sobre las **relaciones entre valores comprometidos**, todo esto **sin revelar los valores en sí**.

> Te voy a pedir que me creas por un momento que esta es una propiedad valiosa, ¡y en un minuto veremos por qué!

Lo que necesitamos entonces es encontrar una forma de diseñar compromisos que se comporten como **objetos algebraicos**: elementos con los que podamos operar (sumar, multiplicar), preservando las **relaciones** entre los valores originales. Dicho informalmente:

$$
v_1 + v_2 = v_3 \Rightarrow c_1 + c_2 = c_3
$$

> Solo una pequeña sutileza acá: las operaciones **normalmente no son las mismas**. En realidad, la relación debería ser un [homomorfismo](/es/blog/cryptography-101/homomorphism-and-isomorphisms).
>
> No hace falta preocuparse por esto ahora, pero quiero ser preciso con los hechos para los puristas de la sala.

Y así, el camino por delante está claro: ¿cómo construimos ese tipo de esquema de compromiso?

---

## Compromisos de Pedersen {#pedersen-commitments}

Para encontrar algunas respuestas, no hace falta mirar más allá de las **otras herramientas básicas** que tenemos a disposición.

Los hashes eran buenos para ocultar el valor original por lo difícil que es revertirlos. En ese aspecto, también conocemos otro problema difícil de romper: el [problema del logaritmo discreto](/es/blog/the-zk-chronicles/groups/#the-discrete-logarithm-problem) de los **grupos** que vimos en el artículo anterior.

Bien, probemos eso. Digamos que estamos trabajando con algún grupo $\mathbb{G}$, y que podemos encontrar dos generadores distintos $g$ y $h$.

Si queremos comprometernos con algún valor $v$, primero muestreamos algo de aleatoriedad $r$:

$$
r \overset{\$}{\leftarrow} {\mathbb{Z}_p}^*
$$

Y luego calculamos el compromiso así:

$$
c = g^v.h^r
$$

Esto se conoce como un [compromiso de Pedersen](https://rareskills.io/post/pedersen-commitment), y es uno de los esquemas de compromiso más importantes que existen, tanto para cómputo verificable como para criptografía en general.

Una de las principales razones de su popularidad son sus **propiedades homomórficas**: se comporta como un objeto algebraico, justo como queríamos. Puedes comprobarlo tomando dos compromisos distintos $c_1$ y $c_2$, y **multiplicándolos entre sí**:

$$
c_1 \cdot c_2 = g^{v_1}h^{r_1}g^{v_2}h^{r_2} = g^{v_1 + v_2}h^{r_1 + r_2} = c_{1 + 2}
$$

Y como por arte de magia, obtenemos un compromiso válido para la suma de los valores originales, ¡operando sobre el espacio de compromisos!

<figure>
	<img
		src="/images/the-zk-chronicles/commitment-schemes-part-1/penn-teller-2.webp"
		alt="Teller impresionado"
		title="¡Una locura!"
	/>
</figure>

> Antes de que me olvide, necesito explicar por qué exactamente necesitamos dos generadores. Después de todo, la propiedad que acabamos de mostrar seguiría funcionando con uno solo. ¡Hay un pequeño problema con esa idea, igual: el método **deja de ser binding**! Imagina que nuestro compromiso se calculara como $g^{v+r}$. La propiedad de binding requiere que **solo** los valores $(v, r)$ sean aperturas válidas. Pero cualquier par de valores de la forma $(v + n, r - n)$ sería una apertura válida, porque el $n$ se cancelaría.
>
> Al agregar otro generador en la ecuación, evitamos este tropiezo problemático.

¡Excelente! Compromisos de Pedersen, listo.

Lo que queda es ver cómo esta propiedad homomórfica es útil en la práctica. ¡Hora de saltar a la acción!

### Compromisos de Circuitos {#circuit-commitments}

En cómputo verificable, rara vez nos importa un número solitario. Lo que realmente nos importa son **cómputos completos**: circuitos llenos de valores interconectados que deben satisfacer relaciones específicas.

Empecemos de a poco. Imagina que tenemos una sola **compuerta de suma**, con sus dos entradas y su resultado. Llamémoslos $a$, $b$ y $c$.

<figure>
	<img
		src="/images/the-zk-chronicles/commitment-schemes-part-1/addition-gate.webp"
		alt="Una compuerta de suma"
        title="[zoom]"
	/>
</figure>

Como vimos en un [encuentro anterior](/es/blog/the-zk-chronicles/groups), probar que esta compuerta está correctamente evaluada significa probar que $a + b = c$. Ahora, supón que en los sistemas de prueba que vamos a diseñar queremos **comprometernos** con estos valores en lugar de revelarlos de entrada.

El enfoque ingenuo acá es comprometerse con los tres valores, y luego enviar **aperturas de los tres valores** también. Si estuviéramos usando compromisos hash, esto significaría que necesitamos enviar tres mensajes al momento de abrir (o 6, si contamos la aleatoriedad), y que el verificador solo podría chequear la relación en ese momento.

Esto no es un problema para una sola compuerta, pero escala mal para circuitos grandes.

Con compromisos de Pedersen, sin embargo, la historia es distinta. Primero, podemos ahorrar overhead de comunicación: solo necesitamos enviar las aperturas de $a$ y $b$, y el verificador puede calcular $c$ por su cuenta para compararlo contra el compromiso original:

$$
g^ch^{r_c} = g^{a+b}h^{r_a + r_b}
$$

Pero hay algo todavía más poderoso ocurriendo acá: ¡el verificador puede chequear que la relación se cumple sin ver jamás los valores comprometidos!

> ¡Estamos moviendo parte del trabajo al momento de comprometerse, en lugar de hacerlo al momento de la verificación!

Ok, ¡eso está buenísimo! Para un circuito que solo tenga compuertas de suma, podríamos aplicar esta idea a todas las compuertas y construir un protocolo que abuse esta idea, reduciendo dramáticamente costos de comunicación, y permitiendo que el verificador compruebe por su cuenta la consistencia de los compromisos.

¿Pero qué pasa con las compuertas de multiplicación?

<figure>
	<img
		src="/images/the-zk-chronicles/commitment-schemes-part-1/addition-gate.webp"
		alt="Una compuerta de multiplicación"
        title="[zoom]"
	/>
</figure>

Lamentablemente, acá chocamos contra una pared.

Para compuertas de suma, todo salió hermoso porque los compromisos de Pedersen son **homomórficos aditivos**. Pero como se basan en grupos, estos compromisos solo pueden soportar homomorfismos para **una operación**. En consecuencia, no hay una manipulación igual de simple que podamos hacer aquí: no podemos derivar fácilmente un compromiso de $v_3$ a partir de los compromisos de $v_1$ y $v_2$.

Entonces... ¿estamos atascados?

<figure>
	<img
		src="/images/the-zk-chronicles/commitment-schemes-part-1/sweat.webp"
		alt="Escena de aterrizaje de emergencia en ¿Y dónde está el piloto?"
	/>
</figure>

¡Para nada!

Lo que esta limitación realmente nos está diciendo es que los compromisos por sí solos **pueden no ser suficientes**. Para manejar compuertas de multiplicación, necesitamos un enfoque distinto: una forma de que un probador convenza a un verificador de que una relación como $v \cdot u = w$ se cumple entre valores comprometidos, todo sin revelarlos.

En otras palabras, ¡necesitamos pruebas sobre compromisos!

Casualmente, este es precisamente el tipo de protocolos que estamos construyendo en nuestra búsqueda por conocimiento cero. Vamos a usar compromisos como los de Pedersen como una especie de **columna vertebral algebraica** de nuestros sistemas, mientras les agregamos **pruebas interactivas** por encima (que pueden convertirse en no interactivas mediante [Fiat-Shamir](/es/blog/the-zk-chronicles/enter-hashing/#the-fiat-shamir-tranform)) para probar las relaciones entre los valores comprometidos.

En resumen:

::: big-quote
Los compromisos no son sistemas de prueba, pero proveen la estructura necesaria para que los sistemas de prueba funcionen
:::

¡Y eso debería ser motivación suficiente para seguir avanzando!

---

## Compromisos de Vectores {#vector-commitments}

Antes de llegar a esos sistemas de prueba, sin embargo, hay otra pregunta práctica que tenemos que resolver.

Hasta ahora solo hablamos de comprometernos con **un solo valor** a la vez. Esto difícilmente sea realista: los cómputos suelen involucrar cientos, miles o incluso **millones** de valores.

Eso plantea un problema real de cara al futuro: enviar un compromiso independiente por valor es una receta de manual para escalar mal.

Es natural preguntarnos si podemos hacerlo mejor. Y por suerte, la respuesta es **sí**: ese es exactamente el rol de los **compromisos de vectores**.

La idea detrás de los compromisos de vectores es directa: producir un único compromiso compacto que, de alguna forma, logre representar una **lista completa de valores**.

Más adelante, deberíamos poder abrir solo un **componente individual** del vector sin tener que revelar todo lo demás. En otras palabras, queremos **aperturas selectivas**: pruebas de que una entrada específica $v_i$ era parte de la lista original de valores, manteniendo oculto el resto.

¿Cómo construimos eso, te preguntarás? Bueno, ¡saluda a un viejo amigo!

### Pedersen como Compromiso de Vectores {#pedersen-as-a-vector-commitment}

> ¡Sí!

Los compromisos de Pedersen pueden funcionar como compromisos de vectores. Piénsalo: ¿qué pasa si, en lugar de usar solo dos generadores $g$ y $h$, tomamos toda una **familia** de $n$ generadores $g_i$?

Podemos entonces tratar una lista de $n$ valores $(v_1, v_2, ..., v_n)$ así:

$$
c = g_1^{v_1}g_2^{v_2}...g_n^{v_n}h^r = h^r\prod_{i=1}^n g_i^{v_i}
$$

> ¡Voy a omitir los índices del producto de ahora en adelante solo para simplificar un poco la notación!

¡Y eso es todo! Un solo elemento del grupo, representando el compromiso de $n$ valores distintos.

Esta construcción se conoce como un **compromiso vectorial de Pedersen**, e hereda todas las propiedades lindas que nos importan:

- Es **hiding**, gracias a la aleatoriedad $r$ y al generador $h$. De hecho, es **perfectamente hiding**: incluso con **poder computacional infinito**, no puedes determinar los valores comprometidos solo a partir de $c$.
- Es **binding**, gracias a la suposición del logaritmo discreto.
- Y, lo más importante para nosotros, es **homomórfico**: tiene todas esas propiedades aditivas lindas que ya discutimos.

> Además, el esquema de compromiso es **compresor**: ¡el tamaño del compromiso es mucho menor que el tamaño de los valores comprometidos!

Ese último punto es crucial. Mira, si tenemos dos vectores $v$ y $u$ con compromisos:

$$
c_u = h^{r}\prod g_i^{u_i}, c_v = h^{s}\prod g_i^{v_i}
$$

entonces **multiplicar esos compromisos** da:

$$
c_v \cdot c_u = h^{r + s} \prod g_i^{u_i + v_i}
$$

que es precisamente un compromiso válido de la **suma componente a componente** de los vectores.

Está buenísimo, ¿no?

<figure>
	<img
		src="/images/the-zk-chronicles/commitment-schemes-part-1/nice.webp"
		alt="Meme del hombre asintiendo de Robert Redford"
		title="Oh yeah"
	/>
</figure>

### Aperturas {#openings}

Claro, comprometerse con un vector es solo la mitad de la historia. Eventualmente, necesitamos poder convencer a un verificador de que un componente particular estaba incluido en el compromiso. La forma ingenua de hacerlo es revelar **todos los componentes** del vector y, por supuesto, la aleatoriedad junto con ellos.

Espera... ¿Pero qué pasa si solo queremos **revelar un componente**, y aun así probar que era parte del vector original? ¡Entonces esta estrategia de apertura **derrota el propósito**!

Este es prácticamente el mismo problema que tuvimos con las compuertas de multiplicación: nuestro lindo gadget matemático **no es un sistema de prueba** por sí mismo. Así que, si bien los compromisos de Pedersen nos dan una forma compacta y amigable con el álgebra para agrupar valores, todavía no nos dan aperturas selectivas eficientes por sí solos.

> Para eso vamos a necesitar técnicas más avanzadas.

### Más Allá de Pedersen {#beyond-pedersen}

Los compromisos vectoriales de Pedersen son conceptualmente simples y extremadamente útiles, especialmente dentro de sistemas de prueba donde a menudo **manipulamos compromisos algebraicamente** en lugar de abrirlos de forma directa.

Sin embargo, en escenarios donde realmente necesitamos aperturas selectivas escalables (por ejemplo, probar membresía de un solo elemento en un dataset enorme), otras construcciones suelen encajar mejor.

Existen varias familias de esquemas de compromisos vectoriales, cada una con distintos trade-offs.

> De hecho, una familia se basa en una construcción que ya vimos: ¡[árboles de Merkle](/es/blog/the-zk-chronicles/enter-hashing/#merkle-trees)!

Pero todavía es muy pronto para meternos demasiado en esas aguas. Mejor evitarlas por ahora para que los conceptos no se nos mezclen.

Por ahora, lo importante es la idea grande:

::: big-quotes
Los compromisos de vectores nos permiten comprimir grandes cantidades de datos estructurados en un único compromiso corto, al mismo tiempo que habilitan pruebas sobre componentes individuales
:::

Y esta idea de compromisos compactos, combinada con pruebas sobre ellos, es uno de los pilares centrales de los protocolos modernos de conocimiento cero.

---

## Resumen {#summary}

¡Y con eso cerramos el tema de compromisos, **por ahora**!

Ya nos movimos un poco más allá del territorio de fundamentos matemáticos, y ahora estamos construyendo **componentes reales** para lo que viene.

Sí, la complejidad empieza a crecer, y eso puede asustar al principio. Pero como mencioné antes, estas ideas se vuelven **capas** que luego apilamos para construir nuestros sistemas de prueba. Desde esa perspectiva, puedes mirar el panorama grande y aun así entender qué está pasando. Los detalles finos hacen falta según qué tan lejos quieras llegar.

> O sea, si vas a implementar esto, **obvio** que necesitas el detalle fino. Pero si solo estás usando librerías para construir tus pruebas, quizás con las ideas generales alcanza.
>
> ¡Pero quizá no estarías acá si ese fuera el caso!

Con eso en mente, podemos resumir el artículo de hoy bastante rápido:

::: big-quote
Los compromisos criptográficos son mecanismos que permiten a alguien fijar un valor manteniéndolo oculto, con la capacidad de revelarlo más adelante
:::

Para nuestro objetivo de cómputo verificable, establecimos que la capacidad de manipular compromisos va a ser un factor crucial para el diseño exitoso de nuestros sistemas de prueba. Pero también vimos que para otros tipos de aplicaciones, mecanismos más simples (como los compromisos basados en hashes que discutimos al comienzo de este post) pueden ser todo lo que necesitamos.

Lo que queda ahora es entender cómo podemos **probar cosas** sobre nuestros compromisos. ¡Y esa será nuestra [próxima parada](/es/blog/the-zk-chronicles/sigma-protocols)!
