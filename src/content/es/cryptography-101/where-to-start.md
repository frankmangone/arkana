---
title: "Criptografía 101: Por Dónde Empezar"
date: "2024-03-07"
author: "frank-mangone"
thumbnail: "/images/cryptography-101/where-to-start/aaaaa.webp"
tags: ["Criptografía", "Grupos", "Aritmética Modular"]
description: "Una introducción muy relajada al mundo de la criptografía"
readingTime: "6 min"
---

Empezaré diciendo que no soy de ninguna manera ni matemático ni experto en criptografía — soy solo alguien intentando aprender sobre criptografía por mi cuenta.

Pero es precisamente por esto que he tratado de destilar los conceptos complejos con los que me he topado en fragmentos fáciles de digerir. Así que este es mi intento de presentar estos conceptos. Siempre he creído que hay algo profundamente enriquecedor en tratar de entender cómo funcionan las cosas, aunque no necesitemos implementar o realmente utilizar todas las ideas que aprendemos. ¡Espero que te diviertas en el camino!

En este artículo, exploraremos algunos de los conceptos básicos detrás de las técnicas criptográficas, y construiremos sobre estos conceptos más adelante. Establecer estos fundamentos será importante para entender procesos como el **cifrado**, **compartición de secretos**, y otros.

## Primeros pasos

En mi caso, he estado trabajando en una empresa que utiliza tecnología [Blockchain](/es/blog/blockchain-101/how-it-all-began). Esto requiere una comprensión básica de las **firmas digitales** — ya sabes, algún usuario tiene una **clave privada**, utiliza esa clave privada para **firmar un mensaje**, y la autenticidad de la firma puede verificarse con una **clave pública**. Esta jerga es bastante común, y existen muchas bibliotecas para realizar las acciones que acabo de describir.

Pero desde mi perspectiva, esto no parecía diferente a la magia. ¿Cómo funciona esto? ¿Qué mecanismo permite un proceso tan particular? Esta curiosidad es lo que en última instancia motiva este artículo.

Sin embargo, tal aventura no puede comenzar explicando cómo funciona un mecanismo de firma digital. Primero debemos establecer algunas bases matemáticas para entender cómo operan los protocolos y técnicas criptográficas. Así que este será nuestro punto de partida.

---

## Grupos

Hay muchas técnicas criptográficas que se basan en **grupos matemáticos**. En esencia, un **grupo** es simplemente la combinación de un **conjunto** de elementos y una **operación binaria** (la denotaremos "+" por ahora) que toma dos elementos del conjunto y produce otro elemento en dicho conjunto. Esto es muy abstracto — y de hecho, nada nos impide usar un conjunto como:

$$
S = \{A, B, C, D, E\}
$$

Pero entonces tendríamos que definir cuál es el resultado de la combinación de **cada par de elementos** cuando aplicamos la operación de grupo (es decir, ¿cuál es el resultado de $A + B$? ¿Es el mismo resultado que $B + A$?).

Afortunadamente, hay grupos que son **más simples de definir**. Uno de estos grupos se basa en los enteros — si restringimos los enteros solo a los elementos por debajo de cierto umbral $$q$$, obtenemos un conjunto de la forma:

$$
\mathbb{Z}_q = \{0, 1, 2, 3, ..., q-1\}
$$

Sin profundizar en el rigor matemático, simplemente llamaremos a este conjunto los **enteros módulo** $q$. Y es muy natural tomar la **suma estándar** como la operación de grupo: $1 + 2$ da $3$, que es un elemento del conjunto, $2 + 2$ da $4$, y así sucesivamente. Esto es cierto para muchos enteros, ¡siempre que $q$ sea lo suficientemente grande! Pero surge una pregunta: ¿qué sucede si nos salimos del "rango"? Por ejemplo, si intentamos sumar:

$$
(q-1) + 1 = ?
$$

¿Qué ocurre? ¿Un agujero negro? ¿Desbordamiento de pila?

<figure>
  <img 
    src="/images/cryptography-101/where-to-start/aaaaa.webp" 
    alt="Cabra gritando"
    title="¡Aaaaaaaaa!"
  />
</figure>

Bueno... ¡Algo así! Simplemente **volvemos al principio** de nuestro conjunto, resultando en $0$. Y esto sucede porque mentí un poco: la operación de grupo no es solo la suma estándar, es la **suma modular**. Así que debemos definir qué es esto para continuar.

## La Operación Módulo

Realmente, cuando decimos **suma modular**, nos referimos a la operación **módulo**. Y esta operación es simplemente el resto de dividir un número $$a$$ por algún módulo $$q$$. En general, se cumple la siguiente relación:

$$
a = k.q + b \ / \ 0 \leq b < q
$$

Entonces, al dividir $a / q$, obtendremos como resultado algún entero $$k$$ y algún resto $$b$$. El resultado de la operación módulo es simplemente el resto, y escribimos:

$$
a \ \textrm{mod} \ q = b
$$

¡Genial! Con esto, podemos terminar de definir la operación de grupo que mencionamos anteriormente: es la suma estándar, más la aplicación de la operación módulo $$q$$. Lo que acabamos de definir es el grupo conocido como el **grupo aditivo de enteros módulo** $$q$$. Esta construcción simple estará detrás de la mayor parte de nuestros análisis posteriores, ya sea implícita o explícitamente, ¡así que es bueno tenerla en mente!

## Generadores de Grupo y Subgrupos

Volvamos ahora nuestra atención a la comprensión de los grupos. Y en particular, examinemos el ejemplo donde $q = 5$. Elijamos ahora un elemento en el conjunto, por ejemplo $g = 2$. ¿Qué sucede si aplicamos la operación de grupo sobre $g$ consigo **mismo** una y otra vez?

$$
\\ 2 + 2 \ \textrm{mod} \ 5 = 4
\\ 2 + 2 + 2 \ \textrm{mod} \ 5 = 1
\\ 2 + 2 + 2 + 2 \ \textrm{mod} \ 5 = 3
\\ 2 + 2 + 2 + 2 + 2 \ \textrm{mod} \ 5 = 0
$$

Observa que sucede algo interesante: hemos producido **todos los elementos del grupo** mediante la suma repetida de $$g$$. Esto hace que $$g = 2$$ sea "especial" de cierta manera — decimos que es un **generador** del grupo, ya que efectivamente hemos "generado" todo el conjunto asociado en este procedimiento. Normalmente denotamos el grupo generado por un elemento $g$ con la expresión $$\langle g \rangle$$.

También podemos observar que en el ejemplo anterior, **cada elemento** del grupo resulta ser un generador — puedes probarlo tú mismo. Esto no es coincidencia: tiene que ver con el hecho de que el número de elementos en el grupo (llamado el **orden** del grupo, y denotado con $$\#$$) es en realidad un **número primo**. Solo señalaremos esto, pero no le prestaremos atención por ahora.

Sin embargo, si elegimos un $$q$$ diferente, entonces no todos los elementos tienen que ser generadores. Por ejemplo, si $$q = 6$$, entonces el elemento $$2$$ **no** es un generador: solo produciremos el conjunto $$\{ 0, 2, 4 \}$$ — nos hemos topado con un **subgrupo cíclico** generado por $$g=2$$.

Hay una propiedad interesante sobre los subgrupos, formulada en el [teorema de Lagrange](<https://en.wikipedia.org/wiki/Lagrange%27s_theorem_(group_theory)>), que establece:

> Todo subgrupo $S$ de un grupo $G$ de orden finito tiene un orden que es un divisor del orden de $G$; es decir, $\#S$ divide a $\#G$.

Los subgrupos y sus propiedades juegan un papel importante en la criptografía de grupos, así que, de nuevo, volveremos a estos hechos más adelante.

## Resumen

En esta breve introducción, se presentaron algunos conceptos matemáticos básicos. Estos servirán como fundamento para lo que vendrá en los próximos artículos.

Por sí mismo, entender la operación módulo y **sus propiedades** es suficiente para describir algunas técnicas criptográficas (como el [cifrado RSA](/es/blog/cryptography-101/asides-rsa-explained)) — pero hay otros grupos de interés que aún debemos definir. En el [próximo artículo](/es/blog/cryptography-101/elliptic-curves-somewhat-demystified), nos sumergiremos en el mundo de las curvas elípticas, y más tarde las utilizaremos para idear algunos [protocolos criptográficos](/es/blog/cryptography-101/encryption-and-digital-signatures).
