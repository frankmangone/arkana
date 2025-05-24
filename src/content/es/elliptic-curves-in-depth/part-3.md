---
title: "Curvas Elípticas En Profundidad (Parte 3)"
date: "2025-01-29"
author: "frank-mangone"
thumbnail: "/images/elliptic-curves-in-depth/part-3/hawk.webp"
tags: ["cryptography", "groups", "mathematics", "ellipticCurves"]
description: "Es hora de centrarnos en el aspecto más relevante de las curvas elípticas en criptografía: su estructura de grupo."
readingTime: "10 min"
mediumUrl: "https://medium.com/@francomangone18/elliptic-curve-in-depth-part-3-7ae583674b4d"
---

Si tuviéramos que definir qué es una curva elíptica solo con lo que hemos cubierto hasta ahora, probablemente diríamos algo como:

::: big-quote
Son polinomios de tercer grado con una expresión particular, definidos sobre campos finitos, junto con una forma especial de sumar puntos
:::

Aunque esto es técnicamente preciso, no hace mucha justicia a las curvas elípticas. Especialmente porque toda su razón de ser es ser aplicadas en algoritmos criptográficos — y hasta ahora, no hemos dicho **nada** (aparte de la precisión discreta de la que hablamos en el [artículo anterior](/es/blog/elliptic-curves-in-depth/part-2)) que haga que las curvas elípticas sean atractivas como primitivas criptográficas.

Claramente, hay algo que nos estamos perdiendo.

Para ser justos, hablar de **curvas elípticas** termina siendo un poco engañoso. Porque realmente, las curvas elípticas utilizadas en criptografía ni siquiera son **curvas** — son **grupos**.

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-3/hawk.webp" 
    alt="Halcón sorprendido"
    title="¿¿Son qué??"
    width="600"
  />
</figure>

Sí, grupos. El nombre "curvas elípticas" por sí solo no cuenta toda la historia. Sería mucho más adecuado llamarlas **grupos** de curvas elípticas, pero la versión más corta es ampliamente aceptada.

Ahora, los grupos **son** interesantes para la criptografía. Y no hemos dicho mucho sobre ellos todavía, ¡así que empecemos por ahí!

---

## Grupos {#groups}

En principio, los grupos son estructuras muy simples. Se definen por solo dos elementos simples: un **conjunto** y una **operación binaria**. Una operación binaria válida necesita producir un resultado que también pertenezca al conjunto. En otras palabras, debería ser una función de la forma:

$$
f: \mathbb{G} \times \mathbb{G} \rightarrow \mathbb{G}
$$

> Normalmente, no hacemos distinción entre el grupo $\mathbb{G}$ y el conjunto subyacente. ¡Es común referirse al conjunto como el "grupo" en sí!

Veremos por qué los grupos son importantes en un minuto. Pero primero, veamos un ejemplo importante.

Gran parte de nuestro [encuentro anterior](/es/blog/elliptic-curves-in-depth/part-2) fue dedicado a los **campos finitos**. El conjunto detrás de dichos campos era simplemente los **enteros módulo** $p$:

$$
\mathbb{Z}_p = \{0,1,2,..,p-1\}
$$

Esto se comporta como un campo, porque la suma, resta, multiplicación y división (inversos modulares) están bien definidas (módulo $p$). Pero ahora eliminemos el **cero** de este conjunto:

$$
{\mathbb{Z}_p}^* = \{1,2,3,..,p-1\}
$$

Y ahora pregunto: ¿**sigue siendo un campo**?

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-3/flying-equations.webp" 
    alt="Meme de ecuaciones volando"
    width="450"
  />
</figure>

La respuesta es **no**. La razón es que no está **cerrado bajo la suma**: cuando sumamos $1$ y $p - 1$, el resultado es $0$, que no pertenece a nuestro conjunto.

Sin embargo, las cosas funcionan cuando usamos la **multiplicación**.

> La única forma en que podríamos obtener $0$ al multiplicar dos números $a$ y $b$ en el grupo es si el resultado es un múltiplo de $p$ — es decir, si $p$ está en la factorización de $a.b$. Pero si $p$ es primo, entonces esto no es posible — $p$ no puede simplemente aparecer como una combinación de factores de $a$ y $b$.
>
> Por lo tanto, multiplicar elementos del conjunto ${\mathbb{Z}_p}^*$ nunca dará como resultado $0$ (módulo $p$, y con $p$ primo).

De manera bastante orgánica, vemos que ${\mathbb{Z}_p}^*$ se comporta como un grupo, ya que solo admite una operación (multiplicación). No debería sorprendernos que llamemos a esto un **grupo multiplicativo**.

> Se podría argumentar que admite dos operaciones en lugar de una, ya que podemos calcular inversos multiplicativos. No nos detengamos demasiado en eso.

No hay razón por la que los grupos deban ser **finitos** — de hecho, existen grupos infinitos. Pero por razones similares a las expuestas en el [post anterior](/es/blog/elliptic-curves-in-depth/part-2/#modular-arithmetic), queremos trabajar con grupos finitos. A menudo, esto se expresa como trabajar con grupos de **orden** finito — y probablemente puedas adivinar que el **orden** es el número de elementos en el grupo, o su **tamaño**, o **cardinalidad**.

### Identidad y Generadores {#identity-and-generators}

Algunos elementos en los grupos tienen propiedades particulares que los hacen especiales. Tal es el caso de la **identidad** de un grupo.

Conceptualmente, el elemento identidad es muy simple. Es un elemento que tiene el efecto de no hacer **absolutamente nada** en la operación binaria de un grupo. Por ejemplo, en nuestro **grupo multiplicativo de enteros**, podemos ver fácilmente que $1$ es la identidad, ya que para cualquier número $a$ en el grupo:

$$
1.a = a
$$

Cada grupo necesita tener un elemento identidad. Algunos pueden no ser tan evidentes, sin embargo.

---

Luego, tenemos los **generadores**. La idea es nuevamente bastante simple: toma un elemento $g$ del grupo y realiza la operación del grupo con **sí mismo**.

$$
f(g,g) = g \cdot g = g^2
$$

> Por simplicidad, asumamos que el grupo es multiplicativo, por ahora. Por lo tanto, el resultado es $g^2$ en lugar de $2g$.

Toma este resultado y multiplícalo por $g$ nuevamente, obteniendo $g^3$. Repite, hasta que el resultado sea nuevamente $g$.

> Los grupos multiplicativos de enteros módulo $p$ son **cíclicos** — no solo son finitos, sino que vuelves al mismo generador después de aplicar la operación del grupo suficientes veces. ¡Como los números en un reloj!

Si después de este proceso iterativo llegas a ver **cada elemento individual** del grupo antes de volver a obtener $g$, entonces decimos que **genera** el grupo, o que es un **generador** del grupo. Esto se denota generalmente:

$$
\langle g \rangle = \mathbb{G}
$$

No todos los elementos de un grupo son necesariamente generadores. Más a menudo que no, encontraremos una **subsecuencia** de elementos de $\mathbb{G}$. Resulta que esta subsecuencia también se comporta como un grupo — de hecho, estos subconjuntos resultantes se llaman **subgrupos**.

### ¿Por Qué Grupos? {#why-groups}

En este punto, puede que te estés preguntando qué tienen de especial los grupos. Comparados con las cosas que hemos visto hasta ahora, no parecen particularmente sofisticados.

Sin embargo, las apariencias pueden ser engañosas. Por simples que parezcan, ¡son la **columna vertebral** de una gran cantidad de algoritmos criptográficos!

> ¡Al menos hasta que la criptografía basada en anillos y retículos se vuelva más extendida!

En los primeros días de la criptografía moderna, algoritmos como el [Intercambio de Claves Diffie-Hellman](/es/blog/cryptography-101/protocols-galore/#key-exchange) y [Rivest-Shamir-Adleman](/es/blog/cryptography-101/asides-rsa-explained) (RSA) revolucionaron la forma en que se compartía y protegía la información. Ambos se basaban en una operación simple: **exponenciación modular**. En otras palabras, operaciones como esta:

$$
y = g^x \ \textrm{mod} \ p
$$

Y mira eso — $y$ es un elemento del grupo multiplicativo **generado** por $g$. Es decir, $g$ es un generador de grupo, lo que también significa que no puede ser la identidad del grupo.

Existen algoritmos para la [exponenciación modular rápida](https://www.khanacademy.org/computing/computer-science/cryptography/modarithmetic/a/fast-modular-exponentiation). Pero el proceso inverso — en nuestro caso, encontrar $x$ — no es casi tan simple, debido a la no linealidad introducida por la operación módulo.

El problema de invertir la operación de exponenciación se conoce como el **Problema del Logaritmo Discreto**, o **DLP** (por sus siglas en inglés). Y aunque [existen algoritmos](https://en.wikipedia.org/wiki/Function_field_sieve) para resolver este problema, no son casi tan eficientes como la exponenciación rápida. A medida que el tamaño del grupo se hace más grande, el problema se vuelve más difícil — y para grupos lo suficientemente grandes, el problema es **inviable** con la potencia de cómputo estándar.

> Por el bien de la precisión, debo aclarar que RSA no se basa en el DLP, sino en el [problema de la factorización de enteros](https://en.wikipedia.org/wiki/Integer_factorization).

Así que, sí, ¡los grupos **son** útiles! Pero, ¿cómo se relaciona esto con las curvas elípticas?

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-3/homer-thinking.webp" 
    alt="Homer Simpson pensando"
    title="Hmmm..."
    width="500"
  />
</figure>

---

## Grupos de Curvas Elípticas {#elliptic-curve-groups}

Bueno, de alguna manera arruiné la sorpresa al principio del artículo.

Las curvas elípticas, junto con la operación que definimos para sumar (y duplicar) puntos, forman **grupos**.

El equivalente de la exponenciación modular es la multiplicación escalar de puntos: tomamos un entero $x$ y calculamos:

$$
Y = [x]G
$$

Nuevamente, $G$ es un generador, diferente de la **identidad del grupo**.

> En los grupos de curvas elípticas, la identidad es el punto en el infinito $\mathcal{O}$.

Lo que distingue a estos grupos de los grupos multiplicativos de enteros es el hecho de que calcular la operación binaria es **mucho más costoso**. Multiplicar dos enteros es simple y rápido, mientras que sumar puntos de curvas elípticas implica varias multiplicaciones.

Esto es importante porque hace que resolver el DLP sea **mucho más difícil**. Y como mencionamos anteriormente, la mayor parte de la criptografía moderna se basa en la dificultad de este problema, o problemas similares. Cuanto más difícil es el problema, mejor es la seguridad.

> Bueno, al menos para tamaños de clave similares. Puedes encontrar una discusión interesante sobre eso [aquí](/es/blog/cryptography-101/asides-evaluating-security).

### Tamaño del Grupo {#group-size}

Todo esto está muy bien, siempre y cuando estemos tratando con **grupos grandes**. Si no, entonces todos nuestros esfuerzos son en vano.

> Cualquier problema que se base en el DLP para su seguridad puede traducirse a grupos de curvas elípticas — donde tenemos el problema del logaritmo discreto de curva elíptica, o ECDLP.

De hecho, hay ejemplos de grupos de curvas elípticas pequeños — vimos uno en el [artículo anterior](/es/blog/elliptic-curves-in-depth/part-2). Esos no son útiles para fines criptográficos.

Además, no es inmediatamente obvio cuál es el tamaño de una curva elíptica con solo mirar su ecuación afín. Así que podrías preguntarte: ¿cómo sabemos el tamaño de un grupo de curva elíptica dado?

Podríamos intentar primero el enfoque ingenuo: literalmente, **contar cada punto individual**.

Considera por ejemplo la curva $y^2 = x^3 + x + 1$ sobre $\mathbb{F}_7$. Para encontrar todos los puntos de la curva, simplemente verificamos todas las combinaciones $(x, y)$ con coordenadas en $\mathbb{F}_7$ — y las combinaciones que satisfacen la ecuación anterior serán puntos en la curva. Junto con $\mathcal{O}$, por supuesto.

> Un enfoque ligeramente más rápido implicaría aprovechar la simetría de la curva, lo que reduciría nuestro dominio de búsqueda a la mitad.

En este pequeño ejemplo, encontramos un total de $9$ puntos. No está mal, ¿verdad?

Pero nos encontramos con un problema cuando una curva está definida sobre $\mathbb{F}_p$, con $p$ siendo un **primo grande**. Si $p$ es un entero de 256 bits, incluso una supercomputadora moderna tardaría demasiado en contar todos los puntos de una curva. Como, hasta la muerte térmica del universo.

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-3/skeleton.webp" 
    alt="Esqueleto pensando"
    title="Todavía esperando."
    width="500"
  />
</figure>

> Para darte una idea aproximada, la mayoría de las curvas elípticas utilizadas en la práctica están definidas sobre campos de tamaño alrededor de $2^{256}$ (eso es un número de 77 dígitos).

Impractico, al menos.

Por supuesto, se han desarrollado métodos más eficientes. Uno de los algoritmos más famosos para contar puntos de curvas elípticas es el [algoritmo de Schoof](https://en.wikipedia.org/wiki/Schoof%27s_algorithm), que utiliza algunos conceptos que aún no hemos introducido, como la [cota de Hasse](https://en.wikipedia.org/wiki/Hasse%27s_theorem_on_elliptic_curves) y el [endomorfismo de Frobenius](https://en.wikipedia.org/wiki/Frobenius_endomorphism). Hablaremos de eso más adelante.

> El algoritmo de Schoof se ejecuta en tiempo polinómico, y hay alternativas aún más rápidas como el [algoritmo de Schoof-Elkies-Atkin (SEA)](https://en.wikipedia.org/wiki/Schoof%E2%80%93Elkies%E2%80%93Atkin_algorithm).

---

Otra cosa a tener en cuenta cuando se trata del tamaño del grupo es su **factorización en primos**. El tamaño de los grupos de curvas elípticas será más a menudo que no un **número compuesto** (es decir, no primo). Esto es, el tamaño $\#E(\mathbb{F}_p)$ del grupo será:

$$
\#E(\mathbb{F}_p) = q = p_1.p_2.p_3...
$$

Donde los $p_i$ son números primos.

¿Por qué nos importa? Por un cierto tipo llamado **Lagrange**.

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-3/lagrange.webp" 
    alt="Joseph-Louis Lagrange"
    title="¿Qué tal?"
    width="500"
  />
</figure>

El [teorema de Lagrange](<https://en.wikipedia.org/wiki/Lagrange%27s_theorem_(group_theory)>) en teoría de grupos revela que si $q$ es el orden de algún grupo $\mathbb{G}$, entonces dicho grupo tendrá **subgrupos cíclicos** de órdenes $p_i$ — los factores de $q$.

Esto es problemático debido a otro teorema: el [Teorema Chino del Resto](https://en.wikipedia.org/wiki/Chinese_remainder_theorem) (CRT para abreviar). En resumen, resolver el DLP puede hacerse encontrando subgrupos de cada orden pᵢ, resolviendo el problema en cada uno de estos subgrupos y luego combinando los resultados.

Si analizamos ese proceso, vemos que el más difícil de esos sub-DLP es el asociado con el $p_i$ más grande.

Todo esto para decir: no solo buscamos un grupo de curva elíptica **grande** — lo que realmente necesitamos es un grupo grande con un **factor primo grande**.

Gracias, Lagrange.

### Una Conexión Más Profunda {#a-deeper-connection}

Por último, quiero tomarme un momento para abordar un tema muy interesante. Contar puntos en curvas elípticas tiene aplicaciones prácticas en criptografía, como acabamos de ver. Pero también está relacionado con uno de los problemas no resueltos más profundos en matemáticas: la [conjetura de Birch y Swinnerton-Dyer (BSD)](https://en.wikipedia.org/wiki/Birch_and_Swinnerton-Dyer_conjecture).

> Esta conjetura es uno de los 6 [Problemas del Milenio](https://www.claymath.org/millennium-problems/) que permanecen sin resolver. Si te sientes especialmente atrevido, ¡intenta leer el [planteamiento del problema](https://www.claymath.org/wp-content/uploads/2022/05/birchswin.pdf) y mira si despierta tu interés! Hay un premio de un millón de dólares para quien lo resuelva.

La conjetura BSD trata sobre encontrar **puntos racionales** en curvas elípticas — puntos cuyas coordenadas son **fracciones**, como $(1/2, -3/4)$. Algunas curvas pueden tener un número infinito de puntos racionales, mientras que otras tienen solo un número finito. La conjetura trata de entender a cuál de esas dos categorías pertenece una curva elíptica.

> Mientras que las curvas elípticas sobre los números reales pueden formar grupos infinitos, cuando las definimos sobre campos finitos, automáticamente se convierten en grupos finitos. Esto se debe a que nuestras coordenadas solo pueden tomar valores del campo finito — y solo hay $p$ valores posibles para cada coordenada. Esto finito es más adecuado para fines criptográficos.

Descifrar esto es una tarea compleja. Literalmente — implica usar algo llamado la **función L** de la curva, que está definida sobre los números complejos. Calcular esta función L está estrechamente relacionado con el conteo de puntos, que era nuestro objetivo hace apenas un minuto.

La conjetura BSD requiere un momento para entenderla. Si estás interesado, aquí hay una [conferencia del Instituto Clay de Matemáticas](https://www.youtube.com/watch?v=2gbQWIzb6Dg) sobre el tema, y otro gran video (en español, pero tiene subtítulos) explicándolo con gran detalle, diagramas y animaciones:

<video-embed src="https://www.youtube.com/watch?v=9mR_h9ufs4E" />

Pero ese es un tema para [otro momento](/es/blog/elliptic-curves-in-depth/part-6). Volvamos a la Tierra.

---

## Resumen {#summary}

Después de leer este artículo, si nos vuelven a preguntar qué es una curva elíptica, ahora podemos hablar de **grupos de curvas elípticas**, y ahora sabemos que esas son las estructuras que son útiles en criptografía.

Hay muchas aplicaciones para los grupos de curvas elípticas. Sugiero mirar la serie [Criptografía 101](/es/reading-lists/cryptography-101) para una lista larga (pero incompleta) de algoritmos que involucran curvas elípticas.

Pero, ay, la historia no termina aquí. Hay mucho más que decir sobre las curvas elípticas. Consejos y trucos sobre cómo hacer los cálculos más rápidos, perspectivas sobre cómo elegir "buenas curvas elípticas", pasar a "dimensiones superiores" — sí, mucha diversión por delante.

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-3/happy-spongebob.webp" 
    alt="Bob Esponja de espaldas con una cara feliz dibujada en su espalda"
    title="¡Yupi!"
    width="400"
  />
</figure>

¡Nos vemos en la [próxima parte](/es/blog/elliptic-curves-in-depth/part-4)!
