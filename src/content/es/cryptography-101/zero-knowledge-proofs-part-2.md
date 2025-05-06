---
title: "Criptografía 101: Pruebas de Conocimiento Cero (Parte 2)"
date: "2024-06-25"
author: "frank-mangone"
thumbnail: "/images/cryptography-101/zero-knowledge-proofs-part-2/pikachu.webp"
tags:
  [
    "Criptografía",
    "Pruebas de Conocimiento Cero",
    "Matemáticas",
    "Polinomio",
    "Plonk",
  ]
description: "Esta segunda ronda de pruebas de conocimiento cero nos llevará en un viaje para entender un marco más general. ¡Agárrate fuerte!"
readingTime: "17 min"
---

> Este artículo forma parte de una serie más larga sobre criptografía. Si este es el primer artículo con el que te encuentras, te recomiendo encarecidamente comenzar desde el [principio de la serie](/es/blog/cryptography-101/where-to-start).

En los últimos artículos, hemos cubierto muchos **bloques de construcción**. Es hora de finalmente combinar todas estas piezas de lego en un protocolo. ¡Hurra!

Recuerda, la razón por la que hicimos tanto esfuerzo para entender estas partes móviles fue para tratar de construir un **marco general** para pruebas de conocimiento cero — porque, como vimos, crear un protocolo para una aplicación específica era algo poco práctico, requiriendo investigación **específica**.

Ahora estamos listos para introducir una familia de **pruebas de conocimiento** que utiliza cada elemento que hemos definido preventivamente: **SNARKs**.

Específicamente, veremos un esquema llamado **Plonk**. Para una divulgación completa de la técnica, ve [aquí](https://eprint.iacr.org/2019/953.pdf). Haré mi mejor esfuerzo para explicar esto con la mayor precisión posible. Además, este no es el único protocolo que califica como **SNARK** por ahí. Existen otros mecanismos como [Groth16](https://www.rareskills.io/post/groth16), [Marlin](https://eprint.iacr.org/2019/1047.pdf) y [Halo](https://eprint.iacr.org/2019/1021.pdf). Podría abordar esos en el futuro, pero por ahora, ¡solo dejaré un par de enlaces aquí en caso de que quieras seguir tu curiosidad!

### Advertencia {#disclaimer}

Este artículo va a ser **largo**, y honestamente, **complejo**. Es decir, probablemente **más difícil de lo habitual**. Hay un límite en lo que puedo hacer para simplificar la explicación de un protocolo que es **bastante complejo**.

Pero, si tuviera que resumir todo este proceso en una sola frase, sería:

::: big-quote
En Plonk, codificamos el cálculo de un circuito en una serie de polinomios, que representan las restricciones impuestas por el circuito, para los cuales podemos probar afirmaciones mediante una serie de pruebas, sin revelar jamás los polinomios mismos — y por lo tanto, sin filtrar las entradas secretas.
:::

Llegar a entender esto completamente será un **viaje salvaje**. Y hay varios elementos que necesitaremos cubrir. Aquí hay una visión general del plan, que también funciona como una especie de **tabla de contenidos**:

- [Circuitos como conjuntos de restricciones](/es/blog/cryptography-101/zero-knowledge-proofs-part-2/#revisiting-circuits)
- [Codificando el circuito en polinomios](/es/blog/cryptography-101/zero-knowledge-proofs-part-2/#encoding-the-circuit)
- [Listando los requisitos para la verificación](/es/blog/cryptography-101/zero-knowledge-proofs-part-2/#verification-requirements)
- [Técnicas para la verificación](/es/blog/cryptography-101/zero-knowledge-proofs-part-2/#interactive-oracle-proofs)
- [Verificación](/es/blog/cryptography-101/zero-knowledge-proofs-part-2/#back-to-verification)

> Además, estoy asumiendo que ya revisaste el artículo sobre [esquemas de compromiso polinomial](/es/blog/cryptography-101/commitment-schemes-revisited), y también el de [circuitos aritméticos](/es/blog/cryptography-101/arithmetic-circuits). Si no lo has hecho, ¡te recomiendo encarecidamente leerlos!

Sin más preámbulos, ¡aquí vamos!

---

## ¿Qué es un SNARK? {#what-is-a-snark}

El acrónimo significa **S**uccint **N**on-interactive **AR**guments of **K**nowledge (Argumentos de Conocimiento Sucintos No Interactivos). En español simple: un mecanismo para probar **conocimiento** de algo, que es **sucinto** (o corto, o pequeño) y **no interactivo**. Hay un par de cosas que necesitamos analizar aquí, para entender mejor el objetivo de la construcción:

- **Sucinto** significa que cualquier prueba que produzcamos debe ser pequeña en tamaño y rápida en tiempo de evaluación.
- **No interactivo** significa que al recibir la prueba, el verificador no necesitará más interacción con el probador. Más sobre esto más adelante.
- Finalmente, decimos que esta es una **prueba de conocimiento**, pero no necesariamente una prueba de conocimiento cero (aunque **puede** serlo). En particular, **Plonk** califica como conocimiento cero debido a cómo está construido.

No te preocupes — aún no podemos construir nuestro SNARK. Primero necesitaremos cubrir algunos conceptos.

---

## Revisitando los Circuitos {#revisiting-circuits}

En el artículo anterior, vimos cómo los [circuitos aritméticos](/es/blog/cryptography-101/arithmetic-circuits) eran una buena manera de representar un cálculo. Y cómo permitían la elaboración de recetas para la **validación** de afirmaciones.

Y así, el objetivo del probador será tratar de convencer a un verificador de que conoce algún **valor secreto** $x$ — realmente, un **vector** de valores — tal que:

$$
\exists \ x \in {\mathbb{F}_p}^m \ / \ C(x,w) = 0
$$

> Esto se lee: "existe algún vector $x$ cuyos elementos están en el campo finito $\mathbb{F}_p$, tal que $C(x, w) = 0$, donde $w$ es públicamente conocido.

El probador no quiere revelar $x$, pero además, no queremos que el verificador ejecute el cálculo costoso del circuito. Y así, lo que realmente sucederá es que el probador **evaluará** el circuito, y luego de alguna manera **codificará** tanto las entradas como los resultados para cada una de las compuertas — también llamado el **rastro de cálculo**.

Aquí hay un ejemplo de evaluación, utilizando el campo $\mathbb{F}_{113}$:

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/circuit-example.webp" 
    alt="Un ejemplo de circuito pequeño"
    title="[zoom] Recuerda que estamos trabajando con módulo p = 113 en este caso"
    className="bg-white"
  />
</figure>

Y podríamos pensar en esta evaluación como el siguiente rastro, visualizado como una tabla:

|          | $w_1$ | $x_1$ | $x_2$ |
| -------- | ----- | ----- | ----- |
| entradas | 20    | 13    | 5     |

|             | entrada izquierda | entrada derecha | salida |
| ----------- | ----------------- | --------------- | ------ |
| compuerta 0 | 5                 | 20              | 100    |
| compuerta 1 | 13                | 100             | 0      |

La fantástica idea detrás de los SNARKs modernos, incluido **Plonk**, es codificar este rastro como **polinomios**, lo que finalmente permitirá a un verificador comprobar que el cálculo es válido. Válido aquí significa que se sigue un conjunto específico de **restricciones**. Concretamente:

- Que cada compuerta se **evalúa correctamente**
- Que los **cables** con el mismo origen tienen el **mismo valor**

Por cable, me refiero a las **conexiones entre compuertas**, o conexiones desde entradas a compuertas, en el circuito. Podemos pensar en estos cables como portadores de los valores del circuito, en lugar de los nodos mismos:

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/wires.webp" 
    alt="Un circuito mostrando valores de cables"
    title="[zoom]"
    className="bg-white"
  />
</figure>

Aquí, puedes ver que algunos de estos cables deberían tener el mismo valor: $W_0$, $W_1$ y $W_2$ — y también $W_4$ y $W_5$. Además, las **compuertas** deberían tener sentido — lo que significa que, por ejemplo, $W_0 + W_1$ debería ser igual a $W_4$.

> ¡Un circuito puede ser una receta para el cálculo o un conjunto de restricciones para verificar!

Cada uno de estos conjuntos de restricciones — valores de cables, restricciones de compuertas y restricciones de cableado — se codificará en **diferentes polinomios**.

Por ejemplo, todo el rastro de cálculo puede codificarse en un solo polinomio $P$, donde $P(x_i)$ corresponde a un cable.

$$
P(x_i) = W_i
$$

Tenemos los valores de los cables $W_i$, pero necesitamos elegir a qué valores $x_i$ los codificamos. Usar algunos enteros es una opción perfectamente válida — ya sabes, el conjunto $\{0,1,2,3…,N\}$. Pero hay mucho que ganar usando las **raíces de la unidad** de nuestro campo $\mathbb{F}_p$ en su lugar.

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/toast-huh.webp" 
    alt="Una tostada, confundida"
    title="¿Eh?"
    width="300"
  />
</figure>

### Raíces de la Unidad {#roots-of-unity}

Mencioné [este concepto antes](/es/blog/cryptography-101/polynomials/#interpolation-revisited), pero evité tener que explicarlo más como Neo en Matrix.

<video-embed src="https://www.youtube.com/watch?v=ODmhPsgqGgQ&t=20s" />

Creo que ahora es un buen momento para ampliar un poco, para que podamos entender mejor la notación que viene más adelante.

Así que, sí, es hora de algunas definiciones. Llamamos a un valor $\omega$ (la letra griega **omega**) una **raíz de la unidad** $k$-ésima del campo $\mathbb{F}_p$ si:

$$
\omega^k = 1
$$

En este caso, el conjunto $H$:

$$
H = \{1, \omega, \omega^2, \omega^3, ..., \omega^{k-1}\} \subseteq \mathbb{F}_p
$$

también funciona como un [grupo](/es/blog/cryptography-101/where-to-start/#groups) **multiplicativo cíclico**, generado por $\omega$:

$$
H = \langle \omega \rangle
$$

Hay dos cosas buenas sobre usar elementos de este conjunto como entradas a nuestro **polinomio de codificación** $P(X)$. Primero, pasar de una raíz de la unidad a la siguiente es tan simple como **multiplicar por** $\omega$. Del mismo modo, moverse hacia atrás se hace multiplicando por el _inverso_ de $\omega$. Y da **toda la vuelta** - por definición:

$$
\omega^{k-1}\omega = 1
$$

$$
\omega^{-1} = \omega^{k-1}
$$

En segundo lugar — y esta es la parte más importante — , usar este conjunto nos permite realizar **interpolación** utilizando el **algoritmo más eficiente** que conocemos: la [Transformada Rápida de Fourier](https://en.wikipedia.org/wiki/Fast_Fourier_transform). No profundizaremos en cómo funciona (¡al menos no ahora!), pero debes saber que esto mejora el tiempo de interpolación dramáticamente — lo que significa que las pruebas son más rápidas de generar (que otros métodos de interpolación).

---

## Codificando el Circuito {#encoding-the-circuit}

Habiendo dicho todo esto, es hora de ir al grano. Es momento de ver realmente cómo se **codifica** el rastro de cálculo.

Denotemos el **número de entradas** a nuestro circuito por $|I|$, y el **número de compuertas** por $|C|$. Con esto, definimos:

$$
d = 3|C| + |I|
$$

> Cada compuerta tiene tres valores asociados: dos entradas y una salida. Y es por eso que usamos $3|C|$. Nota que este número mágico $d$ resulta ser **exactamente** el número de valores en el rastro de cálculo.

Codificaremos todos estos valores en las raíces de la unidad de orden $d$:

$$
H = \{1, \omega, \omega^2, \omega^3, ..., \omega^{d-1}\}
$$

Pero, ¿qué raíz codifica a qué cable? ¡Necesitamos un plan!

- Las $|I|$ entradas se codificarán usando **potencias negativas** de $\omega$. Para la entrada $\#j$, usamos:

$$
P(\omega^{-j})
$$

- Los **tres cables** asociados a cada compuerta $k$, ordenados como **entrada izquierda**, **entrada derecha** y **salida**, serán codificados por los siguientes valores:

$$
P(\omega^{3k}), P(\omega^{3k + 1}), P(\omega^{3k + 2})
$$

Si miramos nuestro ejemplo de rastro, obtendríamos algo como esto:

$$
P(\omega^{-1}) = 20, P(\omega^{-2}) = 13, P(\omega^{-3}) = 5
$$

$$
P(\omega^0) = 5, P(\omega^1) = 20, P(\omega^2) = 100
$$

$$
P(\omega^3) = 13, P(\omega^4) = 100, P(\omega^5) = 0
$$

Con esto, todos los valores en nuestro rastro de cálculo están incluidos en el polinomio. Solo tenemos que **interpolar** y obtener $P(X)$, que tendrá grado $d - 1$.

### Codificación de Compuertas {#gate-encoding}

Las compuertas presentan una complicación: pueden ser compuertas de **suma** o de **multiplicación**. Esto significa que probar que una compuerta se evalúa correctamente requiere que transmitamos información sobre su **tipo**.

Hacemos esto a través de un **polinomio selector** $S(X)$. Para la compuerta $k$:

$$
S(\omega^{3k}) = 0 \ \textrm{o} \ S(\omega^{3k}) = 1
$$

Cuando la compuerta $k$ es una **compuerta de suma**, entonces $S(X)$ tomará el valor $1$, y si es una **compuerta de multiplicación**, entonces tomará el valor $0$. Para hacer esto simple de escribir, definamos:

$$
\alpha = \omega^{3k}
$$

Y luego construyamos la siguiente expresión:

$$
S(\alpha)[P(\alpha) + P(\omega \alpha)] + (1 - S(\alpha))P(\alpha)P(\omega \alpha) = P(\omega^2 \alpha)
$$

No dejes que la expresión te asuste — lo que está sucediendo es en realidad bastante directo. Verás, ya sea $S(\alpha) = 0$ o $1 - S(\alpha) = 0$. Debido a esto, **solo uno de los términos** que contienen $S(X)$ estará activo para alguna compuerta $k$, y en consecuencia, esta expresión vincula **entradas** ($P(\alpha)$ y $P(\omega \alpha)$) y **salidas** (codificadas en $P(\omega^2 \alpha)$) de una compuerta, junto con el **tipo de compuerta**.

### Codificación de Cableado {#wiring-encoding}

Esta es la más complicada de todas. Como se mencionó antes, puede suceder que algunos cables correspondan al **mismo valor**, ya que provienen de la **misma fuente**, como esto:

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/shared-sources.webp" 
    alt="Fuentes compartidas de compuertas"
    title="[zoom]"
    className="bg-white"
  />
</figure>

Lo que esto significa es que algunos de los valores codificados en $P(X)$ necesitan **coincidir**:

$$
P(\omega^a) = P(\omega^b) = P(\omega^c) = ...
$$

Si analizamos el **circuito completo**, terminaremos teniendo un conjunto de este tipo de restricciones:

$$
\left\{\begin{matrix}
P(\omega^{-1}) = P(\omega^1)
\\ P(\omega^{-2}) = P(\omega^3)
\\ P(\omega^{-3}) = P(\omega^0)
\\ P(\omega^2) = P(\omega^4)
\end{matrix}\right.
$$

> Esto es para el ejemplo anterior. Pero en general, las igualdades pueden tener más de $2$ miembros cada una

**Cada una** de estas debe ser codificada de alguna manera, por supuesto, en polinomios. La forma en que hacemos esto es bastante interesante: para cada restricción, definimos un polinomio que **permuta** o **rota** el subconjunto de raíces cuya **evaluación debería coincidir**. Así que por ejemplo, si la condición es:

$$
P(\omega^p) = P(\omega^q) = P(\omega^r) = P(\omega^s)
$$

Entonces definimos el subconjunto:

$$
H' = \{\omega^p, \omega^q, \omega^r, \omega^s\}
$$

Y usando $H'$, creamos un polinomio $W(X)$ que tiene el siguiente comportamiento:

$$
\\ W(\omega^p) = \omega^q
\\ W(\omega^q) = \omega^r
\\ W(\omega^r) = \omega^s
\\ W(\omega^s) = \omega^p
$$

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/root-rotation.webp" 
    alt="Rotación de potencias de las raíces involucradas"
    title="[zoom] Esencialmente recorre cíclicamente el subconjunto. ¡Esta es la parte que le da a Plonk su nombre, de hecho!"
  />
</figure>

Debido a que $W(X)$ siempre devuelve "el siguiente" elemento en $H'$, y dado que todos los valores de $P(X)$ deberían ser iguales para las raíces en $H'$, la forma en que probamos que se cumple la restricción de cableado es probando que:

$$
P(x) = P(W(x)) \forall x \in H'
$$

Esto debe hacerse para cada elemento en $H'$, cubriendo así **todas las igualdades** en una sola restricción.

---

¡Vaya! Eso fue ciertamente mucho. Sin embargo, ya hemos cubierto mucho terreno con esto.

En este punto, el probador tiene todos estos polinomios que codifican todo el **rastro de cálculo**. ¿Qué falta entonces? Solo la parte más importante: **convencer a un verificador de que el rastro es correcto**. Una vez que entendamos cómo sucede esto, finalmente todo estará unido.

---

## Requisitos de Verificación {#verification-requirements}

Por supuesto, el verificador **no conoce** los polinomios de los que acabamos de hablar. En particular, es crítico que **nunca aprendan** el $P(X)$ completo. La razón de esto es que, si lo consiguen, entonces podrían fácilmente **descubrir** la información secreta $x$, calculando:

$$
P(\omega^{-j})
$$

> ¡La capacidad de nunca revelar estos valores mediante el uso de polinomios es lo que le da a Plonk sus propiedades de conocimiento cero!

Si el verificador no puede conocer los polinomios, entonces ¿cómo podemos convencerlos de **algo**? ¿Llegamos a un callejón sin salida? ¿Deberíamos entrar en pánico ahora?

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/pikachu.webp" 
    alt="Pikachu sospechoso"
    title="Sospecho que ya conoces este truco narrativo"
  />
</figure>

Si bien el verificador no puede pedir los polinomios completos, **seguramente** puede pedir **evaluaciones individuales** de ellos. Deberían poder pedir **cualquier valor** de $P(X)$, $S(X)$ o los $W(X)$ — lo que significa que deberían poder **consultar cualquier parte** del rastro de cálculo. Excepto las entradas secretas, por supuesto.

> Es en este punto donde nuestro [PCS elegido](/es/blog/cryptography-101/commitment-schemes-revisited) resulta útil: cuando se solicita el valor de $P(X)$ en algún punto $b$ (así, $P(b)$), ¡el verificador puede comprobar que está correctamente calculado verificándolo contra un **compromiso**! Bieeeen.

<video-embed src="https://www.youtube.com/watch?v=SAfq55aiqPc" />

¿Por qué harían eso, sin embargo? ¡Para comprobar que se mantienen las **restricciones**, eso es!

Para estar convencido de que el rastro de cálculo es correcto, el verificador necesita comprobar que:

- La salida de la **última compuerta** es exactamente $0$ (esto es una convención),
- Las entradas (las públicas, o el **testigo**) están **correctamente codificadas**,
- La **evaluación** de cada compuerta es correcta (ya sea que se cumpla la **suma** o la **multiplicación**),
- El **cableado** es correcto.

El primero es fácil — el verificador solo pide la salida en la **última compuerta**, que es:

$$
P(\omega^{3|C| - 1}) = 0
$$

Para las otras comprobaciones, sin embargo, necesitaremos agregar **algo de magia** (como de costumbre, a estas alturas).

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/salt-bae.webp" 
    alt="Meme de Salt bae"
    title="Nunca entendí realmente a este tipo, pero bueno, es un buen meme"
  />
</figure>

### Los Últimos Toques de Criptomagia {#the-last-sprinkles-of-cryptomagic}

Tendremos que desviarnos un poco por un momento. Aquí hay una pregunta: dado algún polinomio de grado **a lo sumo** $d$, y que **no es idénticamente** $0$ (así que $f(x) \neq 0$), ¿qué tan probable sería que para una **entrada aleatoria** $r$ (muestreada de los enteros módulo $p$), obtengamos que $f(r) = 0$?

Debido a que el polinomio tiene grado a lo sumo $d$, tendrá a lo sumo $d$ _raíces_. Entonces, la probabilidad de que $f(r) = 0$ es exactamente la probabilidad de que $r$ resulte ser una **raíz** de $f$:

$$
\mathcal{P}[f(r) = 0] \leq d/p
$$

Y siempre que $p$ sea suficientemente mayor que $d$, entonces este es un **valor despreciable** (muy cercano a cero). Esto es importante: ¡si elegimos aleatoriamente algún $r$ y obtenemos que $f(r) = 0$, entonces podemos decir **con alta probabilidad** que $f(x)$ es **idénticamente cero** (la función cero)!

Esto se conoce como una **prueba de cero**. No parece ser mucho, pero vamos a necesitar esto para hacer funcionar nuestro **SNARK**.

> Hay un par de comprobaciones más que podemos realizar, a saber, una **comprobación de suma** y una **comprobación de producto**. Esto ya es bastante información para digerir, así que omitamos esas por ahora.

Lo interesante es que existen **Pruebas de Oráculo Interactivas** eficientes para realizar estas pruebas.

Lo siento... **Pruebas de QUÉ**?

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/sanic.webp" 
    alt="Cerebro de Sonic derritiéndose"
    title="*Fundición cerebral*"
  />
</figure>

---

## Pruebas de Oráculo Interactivas {#interactive-oracle-proofs}

¡Te advertí que esto no iba a ser fácil! Solo un poco más, y habremos terminado.

Las **Pruebas de Oráculo Interactivas** (IOPs, por sus siglas en inglés) son esencialmente una familia de mecanismos, mediante los cuales un probador y un verificador **interactúan** entre sí, para que el probador pueda convencer al verificador sobre la verdad de cierta afirmación. Algo como esto:

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/iop.webp" 
    alt="Diagrama de interacción de Prueba de Oráculo Interactiva"
    title="[zoom]"
    className="bg-white"
  />
</figure>

> ¡Espero que ya puedas ver cómo esta imagen se parece a la que usamos para describir los [Esquemas de Compromiso Polinomial](/es/blog/cryptography-101/commitment-schemes-revisited) (PCSs)!

Y usaremos este modelo para realizar nuestras pruebas. Con fines ilustrativos, describamos cómo sería una **prueba de cero**.

Imagina que quieres probar que algún conjunto $S$ es una colección de **raíces** de un polinomio dado $P(X)$:

$$
S = \{s_0, s_1, s_2, ..., s_{n-1}\}
$$

¿Qué puedes hacer al respecto? Bueno, dado que los valores en $S$ son _raíces_, puedes dividir el polinomio $P(X)$ por lo que se llama un **polinomio de anulación** para el conjunto $S$:

$$
V(X) = \prod_{i=0}^{n-1} (X - s_i)
$$

> El término **anulación** se debe al hecho de que el polinomio es cero solo en el conjunto $S$, por lo que son exactamente sus **raíces**.

Si $S$ realmente son las raíces de $P(X)$, entonces $P$ debería ser divisible por $V(X)$, **sin resto**.

$$
Q(X) = P(X) / V(X)
$$

Y ahora, vamos a tener que usar un [Esquema de Compromiso Polinomial](/es/blog/cryptography-101/commitment-schemes-revisited) para continuar. ¡Puede que tengas que leer ese artículo primero!

Esencialmente, lo que sucede es que el probador se compromete tanto con $P(X)$ como con $Q(X)$, y luego, solicitan una evaluación en algún $s_i$ aleatorio. Con estas evaluaciones, pueden comprobar si lo siguiente es cierto:

$$
Q(s_i).V(s_i) - P(s_i) = 0
$$

Si resulta ser cero, entonces vimos que pueden concluir **con alta probabilidad** que este polinomio $Q(X)V(X) - P(X)$ es **exactamente cero**! Lo que significa que:

$$
Q(X)V(X) = P(X)
$$

Por lo tanto, pueden estar convencidos de que, efectivamente, $S$ es un conjunto de raíces de $P(X)$. Si por alguna razón no están convencidos, podrían pedir otro conjunto de evaluaciones de $P(s)$ y $Q(s)$, y ejecutar la verificación de nuevo.

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/iop-first-step.webp" 
    alt="Prueba de cero en acción"
    title="[zoom]"
    className="bg-white"
  />
</figure>

> Existen IOPs similares para la **comprobación de suma** y la **comprobación de producto**.
>
> También vale la pena mencionar que esto no asegura que el polinomio no tenga otras raíces que no estén contenidas en $S$. ¡Pero no iremos por ese camino esta vez!

### De Interactivo a No-interactivo {#from-interactive-to-non-interactive}

Pero espera... ¿No dijimos que los SNARKs eran **no interactivos**? Entonces, ¿cómo es posible que algún **protocolo interactivo** sea una parte clave de nuestra construcción?

Resulta que hay una manera de convertir la **interactividad** en **no interactividad**: la [transformación de Fiat-Shamir](https://en.wikipedia.org/wiki/Fiat%E2%80%93Shamir_heuristic). Suena más intimidante de lo que es, confía en mí.

Si lo pensamos, podríamos preguntarnos "¿por qué estos protocolos son **interactivos** en primer lugar?" La razón es que en cada consulta, el verificador muestrea algún **número aleatorio** $r_i$ de algún conjunto. Y estos valores **no pueden ser predichos** por el probador — solo se vuelven disponibles para ellos cuando el verificador elige ejecutar una consulta. Esta **impredecibilidad** es una especie de **mecanismo anti-trampa**.

En lugar de esperar a que el verificador envíe valores aleatorios, podemos **simular** esta aleatoriedad usando una primitiva criptográfica bien conocida que también tiene una salida impredecible: [funciones de hash](/es/blog/cryptography-101/hashing)!

> No nos centremos en los detalles, sin embargo — todo lo que necesitas saber es que la heurística de Fiat-Shamir es una poderosa transformación, ¡que puede ser muy útil para convertir cualquier protocolo interactivo en uno no interactivo!

---

Después de lo que solo puede categorizarse como tortura, tenemos todos los elementos que necesitamos. Nuestro extenuante viaje está casi terminado — todo lo que queda es poner la cereza encima de esta pila de locuras.

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/dumbledore-suffering.webp" 
    alt="Dumbledore llorando después de beber del cáliz para obtener el Medallón de Slytherin"
    title="Ya acaba con mi sufrimiento"
  />
</figure>

---

## De Vuelta a la Verificación {#back-to-verification}

Bien, veamos. Recuerda, estamos tratando de convencer a un verificador de que conocemos $x$ tal que:

$$
\exists \ x \in {\mathbb{F}_p}^m \ / \ C(x,w) = 0
$$

Y tenemos que convencerlos de algunas cosas:

- Entradas correctas
- Cálculo correcto de compuertas
- Cableado correcto

Comencemos con las **entradas**. El verificador tiene el **testigo público**, $w$. Ahora, imagina que el verificador codifica este testigo en un **polinomio** $v(X)$, de modo que:

$$
v(\omega^{-j}) = w_j
$$

En este escenario, debería ser cierto que los valores $v(x)$ y $P(x)$ coinciden para las raíces de la unidad que codifican el **testigo público**:

$$
P(\omega^{-j}) - v(w_j) = 0
$$

Entonces, ¿qué hacemos? ¡Pues claro, una **prueba de cero** para el polinomio $P(X) - v(X)$ en las entradas que **codifican el testigo**!

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/brain-explosion.webp" 
    alt="Explosión cerebral"
    width="540"
  />
</figure>

¡Ajá! Comienza a tener sentido, ¿no es así?

### Comprobando las Compuertas {#checking-the-gates}

De manera similar, recuerda que las compuertas deberían satisfacer la expresión:

$$
\alpha = \omega^{3k}
$$

$$
S(\alpha)[P(\alpha) + P(\omega \alpha)] + (1 - S(\alpha))P(\alpha)P(\omega \alpha) = P(\omega^2 \alpha)
$$

Así que de nuevo, ¿qué haces? Una **prueba de cero en esta expresión masiva**, en cada compuerta. Maravilloso. Espléndido.

> Para esto, por supuesto, el verificador necesitará un compromiso con $S(X)$.

### Comprobando los Cables {#checking-the-wires}

Por último, necesitamos verificar las **restricciones de cableado**. Estas fueron codificadas en algunos polinomios $W(X)$ que **recorrían cíclicamente** un conjunto de entradas $H'$, y teníamos que comprobar que:

$$
P(x) = P(W(x)) \forall x \in H'
$$

Para cada elemento en $H'$. Esto no es realmente **eficiente** de hacer con pruebas de cero (aunque se puede hacer), así que hay una forma alternativa de hacerlo a través del uso de una **comprobación de producto**. Usando esta expresión **casualmente mencionada**:

$$
L(Y, Z) = \prod_{x \in H'} \frac{P(x) + Y.W(x) + Z}{P(x) + Y.x + Z}
$$

> Sí

La esencia de esto es que la expresión completa **debería ser igual** a $1$! Si lo piensas, tiene perfecto sentido: todos los valores $P(x)$ deberían ser los mismos, y dado que $W(X)$ **permuta** los elementos de $H'$, y porque el producto cubre todo $H'$, simplemente obtenemos:

$$
L(Y, Z) = \prod_{x \in H'} \frac{P(x) + Y.W(x) + Z}{P(x) + Y.x + Z}
$$

$$
= \frac{\prod_{x \in H'} P(x) + Y.W(x) + Z}{\prod_{x \in H'} P(x) + Y.x + Z} = \frac{\prod_{x \in H'} P(x) + Y.x + Z}{\prod_{x \in H'} P(x) + Y.x + Z} = 1
$$

> Hay más que decir sobre esto, como ¿por qué necesitamos incorporar $Y$ y $Z$ en la mezcla? Pero honestamente, creo que es suficiente matemática por hoy.

En resumen, y para concluir: ¡usamos algunas **IOPs** para verificar las **restricciones** en un circuito aritmético, que fueron codificadas en polinomios!

---

## Resumen {#summary}

Uff. Eso fue mucho. Lo sé.

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/ross-internal-pain.webp" 
    alt="Ross de Friends en la escena del tono agudo"
    title="Sabemos que no estás bien, Ross. Está bien"
  />
</figure>

Aún así, me parece increíble cómo todas estas cosas se unen para formar un protocolo tan sofisticado: usamos **interpolación polinómica** para codificar cosas, **esquemas de compromiso polinomial** para consultar información, **pruebas de oráculo interactivas** para crear pruebas, y la **heurística de Fiat-Shamir** para convertir todo este lío en una **prueba no interactiva**. **In-cre-í-ble**.

El resultado final, [Plonk](https://eprint.iacr.org/2019/953.pdf), logra la generalidad que estábamos buscando al permitir que se use **cualquier circuito**. Y dado que esto no revela nada sobre $x$, ¡entonces esto es realmente un **SNARK de conocimiento cero** (**zkSNARK**)!

> Por razones de exhaustividad, diré que hay algunos otros detalles a considerar para asegurarse de que el protocolo sea **de conocimiento cero**, específicamente en torno a los **desafíos**. No te preocupes demasiado, sin embargo, ¡a menos que, por supuesto, estés planeando implementar Plonk tú mismo!

Para una mirada más interactiva, puedes consultar esta excelente lección en video.

<video-embed src="https://www.youtube.com/watch?v=vxyoPM2m7Yg" />

¡Y aquí hay [otro intento de explicar el protocolo](https://trapdoortech.medium.com/zkp-plonk-algorithm-introduction-834556a32a), en caso de que te resulte más fácil de seguir!

Con suerte, ahora puedes entender mejor la breve descripción de Plonk que proporcioné al principio del artículo:

::: big-quote
En Plonk, codificamos el cálculo de un circuito en una serie de polinomios, que representan las restricciones impuestas por el circuito, para los cuales podemos probar afirmaciones mediante una serie de pruebas, sin revelar jamás los polinomios mismos — y por lo tanto, sin filtrar las entradas secretas.
:::

Dado que ahora podemos crear pruebas para circuitos arbitrarios, me gustaría volverme más práctico. Así que, [la próxima vez](/es/blog/cryptography-101/zero-knowledge-proofs-part-3), construiremos un par de circuitos para algunas afirmaciones, que luego pueden ser las entradas para Plonk, convirtiéndolas en **zkSNARKS**. ¡Hasta pronto!
