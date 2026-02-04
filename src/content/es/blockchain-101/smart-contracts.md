---
title: 'Blockchain 101: Contratos Inteligentes'
date: '2024-12-26'
author: frank-mangone
thumbnail: /images/blockchain-101/smart-contracts/dump-spongebob.webp
tags:
  - ethereum
  - blockchain
  - evm
  - solidity
  - smartContracts
description: >-
  Un vistazo a la arquitectura que hace posibles los Contratos Inteligentes en
  Ethereum
readingTime: 12 min
mediumUrl: >-
  https://medium.com/@francomangone18/blockchain-101-smart-contracts-8092253cbdfa
contentHash: 46aecc0ee8bc6fec16b646fd34813adfd546c856ad170208a0c76955e85c5d15
supabaseId: c165a12e-e99f-4083-9a1a-523fbca864b8
---

> Este artículo es parte de una serie más larga sobre Blockchain. Si este es el primer artículo que encuentras, te recomiendo comenzar por el [inicio de la serie](/es/blog/blockchain-101/how-it-all-began).

Con el [almacenamiento de Ethereum](/es/blog/blockchain-101/storage) detrás de nosotros, es hora de profundizar en uno de los temas más centrales en cualquier Blockchain moderna: los **Contratos Inteligentes**.

Como hemos mencionado anteriormente en la serie, estos son programas enviados por usuarios que viven directamente **en la Blockchain** — en el caso de Ethereum, se almacenan en cuentas de contrato.

No solo eso, sino que también manejan una pieza independiente de estado, que solo puede ser alterada por las reglas definidas en el propio contrato.

Suena increíble, ¿verdad? Sin embargo, implementar tal característica viene acompañada de un conjunto de desafíos: ¿cómo modelamos un estado **personalizable** y **flexible**? ¿Y cómo logramos definir las **acciones** — o transiciones de estado — asociadas a un contrato?

Nuestro plan para hoy es tratar de explicar cómo Ethereum responde a ambas preguntas. Su solución se ha vuelto muy popular — tanto así que muchas otras blockchains se esfuerzan por ser compatibles con ella.

> Quizás hayas oído hablar de blockchains compatibles con EVM. Esto es exactamente a lo que se refieren: que procesan el estado y la lógica de los Contratos Inteligentes de la misma manera que lo hace Ethereum.

¡Cosas divertidas por delante!

---

## Modelando el Estado {#modeling-state}

Retomemos las cosas donde las dejamos en el artículo anterior. Hablamos sobre cómo el estado se almacena en una simple base de datos clave-valor, pero se consolida mediante el uso de un trie de Merkle Patricia (modificado).

Representar cuentas es una tarea bastante simple, porque el conjunto de atributos necesarios para definir completamente una cuenta es estático. Los Contratos Inteligentes son diferentes — cada contrato define su propio estado, lo que significa que ya no tenemos un conjunto estático de atributos con el que trabajar.

Entonces, lo primero que hay que hacer es crear un mecanismo para **organizar** el estado. En otras palabras:

::: big-quote
Necesitamos algunas reglas para definir correctamente el estado
:::

La mayoría de los lenguajes de programación tienen estas "reglas" también — son lo que llamamos **tipos**, o construcciones incorporadas como **arrays**. Para cumplir con la promesa de programabilidad, los Contratos Inteligentes también necesitan proporcionar algunos de estos.

En esencia, solo necesitamos resolver tres cosas:

- Qué tipos queremos soportar
- Cómo vamos a almacenar esa información en nuestro almacenamiento clave-valor
- Una estrategia para calcular determinísticamente un identificador usado para colocar los datos en un trie de Merkle Patricia

Con esto en mente, veamos qué tipos puede manejar Ethereum.

### Tipos Primitivos {#primitive-types}

En el núcleo del sistema de tipos, hay un bloque de construcción muy fundamental: la **palabra (word) de 256 bits**.

<figure>
  <img
    src="/images/blockchain-101/smart-contracts/microsoft-word.webp" 
    alt="Bill Gates rapeando"
    title="Yo."
    width="450"
  />
</figure>

Bromas de rap aparte, una [palabra](<https://en.wikipedia.org/wiki/Word_(computer_architecture)>) en ciencias de la computación es la unidad básica de datos que un procesador de computadora puede manejar en una sola operación. Generalmente también es la cantidad máxima de datos que puede caber en un [registro](https://en.wikipedia.org/wiki/Processor_register).

Pero no estamos tratando con una computadora física aquí. ¿Por qué nos importan las decisiones arquitectónicas del hardware físico?

> Nuestros Contratos Inteligentes son esencialmente **programas de computadora**, así que necesitamos diseñar una arquitectura que pueda ejecutarlos.
>
> Si podemos construir software que funcione exactamente como una computadora, y podemos ejecutar Contratos Inteligentes en cualquier pieza de hardware, entonces podemos asegurarnos de que el mismo programa producirá los mismos resultados dados los mismos inputs, sin importar dónde se ejecute.
>
> En este sentido, Ethereum funciona como una computadora gigante y distribuida — una **máquina virtual**. ¡Por eso EVM significa Ethereum Virtual Machine!

Decidir el tamaño de una palabra es importante en el diseño de dicha máquina virtual.

Elegir $256$ bits se alinea bien con la necesidad de almacenar números grandes (como balances) y direcciones. También se alinea bien con la [función hash](/es/blog/cryptography-101/hashing) utilizada en Ethereum: **Keccak-256**. Hablaremos más sobre esto en un minuto.

Esta elección también lleva a una serie de **tipos primitivos**, basados en ese tamaño de palabra.

<figure>
  <img
    src="/images/blockchain-101/smart-contracts/primitive.webp" 
    alt="Bob Esponja primitivo"
    title="Lo que imagino en mi cabeza cuando leo 'primitivos'"
    width="500"
  />
</figure>

Estos primitivos son:

- **Enteros**: Podemos almacenar enteros tanto **con signo** como **sin signo** en los 256 bits disponibles. Los enteros con signo usan un bit para especificar el signo, mientras que los enteros sin signo son siempre positivos. El entero máximo que podemos representar es $2^{256} - 1$. Los valores por encima de eso serán problemáticos y requerirán soluciones ingeniosas.
- **Direcciones**: ¡Como las direcciones ocupan $160$ bits ($20$ bytes) en Ethereum, pueden caber en una sola palabra!
- **Booleanos**: Un único $1$ o $0$, representando **verdadero** o **falso** respectivamente. Ocupan una palabra completa, a pesar de que solo toman 1 bit de espacio.
- **Bytes**: Simplemente valores de bytes, sin ningún significado explícito.

Podemos usar estos para definir **variables**. Representarán parte del estado de un Contrato Inteligente — lo que significa que necesitan ser almacenadas en el trie de Merkle Patricia del contrato.

### Decidiendo la Ubicación en el Trie {#deciding-trie-location}

El Lenguaje de Dominio Específico (DSL) más popular para escribir Contratos Inteligentes de EVM, al menos hasta la fecha, es [Solidity](https://soliditylang.org/). Hay algunas alternativas como [Vyper](https://docs.vyperlang.org/en/stable/) — pero voy a tener que elegir Solidity por razones de comodidad para nuestros ejemplos de aquí en adelante.

Aquí hay un fragmento de un contrato simple:

```solidity
contract SimpleStorage {
    uint256 first;
    address second;
    bool third;

    // ...
}
```

Como puedes ver, hemos definido algunas variables (**first**, **second**, y **third**), cada una de ellas **tipada** a un tipo primitivo.

> Los tipos son cruciales para evaluar correctamente las operaciones, pero es importante tener en cuenta que estos son solo valores de 256 bits.

Necesitamos elaborar una estructura de trie a partir de esto, lo que significa que cada una de estas variables necesita estar asociada con una ruta en el trie. Y este cálculo necesita ser determinístico y repetible.

La estrategia es usar **slots**. Cada slot tiene el tamaño de nuestra palabra ($256$ bits), y está identificado por una clave de 256 bits. En nuestro caso simple, los slots se asignan **secuencialmente**, comenzando desde $0$. Es decir:

```solidity
contract SimpleStorage {
    uint256 first;  // Este obtiene el slot 0
    address second; // Este obtiene el slot 1
    bool third;     // Este obtiene el slot 2

    // ...
}
```

Estos identificadores serán en realidad la **clave** para cada uno de estos espacios de almacenamiento en el trie de Merkle Patricia.

Simple, ¿verdad?

<figure>
  <img
    src="/images/blockchain-101/smart-contracts/dump-spongebob.webp" 
    alt="Patrick y Bob Esponja primitivos"
    width="600"
  />
</figure>

---

## Tipos Compuestos {#composite-types}

Los tipos primitivos ocupan un **único slot**, pero son limitados en las posibilidades que ofrecen. Son importantes, pero quizás no muy divertidos.

A menudo, necesitamos la capacidad de almacenar **colecciones** de datos, u organizar datos en estructuras más **complejas**. Para este propósito, Ethereum ofrece algunos tipos más:

- **Arrays**: Colecciones ordenadas de elementos del mismo tipo. Vienen en dos sabores: arrays de tamaño fijo, y arrays dinámicos que pueden crecer o reducirse según sea necesario.
- **Mappings**: Conocidos como **diccionarios** o **tablas hash** en otros lenguajes, son una colección de pares clave-valor.
- **Structs**: Simplemente grupos de datos relacionados agrupados en una sola unidad. Son buenos para representar datos tipo registro — entidades con múltiples atributos.

Ahora, ¿cómo se almacenan estos?

### Arrays {#arrays}

Los arrays de tamaño fijo son bastante fáciles de manejar, realmente. Como la longitud se conoce de antemano (y es estática), podemos simplemente usar **slots consecutivos**. Por ejemplo:

```solidity
contract FixedSizeArrayExample {
    uint256[3] fixedArray;  // Toma los slots 0, 1, y 2
    uint256 otherVar;       // Toma el slot 3
}
```

Pero los arrays dinámicos son una bestia diferente — no podemos usar slots consecutivos, ya que eso significaría que cuando el array **crece**, estaría pisando el slot de otra variable. Se necesita una estrategia diferente.

La solución de Ethereum es muy ingeniosa:

- Asignamos un slot al array como si fuera un tipo primitivo, y usamos ese slot para almacenar su longitud actual
- Los elementos reales se almacenan en una **posición diferente**, calculada como: `keccak256(slot) + index`

Como mencionamos anteriormente, [Keccak256](<https://www.nervos.org/knowledge-base/what_is_keccak256_(explainCKBot)>) es la [función hash](/es/blog/cryptography-101/hashing) elegida por Ethereum. Su salida resulta ser de **256 bits de largo**.

> ¿Te suena familiar? Por supuesto — ¡es la longitud de nuestra palabra! Y también es una ruta válida para el trie de Merkle Patricia.

Al usar la función hash, introducimos algo de aleatoriedad en el proceso, reduciendo la probabilidad de que las rutas de los elementos del array colisionen con otras rutas de variables existentes. ¡Es bastante ingenioso!

<figure>
  <img
    src="/images/blockchain-101/smart-contracts/spiderman-neat.webp" 
    alt="Spiderman tomando una foto, con la cita '¡Genial!'"
    width="400"
  />
</figure>

> Solidity también tiene **strings**, que en realidad son arrays dinámicos de bytes. Esto significa que siguen las mismas reglas que los arrays dinámicos: la longitud se almacena en el slot principal, y los datos reales se almacenan en `keccak256(slot)`.

### Mappings {#mappings}

Estos muchachos aquí no tienen un orden tan claro — las claves pueden ser prácticamente cualquier secuencia de 256 bits. Eso significa que nuestra estrategia anterior de encontrar un punto de inicio (hash) y luego agregar el índice no funcionará. Se usa un enfoque ligeramente diferente.

Al igual que los arrays dinámicos, los mappings tienen asignado un **número de slot**.

```solidity
contract MappingExample {
    mapping(address => uint256) balances; // Esto tomaría el slot 0.
}
```

Luego, para cualquier **clave** en el mapping, encontramos su ruta en el trie de Merkle Patricia simplemente concatenando (`||`) con el **número de slot**, y luego hasheando: `keccak256(key || slot)`.

Al hacer esto, cada clave de almacenamiento (en el trie) es determinística, pero al mismo tiempo es poco probable que colisione con otras ubicaciones. Y podemos permitir la lectura de una clave inexistente — todo lo que obtenemos es un valor vacío (cero).

> Los mappings también pueden ser anidados. Las claves se calculan normalmente para el mapping más interno, y luego usamos este valor en lugar del **slot** para el siguiente mapping que lo envuelve. ¡Bastante simple y efectivo!

### Structs {#structs}

Por último, tenemos los **structs**, que se ven así:

```solidity
contract StructExample {
    struct User {
        uint256 id;
        address wallet;
    }

    User owner;
}
```

Las variables tipadas como struct ocupan tantos slots como **claves** hay en el struct. En el ejemplo anterior, `owner.id` tomaría el slot $0$, y `owner.wallet` ocuparía el slot $1$.

---

Todos estos tipos pueden ser **combinados** en diferentes patrones, y las reglas que describimos se aplicarían para calcular las rutas del trie de Merkle Patricia. Por ejemplo:

```solidity
contract CompositionExample {
    struct Person {
        string name;
        uint256 age;
        address wallet;
    }

    mapping(address => Person[]) people;
}
```

> ¿Puedes descifrar dónde se almacena `people[address][0].name`? ¡Te lo dejo como ejercicio!

---

## Lógica del Contrato {#contract-logic}

¡Maravilloso! Tenemos un sistema rico para representar tipos tanto simples como complejos, y calcular sus rutas en el trie de almacenamiento. Lo que esto logra es la capacidad de calcular una **raíz de estado**, que consolida la totalidad del estado de un contrato en un único valor.

Sin embargo, los contratos no serían tan emocionantes si no pudiéramos escribir reglas para determinar cómo cambia el estado. Sin esto, todo lo que tendríamos sería una forma muy complicada de almacenar algunos datos estáticos y aburridos.

<figure>
  <img
    src="/images/blockchain-101/smart-contracts/baby-yoda-sleeping.webp" 
    alt="Baby Yoda durmiendo"
    title="Zzzzzz"
    width="600"
  />
</figure>

Recuerda que, antes de hablar sobre el almacenamiento, mencionamos cómo Ethereum funciona como una computadora gigante y distribuida. Al igual que las computadoras reales, necesita una forma de representar **programas**, que entienda y pueda ejecutar.

Los programas, realmente, son solo **secuencias de instrucciones**. Y el lenguaje que nuestra máquina virtual entiende se expresa en **bytes**. De ahí el nombre elegante que quizás ya hayas escuchado: **bytecode**.

Nuestros contratos de Solidity serán compilados a este bytecode, que por supuesto no está destinado a ser legible por humanos. Por ejemplo, aquí hay un contrato muy simple:

```solidity
pragma solidity ^0.8.20;

contract Counter {
    uint256 count = 0;

    function increment() public {
        count = count + 1;
    }
}
```

Una vez compilado, obtenemos este bytecode:

::: big-quote
0x60806040525f5f553480156011575f5ffd5b50609b80601d5f395ff3fe6080604052348015600e575f5ffd5b50600436106026575f3560e01c8063d09de08a14602a575b5f5ffd5b60306032565b005b5f54603d9060016041565b5f55565b80820180821115605f57634e487b7160e01b5f52601160045260245ffd5b9291505056fea2646970667358221220e272cd3048050835d3aef9a668053e3787a187208e24b8d32376b227e8a3fb7c64736f6c634300081c0033
:::

Por suerte, no necesitamos ser capaces de leer este código, ya que está destinado a que la máquina virtual lo ejecute. Sin embargo, es importante que entendamos sus **bloques de construcción**.

El bytecode se divide en tres secciones, cada una con un propósito diferente:

- **Código de Creación**: La primera parte del bytecode está destinada a ejecutarse **una sola vez**, cuando se despliega (crea) un contrato. Es un paso de configuración — maneja la asignación de slots a variables, y almacena información necesaria durante la inicialización. Y lo más importante, devuelve la siguiente parte, que es...
- **Código de Ejecución**: La lógica real del contrato, que se almacena en la dirección del contrato. Cuando alguien llama a la función `increment`, aquí es donde vive la lógica de dicha función. Hablaremos un poco más sobre esto en un momento.
- **Metadata**: Finalmente, hay una sección extra que contiene algunos metadatos que pueden ser útiles para diferentes propósitos. No nos enfocaremos en esta sección hoy.

> Si prestas atención, hay un pequeño bloque de instrucciones que se repite en el bytecode de ejemplo: `6080604052`. ¡Te dejo a tu propia curiosidad e investigación entender por qué sucede esto!

¡Genial! Entendemos la estructura general del bytecode. Pero ¿cómo funciona? Centrémonos en el **código de ejecución**, y profundicemos en esas **instrucciones** de las que hemos estado hablando.

### El Conjunto de Instrucciones {#the-instruction-set}

El bytecode está compuesto por instrucciones llamadas **códigos de operación**, o **opcodes** para abreviar. Cada opcode está representado por un **byte** — lo que significa que podríamos tener hasta $2^8 = 256$ instrucciones diferentes.

> Puedes encontrar la lista completa de opcodes [aquí](https://www.evm.codes/). Nota que también tienen costos de gas asociados.

Estos opcodes cubren una amplia variedad de instrucciones, como la operación lógica **AND** ($16$), o el código **KECCAK256** ($20$) para calcular un hash. Algunos de ellos, como **ADD** ($01$), usan la **pila**.

<figure>
  <img
    src="/images/blockchain-101/smart-contracts/the-what.webp" 
    alt="¿El qué?"
    width="600"
  />
</figure>

¡La pila!

La EVM es en realidad una **máquina de pila**, lo que significa que mantiene un registro de una pila para realizar operaciones. Y una [pila](<https://en.wikipedia.org/wiki/Stack_(abstract_data_type)>) es una estructura de datos que sigue el principio **último en entrar, primero en salir** (**LIFO**) — el último elemento en entrar es el que será procesado primero.

> Piensa en ello como una pila de platos: solo puedes agregar platos en la parte superior (push) o quitar platos de la parte superior (pop). Quitar desde abajo, aunque posible, ¡puede resultar en un desastre!

### Funciones {#functions}

Juntar opcodes en el orden correcto nos permite construir programas. Naturalmente, normalmente no hacemos esto manualmente, y en su lugar usamos el nivel más alto de abstracción que proporciona Solidity. Luego compilamos nuestros contratos a bytecode.

Un contrato puede tener muchas **funciones**. Parece que lo único que nos falta es cómo identificar estas funciones en el bytecode, en el sentido de que necesitamos poder decir dónde comienza una función y dónde termina.

Para este propósito, las funciones se identifican mediante **selectores**. Estos se derivan de las firmas de las funciones: su "representación textual", por así decirlo.

> Por ejemplo, la firma de nuestra función increment es simplemente `increment()`, mientras que una función con argumentos puede verse como `transfer(address, uint256)`.

El **selector** (o **identificador**) de la función en el bytecode es simplemente los primeros 4 bytes del **hash de su firma**.

> De nuevo, usando nuestro ejemplo, la firma es `increment()`, cuyo keccak256 es `d09de08ab1a874aadf0a76e6f99a2ec20e431f22bbc101a6c3f718e53646ed8dand`, y si tomamos solo los primeros cuatro bytes, entonces el selector es `d09de08a`. ¡Mira si puedes encontrar eso en el bytecode de antes!

Para ejecutar una función, un usuario que se comunica con un contrato debe enviar un selector de función apropiado. La EVM entonces necesita comparar este selector con los selectores conocidos en el bytecode — en nuestro caso, `d09de08a`. Esto también se hace a través de opcodes: inmediatamente después del selector en nuestro bytecode, podemos ver que:

- Hay una operación **EQ** ($14$), que saca los dos valores superiores de la pila y los compara. Luego empuja un $1$ si coinciden, o un $0$ si no lo hacen.
- Luego, hay un opcode **PUSH1** ($60$) con el valor $2a$ (que en realidad es $42$). Esto empuja dicho valor a la pila.
- Finalmente, encontramos una instrucción **JUMPI** ($57$), que es un salto condicional. Esto saca dos valores de la pila, el primero siendo el **destino**, y el segundo siendo la **condición**. Si la condición es verdadera (representada por un $1$), entonces saltamos a la condición especificada — si no, simplemente continuamos con la siguiente instrucción.

> ¡Puede parecer exagerado, pero así es como funcionan los programas de computadora!

Pensar en términos de la pila no me resulta del todo natural. Si te sientes igual, solo recuerda — típicamente no tendrás que profundizar **tanto**, excepto quizás en casos de uso muy específicos.

Finalmente, una función detiene su ejecución una vez que alcanza un opcode **STOP** ($00$) o **RETURN** ($F3$).

¡Y con eso, hemos cubierto la mayoría de las ideas importantes detrás del bytecode!

---

## Resumen {#summary}

¡Ahí lo tienes! Esos son los Contratos Inteligentes bajo el capó. No tan malo, ¿verdad?

<figure>
  <img
    src="/images/blockchain-101/smart-contracts/batman-holy.webp" 
    alt="Batman, en shock"
    title="Santa madre de Dios"
    width="400"
  />
</figure>

> Si tenías conocimiento previo de cómo funcionan los programas de computadora, esto puede no resultarte tan extraño. Pero si esta es tu primera vez viendo esto, ¡imagino que puede ser bastante abrumador. ¡Tómate tu tiempo!

La buena noticia es que, como he insinuado muchas veces a lo largo del artículo, generalmente no necesitamos involucrarnos **tanto** — al igual que cualquier otro lenguaje de programación, Solidity abstrae muchas de estas complicaciones en un formato más agradable y manejable.

Es cierto que necesitarás aprender Solidity para escribir Contratos Inteligentes. Podemos cubrirlo en el futuro.

Pero al menos, no lo usarás a ciegas: ahora tienes una idea de lo que sucede en el fondo. Con esto, el mundo es tuyo. Ve por ellos, tigre.

---

Lenta pero seguramente, las cosas están tomando forma. Hemos cubierto cómo se maneja el almacenamiento y las estructuras de datos utilizadas para verificar la consistencia de los datos, y ahora sabemos cómo funcionan los Contratos Inteligentes.

¿Qué podemos hacer exactamente con los Contratos Inteligentes? [La próxima vez](/es/blog/blockchain-101/smart-contracts-part-2), nos sumergiremos en algunos programas comunes que se pueden construir con ellos. Conocer lo que es posible es un buen comienzo en el desarrollo de Contratos Inteligentes, y podría despertar tu interés para construir aplicaciones asombrosas. ¡Nos vemos pronto!
