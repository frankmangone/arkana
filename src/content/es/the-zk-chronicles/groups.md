---
title: 'Las Crónicas de ZK: Grupos'
author: frank-mangone
date: '2026-03-02'
thumbnail: /images/the-zk-chronicles/groups/judge-judy.webp
tags:
  - zeroKnowledgeProofs
  - groups
  - ellipticCurves
description: >-
  Tras abastecernos de hashes, ¡es hora de otro gran protagonista de esta
  historia ZK!
readingTime: 14 min
contentHash: f76f8315d87c91d6dde1058d785af6ad61e5a84bef8190b464c485cdb0773d50
---

Nuestro último encuentro fue principalmente para presentar una herramienta crucial, en forma de los [hashes](/es/blog/the-zk-chronicles/enter-hashing).

Es increíble cuánto potencial nos desbloqueó una sola primitiva criptográfica nueva. Pero para seguir avanzando, ¡el hashing por sí solo no va a ser suficiente!

Vamos a necesitar un par de herramientas más, que finalmente nos despejarán el camino (casi) por completo, permitiéndonos abordar las técnicas de ZK más sofisticadas que existen.

El tema de hoy entonces serán los grupos matemáticos. Es un concepto abstracto, pero no dejes que eso te intimide: rápidamente llevaremos las cosas a territorio conocido.

Vamos a tener que cubrir algunos conceptos complicados, pero de nuevo, no hay necesidad de preocuparse demasiado. No vamos a sumergirnos muy profundo en los detalles finos, y solo las ideas más importantes serán suficientes por ahora. Además, hay mucho material por ahí que puede ayudarte a guiarte a través de los matices de las construcciones de hoy.

> Por supuesto, yo también he escrito bastante sobre ellos, ¡así que me tomaré la libertad de linkear a blogposts relevantes a medida que avancemos!

¡Eso es todo lo que tengo para la intro de hoy! Es hora de ponernos manos a la obra.

---

## Grupos {#groups}

El primer concepto del que necesitamos hablar hoy es el de un **grupo**.

Los nombres pueden ser un poco engañosos acá. Hablar de un grupo probablemente nos lleva a imaginar algo del estilo de un montón de elementos agrupados. Y aunque hay algo de verdad en esa afirmación, está lejos de ser la historia completa.

De hecho, la definición anterior describe mejor lo que sería un [conjunto](https://en.wikipedia.org/wiki/Set_(mathematics)) matemático.

> Que es exactamente eso: ¡un montón de elementos formando una sola entidad!
>
> Para ser justos, la [teoría de conjuntos](https://en.wikipedia.org/wiki/Set_(mathematics)) es un área muy importante de las matemáticas, con gran expresividad y teoremas muy profundos (como el [Teorema del Buen Orden](https://en.wikipedia.org/wiki/Well-ordering_theorem)). ¡Pero eso será tema para otra ocasión!

Un [grupo](https://en.wikipedia.org/wiki/Group_(mathematics)) en realidad está compuesto por **dos cosas**: un conjunto, y una sola **operación binaria**: una función que toma dos entradas de dicho conjunto, y produce otro elemento que también pertenece a la misma bolsa.

Sí, lo sé. Huele a matemática abstracta, y eso se pone aterrador rápido.

La buena noticia es que no vamos a necesitar enfocarnos en todo el universo de posibles grupos extraños. Solo necesitamos conocer un par de grupos de interés (o familias de grupos), ¡y eso debería ser suficiente para cubrir el resto de la serie!

<figure>
	<img
		src="/images/the-zk-chronicles/groups/star-wars.webp"
		alt="Maz Kanata con una mirada seria"
		title="Ya no sé si confío en ti"
	/>
</figure>

Así que antes de siquiera ver las lindas propiedades que realmente hacen que los grupos sean útiles para la criptografía, enfoquémonos en nuestros dos protagonistas, que son los caballos de batalla de las técnicas modernas.

---

## Enteros, Revisitados {#integers-revisited}

Espera, ¿**enteros**? ¿No los habíamos cubierto ya?

No, tu memoria no te está traicionando. Los enteros positivos (módulo $p$) fueron el ejemplo primario (juego de palabras absolutamente intencional) de los [campos finitos](/es/blog/the-zk-chronicles/math-foundations/#finite-fields), una construcción que definimos justo al comienzo de la serie.

Como quizás recuerdes, un campo finito era un **conjunto** acoplado con **cuatro operaciones** en lugar de una sola. Un campo finito más o menos "funciona" como un grupo si solo tomamos en cuenta una operación, pero estaríamos haciendo trampa: la mayoría de las propiedades interesantes de los grupos se enfocan fuertemente en la garantía de que hay una sola forma válida de combinar dos elementos del grupo, descartando efectivamente otros **atajos**.

Eso le agrega aún más peso a nuestra pregunta: ¿cómo es que los enteros son un candidato válido siquiera? Bueno, consideremos qué pasa cuando **removemos el cero** del conjunto original:

$$
{\mathbb{Z}_p}^* = \{1,2,3,...,p-1\}
$$

Se siente como un cambio intrascendente, claro. Pero te pregunto lo siguiente:

::: big-quote
¿Podemos sumar dos elementos cualesquiera en este conjunto?
:::

Tómate un momento para considerar las opciones. Sumar dos elementos al azar parece plausible. $2 + 3$ sigue siendo $5$. Si nos pasamos de los límites, aplicamos la operación módulo, y seguimos bien.

¿Pero qué pasa cuando sumamos $1$ y $p - 1$? El resultado sería, por supuesto, cero. Pero... ¡**el cero ya no está en el conjunto**! Por esto, la suma **no califica como una operación válida** ahora. O, más formalmente, decimos que el conjunto **no es cerrado bajo la suma**.

La multiplicación es otra historia. Verás, todos los elementos del conjunto son menores que $p$. Y si $p$ es un número primo, entonces nunca puedes multiplicar dos elementos del conjunto para producir $p$, ¡porque eso significaría que $p$ **no es primo para empezar**!

> ¡Quizás tómate un momento para absorber esa información!

De hecho, ni siquiera se puede multiplicar dos elementos del conjunto para obtener cualquier múltiplo de $p$ (un número de la forma $k.p$). Estos son los únicos números que resultarían en $0$ una vez que aplicamos la operación módulo:

$$
k.p \ \textrm{mod} \ p = 0 \ / \ \forall k \in \mathbb{Z}
$$

En otras palabras, ¡**nunca podemos obtener cero** como resultado de multiplicar dos elementos del conjunto! Lo que significa que los enteros módulo $p$, cuando les quitamos el elemento cero, solo son cerrados bajo la multiplicación — ¡forman un **grupo multiplicativo**!

<figure>
	<img
		src="/images/the-zk-chronicles/groups/turn-the-lights.webp"
		alt="Meme de Turn The Lights Off"
		title="ooh-ooh"
	/>
</figure>

> También vale la pena mencionar que, si incluimos el cero de nuevo ($\mathbb{Z}_p$), tendríamos un problema con la multiplicación. El cero no tendría un inverso multiplicativo bien definido. Es decir, no puedes **deshacer** la multiplicación por $0$ porque $0 \times \text{lo que sea} = 0$!
>
> ¡Y esto descalifica a este conjunto como grupo!

De hecho, esta versión de los enteros se llama el [grupo multiplicativo de enteros módulo](https://en.wikipedia.org/wiki/Multiplicative_group_of_integers_modulo_n) $p$. Es extremadamente útil por varias razones, y también es tan simple como las cosas pueden ser.

El siguiente, aunque muy conocido, esconde mucha más complejidad.

---

## Curvas Elípticas {#elliptic-curves}

El otro grupo que es supremamente importante en criptografía es el que emerge de las **curvas elípticas**. Ya sabes, estos tipos:

<figure>
	<img
		src="/images/the-zk-chronicles/groups/elliptic-curve.webp"
		alt="Una curva elíptica" 
		title="[zoom] ¡Hola!"
	/>
</figure>

Lo que estamos viendo ahí arriba es una curva que satisface la siguiente expresión:

$$
E: y^2 = x^3 + ax + b
$$

Naturalmente, uno no puede evitar preguntarse **cómo diablos** construyes un grupo a partir de eso. A esa pregunta, hay dos respuestas que puedo ofrecer: la corta y pragmática con solo lo que necesitamos, o una revelación completa y extensa.

Te dejo decidir.

Si eliges quedarte en este artículo, cubriremos exactamente lo que necesitas para ZK: la estructura esencial y las propiedades. Ese es nuestro enfoque acá, nada más.

> Pero si quieres tomar la pastilla roja, ¡también puedo mostrarte [qué tan profunda es la madriguera del conejo](/es/reading-lists/elliptic-curves-in-depth/)!

<figure>
	<img
		src="/images/the-zk-chronicles/groups/pills.webp"
		alt="Escena de selección de pastillas de Matrix" 
		title="Qué pedazo de escena"
	/>
</figure>

### Construyendo El Grupo {#building-the-group}

La versión simple de la historia es bastante directa, en realidad: los elementos del grupo serán **puntos en la curva**. Para construir el grupo, sin embargo, necesitamos un mecanismo para **sumar puntos entre sí**.

Por lo tanto, daremos una definición algo artificiosa de lo que significa **sumar puntos en la curva**.

> Quiero enfatizar que esto puede sentirse un poco forzado porque no queremos explorar la teoría más profunda aquí, pero en realidad, ¡la operación tiene perfecto sentido!

La suma de dos puntos procede de la siguiente manera:

1. Primero, dibuja una línea que pase por los dos puntos que estamos intentando sumar, digamos, $P$ y $Q$.
2. Dicha línea intersectará la curva en otro punto más (¡porque las curvas elípticas tienen grado 3!).
3. Refleja este punto sobre el eje x. Como la curva es simétrica, la imagen espejo también caerá sobre la curva.
4. Has llegado a $R = P + Q$.
5. ¡Profit!

El proceso completo se ve así:

<figure>
	<img
		src="/images/the-zk-chronicles/groups/point-addition.webp"
		alt="Suma de puntos en una curva elíptica"
		title="[zoom]" 
	/>
</figure>

Por supuesto, hay algunos **casos especiales**. Por ejemplo, ¿cómo sumas $P$ consigo **mismo**? ¿O cómo sumas $P$ y $-P$ (su imagen espejo), cuando la línea vertical que pasa por ellos no intersecta la curva una tercera vez?

La primera situación se resuelve usando la tangente de la curva en $P$ en el primer paso. La segunda, sin embargo, demanda un poco más de creatividad. ¡Pero eso lo dejaremos para otra ocasión!

Por último, debemos entender que estas curvas **no son continuas**. Las imágenes que acabamos de ver son meramente ilustrativas, porque en criptografía, siempre necesitamos operar en un mundo **discreto** y **preciso**. Por lo tanto, las curvas elípticas "verdaderas" que vamos a estar usando en todas nuestras construcciones en realidad se ven así:

<figure>
	<img
		src="/images/the-zk-chronicles/groups/elliptic-curve-group.webp"
		alt="Un grupo de curva elíptica" 
		title="[zoom]"
	/>
</figure>

Tranquilo. Si elegiste el camino pragmático, la buena noticia es que no necesitamos preocuparnos demasiado por los detalles finos de cómo funciona la suma de puntos en curvas elípticas.

> Aunque, si tienes curiosidad, puedes darle un vistazo al tema [aquí](/es/blog/elliptic-curves-in-depth/part-1/#defining-operations).

Todo lo que necesitamos saber es que estos puntos sí tienen una estructura de grupo, inducida por la operación que acabamos de definir.

Y con eso en mente, podemos enfocarnos en lo que nos importa hoy: las propiedades de los grupos.

---

## Propiedades {#properties}

A decir verdad, no fui muy preciso antes. Para que un grupo sea un grupo, necesitamos un poco más que solo un conjunto y una operación: estos dos componentes necesitan seguir un cierto **conjunto de reglas** (o tener algunas propiedades particulares).

Para que un grupo sea un grupo entonces, requerimos que tenga algunos **elementos especiales**, y también necesitamos que la operación (que denotaremos $\oplus$ por ahora) se **comporte de cierta manera**.

Hablemos primero de la operación, que tiene **dos requisitos simples**, uno de los cuales ya conoces:

- **Clausura:** Para cualesquiera dos elementos $a$ y $b$ en el grupo, el resultado de combinarlos $(a \oplus b)$ también debe estar en el grupo.
- **Asociatividad:** Cómo agrupemos las operaciones secuenciales es irrelevante. Es decir, $(a \oplus b) \oplus c = a \oplus (b \oplus c)$.

¡Eso es todo!

<figure>
	<img
		src="/images/the-zk-chronicles/groups/homelander.webp"
		alt="Homelander feliz" 
		title="¡Oh, genial!"
	/>
</figure>

> Nótese que no requerimos que la conmutatividad ($a \cdot b = b \cdot a$) se cumpla. Los grupos donde la conmutatividad también se cumple se llaman [grupos abelianos](https://en.wikipedia.org/wiki/Abelian_group).

Lo otro de lo que necesitamos hablar son un par de requisitos para los elementos del grupo, que son nuevamente bastante simples:

- **Elemento identidad:** Debe existir un elemento especial $e$ donde $a \oplus e = e \oplus a = a$ para cualquier elemento $a$.
- **Inversos:** Para todo elemento $a$, existe otro elemento $b$ tal que $a \oplus b = b\oplus a = e$ (la identidad).

> Es bastante obvio cuáles son estos elementos en $\mathbb{Z}_p$. ¿Pero puedes adivinar cuáles son en los [grupos de curvas elípticas](/es/blog/elliptic-curves-in-depth/part-1/#an-edge-case)?

Cuando trabajamos con grupos, automáticamente obtenemos todas estas garantías, y esto tiene algunas consecuencias interesantes.

### Generadores de Grupo {#group-generators}

Ahora, algunos grupos tienen una propiedad especial: al seleccionar un solo elemento, y aplicar la operación del grupo repetidamente **sobre sí mismo**, puedes recuperar el **grupo entero**, eventualmente ciclando de vuelta a donde empezaste.

<figure>
	<img
		src="/images/the-zk-chronicles/groups/cyclic-group.webp"
		title="[zoom] Un pequeño grupo cíclico de 4 elementos con generador G"
	/>
</figure>

Afortunadamente, los matemáticos fueron bastante descriptivos con las convenciones de nomenclatura que eligieron para los siguientes conceptos: el elemento "semilla" (en este caso, $G$) se llama el **generador**, y produce un **grupo cíclico** (generado por $G$).

> Para hacer la notación un poco más concisa, generalmente usamos $G^k$ para representar "aplica la operación del grupo $k$ veces a $G$".

Ahora, no todo elemento en un grupo es un generador.

Tomemos por ejemplo $\mathbb{Z}_7$ (grupo multiplicativo), y empecemos con el elemento $G_1 = 3$. Si haces las cuentas (recuerda aplicar la operación módulo), verás que parece funcionar, ya que obtenemos la secuencia $3 \rightarrow 2 \rightarrow 6 \rightarrow 4 \rightarrow 5 \rightarrow 1 \rightarrow 3$, así que $G_1 = 3$ es efectivamente un generador. Sin embargo, $G_2 = 2$ se queda atrapado en un ciclo más pequeño: $2 \rightarrow 4 \rightarrow 1 \rightarrow 2$.

Si bien no somos capaces de generar el grupo completo, sí generamos algo: un grupo más pequeño, **incluido** en el original. Esto es lo que llamamos un **subgrupo cíclico**.

> También decimos que el **orden** del generador (y del subgrupo generado) es la cantidad de veces que necesitamos aplicar la operación para volver al elemento identidad.

Simple, ¿no?

Probablemente seríamos perdonados por pensar que los grupos cíclicos son solo definiciones matemáticas elegantes que pertenecen a un estante, pero de hecho son la **clave** para construir sistemas criptográficos.

### El Problema del Logaritmo Discreto {#the-discrete-logarithm-problem}

Imagina que tenemos un grupo cíclico $\mathbb{G}$, generado por algún elemento $G$, que usualmente se denota:

$$
\mathbb{G} = \langle G \rangle
$$

Ahora, imagina que queremos calcular $G^k$. Calcular este valor en el grupo de enteros módulo $p$ es súper simple: podemos usar las reglas estándar de exponenciación.

> Imagina esto: si quieres calcular $G^8$, primero calculas $G^2$, luego elevas al cuadrado ese valor para obtener $G^4$, ¡y luego elevas al cuadrado otra vez para llegar al resultado final! ¡Un total de **tres** operaciones en lugar de **siete**!

Lo mismo puede decirse de los grupos de curvas elípticas: hay algoritmos rápidos (estilo elevar-al-cuadrado-y-sumar) para aplicar la operación del grupo $k$ veces.

Ningún problema hasta ahora. ¿Pero qué pasa con la **otra dirección**? ¿Qué tal si nos piden encontrar cuántas veces se aplicó la operación del grupo para llegar a un resultado dado $H$?

$$
G^k = H
$$

Naturalmente, $k$ se llama el **logaritmo discreto** de $H$. Y contrariamente a lo que podríamos esperar de nuestra experiencia calculando logaritmos en contextos continuos, encontrar $k$ en esta situación puede ser **extremadamente difícil**.

La razón de esta asimetría tiene que ver con la naturaleza "saltarina" de los grupos finitos: debido a su comportamiento cíclico, no obtenemos valores cada vez más grandes al aplicar repetidamente la operación del grupo, sino que ciclamos **de vuelta al inicio múltiples veces** a lo largo del proceso.

> Toma $\mathbb{Z}_7$ como ejemplo. ¡El resultado de $3^2$ no es $9$ — es en realidad $2$!

Lo que también significa que **no hay una receta estándar** para encontrar un logaritmo discreto. Lo mejor que puedes hacer en circunstancias normales es **prueba y error**, y dependiendo del **orden** del generador, esto puede ser relativamente fácil o **absurdamente difícil** (para grupos más grandes).

Esto se conoce como el **Problema del Logaritmo Discreto**, o DLP por sus siglas en inglés. Desde un punto de vista criptográfico, esto es **súper atractivo**, ya que usualmente estamos interesados en este tipo de problemas que son imposiblemente difíciles de revertir para proteger información sensible.

> ¡Tanto así, que una buena porción de la criptografía moderna se basa en la dificultad de este problema. ¡Varias técnicas de intercambio de claves, firmas y encriptación dependen de esta única suposición!

Los subgrupos cíclicos y el DLP son incuestionablemente importantes, pero hay **un tipo particular** de grupo cíclico en el que necesitamos enfocarnos, por lo crucial que es para los sistemas ZK.

Sin estos elementos especiales, muchos algoritmos y protocolos simplemente no funcionarían.

> O al menos, no serían **rápidos**, lo que también los haría **imprácticos**.

Hablemos de ellos.

### Raíces de la Unidad {#roots-of-unity}

Aquí va la definición cruda: una **raíz n-ésima de la unidad** es un elemento $\omega$ tal que cuando aplicas la operación del grupo $n$ veces, vuelves a la identidad:

$$
\omega^n = e
$$

> Para ser completamente transparente aquí, el concepto de una raíz n-ésima de la unidad **no es exclusivo de los grupos**.
>
> ¡Tomemos por ejemplo los números complejos! Son un campo completo, ¡y sin embargo la unidad imaginaria $i$ es una raíz cuarta de la unidad!

Cualquier potencia entera de una raíz de la unidad es también una raíz de la unidad, porque podemos descomponerlas así:

$$
(\omega^k)^n = \omega^{k.n} = (\omega^n)^k = e^k = e
$$

> Algunas raíces n-ésimas de la unidad son especiales en el sentido de que pueden generar todas las demás raíces n-ésimas de la unidad. ¡Estas se llaman raíces n-ésimas de la unidad **primitivas**!

Curiosamente, las raíces de la unidad también existen en **campos finitos**. Probablemente ya notaste esto por todo lo que hemos recorrido hasta ahora, pero todo campo finito (primo) se convierte en un grupo multiplicativo cuando le quitamos el elemento $0$. Y tal grupo tiene **generadores** y posiblemente incluso **subgrupos cíclicos** — ¡las raíces de la unidad para el campo primo!

Ok... ¿Y? Linda historia, hermano, pero ¿por qué son útiles las raíces de la unidad?

<figure>
	<img
		src="/images/the-zk-chronicles/groups/judge-judy.webp"
		alt="Judge Judy con los ojos en blanco" 
		title="Otra vez tú con las definiciones raras..."
	/>
</figure>

Una razón: la **Transformada Rápida de Fourier**, o **FFT** por sus siglas en inglés.

No vamos a sumergirnos en los detalles ahora, pero sin FFT, la mayoría de las técnicas que exploraremos más adelante serían inútiles. Y coincidentemente, FFT explota la **estructura especial** de las raíces de la unidad para proveernos de una forma muy rápida de interpolar polinomios.

### Equivalencia de Grupos {#group-equivalence}

Antes de irnos, hay un pequeño detalle más que me gustaría mencionar. Es solo un truco que puede que necesitemos usar en el futuro para facilitarnos la vida.

Como ya hemos dicho, cada grupo viene equipado con su propia operación binaria. Esta operación puede ser de naturalezas muy distintas: a veces, es tan simple como la suma y la multiplicación, pero hay ejemplos más complejos como las operaciones que vimos para las curvas elípticas.

> Hay incluso ejemplos más abstractos, como la operación de grupo del grupo usado para modelar un [cubo de Rubik](https://en.wikipedia.org/wiki/Rubik%27s_Cube_group).

Usar dicha operación puede hacer que el tratamiento matemático de algunas pruebas sea bastante engorroso.

Sin embargo, puede que hayas notado que nuestro enfoque hoy no ha sido en los detalles específicos de cada operación de grupo, sino en las propiedades de los grupos en general. Incluso sugerí que usemos la notación exponencial $G^k$ incluso cuando no estamos lidiando con grupos multiplicativos. Y eso no es coincidencia, realmente: hay algo más profundo sucediendo aquí.

La razón es que incluso cuando dos grupos pueden verse completamente diferentes a primera vista, pueden comportarse **exactamente de la misma manera**.

> Por ejemplo, toma $\{0, 1\}$ bajo la suma módulo 2, y $\{1, 2\}$ bajo la multiplicación módulo 3. Claramente tienen elementos diferentes, y operaciones diferentes.
>
> Pero ahora, mapea $0 \rightarrow 1$ y $1 \rightarrow 2$. De repente, cada operación en el primer grupo tiene una **correspondencia perfecta** en el segundo: $0 + 0 = 0$ corresponde a $1 \times 1 = 1$, $0 + 1 = 1$ corresponde a $1 \times 2 = 2$, $1 + 1 = 0$ corresponde a $2 \times 2 = 1$.
>
> ¡Son **el mismo grupo**, solo que con etiquetas diferentes!

Efectivamente, dos grupos pueden compartir la **misma estructura**. Sin entrar en mucho detalle, lo que esto significa es que podemos encontrar una **correspondencia uno a uno** (una [biyección](https://en.wikipedia.org/wiki/Bijection)) entre los elementos del primer grupo y los del segundo, y que la operación del grupo esencialmente se comporta exactamente igual en ambos grupos.

Cuando esto sucede, decimos que los grupos son **isomórficos**.

> Un isomorfismo es en realidad una versión más restringida de un **homomorfismo**, ¡que solo requiere que la operación se comporte igual, pero no la correspondencia uno a uno!

Como consecuencia, cuando nos presentan un grupo con una operación compleja, podemos hacer algo muy astuto para simplificar el trabajo: encontrar un **isomorfismo conveniente**.

Y aquí, simplemente dejaré caer un par de hechos para facilitarnos la vida. Primero:

> Todo grupo cíclico de orden $n$ es isomórfico al grupo aditivo de enteros módulo $n$.
>
> En cierto sentido, ¡esto solo está diciendo que siempre hay un **orden natural** para los elementos de cualquier grupo cíclico!

En segundo lugar, para cualquier grupo cíclico, siempre podemos encontrar **algún** grupo multiplicativo al cual es isomórfico. La construcción no es tan limpia como el caso aditivo: necesitamos buscar en grupos multiplicativos de campos cuidadosamente elegidos, o considerar subgrupos. ¡Pero el punto es que tal grupo **siempre existe**!

Puede sonar como un simple detalle técnico, pero esa es realmente la razón por la cual siempre podemos usar la notación exponencial: porque siempre podemos aprovechar ese isomorfismo hacia un grupo multiplicativo simple.

¿Qué tan genial es eso?

---

## Resumen {#summary}

¡Muy bien, eso fue probablemente más que suficiente para un solo artículo!

Los grupos son **la** columna vertebral matemática de la criptografía moderna.

> Aunque, esto puede cambiar pronto con el advenimiento de la [criptografía post-cuántica](/es/blog/cryptography-101/post-quantum-cryptography).

Su estructura está detrás de la seguridad de una gran cantidad de técnicas que existen, y también mencionamos cómo habilitan algunas optimizaciones cruciales, ya que son un prerrequisito para FFT.

Con esto, nos estamos acercando a terminar con los conceptos fundamentales que necesitaremos a lo largo de nuestro viaje. Aunque todavía nos faltan un par de conceptos (te estoy mirando a ti, pairings), estamos mayormente cubiertos.

Todo lo que queda es empezar a construir gadgets y técnicas más complejas con nuestros nuevos juguetes, a medida que empezamos a abrirnos camino hacia protocolos más sofisticados, y más cerca del terreno ZK.

¡No perdamos tiempo entonces! En la próxima entrega, hablaremos de [esquemas de compromiso](/es/blog/the-zk-chronicles/commitment-schemes-part-1), y veremos cómo podemos empezar a construir cosas interesantes a partir de los grupos.

¡Nos vemos pronto!
