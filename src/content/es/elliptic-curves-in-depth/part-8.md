---
title: Curvas Elípticas En Profundidad (Parte 8)
date: "2025-07-23"
author: frank-mangone
thumbnail: /images/elliptic-curves-in-depth/part-8/barassi.jpg
tags:
  - cryptography
  - mathematics
  - ellipticCurves
  - pairings
  - torsion
description: >-
  Con los grupos de torsión en mano, podemos ahora explorar la definición formal
  de los pairings.
readingTime: 11 min
contentHash: 36ac4a90c78fd0159a98a169329c3cb8784f15a3a7bcae2a5ba710e285929c73
supabaseId: null
---

Después de nuestra expedición a través de las enmarañadas junglas de los [grupos de torsión](/es/blog/elliptic-curves-in-depth/part-7), continuamos nuestro viaje presentando los **pairings**.

Como mencioné la última vez, esta es la segunda parte de la sección de tres partes de la serie sobre estas fascinantes construcciones.

Sin embargo, necesitaremos más que solo el artículo anterior. De hecho, necesitaremos todo lo que hemos hablado en los **últimos** artículos, porque los [divisores](/es/blog/elliptic-curves-in-depth/part-5) también juegan un papel crucial en la definición de los pairings.

Las cosas no se volverán más fáciles, así que recomiendo tomarlo con calma si es necesario, y darle tiempo a los conceptos para que se asienten.

> No va a ser bonito, pero llegaremos.

Bienvenidos a bordo del expreso de los pairings. Seré tu guía.

---

## Preliminares {#preliminaries}

Antes de presentar los **dos pairings** que exploraremos en este artículo, hay un par de cosas que necesitamos ver - algunos principios utilizados en ambas definiciones de pairings.

Cuando hablamos de divisores, uno de los conceptos principales que tratamos fue el de [divisores principales](/es/blog/elliptic-curves-in-depth/part-5/#principal-divisors). Estos representan divisores para **funciones**, y tienen dos características definitorias:

- Una es que las multiplicidades de los puntos (los valores $n_P$) suman cero, o que el **grado** del divisor es $0$.
- La otra, que no hemos mencionado aún, es esta:

$$
\sum_{P \in E(\bar{\mathbb{F}}_q)} [n_P]P = \mathcal{O}
$$

> Esto es una consecuencia del [teorema de Abel-Jacobi](https://en.wikipedia.org/wiki/Abel%E2%80%93Jacobi_map#:~:text=of%20principal%20divisors.-,Abel%E2%80%93Jacobi%20theorem,-%5Bedit%5D), que es lo suficientemente complicado como para que no queramos ir allí ahora. ¡Involucra conceptos topológicos interesantes que podríamos explorar en el futuro!

Esto significa que para algún entero $m$, podemos construir una función $f_{m,P}$ con el siguiente divisor:

$$
(f_{m,P}) = m(P) - ([m]P) - (m - 1)(\mathcal{O})
$$

Es obviamente un divisor principal, porque la suma de las multiplicidades es cero (tiene grado cero), y porque $[m]P - [m]P$ es claramente $\mathcal{O}$.

Si elegimos $m = r$, el divisor de esta función se reduce a:

$$
(f_{r,P}) = r(P) - r(\mathcal{O})
$$

¡Necesitaremos este pequeño divisor aquí para entender nuestras definiciones de pairings!

### Evaluando un Divisor {#evaluating-a-divisor}

La otra cosa que necesitaremos es entender cómo **evaluar una función** en un divisor. Esto es, dada una función:

$$
f: E(\bar{\mathbb{F}}_q) \rightarrow \mathbb{F}_q
$$

Nos gustaría poder definir qué es $f(D)$, dado que $D$ es algún divisor.

De hecho, hay una definición bastante natural para esto:

$$
f(D) = \prod_{P \in E(\bar{\mathbb{F}}_q)} f(P)^{n_P}
$$

> ¡Como $f$ solo puede tomar puntos en la curva como entradas, no tenemos muchas más opciones! Aún así, pronto veremos de primera mano que esta definición es muy conveniente.

A decir verdad, esto no siempre funciona. Para que esto tenga sentido, necesitamos imponer una condición extra: es necesario que $(f)$ y $D$ tengan **soportes disjuntos**.

Recuerda que el [soporte](/es/blog/elliptic-curves-in-depth/part-5/#divisors-on-a-curve) de un divisor es el conjunto de puntos con multiplicidades no nulas - lo que significa que son o bien un **cero**, o un **polo** de la función (que por supuesto está definida sobre una curva, lo que significa que realmente son los puntos de intersección, como ya sabemos).

Entonces, si $(f)$ y $D$ comparten un punto en sus soportes, esto significa que algún valor de $f(P)$ será o bien $0$ o **infinito** - haciendo que todo el producto colapse a cero, o se dispare al infinito.

¡Con soportes disjuntos, nos aseguramos de que $f(D)$ producirá algún valor significativo!

---

¡Bien, ese es el final de la introducción! ¿Cómo nos sentimos?

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-8/barassi.jpg" 
    alt="El celebridad de televisión argentina Barassi con una mirada de dolor"
    width="600"
    title="¿Dios mío hay más?"
  />
</figure>

Sí, hay más. Con esto, finalmente podemos definir los pairings. ¡Hagámoslo!

---

## El Pairing de Weil {#the-weil-pairing}

Ya sabemos que los pairings son funciones de la forma:

$$
e: \mathbb{G}_1 \times \mathbb{G}_2 \rightarrow \mathbb{G}_3
$$

Las entradas no son más que dos puntos $P$ y $Q$ en la curva. Pero no cualquier punto - restringámoslos a la [r-torsión](/es/blog/elliptic-curves-in-depth/part-7/#torsion-groups). Veremos por qué en solo unos minutos.

Otra cosa que sabemos es que podemos mapear puntos a divisores fácilmente, a través del isomorfismo que definimos cuando trabajamos con [el grupo de Mordell-Weil](/es/blog/elliptic-curves-in-depth/part-5/#the-mordell-weil-group):

$$
P \mapsto D_P = (P) - (\mathcal{O})
$$

$$
Q \mapsto D_Q = (Q) - (\mathcal{O})
$$

Y a través de la noción de [equivalencia de divisores](/es/blog/elliptic-curves-in-depth/part-5/#the-picard-group), podemos encontrar divisores equivalentes a los asociados con $P$ y $Q$, de tal manera que tengan soportes disjuntos.

Con esto en mente, el **pairing de Weil** se define como:

$$
w_r(P,Q) = \frac{f(D_Q)}{g(D_P)}
$$

Dado que las funciones $f$ y $g$ tienen divisores:

$$
(f) = rD_P, \ (g) = rD_Q
$$

> Lo sé. Esto puede parecer un poco decepcionante después de tantas definiciones y matemáticas profundas. Pero ciertamente hay mucho que desempacar aquí... ¡Esta fachada poco inspiradora ciertamente esconde mucho!

Una inspección más cercana revela un problema: el requisito de **soportes disjuntos** no se cumple. Tanto las funciones como los divisores comparten un punto en sus soportes: $\mathcal{O}$. Y sabemos lo que eso significa - el pairing no estará bien definido.

Parece que estamos en un aprieto.

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-8/pickle-rick.jpg" 
    alt="Pickle Rick de Rick and Morty"
    width="600"
    title="¡Pickle Riiiick!"
  />
</figure>

> El chiste funciona en inglés, porque la expresión "in a pickle" significa "en un aprieto". Las disculpas correspondientes del caso.

¿Cuál es el truco esta vez? Una vez más, ¡la **equivalencia de divisores**!

Solo uno de los dos divisores necesita ser actualizado (y su función asociada, por supuesto), pero veamos cómo actualizaríamos ambos, para mantener las cosas justas.

> No discriminamos divisores aquí.

Para esto, elegimos otros dos puntos aleatorios en la curva, $R$ y $S$, y seguimos el mismo proceso descrito [aquí](/es/blog/elliptic-curves-in-depth/part-5/#the-mordell-weil-group). Todo lo que hacemos es usar nuestra confiable y efectiva regla de la cuerda y la tangente. Como repaso, veámosla en acción con solo $P$ y $R$:

- Dibujamos la línea que pasa por esos puntos. Tendrá divisor $(\ell) = (P) + (R) + (-(P + R)) - 3(\mathcal{O})$.
- Dibujamos la línea vertical a través de $-(P + R)$; el divisor para esta línea será por supuesto $v = (-(P + R)) + (P + R) - 2(\mathcal{O})$.
- Finalmente, solo sumamos $(v)$ y restamos $(\ell)$:

$$
(P) - (\mathcal{O}) + (v) - (\ell) = (P+R) - (R)
$$

Ten en cuenta que estos divisores son **equivalentes**, porque su diferencia es el divisor de una función.

### Actualizando las Funciones {#updating-the-functions}

¿Qué hay de $f$ y $g$, sin embargo? Hemos actualizado las entradas, sí, pero toda la esencia del asunto es encontrar funciones para estos nuevos divisores que acabamos de encontrar.

Toma la $f$ original, por ejemplo. Era una función tal que:

$$
(f) = rD_P = r(P) - r(\mathcal{O})
$$

Y ahora necesitamos encontrar alguna función $f'$ tal que:

$$
(f') = r{D_P}' = r(P + R) - r(R)
$$

Si tienes buen ojo, puede que hayas notado la similitud con el proceso de conversión de divisores - todo lo que necesitamos hacer es aplicar ese procedimiento exactamente $r$ veces.

$$
(f') = (f) + r(v) - r(\ell)
$$

¡Sorprendentemente fácil, diría yo!

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-8/kombucha.png" 
    alt="Meme de la chica del kombucha"
    width="500"
  />
</figure>

Esta transformación de divisores es equivalente a multiplicar la función original $f$ por $v / \ell$ exactamente $r$ veces, así que:

$$
f' = f\left ( \frac{v}{\ell} \right )^r
$$

¡Maravilloso! Ahora tenemos todos los elementos que necesitamos para calcular el pairing.

Aún así... No sé ustedes, pero no estoy convencido **para nada** de que esta función $w$ sea **bilineal**.

### Reciprocidad de Weil {#weil-reciprocity}

Tienes toda la razón en ser suspicaz - la expresión que construimos parece bastante arbitraria sin más contexto.

Como era de esperar, nos falta la **especia secreta** aquí.

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-8/lisan.jpg" 
    alt="Lisan al Gaib de Dune mirando fieramente a la cámara"
    width="600"
    title="¿Dijiste especia?"
  />
</figure>

La magia que hace que esto funcione se llama **reciprocidad de Weil**, que es un poderoso teorema que establece que para cualquier par de funciones $f$ y $g$ en una curva elíptica, y sus divisores $(f)$ y $(g)$, se cumple que:

$$
\frac{f((g))}{g((f))} = 1
$$

> De nuevo, una expresión simple e inocua. Sin embargo, bajo el capó, esto nos dice que hay alguna **simetría fundamental** en cómo las funciones "ven" los divisores de las otras.

No nos demoremos demasiado en los detalles. Lo que es más emocionante es cómo esto juega en la definición del pairing. Por reciprocidad de Weil, sabemos que:

$$
\frac{f_{r,P}((g_{r,Q}))}{g_{r,Q}((f_{r,P}))} = \frac{f_{r,P}(rD_Q)}{g_{r,Q}(rD_P)} = 1
$$

Pero debido a cómo definimos las evaluaciones de funciones sobre divisores, esto en realidad se puede reescribir como:

$$
\left ( \frac{f_{r,P}(D_Q)}{g_{r,Q}(D_P)} \right )^r = 1
$$

> En realidad, para que esto funcione, también requerimos que las evaluaciones funcionales de $(\mathcal{O})$ den exactamente $1$. Esto no es necesariamente cierto, pero generalmente hay un proceso de **normalización** involucrado para asegurar esta condición.
>
> También es importante mencionar que este paso aquí es por qué usar puntos de r-torsión es crucial - ¡si no, no habríamos podido factorizar $r$!

Bueno, bueno, bueno... ¡Mira eso! ¡Es nuestro pairing elevado a la $r$! Lo que significa que la salida de nuestro pairing no es otra cosa que una **raíz r-ésima de la unidad** en el campo.

### Bilinealidad {#bilinearity}

Sin embargo, eso no dice nada sobre la bilinealidad.

Vamos un paso más allá. Para que nuestro pairing sea bilineal, requerimos que:

$$
w_r(P_1 + P_2, Q) = w_r(P_1,Q).w_r(P_2,Q)
$$

> Necesitaríamos probarlo para ambas entradas, por supuesto - pero se puede hacer un argumento similar para la que estamos omitiendo.

Como ya sabemos, necesitaremos construir una función para esa primera entrada con divisor $r(P_1​ + P_2​) − r(\mathcal{O})$. Afortunadamente, hay una manera directa de hacer eso, y es nuevamente aprovechando la **regla de la cuerda y la tangente**.

Verás, al aplicar este proceso, obtenemos la siguiente equivalencia de divisores:

$$
(P_1 + P_2) \sim (P_1) + (P_2) - (\mathcal{O})
$$

Nada nos impide multiplicar ambos lados por $r$:

$$
r(P_1 + P_2) \sim r(P_1) + r(P_2) - r(\mathcal{O})
$$

La equivalencia de divisores solo significa que estos divisores difieren entre sí por alguna función que llamaremos $\phi$. Y si restamos $r(\mathcal{O})$ de ambos lados:

$$
r(P_1 + P_2) - r(\mathcal{O}) = r(P_1) - r(\mathcal{O}) + r(P_2) - r(\mathcal{O}) + (\phi)
$$

¡Ahí lo tienes! Ese es el divisor que buscábamos. En términos de divisores de funciones, la expresión se mapea al siguiente producto:

$$
f_{r, P_1 + P_2} = f_{r, P_1}.f_{r, P_2}.\phi
$$

Todo esto para decir: para probar la bilinealidad, solo necesitamos mostrar que:

$$
\phi(D_Q) = 1
$$

La misma maquinaria se aplica una vez más: evaluación de funciones sobre divisores, soportes disjuntos, y una aplicación final de la reciprocidad de Weil. Podemos mostrar que este término extra $\phi$ efectivamente **se desvanece**, dándonos la bilinealidad.

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-8/confused-cat.png" 
    alt="Gato confundido"
    title="Yo tipo 'ahhh okay'... Pero no entiendo"
    width="500"
  />
</figure>

¡Así que sí! Si bien la fórmula del pairing podría haber parecido arbitraria al principio, ¡está estrechamente relacionada con la reciprocidad de Weil, que es el pegamento que une todo esto!

---

## El Pairing de Tate {#the-tate-pairing}

Ese es un pairing menos - pero hay otro que quiero mostrarte.

Es un poco diferente del último - mientras que el pairing de Weil requería que ambas entradas vinieran de la r-torsión, el pairing de Tate es ligeramente más flexible ya que formalmente solo necesita que una de ellas sea un punto de r-torsión.

Me imagino que estás bastante cansado a estas alturas.

> ¡Toma un descanso si lo necesitas!

Sin embargo, una mala noticia: a pesar de la flexibilidad extra, este pairing es arguiblemente **más complicado** que el anterior. Intentaré mantenerlo amigable sin embargo.

Y para empezar, necesitamos algunas definiciones.

### Un Nuevo Grupo {#a-new-group}

La r-torsión, como ya sabemos, es el conjunto de todos los puntos tales que $[r]P = \mathcal{O}$.

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-8/it-is-known.gif" 
    alt="Escena 'Es sabido' de Game of Thrones"
    width="500"
  />
</figure>

Ahora, ¿qué pasa cuando multiplicamos otros puntos por $r$? Vamos a recolectarlos todos en otro conjunto, $rE$.

$$
rE = \{ [r]P \ : \ P \in E(\mathbb{F}_{q^k}) \}
$$

Este es solo el conjunto de todos los puntos "$r$ veces algo". Resulta que esto forma un **subgrupo** de nuestra curva elíptica.

Similar a cómo tratamos los [anillos cociente](/es/blog/cryptography-101/rings/#quotient-rings), podemos usar este grupo para definir un "grupo cociente" $E/rE$ - interpretado como "$E$ módulo $rE$", donde dos puntos se consideran iguales si su **diferencia** está en $rE$.

> En otras palabras, los puntos $P_1$ y $P_2$ son equivalentes si $P_1 - P_2 = [r]Q$ para algún punto $Q$.

Ahora, digamos que elegimos algún punto $P$. Y comenzamos a generar puntos mediante la siguiente estrategia: elegimos otro punto $Q_1$, y calculamos $P + [r]Q_1$. Luego hacemos lo mismo con $Q_2$, $Q_3$, $Q_4$, y así sucesivamente, hasta que se nos acaban los puntos en la curva.

Lo que encontrarás es que has obtenido un **subconjunto** de $E$. Si eliges otro punto de partida (que no esté en este nuevo subconjunto), obtendrás un **subconjunto completamente diferente**, completamente **disjunto** del anterior.

A estos conjuntos disjuntos, los llamamos **cosets**. Y representan [clases de equivalencia](/es/blog/cryptography-101/rings/#equivalence-relations-and-classes).

Así que, en definitiva, $E/rE$ es el conjunto de **clases de equivalencia**, o de representantes de dichos cosets.

---

Sí, lo sé. **¿Por qué diablos importa esto?**

El Pairing de Tate se define tomando una entrada de la r-torsión, y la otra de $E/rE$. Aunque, bajo las circunstancias correctas, sucede algo bastante mágico: cada punto de r-torsión representa un **coset único y diferente**!

Lo que significa - podemos terminar tomando ambas entradas de la r-torsión.

### El Pairing {#the-pairing}

Con esto en mente, procedamos a la definición. Y hagámoslo de manera (casi) rigurosa.

Sea $P$ un punto en la r-torsión, sabemos que podemos encontrar una función con divisor $(f) = r(P) - r(\mathcal{O})$, y sea $Q$ un representante de $E/rE$. Además, necesitaremos un divisor tal que:

$$
D_Q \sim (Q) - (\mathcal{O})
$$

Con soporte disjunto de $(f)$. Con esto, el pairing de Tate es simplemente el mapa:

$$
t_r(P,Q) = f(D_Q)
$$

En este contexto, la salida de este pairing es un miembro de una **clase de equivalencia**:

$$
t_r(P,Q) \in {\mathbb{F}^*}_{q^k}/({\mathbb{F}^*}_{q^k})^r
$$

> Que se define como esperarías a estas alturas.

Esto no es genial - usualmente, en el cálculo de pairings, confiamos en el hecho de que diferentes partes son capaces de calcular el **mismo valor exacto**, no un representante de una clase de equivalencia. Para evitar esto, introducimos el **pairing de Tate reducido** como:

$$
T_r(P,Q) = f(D_Q)^{(q^k - 1)/r}
$$

Lo que esto logra (digamos que **mágicamente**, ¡pero puedes comprobarlo tú mismo!) es enviar todos los elementos en las clases de equivalencia resultantes a una **única raíz r-ésima de la unidad** en el campo.

¡Probar la bilinealidad no es muy diferente del caso del pairing de Weil, así que te lo dejo como ejercicio!

---

## Resumen {#summary}

¡Bien! Eso es todo por ahora.

Hemos definido ambos pairings principales hoy, tomando el tiempo para mirar algunos de los detalles más sutiles que los hacen funcionar. Y mientras que los diferentes componentes en nuestras definiciones se sienten bastante simples, todas estas definiciones están arraigadas en matemáticas profundas que simplemente no podemos cubrir aquí si esperamos mantener esto breve.

> Cosas como topología, geometría algebraica, teoría de Galois y análisis complejo.

Además, podrías encontrar que hay algunas variantes u optimizaciones de estos pairings - pero las dos definiciones fundamentales son las dos que hemos visto justo ahora.

Todo es fantástico con las **definiciones funcionales**, pero no hemos dicho nada sobre cómo **calcular pairings** de manera eficiente. Al igual que tenemos la **regla del doble y suma** para la multiplicación de puntos, veremos que el cálculo de pairings también requerirá la introducción de una técnica eficiente para ser factible.

¿Y qué papel juegan el [mapa de traza](/es/blog/elliptic-curves-in-depth/part-7/#the-trace-map) y el [mapa anti-traza](/es/blog/elliptic-curves-in-depth/part-7/#the-characteristic-polynomial) en todo esto?

No te preocupes - estas preguntas serán respondidas a su tiempo, ¡cuando nos encontremos para el próximo artículo!
