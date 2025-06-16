---
title: 'Blockchain 101: Programas en Solana'
date: '2025-06-09'
author: frank-mangone
thumbnail: /images/blockchain-101/solana-programs/joey-shocked.webp
tags:
  - solana
  - blockchain
  - parallelization
description: >-
  Después de ver algunos matices en el consenso de Solana, ¡ahora nos enfocamos
  en su capa de ejecución!
readingTime: 11 min
contentHash: e85b3801606ec3a32885a55a214bd64c428e4778a32adc8d1a7970d1a7b28b16
supabaseId: 3cae6d17-1a24-4a61-86c4-2c1052cd2528
---

> Esto es parte de una serie más amplia de artículos sobre Blockchain. Si este es el primer artículo que encuentras, recomiendo encarecidamente empezar desde el [comienzo de la serie](/es/blog/blockchain-101/how-it-all-began).

En el [último episodio](/es/blog/blockchain-101/solana), comenzamos a aventurarnos en el territorio de Solana, abordando cómo esta Blockchain incorpora el concepto de **tiempo** en la ecuación, proporcionando una forma simple pero inteligente de ubicar en el tiempo (timestamp) a las transacciones.

Pero esta no es la única idea novedosa que Solana trae a la mesa para los propósitos de esta serie.

Cuando vimos los **Contratos Inteligentes**, dedicamos mucho esfuerzo a explicar cómo funciona la [Máquina Virtual de Ethereum](/es/blog/blockchain-101/smart-contracts) (EVM) — un conjunto de reglas bien definidas que nos permiten escribir programas.

Sin embargo, no todas las Blockchains siguen estas reglas, y algunas han probado enfoques alternativos en busca de formas más convenientes — y tal vez mejores — de abordar la programabilidad.

Una de estas Blockchains resulta ser Solana. ¡Y hoy, veremos su solución!

---

## El Modelo de Cuentas {#the-account-model}

Antes de hablar de programabilidad, necesitaremos entender algunas cosas más sobre esta Blockchain.

En particular, nos importa cómo se manejan las **cuentas** (accounts). Al igual que cualquier Blockchain EVM, Solana también guarda todos los datos asociados con una sola **dirección** (address) en una cuenta.

Sin embargo, hay una diferencia crucial: mientras que las Blockchains EVM agrupan tanto **código** como **estado** juntos en cuentas de Contratos Inteligentes, Solana deliberadamente separa el **código ejecutable** del **estado del programa**. La primera parte se almacena en **Programas**, mientras que la segunda vive en **Cuentas**.

La pregunta obvia que hacer es **¿por qué hacer esto?** ¿Qué hay para ganar?

Puede que no sea obvio, pero la respuesta es simple: permite cierto grado de **paralelización**.

> Para explicar lo que quiero decir con esto, veamos un ejemplo rápido.
>
> Digamos que tenemos dos transacciones que viven en el mismo Programa. Pero la transacción 1 solo toca un estado que vive en la cuenta 1, mientras que la transacción 2 solo afecta un estado que reside en la cuenta 2. Por lo tanto, como son completamente independientes, ¡Solana puede ejecutar estas transacciones **al mismo tiempo** — en **paralelo**!

La arquitectura EVM no permite eso de forma nativa, porque un Contrato Inteligente y su estado están **estrechamente acoplados**, y sería muy difícil determinar si dos transacciones son completamente independientes, al menos de forma general.

Llegaremos a los programas en un momento — pero primero, veamos qué son las **Cuentas** en Solana.

### Estructura de una Cuenta {#account-structure}

No debería sorprendernos que cada **entidad** en Solana sea una cuenta — después de todo, lo mismo pasaba en los sistemas EVM (con EOAs y Cuentas de Contrato).

En términos de su estructura, son bestias bastante simples: todo lo que necesitamos para representarlas son unos pocos pares clave/valor (de nuevo, nada sorprendente), que son:

- **Lamports**: el balance de la cuenta. Un SOL es equivalente a [1.000.000.000 lamports](https://www.solconverter.com/), que es la fracción mínima de un SOL (el token nativo de Solana).
- **Data**: todo lo que se almacena en la cuenta, como un array de bytes. Veremos qué vive aquí en un segundo.
- **Owner**: una dirección que posee la cuenta. Cada cuenta tiene un propietario — ¡y puede que no sea quien piensas que es!
- **Executable**: si esta cuenta es ejecutable o no. Y sí, esto determinará si esto es un Programa o no.

<figure>
  <img
    src="/images/blockchain-101/solana-programs/account.webp" 
    alt="Las claves en una cuenta de Solana"
    title="[zoom]"
  />
</figure>

Hasta ahora, ¡todo bien! Ya hemos pasado por algunas cuántas batallas, así que no debería haber nada misterioso sobre estas ideas — de hecho, no deberían sentirse extrañas para ustedes en absoluto.

> Y si lo son, ¡vayan a leer los artículos anteriores!

<figure>
  <img
    src="/images/blockchain-101/solana-programs/seriously.webp" 
    alt="Una chica con una cara muy seria"
    title="En serio, vayan a leerlos"
    width="500"
  />
</figure>

Okay, digamos que queremos empezar a usar Solana, ¡así que vamos a necesitar nuestra propia cuenta!

Por supuesto, necesitaremos un **par de claves** (o **keypair**, una clave privada y una pública) para firmar transacciones, y por supuesto, la **dirección** asociada con dicho keypair.

> Solana usa la curva [ed25519](https://solana.com/developers/cookbook/wallets/check-publickey), que es bastante estándar.

Supongo que esperarías que el **propietario** de una cuenta sea la dirección pública que la controla, ¿verdad? Esa fue mi intuición, al menos. Imaginen mi sorpresa cuando aprendí que **estaba equivocado**.

<figure>
  <img
    src="/images/blockchain-101/solana-programs/joey-shocked.webp" 
    alt="Joey de Friends, en shock"
    title="¿Qué dijiste?"
    width="600"
  />
</figure>

¡Sí! Todas las **cuentas de billetera** en Solana son propiedad de lo que se llama el **System Program**.

Este System Program es el **único programa** que puede crear cuentas, y también contiene la lógica para ejecutar transacciones firmadas por usuarios.

> También hace [un par de cosas más](https://solana.com/docs/core/accounts#system-program).

Lo sé. Es un poco raro decir que **no eres dueño** de tu billetera. La verdad es que esto solo funciona como un único punto de entrada para el procesamiento de transacciones, pero en realidad, todas las transacciones deben estar **firmadas** — el System Program no puede cambiar ningún estado sin dichas transacciones firmadas. ¡Así que **sí posees** tu cuenta, pero a través de tu **clave privada**!

¡Genial! Ahora tenemos una billetera. ¿Qué hay entonces de los Programas?

---

## Programas {#programs}

> ¡A lo divertido!

Los **Programas** son la versión de Solana de los Contratos Inteligentes. Como esperarías por todo el preámbulo, estos son simplemente **cuentas** cuyo campo `executable` está establecido en true.

Y necesitamos almacenar el **bytecode** en algún lugar, ¿verdad? ¿Te animas a adivinar dónde se almacenará?

<figure>
  <img
    src="/images/blockchain-101/solana-programs/no-spoilers.png" 
    alt="Jake Peralta de Brooklyn 99 en la escena 'No spoilers'"
    width="600"
  />
</figure>

¡En el campo `data`, por supuesto! Después de todo, el bytecode es solo un array enorme de bytes.

La otra pregunta que podríamos tener en este punto es **quién posee las cuentas de Programa**. No voy a pedirte que adivines esta vez, porque no es evidente para nada.

Los Programas son creados por **otros Programas** — en particular, por un conjunto especial llamado **Loader Programs**. O bueno, **casi**.

Las cuentas, como ya sabemos, necesitan ser creadas por el System Program. Pero luego, estos Loader Programs son **asignados como propietarios** de la nueva cuenta, y solo entonces establecen el campo `data` al bytecode del Programa.

> Como una especie de instalador. ¡Ah, y también establecen el campo `executable` en true!

De nuevo, el resultado final es que un programa **no es de tu propiedad**, es decir, no es de quien lo despliega. Sin embargo, eso está bien — es simplemente una decisión arquitectónica de la Blockchain, y le permite ejecutar transacciones de manera organizada.

### Actualizabilidad {#upgradeability}

Si estos Loader Programs pueden establecer el bytecode... ¿Significa eso que los Programas de Solana son **actualizables**? Es decir, ¿se puede **cambiar** su código?

<figure>
  <img
    src="/images/blockchain-101/solana-programs/upgrade.webp" 
    alt="Un botón de actualización"
    width="600"
  />
</figure>

En resumen: **¡sí!** Aunque bajo [ciertas condiciones](https://solana.com/docs/programs/deploying): se deben usar los últimos Loader Programs, y solo podemos realizar actualizaciones si se establece una **autoridad de actualización**. Los programas son [mutables por defecto](https://www.rareskills.io/post/solana-anchor-deploy#:~:text=Solana%20programs%20are%20mutable%20by%20default), lo que significa que la autoridad de actualización se establece al desplegar (con el valor de la dirección del desplegador), y esa cuenta tiene permisos para **cambiar el código**.

> Más tarde, la autoridad puede establecerse como **none**, haciendo el Programa **inmutable**.

Esto puede sonar dudoso, especialmente después de nuestra expedición por Ethereum, donde se asume la **inmutabilidad**. Sin embargo, podemos construir contratos actualizables en Solidity a través de [proxies y delegatecalls](/es/blog/blockchain-101/smart-contracts-part-2/#delegate-calls) — así que **funcionalmente hablando**, esto no es nada nuevo.

Sin embargo, los Programas inmutables son importantes: son cruciales para construir **confianza**. Como usuarios, esperaríamos que los Programas se comporten consistentemente, y que no pase nada raro cuando movemos nuestros fondos — especialmente ninguna **actividad maliciosa**. Así que aunque es normal cambiar el código durante las etapas de desarrollo de los Programas, generalmente se espera que los **hagamos inmutables** cuando están en producción.

Con esto fuera del camino, veamos **cómo realmente funcionan** los Programas.

### Programas en Acción {#programs-in-action}

Interactuar con un Programa involucra crear una **transacción**, como estoy seguro que ya esperabas. Pero recuerda — los Programas y el estado se almacenan **por separado** en Solana, lo que significa que simplemente especificar qué Programa llamar **no es suficiente** en esta Blockchain.

Cada Programa tiene su propia **dirección**, que usaremos en la transacción que estamos construyendo. Además, también necesitaremos especificar en qué **cuentas** debe operar el Programa — el **estado** que queremos modificar.

Pero espera... ¿Puede cualquier Programa cambiar el estado de cualquier cuenta de cualquier manera que le de la gana? Suena como una receta para el **desastre**. **Debe** haber algunas restricciones sobre lo que los Programas pueden hacer, ¿verdad? **¿Verdad?**

<figure>
  <img
    src="/images/blockchain-101/solana-programs/vietnam.webp" 
    alt="Flashbacks de Vietnam"
    width="600"
  />
</figure>

Bueno, ¡por supuesto! Si no, el sistema sería un **caos total**.

Y aquí es donde el sistema de propiedad realmente brilla: la restricción más importante es simplemente que el Programa que se ejecuta **sea dueño** de la cuenta cuyo estado quiere modificar.

> Comparar con EVM puede ayudar a cementar esta idea. Se pueden desplegar múltiples instancias de un Contrato Inteligente, pero en realidad, todas compartirán la misma lógica. Es algo ineficiente hacer esto, ya que estamos ocupando espacio en la Blockchain para almacenar el mismo código una y otra vez.
>
> En Solana, como el estado **no está vinculado** a la lógica, ¡podemos simplemente reutilizar un programa y solo crear nuevas cuentas para nuevos estados, efectivamente **reutilizando código**!

Toda esta información es muy teórica, así que propongo que veamos un ejemplo práctico para ver si hay algún otro problema que podamos encontrar.

Intentemos construir un **Token Program**, similar a un ERC20.

Solidity proporciona **mappings** para esto — pero ¿cuál es el equivalente de Solana para esto? Solo tenemos **cuentas**, y no hay estructuras de datos ricas como mappings a la vista. ¿Qué hacemos entonces?

Nuestro objetivo es llevar un registro de cuántos tokens posee cada usuario. Así que acá va una idea: creemos una **cuenta separada** para almacenar **el saldo de cada usuario**.

<figure>
  <img
    src="/images/blockchain-101/solana-programs/brilliant.webp" 
    alt="Doc de Volver al Futuro con el subtexto 'Brillante'"
    width="500"
  />
</figure>

Pero... ¿Qué cuentas? Quiero decir, no podemos simplemente elegir direcciones aleatorias, ¿verdad?

> Imaginen que cada usuario tenga que recordar su dirección de cuenta para cada token que posee. ¡Eso sería una terrible UX!

Idealmente, querríamos desarrollar un **sistema** para obtener estas cuentas de saldo de usuario, de manera determinística, no solo para la asignación inicial de saldo, sino también para procesar transacciones.

Afortunadamente, los creadores de Solana también identificaron este problema cuando estaban diseñando su sistema, y se les ocurrió una solución elegante: **Program Derived Addresses**, o **PDAs** para abreviar.

### Program Derived Addresses {#program-derived-addresses}

Cuando estábamos viendo Ethereum, **ya enfrentamos** este problema. Los mappings eran solo una abstracción conveniente — la EVM tenía que hacer algo de magia negra en el fondo para calcular dónde se almacenaban realmente los datos.

La historia no es muy diferente ahora, pero tiene algunos matices diferentes. Un **PDA** es esencialmente una forma de poner alguna clave (como una dirección de usuario, un ID de token, o cualquier otro valor), y algún otro valor específico del programa llamado **seed**, en una **licuadora determinística**. Lo que significa que cada programa sabrá dónde almacenar datos para cada identificador (en nuestro caso, dirección), y no necesitaremos recordar nada — ¡el programa puede calcularlo por nosotros!

> El seed puede ser literalmente cualquier cosa — ¡es solo un array de bytes!

<figure>
  <img
    src="/images/blockchain-101/solana-programs/pda.webp" 
    alt="Esquema de derivación PDA"
    title="[zoom]"
  />
</figure>

Ahora, el tipo más simple de licuadora determinística que conocemos son las [funciones de hash](/es/blog/cryptography-101/hashing). Podríamos ir por esa ruta, sí, pero estamos hablando de Program Derived **Addresses**, no **Hashes**.

> Muy sospechoso, diría yo.

Y por supuesto, algo interesante pasa por detrás.

Empezamos hasheando nuestra identificador objetivo y nuestro seed, usando la función de hash elegida por Solana, [SHA-256](https://en.wikipedia.org/wiki/SHA-2) — la misma que se usa para su Proof of History.

Aquí es donde se pone interesante: el output de SHA-256 tiene exactamente **32 bytes**, que resulta coincidir con el tamaño de un **punto de curva ed25519**.

¿Por qué importa esto? Porque si nuestro hash resulta **estar en la curva**, entonces eso significaría que es una **clave pública válida**.

> Desde la perspectiva matemática, puedes leer más sobre esto ya sea [aquí](/es/blog/cryptography-101/encryption-and-digital-signatures/#key-pairs) o [aquí](/es/blog/elliptic-curves-in-depth/part-3).
>
> Y para evitar confusión, las direcciones de Solana asociadas con claves privadas reales son solo las [claves públicas codificadas en base58](https://solana.com/docs/core/accounts#account).

Eso no es bueno — implicaría que existe alguna **clave privada** que puede controlar dicha cuenta. Recuerda, estamos tratando de generar cuentas para almacenar información para un Programa, quien debería ser la única autoridad sobre dicha nueva cuenta. Sin embargo, si existe la posibilidad de que alguien tenga control sobre ella, ¡entonces esto pondría en jaque todas las garantías de ejecución de Solana!

Para mitigar esto, los PDAs usan un **truco inteligente**. Durante la generación, si el hash resulta ser un punto válido de la curva, entonces se **descarta**, y el proceso comienza de nuevo agregando un **pequeño bump**. Este bump funciona esencialmente como las **sales** (salts) o **nonces** — y ayudará a producir un hash completamente diferente. Repetimos este proceso hasta que obtenemos un hash que **no** es un punto válido en la curva — ¡y ahí lo tienes! Una dirección válida, sin clave privada.

<figure>
  <img
    src="/images/blockchain-101/solana-programs/nice.webp" 
    alt="Mike de The Office"
    title="Bien"
    width="500"
  />
</figure>

La última pieza del rompecabezas es que este bump se obtiene de una **secuencia de enteros**, que van del $255$ al $0$. Como consecuencia, no necesita almacenarse en ningún lugar — cada vez que un PDA necesita ser calculado, el mismo proceso determinístico puede ejecutarse, y detenerse en el **primer bump válido**.

> Aun así, creo que el bump es **cacheado localmente** para mayor eficiencia a veces.

¡Y ahí lo tienes! ¡Estructuras tipo hashmap en Solana, usando nada más que sus elementos nativos! ¿No es genial?

---

## Resumen {#summary}

Naturalmente, hay mucho más que decir sobre el ecosistema de Solana.

Mi objetivo no es cubrir cada detalle sobre cada protocolo — de lo contrario, ¡no podría terminar esta serie **jamás**!

> Si estás interesado en profundizar, algunos temas que vale la pena explorar incluyen **Cross-Program Invocation** (cómo los programas llaman a otros programas), el pipeline de procesamiento de transacciones del runtime de Solana, los varios programas nativos que proporcionan funcionalidad central de la Blockchain, o características geniales como soporte para [firmas parciales](https://solana.com/developers/cookbook/transactions/offline-transactions) y [patrocinio de fees](https://docs.privy.io/wallets/gas-and-asset-management/gas/solana).

Sin embargo, hemos cubierto bastante terreno en estos últimos dos artículos. Creo que hemos tocado los dos puntos más críticos que Solana trae a la mesa: su [Proof of History](/es/blog/blockchain-101/solana/#timestamping-in-action), y ahora su modelo de cuentas, que marca nuestra primera partida del modelo EVM.

Alguna veces, esta arquitecture de cuentas y toda la suite de programas alrededor de ella se llama la [Solana Virtual Machine](https://solana.com/developers/evm-to-svm/smart-contracts), o SVM. Creo que el término no tuvo tanto éxito como EVM, pero de todas formas, refleja que se trata de una arquitectura diferente.

> ¿Tal vez porque coincide con las iniciales de la técnica bien establecida de [Support Vector Machines](https://en.wikipedia.org/wiki/Support_vector_machine)? Quién sabe.

Y vimos algunas de sus ventajas: permitir cierta ejecución paralela nativa cuando un programa interactúa con estados independientes, almacenados en cuentas independientes. Esto es clave, ya que la paralelización es una característica importante para la **escalabilidad**. Llegaremos a eso pronto.

---

En general, Solana introduce algunas ideas interesantes, que siguen nutriéndonos en nuestro viaje de Blockchain.

Aunque estaremos dejando este ecosistema por ahora, los aliento a seguir investigando, ya que esta es una de las [Blockchains más grandes por ahí](https://www.coingecko.com/en/chains) — ¡así que definitivamente vale la pena mantener un ojo en ella!

Hablando de nuevas ideas, quiero dedicar el siguiente artículo a ver brevemente algunos otros jugadores en la industria que han sido pioneros en nuevos conceptos, en busca de mejoras a este mundo de Blockchain en constante desarrollo.

¡Los veo pronto!
