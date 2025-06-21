---
title: "Blockchain 101: Transacciones"
date: "2024-09-10"
author: frank-mangone
thumbnail: /images/blockchain-101/transactions/bills.webp
tags:
  - blockchain
  - bitcoin
  - transactions
  - utxo
  - digitalSignatures
description: "¡Centrémonos temprano en el alma de las Blockchains: las transacciones!"
readingTime: 9 min
mediumUrl: "https://medium.com/@francomangone18/blockchain-101-transactions-bbbc9e535374"
contentHash: bf1a67dcdf6b0844b0d2acc53a9bdd57f3e77230f997e137c82814f8f6ab69fc
supabaseId: 2d8cb16c-b977-4fee-aa0a-90527f8a816a
---

> Este artículo es parte de una serie más larga sobre Blockchain. Si este es el primer artículo que encuentras, te recomiendo comenzar por el [inicio de la serie](/es/blog/blockchain-101/how-it-all-began).

En la [entrega anterior](/es/blog/blockchain-101/how-it-all-began), vimos qué es una Blockchain y también hablamos de algunos conceptos relacionados con esta tecnología. Esencialmente, nos centramos en los aspectos **estructurales** del modelo: no es más que una **cadena de bloques**.

Este es un gran comienzo para nuestro viaje, ¡pero **ni de cerca** es toda la historia! ¡Todavía nos queda mucho por cubrir!

Y para empezar, quiero que nos enfoquemos en las **transacciones**, ya que están en el corazón de cualquier Blockchain. Bitcoin fue concebido como un **sistema de efectivo** que podría mejorar algunos de los problemas de los procesadores centralizados, así que es natural que la **capacidad de transaccionar** sea uno de los aspectos más (si no **el más**) importantes de esta tecnología.

¡Allá vamos!

---

## Construyendo una transacción {#building-a-transaction}

Las transacciones en Bitcoin son bastante fáciles de entender. De nuevo, es un sistema de efectivo, así que las transacciones solo **mueven dinero** de **A** a **B**.

> Cuando pasamos a otras Blockchains, ¡podemos ver que las transacciones pueden hacer mucho más que eso!

De hecho, es tan simple que podemos intentar crear tal modelo desde cero.

Para empezar, imaginemos que cada transacción mueve una **sola moneda**.

<figure>
  <img
    src="/images/blockchain-101/transactions/simple-transaction.webp" 
    alt="Una transacción simple de Alicia a Bruno"
    title="[zoom]"
    className="bg-white"
  />
</figure>

En este escenario simplificado, un **remitente** (Alicia) solo necesita especificar un **receptor** (Bruno), y la **cantidad** de dinero transferido sería simplemente **1**. ¿Fácil, verdad?

Bueno, hay un problema: el sistema necesita entender quiénes son **Alicia** y **Bruno**.

En términos de nuestras aplicaciones cotidianas, podríamos pensar "hey, ¡eso suena muy parecido a un **nombre de usuario**!". Podrías pensar que una Blockchain podría manejar algo tan común, pero nuestro modelo básico no lo soporta.

> Al menos, no de entrada.

Entonces, ¿cómo le dice Alicia a la Blockchain que quiere enviar una moneda específicamente a Bruno? ¿Quién **es** Bruno? Y ya que estamos, ¿qué hace que Alicia sea Alicia? ¿Qué define sus **identidades** en el sistema?

<figure>
  <img
    src="/images/blockchain-101/transactions/who-am-i.webp" 
    alt="Imagen conceptual de identidad"
    title="¿Quién soy?"
    width="500"
  />
</figure>

### Claves Privadas y Públicas {#private-and-public-keys}

Ya hemos discutido cómo un remitente necesita **dar consentimiento** para que una transacción ocurra — Bruno no puede forzar a Alicia a enviarle dinero.

> Quiero decir... ¡no usaría un sistema que permita el robo por diseño!

La forma en que se logra este consentimiento es adjuntando una [**firma digital**](/es/blog/cryptography-101/encryption-and-digital-signatures/#digital-signatures) a una transacción. No necesitamos entender completamente cómo funcionan las firmas digitales — solo algunos de sus elementos clave. Esto ayudará a explicar lo que entendemos por "identidad de Alicia".

Las firmas digitales funcionan en dos pasos:

- Primero, tomas un **mensaje** (en este caso, nuestra transacción), y usando lo que se llama una **clave privada**, produces una **firma**.
- Posteriormente, cualquiera puede tomar la **firma** y una **clave pública** asociada, y verificar que la firma es válida.

<figure>
  <img
    src="/images/blockchain-101/transactions/digital-signature.webp" 
    alt="Proceso de firma digital"
    title="[zoom]"
    className="bg-white"
  />
</figure>

Independientemente de cómo funcionen los algoritmos **firmar** y **verificar** (para más información, consulta [este otro artículo](/es/blog/cryptography-101/encryption-and-digital-signatures/#digital-signatures)), nota que hay **dos claves** asociadas con Alicia: una clave **privada** (o **secreta**), y una clave **pública**.

Alicia necesita su clave privada para **firmar**. Si esta clave se comparte, cualquiera que la tenga podría producir firmas en nombre de Alicia — algo así como suplantarla. Por esta razón, las claves privadas **no pueden compartirse** (¡lo cual se refleja claramente en su nombre!).

Ambas claves están íntimamente relacionadas: la **clave pública** puede obtenerse a partir de la clave privada, pero no al revés. Similar a los [hashes](/es/blog/cryptography-101/hashing), el proceso es **irreversible** en la práctica. Esto significa que la clave pública puede **compartirse con cualquiera** sin temor a perder tus fondos.

Entonces, ¿qué hace que Alicia sea Alicia? Desde su perspectiva, la capacidad de **firmar** sus propias transacciones — esto es, su **clave privada**. Y desde la perspectiva de cualquier otra persona, la capacidad de **verificar** sus transacciones — que viene dada por su **clave pública**.

Cuando Alicia transfiere una moneda a Bruno, establece al receptor como la **clave pública** de Bruno (o en realidad, su **dirección** — hablaremos de eso en un minuto). Por supuesto, Bruno tiene su propia clave privada, y ahora puede firmar una transacción para transferir la moneda que acaba de recibir.

En resumen:

> La identidad en la Blockchain viene dada por las claves públicas, que son un reflejo de las claves privadas, que a su vez son el artefacto que permite a los usuarios firmar sus propias transacciones.

### Direcciones y Billeteras {#addresses-and-wallets}

A menudo, no hablamos de claves privadas y públicas. Más comúnmente, los términos que usamos son **direcciones** y **billeteras**. ¡Hablemos de ellos!

Una **dirección** está estrechamente relacionada con una clave pública — y es la forma estándar de identificar a un usuario o una cuenta.

Profundizaremos mucho más en cómo se calculan (o **derivan**) las direcciones más adelante en la serie. Es un tema realmente interesante, que involucra una serie de operaciones criptográficas. Por ahora, solo debes saber que una dirección está asociada a una clave pública, que a su vez está asociada con una clave privada.

Por último, una billetera es un término que tendemos a usar indistintamente con cualquiera de los tres términos anteriores. Normalmente nunca decimos "transferir a esta clave pública" — en su lugar, decimos "transferir a esta dirección" o "transferir a esta **billetera**". Técnicamente hablando, una billetera es alguna pieza de **hardware** o **software** que gestiona claves privadas, pero a lo largo de los años, ha evolucionado hasta ser casi lo mismo que una dirección.

---

Quiero aclarar un malentendido común desde el principio: las billeteras **no contienen dinero**. El "dinero" en una Blockchain es solo un valor asociado a una dirección — podríamos decir que **vive en la Blockchain**. Una billetera es solo la **capacidad de transferir fondos**.

<figure>
  <img
    src="/images/blockchain-101/transactions/wallet-concept.webp" 
    alt="Yo preguntándome dónde va todo mi dinero"
  />
</figure>

¡Muy bien! Espero que eso no haya sido terriblemente confuso. Al final, todo se trata de **firmar** y **verificar**. Hay un dicho en Blockchain que dice:

> No confíes, verifica.

A medida que profundicemos en la serie, esto ganará más y más relevancia. Por ahora, se traduce en "ninguna transacción es aceptable si no está firmada por el remitente".

Pero espera... Solo estábamos enviando una sola moneda, ¿verdad? ¿Qué pasa si queremos enviar más?

---

## Modelando el Dinero {#modeling-money}

Transferir una **sola moneda** fue un truco intencional para que nos centráramos en las firmas de transacciones.

Ahora relajemos nuestras restricciones y permitamos a los usuarios tener **múltiples monedas** (es decir, un saldo). Ahora debemos ser más minuciosos con nuestro modelo.

En tu banco de elección, normalmente tienes una cuenta con un único saldo. Transferir dinero desde esta cuenta resulta en un saldo más bajo, y eso es prácticamente todo.

<figure>
  <img
    src="/images/blockchain-101/transactions/doge.webp" 
    alt="Meme de Doge"
    title="Tan familiar, muy simple, muy intuitivo, guau."
    width="400"
  />
</figure>

Este enfoque se conoce como el **modelo basado en cuentas**, donde cada cuenta tiene un único **saldo**. La mayoría de las Blockchains (por ejemplo, [Ethereum](https://blog.defichain.com/what-is-ethereums-accounts-based-model-and-how-does-it-work/)) utilizan este modelo.

Bitcoin fue un poco rebelde en esto, y tiene un modelo diferente para el efectivo. Utiliza algo llamado el modelo de **Salidas de Transacción No Gastadas**, o **UTXO** por sus siglas en inglés. Es un poco extraño, así que tratemos de entenderlo mediante una analogía.

### Salidas de Transacción No Gastadas {#unspent-transaction-outputs}

Cuando gastas dinero en el mundo físico, normalmente usas **billetes**. Ya sabes, estos:

<figure>
  <img
    src="/images/blockchain-101/transactions/bills.webp" 
    alt="Un billete de 100 dólares"
  />
</figure>

Ahora, si tienes que pagar una comida de **40** dólares con un billete de **100** dólares, esperas recibir **cambio**. Esto sucede porque el billete es **indivisible** — no puedes romperlo en dos pedazos y darle uno al dueño de la tienda. Pierde su valor. El dueño de la tienda probablemente no estaría muy contento con esta forma de pago.

Esta es una limitación del **dinero en papel** — pero hey, estamos diseñando un sistema desde cero. Nadie nos dice qué hacer. Podemos romper billetes si queremos. **Rompamos algunos billetes**.

<figure>
  <img
    src="/images/blockchain-101/transactions/how-to-job.webp" 
    alt="¡No me digas cómo hacer mi trabajo!"
    width="550"
  />
</figure>

En Bitcoin, los "billetes" son lo que llamamos las **Salidas de Transacción No Gastadas**. Y al igual que los billetes, tienen una cantidad asociada.

Cuando Alicia quiere enviar algunos Bitcoin a Bruno, digamos **12** Bitcoin (¡vaya, vaya, eso es mucho dinero que tienes ahí, chica!), puede que no tenga un billete por **exactamente** esa cantidad. Su saldo en realidad está compuesto por **múltiples billetes** con diferentes valores. Supongamos que tiene tres: uno por **8**, otro por **3**, y otro por **2**.

> Solo para aclarar: 1 Bitcoin no es la cantidad mínima que puedes transferir. Solo quería usar números simples, eso es todo.

Alicia podría pagar de esta manera:

- Poner todos los billetes en una caja. La caja tiene un valor total de **13**.
- Hacer que la caja produzca **dos** nuevos billetes, uno de **12** para Bruno, y uno de **1** para Alicia.

<figure>
  <img
    src="/images/blockchain-101/transactions/utxo-model.webp" 
    alt="Explicación del modelo UTXO"
    title="[zoom]"
    className="bg-white"
  />
</figure>

Siempre y cuando:

- las entradas se marquen como **gastadas** (o **destruidas**),
- Alicia posea todas las entradas,
- el valor total que entra y sale de la caja sea el mismo,

¡entonces este mecanismo es **completamente válido**! ¿Y sabes qué? ¡Esta **caja** es exactamente como Bitcoin representa las transacciones!

> Espero que puedas apreciar por qué el nombre elegante — ¡solo puedes gastar billetes que son la salida de alguna transacción, por lo que son Salidas de Transacción No Gastadas!

### UTXO vs Cuentas {#utxo-vs-accounts}

En este punto, es justo preguntar **por qué demonios usaríamos este modelo**. No te preocupes, todos hemos estado ahí.

Una razón es que en los modelos basados en cuentas (como tu banco local), **el orden importa**. Si tienes un saldo de $100$, e intentas pagar $80$ a Alicia y $40$ a Bruno, una de esas transacciones **fallará**. Es importante llevar un registro de qué transacción debería **procesar primero** la Blockchain.

> Blockchains como [Ethereum](/es/blog/blockchain-101/ethereum) **sí necesitan** mantener un registro del orden de las transacciones.

El modelo UTXO evita esto por diseño: simplemente seleccionas qué billetes gastar. Una vez que un billete entra en una transacción, desaparece. Boom. No puede usarse de nuevo. ¡No hay necesidad de llevar un registro del orden de las transacciones!

Hay otras diferencias que podríamos mencionar. Por ejemplo, en el modelo de cuentas, la información del saldo de un usuario se encuentra en un solo lugar — su cuenta. ¡Y en Blockchains públicas, esta información está disponible para todos! UTXO [ofusca](https://dictionary.cambridge.org/dictionary/english/obfuscate) esta información, porque el saldo total de un usuario se distribuye entre muchos billetes individuales.

Otras diferencias incluyen la falta de estado y el control detallado de transacciones, ¡pero supongo que esta es suficiente información por ahora! Sugiero leer [este artículo](<https://www.horizen.io/academy/utxo-vs-account-model/#:~:text=The%20conceptual%20difference%20is%20that,unspent%20transaction%20outputs%20(UTXOs).>) para una visión más detallada sobre el tema.

---

## Resumen {#summary}

En esta entrega, aprendimos cómo se identifican los usuarios en la red y cómo deben formularse las transacciones. ¡Genial!

Estas ideas básicas serán más o menos aplicables a todas las Blockchains, así que es muy útil entender estos conceptos.

Ahora sabemos cómo crear transacciones... ¿Pero qué sucede después? ¿Cómo enviamos una transacción a la Blockchain? Una vez enviada, ¿cómo se procesa?

¡Estas son todas preguntas que intentaremos responder en nuestro [próximo encuentro](/es/blog/blockchain-101/a-primer-on-consensus)! Mantente atento mientras exploramos la forma en que la red procesa y acuerda las transacciones — lo que llamamos el [**mecanismo de consenso**](/es/blog/blockchain-101/a-primer-on-consensus). ¡Hasta pronto!
