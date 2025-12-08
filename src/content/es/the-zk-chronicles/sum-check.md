---
title: 'Las Crónicas de ZK: Verificación de la Suma'
author: frank-mangone
date: '2025-11-25'
thumbnail: /images/the-zk-chronicles/sum-check/1_Yzr-2zVpHO5IToX1NfBcEw.webp
tags:
  - sumCheck
  - zeroKnowledgeProofs
  - verifiableComputing
  - polynomials
description: >-
  Equipados con campos finitos y polinomios, ¡es hora de echarle un vistazo a
  nuestro primer sistema de pruebas!
readingTime: 13 min
contentHash: a636fc565ec9e2f812486f7a81a2c802f9e8565a37fbe623bffe8a08c3865783
supabaseId: null
---

Ahora que estamos equipados con [campos finitos y polinomios](/es/blog/the-zk-chronicles/math-foundations), es hora de echarle un vistazo a nuestro primer sistema de pruebas. ¡Genial!

La verdad es que la herramienta que estamos a punto de presentar puede parecer un poco **inútil** a primera vista. Cuando se estudia por sí sola, se siente como una forma extremadamente complicada de realizar una tarea muy simple.

¡Pero que eso no te desanime! Resulta que esta herramienta es **extremadamente importante** por una razón maravillosa: muchos problemas sobre los que queremos probar cosas pueden **reducirse** a una versión de lo que estamos a punto de revelar.

Por lo tanto, te pido que abordes el artículo de hoy con una mente abierta. Piensa en el tema de hoy como simplemente **otro escalón** en nuestro camino para obtener sistemas de pruebas útiles.

> Las cosas empezarán a tener sentido muy pronto, lo prometo. ¡Confía en el proceso!

¡Muy bien entonces! Las expectativas están altas, así que no perdamos tiempo. Hablemos del **protocolo de verificación de la suma**.

---

## Calentando los Motores {#getting-started}

Como un breve recordatorio de nuestro primer encuentro, lo que queremos hacer es construir algún tipo de sistema de pruebas para mostrar que el resultado de algún cómputo es válido, e idealmente hacerlo en menos tiempo que el cómputo mismo.

Genial, entonces... ¿De qué tipo de cómputo estamos hablando?

Hasta ahora, nuestro conjunto de herramientas solo incluye polinomios. Usando éstos como base, podríamos intentar idear formas de representar cómputos útiles — del tipo sobre el que podemos probar cosas.

Okay entonces, vayamos de a poco. Tomemos algún polinomio univariado $P(X)$. Quizás lo más simple que podemos hacer con él es **evaluarlo** en algún punto. Y a ese respecto, quiero notar que hay **dos puntos especiales** con un comportamiento interesante al evaluarlos: $0$ y $1$.

> Pensémoslo por un segundo: cuando $X = 0$, todos los términos que contienen $X$ simplemente **desaparecen**, dejándonos con el término sin $X$. A esto usualmente se le llama el **término constante**, o el **coeficiente cero**.
>
> Del mismo modo, evaluar un polinomio en $X = 1$ simplemente nos da la suma de **todos los coeficientes** en el polinomio!

Esencialmente, estos puntos son agradables porque no necesitamos perder tiempo calculando ninguna potencia de $X$ durante la evaluación. Claro — podríamos usar cualquier otro punto, pero estos simplemente resultan ser convenientes, y muy importantes para la construcción de hoy.

Lo sé. No es lo más divertido, pero es un comienzo.

<figure>
	<img
		src="/images/the-zk-chronicles/sum-check/1_Yzr-2zVpHO5IToX1NfBcEw.webp"
		alt="Fry de futurama soplando un matasuegras"
		title="Yay..." 
	/>
</figure>

Lo siguiente que podríamos intentar es **sumar evaluaciones**. Por ejemplo, podríamos tener:

$$
P(0) + P(1) = k
$$

Donde $k$ es algún elemento de un campo. Realizar este cálculo directamente es **bastante fácil** por las razones que mencionamos antes: la evaluación es muy directa. Parece que no estamos haciendo mucho progreso — después de todo, dijimos que probar un resultado tiene sentido solo cuando hay una ganancia real en el tiempo de verificación versus el esfuerzo de cómputo.

Y acá, el cómputo es tan simple que es un poco absurdo intentar construir un algoritmo separado para la verificación.

> Quiero decir, ¡solo mira la expresión de arriba!

Entonces, ¿qué tal si vamos un paso más allá?

### Subiendo la Apuesta {#turning-up-the-heat}

¿Qué pasaría si nuestro punto de partida fuera un **polinomio multivariado**? Algo como esto:

$$
g(X_1, X_2, X_3,...,X_v)
$$

**Ahora sí estamos hablando**.

En términos de complejidad de evaluación, estamos prácticamente en la misma situación que antes: es bastante simple evaluar estos polinomios en valores de variable $0$ y $1$.

Pero la situación cambia cuando consideramos la **combinatoria**. Como ahora tenemos $v$ variables, y cada una puede ser $0$ o $1$, ¡ahora tenemos $2^v$ combinaciones posibles para evaluar!

> Estos puntos, representados como el conjunto $\{0,1\}^v$, forman lo que se llama el **hipercubo booleano**.

Calcular esta suma sí requiere algo más de trabajo:

$$
H = \sum_{b_1 \in \{0,1\}} \sum_{b_2 \in \{0,1\}}...\sum_{b_v \in \{0,1\}} g(b_1, b_2, ..., b_v)
$$

En términos de [notación Big O](https://en.wikipedia.org/wiki/Big_O_notation), podemos decir que calcular $H$ toma **tiempo exponencial** $O(2^v)$. Lo que significa que toma al menos $2^v$ evaluaciones.

> Asumiré familiaridad con esta notación, pero como una breve explicación, lo que hace es expresar la complejidad basándose en el término en una expresión que **crece más rápido**.
>
> A medida que los valores de las variables aumentan, dicho término crecerá más (más significativo) que otros, haciendo que cualquier otro término sea insignificante en comparación.
>
> Así que por ejemplo, toma $2X^2 + X$. A medida que $X$ crece más, $X^2$ crece mucho más rápidamente que $X$ — y muy pronto, $X^2$ será mucho más grande que $X$. Por lo tanto, decimos que la **complejidad** de la expresión es $O(X^2)$. Nota que ignoramos los factores multiplicativos, ya que no afectan el comportamiento de la función — solo la **escalan**.

Para valores muy grandes de $v$, el tiempo exponencial puede ser **mucho tiempo**.

<quiz src="/the-zk-chronicles/sum-check/hypercube-size.json" lang="es" />

Prohibitivamente largo para mi pobre computadora, pero quizás no para alguien con hardware de alta potencia.

<figure>
	<img
		src="/images/the-zk-chronicles/sum-check/0_oveEqYSSzcUPbtXR.webp"
		alt="Una computadora de papa"
		title="Sí... Eso no va a funcionar" 
	/>
</figure>

En este contexto, **sí** tiene sentido intentar fabricar un algoritmo para la verificación rápida de algún **supuesto resultado**.

¡Y este es exactamente el objetivo del protocolo de verificación de la suma!

Veamos cómo funciona.

---

## El Protocolo {#the-protocol}

> Un **protocolo** es simplemente una **secuencia de pasos**, definida por reglas que deben seguirse durante una interacción entre partes. Esta es exactamente nuestra situación: un probador y un verificador **interactuarán** de una manera muy específica.

La belleza de este protocolo que estamos a punto de presentar radica en su **naturaleza recursiva**.

Este es el plan: primero explicaremos cómo funciona **una sola ronda**. Una vez que terminemos con eso, será inmediatamente claro que para avanzar, tendremos que hacer **otra de esas rondas**. Cada ronda reducirá el problema, hasta que nos quede una condición que es muy simple de verificar.

<figure>
	<img
		src="/images/the-zk-chronicles/sum-check/1_We6YixjP6XAJdclWRasLaQ.webp"
		alt="Un problema siendo reducido"
		title="[zoom]" 
	/>
</figure>

Fácil, ¿verdad?

<figure>
	<img
		src="/images/the-zk-chronicles/sum-check/1_rf2oM7muH0p4JJ2hJqFwIQ.webp"
		alt="Meme de chihuahua enojado"
		width="500"
	/>
</figure>

Woah, woah, tranquilo... Okay, un paso a la vez.

### Una Ronda de Verificación {#a-sum-check-round}

El escenario es el siguiente: un probador afirma haber calculado la suma $C$ para un polinomio $g(X_1, X_2,..., X_v)$ sobre $\{0,1\}^v$. Su objetivo es convencer a un verificador de que $C$ es el **resultado correcto**.

Para hacerlo, el probador hará algo bastante extraño en apariencia: una **suma parcial de** $g$.

$$
g_1(X_1) = \sum_{(x_2, ..., x_v) \in \{0,1\}^{v-1}} g(X_1, x_2, ..., x_v)
$$

Si miramos de cerca, podemos notar que no hemos incluido evaluaciones para la primera variable, $X_1$. Por esta razón el resultado es un **nuevo polinomio** — uno univariado, específicamente.

<figure>
	<img
		src="/images/the-zk-chronicles/sum-check/polynomial.webp"
		alt="Una suma sobre todas las variables del polinomio excepto una"
        title="[zoom]"
		width="500"
	/>
</figure>

Lo creas o no, esto es **todo lo que hay que hacer**. El probador puede enviar $C$ y $g_1(X_1)$ al verificador, y con estos valores, el verificador puede checkear fácilmente la siguiente igualdad:

$$
C = g_1(0) + g_1(1)
$$

Claramente, si $C$ está correctamente calculado, esta igualdad debería cumplirse (¡siéntete libre de verificarlo tú mismo si no estás convencido!). Así que si esta prueba pasa, ¡terminamos! ¡El verificador puede decir con confianza que $C$ es correcto!

¿No...?

### Problemas en el Paraíso {#problems-in-paradise}

De hecho, hay un **problema crítico** con este razonamiento — y es una consideración que siempre necesitamos tener en mente a medida que avanzamos en nuestro viaje. Lo hemos dicho antes, pero lo diré de nuevo, y en letras grandes, para que no se olviden:

::: big-quote
El probador podría estar mintiendo
:::

¿Sobre qué podría estar mintiendo? Bueno, sobre **todo** en lo que fuera posible — pero en este caso, no tienen muchas opciones: o no conocen $g$, o mienten sobre el valor de $C$.

Entonces, digamos que el probador quiere convencer al verificador de que algún valor $C^*$ es el resultado correcto, pero de hecho es **incorrecto**. ¿Cómo lo harían?

Prácticamente la única perilla que pueden ajustar es ese polinomio $g_1(X_1)$. Y si lo piensas, ¡nada impide que el probador fabrique un polinomio simple $g_1^*$ para que la verificación del verificador pase!

$$
C^* = g_1^*(0) + g_1^*(1)
$$

> ¡Ni siquiera sería tan difícil!

Como están las cosas ahora, el algoritmo no funcionará. Vamos a necesitar una forma de verificar que $g_1(X_1)$ fue **correctamente calculado**.

Tomémonos un momento para reflexionar sobre nuestras opciones. Naturalmente, los verificadores no pueden confiar en la palabra de un probador. Y $g_1(X_1)$ es solo un polinomio — todo lo que podemos hacer con él es **evaluarlo** en algún punto.

Un momento... ¿Qué pasa si evaluamos $g_1(X_1)$ en algún punto aleatorio $r_1$?

$$
g_1(r_1) = \sum_{(x_2, ..., x_v) \in \{0,1\}^{v-1}} g(r_1, x_2, ..., x_v) = C_2
$$

¿Lo ves? Ha ocurrido un pequeño milagro ante nuestros ojos: ¡estamos **de vuelta donde empezamos**!

<figure>
	<img
		src="/images/the-zk-chronicles/sum-check/0_V6zOYb5T4YPZm7Xv.webp"
		alt="Una mirada confundida"
        title="¿Eh?"
	/>
</figure>

Sí, perdón. Me explico.

Una vez que elegimos y fijamos un punto aleatorio $r_1$, la evaluación $g_1(r_1)$ es en realidad una suma sobre un **hipercubo booleano reducido**. Es como si estuviéramos reemplazando la función original $g$ por otra función $g'$ con **una variable menos**:

$$
g'(X_2, ..., X_v) = g(r_1, X_2, ..., X_v)
$$

Ahora, podemos hacer la misma pregunta original: ¿podemos probar que esta versión reducida de $g$ suma $C_2$ sobre un hipercubo booleano reducido?

Y la magia, amigos míos, ¡es que **otra ronda de verificación de la suma** es todo lo que necesitamos!

<quiz src="/the-zk-chronicles/sum-check/random-challenge.json" lang="es" />

### El Panorama Completo {#the-full-picture}

Lo que quiero decir aquí es que podemos hacer esto **una y otra vez** de manera **recursiva**, reduciendo el número de variables en $g$ en una en cada ronda. Por lo tanto, después de $v$ rondas, nos quedará una **sola evaluación** de $g$.

Antes de atar finalmente los cabos, creo que ver esto en acción con un ejemplo simple ayudará mucho.

Toma por ejemplo este polinomio de grado $4$:

$$
g(X_1, X_2, X_3, X_4) = X_1X_4 + X_2X_4 + X_3X_4
$$

Este polinomio tiene que estar definido sobre algún **campo finito**, así que elijamos uno simple, como $\mathbb{F}_{13}$.

Primero, el probador necesita calcular la suma sobre el hipercubo booleano $\{0,1\}^4$.

> ¡Eso es un total de $16$ evaluaciones sumadas!

Siéntete libre de hacer el cálculo tú mismo — pero con el espíritu de ver el sistema de pruebas en acción, digamos que el probador afirma que el resultado es $C_1 = 12$.

El probador también envía el polinomio $g_1(X_1)$, y afirma que es $4X_1 + 4$. El verificador entonces simplemente valida que:

$$
g_1(0) + g_1(1) = 4 + 8 = 12
$$

Okay, primera ronda, terminada. Ahora el verificador elige un valor aleatorio $r_1$. Supongamos que ese valor es $r_1 = 5$.

El probador entonces calcula $C_2$, que resulta dar $C_2 = 11$. Así que ahora, el probador tiene que calcular este polinomio:

$$
g_2(X_2) = \sum_{(x_3, x_4) \in \{0,1\}^2} g(r_1, X_2, x_3, x_4)
$$

El resultado de esto es $g_2(X_2) = 2X_2 + 11$.

> Y podemos calcular esto fácilmente porque nosotros, como probadores, conocemos el $g$ original.
>
> Si no conociéramos $g$, ¡entonces esta selección aleatoria de $r_1$ ya nos haría la vida difícil! Este tipo de interacción de "desafío" es muy importante, y lo formalizaremos más adelante.

¡Genial! Ahora verificamos si:

$$
g_2(0) + g_2(1) = 11
$$

Aunque el resultado parece estar mal (nos da $24$), todo cobra sentido una vez que recordamos que estamos trabajando en un campo finito, así que $24 \ \textrm{mod} \ 13 = 11$.

<quiz src="/the-zk-chronicles/sum-check/finite-field-arithmetic.json" lang="es" />

Para la tercera y cuarta ronda, simplemente repetimos el proceso. Para no extendernos demasiado, acá va un resumen de los pasos:

- El verificador elige $r_2 = 3$.
- El probador responde con $C_3 = 4$, y $g_3(X_3) = X_3 + 8$.
- El verificador verifica $g_3(0) + g_3(1) = 4$, y elige $r_3 = 7$.
- El probador responde con $C_4 = 2$ y $g_4(X_4) = 2X_4$.
- El verificador verifica $g_4(0) + g_4(1) = 2$, y elige $r_4 = 2$.

El proceso completo se ve así:

<figure>
	<img
		src="/images/the-zk-chronicles/sum-check/1_c8iaCgiyaGcxKDKhcUFYkQ.webp"
		alt="El proceso completo"
        title="[zoom]"
	/>
</figure>

Todo cierra muy bien hasta ahora. Pero tenemos un pequeño problema: ¡nos quedamos sin variables!

<figure>
	<img
		src="/images/the-zk-chronicles/sum-check/1_JRPieoIYo2KELtNtaw2GuQ.webp"
		alt="Mirada impactada"
        title="¿¿Eeeeeh??"
	/>
</figure>

### Cerrando el Ciclo {#closing-the-loop}

Correcto — el polinomio original no puede reducirse más. El verificador ha recibido $g_4(X_4) = 2X_4$, y necesita verificar si $g_4(2)$ (que en este caso, es igual a $C_5 = 4$) es realmente el mismo resultado que evaluar $g(5,3,7,2)$.

Como no podemos realizar otra ronda, parece que no tenemos ninguna opción para verificar la validez de este último valor. Y esto no está bien: ¿qué pasa si el valor es simplemente **inventado** para que todo funcione?

En este punto, vamos a necesitar una estrategia diferente.

Necesitamos un mecanismo para verificar que $C_5$ es correcto. Sabemos que $C_5 = g(5,3,7,2)$. Si hubiera alguna forma mágica de **evaluar de manera segura** $g$ en estos inputs, entonces podríamos comparar con $g_4(2)$, y terminar el procedimiento.

Tristemente... Es demasiado temprano en nuestro viaje para ver cómo esto puede lograrse matemáticamente.

Sin embargo, en lugar de pedirte que sigas tu camino basado en un simple **trust me, bro**, propongo lo siguiente: pongámosle un nombre a esto, para que no nos olvidemos de ello. Y cuando llegue el momento, podemos volver a este concepto, y realmente terminar de darle sentido.

Diremos que tenemos **acceso de oráculo** a $g$. Con esto, queremos decir que tenemos una forma de evaluar $g$ en algún punto aleatorio, y tenemos **garantizado** obtener un valor correcto.

Así que finalmente, después de todas las verificaciones en cada ronda, el verificador realiza una **consulta de oráculo** de $g$ en $(r_1, r_2, r_3, r_4)$, y acepta la prueba si el valor coincide con $C_5 = g_4(r_4)$.

> Por supuesto, todo este procedimiento puede generalizarse a **cualquier grado** — ¡y los ahorros de tiempo se vuelven más relevantes cuanto mayor sea el grado!

¡Y ese es el protocolo de la verificación de la suma!

---

## Completitud y Solidez {#completeness-and-soundness}

Es un algoritmo muy elegante, eso es seguro. Sé que puede parecer un poco excesivo al principio, así que te animo a que te tomes tu tiempo para entenderlo antes de continuar.

Sin embargo, con estos métodos de prueba, necesitamos ser **precisos** — lo que significa que para que podamos decir con confianza "sí, esto funciona", necesitamos mostrar formalmente que el algoritmo es tanto **completo** como **sólido**.

Esto se convertirá en práctica estándar para cualquier algoritmo que aprendamos de aquí en adelante. Como es la primera vez que presentamos un algoritmo en esta serie, recapitulemos brevemente lo que significan estas propiedades:

- **Completitud** significa que el verificador siempre aceptará la prueba si la declaración original es válida (la suma de $g$ sobre el hipercubo booleano es de hecho $C$), excepto quizás con una probabilidad insignificante.
- **Solidez o Robustez** significa que es muy difícil para un probador deshonesto generar una prueba válida, excepto con probabilidad insignificante.

> La solidez en realidad viene en **varios formas**, pero diferiremos esa discusión para más adelante.

La completitud es bastante directa: si el probador realmente conoce $g$, y ha calculado correctamente $C$, entonces puede pasar cada ronda simplemente construyendo cada $g_i$ correctamente según el protocolo. Esto es, como conocen $g$, no deberían tener ningún problema para proporcionar respuestas a cada desafío.

La solidez es un poco más complicada de mostrar. Esencialmente, necesitamos medir **qué tan difícil sería para un probador hacer trampa**.

Para hacer esto, siguamos un intento de trampa de punta a punta. Supongamos que el probador no conoce $C$, y en su lugar afirman que la suma de $g$ sobre el hipercubo booleano es $C^*$. O peor aún: ¡están interesados en convencernos de que el resultado $C^*$ es correcto para su propio beneficio!

¿Cómo podrían engañar a un verificador?

Bueno, en la primera ronda, necesitarían enviar algún polinomio $g_1^*(X_1)$ tal que:

$$
g_1^*(0) + g_1^*(1) = C^*
$$

Y acá es donde se pone interesante: **no pueden usar** $g$ para calcular $g_1^*(X_1)$, porque la suma sería (muy probablemente) diferente a $C^*$. Por lo tanto, necesitarían **fabricar** $g_1^*(X_1)$ para que pase la primera verificación.

En otras palabras, $g_1^*(X_1)$ y el verdadero $g_1(X_1)$ son **polinomios diferentes**. Así que cuando el verificador elige su primer desafío $r_1$, es **muy poco probable** que $g_1(r_1)$ y $g_1^*(r_1)$ sean el mismo valor.

> De hecho podemos saber **exactamente qué tan poco probable** es esto. En el espíritu de mantener las cosas progresivas, creo que es mejor dejar esa discusión para más adelante. Lo que diré es que tienes **toda la información que necesitas** para este esfuerzo en el artículo anterior.
>
> Así que si quieres pensar en ello, ¡adelante! Si no, no te preocupes — volveremos a esto.

Sería súper desafortunado si $g_1(r_1)$ y $g_1^*(r_1)$ coincidieran. Si ese es el caso, el probador puede **continuar con su mentira**, solo que esta vez podrían en teoría responder a cada ronda subsecuente con **polinomios válidos**: simplemente calculan $g_i$ normalmente.

Podemos aplicar este mismo razonamiento a cada ronda de la misma manera **recursiva**: para pasar la ronda $2$, el probador necesita construir $g_2^*(X_2)$ para que pase la siguiente verificación, y tendrían que tener suerte en el siguiente desafío ($g_2(r_2) = g_2^*(r_2)$).

Si la probabilidad de que esto suceda es algún valor $\delta$, entonces un probador tramposo tiene $v$ oportunidades de tener suerte (o $v$ **intentos** en total), así que la probabilidad total de un robo exitoso sería $v \cdot \delta$. Mientras este valor combinado sea pequeño, entonces el algoritmo es sólido.

<quiz src="/the-zk-chronicles/sum-check/soundness-probability.json" lang="es" />

Por último, la **consulta de oráculo** final permite al verificador atrapar al probador en su mentira final (a menos que tengan suerte, por supuesto).

¡Así que ahí lo tienes! El protocolo de la verificación de la suma cumple con los requisitos de completitud y solidez.

---

## Resumen {#summary}

Acabamos de ver nuestro primer algoritmo de cómputo verificable. Puede no parecer mucho por ahora, pero es un comienzo. Y hemos visto algunas herramientas y conceptos valiosos en el proceso como **recursión**, **desafíos del verificador**, **evaluaciones polinomiales** ingeniosas, **consultas de oráculo**, e incluso cómo verificar **completitud** y **solidez**.

Intencionalmente, he omitido los **costos computacionales** de este protocolo, porque quiero que nos enfoquemos en las matemáticas por ahora. Si tienes curiosidad, puedes calcular eso tú mismo fácilmente — y encontrarás tres cosas:

- El probador corre en tiempo $O(2^v)$.
- El verificador corre en tiempo $O(v)$ (lineal).
- Hay un total de $v$ pasos de comunicación, y el número total de elementos de campo enviados durante todo el protocolo es $O(v)$.

<quiz src="/the-zk-chronicles/sum-check/verifier-speedup.json" lang="es" />

Claramente, el verificador es mucho más rápido que el probador a medida que $v$ se vuelve más grande. Pero pueden surgir algunas preguntas alrededor de esto: ¿es un **tiempo lineal** suficientemente bueno? ¿Importa si el probador tarda demasiado?

Y especialmente, ¿qué hay de la **sobrecarga de comunicación**? El verificador podría correr más rápido, pero si tiene que esperar al probador... ¡entonces todo el proceso se ralentiza!

Bueno... Sí. En su forma actual, este no es un protocolo muy práctico.

> ¡Te lo advertí!

Digamos simplemente que tiene **potencial**.

Comenzaremos a unir la importancia del protocolo de la verificación de la suma en los próximos artículos. Y para eso, querremos saltar a otras ideas importantes, especialmente alrededor de cómo representar declaraciones y cómputo en general.

¡Ese será el tema para el [próximo artículo](/es/blog/the-zk-chronicles/circuits-part-1)!
