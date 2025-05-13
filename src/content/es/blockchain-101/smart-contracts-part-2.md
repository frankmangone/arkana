---
title: "Blockchain 101: Contratos Inteligentes (Parte 2)"
date: "2025-02-24"
author: "frank-mangone"
thumbnail: "/images/blockchain-101/smart-contracts-part-2/destruction.webp"
tags: ["ethereum", "blockchain", "evm", "solidity", "smartContracts"]
description: "Un enfoque más funcional de los Contratos Inteligentes, explorando Solidity en mayor detalle"
readingTime: "14 min"
mediumUrl: "https://medium.com/@francomangone18/blockchain-101-smart-contracts-part-2-c5211adcd24d"
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
