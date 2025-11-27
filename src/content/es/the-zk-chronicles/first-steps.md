---
title: 'Las Crónicas de ZK: Primeros Pasos'
author: frank-mangone
date: '2025-11-10'
thumbnail: /images/the-zk-chronicles/first-steps/0*bcbfQCO0n1pbsyXD-1.jpg
tags:
  - zeroKnowledgeProofs
  - verifiableComputing
description: Emprendemos un nuevo viaje dedicado exclusivamente a la tecnología ZK
readingTime: 10 min
contentHash: 9b5a6fb90961a132e3d67de29f8f5ad128c3f8aa5060bd838e22ddde1c869bac
supabaseId: 4b178afc-78df-4fa3-ae32-8f9adfcbddef
---

Hace bastante tiempo que vengo dándole vueltas a la idea de empezar esta serie.

Esta historia empieza hace unos meses, mientras tenía una conversación con un colega en una conferencia. En un cierto momento, nos pusimos a hablar sobre pruebas de conocimiento cero (ZK proofs), y particularmente, sobre dónde aprender sobre ellas.

Se mencionó material muy bueno: por ejemplo, el [Rareskills Book of Zero Knowledge](https://rareskills.io/zk-book), y el [ZK-DL Camp by Distributed Labs](https://zkdl-camp.github.io/).

> Excelentes recursos, por cierto. ¡Siéntete libre de echarles un vistazo!

Pero mi colega hizo especial énfasis en un cierto libro: ["Proofs, Arguments, and Zero Knowledge" de Justin Thaler](https://people.cs.georgetown.edu/jthaler/ProofsArgsAndZK.pdf).

Supongo que estaba de ánimo para un desafío en ese momento, así que compré el libro online al día siguiente, y me puse a leerlo apenas me llegó a casa.

Y... Wow. Pensé que iba a ser fácil, ya que tenía conocimiento previo sobre el tema. De más está decir que estaba muy, muy equivocado.

Quedó claro de inmediato que había muchas cosas que todavía me quedaban por aprender. No me faltaron esos momentos de **¡ajá!** durante la lectura, y me encontré muchas veces pensando en cómo **me hubiera encantado** que me presentaran ciertos conceptos antes en mi camino.

Eso es lo que me motiva a escribir esta serie: intentar guiarte por este tema maravilloso de la forma en que me hubiera gustado que me lo enseñaran cuando lo aprendí por primera vez.

Antes de empezar, un pequeño aviso: **no va a ser fácil**. Es un tema desafiante, después de todo. Pero bueno, ¡intentemos mantenerlo lo más divertido y liviano posible!

¡Muy bien! Supongo que la primera pregunta que debemos responder es **¿en qué nos estamos metiendo exactamente?** Así que antes de saltar a las matemáticas complicadas, empecemos mirando algunos conceptos clave.

---

## Estableciendo Expectativas {#setting-expectations}

Voy a empezar afirmando que la idea misma de conocimiento cero es, en partes iguales, **confusa** y **engañosa**.

Es confusa en el sentido de que su **definición simple** es bastante desconcertante por sí sola. Toma, mira por ti mismo:

::: big-quote
Probar algo en conocimiento cero significa que convencemos a alguien de la veracidad de una afirmación, sin revelar ninguna información más allá de la veracidad de dicha afirmación.
:::

O sea... **¿Qué?**

<figure>
	<img
		src="/images/the-zk-chronicles/first-steps/0*bcbfQCO0n1pbsyXD-1.jpg"
		alt="Ken Jeong entrecerrando los ojos mirando un pequeño papel" 
	/>
</figure>

Vamos a tener mucho tiempo para desentrañar eso, pero veamos un par de ejemplos rápidos. Imagina:

- Probarle al guardia de seguridad en la entrada de un bar que eres mayor de 21 años, sin darle tu identificación. Suena bastante mágico — ¿cómo harías esto sin realmente mostrarles tu documento de identidad y revelar tu fecha de nacimiento? Y además, ¡otra información que no necesitan saber, como tu nombre o tu país de nacimiento!
- En la misma línea, imagina que puedes probar que eres miembro de un grupo selecto, ganando así acceso al VIP del bar — pero, de nuevo, sin mostrar tu identificación.
- Una vez ahí, vas a la barra, y puedes probarle al bartender que tienes algunos vouchers gratis a tu nombre, una vez más sin revelar tu identidad.

Estos ejemplos son un poco extremos, pero ayudan a conceptualizar lo que buscamos: **privacidad**. Protección de **datos sensibles**, mientras los usamos para **probar cosas** sobre ellos.

Aún así, se siente raro, ¿no? O sea, **¿cómo carajo haríamos eso?**

Ya vamos a llegar a eso, lo prometo. A través de algunas matemáticas raras, pero vamos a llegar.

> Hay otros ejemplos clásicos que vas a encontrar por ahí que pueden ayudar a cimentar las ideas centrales. En particular, este video me gusta mucho — ¡espero que te sirva!

<video-embed src="https://www.youtube.com/watch?v=fOGdb1CTu5c" />

---

## La Parte Engañosa {#the-misleading-bit}

Mi segunda afirmación tiene que ver con el hecho de que el conocimiento cero en sí no es realmente una familia de métodos criptográficos, sino más bien una **propiedad**.

¿Una propiedad de qué?, podrías preguntar. Bueno... No quiero arruinar la sorpresa todavía.

En cambio, quiero que hablemos de una idea poderosa, donde el conocimiento cero va a encajar perfectamente más adelante.

### Verificando Cálculos {#checking-computations}

Acá va una pregunta para ti: ¿cómo sabes que un cálculo fue **realizado correctamente**?

Al principio, puede sonar como una pregunta tonta. Digo, supongamos que escribimos algún programa. Cuando lo ejecutamos (incluso si tiene bugs), vamos a obtener alguna salida, que es la **salida correcta** para ese programa en particular. Entonces, ¿por qué nos preguntaríamos sobre la **ejecución correcta**?

Está bien, subámosle la dificultad. Supongamos que nuestra tarea es implementar algún algoritmo complejo.

> ¡Elige tu favorito! El algoritmo de Dijkstra, FFT, multiplicación de matrices... Lo que más te guste.

Ahora **sí nos importan** los bugs. Una implementación defectuosa va a llevar a resultados incorrectos, incluso si el resultado sí corresponde al programa ejecutado.

Sería genial para nosotros tener alguna forma de **sondear** nuestro programa para determinar si funciona correctamente — y eso es usualmente lo que es el **testing**. Podemos inferir si nuestro programa tiene bugs o no verificando si maneja correctamente algunos casos conocidos, simplemente mirando el **resultado** de dicho cálculo.

Nota que en ambos escenarios, **somos nosotros** quienes estamos ejecutando el programa.

<figure>
	<img
		width="500"
		src="/images/the-zk-chronicles/first-steps/1*tKfD7-ClozJG0045AYvMWQ-2.png"
		alt="Un niño con una expresión tediosa"
		title="Bueno, obvio"
	/>
</figure>

Lo sé, puede parecer algo obvio de decir al principio. Pero ahora imagina que tienes que ejecutar algún **programa gigante** — algo como entrenar un Modelo de Lenguaje Grande (LLM), o ejecutar una simulación de física súper compleja, o incluso resolver un [sudoku enorme](https://en.wikipedia.org/wiki/Generalized_game).

A menos que tengas una computadora muy poderosa (o al menos, una mejor que la tostadora que estoy usando para escribir esto), lo más probable es que evites ejecutar esas cosas, porque te tomaría **una eternidad** llegar a una solución.

¿Ves hacia dónde voy? Puede que tú no puedas ejecutar estos programas, pero **alguien más sí podría**, y simplemente podrían **darte el resultado**.

Entonces ahora, ¿cómo sabes que el **resultado** es correcto?

### Computación Verificable {#verifiable-computing}

Dependiendo del problema con el que estemos lidiando, y dependiendo de cómo debería verse el resultado, podríamos ser capaces de realizar **algunas verificaciones** sobre el valor que recibimos.

Tomemos el sudoku, por ejemplo.

<figure>
	<img
		src="/images/the-zk-chronicles/first-steps/0*HBcJUxG5LG_X6N3M-3.jpg"
		alt="Un sudoku"
	/>
</figure>

Alguien podría **afirmar** que tiene una solución para un puzzle dado. ¿Cómo verificmoss que la solución es realmente **válida**?

Fácil — solo verificamos que cada fila, columna, y cuadrado en el puzzle **sume** al valor correcto. Como **verificadores**, no nos importa cómo se resolvió el puzzle, solo verificamos que los resultados coincidan con lo esperado.

Puede que no parezca gran cosa, pero esto es en realidad **muy poderoso**. La clave acá es que **ejecutar un cálculo** y **verificar sus resultados** pueden ser cosas completamente diferentes.

> No solo eso, sino que la verificación puede ser mucho más rápida que la ejecución original.

Claro, resolver sudokus no es particularmente emocionante. Pero te lo prometo — este simple desacoplamiento sí permite todo tipo de comportamientos geniales.

Esto es solo un vistazo de lo que es posible. Me encantaría darte más ejemplos, pero simplemente es **demasiado temprano** en nuestro viaje. Primero vamos a tener que repasar algunos fundamentos matemáticos para realmente empezar a profundizar en las cosas interesantes.

Aún así, hay un par de cosas más que podemos decir antes de pasar a eso.

---

## Sistemas de Prueba {#proving-systems}

Sé que dije que dejaríamos los fundamentos matemáticos para más tarde — pero vamos a necesitar **algo** de matemáticas para el resto del artículo. Así que mentí un poco. ¡Perdón!

<figure>
	<img
		src="/images/the-zk-chronicles/first-steps/0*U0K3ONLxPYfavwEp-4.jpg"
		alt="Plankton de Bob Esponja con una sonrisa malvada y risa" 
		title="Muehehehe"
	/>
</figure>

Imaginemos que este "programa" del que venimos hablando está representado por alguna función $f$. Nuestro objetivo entonces puede describirse de la siguiente manera: un **probador** (quien va a calcular $f$) va a intentar convencer a un **verificador** (quien va a recibir la salida del cálculo) de que el **resultado correcto** para alguna entrada $x$ es un cierto **valor propuesto** $y$, como en:

$$
y = f(x)
$$

Lo primero que hay que decir acá es que hay dos roles muy distintos. Siempre vamos a hablar de un **probador** y un **verificador** — y algunas veces, pueden aparecer otros roles.

En segundo lugar, podríamos preguntarnos cómo sucede el "convencimiento". Verás, no todos los programas son tan simples de verificar como el sudoku, y a veces, el resultado por sí solo **no va a ser suficiente**.

Lo que vamos a hacer es permitir que el probador y el verificador **hablen entre sí**. Al intercambiar algunos mensajes muy específicos — que veremos con más detalle en próximos artículos —, el verificador puede recopilar información clave que finalmente le va a permitir realizar estas verificaciones.

Esto es lo que se conoce como un **Sistema de Prueba Interactivo** (o simplemente **IP**), y es el tipo de protocolo que vamos a estudiar en esta serie. La secuencia de mensajes intercambiados se llama una **transcripción**, y podemos pensar en la transcripción completa como una **prueba de la corrección** del cálculo $f(x) = y$.

> Sé que esto es un poco abstracto en este punto, pero pronto vamos a ver cómo funciona esto en la práctica, lo prometo.

### Propiedades {#properties}

Si scrolleas hacia arriba hasta el comienzo de esta sección, vas a notar que explícitamente dije que $y$ es el **resultado propuesto** de evaluar $f(x)$. Esto es extremadamente importante de entender desde el principio: ahora que el verificador no realiza el cálculo en sí, significa que el probador **puede intentar mentir**.

Digámoslo de nuevo:

::: big-quote
El probador podría ser deshonesto
:::

Es crucial que cualquier sistema que diseñemos para **convencer** al verificador pueda **atrapar a los probadores cuando mienten**. Esto se formaliza como **dos propiedades** que necesitamos que nuestras Pruebas Interactivas tengan:

- **Completitud**: si el probador es **honesto**, el verificador va a **casi siempre aceptar** nuestra prueba.
- **Solidez/Robustez**: si el probador es **deshonesto**, entonces va a ser **casi imposible** crear una prueba convincente.

Sí, dije **casi**: puede existir una pequeña posibilidad de que una prueba válida pueda ser rechazada, o que un probador deshonesto pueda lograr hacer trampa. Llamamos a estas probabilidades los **errores** de **completitud** y **solidez**, y por supuesto, nuestro objetivo va a ser hacer estas probabilidades lo más pequeñas posible.

> Este es esencialmente el **costo** que el verificador paga por no ejecutar el cálculo él mismo: una pizca de no determinismo.

En general, sin embargo, vamos a intentar hacer esta probabilidad **muy muy pequeña** — tanto que va a ser **virtualmente imposible** para el probador hacer trampa. Y a veces, el error de completitud puede incluso ser **cero**, así que un verificador **siempre va a aceptar** pruebas de un probador honesto.

### ¿Dónde Está el Conocimiento Cero? {#wheres-the-zero-knowledge}

¿Notaste que en las dos secciones anteriores no dijimos **nada** sobre conocimiento cero?

Esa es la parte engañosa de la que estaba hablando: la computación verificable puede ser muy poderosa por sí sola, **sin conocimiento cero**. Muchas aplicaciones ni siquiera se preocupan por la parte de conocimiento cero, y en cambio aprovechan otras propiedades útiles de estos sistemas de prueba, como el hecho de que las pruebas pueden ser **pequeñas** y **rápidas de verificar**.

El conocimiento cero es, como ya mencioné, una **propiedad extra** que estas pruebas pueden tener.

Tiene que ver con **ocultar** algunas de las entradas a la función $f$. Y el rol de esta función es realizar algún tipo de **verificación** sobre las entradas.

> ¿Te acordás del ejemplo del bar de antes? Digamos que mi edad es un valor $x$, y tengo una función que devuelve $1$ si $x > 21$, y $0$ en caso contrario. Lo que quiero es mostrar que $f(x) = 1$, pero sin revelar $x$.

Esta propiedad de conocimiento cero va a ser importante cuando queramos mantener alguna información sensible **privada** — por ejemplo, en aplicaciones donde necesitamos transacciones privadas, credenciales anónimas, o votación confidencial.

La forma en que hacemos eso, sin embargo, va a ser una historia para otro momento.

---

## Resumen {#summary}

¡Muy bien! Creo que eso es suficiente para nuestros primeros pasos en conocimiento cero.

Resumen rápido: vimos cómo la ejecución y la verificación no son lo mismo, lo que nos permite descargar el peso de la ejecución de un **verificador**, y colocarlo sobre un **probador**, a costa de tener que crear un **sistema de prueba**. Esto es deseable porque la verificación puede ser **mucho más rápida** que la ejecución.

También mencionamos que estos sistemas de prueba van a ser **interactivos**: los mensajes se envían de ida y vuelta entre el probador y el verificador hasta que el verificador está **convencido** de que el cálculo fue ejecutado correctamente.

> Hay algunas cosas que podemos hacer para **eliminar** la necesidad de esta interacción, pero vamos a hablar de eso más adelante.

<quiz src="/the-zk-chronicles/first-steps/validation.json" lang="es" />

Luego, mencionamos las dos propiedades clave que necesitamos garantizar para que estas pruebas tengan sentido: **completitud** y **solidez**. En pocas palabras, estas significan que debería ser fácil probar que el resultado de un cálculo es correcto **cuando realmente lo es**, y que hacer trampa es difícil.

El conocimiento cero es como la cereza del postre de todo esto. No es un requisito estricto, pero puede agregarse a la mezcla. Y cuando lo es, podemos crear estos sistemas de prueba que preservan la privacidad, que pueden ser muy útiles en el contexto correcto.

Me imagino que a esta altura, esto va a seguir sonando bastante abstracto y, honestamente, un poco mágico.

> Y para ser completamente transparente acá, va a seguir siendo así durante algunos artículos — ¡por favor ten paciencia!

Para eliminar este velo de misticismo, vamos a necesitar sumergirnos en las **matemáticas básicas** que impulsan esta maquinaria criptográfica.

¡Lo vamos a hacer en el próximo artículo!
