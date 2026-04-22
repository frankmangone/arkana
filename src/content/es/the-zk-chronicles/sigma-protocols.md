---
title: 'Las Crónicas de ZK: Protocolos Sigma'
author: frank-mangone
date: '2026-03-23'
readingTime: 18 min
thumbnail: /images/the-zk-chronicles/sigma-protocols/sigma.webp
tags:
  - zeroKnowledgeProofs
  - sigmaProtocols
  - schnorrProtocol
  - pedersenCommitments
description: >-
  Con los esquemas de compromiso en mano, volvemos a dirigir nuestra atención
  hacia los sistemas de prueba
contentHash: a6e457e3b70a5389a716df387588f1c4bd86d9dbee5960514ee9f1cd4cb635c8
---

Al cerrar el capítulo anterior con la introducción de nuestros primeros [esquemas de compromiso](/es/blog/the-zk-chronicles/commitment-schemes-part-1), señalamos que, aunque tienen mucho potencial, **no son sistemas de prueba**. Aunque, sin duda, se sienten muy relacionados.

Pronto vamos a descubrir que sus propiedades aritméticas son la clave para desarrollar un nuevo conjunto de mecanismos de prueba, construidos una vez más a través de **interacciones inteligentes** entre un probador y un verificador.

> La noción de pruebas interactivas ya debería resultar familiar. ¡Incluso lo mencionamos en nuestro [primer encuentro](/es/blog/the-zk-chronicles/first-steps)!

Y así, tras varios artículos dedicados a dejar listo el escenario, volvemos a dirigir nuestra atención hacia la construcción de sistemas de prueba. En el proceso, vamos a descubrir algunos nuevos conceptos centrales que nos acercarán mucho más al conocimiento cero que tanto buscamos.

Este va a ser uno largo. Acomodate, agarrá un café y ¡manos a la obra!

---

## Protocolos Sigma {#sigma-protocols}

<figure>
	<img
		src="/images/the-zk-chronicles/sigma-protocols/sigma.webp"
		alt="Meme de sigma"
        title="No, no ese tipo de sigma"
	/>
</figure>

En lugar de un único protocolo, hoy vamos a ver una **familia de protocolos**, conocidos como **Protocolos Sigma**.

> ¡O Σ-protocolos, para abreviar!

Conceptualmente, son bastante simples, ya que se definen por **tres fases principales**:

- **Compromiso**: el probador envía un mensaje inicial.
- **Desafío**: el verificador envía un desafío aleatorio, que debe ser **impredecible** para el probador.
- **Respuesta**: el probador responde al desafío de manera tal que pueda probar algo sobre un enunciado.

> El patrón compromiso-desafío-respuesta está estrechamente relacionado con la etimología del nombre "sigma". Aunque, he escuchado al menos dos versiones de la historia.
>
> Una es que el patrón de ida y vuelta se asemeja a la letra griega sigma (Σ). ¡Y es verdad! Simple y llanamente.
>
> La otra, un poco más rebuscada, es que la parte "sig" viene del movimiento en zigzag de los mensajes, y que "ma" viene de **Merlin-Arthur**, una convención común para designar al probador (Merlín) y al verificador (Arturo).
>
> ¡Te dejo decidir cuál historia te gusta más!

Este patrón debería sonar muy familiar: es el mismo tipo de interacción que usamos al definir el [protocolo de verificación de la suma](/es/blog/the-zk-chronicles/sum-check), y el más complejo [protocolo GKR](/es/blog/the-zk-chronicles/circuits-part-2).

Esos eran bastante interesantes por sí mismos y, por supuesto, en el contexto adecuado. De manera similar, los protocolos Sigma tienen su área de especialización: se usan para probar el conocimiento de **valores secretos**.

> Lo cual suena a conocimiento cero, ¿no?

Y vamos a ver esto en acción de inmediato con el ejemplo más famoso.

---

## Protocolo de Schnorr {#schnorr-protocol}

Nuestro objetivo inicial va a ser tan simple como puede ser: intentaremos probar el conocimiento de un único entero secreto $x$.

> ¡Nada más, nada menos! Podemos preocuparnos por el **por qué** después.

Entonces, ¿cómo podríamos abordar esto? Ya tenemos un conjunto considerable de herramientas básicas, ¡así que quizás podemos empezar examinándolas!

Recordando nuestro breve paso por los [grupos](/es/blog/the-zk-chronicles/groups), sabemos que una forma simple de mantener un valor oculto es enterrarlo bajo un **logaritmo discreto**. En otras palabras, cuando calculamos:

$$
y = g^x
$$

Sabemos que es **infactible** recuperar $x$ de $y$ (recuerda, esta es notación para aplicar la operación de grupo $x$ veces sobre $g$).

Entonces, esta es la idea: si de alguna manera podemos convencer a un verificador de que conocemos el logaritmo discreto del elemento de grupo $y$, entonces habremos probado el conocimiento de $x$.

Este es exactamente el concepto detrás del [protocolo de Schnorr](https://en.wikipedia.org/wiki/Proof_of_knowledge#:~:text=%5Bedit%5D-,Schnorr%20protocol,-%5Bedit%5D). Y para no extendernos demasiado en introducciones, así es como funciona:

- Primero, ambas partes (el probador y el verificador) acuerdan un grupo $\mathbb{G}$ de tamaño $n$, y un generador $g$. El valor $y$ puede hacerse público.
- Luego, en la primera ronda, el probador se compromete con cierta aleatoriedad $r$, calculando y enviando:

$$
t = g^r
$$

- Al recibir este valor, el verificador muestrea un desafío aleatorio $e$, y se lo envía de vuelta al probador.

$$
e \overset{\$}{\leftarrow} \mathbb{Z}_n
$$

- El probador entonces calcula $z$, y se lo envía al verificador:

$$
z = r + e \cdot x \ (\textrm{mod} \ n)
$$

- Y finalmente, el verificador realiza esta pequeña verificación:

$$
g^z \overset{?}{=} ty^e
$$

> ¡Fíjate qué similar se ve esto a un [compromiso de Pedersen](/es/blog/the-zk-chronicles/commitment-schemes-part-1)!

Si la verificación pasa, el verificador acepta la prueba. Visualmente:

<figure>
	<img
		src="/images/the-zk-chronicles/sigma-protocols/schnorr.webp"
		alt="Diagrama del protocolo de Schnorr"
		title="[zoom]"
	/>
</figure>

Fácil, ¿no?

<figure>
	<img
		src="/images/the-zk-chronicles/sigma-protocols/equations.webp"
		alt="Meme de ecuaciones en el aire"
	/>
</figure>

> Quiero dar un ejemplo intuitivo de cómo se desarrolla esto en la práctica. Imaginá que vos, el verificador, sos daltónico. Frente a vos hay dos pelotas. Un probador afirma que las pelotas tienen **colores diferentes**, ¡pero simplemente no podés verlo!
>
> Entonces, acordás jugar este juego: primero elegís una pelota y la señalás para que el probador pueda verla. Luego, el probador se da vuelta, y vos tenés la opción de **intercambiar la posición de las pelotas** o **dejarlas en su lugar**. Ese es tu **desafío**.
>
> Finalmente, el probador se da vuelta y señala la pelota que vos habías elegido originalmente. Es más, pueden seguir jugando este juego, y si el probador acierta cada vez, ¡es muy probable que pueda ver los diferentes colores!

---

Primero queremos mostrar que este protocolo es **completo**, o que funciona cuando el verificador es honesto. Es bastante sencillo demostrar esto:

$$
g^{z \ \textrm{mod} \ n} = g^{r + x \cdot e \ \textrm{mod} \ n} = g^{r + xe} = g^r(g^x)^e = t \cdot y^e
$$

> El $\bmod n$ puede ignorarse con seguridad porque, como estamos trabajando con **grupos cíclicos** de tamaño $n$, estamos garantizados de obtener la **identidad** cada $n$ pasos.
>
> Para ser más explícitos, supongamos que $z \bmod n = h$. Entonces, sabemos que $z = h + k \cdot n$, para algún entero $k$. Sustituyendo, obtenemos: $g^z = g^h \cdot g^{kn} = g^h$. Es decir, ¡podemos ignorar la operación módulo por completo!

¡Genial! Los dos valores van a coincidir, así que el algoritmo es completo. De hecho, es **perfectamente completo**: el verificador **siempre** va a aceptar una [transcripción](/es/blog/the-zk-chronicles/enter-hashing/#the-fiat-shamir-transform) válida $(t, e, z)$.

A continuación, necesitamos ver la solidez.

### Solidez {#soundness}

Como ya sabemos, la [solidez](/es/blog/the-zk-chronicles/first-steps/#properties) requiere que demostremos que un probador tramposo no puede engañar fácilmente a un verificador.

Aquí es donde las cosas se ponen interesantes, porque hay **dos variantes** de argumentos de solidez para este protocolo. Tenemos la demostración más estándar, y luego una **condición aún más fuerte** que tiene algunas implicaciones geniales.

Empecemos con el enfoque directo: ¿qué tan difícil sería para un probador tramposo convencer a un verificador de que conoce $x$, sin realmente conocerlo? Para responder esto, notamos que para pasar la verificación, necesitan encontrar un par de valores $(t, z)$ tal que la verificación pase.

Primero, consideremos el escenario donde el probador conoce el desafío $c$ de antemano. En esta situación, hacer trampa sería bastante fácil: simplemente elegís **cualquier** $z$, y calculás $t$ como:

$$
t = g^z y^{-e}
$$

> De nuevo, recuerda que esta notación exponencial representa la operación de grupo. Ese segundo término $y^{-e}$ es el inverso de $y^e$ en el **grupo correspondiente**. Eso significa, por ejemplo, que para un grupo de curva elíptica, ¡esos puntos son simétricos respecto al eje x!

Pero como $e$ se envía **después** de comprometerse con la aleatoriedad $r$, solo tienen una de dos opciones: adivinar $c$ de antemano, o adivinar $x$ una vez que conocen $e$.

Ambos números pueden ser prácticamente cualquier valor en $\mathbb{Z}_n$, y gracias al problema del logaritmo discreto, el probador tramposo no tiene mejor opción que adivinar. Si $n$ es grande, las probabilidades de adivinar correctamente $e$ o $x$ se vuelven absurdamente pequeñas ($\approx 1/n$), ¡y así, las chances de hacer trampa son efectivamente insignificantes!

Eso es suficiente para satisfacer la solidez. ¡Pero todavía tenemos una segunda variante de solidez por explorar!

### Solidez Especial {#special-soundness}

Una de las cosas que mencionamos antes tiene una consecuencia muy interesante. Sabemos que un probador tramposo tiene pocas posibilidades de adivinar la elección de $e$ del verificador, ¿verdad? Si adivinar un único valor $e$ es difícil, ¡adivinar **dos selecciones independientes** de $e$ (digamos, $e$ y $e'$) es mucho, **mucho** menos probable!

Entonces, supongamos que ejecutamos este protocolo de Schnorr **dos veces** con la misma aleatoriedad, produciendo **dos transcripciones aceptantes** $(t, e, z)$ y $(t, e', z')$. Nuestra intuición nos dice entonces que, como el probador respondió correctamente a ambos desafíos, **debe conocer x** — porque es extremadamente improbable que haya predicho correctamente tanto $e$ como $e'$.

En realidad podemos demostrar esto: si podemos **extraer** (o recuperar) $x$ de las dos transcripciones, ¡significa que $x$ era conocido por el probador!

Esta es la estrategia: como hay dos transcripciones aceptantes, tenemos que:

$$
g^z = ty^e, \ g^{z'} = ty^{e'}
$$

Dividamos la primera ecuación por la segunda. Esto se traduce en una resta de exponentes, con la que sabemos trabajar:

$$
g^{z - z'} = ty^et^{-1}y^{-e'} = y^{e - e'} = (g^x)^{e - e'} = g^{x(e - e')}
$$

¡Miren eso! El primer y último miembro de esta ecuación tienen el mismo generador, ¡lo que significa que el exponente **debe ser igual**!

> ¡O al menos, [congruente](https://en.wikipedia.org/wiki/Congruence_relation) módulo $n$!

Todo lo que queda es resolver para $x$:

$$
x = (z - z')(e - e')^{-1} \ (\textrm{mod} \ n)
$$

¡Y **boom**! ¡Hemos **extraído el secreto** con éxito!

<figure>
	<img
		src="/images/the-zk-chronicles/sigma-protocols/extraction.webp"
		alt="El cuerpo astral del Doctor Strange siendo expulsado de su cuerpo físico por la Anciana"
		title="¡Toma esa!"
	/>
</figure>

La propiedad de poder extraer el testigo de dos transcripciones aceptantes con el mismo compromiso pero diferentes desafíos tiene un nombre: se llama **solidez especial**.

Es una garantía mucho más fuerte que la solidez básica, ya que nos dice que si un probador puede responder correctamente múltiples desafíos diferentes para el mismo compromiso, **debe** conocer el testigo. ¡No hay forma de evitarlo!

> Un pequeño detalle para los puristas: requerimos que el algoritmo de extracción se ejecute en tiempo polinomial. Esto garantiza que el extractor no sea solo teórico, sino **eficiente**.

### ¿Es Esto Conocimiento Cero? {#is-this-zero-knowledge}

¡Ah, la pregunta del millón!

Sí, el protocolo es completo y sólido. ¡Pero esta nueva solidez especial podría llevarnos a pensar que se está filtrando información! ¿Qué pasa entonces?

Es claro que la respuesta del probador $z$ involucra el secreto $x$. ¿Pero revela algo sobre él?

Bueno, si el verificador tuviera conocimiento de la aleatoriedad $r$, simplemente podría calcular:

$$
x = (z - r)e^{-1} \ \textrm{mod}  n
$$

Sin embargo, como la aleatoriedad es **desconocida** para el verificador, y solo la usamos a través de equivalencias aritméticas inteligentes, ¡el verificador **no puede hacer esto**! El valor $r$ actúa como un **factor de ocultamiento**, y el verificador no aprende nada sobre $x$ a partir de $z$.

Esa es la intuición, al menos — y debería ser suficiente para decir que el protocolo de Schnorr **es** de conocimiento cero. Exploraremos los formalismos más adelante, ¡pero esto se siente como una buena aproximación!

### Los Lenguajes Revisitados {#languages-revisited}

Por último, aunque son absolutamente necesarios, la completitud y la solidez son solo el conjunto mínimo de requisitos para que las técnicas de cómputo verificable funcionen: significan que un protocolo funciona para probadors honestos, y los deshonestos lo van a tener difícil para hacer trampa.

> ¡Incluso podemos agregar el conocimiento cero por lo que vale!

Y aquí, es un buen momento para hacer una pausa y formular la pregunta complementaria: ¿qué tiene exactamente un probador **honesto** que uno tramposo no tiene?

La respuesta es bastante obvia, al menos en este caso: conoce $x$. ¿Pero cómo hacemos eso más **preciso**?

Cuando hablamos sobre [modelos de cómputo](/es/blog/the-zk-chronicles/computation-models), introdujimos la idea de un [lenguaje](/es/blog/the-zk-chronicles/computation-models/#languages-and-decision-problems): un conjunto de enunciados para los cuales existe un testigo válido. No nos detuvimos demasiado en eso entonces, pero Schnorr nos da la excusa perfecta para trabajar con un ejemplo concreto.

Entonces, ¿cuál es el lenguaje aquí? Es simplemente el conjunto de todos los elementos de grupo $y$ para los cuales existe un logaritmo discreto:

$$
\mathcal{L} = \{y \in \mathbb{G} \ \vert \ \exists x \in \mathbb{Z}_n : g^x = y \}
$$

En este caso, el **testigo** es simplemente $x$ en sí mismo: el entero secreto del que intentamos probar el conocimiento, sin revelarlo.

Puede parecer que esto es solo un reencuadre cosmético, pero en realidad es mucho más poderoso que eso. Estamos transformando la noción de conocer el logaritmo discreto $x$ de algún valor $y$, en un enunciado sobre **pertenencia** a un conjunto. Es decir, el probador va a convencer al verificador de que $y$ pertenece al lenguaje de los elementos que tienen un logaritmo discreto (en relación a $g$), y el **testigo** es una especie de **certificado** que respalda esa afirmación.

> ¡Por supuesto, el punto de todo esto es que el verificador nunca ve dicho certificado, pero se convence de que existe!

Esto a su vez hace que la solidez especial se sienta mucho menos como un truco, y mucho más como una **garantía formal**: si un probador puede responder dos desafíos independientes para el mismo compromiso, podemos **extraer** su testigo. Y la extractabilidad es exactamente lo que queremos decir cuando decimos que un probador **conoce** algo, en lugar de simplemente tener suerte.

Volveremos a estas ideas y las haremos aún más precisas más adelante en la serie cuando veamos otro concepto estrechamente relacionado, llamado **solidez del conocimiento**. Es una versión un poco más general de la solidez especial, porque permite **interacciones ilimitadas** entre el probador y el verificador, pero la idea es la misma: eventualmente podemos extraer el testigo, lo que significa que el probador **debe conocerlo**.

Por ahora, es bueno tener este encuadre en mente — los lenguajes y los testigos van a seguir apareciendo cuando queramos formalizar las cosas, ¡y están ahí incluso si no hablamos de ellos explícitamente!

---

Con eso, hemos cubierto bastante extensamente el protocolo de Schnorr.

> ¡Hay mucho que decir sobre un procedimiento que parece tan inocente!

A esta altura, quizás esté surgiendo una pregunta en tu cabeza (si tu cerebro no está todavía fundido): **¿por qué haría eso?** ¿Por qué importaría probar el conocimiento de un **único valor**?

Dije que nos preocuparíamos por el por qué después, y creo que ya no puedo postergarlo más. Aquí va:

::: big-quote
El protocolo de Schnorr es el fundamento de innumerables protocolos criptográficos
:::

¡Sí! Hay una miríada de otros protocolos que podemos construir usando este pequeño proceso como plantilla.

Para consolidar completamente el potencial y la versatilidad de estos sistemas de prueba, quiero presentarte algunos ejemplos más.

> ¡Además, prometí que veríamos los compromisos de Pedersen en acción!

---

## Protocolo de Okamoto {#okamoto-protocol}

El siguiente paso inmediato después de ver el protocolo de Schnorr en acción es probar el conocimiento de una apertura de un [compromiso de Pedersen](/es/blog/the-zk-chronicles/commitment-schemes-part-1/#pedersen-commitments). Que, como repaso rápido, se ve así:

$$
c = g^v h^r
$$

> ¡Huelga decir que queremos hacer esto sin revelar la apertura $(v, r)$ en sí misma!

Esto es exactamente lo que resuelve el **protocolo de Okamoto**. Es otro ejemplo clásico de protocolo Sigma y, como era de esperar, comparte muchas similitudes con el de Schnorr.

De nuevo, la configuración no requiere mucho esfuerzo: necesitamos un grupo $\mathbb{G}$, generadores $g$ y $h$, y el compromiso $c$. Todos estos son completamente públicos.

El secreto del probador (a.k.a. el testigo) es, por supuesto, la apertura $(v, r)$. Procedemos en los siguientes pasos:

- El probador elige valores aleatorios $s$ y $t$, y calcula:

$$
a = g^sh^t
$$

- Al recibir esto, el verificador muestrea un único desafío aleatorio $e$, y se lo envía al probador:

$$
e \overset{\$}{\leftarrow} \mathbb{Z}_n
$$

- El probador calcula el par $(z, w)$ y se lo envía al verificador:

$$
z = s + ev \ (\textrm{mod} \ n), \ w = t + er \ (\textrm{mod} \ n)
$$

- Por último, el verificador verifica:

$$
g^zh^w \overset{?}{=} ac^e
$$

<figure>
	<img
		src="/images/the-zk-chronicles/sigma-protocols/okamoto.webp"
		alt="Diagrama del protocolo de Okamoto"
		title="[zoom]"
	/>
</figure>

¡Te invito a verificar la completitud y la solidez (quizás incluso la solidez especial) por tu cuenta!

> Y cuando verifiques la completitud, estarás usando las propiedades **homomórficas aditivas** de los compromisos de Pedersen: ¡el compromiso con los valores $(z, w)$ puede derivarse **homomórficamente** a partir de los compromisos de los valores individuales!

Lo genial de esto es que el protocolo de Okamoto puede usarse en cualquier momento que tengamos un compromiso de Pedersen en un protocolo criptográfico, y necesitamos probar que conocemos su apertura **sin revelarla**.

Podríamos ser muy creativos con esto. Sin embargo, hay un ejemplo particular que quiero que veamos, que será de especial interés en nuestra búsqueda.

¡Eso, y porque hice algunas promesas al respecto!

### Compuertas de Multiplicación {#multiplication-gates}

¡Exacto! Llegamos a un callejón sin salida [la última vez](/es/blog/the-zk-chronicles/commitment-schemes-part-1/#circuit-commitments), porque a diferencia de las compuertas de adición, las compuertas de multiplicación no funcionaron muy bien con los compromisos de Pedersen.

Señalamos de inmediato que los compromisos en sí mismos **no son sistemas de prueba**. ¡Pero ahora, armados con la noción de protocolos Sigma, quizás eso **sí** es algo que podemos hacer!

El problema requiere un encuadre ligeramente diferente, así que empecemos por ahí. Imaginemos que tenemos tres valores que corresponden a las dos entradas y la salida de una compuerta de multiplicación. Nuestro objetivo es probar que estos valores satisfacen dicha relación, pero sin revelarlos.

<figure>
	<img
		src="/images/the-zk-chronicles/commitment-schemes-part-1/multiplication-gate.webp"
		alt="Una compuerta de multiplicación"
		title="[zoom]"
	/>
</figure>

Para ocultar estos valores, primero nos comprometemos con ellos, usando por supuesto nuestro confiable esquema de compromiso de Pedersen:

$$
c_a = g^ah^{r_a}, \ c_b = g^bh^{r_b}, \ c_c = g^ch^{r_c}
$$

Multiplicar compromisos ya no funciona, pero recuerda: ¡todo lo que necesitamos es probar que los valores satisfacen la relación! Entonces, usaremos el protocolo de Okamoto, junto con un poco más.

Funciona así:

- El probador muestrea cinco valores aleatorios $s_1$ a $s_5$. Para los primeros cuatro, los compromete normalmente:

$$
\alpha = g^{s_1}h^{s_2}, \ \beta = g^{s_3}h^{s_4}
$$

- El último compromiso es ligeramente diferente: en lugar de usar el generador $g$, lo intercambiamos por el **compromiso a** $a$ (confía en mí por un momento, prometo que las cosas se cancelarán bien después):

$$
\gamma = c_a^{s_3}h^{s_5}
$$

- Luego, el verificador envía el desafío habitual $e$.
- El probador calcula un total de **cinco respuestas**. Las primeras cuatro son bastante directas:

$$
z_1 = s_1 + ea, \ z_2 = s_2 + er_a, z_3 = s_3 + eb, \ z_4 = s_4 + er_b
$$

- Pero la última es un poco diferente:

$$
z_5 = s_5 + e(r_c - r_ab)
$$

- Con esta información, el verificador está listo para realizar sus verificaciones.

Entonces, ¿qué verificaciones deben ejecutar? Evidentemente, pueden validar el conocimiento de $a$ y $b$ usando exactamente la misma receta del protocolo de Okamoto:

$$
g^{z_1}h^{z_2} \overset{?}{=} a{c_a}^e, \ g^{z_3}h^{z_4} \overset{?}{=} b{c_b}^e
$$

Sin sorpresas aquí. ¿Pero qué podemos hacer con $c$?

Esto:

$$
{c_a}^{z_3}h^{z_5} \overset{?}{=} \gamma {c_c}^e
$$

**¿Qué?**

<figure>
	<img
		src="/images/the-zk-chronicles/sigma-protocols/panic.webp"
		alt="Mike Wazowski gritando"
	/>
</figure>

Respira, solo respira. Vamos paso a paso.

Debemos verificar esto expandiendo las expresiones. Empezando por el lado izquierdo, y asumiendo por supuesto que $c = a \cdot b$:

$$
{c_a}^{z_3}h^{z_5} = (g^ah^{r_a})^{s_3 + eb}h^{s_5 + e(r_c - r_ab)} = g^{a(s_3 + eb)}h^{r_a(s_3 + eb) + s_5 + e(r_c - r_ab)}
$$

$$
= g^{as_3 + eab}h^{r_as_3 + r_aeb + s_5 + er_c - er_ab} = g^{as_3 + ec}h^{r_as_3 + s_5 + er_c}
$$

Y ahora empezamos a agrupar las cosas:

$$
= (g^{a})^{s_3}(h^{r_a})^{s_3}(g^{c})^e(h^{r_c})^eh^{s_5} = {c_a}^{s_3}h^{s_5}{c_c}^e = \gamma {c_c}^e
$$

¡Como por arte de magia, llegamos a la expresión esperada! **¿Qué clase de hechicería es esta?**

<figure>
	<img
		src="/images/the-zk-chronicles/sigma-protocols/sorcery.webp"
		alt="Phil Dunphy con su clásica frase '¡hechicería!'" 
		title="¡Hechicería!"
	/>
</figure>

La clave de este asunto está en una cancelación quirúrgica, cortesía de la forma en que definimos $z_5$. No fue un accidente: tiene que ver con el hecho de que, cuando $c = a \cdot b$, podemos jugar con el compromiso a $c$, usando un truco milenario: multiplicar por $1$, y expresar ese $1$ de una **manera conveniente**. Aquí:

$$
c_c = g^{c}h^{r_c} = g^{ab}h^{r_ab}h^{r_c}h^{-r_ab} = {c_a}^bh^{r_c-r_ab}
$$

¡Ajá! ¡Fíjate en ese último exponente! Se parece bastante a $z_5$.

Lo que sucede es que podemos interpretar el compromiso a $c$ de manera alternativa: como un compromiso a $b$, usando los generadores $c_a$ y $h$, y una aleatoriedad muy específica que actúa como el **término de corrección**. Combinado con el compromiso $\gamma$, y con una manipulación apropiada de los compromisos, todo **encaja perfectamente**.

Y así, el método es completo.

> ¡Una vez más voy a omitir la demostración de solidez para ser breve, pero puedes intentarlo tú mismo si así lo deseas!

En resumen: reinterpretando inteligentemente los compromisos y usando protocolos Sigma, podemos probar que **tres valores ocultos** satisfacen $c = a \cdot b$ sin revelarlos nunca. ¡Genial!

---

## Circuitos {#circuits}

A esta altura, hemos acumulado toda una caja de herramientas. Tenemos una manera de probar el conocimiento de aperturas para una compuerta de multiplicación, y si lo piensas bien, el protocolo de Okamoto en su forma básica funcionaría para las compuertas de adición.

> ¡Aunque las propiedades homomórficas de los compromisos de Pedersen deberían ser suficientes para trabajar con ellas!

Hmm... Pero si podemos tratar ambos tipos de compuertas, ¿no podemos manejar **circuitos aritméticos completos**? ¿No podríamos probar que todas las compuertas son correctas simultáneamente?

<figure>
	<img
		src="/images/the-zk-chronicles/sigma-protocols/woaaa.webp"
		alt="Meme del gato asombrado"
		title="¡Guaau!"
	/>
</figure>

¡Sí! Si nos comprometemos con cada cable, un verificador podría trabajar fácilmente a través de las compuertas de adición (de hecho, no necesitamos comprometernos con la salida de las compuertas de adición), y podemos usar un protocolo Sigma separado para cada compuerta de multiplicación.

Es una idea noble... Y una con un problema obvio. La estrategia escala mal a medida que aumenta el número de compuertas de multiplicación, lo que se traduce en un número creciente de pasos de comunicación requeridos.

> O en un tamaño de prueba mayor, al aplicar la [transformación de Fiat-Shamir](/es/blog/the-zk-chronicles/enter-hashing/#the-fiat-shamir-transform).

Sin embargo, no todo está perdido, ya que podemos mitigar esto mediante un truco genial: ¡la **composición**!

### Composición {#composition}

Componer afirmaciones juntas significa que podemos verificar dos o más aperturas **al mismo tiempo**. Y hay dos variantes para esto: probamos el conocimiento de **ambos enunciados** (composición **AND**) o probamos el conocimiento de **alguno de los enunciados** (composición **OR**).

> ¡Por supuesto, en la composición OR, la idea es no revelar de cuál enunciado tenemos conocimiento!

Para los circuitos en particular, lo que necesitamos es probar el conocimiento de todos los compromisos de todas las compuertas de multiplicación, todo a la vez. Esa es exactamente la idea de la composición AND. ¿Entonces cómo lo hacemos?

El truco para esto es sorprendentemente simple: en lugar de ejecutar protocolos separados con diferentes desafíos para cada compuerta, ¡usamos un **único desafío compartido** $e$ para todos!

Concretamente, el probador enviaría todos los compromisos ($\alpha$, $\beta$, y $\gamma$ para cada compuerta de multiplicación), y el verificador enviaría un desafío $e$ en respuesta. El probador responde a todas las compuertas usando ese mismo $e$, y la verificación ocurre bajo esta misma suposición.

Y es perfectamente seguro hacerlo: un probador tramposo igualmente tendría que adivinar el valor, ¡así que esto es **igual de difícil** **que antes**!

¡Así, podemos manejar el circuito completo en un único ciclo compromiso-desafío-respuesta!

> La composición OR, por otro lado, no es muy útil para nuestros propósitos. Sin embargo, puede ser una base sólida para cosas como las [firmas anillo](/es/blog/cryptography-101/signatures-recharged/#ring-signatures) y las credenciales anónimas.

---

Todo está bien hasta que nos damos cuenta de que los circuitos pueden tener un **número muy grande** de compuertas de multiplicación.

Esto es problemático por un pequeño detalle que no mencioné: el número de compromisos escala **linealmente** con el número de compuertas de multiplicación. Y el escalado lineal no es el mejor: un circuito con millones de compuertas requerirá enviar un número de compromisos y elementos de campo también en el orden de los millones.

Así que, sí... Hemos topado con otro muro.

A pesar de ser técnicamente posible, esta alternativa no es realmente práctica para circuitos grandes. Y para producir pruebas más manejables, los sistemas más avanzados aplican varias **optimizaciones**.

---

## Resumen {#summary}

Oh vaya. Eso fue mucho.

Mi cerebro se siente como papilla después de escribir todo esto, así que me imagino que vos también estás cansado. ¡Pero oye! Hoy cubrimos **mucho terreno**.

Los protocolos Sigma son muy útiles. Incluso pueden usarse como **subprotocolos** de construcciones más complejas. Y creo que enmarqué la composición de manera algo pesimista, pero en realidad es una buena herramienta para tener, especialmente cuando tratamos con un pequeño número de compromisos.

Importantemente, aplicamos con éxito nuestro recién adquirido conocimiento sobre grupos para construir un nuevo tipo de protocolo.

---

Dada su simplicidad, se nos perdonaría pensar que no hay mucho que podamos hacer con los grupos. Y eso no podría estar **más lejos de la verdad**.

Especialmente por las **optimizaciones** que mencioné antes. No quiero arruinar la diversión, pero para darte una pequeña pista, esto tiene que ver con cómo **codificamos los circuitos**.

En lugar de pensar en los circuitos como colecciones de **compuertas individuales**, en cambio, reinterpretarlos como algo de lo que no hemos hablado por un tiempo: ¡[polinomios](/es/blog/the-zk-chronicles/math-foundations/#polynomials)!

> ¿Pensabas que habíamos terminado con ellos? ¡Ja!

¡Y en lugar de verificar millones de restricciones individuales, el verificador puede verificar algunas identidades polinomiales y terminar con todo!

Trabajar con polinomios de manera eficiente depende de un único algoritmo — y este algoritmo tiene todo que ver con los grupos.

Por lo tanto, antes de continuar con sistemas de prueba más avanzados, necesitaremos hacer una parada estratégica para entender este mecanismo, que no es menos que uno de los algoritmos más importantes y elegantes que la humanidad haya desarrollado.

¡Acompáñame en el [próximo](/es/blog/the-zk-chronicles/fast-fourier-transform) para descubrir de qué se trata!
