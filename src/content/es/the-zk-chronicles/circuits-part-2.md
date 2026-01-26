---
title: 'Las Crónicas de ZK: Circuitos (Parte 2)'
author: frank-mangone
date: '2026-01-24'
readingTime: 17 min
thumbnail: /images/the-zk-chronicles/circuits-2/legos.webp
tags:
  - zeroKnowledgeProofs
  - arithmeticCircuits
  - sumCheck
  - gkr
description: >-
  ¡Avanzamos hacia nuestro primer mecanismo verdaderamente general para probar
  la correctitud de cómputos!
contentHash: 139b93c768f5d92c1cfc8c997a2127bc4638b843560a1168b5e55a2cf0dbc8ad
supabaseId: null
---

Si recuerdas, [un par de artículos atrás](/es/blog/the-zk-chronicles/circuits-part-1) introdujimos el problema de satisfacibilidad de circuitos (ambas versiones, CSAT y #SAT), lo cual nos llevó directamente a una poderosa extensión de los circuitos tradicionales en forma de **circuitos aritméticos**.

Aunque estos problemas eran interesantes en concepto, probablemente aún se sentían un poco raros. Y en ese entonces, afirmamos que una alternativa más intuitiva para nuestros propósitos era de alguna manera probar la correctitud de una **evaluación de un circuito** — es decir, probar que evaluar un circuito en un conjunto particular de entradas produce un resultado dado.

Nuestro objetivo para hoy será presentar un mecanismo para hacer exactamente eso.

Tengo que avisarte: esto va a ser un poco más complejo que los artículos anteriores. Sin embargo, nos llevará a lo que se sientirá como nuestro primer sistema de pruebas **verdaderamente general**.

> ¡El primero de muchos!

¡Pero no te preocupes demasiado! Como siempre, lo haremos paso a paso, desglosando las partes importantes.

Hay mucho que cubrir, así que toma tu café y prepárate — ¡esta será una entrega larga!

---

## Probando la Evaluación {#proving-evaluation}

¡Muy bien entonces! Dado que ya hemos aprendido sobre circuitos aritméticos, podemos saltar directamente al problema en cuestión.

Dado algún circuito aritmético $\varphi(X)$, nuestro objetivo es probar que para alguna entrada $x$, la salida del circuito tiene algún valor $y$:

$$
\varphi (x) = y
$$

Quiero que nos tomemos un momento para analizar cómo abordar esto.

Aún no tenemos pistas claras. Con #SAT, la [suma del hipercubo hizo obvia la conexión con la verificación de la suma](/es/blog/the-zk-chronicles/circuits-part-1/#circuit-satisfiability), pero no tenemos la misma suerte acá. Vamos a necesitar otro ángulo de ataque.

<quiz src="the-zk-chronicles/circuits-part-2/hypercube-role.json" lang="es" />

Tal vez deberíamos repasar nuestro conocimiento hasta ahora, y eso nos puede dar una dirección a seguir. Veamos: sabemos que los circuitos aritméticos están compuestos de compuertas de **suma** y **multiplicación**. Y cada vez que alimentas alguna entrada a un circuito, fluye hacia adelante a través de los cables y hacia las compuertas (recuerdemos, es un [DAG](https://es.wikipedia.org/wiki/Grafo_ac%C3%ADclico_dirigido)), que realizan **operaciones simples**.

Aquí va una pregunta rápida: ¿qué pasa si una compuerta está **mal calculada**?

Hasta ahora estamos asumiendo el "camino feliz", pero ¿qué pasaría si ese no fuera el caso? Cualquier cálculo incorrecto de una sola compuerta causaría un **efecto dominó** a través del circuito, haciendo que todo el cálculo sea inválido.

A la inversa, también podemos decir que para que el resultado de todo el circuito sea correcto, **cada compuerta** debe haber sido correctamente calculada.

> Sí, hay una pequeña posibilidad de que el resultado accidentalmente se mantenga correcto debido a la aritmética modular. Pero con un campo de tamaño adecuado, esta probabilidad es **despreciable**, así que podemos ignorarla con seguridad.

<figure>
	<img
		src="/images/the-zk-chronicles/circuits-2/circuit-error.webp"
		alt="Un circuito con una compuerta mal calculada" 
		title="[zoom] La compuerta roja está incorrectamente calculada, por lo que las compuertas que dependen de su resultado también están mal"
	/>
</figure>

Esto nos da una **observación extremadamente poderosa**: podemos **descomponer** el problema de verificar la evaluación del circuito en verificar la evaluación correcta de **compuertas individuales**.

¡Y de ahí viene principalmente el poder de los circuitos como modelo de cómputo! Las compuertas son como los **bloques de Lego** de la computación verificable: puedes verificar su corrección, y puedes encadenarlas juntas para formar estructuras más ricas!

<figure>
	<img
		src="/images/the-zk-chronicles/circuits-2/legos.webp"
		alt="Un montón de legos" 
		title="Excepto que no puedes pisar un circuito"
	/>
</figure>

¡Bien! Esto parece un punto de partida prometedor. Lo que necesitamos ahora es una forma de usar este nuevo conocimiento.

<quiz src="the-zk-chronicles/circuits-part-2/decomposition-insight.json" lang="es" />

### Información Relevante {#relevant-information}

Para construir un sistema de pruebas, un verificador debería poder **sondear** estas compuertas para verificar si están correctamente calculadas. Esto generalmente se hace a través de una **estrategia de codificación**: el cómputo en una compuerta se expresa de una forma que el verificador puede usar por su cuenta.

Entonces, ¿cómo hacemos eso?

Bueno, hay al menos **tres cosas** que un verificador necesita para verificar exitosamente si un cálculo de compuerta es válido o no:

- Las entradas
- La salida
- El tipo de la compuerta (ya sea suma o multiplicación)

Si un verificador puede obtener estas cosas, ¡simplemente puede **calcular la salida esperada** y **comparar** con el resultado proporcionado!

Esa es la teoría, al menos — pero ¿cómo codificaríamos esta información?

### Codificación {#encoding}

La respuesta podría no ser sorprendente en este punto: ¡**polinomios**!

> ¡Siempre son polinomios!

No hay una sola forma de hacer esto. Diferentes sistemas de pruebas usan diferentes técnicas — y esa es parte de dónde vienen las diferencias clave entre los sistemas de pruebas modernos.

Quiero que nos vayamos acercando de a poco a este tema de la codificación, con un ejemplo. Veamos qué podemos hacer con un circuito pequeño:

<figure>
	<img
		src="/images/the-zk-chronicles/circuits-2/circuit-wires.webp"
		alt="Circuito con su cableado" 
		title="[zoom] Un circuito simple para (a + b).c"
	/>
</figure>

Aquí hay algunas ideas. Primero, querríamos codificar los **valores de los cables**. Tenemos un total de $5$ cables, así que podríamos crear un polinomio $W(X)$ tal que:

$$
\forall i \in \{0,1,2,3,4\} : W(i) = w_i
$$

> Notemos que esas son **evaluaciones** — diremos un poco más sobre cómo obtener el polinomio real $W(X)$ más adelante.

Luego, necesitaríamos codificar la **información de las compuertas**. Para hacer esto, podemos usar **polinomios indicadores** para cada compuerta: uno para compuertas de suma, y uno para compuertas de multiplicación.

De manera similar a las [bases de Lagrange](/es/blog/the-zk-chronicles/math-foundations/#lagrange-polynomials), podemos elegir una compuerta $g$, y crear un polinomio $A^g(X,Y,Z)$ que devuelve $1$ solo cuando:

- Los valores de $X$, $Y$, y $Z$ corresponden a los **cables correctos** para la compuerta, con $X$ siendo la entrada izquierda, y $Y$ siendo la entrada derecha, y $Z$ siendo la salida.
- La compuerta $g$ es una **compuerta de suma**.

> Lo mismo se puede hacer con compuertas de multiplicación, y un polinomio $M^g(X,Y,Z)$.

Con esto, podemos representar la afirmación "la compuerta $g$ está correctamente evaluada" con esta expresión de abajo:

$$
W(k) = A^g(i, j, k)[W(i) + W(j)] + M^g(i, j, k)W(i)W(j)
$$

> El papel de $A^g$ y $M^g$ es desactivar las verificaciones si no corresponden a la compuerta correcta. Por supuesto, deberíamos asegurarnos de que $A^g$ y $M^g$ no sean iguales a $1$ al mismo tiempo.

¡Ok, pausa! Eso probablemente fue mucha información.

Tómate un momento para dejar que todo esto se asimile. Este tipo de estrategias de codificación serán muy importantes a medida que avancemos más en la serie, ¡así que es una buena idea familiarizarse con ellas ahora!

> En serio, tómate tu tiempo. Si te adelantas, lo sabré.

<figure>
	<img
		src="/images/the-zk-chronicles/circuits-2/suspicious-chihuahua.webp"
		alt="Un chihuahua con mirada sospechosa" 
		title="Te estoy vigilando"
		width="500"
	/>
</figure>

<quiz src="the-zk-chronicles/circuits-part-2/wiring-predicates.json" lang="es" />

¿Bien? ¡Ok, sigamos adelante!

---

Codificación de compuertas, listo.

Desafortunadamente... Hay un **problema muy evidente** con esto: para verificar la correctitud de una evaluación de circuito, un verificador necesitaría verificar **cada compuerta individual**. Para circuitos grandes (donde el tamaño $S$ es grande), esto significaría un tiempo de verificación de $O(S)$.

Y esto es bastante malo, porque **no es mejor que simplemente ejecutar el circuito** — ¡y toda la esencia de la computación verificable es permitir que los verificadores corran más rápido que eso!

Hemos dado con un gran obstáculo en nuestros planes... ¿Podemos hacer algo mejor?

---

### Circuitos Estructurados {#structured-circuits}

¡A veces podemos!

El secreto está en darse cuenta de que **no todos los circuitos son iguales**. De hecho, todos los circuitos tienen una **estructura general** diferente. Y en algunos casos, podemos explotarla para lograr un mejor rendimiento.

En particular, estamos interesados en circuitos donde podemos identificar **capas** claras: grupos de compuertas que no están directamente conectadas entre sí (son **independientes**), y en su lugar dependen solo de una **capa anterior**.

<figure>
	<img
		src="/images/the-zk-chronicles/circuits-2/circuit-layers.webp"
		alt="Una representación de capas de circuito"
		title="[zoom]" 
	/>
</figure>

> Llamamos al número de capas la **profundidad** ($d$) del circuito, y el número de cables en cada capa representa el **ancho** ($w$) de la capa. Para circuitos con ancho relativamente uniforme, el tamaño total del circuito es aproximadamente $S \approx d \cdot w$.

Ahora... ¿Qué pasaría si pudiéramos mostrar que una **capa completa** está correctamente calculada de una sola vez?

<figure>
	<img
		src="/images/the-zk-chronicles/circuits-2/mathing.webp"
		alt="El meme clásico de la señora viendo ecuaciones en el aire" 
	/>
</figure>

Si podemos lograr esto, podemos estar en camino a ahorros de tiempo considerables — especialmente para **circuitos poco profundos**, cuya profundidad es mucho menor que su ancho.

Algunos protocolos de hecho aprovechan esta estructura. Tal es el caso de nuestro próximo tema: el **protocolo GKR**.

---

## El Protocolo GKR {#the-gkr-protocol}

> GKR son las iniciales de los creadores de la técnica: Goldwasser, Kalai y Rothblum. Varias técnicas en criptografía han adoptado esta forma de nomenclatura.

Esto que veremos ahora combinará prácticamente todo lo que hemos aprendido hasta ahora: circuitos estructurados, codificación polinomial, [extensiones multilineales](/es/blog/the-zk-chronicles/multilinear-extensions) y [verificaciones de suma](/es/blog/the-zk-chronicles/sum-check).

Por experiencia personal, mi sugerencia es **no apresurarse con esto**. Vuelve a los conceptos anteriores si es necesario. Este artículo no se va a ninguna parte — ¡eso te lo puedo asegurar!

### Diseño del Circuito {#circuit-layout}

El protocolo GKR asume una estructura muy específica para el circuito. No solo tiene capas, sino que cada capa tiene un **número predeterminado de compuertas**.

Etiquetemos cada capa con un índice $i$. Comenzando desde la capa de salida con un índice de $0$, y contando **hacia atrás** hacia las entradas, cada capa tendrá un total de $S_i = 2^{k_i}$ compuertas.

<figure>
	<img
		src="/images/the-zk-chronicles/circuits-2/circuit-layout.webp"
		alt="Un diseño de un circuito en capas"
		title="[zoom]"
	/>
</figure>

> ¡Nota que $k_i$ es un valor asociado con cada capa!

Nada es involuntario sobre esta elección. Pero ¿por qué exactamente forzaríamos a las capas a tener un número tan extrañamente específico de compuertas?

La razón es una que ya hemos explotado en el pasado: ¡**indexación**!

Esencialmente, podemos etiquetar cada compuerta (o equivalentemente, cada cable) de cualquier capa $i$ dada usando nuestro confiable **hipercubo booleano**. Codificamos los **valores** para cada compuerta como **evaluaciones** de alguna función $W_i(X)$:

$$
W_i: \{0,1\}^{k_i} \rightarrow \mathbb{F}
$$

> Donde $W_i(b)$ devuelve el valor en el cable $b$ en la capa $i$ ($b$ es una **cadena binaria de $k_i$ bits** que indexa el cable).

Y ya sabes qué significa un hipercubo booleano: ¡viene una **verificación de suma**!

<quiz src="the-zk-chronicles/circuits-part-2/layer-gate-count.json" lang="es" />

### Conectando las Capas {#connecting-the-layers}

Por supuesto, la parte que aún nos falta es esa codificación de **operación de compuerta** de la que hablamos antes. Y para obtener esto, necesitaremos hacer una cosa más: especificar **cómo están conectadas las compuertas**.

Esto se conoce como el **predicado de cableado**. Es la única pieza faltante en el rompecabezas de hoy, y una vez que tengamos esto, finalmente podremos conectar todo.

> ¡Literalmente!

Para esto, definamos los polinomios $A_i$ y $M_i$, que describen este predicado de cableado:

$$
A_i: \{0,1\}^{k_i + 2k_{i+1}} \rightarrow \{0,1\}
$$

$$
M_i: \{0,1\}^{k_i + 2k_{i+1}} \rightarrow \{0,1\}
$$

Estos, como se indicó anteriormente, tomarán tres etiquetas de compuerta $a$, $b$, y $z$ — las dos primeras de la capa de entrada, y la última de la capa de salida —, y devolverán $1$ solo cuando:

- Las compuertas en la combinación están verdaderamente **conectadas** en el circuito, lo que significa que la compuerta $z$ tiene entradas $a$ y $b$.
- La **compuerta más a la derecha** ($z$) es del tipo correcto (suma o multiplicación).

<figure>
	<img
		src="/images/the-zk-chronicles/circuits-2/single-gate.webp"
		alt="Una sola compuerta con sus entradas"
		title="[zoom]" 
	/>
</figure>

> De manera similar, $M_i(a,b,z) = 1$ para compuertas de multiplicación.

Mientras que $W_i$ codifica los valores de los cables en la capa $i$, $A_i$, $M_i$ describen qué compuertas se conectan a cuáles, y sus tipos. Juntos, constituyen una **descripción completa** del circuito, ¡o una **codificación completa**!

Todo lo que queda, como se insinuó anteriormente, es transformar esto de alguna manera en una verificación de suma.

### Construyendo la Verificación de Suma {#building-the-sum-check}

Si recuerdas, el protocolo de verificación de la suma tenía una **estructura recursiva** muy agradable: el problema original se **reducía** a una **versión más pequeña** del mismo problema, finalmente teniendo algo que es casi trivial de verificar.

Entonces, ¿qué tal si intentamos algo en esa línea?

La idea es simple: comenzar en la capa de salida, con algunos **valores de salida reclamados**. Allí, intentaremos transformar la afirmación sobre las salidas, en una afirmación sobre los valores de la **penúltima capa**. Enjuaga y repite, y después de $d$ pasos, llegamos a una afirmación sobre las **entradas**, ¡que deberían ser conocidas por el verificador!

Simple, ¿verdad?

<figure>
	<img
		src="/images/the-zk-chronicles/circuits-2/dead-bart.webp"
		alt="Una imagen de Bart Simpson con su espíritu fuera de su cuerpo" 
		title="¡Espero que estés mejor que Bart!"
	/>
</figure>

> ¡Manténganse firmes, soldados!

Para realizar este paso de reducción, necesitaremos verificar **algo** sobre cada capa. Y aquí es donde nuestra **codificación** se vuelve relevante, todo gracias a este pequeño truco aquí:

$$
W_i(X) = \sum_{a,b \in \{0,1\}^{k_{i+1}}} A_i(a,b,X)[W_{i+1}(a) + W_{i+1}(b)] + M_i(a,b,X)W_{i+1}(a)W_{i+1}(b)
$$

Antes de que tu cabeza explote, intentemos explicar qué está haciendo la expresión:

- Estamos sumando sobre todos los índices de compuerta posibles en la capa $i + 1$, que son las posibles **entradas** en la capa $i$ (la capa de salida en este paso)
- Luego, estamos preguntando: ¿es esta una compuerta de suma o una compuerta de multiplicación? Recuerda, $A_i$ y $M_i$ devuelven $0$ o $1$, y solo se **activarán** cuando exista una compuerta con entradas $a$ y $b$, y salida $X$ en la capa, **y** cuando la compuerta sea del tipo especificado.
- Por último, $A_i$ y $M_i$ se multiplican por las operaciones deseadas.

El punto clave de esto es que a pesar de sumar sobre un hipercubo booleano, **solo una** de las combinaciones posibles activará $A_i$ o $M_i$ — así que toda la suma se reduce a solo **un término**.

Por ejemplo: si el cable $5$ en la capa $i$ obtiene entradas de los cables $2$ y $3$ en la capa $i + 1$ a través de una compuerta de suma, entonces tenemos que:

- $A_i(2,3,5) = 1$
- $_i(cualquier otra cosa, 5) = 0$
- ¡Toda la suma se reduce a solo $W_{i+1}(2) + W_{i+1}(3)$!

Con esto, ¡las similitudes con la verificación de suma son mucho más evidentes!

¿Ese polinomio loco dentro de la suma? Simplemente llamémoslo $g_i(X,Y,Z)$:

$$
g_i(X,Y,Z) = A_i(X,Y,Z)[W_{i+1}(X) + W_{i+1}(Y)] + M_i(X,Y,Z)W_{i+1}(X)W_{i+1}(Y)
$$

Y con él, podríamos fijar $z$ a un valor particular, y aplicar la verificación de suma para verificar:

$$
W_i(z) = \sum_{a \in \{0,1\}^{k_{i+1}{}}, \ b \in \{0,1\}^{k_{i+1}}} g_i(a,b,z)
$$

> Nota que estamos fijando $z$ para que el predicado de cableado tenga sentido.

Como puedes ver, en cada capa, necesitamos valores de la **siguiente capa** para construir este polinomio que estamos usando. A menos que el verificador esté mirando la capa de entrada, ¡**no conocerían estos valores**! En su lugar, el probador los proporcionará — ¡así que esta verificación de suma reduce el problema a una afirmación sobre la **siguiente capa**!

Por lo tanto, solo necesitamos aplicar esto $d$ veces (la profundidad del circuito), y estaríamos prácticamente listos.

---

## Los Desafíos Restantes {#the-remaining-challenges}

¡Ok, genial! Esto se está formando bastante bien. Pero para avanzar, necesitaremos abordar dos problemas restantes, que se vuelven claros una vez que miramos más de cerca la verificación de suma que necesitamos realizar en cualquier capa individual.

Entonces, recapitulemos brevemente cómo procede el protocolo de verificación de la suma.

1. Primero, el probador envía un **resultado reclamado** $C_1$ y un **polinomio univariado** $P_1(X_1)$ al verificador, elaborado a partir del $g(X)$ original.
2. El verificador realiza una verificación simple, y luego selecciona un **desafío aleatorio** $r_1$ en el que evalúan $P_1(r_1)$. También envían este valor al probador.
3. El probador luego procede a probar que $C_2 = P_1(r_1)$ es el nuevo resultado reclamado — ¡y lo hace volviendo a **(1.)**!

El proceso se repite hasta que se agotan todas las variables del $g(X)$ original, y el verificador cierra el proceso realizando una única **consulta de oráculo**. Por supuesto, en nuestro caso, $g(X)$ es el $g_i(X,Y)$ para cada capa.

> ¡Para la explicación completa, puedes volver a [este artículo](/es/blog/the-zk-chronicles/sum-check)!

Ahora, este mecanismo tiene **dos problemas**:

- Necesitamos poder evaluar $g_i(X,Y)$ en un punto seleccionado aleatoriamente de un campo finito grande... ¡Pero por definición, este polinomio está definido sobre un **hipercubo booleano**!
- La consulta de oráculo final en realidad puede ser calculada por el verificador, siempre que conozcan dos valores especiales: la evaluación de $W$ en la **capa anterior** en los puntos seleccionados aleatoriamente. ¡Pero estos valores no son conocidos por el verificador!

Si logramos resolver estos problemas, entonces tendríamos un sistema de pruebas completamente funcional. Abordémoslos uno a la vez.

### Yendo Multilineal {#going-multilinear}

<figure>
	<img
		src="/images/the-zk-chronicles/circuits-2/hyperspace.webp"
		alt="Han Solo y Chewbacca entrando al hiperespacio"
		title="¡Aquí vamos!"
	/>
</figure>

Entonces, necesitamos aplicar el protocolo de verificación de la suma en esa expresión larga que codifica el predicado de cableado:

$$
g_i(X,Y) = A_i(X,Y,z)[W_{i+1}(X) + W_{i+1}(Y)] + M_i(X,Y,z)W_{i+1}(X)W_{i+1}(Y)
$$

Durante la verificación de suma, necesitamos poder seleccionar **valores aleatorios** seleccionados de un **campo finito** $\mathbb{F}$ para cada componente de las entradas. ¡Eso significa que necesitaremos **extender** el dominio de esos polinomios!

Si bien hay múltiples formas de hacer esto, hay una forma elegantemente simple y eficiente de hacerlo: [extensiones multilineales](/es/blog/the-zk-chronicles/multilinear-extensions) (**MLEs**). Si tomamos MLEs de cada polinomio involucrado, obtenemos una expresión que es adecuada para nuestras necesidades:

$$
\tilde{W}_i(z) = \sum_{a,b \in \{0,1\}^{k_{i+1}}} \tilde{A}_i(a,b,z)[\tilde{W}_{i+1}(a) + \tilde{W}_{i+1}(b)] + \tilde{M}_i(a,b,z)\tilde{W}_{i+1}(a)\tilde{W}_{i+1}(b)
$$

> Oh, por cierto, denotamos la extensión multilineal con el símbolo de tilde ($\sim$), así que $\tilde{W}$ es la extensión multilineal de W (definida sobre un dominio más restringido, como un hipercubo booleano).
>
> ¡Con respecto a la igualdad anterior, siéntete libre de verificar si se cumple si quieres!

¡Y con esto, podemos realizar una verificación de suma en cada capa!

<quiz src="the-zk-chronicles/circuits-part-2/multilinear-extensions.json" lang="es" />

### Reduciendo Evaluaciones {#reducing-evaluations}

Por último, recuerda que la consulta de oráculo al final de cada verificación de suma (para cada capa) requiere **dos evaluaciones** de la capa anterior, en alguna entrada seleccionada aleatoriamente:

$$
z_1 = \tilde{W}_{i+1}(a^*), z_2 = \tilde{W}_{i+1}(b^*)
$$

Ahora, si tuviéramos que realizar dos verificaciones cada vez, el número de veces que necesitaríamos ejecutar la verificación de suma completa crecería **exponencialmente**, haciendo que nuestra estrategia sea inutilizable. ¡Por lo tanto, el toque final en nuestro mecanismo es intentar **combinar** esas dos verificaciones en una sola!

> ¡Esto será una herramienta útil en otros contextos, así que enlazaré de vuelta a esta sección en el futuro. ¡No te preocupes!

Podemos usar un truco muy inteligente para esto. Definamos:

$$
\ell: \mathbb{F} \rightarrow \mathbb{F}^{k_{i+1}}
$$

Esto es simplemente una **línea**. Y [ya sabemos](/es/blog/the-zk-chronicles/math-foundations/#interpolation) que una línea está definida por dos **puntos**. Podemos establecerlos como $\ell(0) = a^*$, y $\ell(1) = b^*$.

Ahora esta línea **codifica ambos valores**.

Con esto, definiremos un pequeño **subprotocolo**. Así es como funciona:

- El probador envía un polinomio univariado de grado como máximo $k_{i+1}$, reclamado que es igual a:

$$
q(X) = \tilde{W}_{i+1} \circ \ell(X) = \tilde{W}_{i+1}(\ell(X))
$$

- El verificador luego verifica que $z_1 = q(0)$, y $z_2 = q(1)$. Esto valida que al menos, este polinomio reclamado $q(X)$ codifica los valores requeridos.
- Finalmente, el verificador elige algún punto aleatorio $r^*$, y con esto calculan:

$$
q(r^*) = \tilde{W}_{i+1}(\ell (r^*))
$$

Entonces, ¿qué está pasando aquí? El probador esencialmente está proporcionando una forma para que el verificador evalúe $W_{i+1}$ de manera "segura" para la verificación de suma de la siguiente capa:

$$
\tilde{W}_{i+1}(\ell(r^*)) = \sum_{a,b \in \{0,1\}^{k_{i+2}}} g_{i+1}(a,b,\ell(r^*))
$$

> ¡Nota que esta verificación **no** corresponde a **seleccionar una capa aleatoria en la siguiente capa**! En su lugar, usamos algún valor aleatorio $\ell(r^*)$ que probablemente no estará en un índice de compuerta válido, sino en algún otro punto!

La idea clave es que el probador **no conoce** $r^*$ **de antemano**. Debido a esto, si $q(X)$ es en realidad **incorrecto** (llamémoslo $q'$), sabemos gracias al [lema de Schwartz-Zippel](/es/blog/the-zk-chronicles/multilinear-extensions/#the-schwartz-zippel-lemma) que es muy probable que:

$$
q'(r^*) \neq \tilde{W}_{i+1}(\ell (r^*))
$$

¡Esto hará la vida muy difícil para el probador, que tiene que continuar con la siguiente ronda de verificación de suma con una **suma reclamada incorrecta**, para la cual no podrían usar los polinomios de cable reales!

Con estas dos consideraciones en mente, ¡el protocolo está completamente definido!

El flujo va así:

- El probador codifica las capas del circuito como polinomios, y calcula sus extensiones multilineales.
- Comenzando en la última capa, el probador y el verificador se involucran en una ronda de verificación de suma, usando el valor de salida como la afirmación inicial.
- El probador reduce las dos evaluaciones requeridas de $W$ a una sola a través de $q(X)$, que envían al verificador. El verificador luego calcula la afirmación para la siguiente ronda de verificación de suma.
- Enjuaga y repite hasta que se alcanza la capa de entrada, momento en el cual el verificador puede cerrar las verificaciones por su cuenta (¡no se necesita acceso al oráculo!).

<quiz src="the-zk-chronicles/circuits-part-2/line-reduction.json" lang="es" />

---

## Análisis {#analysis}

Como siempre, sin embargo, necesitamos evaluar algunos aspectos clave sobre el protocolo para determinar si tiene sentido o no: a saber, **completitud**, **solidez** y **análisis de costos**.

> Sé que ustedes podrían estar cansados en este punto. Esto ya es una bomba de conocimiento tal como está.
>
> **tl;dr**: GKR es sólido con error despreciable, el verificador corre aproximadamente en $O(d \cdot log S)$, pero el probador es costoso en $O(S^3)$. Si quieres los detalles, sigue leyendo. ¡De lo contrario, salta al resumen!

### Solidez {#soundness}

La completitud no necesita mucha explicación: siempre que el probador sea honesto, todas las expresiones que presentamos deberían funcionar. Sin embargo, la solidez sí requiere un poco más de trabajo para demostrarse.

> ¡Básicamente como siempre!

En cada capa $i$, el probador podría mentir sobre:

- Los polinomios enviados durante la verificación de suma. Sabemos que estos tienen grado $1$, así que usando el lema de Schwartz-Zippel, hay una probabilidad de $1 / \left | \mathbb{F} \right |$ de que el probador tenga suerte sobre la elección aleatoria del verificador — esencialmente la misma lógica que usamos [aquí](/es/blog/the-zk-chronicles/sum-check/#completeness-and-soundness).
- La reducción de línea $q(X)$. Debido a que $q(X)$ es como máximo un polinomio de grado $k_{i+1}$, podemos usar nuevamente el lema de Schwartz-Zippel, y calcular la probabilidad de una coincidencia aleatoria sobre la elección de $r^*$ como máximo $k_{i+1} / \left | \mathbb{F} \right |$.

Una vez atrapado en una mentira en una capa dada, el probador debe continuar a la siguiente capa con una **afirmación incorrecta**. Necesitarían tener suerte en **cada capa subsiguiente** para evitar la detección. Lo que significa que para el circuito completo, el error de solidez total es la **suma** de los errores en cada capa.

Esto resulta en $(d + log_2(S)) / \left | \mathbb{F} \right |$. ¿Qué podemos hacer con este valor? Esencialmente, ¡que podemos hacer este error **arbitrariamente pequeño** con una selección adecuada de $\mathbb{F}$! En otras palabras, cuanto mayor sea el tamaño de $\mathbb{F}$, menor será el error de solidez.

¡Así que el protocolo GKR es sólido!

### Costos {#costs}

El otro aspecto importante a discutir son los **costos computacionales** para el protocolo completo. Esto determinará si el protocolo tiene alguna posibilidad de ser útil.

Para explicar los costos, sin embargo, necesitaríamos un par de lemas e ideas que aún no hemos presentado. No creo que sea sabio seguir empaquetando contenido en este único artículo, y podríamos tener la oportunidad de hablar sobre esto en el futuro. Así que en su lugar, nuevamente, resumiré los costos para ustedes:

- El probador corre en tiempo $O(S^3)$.
- El verificador, simplificando un poco, corre en $O(n + d.log_2(S))$, donde $n$ es el costo de evaluar la MLE de la capa de entrada.
- Los costos totales de comunicación son $O(d.log_2(S))$ elementos de campo.

> ¡Por supuesto, es importante entender de dónde vienen estos números — pero prometo que continuaremos mejorando nuestra lógica de estimación a medida que avancemos más en la serie!

Lo más importante ahora es evaluar las ganancias de tiempo de verificación al aplicar el protocolo GKR. Nota que el probador es **realmente lento**: el tiempo cúbico significa que su tiempo de ejecución crecerá bastante incluso para circuitos no tan grandes.

El verificador, sin embargo, se beneficia dramáticamente cuando los circuitos son **poco profundos**, lo que significa que su profundidad $d$ es pequeña.

> Solo para lanzar algunos números: para un circuito de tamaño $2^20$ (aproximadamente 1 millón de compuertas) y profundidad $d = 20$, el probador correrá en aproximadamente $10^{18}$ operaciones (lo cual es extremadamente costoso), ¡pero el tiempo de ejecución del verificador será solo aproximadamente $10^{6}$, que es mucho más pequeño!
>
> ¡Y el número de elementos de campo que se comunican es aún menor: solo $400$!

Aunque esto suena bien en principio, la verdad es que los costos del probador de GKR siguen siendo **prohibitivamente altos** para circuitos grandes. Esto se convierte en un cuello de botella para su aplicabilidad, especialmente debido a su naturaleza interactiva.

Por esta razón, las implementaciones prácticas se enfocan en ciertas optimizaciones, o pasos de preprocesamiento que reducen los costos del probador a un nivel más manejable — pero eso, mis amigos, será una historia para otro momento.

---

## Resumen {#summary}

Ay por Dios. Eso si que fue un montón.

> ¡Pero lo hicimos!

<figure>
	<img
		src="/images/the-zk-chronicles/circuits-2/dora.webp"
		alt="Dora la Exploradora" 
		title="No Dora. Esto no fue divertido."
	/>
</figure>

¡Acabamos de ver nuestro primer protocolo de verificación de circuitos **verdaderamente general**! Y a pesar de sus limitaciones de tiempo de ejecución, GKR revela algo súper importante: que la **verificación rápida** de **cómputos arbitrarios** es posible.

> Este es un paso crucial en nuestro viaje hacia protocolos más prácticos. Nuestro objetivo de ahora en adelante será encontrar mejores formas de codificar y verificar cómputos, pero al menos ahora sabemos que **se puede hacer**.
>
> Creo que este es un momento poderoso en nuestro viaje. Te invito a tomarte un momento para apreciar cuánto hemos hecho con solo un par de herramientas. ¡Solo imagina en qué cosas locas nos meteremos más adelante!

Hablando de eso, nos hemos enfocado únicamente en circuitos como nuestros modelos de cómputo general por ahora. No sé tú, pero para mí, escribir un circuito no se siente como la cosa más natural de hacer al escribir un programa. Normalmente pensamos en cómputo en otros términos.

Entonces, ¿eso significa que nuestros esfuerzos son fundamentalmente defectuosos? ¡Esta es una pregunta que intentaremos responder en nuestro [próximo encuentro](/es/blog/the-zk-chronicles/computation-models)!

¡Nos vemos pronto!
