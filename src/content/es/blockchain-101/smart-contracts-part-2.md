---
title: 'Blockchain 101: Contratos Inteligentes (Parte 2)'
date: '2025-02-24'
author: frank-mangone
thumbnail: /images/blockchain-101/smart-contracts-part-2/destruction.webp
tags:
  - ethereum
  - blockchain
  - evm
  - solidity
  - smartContracts
description: >-
  Un enfoque más funcional de los Contratos Inteligentes, explorando Solidity en
  mayor detalle
readingTime: 14 min
mediumUrl: >-
  https://medium.com/@francomangone18/blockchain-101-smart-contracts-part-2-c5211adcd24d
contentHash: a592eb47df19b2111628fc871d89ff635327b68d0157971e3d2aba04cdf2dc84
supabaseId: 8a95c515-308b-4eb7-89f7-54c4486fd80d
---

> Este artículo es parte de una serie más larga sobre Blockchain. Si este es el primer artículo que encuentras, te recomiendo comenzar por el [inicio de la serie](/es/blog/blockchain-101/how-it-all-began).

Francamente, no estaba planeando escribir este artículo en particular. Ni siquiera sabía que necesitaba escribirlo. Pensé que el [artículo anterior](/es/blog/blockchain-101/smart-contracts) era suficiente.

Entender los fundamentos de cómo funcionan los Smart Contracts a bajo nivel me parecía suficiente — ya sabes, para sentir esa satisfacción de tener un entendimiento funcional de un lenguaje de programación que pretendes usar. En mi mente, todo estaba bien.

Vaya que estaba equivocado.

Uno de mis compañeros de trabajo publicó un [Test de Solidity](https://www.rareskills.io/test-yourself) (de [Rareskills](https://www.rareskills.io/), tipos geniales por cierto) en un canal, y entré con alegres expectativas. El test procedió a patearme el trasero sin piedad — solo obtuve un miserable **35%** en mi primer intento.

Había opcodes que no entendía del todo, patrones con los que no tenía experiencia, y en general, detalles de los que no estaba al tanto.

Y entonces me di cuenta: si quería ser bueno en el desarrollo de Smart Contracts, aprender sobre estos patrones y detalles era clave para obtener un entendimiento real del lenguaje.

Así que hoy, quiero centrarme en esos patrones y detalles que son tan importantes de conocer — un paso más allá de nuestro entendimiento básico del lenguaje.

### Antes de Empezar {#before-we-start}

Debo aclarar algo. Smart Contracts y Solidity **no son lo mismo**. Solidity es el lenguaje para desarrollar aplicaciones para la Ethereum Virtual Machine (EVM). La EVM se ha vuelto muy popular, y varias Blockchains han adoptado sus ideas principales y soportan Solidity como su lenguaje de Smart Contracts.

La intención de esta serie es cubrir conceptos generales de Blockchain, pero aquí estamos, profundizando en Solidity. Es por esto que sugiero abordar este artículo con una visión más amplia de lo que podría ser posible en Smart Contracts en general, y no solo centrarse en las particularidades de Solidity.

> ¡A menos, por supuesto, que tu objetivo sea ser un desarrollador de Solidity, en cuyo caso este artículo debería ser bastante útil!

Con esto en mente, ¡empecemos!

---

## Patrones de Llamada {#call-patterns}

Comencemos hablando de algo que hemos dejado de lado hasta ahora: cómo se puede interactuar con la Blockchain. Como hemos mencionado anteriormente, la forma de hacerlo es enviando **transacciones**. Estas están por un lado **firmadas** como medio para probar su autenticidad, proporcionando una manera de verificar que el remitente es quien dice ser.

Pero hoy, queremos olvidarnos de la parte de la firma, y en su lugar centrar nuestra atención en otro asunto apremiante. El cual es: necesitamos una estrategia para **codificar información** en la transacción.

> Por ejemplo, transferir algún token requiere que la transacción especifique una cantidad y un receptor.

Y para entender qué información codificar, primero necesitamos examinar la estructura de las transacciones mismas. Tienen una estructura simple, compuesta por algunos campos: `to` y `from` son direcciones, y luego hay un `value` que es una cantidad de Ether a enviar (bueno, en realidad, Wei a enviar). Esto es todo lo que necesitamos para transferencias estándar de Ether.

Sin embargo, hay algunos campos extra allí. De mayor interés para nosotros es el campo `data`: una simple carga útil de datos hexadecimales. Aquí es donde se puede enviar información extra codificada.

En términos de qué información codificar, hay una distinción que debe hacerse desde el principio: las transacciones pueden estar destinadas ya sea a **desplegar contratos** o a **llamar funciones de contratos**. Estas dos categorías tienen algunas diferencias clave:

- Las **transacciones de despliegue de contratos** no especifican una dirección de destinatario — el campo `to` está vacío (o es la [dirección cero](https://stackoverflow.com/questions/48219716/what-is-address0-in-solidity)). Su campo de datos contiene el bytecode del contrato y cualquier parámetro necesario para la inicialización.
- Las **llamadas a contratos**, por otro lado, interactúan con **contratos existentes**. Especifican la dirección del contrato en el campo `to`, y su campo de datos contiene la información codificada sobre qué función llamar y qué parámetros usar.

Centrémonos primero en lo último.

### Codificando una Llamada a Contrato {#encoding-a-contract-call}

Como ya mencionamos, cuando intentamos llamar a una función de contrato, necesitamos decirle a la EVM qué función llamar y cuáles son los argumentos para la llamada. Ethereum ofrece una forma estándar de hacer esto.

La función en sí se identifica por un **selector**. Discutimos esto en el [artículo anterior](/es/blog/blockchain-101/smart-contracts/#functions). Los primeros $4$ bytes del campo `data` corresponderán entonces al selector de la función.

Después de eso, vienen los parámetros. Cada tipo de parámetro tiene reglas específicas de codificación — por ejemplo, las direcciones se rellenan a $32$ bytes, y los enteros se codifican en formato [big-endian](https://en.wikipedia.org/wiki/Endianness) (es decir, escritos de izquierda a derecha).

> Para una explicación completa sobre cómo funciona la codificación, revisa este [artículo de Rareskills](https://www.rareskills.io/post/abi-encoding). Hay varias reglas que cubrir, y creo que ese artículo las cubre maravillosamente.

Bien, genial. Ahora, ¿qué más podemos hacer?

### Static Calls {#static-calls}

En términos simples, staticcall es como un modo de **solo lectura**.

```solidity
(bool success, bytes memory data) = address.staticcall(
    abi.encodeWithSignature("justLooking()")
);
```

> Aunque el ejemplo anterior es código Solidity, las static calls pueden enviarse directamente a nivel RPC. En lugar de enviar una transacción "normal", que usa el método RPC `eth_sendTransaction`, usamos `eth_call`.

Esto es particularmente útil cuando quieres estar absolutamente seguro de que una llamada **no modificará el estado**.

Adicionalmente, Solidity proporciona un conjunto de **modificadores de función**, entre los cuales podemos encontrar `view` y `pure`:

- Las funciones marcadas como `view` no tienen permitido modificar el estado.
- Las funciones marcadas como `pure` ni siquiera tienen permitido **leer** el estado.

Entonces, ¿por qué se necesita staticcall?

La diferencia radica en cómo y cuándo ocurre la aplicación. Tanto `view` como `pure` son modificadores a nivel de Solidity que ayudan a los desarrolladores a escribir mejor código y realizar verificaciones en tiempo de compilación. Estas verificaciones funcionan muy bien cuando estás trabajando con contratos confiables e implementaciones conocidas.

Sin embargo, cuando se trata de contratos que no controlas o en los que no confías completamente, pueden necesitarse garantías más fuertes. Porque, como siempre, hay personas que quieren ver arder el mundo — y esos a menudo encuentran formas ingeniosas de eludir nuestras medidas de seguridad tan cuidadosamente elaboradas.

<figure>
  <img
    src="/images/blockchain-101/smart-contracts-part-2/dr-evil.webp" 
    alt="Dr Evil"
    title="Eres el mejor hijo malvado que un padre malvado podría pedir"
    width="600"
  />
</figure>

Considera este escenario: se te dice que interactúes con un contrato que dice ser de solo lectura, pero en realidad no lo es. Claro, podrías analizar su bytecode para verificar su comportamiento, ya que los modificadores `view` están incluidos en él. Pero esto es como mínimo **poco práctico**, y se vuelve aún más engorroso con patrones de interacción complejos — delegate calls, proxies, o cualquier tipo de interacciones dinámicas con contratos.

Entonces, ¿cómo manejamos estos escenarios de forma segura? ¡Usando staticcall, por supuesto!

Usarlo hace que la llamada sea verdaderamente de solo lectura, sin sorpresas. Te da una garantía durante la ejecución de que una llamada no modificará el estado, sin importar qué.

### Delegate Calls {#delegate-calls}

En circunstancias normales, cada contrato maneja su propio almacenamiento — la única forma de cambiarlo es a través de las funciones del contrato.

Ahora, ¿qué pasaría si pudiéramos hacer que un contrato permita que **otro contrato** cambie su estado? Si de alguna manera confiamos en que este contrato permitido manejará el almacenamiento de manera responsable, ¡entonces no debería haber mucho de qué preocuparse!

Esto es exactamente lo que hace el [opcode DELEGATECALL](https://www.evm.codes/?fork=cancun#f4).

> Fue introducido en uno de esos EIPs de los primeros días, [EIP-7](https://eips.ethereum.org/EIPS/eip-7).

En pocas palabras, **delega** la ejecución de una llamada a otro contrato, pero usando el almacenamiento del contrato original (y el contexto, en general).

```solidity
interface ISharedStorage {
    function someValue() external view returns (uint256);
    function lastCaller() external view returns (address);
}

// Este contrato mantiene el estado pero delega la ejecución
contract Borrower is ISharedStorage {
    uint256 public someValue;
    address public lastCaller;

    event DelegateCallResult(bool success, uint256 newValue);

    function delegate(address lender, uint256 newValue) external {
        // Codifica la llamada a función con parámetros
        (bool success, ) = lender.delegatecall(
            abi.encodeWithSignature("doSomething(uint256)", newValue)
        );

        emit DelegateCallResult(success, someValue);
    }
}

// Este contrato proporciona la lógica pero opera sobre el almacenamiento de Borrower
contract Lender is ISharedStorage {
    uint256 public someValue;
    address public lastCaller;

    function doSomething(uint256 newValue) external {
        // Estas modificaciones afectarán el almacenamiento de Borrower
        someValue = newValue;
        lastCaller = msg.sender;  // Esto será el EOA que llamó a Borrower
    }
}
```

> Si **no** usamos delegatecall en el último ejemplo, entonces aún podemos referirnos al remitente original con `tx.origin`, pero `msg.sender` cambiará.

Por supuesto, el contrato objetivo necesita ser consciente del diseño de almacenamiento en el contrato fuente. Por lo tanto, realmente define el mismo almacenamiento, pero no mantiene nada en su trie — todo se almacena en el contrato fuente.

En pocas palabras, es un **patrón proxy**, propuesto por primera vez en [EIP-1967](https://eips.ethereum.org/EIPS/eip-1967). Este tipo de comportamiento proxy permite un instrumento útil: **contratos actualizables**. La idea es que la definición del estado permanece sin cambios en el contrato fuente, pero las reglas de ejecución pueden cambiarse apuntando a un contrato proxy diferente y solicitando la ejecución a través del uso de delegatecall.

> Pero esta característica no viene gratis. Si la nueva implementación del proxy resulta causar estragos en el estado, uno puede enfrentar daños irreversibles. Uno debe ser muy cuidadoso al implementar nuevas implementaciones de contratos proxy. Como dijo el tío Ben una vez, "un gran poder conlleva una gran responsabilidad".

<figure>
  <img
    src="/images/blockchain-101/smart-contracts-part-2/uncle-ben.webp" 
    alt="Tío Ben de Spiderman"
    title="Y luego dijo: 'no implementes proxies sin revisar y probar primero'"
    width="600"
  />
</figure>

---

## Patrones de Despliegue de Contratos {#contract-deployment-patterns}

¡Bien! Hemos cubierto un par de formas de interactuar con contratos existentes. Es hora de hablar sobre la **creación de contratos**.

Ya discutimos brevemente cómo desplegar un contrato: todo lo que necesitamos es enviar una transacción a la dirección cero, con el campo `data` conteniendo toda la información necesaria para crear el contrato.

Y de hecho, ya sabemos qué poner en ese campo de datos — hablamos de ello en el [artículo anterior](/es/blog/blockchain-101/smart-contracts).

> Una cosa que vale la pena aclarar es que el código de creación del bytecode contiene realmente parámetros del constructor, por lo que esa parte variará para cada despliegue.

¡Fantástico! Tenemos nuestra transacción lista para enviar para el despliegue del contrato. ¿Qué sucede después?

Internamente, la EVM usará el [opcode CREATE](https://www.evm.codes/?fork=cancun#f0). Al hacerlo, asignará al contrato una **dirección** calculada de manera determinista. Lo hace calculando un hash, cuyos inputs son la dirección del desplegador y el nonce de la transacción:

```solidity
address = keccak256(rlp.encode([deployer_address, nonce]))
```

Esto tiene un par de consecuencias interesantes.

Primero, si enviamos exactamente la misma transacción de despliegue (solo cambiando el nonce), obtendremos exactamente el mismo contrato que antes, pero desplegado en una **dirección diferente**. En segundo lugar, la dirección del contrato es **predecible**, siempre y cuando conozcas el nonce.

Y por último, **no podemos elegir** la dirección resultante. En algunos casos, tener más control sobre esto es deseable — por ejemplo, si queremos tener un contrato desplegado en dos redes (compatibles con EVM) con exactamente la misma dirección.

> Si llegas a perder un nonce debido a una simple transferencia, tus nonces podrían desincronizarse, resultando en diferentes direcciones de contrato, y terminarías teniendo que redesplegar cosas, gastando más gas en el proceso, y terminando con "contratos muertos".

<figure>
  <img
    src="/images/blockchain-101/smart-contracts-part-2/not-again.webp" 
    alt="Robert Downey Junior rodando los ojos"
    title="Ugh"
    width="500"
  />
</figure>

Ir por la ruta del hash parece poco confiable en el mejor de los casos, y tedioso como mínimo.

### Controlando la Dirección {#controlling-the-address}

Aquí es donde entra en juego otro opcode: [CREATE2](https://www.evm.codes/?fork=cancun#f5). Introducido en [EIP-1014](https://eips.ethereum.org/EIPS/eip-1014), lo que hace es muy simple: en lugar de depender de un nonce que cambia constantemente, nos permite elegir un **salt**.

¡Con este simple ajuste, la dirección depende exclusivamente de cosas que podemos controlar! Podemos saber exactamente dónde se desplegará un contrato por adelantado, independientemente del nonce.

> Esto presenta un conjunto de posibilidades interesantes. Como mencioné antes, te permite desplegar fácilmente el mismo contrato (con la misma dirección) en diferentes Blockchains. Pero también ayuda si necesitas coordinar despliegues complejos donde los contratos necesitan conocer las direcciones de los demás por adelantado.

---

## Características de los Contratos {#contract-features}

Hemos cubierto las diversas formas de desplegar e interactuar con contratos. Cambiemos ahora de marcha y hablemos de algunas características especiales que pueden tener los contratos.

> La mayor parte de esta sección será sobre [modificadores](https://mdjamilkashemporosh.medium.com/modifiers-in-solidity-public-private-internal-and-external-764d0aae9c#:~:text=Modifiers%20in%20Solidity%20are%20special,variables%20within%20a%20smart%20contract.). Son esencialmente como etiquetas que ponemos en las funciones para cambiar su comportamiento. También podemos construir modificadores personalizados, pero ahora nos centraremos en los proporcionados por el lenguaje.

### Visibilidad de Funciones {#function-visibility}

Nuestro primer tema se relaciona con el control de la visibilidad de las funciones — esto es, **quién puede llamar a una función**.

Hay en total cuatro modificadores de visibilidad: `external`, `public`, `internal`, y `private`. De todos, `external` es el más interesante, así que dejémoslo para el final.

Realmente, las funciones `internal` se comportan como funciones `protected` en la Programación Orientada a Objetos (POO) regular. Entonces, tenemos funciones `public`, visibles para cualquier llamador. Luego están las funciones `internal`, que solo pueden ser llamadas desde el contrato mismo o sus contratos **hijos** o **derivados**. Y finalmente, las funciones `private` solo pueden ser llamadas desde el contrato en el que están definidas.

<figure>
  <img
    src="/images/blockchain-101/smart-contracts-part-2/oop.webp" 
    alt="Programación Orientada a Objetos"
    width="500"
  />
</figure>

Con eso aclarado, hablemos de las funciones `external`. Estas están bastante obviamente destinadas a ser llamadas solo desde fuera del contrato.

¿Qué tiene esto de interesante, si ya tenemos funciones `public`? La respuesta es que este conocimiento adicional permite a la EVM hacer **optimizaciones**.

> Odio la palabra **optimizaciones**. Deberían llamarse **mejoras**. [Optimizar algo](https://en.wikipedia.org/wiki/Mathematical_optimization) se refiere al acto de encontrar extremos (mínimos o máximos), que **no** es lo que estamos haciendo aquí. Solo quería decir eso.

Cada vez que se llama a una función, sus argumentos se copian a la **memoria**. Al igual que cualquier lenguaje de programación, la memoria es un espacio temporal que puede contener información, y puede ser leída y escrita.

> Hay mucho que decir sobre la memoria, pero no lo cubriré esta vez. ¡Aquí hay un [artículo muy detallado sobre la memoria en EVM](https://medium.com/coinmonks/solidity-memory-how-does-it-work-d40e04b97cf0), si te interesa!

Copiar cosas a memoria **consume gas**, lo que significa que hace las transacciones un poco más costosas.

Las llamadas externas pueden evitar este paso de copiado, ¡porque los argumentos están disponibles en una ubicación especial: los **datos de llamada**! Debido a esto, agregar este modificador nos ahorra un poco de gas. ¡Bastante ingenioso!

### Funciones Virtuales {#virtual-functions}

Como ya se ha sugerido, los contratos a menudo extienden otros contratos, de manera similar a la herencia de clases (estilo POO).

En este tipo de contexto, a veces solo queremos escribir un contrato para que otros contratos lo extiendan y modifiquen. Aquí es donde entran las **funciones virtuales**: son como un marcador que dice "¡hey, puedes sobrescribir esto!".

La contraparte del modificador `virtual` es el modificador `override`, que específicamente (y obviamente) indica que una función sobrescribe la función virtual objetivo:

```solidity
contract Base {
  function someOperation() public virtual returns (uint) {
    return 42;
  }
}

contract Extended is Base {
  function someOperation() public override returns (uint) {
    return super.someOperation() * 2;
  }
}
```

Las funciones virtuales pueden dejarse sin implementación — pero en ese caso, también necesitan tener el modificador `abstract`, lo que significa que una definición de función **debe** ser proporcionada por un contrato hijo. Si no usamos `abstract`, sin embargo, proporcionar una implementación es **opcional**. Si no sobrescribimos una función, simplemente estaremos usando la implementación predeterminada en la definición de la función `virtual`.

### La Bandera Payable {#the-payable-flag}

Cuando hablamos de qué claves componen una transacción, mencionamos que una de las cosas que se pueden especificar es `value`, que determina una cantidad de Ether (o Wei, realmente) a transferir.

Usualmente, este valor se usa para transferir Ether de un EOA a otro. Aunque nada nos impide establecer un valor en una transacción que está destinada a ser una llamada a función de contrato. ¿Qué sucede entonces?

Supongamos que llamamos a algún método `deposit` en un contrato. Por defecto, los contratos **no esperan** recibir Ether. Y así, una llamada a este método fallará si hay un `value` adjunto.

> Esta es una característica de seguridad — no queremos que los contratos reciban accidentalmente Ether que pueden no saber cómo manejar.

La transacción se revierte a menos que marquemos la función `deposit` como `payable`:

```solidity
function deposit() external payable {
  // ...
}
```

El modificador `payable` simplemente le dice a Solidity que un valor de Ether **es válido** en una llamada a la función marcada. Y como desarrolladores, tenemos acceso a ese valor en forma de `msg.value`. Por ejemplo, este contrato funciona como una **bóveda**, manteniendo el Ether transferido de las cuentas y llevando un registro de los saldos de las diferentes cuentas a través de un mapping:

```solidity
contract Vault {
    mapping(address => uint256) balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdrawAll() external {
        uint256 amount = balances[msg.sender];
        balances[msg.sender] = 0;

        // Enviar el ether de vuelta al llamador
        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
}
```

Solo un ejemplo rápido y divertido — pero aquí, ya puedes ver cómo tiene sentido que este contrato reciba Ether y realmente haga algo con él.

> Payable también se aplica al constructor, por cierto. Si quieres que tu contrato pueda recibir Ether durante el despliegue, ¡solo marca el constructor como payable!

Ahora, te podrías estar preguntando... ¿Pero qué pasa si llamo a un método que **no existe**? ¿O incluso llamo a un contrato sin un método! ¿Cómo funciona esto con `payable`?

### Capturando Llamadas Desconocidas {#catching-unknown-calls}

Solidity (y la EVM) proporcionan dos funciones especiales para manejar estos casos límite: las funciones **fallback** y **receive**.

Es muy simple, realmente:

- La función `fallback` se llama cuando alguien llama a un método que **no existe**, o los datos de la llamada no coinciden con ninguna función (lo que significa que las entradas proporcionadas no coinciden con las esperadas).
- La función `receive` es aún más específica: solo se llama cuando alguien envía Ether a una dirección de contrato, sin adjuntar ningún dato de llamada.

```solidity
function fallback() external {
  // Manejar llamadas desconocidas
}

function receive() external payable {
 // Manejar transferencias simples de Ether
}
```

> Como puedes ver, `receive` está marcada como `payable`, para que la transacción no se revierta y el contrato pueda recibir Ether.

Estas son como redes de seguridad de un contrato. Capturan cualquier interacción inesperada con él. Y aunque este es su propósito principal, permiten algunos patrones bastante interesantes, como este [contrato Proxy](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/3bdc3a35c504396c7227cecc32f50ae07da7e5c1/contracts/proxy/Proxy.sol#L59) que delega todas las llamadas a otro contrato, ¡usando una herramienta que ya hemos cubierto: el opcode delegatecall!

> Oh, y si un contrato no tiene una implementación para ninguna de las funciones, asume que su cuerpo está vacío, pero las ejecuta de todos modos si es necesario.

Es agradable ver cómo las piezas encajan, ¿no?

<video-embed src="https://www.youtube.com/watch?v=CpjH9M2SYsk" />

### Destruyendo un Contrato {#destroying-a-contract}

Una buena manera de continuar después de ese meme de Homelander es hablar sobre la destrucción de contratos. Sip.

<figure>
  <img
    src="/images/blockchain-101/smart-contracts-part-2/destruction.webp" 
    alt="Homelander usando su láser"
    width="600"
  />
</figure>

Hay un opcode especial para esto, llamado [SELFDESTRUCT](https://www.evm.codes/?fork=cancun#ff).

```solidity
function destroy() external {
  require(msg.sender == owner);
  selfdestruct(payable(someAddress));
}
```

Cuando se llama a este opcode, suceden tres cosas:

- Todo el Ether restante en el contrato se envía forzadamente a la dirección especificada, incluso si no tiene una función receive.
- El código y almacenamiento del contrato se eliminan del estado de la blockchain.
- Todas las llamadas futuras a la dirección del contrato fallarán.

Esta funcionalidad — por cool que parezca — generalmente se considera **peligrosa**. En particular, cuando se combina con **CREATE2**. Imagina que alguien destruye un contrato que has estado usando y lo reemplaza con uno malicioso con la misma dirección. No es cool, hermano.

<figure>
  <img
    src="/images/blockchain-101/smart-contracts-part-2/evil-woody.webp" 
    alt="Meme de Woody malvado"
    title="Así es como me imagino que se ve alguien cuando hace estas cosas."
    width="500"
  />
</figure>

La recomendación general es usar el patrón proxy que mencionamos antes para contratos actualizables, o usar una simple bandera booleana si tu intención es deshabilitar un contrato. Estos patrones son generalmente más seguros para todos los involucrados.

> De hecho, ha habido [discusiones en la comunidad de Ethereum](https://ethereum-magicians.org/t/eip-6780-deactivate-selfdestruct-except-where-it-occurs-in-the-same-transaction-in-which-a-contract-was-created/13539/19) para eliminar el código selfdestruct por completo.

---

## Resumen {#summary}

Bueno, eso fue mucho para digerir, sin duda.

Hemos cubierto varios patrones de llamada, diferentes métodos de despliegue de transacciones, y funciones y modificadores especiales. Esto debería servir como un buen punto de partida, como mínimo.

Me parece que después de leer este artículo, podrías reconocer algunas de las preguntas de ese [test de Rareskills](https://www.rareskills.io/test-yourself) — y ahora, realmente sabrás cómo responder algunas de ellas.

> ¡No todas ellas, sin embargo!

Realmente hay mucho que saber no solo sobre Solidity, sino también sobre Ethereum en su conjunto y sus diversos estándares (ERCs).

La comunidad siempre está empujando para evolucionar la red, revisando no solo los estándares aceptados, sino cómo funciona la red en su conjunto. Por lo tanto, es importante mantenerse actualizado sobre los últimos desarrollos.

Soy un firme creyente de que la mejor manera de aprender cosas es haciéndolas — ya sabes, ensuciándote un poco las manos. La teoría siempre es buena, pero seguramente nunca olvidarás una lucha de tres horas tratando de entender por qué tu Smart Contract no está haciendo lo que se supone que debe hacer.

Así que métete en ello, juega con algunas ideas, y seguramente aprenderás mucho más de lo que este artículo solo puede proporcionar.

---

Después de pasar dos artículos cubriendo bastantes cosas sobre los entresijos de Solidity, sería bueno dar un paso atrás y mirar el panorama general. [La próxima vez](/es/blog/blockchain-101/consensus-revisited), revisitaremos un tema familiar — esta vez desde la perspectiva de Ethereum: el **consenso**.

¡Nos vemos pronto!
