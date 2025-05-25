---
title: "WTF es la Computación Cuántica"
date: "2025-03-24"
author: "frank-mangone"
thumbnail: "/images/wtf-is/quantum-computing/hitchhikers.webp"
tags:
  ["computerScience", "quantumMechanics", "qubit", "postQuantumCryptography"]
description: "Una breve explicación sobre cómo funcionan las computadoras cuánticas, qué pueden hacer y qué esperar de ellas en un futuro cercano"
readingTime: "11 min"
---

Este año se perfila como uno de los grandes en los libros de historia de la computación cuántica. Noticias emocionantes están llegando a los titulares con el anuncio del chip [Majorana 1](https://medium.com/@servifyspheresolutions/microsofts-majorana-1-quantum-processor-a-leap-forward-in-quantum-computing-240350881e5d) de Microsoft y el [Zuchongzhi 3.0](https://www.forbes.com/sites/luisromero/2025/03/10/quantum-singularity-ahead-chinas-zuchongzhi-3-reshapes-quantum-race/) de China.

Pero, ¿a qué viene tanto alboroto?

Debido a la forma en que operan las computadoras cuánticas, son capaces de resolver **problemas extremadamente difíciles** que las computadoras clásicas (como en la que estás leyendo esto) no pueden resolver.

Bueno, en realidad, no es que **no puedan** hacerlo — es solo que tardarían un tiempo realmente, **realmente** largo. Imagina iniciar un cálculo e instruir a las generaciones venideras a esperar los resultados algún día en un futuro distante.

<figure>
  <img
    src="/images/wtf-is/quantum-computing/hitchhikers.webp" 
    alt="La computadora de la Guía del Autoestopista Galáctico, con la leyenda '42'"
    title="Justo como en Hitchhiker’s Guide to the Galaxy"
    width="500"
  />
</figure>

> De hecho, suena bastante legendario.

Es una locura. Además, es impracticable.

Las computadoras cuánticas son capaces de resolver estos problemas complejos en tiempos mucho más manejables. En teoría, esto podría revolucionar campos como la medicina, la biología, la ingeniería y la inteligencia artificial, solo por nombrar algunos.

Por muchos beneficios que pueda tener la computación cuántica, también tiene una capacidad aterradora: puede romper los métodos criptográficos más utilizados que usamos a diario.

Es una espada de doble filo. Quien tenga acceso a la computación cuántica podría potencialmente romper nuestros modelos de seguridad actuales, representando así una amenaza en muchos niveles.

Entonces, ¿qué tan preocupados deberíamos estar? Para responder a esto, creo que debemos entender de qué se trata la computación cuántica, qué tipo de problemas puede resolver y cómo podríamos repensar la seguridad moderna para tratar de protegernos de esta amenaza latente.

**¡Vamos!**

---

## Mecánica Cuántica en Pocas Palabras {#quantum-mechanics-in-a-nutshell}

No soy realmente un experto en mecánica cuántica, pero he tenido suficiente contacto con la disciplina para al menos tener una comprensión funcional.

Con este modesto trasfondo, todo lo que puedo decir es:

::: big-quote
La Física Cuántica es extraña
:::

Ten esto en mente para el viaje de hoy. Por muy locas que puedan parecer, las ideas propuestas por la mecánica cuántica resultan ser la **mejor descripción** de nuestra realidad física (al menos en el ámbito de los átomos y partículas) que hemos encontrado hasta ahora como especie.

---

La proposición más esencial en la física cuántica es que las partículas no se comportan como un **objeto sólido**. Podríamos estar tentados a imaginarlas como pequeñas bolas de billar, pero así no es como se desmoronan las galletas.

<figure>
  <img
    src="/images/wtf-is/quantum-computing/billiard.webp" 
    alt="Bolas de billar"
    title="No."
    width="600"
  />
</figure>

No **siempre**, al menos. La primera evidencia documentada de esto es el infame [experimento de la doble rendija](https://en.wikipedia.org/wiki/Double-slit_experiment), que reveló que, bastante paradójicamente, las partículas a veces se comportan como pequeñas canicas, y otras veces, como **ondas**.

Lo que es más, cómo se comportan depende de si están siendo **observadas** o no.

Lo sé, bastante alucinante. Es como si la partícula de alguna manera supiera que está **siendo vigilada**. Por supuesto, podríamos darle algún sentido a esto, pero ese podría ser un tema que podríamos cubrir en otra ocasión.

### Partículas como Ondas {#particles-as-waves}

No nos detengamos demasiado en los detalles, porque hay mucho que cubrir.

En mecánica cuántica, las partículas se modelan como **ondas**. Esta representación funciona como una **distribución de probabilidad**, en el sentido de que describe cuál es la **probabilidad** de encontrar una partícula en un cierto estado.

> El término correcto para estos "estados" es **observables**, pero usaremos **estado** para hacer las cosas más fáciles de seguir.

Por ejemplo, el **estado** que nos interesa podría ser la posición de la partícula: es una especie de sopa de probabilidad hasta que intentamos medirla. Y por supuesto, cuando lo hacemos, la partícula tiene que estar en **algún lugar**, así que deja de vivir en un mundo probabilístico y aparece en alguna posición. Una locura.

> Esto se conoce como **colapso de la función de onda**, pero de nuevo, no nos enfoquemos demasiado en los detalles.

Ahora, las ondas tienen propiedades muy interesantes. Por un lado, podemos **sumar ondas**. El resultado puede ser **constructivo** o **destructivo** — sumar dos ondas puede cancelarlas completamente, hacer que la onda resultante sea aún más grande, o una mezcla de las dos.

<figure>
  <img
    src="/images/wtf-is/quantum-computing/wave-addition.webp" 
    alt="Ondas sumándose de manera constructiva y destructiva"
    title="[zoom]"
    width="600"
  />
</figure>

Y la parte genial es que podemos sumar **cualquier cantidad** de ondas juntas, incluso **infinitas**, produciendo todo tipo de patrones. Lo que nos lleva al siguiente concepto interesante.

### Superposición {#superposition}

Bien, entonces una onda representa un posible estado para una partícula. ¿Qué sucede si sumamos dos ondas? La partícula estará en una **combinación** de ambos estados al mismo tiempo — una **superposición**, que solo se resuelve a algún valor una vez que la observamos.

Aunque esto pueda sonar loco, podemos recurrir a un ejemplo más familiar para ganar intuición: el **sonido**.

Casi nunca escuchas una "onda pura". Como referencia, así es como suena una onda pura:

<video-embed src="https://www.youtube.com/watch?v=OUvlamJN3nM" />

Más bien, casi todos los sonidos que escuchas a diario son una combinación de varias ondas individuales, resultando en algo desordenado, como esto:

<figure>
  <img
    src="/images/wtf-is/quantum-computing/sound-wave.webp" 
    alt="Una onda de sonido"
    title="[zoom]"
    className="bg-white"
  />
</figure>

Sin embargo, a menudo somos capaces de distinguir y extraer información de estas combinaciones. Una conversación es una onda de sonido realmente complicada, pero **significa algo** que podemos percibir y decodificar.

Pero por ejemplo, si estás en un bar y la música está muy alta, y tu amigo está tratando de contarte lo borracho que está, es posible que no puedas entenderlo.

---

Agrupar diferentes estados funciona de manera muy similar en la mecánica cuántica. Una partícula podría estar en una combinación de estados, pero algunos de ellos son **realmente fuertes** (más probables), y sobrepasan a otros que terminan siendo menos probables.

¿Vamos bien hasta ahora? La mecánica cuántica es bastante extraña, lo sé. Y no hemos cubierto mucho — solo lo suficiente para entender de qué se trata la computación cuántica. Solo espero que no estés como:

<figure>
  <img
    src="/images/wtf-is/quantum-computing/hide-the-pain.webp" 
    alt="Harold ocultando el dolor"
    width="600"
  />
</figure>

Ve despacio. Trata de entender estas ideas antes de continuar.

¿Listo?

---

## Fundamentos de la Computación Cuántica {#quantum-computing-fundamentals}

Muy bien, así que hemos cubierto brevemente el extraño mundo de la mecánica cuántica.

En este punto, imagino que te estás preguntando cómo demonios pasamos de estas cositas de ondas a **computadoras que pueden romper internet**. ¡Es hora de conectar los puntos!

Las computadoras regulares procesan información usando **bits**. Ya sabes, los familiares $0$s y $1$s. Cada bit solo puede almacenar estos dos valores en cualquier momento.

Esto podría no parecer un problema al principio. Y para ser justos, realmente no es necesariamente un problema. Las computadoras modernas pueden realizar hazañas increíbles usando solo bits — simplemente muchos de ellos, cambiando sus valores realmente, **realmente** rápido.

Para algunas aplicaciones, sin embargo, esto simplemente no es suficiente. Hay problemas que toman **tanto tiempo** en resolverse, que ni siquiera el poder combinado de todas las computadoras en el **mundo entero** podría manejarlos en un tiempo razonable.

En términos generales, si **duplicas** tu poder de cómputo, aproximadamente **reducirás a la mitad** el tiempo que toma resolver un problema. Es una relación **lineal**.

> Esto no es **generalmente** cierto. No es tan fácil paralelizar problemas. Quedémonos con esta idea con fines educativos, ¡pero sepa que no es tan simple!

Y de nuevo, en algunos casos, puedes seguir duplicando hasta que no haya más computadoras disponibles en el mundo, y aún así estarías mirando una espera de **unos pocos millones de años**.

<figure>
  <img
    src="/images/wtf-is/quantum-computing/skeleton.webp" 
    alt="Un esqueleto sentado frente a una computadora"
    title="¡Oh mira, finalmente terminó!"
    width="600"
  />
</figure>

### Qubits {#qubits}

La historia sería diferente si los bits pudieran contener **más de un solo valor** a la vez. No podemos lograr esto sin cambiar fundamentalmente cómo funcionan las computadoras — y aquí es donde entran en escena los **qubits**.

Un **qubit** es similar a un bit, en el sentido de que sus valores "esperados" son $0$ y $1$. La diferencia es que puede contener ambos valores **al mismo tiempo**.

<figure>
  <img
    src="/images/wtf-is/quantum-computing/bit-qubit.webp" 
    alt="Un bit y un qubit lado a lado"
    title="Simplemente ignora los símbolos extraños."
    width="600"
    className="bg-white"
  />
</figure>

¿Cómo, te preguntarás? **¡Superposición!**

El estado de un qubit es una **combinación** de los "estados" $0$ y $1$.

> Solo piensa en las ondas de sonido — a veces puedes escuchar claramente $0$, otras $1$, y otras veces no son tan fáciles de distinguir.

Ahora, un solo qubit no es tan emocionante — en cierto modo contiene dos valores a la vez en lugar de uno. Gran cosa, ¿eh? Sin embargo, cuando empiezas a acumular qubits, las cosas se ponen interesantes. **Dos qubits** pueden contener cuatro valores posibles a la vez: $00$, $01$, $10$, $11$. Usa tres qubits, y obtienes $8$ valores simultáneos.

¿Ves la tendencia, verdad? La cantidad de información que puedes almacenar crece **exponencialmente** con el número de qubits que usas.

> Con solo 300 qubits, podrías representar más estados que átomos hay en el universo observable. Mente = volada.
>
> Y por supuesto, con 300 bits, puedes representar un solo estado de entre $2^{300}$ valores posibles. ¡Abuuuurriiidooo!

¡Suena prometedor! Entonces, ¿cómo obtenemos un qubit?

### Construyendo un Qubit {#building-a-qubit}

Representar bits es realmente simple: es solo corriente que fluye a través de un circuito.

Los qubits son un tipo diferente de bestia, porque necesitamos lidiar con **sistemas cuánticos**. Así que cuando se trata de describir estos sistemas, las cosas se vuelven muy técnicas muy rápido.

Naturalmente, los detalles son bastante complicados. Solo quiero mencionar brevemente algunas de las técnicas para construir qubits que existen, pero por ahora, creo que es mejor evitar cualquier descenso adicional al extraño mundo de la mecánica cuántica.

Aquí van:

- **Qubits superconductores**: Pequeños circuitos enfriados a casi el cero absoluto donde los electrones fluyen sin resistencia. Los qubits en sí pueden ser vistos como pequeños hula-hoops, cuya dirección de rotación indica un $0$ o un $1$. Y, por supuesto, pueden girar en ambas direcciones al mismo tiempo.
- **Qubits de iones atrapados**: Átomos reales mantenidos en su lugar por campos electromagnéticos, donde las configuraciones de electrones representan diferentes estados. Así que, literalmente, estos son átomos flotando en el vacío, mantenidos en su lugar por campos eléctricos — y el "qubit" es el nivel de energía del electrón del átomo.
- **Qubits fotónicos**: Utilizan fotones (a.k.a. partículas de luz) para almacenar información cuántica. La parte del "qubit" es solo una propiedad del fotón, como su polarización — simplemente dicho, si se mueve hacia arriba y hacia abajo, o de izquierda a derecha. ¡O una combinación de ambos, porque estos son sistemas cuánticos!

> Además, están los qubits topológicos que Microsoft afirma usar en Majorana 1. Pero todavía no tengo idea de cómo funciona eso.
>
> Tiene algo que ver con pequeños cables que contienen información cuántica, nuevos estados de la materia, partículas teóricas no observadas previamente (el [fermión de Majorana](https://en.wikipedia.org/wiki/Majorana_fermion))... Demasiado para que mi cerebro lo maneje, honestamente.

¡Pero! Hay un problema: estos sistemas son bastante inestables.

<figure>
  <img
    src="/images/wtf-is/quantum-computing/unstable.webp" 
    alt="El Joker de Michael Phoenix"
    width="600"
  />
</figure>

La más mínima perturbación puede hacer que el estado cuidadosamente elaborado de los qubits se desmorone, en lo que se llama **decoherencia**.

Por esta razón, los qubits tienen que estar **extremadamente aislados**. Como, de la realidad misma. Es por eso que están alojados en refrigeradores gigantes enfriados a temperaturas cientos de veces más frías que el espacio exterior. Y aun así, los qubits solo mantienen sus estados durante unos pocos microsegundos, antes de que la decoherencia entre en acción.

Así que sí, las computadoras cuánticas son geniales y tienen un tremendo potencial, pero todavía son extremadamente difíciles de manejar.

> ¡Y probablemente no podrás comprar tu laptop cuántica pronto!

### Conectando Qubits {#connecting-qubits}

Muy bien, tenemos estos qubits individuales flotando en sus ambientes súper fríos y aislados. Pero no puedes construir una computadora usando solo bits.

Las computadoras que usamos y amamos funcionan porque pueden **combinar bits** usando lo que se llaman **puertas lógicas**. Por ejemplo, una puerta $AND$ toma dos bits como entrada, y produce $1$ si ambas entradas son $1$, y $0$ de lo contrario. Es a partir de estas pequeñas piezas que se construyen las computadoras.

> Dato curioso: puedes construir una computadora usando solo [puertas NAND](https://nandgame.com/).

Las puertas lógicas son **circuitos diminutos**. Son realmente pequeñas, y tienen una física interesante detrás de ellas, pero son conceptualmente simples: si la corriente fluye, obtienes un $1$, si no, obtienes un $0$.

¿Qué pasa con las computadoras cuánticas, entonces? Vamos a necesitar construir algún tipo de puerta para realizar operaciones — necesitamos **puertas cuánticas**. Pero, ¿cómo hacemos eso? No hay cables conectando qubits, así que ¿cómo demonios podemos construir puertas para combinarlos?

Afortunadamente, la mecánica cuántica todavía tiene algo de rareza adicional para que aprovechemos y hagamos que las cosas funcionen.

Los qubits están conectados a través de un fenómeno llamado **entrelazamiento**.

<figure>
  <img
    src="/images/wtf-is/quantum-computing/entanglement.webp" 
    alt="Representación artística del entrelazamiento"
    title="Wow"
    width="600"
  />
</figure>

Así es como funciona: dos partículas entrelazadas tienen la propiedad casi mágica de que medir el estado de una de ellas **afecta instantáneamente** a la otra, sin importar qué tan separadas estén en el universo. Imagina que tienes dos monedas entrelazadas, las colocas en diferentes **galaxias**, y cuando lanzas una y sale cara, puedes estar absolutamente seguro de que la otra mostrará cruz — cada vez, sin fallar, **instantáneamente**.

> Es tan extraño, incluso el gran Albert Einstein lo llamó "acción fantasmal a distancia", porque parece violar el límite universal que es la velocidad de la luz.

Independientemente, este fenómeno es el último **ingrediente secreto** que permite que las computadoras cuánticas funcionen. Pero hay un problema: las puertas cuánticas no funcionan exactamente como tus puertas clásicas $AND$ u $OR$. De hecho, son fundamentalmente diferentes.

Las puertas cuánticas son más como [pequeñas transformaciones](https://en.wikipedia.org/wiki/Quantum_logic_gate) que cambian el estado de un qubit o varios qubits a la vez. Por ejemplo, está la [puerta de Hadamard](https://www.quantum-inspire.com/kbase/hadamard/), que toma un qubit en estado $0$ o $1$ y lo pone en una "superposición perfecta" de ambos.

Y luego, hay puertas como la [CNOT](https://en.wikipedia.org/wiki/Controlled_NOT_gate) (**Controlled-NOT** o NOT Controlada), que invierte un qubit objetivo dependiendo del estado de otro qubit de **control** — ¡entrelazamiento en acción!

El entrelazamiento nos permite crear tipos exóticos y útiles de puertas lógicas cuánticas. Funcionan de manera diferente a lo que estamos acostumbrados, por lo que los algoritmos que se ejecutan en este tipo de computadoras también son fundamentalmente diferentes de los que construimos en computadoras clásicas.

Debido a que los qubits nos permiten representar múltiples estados a la vez, el truco es configurar la secuencia correcta de puertas cuánticas para que las respuestas incorrectas se cancelen, mientras que las respuestas correctas **interfieren constructivamente**, y se amplifican entre sí (de nuevo, piensa en la analogía del sonido). Descubrir estas secuencias es un arte en sí mismo — y es por eso que rutinas como el [algoritmo de Shor](https://en.wikipedia.org/wiki/Shor%27s_algorithm) son tan inteligentes y poco familiares.

En resumen:

::: big-quote
La clave es aprovechar la rareza de la mecánica cuántica
:::

---

## Resumen {#summary}

Entonces, ¿qué hemos aprendido a lo largo de este viaje?

Bueno, en primer lugar, que la física cuántica es **extraña** — las ondas se utilizan para la representación de estados, los sistemas existen en múltiples estados a la vez, [entrelazamiento](https://en.wikipedia.org/wiki/Quantum_entanglement)... Sin embargo, toda esta rareza es exactamente lo que hace que la computación cuántica sea tan poderosa.

La investigación actual se centra en extender el tiempo de coherencia y corregir errores cuando inevitablemente ocurren. Y con los recientes anuncios de **Majorana 1** y **Zuchongzhi 3.0**, podríamos estar acercándonos a una computación cuántica más estable, cuyo potencial puede ser realmente explotado.

Hay una aplicación particular que mantiene a los expertos en seguridad despiertos por la noche: la **criptografía**. La mayoría de la criptografía se basa en esos **problemas extremadamente difíciles** que mencioné antes — algunos de los cuales pueden romperse en tiempos razonables con una computadora cuántica suficientemente poderosa.

> No todos ellos, sin embargo. Los más sensibles son [RSA](/es/blog/cryptography-101/asides-rsa-explained), y algoritmos basados en [Curvas Elípticas](/es/reading-lists/elliptic-curves-in-depth) (ECC). Pero cosas como [AES](https://es.wikipedia.org/wiki/Advanced_Encryption_Standard) no son objetivos principales.

Lo que significaría que la seguridad tal como la conocemos estaría cocinada.

<figure>
  <img
    src="/images/wtf-is/quantum-computing/sheldon-anxiety.webp" 
    alt="Sheldon de The Big Bang Theory respirando en una bolsa"
    width="500"
  />
</figure>

Pero no entremos en pánico todavía. Las computadoras cuánticas todavía son muy limitadas — aún estamos lejos de la etapa de "romper internet".

Es más, los criptógrafos no están sentados esperando. Se están desarrollando métodos para resistir la fuerza de la computación cuántica. El área de investigación se llama [Criptografía Post-Cuántica](/es/blog/cryptography-101/post-quantum-cryptography) (PQC).

---

La revolución cuántica no sucederá de la noche a la mañana. Tenemos tiempo para adaptar nuestros modelos de seguridad. Pero ya no es una curiosidad académica.

Si eso te emociona o te aterroriza probablemente depende de si estás más entusiasmado con la tecnología revolucionaria o más preocupado por tu billetera de Bitcoin.

De cualquier manera, ¡la era cuántica está llegando! ¡Mejor prepárate para ella!
