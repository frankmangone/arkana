---
title: "Criptografía 101: Anillos"
date: "2024-08-27"
author: "frank-mangone"
thumbnail: "/images/cryptography-101/rings/saurons-eye.webp"
tags: ["Criptografía", "Álgebra Abstracta", "Matemáticas", "Anillo"]
description: "Antes de avanzar hacia la frontera más reciente de la criptografía — la criptografía post-cuántica —, ¡necesitamos establecer más fundamentos!"
readingTime: "13 min"
---

> Este artículo forma parte de una serie más larga sobre criptografía. Si este es el primer artículo con el que te encuentras, te recomiendo comenzar desde el [principio de la serie](/es/blog/cryptography-101/where-to-start).

Esta serie ha sido un viaje bastante largo — y nos estamos acercando al final. Comenzamos hace un par de meses hablando sobre [grupos](/es/blog/cryptography-101/where-to-start), y rápidamente expandimos nuestros conocimientos básicos explorando los conceptos de [funciones hash](/es/blog/cryptography-101/hashing), [polinomios](/es/blog/cryptography-101/polynomials), [emparejamientos](/es/blog/cryptography-101/pairings) y [campos finitos](/es/blog/cryptography-101/arithmetic-circuits/#changing-perspectives).

> Creo que en realidad nunca expliqué en profundidad los campos finitos. ¡Tendrás que disculparme por este descuido!

Esos son los fundamentos matemáticos sobre los cuales hemos basado cada método y técnica hasta ahora en la serie.

Sin embargo, hay una estructura de la que hemos evitado hablar. Simplemente no me pareció adecuado hablar de ella antes de este punto, porque es la más complicada de todas. Pero ya hemos cubierto algunos temas realmente complejos hasta ahora — así que sí, ahora estamos listos. Confío en que el momento es el adecuado.

Hablemos de los anillos.

<figure>
  <img
    src="/images/cryptography-101/rings/saurons-eye.webp" 
    alt="Ojo de Sauron"
    title="Tranquilo, amigo."
  />
</figure>

### ¿Por qué los Anillos? {#why-rings}

Los anillos son la estructura subyacente para la mayoría de los métodos de **Criptografía Post-Cuántica** (**PQC**) que existen. Nuestro objetivo es primero definir qué son los anillos y entender algunos conceptos básicos sobre ellos, para que más tarde podamos comprender de forma más natural los métodos PQC que exploremos.

> Estos no son como los anillos a los que nos referimos en las [firmas en anillo](/es/blog/cryptography-101/signatures-recharged/#ring-signatures). En ese caso, el nombre era solo una metáfora para tratar de representar la naturaleza circular de la construcción.
>
> Ahora vamos a entrar en el reino del **álgebra abstracta** — esto es lo real.

¡Prepárate, y vamos allá!

---

## Anillos {#rings}

Un [anillo](<https://es.wikipedia.org/wiki/Anillo_(matemáticas)>) es una estructura algebraica abstracta, al igual que un [grupo](/es/blog/cryptography-101/where-to-start). Como recordarás, un grupo se definía por un **conjunto** y una **operación**. Vimos cómo una construcción tan simple tenía muchos usos, especialmente debido a algunas propiedades particulares, como la existencia de **generadores** y **subgrupos**.

De manera similar, los **anillos** son simples de definir. Pero una definición simple puede ocultar complejidades más adelante. Y, de hecho, hay un par de cosas más que necesitamos considerar.

Así que sin más preámbulos, aquí está la definición: un **anillo** es una tripleta $(R, +, \cdot)$ — así que hay **tres** elementos a considerar ahora en lugar de dos —, donde $R$ es un conjunto no vacío, asociado con **dos operaciones binarias** en $R$.

Estas operaciones deben satisfacer un par de condiciones.

### Adición {#addition}

En primer lugar, $R$ debe comportarse como un **grupo abeliano** bajo la operación $+$ (generalmente la llamamos **adición**). Esto significa que:

- La **asociatividad** debe cumplirse, por lo que $(a + b) + c = a + (b + c)$,
- La **conmutatividad** debe cumplirse, por lo que $a + b = b + a$,
- Debe existir un **elemento identidad** $e$, tal que $a + e = a$,
- Debe existir un **inverso aditivo**, lo que significa que $a + (-a) = e$.

Si imaginamos, solo por un momento, que la segunda operación ($\cdot$) no existe, entonces todo lo que nos queda es un **grupo** — una estructura con la que estamos bastante familiarizados. La parte más interesante viene a continuación.

### Multiplicación {#multiplication}

La segunda operación generalmente se conoce como **multiplicación**. Y el conjunto $R$ debe ser un **monoide** bajo esta operación.

<figure>
  <img
    src="/images/cryptography-101/rings/what.webp" 
    alt="Meme de una chica de los 80 con una sonrisa muy forzada"
    title="¿Un qué?"
  />
</figure>

Un monoide. Sí. Comportarse como un monoide bajo la multiplicación significa que:

- La **asociatividad** se cumple, lo que significa que $(a \cdot b) \cdot c = a \cdot (b \cdot c)$,
- Debe existir un **elemento identidad** $e'$, tal que $a \cdot e' = e' \cdot a = a$.

> Palabra elegante, significado bastante simple.

---

Ahora que tenemos dos operaciones, también necesitamos considerar cómo se **relacionan** — y, por lo tanto, surge una condición adicional: la multiplicación debe ser **distributiva** respecto a la adición. Esto simplemente significa que:

- $a \cdot (b + c) = (a \cdot b) + (a \cdot c)$
- $(b + c) \cdot a = (b \cdot a) + (c \cdot a)$

> Nota cómo se preserva el orden. ¡La multiplicación **puede no ser conmutativa**!

Finalmente, existe el requisito implícito de **clausura**, lo que significa que el resultado de cualquier combinación de operaciones binarias debe estar en el conjunto $R$.

---

## Ejemplos de Anillos {#examples-of-rings}

Con todas estas definiciones, podrías pensar que los anillos pueden no ser tan comunes de encontrar. Resulta que es **completamente lo contrario** — ¡están **por todas partes**!

Por ejemplo, los **enteros módulo** $q$ se comportan como un anillo. Por supuesto, sabemos que también se comportan como un **campo** cuando $q$ es primo. Pero en el contexto más general, siempre se comportan como un anillo.

De hecho, los **enteros** (¡no módulo $q$!) también se comportan como un anillo. Y los **números racionales**. Y los **números reales**. Y los **números complejos**. Y los [cuaterniones](https://es.wikipedia.org/wiki/Cuaternión). Espera... ¿**Todo** es un anillo?

> Por ejemplo, los **números irracionales** no lo son. ¡No todo es un anillo!

Podemos pensar en ejemplos aún más interesantes.

Las **matrices cuadradas** con entradas en un **campo** también forman un anillo. De hecho, este es uno de los ejemplos donde la **conmutatividad no se cumple**. Y aun así, forman un anillo — un **anillo no conmutativo**, para ser precisos.

### El Importante {#the-important-one}

¿Por qué nos interesan los anillos, te preguntas? Bueno, hay uno muy importante que necesitamos conocer, ya que será la base para algunos métodos de **PQC**. Has oído hablar mucho de ellos en esta serie. Deberían ser viejos amigos a estas alturas.

¿Puedes adivinar qué son?

<figure>
  <img
    src="/images/cryptography-101/rings/come-on-homer.webp" 
    alt="Todos esperando a que Homer hable en la taberna de Moe"
    width="300"
  />
</figure>

Exacto — ¡los **Polinomios**!

> Vaya, están en todas partes. Siempre son los malditos polinomios.

Los veremos en acción más adelante. Nuestro viaje requiere que los dejemos a un lado por ahora, para poder discutir un par de cosas más sobre los anillos en general.

---

## Definiciones {#definitions}

Cuando vimos los grupos, vimos cómo podía haber **subgrupos**. Y también vimos cómo había [homomorfismos de grupos](/es/blog/cryptography-101/homomorphisms-and-isomorphisms). Por supuesto, los anillos también tienen estos tipos de estructuras y propiedades: podemos definir **subanillos**, y **homomorfismos de anillos**. Pero hay un par de definiciones adicionales que son únicas para esta estructura. Necesitaremos entender una en particular: los **ideales**.

### Ideales {#ideals}

No hay paralelos que podamos hacer con los grupos aquí, ¡así que este será un concepto completamente nuevo!

Dado un anillo $R$, podemos definir **ideales izquierdos** y **derechos**. La razón por la que decimos **izquierdo** y **derecho** tiene que ver con la conmutatividad, como veremos en un momento.

Un **ideal izquierdo** de $R$ es un subconjunto no vacío $I$ de $R$, tal que para cada elemento $x$, $y$ en $I$, y para cada elemento $r$ en $R$, los elementos $x + y$ y $r \cdot x$ están en $I$. Sí.

La notación matemática puede ayudar:

$$
I \subset R \ / \ \forall x, y \in I, \forall r \in R \Rightarrow \{x + y, r \cdot x \} \subset I
$$

<figure>
  <img
    src="/images/cryptography-101/rings/spongebob-huh.webp" 
    alt="Bob Esponja con una mirada confundida"
    width="300"
  />
</figure>

Supongo que la pregunta es **por qué**. ¿Por qué demonios nos interesaría definir estas cosas "ideales", y qué tipo de aplicaciones retorcidas pueden tener?

Piénsalo así: $I$ es algún subconjunto de $R$ que de alguna manera opera sobre $R$ y lo **reduce** al ideal — por lo que actúa como una **operación módulo**, en cierto modo.

> No te preocupes demasiado por esto, ¡pronto tendremos una mejor idea de cómo puede ser útil!

Por completitud, también definiremos un **ideal derecho**, que es bastante similar — solo que $x \cdot r$ necesita estar en el ideal en lugar de $r \cdot x$ — ¡de ahí el nombre!

### Un Ejemplo {#an-example}

Analicemos el anillo de los enteros $\mathbb{Z}$. Afirmamos que el conjunto de todos los múltiplos de $q$ es un **ideal bilateral** (lo que significa que es tanto un ideal izquierdo como derecho) de $\mathbb{Z}$. Vamos a denotarlo por $(q)$.

$$
(q) = \{n \cdot q \ / \ n \in \mathbb{Z} \}
$$

> En el caso de los enteros, la conmutatividad se cumple, por lo que efectivamente será un ideal bilateral.

La forma de comprobar si esto es cierto es evaluando las **condiciones** en la definición de ideal. Estas son:

- Sumar elementos en $(q)$ resultará en elementos en $(q)$, por lo que el conjunto está **cerrado** bajo la adición.

$$
a + b = m \cdot q + n \cdot q = (m + n) \cdot q
$$

- Multiplicar cualquier elemento en $(q)$ por algún entero resultará en otro elemento en $(q)$:

$$
n.a \in (q), \forall n \in \mathbb{Z}, a \in (q)
$$

Y así, $(q)$ es efectivamente un ideal bilateral de $\mathbb{Z}$. No es tan aterrador después de todo, ¿eh?

---

Hay algunas otras definiciones para explorar — por ejemplo, qué es la [característica](<https://es.wikipedia.org/wiki/Característica_(álgebra)>) de un anillo, o qué son los [núcleos en los homomorfismos de anillos](https://es.wikipedia.org/wiki/Homomorfismo_de_anillos). Pero creo que es más fructífero centrarnos en las cosas que necesitaremos para entender mejor los métodos criptográficos. Dejaré esas definiciones para que las consultes. Vamos a lo bueno.

---

## Anillos Cociente {#quotient-rings}

Estamos a punto de entrar en aguas turbias, pero este es el verdadero **condimento** que estamos buscando para entender los métodos PQC.

Los **anillos cociente**, también llamados **anillos factor**, **anillos diferencia** o **anillos de clases residuales**, son un tipo de anillo derivado usando **ideales**. Y esa es parte de la razón por la que los ideales son importantes.

Dado un anillo $R$ y un ideal bilateral $I$, el **anillo cociente** $R / I$ es el anillo cuyos elementos son los **cosets** de $I$ en $R$.

**¿Eh?**

<figure>
  <img
    src="/images/cryptography-101/rings/mr-krabs-dizzy.webp" 
    alt="Mr. Cangrejo de Bob Esponja con mareos"
    title="¿Qué demoni-"
  />
</figure>

¿Y eso en español es...? Sí, es necesaria alguna traducción. Intentemos darle sentido a eso.

Para hacerlo, primero debemos entender qué es una **clase de equivalencia**.

### Relaciones y Clases de Equivalencia {#equivalence-relations-and-classes}

Continuando con ejemplos conocidos, centrémonos en los **enteros módulo** $q$. En este caso, tratémoslos como un **anillo**, algo así:

$$
\mathbb{Z}/q\mathbb{Z} = \{0,1,2,3,...,q-1\}
$$

> ¡Prometo que esta notación tendrá más sentido en un minuto!

Durante nuestra introducción a los grupos, vimos cómo la [operación módulo](/es/blog/cryptography-101/where-to-start/#the-modulo-operation) se usaba para mapear cualquier entero fuera de este conjunto, dentro del conjunto. Entonces, cuando tenemos algo como esto:

$$
a \ \textrm{mod} \ q = b
$$

Podemos naturalmente pensar en $a$ y $b$ como siendo **equivalentes**. La equivalencia puede darse por cualquier tipo de relación, no solo por la definida por la operación módulo. Cualquier tipo de relación de este tipo puede escribirse como $a \sim b$, que se lee "$a$ es **equivalente** a $b$".

> Una [relación de equivalencia](https://es.wikipedia.org/wiki/Relación_de_equivalencia) tiene una definición más formal que involucra productos cartesianos de conjuntos y algunas propiedades con nombres extraños (reflexividad, simetría y transitividad). Pero no nos importa demasiado eso — solo nos interesa el concepto general.

En el caso de los enteros módulo $q$, cualquier número de la forma $a = k.q + b$ será equivalente a $b$ — ¡y hay infinitos enteros así!

Podemos agrupar todos esos enteros equivalentes en un **conjunto**. Tal conjunto se llama [clase de equivalencia](https://es.wikipedia.org/wiki/Clase_de_equivalencia). Y en realidad, cada uno de los elementos en nuestro **anillo de enteros módulo** $q$ representa mucho más que un solo valor — es un representante para **toda la clase de equivalencia**. Cuando mencionamos **cosets** en nuestra definición de anillos cociente, nos referíamos a estas **clases de equivalencia**.

> Si lo piensas, los enteros módulo q nos permiten reducir un anillo "más grande" — el anillo de los enteros, a uno más pequeño, proporcionando una forma de mapear cada entero a su valor equivalente. ¡Esa es la parte importante!

### Calculando el Cociente {#calculating-the-quotient}

Con las clases de equivalencia a mano, es más fácil entender los **anillos cociente**. Siguiendo nuestro ejemplo, tomemos el anillo $\mathbb{Z}$ y el ideal bilateral $(q)$.

Aquí está el plan: primero, definir una [relación de equivalencia](https://es.wikipedia.org/wiki/Relación_de_equivalencia) como:

$$
a \sim b \iff a - b \in (q)
$$

En términos simples: dos elementos son equivalentes si su diferencia es un múltiplo de $q$. Como tenemos una **relación de equivalencia**, también tenemos una clase de equivalencia — el conjunto de todos los elementos equivalentes a $a$ es:

$$
[a] = a + (q) = \{a+x \ / \ x \in (q) \}
$$

¿Cuántas clases hay? Bueno, ¡comencemos a contar desde $0$! La clase de equivalencia sería:

$$
[0] = \{0, q, -q, 2q, -2q, ... \}
$$

Podemos hacer lo mismo para $1$:

$$
[1] = \{1, 1 + q, 1 - q, 1 + 2q, 1 - 2q, ... \}
$$

Y de hecho, podemos hacer esto con todos los enteros hasta $q - 1$. Y cuando llegamos a $q$, ocurre algo interesante:

$$
[q] = \{0, q, -q, 2q, -2q, ... \} = [0]
$$

¡Ajá! ¡Hemos tropezado con una clase que ya existía! Y así, el anillo cociente $\mathbb{Z}/(q)$ es simplemente:

$$
\mathbb{Z}/(q) = \{[0], [1], [2], ..., [q - 1]\}
$$

Tomando un **único representante** de cada clase de equivalencia nos da:

$$
\mathbb{Z}/(q) = \{0, 1, 2, ..., q - 1\}
$$

> Espera... ¡Hemos visto eso antes! ¡Es el **anillo de enteros módulo** $q$! Mira eso. Todo ese lío solo para llegar a esto. Lo juro, a veces las matemáticas son tan complicadas...

En cierto modo, es como si tomáramos los enteros y realizáramos una operación **módulo** sobre los enteros módulo $q$. Esa es la razón por la que usamos la notación $\mathbb{Z}/q\mathbb{Z}$.

### Revisitando la Definición {#revisiting-the-definition}

Una formalización final de nuestro ejemplo es necesaria para cerrar las cosas aquí. El cociente de $R$ y un ideal bilateral $I$ se puede encontrar mediante el siguiente proceso:

- Definiendo la relación de equivalencia:

$$
a \sim b \iff a - b \in I
$$

- Encontrando todas las clases de equivalencia de la forma:

$$
[a] = a + (q) = \{a+x \ / \ x \in (q) \}
$$

El anillo cociente $R/I$ será simplemente el conjunto de todas esas clases. Con suerte, la definición original tiene más sentido ahora:

::: big-quote
Dado un anillo $R$ y un ideal bilateral $I$, el anillo cociente $R \ / \ I$ es el anillo cuyos elementos son los cosets de $I$ en $R$
:::

---

## Anillos Cociente de Polinomios {#quotient-polynomial-rings}

Anteriormente, mencioné cómo los **anillos cociente** eran importantes para PQC. Cuando dije eso, lo que no mencioné es que nuestro interés reside **particularmente** en los **anillos cociente de polinomios**.

A estas alturas, es más fácil imaginar por qué son importantes — proporcionan una forma de **mapear** polinomios (que forman un anillo) en un **anillo más pequeño**, al igual que lo haría una operación módulo.

> Y, oye, ¡esa capacidad fue súper importante para desarrollar la mayoría de los métodos que hemos presentado hasta ahora en la serie! Así que, sí, ¡probablemente sea bastante importante!

Vamos a trabajar en esto lentamente.

<figure>
  <img
    src="/images/cryptography-101/rings/kermit-tea.webp" 
    alt="Kermit tomando un té"
    title="Toma, sírvete un té"
  />
</figure>

Comenzaremos desde un anillo de polinomios con coeficientes en un **campo finito**. Esto, lo denotaremos $\mathbb{F}[X]$. Tal campo puede ser, por ejemplo, los **enteros módulo** $q$ — y los coeficientes pueden reducirse utilizando la operación módulo. ¡Hasta aquí, todo bien!

A continuación, necesitaremos un **ideal bilateral** de $\mathbb{F}[X]$. Resulta que podemos crear un ideal seleccionando algún polinomio $f(X)$ en $\mathbb{F}[X]$, y estableciendo el ideal como el conjunto de **todos sus múltiplos**.

$$
(f(X)) = \{g(X).f(X) \ / \ g(X) \in \mathbb{F}[X]\}
$$

> Cualquier polinomio en este anillo es claramente divisible por $f(X)$. ¡Así que es bastante simple comprobar que efectivamente es un ideal!

De nuevo, definimos una clase de equivalencia — dos polinomios son **equivalentes** si su diferencia es un múltiplo de $f(X)$:

$$
g(X) \sim h(X) \iff g(X) - h(X) \in (f(X))
$$

Y finalmente, encontramos todas las diferentes clases de equivalencia bajo esta relación. Este puede ser más difícil de imaginar, pero el concepto es que cualquier **posible resto** de la división de un polinomio por $f(X)$ estará en el **anillo cociente**, denotado por $\mathbb{F}[X]/(f(X))$.

Los restos no pueden tener un grado mayor que $f(X)$. En consecuencia, tenemos tanto **coeficientes acotados** (porque estamos trabajando con un **campo finito**), como **grado acotado**, porque estamos trabajando con un polinomio cociente.

En resumen: ¡hemos encontrado una forma de mapear prácticamente **cualquier** polinomio de valores enteros en un **conjunto finito de polinomios**! ¡Genial!

Como veremos, esto será extremadamente útil para los métodos PQC.

### Un Ejemplo Práctico {#a-practical-example}

Para consolidar esta idea, veamos un ejemplo simple. Digamos que elegimos el **polinomio módulo** como $f(X) = X^2 + 1$, y establecemos nuestro campo finito como $\mathbb{F}_7$.

El polinomio $f(X)$ se utilizará para reducir polinomios de grado superior a un **grado acotado**. Entonces, por ejemplo, elijamos $P(X) = X^5 - 3X^2 + 6$.

Dividir $P(X)$ por $f(X)$ da como resultado un **cociente** y un **resto**:

$$
Q(X) = X^3 - X - 3
$$

$$
R(X) = X + 9
$$

Necesitamos centrarnos en el resto (¡al igual que con la operación módulo!). Por supuesto, como estamos trabajando con un campo finito, necesitamos reducir $R(X)$ módulo $7$. Esto da:

$$
R(X) = X + 2
$$

Con eso, ¡hemos reducido el $P(X)$ original módulo $f(X)$! Y se cumple que $P(X)$ es equivalente a $R(X)$:

$$
P(X) \sim R(X)
$$

¡Cualquier polinomio cuyo resto al dividirse por $f(X)$ sea $R(X)$, será equivalente a $R(X)$! Por lo tanto, está representado en el anillo cociente $\mathbb{F}_7[X]/(X^2 + 1)$ por el elemento $R(X)$.

---

## Resumen {#summary}

Vaya, eso fue más largo de lo que imaginaba.

Como probablemente puedas ver, los **anillos** requieren un mayor grado de **abstracción** para comprenderlos completamente en comparación con los **grupos**. Esta es la razón por la que no se introdujeron antes en la serie — estamos construyendo lentamente en términos de complejidad.

> Bueno... "Lentamente". ¡Nada es lento a estas alturas!

Lo principal que debes llevarte de este artículo, aparte de algunos nuevos conceptos abstractos, es la idea de los **anillos cociente de polinomios**. Como se mencionó antes, eran la base que nos faltaba para pasar a algunos métodos de **PQC** (aparte de los retículos, pero los cubriremos en la próxima entrega).

Todo lo que queda es **ir post-cuántico**. Pero para proponer cualquier método PQC, necesitamos más que solo una estructura matemática — necesitamos un **problema difícil de resolver**. Los anillos también tienen algunos de esos, como veremos [la próxima vez](/es/blog/cryptography-101/ring-learning-with-errors)!
