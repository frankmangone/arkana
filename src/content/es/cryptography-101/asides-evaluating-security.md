---
title: 'Criptografía 101 (Anexo): Evaluando la Seguridad'
date: '2024-05-13'
author: frank-mangone
thumbnail: /images/cryptography-101/asides-evaluating-security/arnold-handshake.webp
tags:
  - cryptography
  - cryptanalysis
  - security
description: Breve resumen de algunos aspectos importantes de la seguridad en criptografía
readingTime: 8 min
contentHash: 962b521ed0592c90bb0ada8b4a16ec8357bab6623e251f3f0b521a7effb4b432
supabaseId: 77ba3dd5-79c2-4d4f-9b08-8872c57fc44e
---

> Este artículo forma parte de una serie más larga sobre criptografía. Si este es el primer artículo con el que te encuentras, te recomiendo comenzar desde el [principio de la serie](/es/blog/cryptography-101/where-to-start).

A lo largo de nuestro viaje, nuestro objetivo siempre ha sido tratar de entender los **fundamentos matemáticos** que sostienen la criptografía moderna. Es una tarea importante en sí misma — la criptografía consiste en crear **acertijos realmente difíciles**, después de todo. No hay creación si no podemos entender las herramientas involucradas.

Y aunque todavía hay mucho por explorar en cuanto al diseño de protocolos criptográficos, creo que ahora es un buen momento para tomar otro pequeño desvío y cambiar nuestro enfoque hacia un aspecto que aún no hemos discutido. Intentemos responder las siguientes preguntas:

::: big-quote
¿Qué tan seguros son los métodos que hemos aprendido hasta ahora?
:::

::: big-quote
¿Qué entendemos por seguridad?
:::

::: big-quote
¿Cómo se mide?
:::

La mejor manera de responder a esto, en mi humilde opinión, es hacer un **viaje rápido** a través de la **historia** de la criptografía. Al hacer esto, nos encontraremos con algunos problemas que pueden poner en peligro la utilidad de nuestros métodos desde el principio, mientras que otros se volverán más claros lentamente.

Y para empezar, volvamos al **principio**.

---

## El Cifrado César {#the-caesar-cipher}

La idea de proteger datos en las comunicaciones ciertamente no es nueva.

Existen registros de intentos de ocultar mensajes secretos en civilizaciones antiguas. Un ejemplo famoso, y uno de los primeros usos registrados de técnicas criptográficas, es el [cifrado César](https://en.wikipedia.org/wiki/Caesar_cipher), que data del año 100 a.C. Es una técnica muy simple: cada letra del alfabeto se **desplaza** un número determinado de posiciones. Por lo tanto, se categoriza como un [cifrado por sustitución](https://en.wikipedia.org/wiki/Substitution_cipher), porque cada letra se sustituye por otra, siguiendo un conjunto específico de reglas.

<figure>
  <img
    src="/images/cryptography-101/asides-evaluating-security/caesar-cipher.webp" 
    alt="Una imagen del desplazamiento que ocurre en el Cifrado César"
    title="[zoom] Los caracteres originales se mapean a nuevos, mediante desplazamiento"
    className="bg-white"
  />
</figure>

Siempre que sepas cuántas **posiciones** se desplazan los caracteres, entonces puedes descifrar mensajes cifrados con esta técnica. Por ejemplo, si el desplazamiento fue de $+3$ letras (como en la imagen de arriba), entonces el texto cifrado "khooraruog" puede mapearse de vuelta al texto original "helloworld". Por supuesto, podríamos agregar caracteres especiales, pero mantengámonos en el método original y simple.

Todo iba bien hasta que un tipo llamado Al-Kindi llegó y descifró el código, explotando una **falla fatal**. ¿Puedes adivinar cuál es?

> Para ser justos, pasaron casi mil años antes de que alguien propusiera esta explotación, ¡así que no te preocupes demasiado si no la detectaste!

<figure>
  <img
    src="/images/cryptography-101/asides-evaluating-security/collective-failure.webp" 
    alt="Meme del bebé exitoso"
    title="Contaré el fracaso colectivo como éxito personal"
  />
</figure>

### La Explotación {#the-exploit}

En cualquier idioma, algunas letras aparecen con **mayor frecuencia** que otras. Si analizamos esas frecuencias en una gran cantidad de texto, emergerá una **distribución**. Para el inglés, esa distribución se ve **aproximadamente** así:

<figure>
  <img
    src="/images/cryptography-101/asides-evaluating-security/frequency.webp" 
    alt="Gráfico que muestra las frecuencias de aparición de las letras en textos en inglés, siendo E la más predominante"
    title="[zoom] Frecuencia de aparición de letras en textos en inglés"
    className="bg-white"
  />
</figure>

¿Qué podemos hacer con esta información, te preguntas? Bueno, si el mensaje resulta ser **algún texto en inglés**, entonces podemos **verificar las frecuencias** de las letras en nuestro mensaje cifrado. ¡Y es probable que la letra que aparece con más frecuencia sea la versión cifrada de la letra $E$!

Pensemos en esto por un minuto: por ejemplo, si la letra $E$ se cifra como la letra $P$, entonces es probable que $P$ aparezca con frecuencia. Y las probabilidades de que esto suceda aumentan a medida que el texto se alarga, porque las letras comienzan a repetirse.

Esto se llama [análisis de frecuencia](https://en.wikipedia.org/wiki/Frequency_analysis). Y el problema realmente se reduce a tener una **distribución no uniforme** asociada con nuestro texto cifrado.

> No recuerdo si he mencionado esto antes, pero **texto cifrado** (ciphertext) es una forma en que llamamos a la salida de un proceso de cifrado, y la entrada a menudo se llama **texto plano** (plaintext).

En consecuencia, esto significa que podemos inferir cierta información solo mirando los datos cifrados. Y eso es algo que **nunca** deberíamos poder hacer. En el caso de un método de sustitución "ideal", esto significaría que cada carácter es **igualmente probable** que aparezca en el texto cifrado, lo cual no es el caso en el cifrado César.

En resumen, la gran idea aquí es la siguiente:

::: big-quote
No deberíamos poder aprender nada de los datos cifrados mirando el texto cifrado.
:::

Y esta es una de las grandes razones por las que la mayoría de las técnicas que hemos visto hasta ahora introducen algún tipo de **aleatoriedad** en la mezcla: para hacer que las cosas sean **indistinguibles** de datos aleatorios. Esto significa que las posibilidades de que aparezca cualquier caracter en el texto cifrado son casi las mismas, es decir, en términos probabilísticos, que la distribución de caracteres es (casi) **uniforme**:

<figure>
  <img
    src="/images/cryptography-101/asides-evaluating-security/uniform.webp" 
    alt="Una distribución uniforme"
    title="[zoom] Una distribución de probabilidad uniforme para caracteres en texto cifrado"
    className="bg-white"
  />
</figure>

Garantizado: si no se cumple esta condición, entonces es muy probable que un método **no sea seguro**, ya que esto abre la puerta para análisis basados en la **distribución** del texto cifrado. Nos hemos topado con un **requisito de seguridad** al diseñar métodos criptográficos.

---

## Tamaños de Clave {#key-sizes}

La seguridad está en parte relacionada con la ausencia de estas **puertas traseras** o **vectores de ataque** que pueden comprometer nuestros esfuerzos para proteger datos, como el ejemplo presentado anteriormente. Por supuesto, existen otros tipos de ataques, como [ataques de texto plano elegido](https://en.wikipedia.org/wiki/Chosen-plaintext_attack), [ataques de canal lateral](https://en.wikipedia.org/wiki/Side-channel_attack), entre otros.

Y es muy importante escrutar cuidadosamente cada aspecto de nuestros métodos, ya que incluso la más mínima vulnerabilidad puede romper todo el sistema. Como mencioné en el artículo sobre [hashing](/es/blog/cryptography-101/hashing/#the-weakest-link), y repito ahora:

::: big-quote
Una cadena es tan fuerte como su eslabón más débil
:::

Aun así, supongamos que hemos hecho nuestra tarea y estamos bastante seguros de que nuestra técnica es muy sólida y no tiene puertas traseras obvias. **¿De qué más** deberíamos preocuparnos?

**Fuerza bruta**, ¡eso es!

<figure>
  <img
    src="/images/cryptography-101/asides-evaluating-security/arnold-handshake.webp" 
    alt="Escena del apretón de manos de Depredador"
    title="Hora de flexionar algo de poder de cómputo"
    width="550"
  />
</figure>

La pregunta es simple: ¿qué tan fácil sería romper un método criptográfico solo por **prueba y error**? Hablé brevemente sobre esto en un [artículo anterior](/es/blog/cryptography-101/encryption-and-digital-signatures/#key-pairs), pero ahora tratemos de cuantificar esta tarea.

En términos generales, hay dos ingredientes esenciales para este asunto:

- El tamaño de la estructura matemática subyacente
- La **complejidad** computacional de las operaciones involucradas en nuestro problema

Por ejemplo, en la [Criptografía de Curva Elíptica](/es/blog/cryptography-101/elliptic-curves-somewhat-demystified) (ECC), esto significa que nos preocupamos por qué tan grande es el **grupo de curva elíptica**, y también nos preocupamos por cuánto **esfuerzo computacional** se requiere para probar valores uno por uno.

### Tamaños de Clave RSA {#rsa-key-sizes}

En lugar de centrarnos en ECC, comencemos analizando [RSA](/es/blog/cryptography-101/asides-rsa-explained). Repaso rápido: RSA se basa en el hecho de que es difícil encontrar los dos factores primos de un número dado $n = p.q$.

Comencemos con algo pequeño. Digamos que $p$ y $q$ tienen como máximo $1$ byte ($8$ bits) de longitud. Esto significa que $n = p.q$ tiene como máximo $2$ bytes de longitud. ¿Qué tan difícil sería encontrar sus factores primos?

Por supuesto, esto sería **realmente fácil**. Puedes probarlo tú mismo con un script rápido. Para que esto sea difícil — y por lo tanto útil para la criptografía —, necesitamos que $p$ y $q$ sean mucho más grandes. Y a medida que usamos números más grandes, la factorización se vuelve **exponencialmente más difícil**.

En los primeros días de RSA, se creía que usar claves ($p$ y $q$) que tuvieran como máximo $512$ bits de longitud haría que el esquema de cifrado fuera seguro. Pero el **poder computacional** solo ha aumentado en las últimas décadas, haciendo posible resolver el problema de factorización para claves de 512 bits en cuestión de **días** o incluso [horas](https://arstechnica.com/information-technology/2015/10/breaking-512-bit-rsa-with-amazon-ec2-is-a-cinch-so-why-all-the-weak-keys/). Eso no suena muy seguro...

<figure>
  <img
    src="/images/cryptography-101/asides-evaluating-security/not-secure.webp" 
    alt="Una cadena sostenida por un sello de plástico"
    width="500"
  />
</figure>

¿Qué hacer entonces? Bueno, **aumentar los tamaños de clave**, ¡por supuesto! Y así, hoy en día la recomendación es usar claves de 2048 bits. Se piensa que con la potencia de cálculo disponible actualmente, todavía tomaría un tiempo **monstruosamente largo** resolver el problema de factorización con estos tamaños de clave. Pero eso podría cambiar en el futuro, a medida que las computadoras se vuelvan más potentes.

> La [computación cuántica](/es/blog/wtf-is/quantum-computing) parece estar a la vuelta de la esquina... Así que quién sabe.

### Tamaños de Clave ECC {#ecc-key-sizes}

En comparación, veamos qué sucede cuando trabajamos con curvas elípticas. Mencionamos cómo multiplicar un punto $G$ por algún número $m$ involucraba [algunos pasos](/es/blog/cryptography-101/elliptic-curves-somewhat-demystified/#point-doubling). Y eso es muy importante, porque el algoritmo de doble y suma debe ejecutarse cada vez que probamos un número $m$ para verificar que resuelve el **problema del logaritmo discreto**:

$$
Y = [m]G
$$

Es decir, la fuerza bruta es mucho más **costosa computacionalmente** que simplemente multiplicar dos números, como es el caso de RSA — nuestra estructura subyacente es **más compleja**. Y a su vez, esto significa que podemos lograr el mismo nivel de seguridad con **tamaños de clave más pequeños**. Por ejemplo, una clave de 256 bits en ECC es aproximadamente equivalente en seguridad a una clave de 3072 bits en RSA.

### ¿Importa el Tamaño de la Clave? {#does-key-size-matter}

¡Ah, gran pregunta! Hay un par de cosas a considerar aquí.

En general, cuanto más grandes sean tus claves, más costosos se vuelven tus cálculos. No es lo mismo calcular $[10]G$ y $[1829788476189461]G$, ¿verdad? Y así, si bien sabemos que aumentar el tamaño de la clave es bueno para la seguridad, definitivamente **no es bueno** para la **velocidad**. Por lo tanto, tamaños de clave más grandes **no siempre son mejores**.

<figure>
  <img
    src="/images/cryptography-101/asides-evaluating-security/key-size.webp" 
    alt="meme de tamaño de clave"
    title="Solo para aclarar, estamos hablando de tamaños de clave aquí"
    width="550"
  />
</figure>

Elegir el tamaño de clave correcto es realmente un **acto de equilibrio**. Depende de lo que valoremos más: velocidad, seguridad, o un punto medio entre ambos.

Si no nos importa demasiado la velocidad y necesitamos que nuestros métodos sean muy seguros, entonces se requieren claves más grandes. Pero podemos requerir algoritmos más rápidos, y así reducir los tamaños de clave puede ser una opción.

---

## Resumen {#summary}

Este breve artículo recorre rápidamente algunos de los aspectos más importantes relacionados con la seguridad. En realidad, este tipo de análisis pertenece a una rama completa por sí misma: el [criptoanálisis](https://en.wikipedia.org/wiki/Cryptanalysis), que es una especie de hermano de la criptografía. Sería casi de mal gusto que dijera que este es un artículo de criptoanálisis; más bien, es una introducción muy suave a algunas de las ideas detrás de la disciplina.

Sin embargo, una cosa está clara: diseñar métodos criptográficos es tan importante como **entender cómo romperlos**. Omitir este análisis nos deja en riesgo de crear un sistema defectuoso, que en última instancia no cubre las garantías de seguridad que podríamos estar ofreciendo a nuestros clientes, y eso no es bueno.

> Intencionalmente omití introducir la idea de un **parámetro de seguridad**, solo para mantener las cosas simples. Es posible que veas esto en artículos o discusiones técnicas, por lo que quizás quieras [leer al respecto](https://en.wikipedia.org/wiki/Security_parameter) como una generalización de algunos de los conceptos discutidos anteriormente.

Con esto, al menos tenemos una idea general de algunas posibles debilidades en nuestros métodos, aunque hay mucho más que cubrir en esta área. ¡Solo ten siempre en cuenta que la seguridad no está asociada con **cuán elegantes son las matemáticas**. Elegancia no equivale a seguridad, ¡y un análisis cuidadoso siempre es una buena práctica!
