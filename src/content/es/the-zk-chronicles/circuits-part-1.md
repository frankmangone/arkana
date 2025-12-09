---
title: 'Las Crónicas de ZK: Circuitos (Parte 1)'
author: frank-mangone
date: '2025-12-08'
thumbnail: 'https://cdn-images-1.medium.com/max/640/0*sgS-5SnPV3A0P6gf.jpg'
tags:
  - zeroKnowledgeProofs
  - arithmeticCircuits
  - polynomials
  - sumCheck
description: >-
  A medida que nos acercamos a sistemas de pruebas generales, necesitamos
  estudiar modelos de computación, ¡lo cual nos lleva a los circuitos!
contentHash: c248a2a9d6b974a54755fbbf187f3d48f3de6b0b08185598957c6a8a81f1a21d
supabaseId: null
---

Después de haber pasado por el [artículo anterior](/es/blog/the-zk-chronicles/sum-check), hemos aprendido sobre nuestro primer sistema de pruebas en la forma del protocolo de verificación de la suma.

La verificación de la suma está muy bien, pero seamos honestos: una suma sobre un hipercubo booleano no es particularmente atractiva. Vamos a necesitar algo **más general** para representar cómputos arbitrarios, permitiéndonos así probar una gama más amplia de afirmaciones.

Para hacerlo, primero necesitamos descifrar algo que está en el mismísimo núcleo de la computación verificable: cómo **representar cómputos** en sí mismos.

Hay muchas maneras de modelalos, así que hoy, nos enfocaremos solo en una única construcción para hacer justamente eso: **circuitos**.

¡Genial! Con nuestro objetivo claramente establecido, ¡vamos!

---

## Circuitos 101 {#circuits-101}

No es ningún secreto que los circuitos son un modelo muy general para la computación.

La CPU de tu computadora está construida a partir de decenas de millones de pequeños **transistores**, que forman circuitos lógicos que permiten a tu computadora realizar una gran conjunto de operaciones — desde ejecutar una simple multiplicación en tu aplicación de calculadora, hasta tareas complejas como controlar los píxeles de la pantalla en la que estás leyendo esto.

> A menos que este texto alguna vez llegue a una versión impresa, en cuyo caso no estarías mirando píxeles... Pero creo que el punto se entiende.

Genial! Pero en lugar de pensar en términos de transistores y circuitos físicos, acá estamos hablando de matemáticas. Vamos a necesitar una definición rigurosa de qué es un circuito — una con la que podamos trabajar en términos de nuestros polinomios y protocolos.

Entonces, así es como los definimos: un **circuito booleano** es un [grafo acíclico dirigido](https://en.wikipedia.org/wiki/Directed_acyclic_graph) (DAG) donde:

- **Nodos internos** (llamados **compuertas**) que representan operaciones ($\textrm{AND}$, $\textrm{OR}$, $\textrm{NOT}$, etc.)
- **Aristas** (o **cables**) que llevan valores booleanos ($0$ o $1$) entre compuertas
- **Nodos de entrada**, que no tienen cables entrantes: es donde alimentamos nuestras entradas (inputs)
- **Nodos de salida**, que no tienen cables salientes: producen el resultado final

Requerir que los circuitos sean DAGs es esencial: establece un flujo desde las entradas hacia las salidas, representando inequívocamente un cómputo.

Aquí hay un ejemplo:

<figure>
	<img
		src="https://cdn-images-1.medium.com/max/1024/1*-v8GYT0Y1pbn7zFKBT4rQQ.png"
		alt="Un circuito simple"
		title="[zoom]" 
	/>
</figure>

> Algunas formulaciones ponen las negaciones como entradas, haciendo así que el número de entradas sea una función del número original de entradas $n$. ¡Esto solo impacta el análisis de costos, pero la formulación es completamente equivalente!

Los circuitos pueden representar muchas cosas. En esta forma booleana, expresan **condiciones lógicas** que queremos evaluar en una serie de entradas. Por ejemplo: ¿tengo más de 30 años, y soy hombre, y tengo un trabajo u alguna otra fuente de ingresos? Esa declaración, ¡podemos expresarla como un simple circuito booleano!

<figure>
	<img
		src="https://cdn-images-1.medium.com/max/1024/1*j2J3glxpvTnRtllSh_FBcQ.png"
		alt="Una representación de la declaración anterior como un circuito"
		title="[zoom]" 
	/>
</figure>

En resumen, un circuito es simplemente una **receta estática** para una computación con algunas propiedades útiles, como ser **determinista** (las mismas entradas siempre devuelven los mismos valores), y ser componible (los circuitos pueden **encadenarse unos con otros juntos**, justo como en las computadoras).

Por último, medimos el **tamaño** ($S$) de un circuito por su número de compuertas, mientras que la **profundidad** ($D$) es el camino más largo desde cualquier entrada hasta cualquier salida.

---

Con eso, tenemos nuestra primera forma de prescribir un cómputo. Por supuesto, solo estamos admitiendo variables booleanas — pero eso no parece impedir que las computadoras se usen para casi cualquier tarea.

Sin embargo, debo recordarte: nuestro objetivo con esta serie es **probar afirmaciones**. Por lo tanto, ahora nuestro enfoque debería cambiar hacia tratar de probar algo sobre estos circuitos.

Y eso nos lleva a nuestro próximo problema.

---

## Satisfacibilidad de Circuitos {#circuit-satisfiability}

Si bien podríamos intentar probar si la salida de un circuito booleano es correcta dado un conjunto de entradas, eso podría no sentirse como un problema demasiado interesante (al menos por ahora). Después de todo, la salida también es un valor booleano, lo que significa que solo tenemos **dos salidas posibles**.

> Sería una historia diferente si pudiéramos tener **múltiples salidas posibles**. ¡Exploraremos esa idea en unos momentos!

Tal vez podamos pensar en algo un poco más divertido.

Qué tal esto entonces: dado un circuito, ¿qué pasaría si nos preguntamos si hay **alguna entrada** que haga que la salida sea $1$?

Cuando esto sucede, decimos que la entrada **satisface** el circuito. Y determinar si un circuito tiene alguna entrada que lo satisfaga se conoce como el problema de satisfacibilidad de circuitos, o CSAT para abreviar.

> En realidad, este es un problema enormemente importante, como pronto aprenderemos. Muchos otros problemas como la **factorización** o **coloración de grafos** pueden reducirse a circuitos. Sin embargo, no nos sumergiremos en esas transformaciones hoy — pero definitivamente es posible.
>
> ¡Retomaremos esta conversación en unos artículos!

CSAT ya es un problema desafiante por sí mismo, pero hoy, quiero ir un paso más allá. No solo nos estaremos preguntando si existe una solución: nuestro objetivo para hoy será probar que sabemos **exactamente cuántas soluciones existen**. En otras palabras, queremos contar todas las posibles **combinaciones de entradas** cuya salida al circuito es $1$.

Esto es lo que llamamos la versión de **conteo** de la satisfacibilidad de circuitos, escrita como #SAT (el símbolo # denota conteo).

Una vez más, apuesto a que te estás preguntando **por qué demonios nos importaría esto**. Para ser justos, esa es una pregunta razonable sobre los esfuerzos de hoy. Se siente más natural encontrar una solución a un problema, en vez de enumerar todas las soluciones posibles. Y aunque puede haber situaciones donde esto sea deseable, quiero darte dos razones para enfocarnos en #SAT:

- Primero, es un **problema estrictamente más difícil** que CSAT. Por lo tanto, si podemos manejar #SAT de manera eficiente, casi tenemos garantizado poder manejar CSAT de manera eficiente también — ¡solo necesitamos probar que el número de entradas satisfactorias es mayor que cero!
- En segundo lugar, elegimos este problema por su representación matemática, que resulta ser muy **conveniente** dado nuestro conocimiento actual. Hay una manera muy bonita y concisa de representar este problema (#SAT): si interpretamos el circuito como una **función** $\phi (X)$ con $n$ entradas booleanas, entonces podemos expresar el número de combinaciones satisfactorias como:

$$
\sum_{x \in \{0,1\}^n} \phi(x)
$$

> Está bien sumar sobre el conjunto completo de combinaciones posibles, porque las que no satisfacen el circuito resultarán en $\phi (X) = 0$.

Como puedes imaginar, encontrar esta cantidad (de combinaciones satisfactorias) es un **problema muy difícil**. Los algoritmos más rápidos conocidos tienen un rendimiento similar a un simple enfoque de fuerza bruta, que vendría a ser probar todas las combinaciones posibles.

Y sobre esa **conveniencia** de la que hablé antes, ¿has notado cómo la expresión #SAT se ve **sorprendentemente similar** a la de verificación de la suma? Solo estamos calculando la suma de una función sobre un conjunto de entradas en un **hipercubo booleano**. Esa es una pista clara — solo necesitamos descifrar cómo aplicar una verificación de la suma a nuestro nuevo problema, ¡y tendremos un algoritmo de verificación prácticamente gratis!

### Transformando el Circuito {#transforming-the-circuit}

Maravilloso! Entonces, digamos que tenemos algún circuito binario $\phi (X)$.

Desafortunadamente, la **naturaleza booleana** del circuito se vuelve una limitación. Para aplicar el protocolo de verificación de la suma, necesitaríamos evaluar $\phi (X)$ en puntos distintos de $0$ o $1$, pero nuestro circuito no puede manejar eso...

¡Por ahora!

Necesitaríamos de alguna manera **extender** esta función para manejar otros valores de entrada. Y dado que nuestro circuito está hecho de **compuertas**, todo lo que necesitaríamos hacer es encontrar una manera de extenderlas, para que se comporten como esperarías cuando las entradas son binarias, pero aún puedan procesar otros valores como entradas.

Entonces, ¿cómo hacemos eso?

Bueno, no tenemos muchas herramientas matemáticas a nuestra disposición todavía — de hecho, la única construcción útil que hemos aprendido son los **polinomios**. Pero eso es suficiente: ¿qué tal si intentamos expresar las **compuertas como polinomios**?

> Como un pequeño ejercicio, puedes intentar encontrar algunas expresiones para esto tú mismo. Aquí, voy a poner un pequeño bloque de spoiler en caso de que quieras intentarlo!

<figure>
	<img
		src="https://cdn-images-1.medium.com/max/673/0*OE1jnhyk87I0ZedJ.jpg"
		alt="Una caja de bloque de spoiler" 
		title="Bloque de spoiler"
	/>
</figure>

Así es como se ve la representación polinómica de una compuerta $\textrm{AND}$:

$$
\textrm{and}(X,Y) = X.Y
$$

Esta sería la compuerta $\textrm{OR}$:

$$
\textrm{or}(X,Y) = X + Y — X.Y
$$

Y la negación sería:

$$
\textrm{neg}(X) = \bar{X} = 1 — X
$$

> Por supuesto, otras compuertas lógicas tienen sus respectivas representaciones polinómicas. Por ejemplo, la compuerta $\textrm{XOR}$, que puede construirse mediante una combinación de compuertas $\textrm{AND}$, $\textrm{OR}$, y **negación**, resultaría en un polinomio que sería la composición de los polinomios individuales en juego aquí.
>
> La expresión resultante sería $\textrm{xor}(X,Y) = X(1 - Y) + (1 - X)Y$. ¡Si te sientes un poco atrevido, inténtalo tú mismo!

<quiz src="/the-zk-chronicles/circuits-part-1/nand-gate.json" lang="es" />

Al reemplazar cada compuerta por estos polinomios, de hecho estamos **extendiéndolas directamente**: las compuertas funcionan justo como esperarías para entradas booleanas, pero hacen **otras cosas** cuando se les dan otros valores en algún **campo finito**.

> ¿Recuerdas cuando dije que tener múltiples salidas posibles sería interesante? ¡Bueno, ahí lo tienes!

Efectivamente, hemos **transformado** nuestro circuito booleano inicial $\phi (X)$ en un nuevo tipo de construcción, llamada **circuito aritmético**, que denotaremos $\varphi (X)$.

<figure>
	<img
		src="https://cdn-images-1.medium.com/max/1024/0*izjJBjYkuP-Ovn4Z.jpg"
		alt="Mente = explotada"
	/>
</figure>

### Aritmetización {#arithmetization}

Ahora, quiero que nos detengamos en un pequeño detalle. Mira la compuerta $\textrm{AND}$ por un momento:

$$
\textrm{and}(X,Y) = X.Y
$$

No sería difícil llamarla una **compuerta de multiplicación** en su lugar, ahora que la hemos extendido a entradas en un campo finito. Después de todo, la multiplicación es una **operación primitiva** en nuestro campo.

Por el contrario, la compuerta $\textrm{OR}$ no es tan primitiva. Uno podría preguntarse si necesitamos preservar estas compuertas como están, o si podemos **desenvolverlas** en operaciones más simples.

Bueno, la otra operación primitiva que tenemos en campos finitos es la **adición**. Entonces, ¿qué tal si trabajamos solo con compuertas de **adición** y **multiplicación**? ¿Es posible?

¡Claro que sí, es **completamente posible** hacer esto!

> Antes de que preguntes: la sustracción de algún número $b$ se logra multiplicándolo por el **inverso aditivo** de $1$, que es $p - 1$ (en el campo $\mathbb{F}_p$). Esto es, para obtener $a - b$, calculamos $a + (-b)$ en su lugar, donde $-b = (p-1)·b$.
>
> ¡Es exactamente como multiplicar por $-1$!

Este proceso es tan importante, que incluso tiene un nombre propio: **aritmetización**.

---

¡Excelente! Ahora tenemos una forma de extender circuitos booleanos a circuitos aritméticos, haciendo que puedan procesar cualquier entrada en un campo dado $\mathbb{F}$.

Nota que nuestro circuito aritmético $\varphi(X)$ es básicamente equivalente a un polinomio $g(X)$, obtenido a través de la **composición** de funciones de compuertas.

> Más a menudo que no, es un polinomio no lineal.

<figure>
	<img
		src="https://cdn-images-1.medium.com/max/1024/1*epCteoiYvfwK6rFXHT86Pg.png"
		alt="Un circuito interpretado como un polinomio"
		title="[zoom] Esto resultaría en g(X,Y,Z) = YZ² + X² + YX + 3YZ"
	/>
</figure>

Y dado que $\varphi(X)$ es un polinomio sobre algún campo $\mathbb{F}$, ¡podemos aplicar directamente nuestro confiable protocolo de verificación de la suma para evaluar la satisfacibilidad!

<figure>
	<img
		src="https://cdn-images-1.medium.com/max/640/0*sgS-5SnPV3A0P6gf.jpg"
		alt="Bender de Futurama en su meme 'Nice'" 
	/>
</figure>

Así que ahí lo tienes — ahora hemos visto un problema (#SAT) que puede ser **transformado** en una instancia del protocolo de verificación de la suma.

Hay algunos otros matices que necesitamos abordar, como descifrar qué tan grande necesita ser $\mathbb{F}$ para que el error de solidez sea pequeño — pero no necesitamos preocuparnos demasiado por eso ahora. De momento, mi objetivo es intentar transmitir algunas ideas centrales, de las cuales la **aritmetización** es una importante.

### Costos Computacionales {#computational-costs}

> Creo que es seguro saltarse esta parte si estás aquí por los conceptos más importantes. Si ese es tu caso, ¡entonces salta adelante!

Si bien no es realmente necesario sumergirse en un análisis de completitud y solidez (¡porque sería muy similar al que ya hicimos para la verificación de la suma!), si tiene sentido hablar sobre **costos computacionales**.

Aquí, en lugar de pensar en $\varphi(X)$ como un **polinomio**, necesitamos pensar en él como una **receta para computación**. Después de todo, no tenemos los coeficientes del polinomio resultante, sino un conjunto de compuertas de adición y multiplicación.

Y nos preguntamos: ¿tiene esto alguna consecuencia tangible? Para eso, necesitamos mirar el impacto en el **tiempo de ejecución** para cada actor en el protocolo.

Empecemos con el **probador**. Necesitarán evaluar el circuito en cada entrada en $\{0,1\}^n$. Cada evaluación requiere que cada una de las $S$ compuertas sea evaluada individualmente, por lo que el costo total es $O(S \cdot 2^n)$. Las sumas parciales en cada ronda se vuelven menos y menos costosas, por lo que el tiempo total del probador es solo $O(S \cdot 2^n)$.

Así que sí, es más costoso que la simple verificación de la suma. Y cuanto más grande es el circuito, peor se pone la situación. Pero recuerda: ¡el probador sigue siendo el que tiene el hardware potente!

En contraste, el verificador realiza un total de $O(n)$ rondas de verificación de la suma (una por variable), solo verificando ecuaciones polinómicas simples en cada ronda.

Además, los costos del verificador permanecen en $O(n)$ si asumimos acceso de oráculo. Sin embargo, en la práctica, el verificador puede simplemente **ejecutar el circuito él mismo** (si tiene conocimiento de él, por supuesto), y por lo tanto no tiene que confiar en alguna fuente externa (el oráculo). Si lo hace, entonces necesitamos incluir los costos de evaluación del circuito, y el tiempo de ejecución del verificador se convierte en $O(n + S)$.

Por último, tenemos un costo de comunicación de $O(n)$ elementos de campo, ya que intercambiamos un número fijo de elementos de campo en cada ronda.

> Estrictamente hablando, el número de elementos de campo depende del tamaño del polinomio univariado más grande enviado por el probador — pero no nos preocupemos demasiado por eso, y asumamos que estos van a ser polinomios de bajo grado.

<quiz src="/the-zk-chronicles/circuits-part-1/extension-purpose.json" lang="es" />

Okay, ¡perdón por tanta información! Todo esto es para finalmente decir: como mínimo, el rendimiento de #SAT es **estrictamente peor** que el tiempo de ejecución de la verificación de la suma por sí sola.

El nuevo ingrediente en la mezcla es el **tamaño del circuito**, $S$. Sería muy genial si el tiempo de verificación fuera **sublineal** en el tamaño del circuito en lugar de lineal, como es nuestro caso actual. De esa manera, todavía podríamos verificar computaciones en circuitos grandes rápidamente — pero el tiempo lineal en el tamaño del circuito esencialmente coloca una carga pesada en el tiempo de ejecución para circuitos grandes.

Y algunos circuitos (incluso para cosas simples) pueden volverse **realmente grandes**. Entonces, como mínimo, va a ser realmente importante tener esto en cuenta.

---

## Resumen {#summary}

Lento pero seguro, estamos progresando.

Los avances de hoy pueden no parecer mucho. Después de todo, el problema que examinamos se siente una vez más bastante limitado en su aplicabilidad.

Como mínimo, #SAT nos ha guiado a través de algunas técnicas para representar computaciones generales, llevándonos finalmente al concepto súper importante de **circuitos aritméticos**.

Como ya mencionamos, los circuitos pueden representar muchas cosas. Sin embargo, al expandirlos para permitir más que solo operaciones booleanas, hemos ganado mucho en términos de expresividad, porque ahora estos circuitos pueden representar prácticamente **cualquier computación arbitraria usando enteros**, en lugar de solo $0$s y $1$s.

Idealmente, sin embargo, lo que nos gustaría hacer es tomar algún circuito, y en lugar de preocuparnos por entradas que satisfagan el circuito, querríamos simplemente evaluarlo en algunas entradas dadas, y poder mostrar que el circuito ha sido **correctamente evaluado**, de manera eficiente.

> ¡Esto es muy diferente de #SAT, pero no tan diferente del problema CSAT que también vimos hoy!

Si logramos hacer eso, entonces hablremos encontrado nuestro primer marco **verdaderamente general** para probar afirmaciones.

Pero para llegar allí, amigos míos, primero necesitaremos aprender sobre una **nueva herramienta**. ¡Ese será nuestro próximo destino!
