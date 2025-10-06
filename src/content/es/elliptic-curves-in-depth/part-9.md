---
title: Curvas Elípticas En Profundidad (Parte 9)
author: frank-mangone
date: '2025-10-06'
thumbnail: /images/elliptic-curves-in-depth/part-9/0*cA5HOtwjA3YxYxcy-20.jpg
tags:
  - pairings
  - ellipticCurves
  - degeneracy
  - algorithms
description: >-
  Un cierre sobre emparejamientos, con algunas discusiones sobre algoritmos,
  tipos y otros matices.
readingTime: 15 min
contentHash: 2a773e832ed4fab71c51eb5bd399e539af38c8ef84cd18ce72aaf10cae53095e
supabaseId: 73dac0f1-e9fd-4c5f-aad1-3f87f25079b8
---

¡Muy bien! Dejamos la [entrega anterior](/es/blog/elliptic-curves-in-depth/part-8) con un resumen de la forma bastante específica en que se definen los emparejamientos.

Una vez terminamos nuestra discusión, nos quedaron un par de definiciones sospechosamente simples para los emparejamientos de Weil y Tate. Para construcciones tan complejas, es casi poético que terminemos con expresiones como esta:

$$
t_r(P,Q) = f(D_Q)
$$

Sin embargo, y como probablemente ya te imaginas a estas alturas, las apariencias engañan: de hecho, no hemos dicho nada sobre cómo **computar emparejamientos** a partir de estas expresiones simples.

> ¡Y esa es en realidad la parte más importante, si queremos tener alguna esperanza de poner los emparejamientos a buen uso!

Hoy, veremos la técnica que hace posible la computación de emparejamientos, junto con algunos detalles más que finalmente darán cohesión a todos los elementos que hemos visto hasta ahora.

Estamos mucho más cerca de la meta. ¡Solo un poco más!

---

## Computación {#computation}

Enfoquémonos en el emparejamiento de Weil por un momento:

$$
w_r(P,Q) = \frac{f(D_Q)}{g(D_P)}
$$

En el artículo anterior, vimos que hay una forma natural de **evaluar una función** en un divisor — y eso es exactamente lo que necesitaríamos hacer para computar este emparejamiento. Es decir, para el divisor $D$ y la función $f$:

$$
f(D) = \prod_{P \in E(\mathbb{F}_q)} f(P)^{n_P}
$$

Esas $f$ y $g$ ahí no son funciones cualquiera — dijimos que eran **exactamente** las funciones cuyos divisores eran:

$$
(f) = rD_P, \ (g) = rD_Q
$$

Lo que nunca mencionamos es **cómo obtenerlas** - [la última vez](/es/blog/elliptic-curves-in-depth/part-8), simplemente mencionamos que tales funciones pueden construirse, pero no cómo. Es claro que una vez que las tenemos, es solo cuestión de conectarlas en la definición. ¿Pero cómo las encontramos?

Veamos cómo podemos llegar ahí.

### Construyendo las Funciones {#building-the-functions}

Para empezar, necesitamos volver a una de las afirmaciones al inicio del artículo anterior: que podemos construir una función $f_{m,P}$ cuyo divisor (que es principal) es de esta forma:

$$
(f_{m,P}) = m(P) — ([m]P) — (m — 1)(\mathcal{O})
$$

Lo que vamos a hacer es una especie de **proceso inductivo**: asumiendo que tenemos $f_{m,P}$, ¿podemos construir $f_{m+1,P}$?

La respuesta es **sí** — y de una manera bastante elegante.

Haremos uso de un par de trucos que ya hemos visto, que involucran dos funciones muy simples. Primero, tomemos la línea que pasa por $P$ y $[m]P$, cuyo divisor es simplemente:

$$
(\ell_{[m]P,P}) = (P) + ([m]P) + (-[m+1]P) — 3(\mathcal{O})
$$

Segundo, tomemos la línea vertical que pasa por $[m+1]P$:

$$
(v_{[m+1]P}) = (-[m+1]P) + ([m+1]P) — 2(\mathcal{O})
$$

Usando estos dos divisores, podemos encontrar una relación muy elegante entre $f_{m,P}$ y $f_{m+1,P}$:

$$
(f_{m+1,P}) = (f_{m,P}) + (\ell_{[m]P,P}) — (v_{[m+1]P})
$$

Nuestro conocimiento previo de divisores revela algo asombroso sobre la observación anterior: la igualdad de divisores puede mapearse directamente a una expresión algebraica con la que **podemos trabajar**:

$$
f_{m+1,P} = f_{m,P} \frac{\ell_{[m]P,P}}{v_{[m+1]P}}
$$

¡Y eso es prácticamente todo! Dado cualquier valor de $m$, podemos empezar en la función $f_{1,P}$, y avanzar hasta la función deseada. Como dicen los yankees, "piece of cake", ¿verdad?

<figure>
	<img
		src="/images/elliptic-curves-in-depth/part-9/1*Y71Dkhd9DKSknDYhBZkJTw-10.png"
		alt="Una señora con un pastel gigante" 
		title="Lo que tú digas, amigo"
	/>
</figure>

No tan rápido, vaquero.

### Donde Se Pone Complicado {#where-it-gets-tricky}

Recuerda que nuestro objetivo con todo esto era construir una función cuyo divisor es:

$$
(f_{r,P}) = r(P) — r(\mathcal{O})
$$

Ese valor $r$ es exactamente el tamaño de la **r-torsión**. En la práctica, el valor de $r$ será **enorme** (estamos hablando de más de $2^{150}$), lo que significa que encontrar nuestras funciones realizando una actualización a la vez **no nos llevará a ningún lado**.

> Dicho de otra manera, usando la estrategia anterior, la computación de emparejamientos sería inviable en la práctica, así que todo lo que tendríamos es una teoría bonita que no sirve para nada.

Sin embargo, los emparejamientos **sí** se usan en la práctica para varios protocolos criptográficos — así que debe haber algún truco en todo esto. Y por supuesto, la computación de emparejamientos fue posible gracias a las ideas de un tipo llamado [Victor S. Miller](https://en.wikipedia.org/wiki/Victor_S._Miller).

Y eso es lo que veremos a continuación.

### El Algoritmo de Miller {#millers-algorithm}

En lugar de tratar de agregar uno a $m$ en cada iteración, ¿qué pasaría si tratamos de **duplicarlo**?

Veamos. Empezamos con alguna función $f_{m,P}$:

$$
(f_{m,P}) = m(P) — ([m]P) — (m — 1)(\mathcal{O})
$$

Incluso cuando vamos una iteración a la vez, eventualmente llegaremos a la siguiente función:

$$
(f_{2m,P}) = 2m(P) — ([2m]P) — (2m — 1)(\mathcal{O})
$$

La parte interesante ocurre cuando tratamos de **elevar al cuadrado** nuestra función original. Por las propiedades de divisores que ya conocemos, podemos calcular que el divisor resultante es:

$$
(f_{m,P}^2) = 2(f_{m,P}) = 2m(P) — 2([m]P) — 2(m — 1)(\mathcal{O})
$$

¡Que es casi **sospechosamente similar** al divisor al que queremos llegar!

De hecho, podemos calcular que su diferencia es:

$$
(f_{2m,P} ) — ({f_{m,P}}²) = 2([m]P) — ([2m]P) — (\mathcal{O})
$$

Eso debería verse familiar ahora, ¿verdad?

<figure>
	<img
		src="/images/elliptic-curves-in-depth/part-9/0*L8jmx3bjxrPt7XAg-16.jpg"
		alt="Una mujer entornando los ojos intensamente" 
		title="*Entornando intensamente"
	/>
</figure>

Déjame ahorrarte el problema: es el divisor de la línea **tangente** a $[m]P$, menos el divisor de la **línea vertical** a través de $[2m]P$. En esencia, las funciones usadas para **duplicar** $[m]P$.

$$
(f_{2m,P} ) — ({f_{m,P}}²) = (\ell_{[m]P}) — (v_{[2m]P})
$$

Esta brillante intuición nos permite **duplicar** el valor actual de $m$ mediante:

- Elevar al cuadrado la función actual,
- Multiplicar por la línea tangente a $[m]P$,
- Dividir por la línea vertical en $[2m]P$ (que es solo un valor escalar).

Podemos llegar a cualquier valor de $r$ en tiempo logarítmico mediante **elevar-al-cuadrado-y-sumar**, usando un solo paso cuando sea necesario.

> Por ejemplo, para llegar a $r = 28$, podríamos hacer **duplicar**, **sumar**, **duplicar**, **sumar**, **duplicar**, **duplicar**.

Esto debería recordarte mucho al [algoritmo duplicar y sumar](/es/blog/elliptic-curves-in-depth/part-1/#fast-addition) que usamos para la multiplicación rápida de puntos de curvas elípticas. Detrás de escena, ambos usan la regla de la tangente para duplicar — es solo que estamos construyendo **funciones** en el caso del algoritmo de Miller.

Como observación final, debe notarse que a medida que profundizamos en el algoritmo, las funciones resultantes tendrán alto grado, así que almacenarlas completamente se vuelve **prohibitivamente costoso**.

El truco es no almacenar la función completa, sino su **evaluación** en algún divisor. Naturalmente, ¡todo lo que tenemos que hacer es elegir el divisor en el que queremos computar las funciones de emparejamiento!

---

El elegante algoritmo de Miller es lo que finalmente permite la computación práctica de emparejamientos. Pero esto no es todo lo que hay sobre estas estructuras — hay algunas cosas más que necesitamos tomar en cuenta.

---

## Tipos de Emparejamientos {#pairing-types}

Una cosa que hemos dejado un poco olvidada es la definición de los mapas de [traza](/es/blog/elliptic-curves-in-depth/part-7/#the-trace-map) y [anti-traza](/es/blog/elliptic-curves-in-depth/part-7/#the-characteristic-polynomial). Parecería que nos tomamos todo ese esfuerzo sin razón aparente.

Hasta ahora.

Verás, cuando definimos un emparejamiento como:

$$
e: \mathbb{G}_1 \times \mathbb{G}_2 \rightarrow \mathbb{G}_3
$$

Necesitamos considerar quiénes son realmente estos grupos. Claro, sabemos que pertenecen a la r-torsión, pero ¿está bien que escojamos **cualquier** subgrupo de torsión? ¿O deberíamos ser cuidadosos con nuestras decisiones?

Como podrías esperar, efectivamente hay que tener cuidado al seleccionar esos grupos. Hacer lo contrario podría causar algunas complicaciones.

Esto finalmente nos llevará a la idea de **tipos de emparejamientos**, que esencialmente describen la relación entre $\mathbb{G}_1$ y $\mathbb{G}_2$. Pero para entender completamente lo que está en juego, primero debemos entender algunas cosas sobre para qué podríamos estar usando los emparejamientos.

### Requisitos de Grupos {#group-requirements}

Al construir protocolos criptográficos con emparejamientos, hay **dos operaciones fundamentales** que necesitaremos realizar.

Primero, necesitaremos **hacer hash hacia nuestros grupos de elección**. Con esto, nos referimos a tomar datos arbitrarios — como el nombre de un usuario, dirección de email, algún mensaje, o prácticamente cualquier cosa — y **mapearlo determinísticamente** a un punto en $\mathbb{G}_1$ o $\mathbb{G}_2$.

> Por ejemplo, esto es esencial para esquemas como [encriptación basada en identidad](/es/blog/cryptography-101/pairings/#identity-based-encryption), donde la **identidad** de una persona se convierte en su clave pública a través de **hashing**.

También queremos que este proceso de hashing sea **eficiente**. Algunas elecciones de grupos hacen que tal cosa sea muy difícil de hacer, así que en su lugar, nos vemos obligados a trabajar con **[generadores](/es/blog/elliptic-curves-in-depth/part-3/#identity-and-generators) fijos** y **múltiplos escalares**, lo que limita severamente qué protocolos podemos construir. Es decir, solo podemos crear puntos de la forma $[k]P$ para algún generador fijo $P$, y no podemos manejar entradas arbitrarias directamente — un factor decisivo para la mayoría de aplicaciones.

Segundo, ocasionalmente necesitamos **homomorfismos eficientes** entre grupos. Tener un mapa eficientemente computable como este:

$$
\psi : \mathbb{G}_2 \rightarrow \mathbb{G}_1
$$

puede resultar extremadamente útil.

La razón para esto es que algunos protocolos requieren **verificar relaciones** o **realizar operaciones** que solo tienen sentido cuando los elementos están en el mismo grupo. Adicionalmente, las operaciones en algunos grupos son mucho más rápidas que en otros — ¡así que si podemos movernos entre grupos para una computación más rápida, es una gran ventaja!

> ¡Como una especie de truco computacional!

Pero por supuesto, hay un problemita. Siempre lo hay.

En este caso, el problema es que **no podemos conseguir ambas cosas fácilmente al mismo tiempo**. Diferentes elecciones de grupos proporcionan diferentes balances en este intercambio. Y eso es exactamente de lo que tratan los diferentes tipos de emparejamientos.

Con esto, estamos listos para presentarlos formalmente.

### Tipo 1: Emparejamientos Simétricos {#type-1-symmetric-pairings}

El caso más simple que podríamos imaginar es cuando $\mathbb{G}_1 = \mathbb{G}_2 = \mathcal{G}_1$

> Recuerdemos que $\mathcal{G}_1$ es el [subgrupo del campo base](/es/blog/elliptic-curves-in-depth/part-7/#torsion-structure).

Dado que usamos el mismo grupo para tanto $\mathbb{G}_1$ como $\mathbb{G}_2$, no es sorpresa que estos se llamen **emparejamientos simétricos**.

Veamos cómo se desempeñan contra nuestros requisitos. Primero, hacer hash hacia $\mathcal{G}_1$ es relativamente eficiente, ya que todo el grupo está en el campo base — así que empezamos bien. Y dado que ambos grupos son iguales, solo necesitamos **una función** hash.

En términos de mapas entre grupos, en realidad tenemos uno trivial — ¡el mapa identidad! ¿Supongo que eso realmente no cuenta? No importa - digamos que es otra pequeña victoria.

Entonces, ¿cuál es el intercambio? Todo parece bastante en orden...

<figure>
	<img
		src="/images/elliptic-curves-in-depth/part-9/0*cA5HOtwjA3YxYxcy-20.jpg"
		alt="Un pollo de caricatura con una mirada dudosa" 
		title="Ya no confío en ti"
	/>
</figure>

Bueno, recuerda que para que los emparejamientos funcionen, los soportes de divisores **deben ser disjuntos**. Cuando tanto $P$ como $Q$ vienen de $\mathcal{G}_1$, asegurar soportes disjuntos **se vuelve problemático** — esencialmente estamos emparejando un grupo consigo mismo.

La solución a esto es usar lo que se llama el **mapa de distorsión**: un mapa eficientemente computable $\phi$ que toma un punto en $\mathcal{G}_1$ y lo mueve a un subgrupo de r-torsión diferente. Con esto, podríamos computar:

$$
e(P, \phi (Q))
$$

Y la condición de soportes disjuntos sería más fácil de cubrir.

Así que aquí está el **verdadero** problema: los mapas de distorsión solo existen para [curvas supersingulares](https://en.wikipedia.org/wiki/Supersingular_elliptic_curve).

<figure>
	<img
		src="/images/elliptic-curves-in-depth/part-9/0*Te6UOAIM4kOD0KLs-22.jpg"
		alt="Freddie Mercury en su pose icónica" 
		title="¿Dijiste super singular? ¡Oh sí bebé!"
	/>
</figure>

Las curvas supersingulares tienen [grados de inmersión](/es/blog/elliptic-curves-in-depth/part-7/#extensions-and-torsion) pequeños, típicamente $k \leq 6$. Los grados de inmersión pequeños significan que las salidas del emparejamiento caen en una extensión de campo pequeña, lo que a su vez causa que el problema del logaritmo discreto en el grupo de salida se vuelva **manejable**, resultando en curvas que son **vulnerables a ataques**.

En resumen, la simplicidad del tipo 1 viene al costo de la **seguridad**. A medida que emergieron alternativas más seguras, los emparejamientos de tipo 1 han caído en desuso en la práctica.

### Tipo 2: Asimétrico con Isomorfismo {#type-2-asymmetric-with-isomorphism}

Ahora pasamos a **emparejamientos asimétricos** para los tipos 2, 3 y 4. En los tres casos, tomaremos $\mathbb{G}_1$ como $\mathcal{G}_1$.

En los emparejamientos tipo 2, $\mathbb{G}_2$ se elige como uno de los otros subgrupos de r-torsión **excepto** $\mathcal{G}_2$ (el subgrupo de traza cero).

Nuevamente, revisemos nuestros requisitos:

- En términos de **isomorfismos disponibles**, sí tenemos un mapa eficientemente computable $\psi: \mathbb{G}_2 → \mathbb{G}_1$, y ya lo has visto — ¡es el mapa de traza! Esto nos permite mover elementos de $\mathbb{G}_2$ hacia $\mathbb{G}_1$ cuando los protocolos lo requieren. Incluso podemos ir **en la dirección inversa** usando el mapa anti-traza para ciertas operaciones, aunque esto no mapea directamente de vuelta a $\mathbb{G}_2$.
- Sin embargo, en términos de **hashing**, esta selección tiene dificultades. No hay una forma eficiente conocida de hacer hash **directamente hacia** estos otros subgrupos de r-torsión.

Así que **hashing** es el verdadero culpable aquí. Lo mejor que podemos hacer es, como mencionamos previamente, elegir un generador fijo $P_2 ∈ \mathbb{G}_2$ y crear elementos vía multiplicación escalar $[k]P_2$. Pero esto significa que cada elemento tiene un **logaritmo discreto conocido** relativo a $P_2$, lo que rompe protocolos que requieren puntos aleatorios o derivados de hash.

Esta sola limitación es tan crítica que ha impedido que los emparejamientos tipo 2 vean uso práctico generalizado — la mayoría de protocolos simplemente **necesitan** la capacidad de hacer hash hacia ambos grupos, lo que inmediatamente descarta este tipo.

### Tipo 3: Asimétrico sin Isomorfismo {#type-3-asymmetric-without-isomorphism}

Ahora para este tipo, tomamos $\mathbb{G}_2$ como $\mathcal{G}_2$ — el subgrupo de traza cero mismo.

Este cambio aparentemente pequeño tiene implicaciones profundas — en realidad **voltea** completamente el intercambio. Veamos:

- A diferencia del tipo 2, **sí** podemos ahora hacer hash hacia $\mathbb{G}_2$. El mecanismo involucra primero hacer hash hacia toda la **r-torsión**, y luego simplemente aplicar el **mapa anti-traza** para moverse hacia $\mathcal{G}_2$.
- Por supuesto, debemos pagar un precio por esta conveniencia. En este caso, eso se traduce en no tener una forma eficiente de computar un isomorfismo ψ que podamos usar.

Es importante señalar que tal isomorfismo **debe existir** — después de todo, tanto $\mathbb{G}_1$ como $\mathbb{G}_2$ tienen el mismo tamaño. El problema es que no hay una **forma eficiente** conocida de computarlo.

> Irónicamente, el único grupo al que podemos hacer hash eficientemente (además de $\mathcal{G}_1$) es el único subgrupo del que **no podemos** mapear eficientemente hacia afuera.

Así, perdemos los atajos computacionales y la flexibilidad de protocolo que ofrecía el tipo 2. Y no menos importante es el hecho de que la mayoría de pruebas de seguridad dependen de **tener** tal mapa, así que para probar la robustez de los emparejamientos tipo 3, los protocolos necesitan diseñarse alrededor de diferentes suposiciones de dureza.

En la práctica, este intercambio ha resultado ser aceptable, ya que la capacidad de hacer hash hacia ambos grupos es el aspecto más crítico para la mayoría de protocolos.

El Tipo 3 es el **estándar de oro** para la criptografía moderna basada en emparejamientos.

### Tipo 4: La Torsión Completa {#type-4-the-full-torsion}

Finalmente, el tipo 4 toma $\mathbb{G}_2$ como toda la **r-torsión** $E[r]$.

- Hacer hash hacia $E[r]$ es posible, pero es menos eficiente que hacer hash hacia $\mathcal{G}_1$ o $\mathcal{G}_2$. Dado que el grupo es más grande (tiene orden $r^2$, como ya hemos visto), hay más sobrecarga computacional.
- Entonces, podemos mirar la **estructura** de $E[r]$. En este sentido, tiene una característica distintiva: **no es cíclico**. Ya [sabemos](/es/blog/elliptic-curves-in-depth/part-7/#torsion-groups) que es isomórfico a $\mathbb{Z}_r \times \mathbb{Z}_r$, así que no hay un solo generador que pueda producir todos los elementos en el grupo. Algunos protocolos dependen de la ciclicidad para funcionar, así que no pueden usar emparejamientos tipo 4.

Curiosamente, al hacer hash hacia E[r], la probabilidad de caer en $\mathcal{G}_1$ o $\mathcal{G}_2$ es cercana a $2 / r$ — **despreciable** para valores grandes de $r$. Ciertos protocolos especializados podrían necesitar asegurar evitar subgrupos específicos, y en esos casos, los emparejamientos tipo 4 pueden ser útiles.

Los costos de eficiencia y la falta de ciclicidad significan que los emparejamientos tipo 4 **rara vez se usan en la práctica**.

---

En general, los emparejamientos tipo 3 son la variante predominante en la criptografía moderna basada en emparejamientos. Y a decir verdad, casi nunca nos preocupamos por qué tipo de emparejamiento estamos usando. Es solo que si tenemos que ponernos realmente técnicos en nuestro diseño de protocolo, ¡podríamos tener que considerar lo que implica usar cada elección de grupo!

Ahora que entendemos los diferentes tipos de emparejamientos y sus intercambios, abordemos una preocupación más crítica, antes de cerrar el capítulo sobre estas construcciones asombrosas.

---

## Degeneración {#degeneracy}

Hemos hablado sobre tipos de emparejamientos y cómo construir las funciones necesarias para la computación, pero hay una propiedad más crítica que necesitamos asegurar: que nuestro emparejamiento realmente **funcione**.

<figure>
	<img
		src="/images/elliptic-curves-in-depth/part-9/0*wp5W4xy9k3cMWbJS-23.jpg"
		alt="La cita 'God damn it Gump! You're a God damn genius!' de Forrest Gump".
	/>
</figure>

¿Qué quiero decir con que **funcione**? Recuerdemos que los emparejamientos están destinados a ser mapas bilineales. Pero hay una forma trivial de satisfacer la bilinealidad: ¡simplemente mapear todo a $1$!

$$
e(P, Q) = 1 \ \forall P, Q
$$

Mientras que tal emparejamiento técnicamente cumpliría con la bilinealidad, es **completamente inútil**. Llamamos a tal emparejamiento **degenerado**.

> Y por supuesto, un emparejamiento es no degenerado si existen puntos $P$ y $Q$ tales que $e(P, Q) \neq 1$.

### ¿Debería Preocuparme? {#should-i-worry}

Después de que pasamos por el problema de definir emparejamientos de estas formas enrevesadas y complejas, parecería bastante improbable que nuestros emparejamientos fueran degenerados, ¿verdad?

Bueno... No exactamente. Si no somos cuidadosos sobre cómo elegimos $\mathbb{G}_1$ y $\mathbb{G}_2$, podemos terminar con un emparejamiento degenerado incluso cuando seguimos todos los pasos de construcción correctamente. Las matemáticas podrían ser sólidas, pero el resultado es criptográficamente inútil.

Un ejemplo concreto de lo que puede salir mal ocurre cuando tratamos de usar el emparejamiento de Weil con $\mathbb{G}_1 = \mathbb{G}_2 = \mathcal{G}_1$, pero estamos trabajando con una curva ordinaria (no supersingular) que **no tiene mapa de distorsión**.

Cuando el emparejamiento de Weil opera en dos puntos del mismo espacio propio de Frobenius (en este caso, $\mathcal{G}_1$), el emparejamiento **siempre evalúa a** $1$, sin importar qué puntos elijas. Al costo de pasar por alto algunos de los detalles, aquí está la explicación corta:

- Primero, sabemos que el endomorfismo de Frobenius actúa trivialmente en puntos en $\mathcal{G}_1$, así que para cualquier $P$ y $Q$ en $\mathcal{G}_1$, tenemos $\pi (P) = P$ y $\pi (Q) = Q$.
- Entonces, para funciones racionales en la curva, el mapa de Frobenius tiene una propiedad especial:

$$
f(\pi(R)) = f(R)^q
$$

- Podemos conectar esta propiedad en el emparejamiento de Weil mismo, y mirando los divisores resultantes, obtenemos:

$$
w_r(\pi(P), \pi(Q)) = w_r(P, Q)^q
$$

- Pero dado que $P$ y $Q$ están en $\mathcal{G}_1$:

$$
w_r(P, Q) = w_r(P, Q)^q
$$

Lo que estamos diciendo es que cualquiera que sea la salida del emparejamiento, está **fijada por el mapa de la q-ésima potencia**. En otras palabras, tiene que ser un **elemento en el campo base**, porque si $w_r(P, Q)$ pertenece a una extensión de campo, entonces elevarlo a la q-ésima potencia **no producirá** el mismo resultado.

También sabemos que $w_r(P, Q)$ [debe ser una raíz r-ésima de la unidad](/es/blog/elliptic-curves-in-depth/part-8/#weil-reciprocity).

> Recuerda que para que un campo contenga raíces r-ésimas de la unidad, $r$ debe dividir la cardinalidad del subgrupo multiplicativo del campo, así que en este caso, $q - 1$.

Ese es el clavo final en el ataúd: usualmente elegimos $r$ de manera que **no** divida $q - 1$, lo que significa que no hay raíces de la unidad — excepto por la trivial: el **elemento identidad multiplicativo**. Así, $w_1(P, Q)$ **debe ser igual** a $1$.

Esto es precisamente por qué los emparejamientos tipo 1 requieren curvas supersingulares con mapas de distorsión — sin ellos, **la degeneración es inevitable**.

### Requisitos {#requirements}

¡Muy bien! Eso fue ciertamente mucho. ¡Perdón por eso!

<figure>
	<img
		src="/images/elliptic-curves-in-depth/part-9/0*_jkpt_RYsng0eup3-28.jpg"
		alt="Un niño llorando" 
		title="¿Por qué me haces esto?"
	/>
</figure>

Más allá del ejemplo específico, hay algunas **condiciones generales** que deberíamos verificar para asegurar la no degeneración. Terminemos mirándolas.

- Primero y más importante: $\mathbb{G}_1$ y $\mathbb{G}_2$ deben ser **disjuntos** (excepto por supuesto por la identidad, $\mathbb{G}_1 \cap \mathbb{G}_2 = \{\mathcal{O}\}$). Si comparten puntos no triviales, el emparejamiento degenera en esos puntos. Ya vimos el caso extremo donde $\mathbb{G}_1 = \mathbb{G}_2$ sin un mapa de distorsión — y el emparejamiento se vuelve completamente degenerado.

> Esta es la razón por la que la descomposición de traza y anti-traza es tan valiosa: naturalmente nos permite usar $\mathcal{G}_1$ y $\mathcal{G}_2$, que son **disjuntos por definición**.

- Segundo: los **soportes de divisores** deben ser disjuntos. Hemos mencionado esto antes, pero no hay daño en repetirlo: si los soportes no son disjuntos, la evaluación de función colapsa a 0 o explota a infinito, causando comportamientos indefinidos que pueden resultar en degeneración. Elegir $\mathbb{G}_1$ y $\mathbb{G}_2$ de diferentes espacios propios naturalmente asegura esto.
- Tercero: el grado de inmersión debe ser **suficientemente grande**. Recuerda que el [grado de inmersión](/es/blog/elliptic-curves-in-depth/part-7/#extensions-and-torsion) $k$ es el entero positivo más pequeño tal que $r$ divide $q^k - 1$, y determina dónde viven los valores del emparejamiento. Esencialmente, debemos asegurar que hay suficientes raíces r-ésimas independientes de la unidad para soportar un emparejamiento no degenerado.

En la práctica, elegir el tipo de emparejamiento correcto (especialmente tipo 3) y usar [curvas amigables para emparejamientos](https://www.ietf.org/archive/id/draft-irtf-cfrg-pairing-friendly-curves-10.html) apropiadamente construidas automáticamente satisface todas estas condiciones. La maquinaria matemática asegura la no degeneración, así que podemos enfocarnos en las aplicaciones criptográficas en lugar de preocuparnos por los casos extremos.

Aún así, entender **por qué** estas condiciones importan puede ayudarnos a apreciar el diseño cuidadoso que va en la criptografía basada en emparejamientos. ¡Un paso en la dirección equivocada, y toda la cosa puede desmoronarse!

---

## Resumen {#summary}

Con esto, hemos completado nuestra exploración de emparejamientos, cubriendo algunos de los aspectos prácticos más importantes que los hacen utilizables en criptografía.

Como siempre, hay más que decir. En particular, quiero señalar el hecho de que aún necesitamos encontrar curvas adecuadas para estas construcciones. La mayoría del tiempo, **asumimos** que podemos encontrarlas, pero no es necesariamente una tarea fácil.

Aún así, con estos últimos artículos, deberías tener una idea aproximada de qué tratan los emparejamientos. Es interesante cómo nos propusimos encontrar funciones con una propiedad aparentemente simple y dañina — bilinealidad — , pero terminamos teniendo que meternos en cosas bastante profundas para hacerlo funcionar.

> Parte de lo que hace hermosas las matemáticas, supongo: ¡todo termina encajando muy bien!

Para resumir el artículo de hoy, recuerda: la mayoría del tiempo, estarás usando **emparejamientos tipo 3**, con el **algoritmo de Miller** trabajando en segundo plano para la computación real, y estarás usando curvas y grados de inmersión que **aseguren la no degeneración**.

---

Mientras que podríamos decir mucho, mucho más sobre curvas elípticas (diablos, hay [libros enteros](https://link.springer.com/book/10.1007/978-0-387-09494-6) escritos sobre ellas, si estás interesado), no es mi intención cubrir absolutamente todo en esta serie.

Sin embargo, creo que algunas consideraciones prácticas serían un buen cierre. Así, el próximo artículo estará dedicado a entender algunas de las curvas con la adopción más generalizada y sus particularidades.

¡Nos vemos en la línea de meta!
