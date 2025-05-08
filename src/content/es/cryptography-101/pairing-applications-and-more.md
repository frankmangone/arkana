---
title: "Criptografía 101: Aplicaciones de Emparejamientos y Más"
date: "2024-05-28"
author: "frank-mangone"
thumbnail: "/images/cryptography-101/pairing-applications-and-more/rambo-thanks.webp"
tags:
  [
    "cryptography",
    "pairings",
    "mathematics",
    "keyExchange",
    "digitalSignatures",
  ]
description: "Siguiendo nuestra presentación de los emparejamientos, veamos un par más de aplicaciones que esta nueva herramienta permite"
readingTime: "8 min"
---

> Este artículo forma parte de una serie más larga sobre criptografía. Si este es el primer artículo con el que te encuentras, te recomiendo encarecidamente comenzar desde el [principio de la serie](/es/blog/cryptography-101/where-to-start).

En nuestra [entrega anterior](/es/blog/cryptography-101/pairings), aprendimos sobre los emparejamientos, una estructura que desbloqueó algunas nuevas posibilidades y criptografía exótica basada en identidad. Y vimos cómo funciona el **Cifrado Basado en Identidad** (IBE).

Esta vez, nos centraremos en un par más de ejemplos de aplicaciones de emparejamientos, mientras también añadimos algunos otros detalles en el camino.

Como hicimos la última vez, trataremos los emparejamientos como una especie de **cajas negras**, en el sentido de que no nos preocuparemos por cómo calcularlos — solo nos interesará su **bilinealidad**.

### La Configuración Requerida {#the-required-setup}

Para los métodos que estamos a punto de presentar, será necesaria cierta configuración o infraestructura. Esto ya fue [presentado](/es/blog/cryptography-101/pairings/#the-setup) la última vez, pero reiteraremos brevemente la idea aquí, en aras de la independencia.

Se supone que existe un **Generador de Claves Privadas** (PKG), que está a cargo de **generar claves privadas** a partir de las **identidades** de los usuarios, y también necesita hacer públicos algunos **parámetros del sistema**. Puedes ver cómo funciona esto y cuáles son los parámetros en el [artículo anterior](/es/blog/cryptography-101/pairings).

Sin más preámbulos, ¡aquí vamos!

---

## Intercambio de Claves {#key-exchange}

Si has estado siguiendo la serie hasta ahora, esto te sonará familiar — porque ya hemos [visto](/es/blog/cryptography-101/protocols-galore/#key-exchange) métodos de intercambio de claves en la serie. El algoritmo de [Intercambio de Claves Diffie-Hellman](/es/blog/cryptography-101/protocols-galore/#crafting-the-shared-secret) (DHKE) es uno de los métodos más fundamentales en criptografía, esencial para cualquier cosa que use claves simétricas.

Naturalmente, este es un buen lugar para comenzar nuestro viaje por la criptografía **basada en identidad**.

Para que esto funcione, necesitaremos un tipo particular de emparejamiento — a veces denominado **auto-emparejamiento**. De nuevo, discutimos esta noción en la [publicación anterior](/es/blog/cryptography-101/pairings/#elliptic-curves-and-pairings). Aun así, la idea es lo suficientemente simple como para repetirla aquí: en lugar de asumir que las entradas provienen de dos grupos disjuntos, permitimos que provengan del **mismo grupo**:

$$
e: \mathbb{G}_1 \times \mathbb{G}_1 \rightarrow \mathbb{G}_3
$$

Hay algunas condiciones que deben cumplirse para que esto sea posible, pero no nos preocupemos demasiado por esto, y simplemente asumamos que se puede hacer. Por nuestra propia cordura.

<figure>
  <img
    src="/images/cryptography-101/pairing-applications-and-more/rambo-thanks.webp" 
    alt="Rambo levantando el pulgar"
  />
</figure>

### Generando los Secretos {#generating-the-secrets}

Una vez que tenemos un auto-emparejamiento a mano, la generación de claves es realmente bastante sencilla. Supongamos que Alicia y Bruno quieren generar el mismo secreto compartido. Y ya han obtenido sus **claves secretas**:

$$
Q_A = H(ID_A) \rightarrow S_A = [s]Q_A
$$

$$
Q_B = H(ID_B) \rightarrow S_B = [s]Q_B
$$

La estrategia es simple: si podemos pensar en dos evaluaciones de emparejamiento que producen el mismo resultado — y que pueden ser ejecutadas independientemente por Alicia y Bruno —, entonces hemos terminado. Mira lo elegante que es esto:

$$
e([s]Q_A, Q_B) = e(Q_A, Q_B)^s = e(Q_A, [s]Q_B)
$$

O simplemente:

$$
e(S_A, Q_B) = e(Q_A, S_B)
$$

Todo lo que Alicia necesita saber es su clave secreta y la clave pública de Bruno, y puede evaluar la expresión del lado izquierdo. A la inversa, Bruno solo requiere la clave pública de Alicia y su propia clave privada, y puede evaluar la expresión del lado derecho. ¡Y ambos obtienen el mismo resultado! Sorprendente.

### Extendiendo el Esquema {#extending-the-scheme}

El protocolo Diffie-Hellman puede extenderse para que un secreto compartido pueda generarse entre más de dos participantes. Así que, imagina que tenemos tres participantes que quieren generar el mismo secreto compartido. Cuando trabajamos con curvas elípticas, calcularán este valor compartido:

$$
[a][b][c]G
$$

Dado que Alicia tiene un valor secreto $a$, Bruno tiene un valor secreto $b$ y Carlos tiene un valor secreto $c$.

Una **idea similar** puede aplicarse a los emparejamientos, lo que fue propuesto por [Antoine Joux en 2003](https://link.springer.com/content/pdf/10.1007/s00145-004-0312-y.pdf). Observa la siguiente evaluación de emparejamiento:

$$
K_{ABC} = e(G,G)^{a.b.c}
$$

Podríamos distribuir ingeniosamente los exponentes de esta manera:

$$
e([b]G, [c]G)^a = e([a]G, [c]G)^b = e([a]G, [b]G)^c
$$

Verás, lo interesante aquí es que los valores $[a]G$, $[b]G$ y $[c]G$ no filtran información sobre los valores secretos $a$, $b$ y $c$ (¡a menos que puedas resolver un DLP!). Por estas razones, ¡estos valores pueden ser _publicados_, y después, todos pueden calcular el mismo valor compartido!

> Esta extensión no utiliza la **identidad** de los usuarios para el proceso. A su vez, esto solo demuestra cómo los emparejamientos permiten la criptografía basada en identidad, pero no están **limitados** a esa aplicación.

¡Y ahí lo tienes! Intercambio de claves basado en emparejamientos. Bonito, ¿verdad?

<figure>
  <img
    src="/images/cryptography-101/pairing-applications-and-more/distracted-boyfriend.webp" 
    alt="Meme del novio distraído"
    title="Los emparejamientos comienzan a verse más atractivos, ¿no es así?"
  />
</figure>

---

## Firmas Basadas en Identidad {#identity-based-signatures}

Si la encriptación basada en emparejamientos era posible, entonces el siguiente paso es intentar crear **firmas** basadas en ellos.

Presentaremos una **versión simplificada**, que será relativamente fácil de entender. Hay otros esquemas de firma de interés por ahí — como las conocidas [firmas BLS](https://www.iacr.org/archive/asiacrypt2001/22480516.pdf), pero no entraremos en detalle para no sobrecargarte con información. Mantengámoslo simple.

<figure>
  <img
    src="/images/cryptography-101/pairing-applications-and-more/homer-stuffing.webp" 
    alt="Homer Simpson siendo llenado de donas"
    title="Causa de muerte: sobrecarga de criptografía"
    width="350"
  />
</figure>

### La Versión Simplificada {#the-simplified-version}

Querremos definir la configuración correctamente, de nuevo. ¡Aguanta un segundo!

Comienza casi igual que antes, donde tenemos un PKG con un secreto maestro s, que hace públicos los valores $P$ y $Q = [s]P$. Además, necesitamos un par de funciones hash: la misma $H$ definida en el artículo anterior, que llamaremos $H_1$ esta vez:

$$
H_1: \{0,1\}^* \rightarrow \mathbb{G}_1
$$

Y una segunda función hash $H_2$, que debe tener esta forma:

$$
H_2: \{0,1\}^* \times\mathbb{G}_1 \rightarrow \mathbb{Z}_r
$$

Finalmente, asumiremos que el firmante ha obtenido una clave privada de la forma:

$$
Q_{ID} = H(ID) \rightarrow S_{ID} = [s]Q_{ID}
$$

Donde el hash del $ID$ es la clave pública. ¡Y eso es todo lo que necesitamos!

<figure>
  <img
    src="/images/cryptography-101/pairing-applications-and-more/borat-nice.webp" 
    alt="Meme de Borat muy bueno"
    width="512"
  />
</figure>

Con la configuración en su lugar, veamos cómo funciona una **firma basada en identidad** (IBS).

> Por cierto, el esquema presentado se basa en [este artículo](https://eprint.iacr.org/2002/018).

Para firmar un mensaje $M$, que es una secuencia de bits de cualquier longitud:

$$
M \in \{0,1\}^*
$$

necesitamos hacer lo siguiente:

- Primero, el firmante muestrea un nonce aleatorio, un entero $k$
- Luego, procede a calcular los valores $U$ y $V$, como:

$$
U = [k]Q_{ID}
$$

$$
h = H_2(M, U), \ V = [k + h]S_{ID}
$$

Estos valores serán la **firma producida**, la tupla $(U, V)$. Un resultado muy similar al obtenido con el [Algoritmo de Firma Digital de Curva Elíptica](/es/blog/cryptography-101/encryption-and-digital-signatures/#digital-signatures) (ECDSA), donde uno de los resultados codifica el nonce, y el otro codifica la clave secreta. O más bien, uno es un **desafío** ($U$), y el otro elemento actúa como un **verificador** ($V$).

> También podemos pensar en $V$ como una especie de **prueba de conocimiento** de la clave secreta.

Todo lo que queda es la **verificación**. Hasta ahora, no hemos hecho uso del emparejamiento, así que probablemente puedas decir que aquí es donde encajan en el rompecabezas. Y de hecho, la idea es hacer dos evaluaciones diferentes, una usando $U$ y otra usando $V$. Si estas evaluaciones coinciden, entonces esto significará que el valor $V$ se calculó correctamente, lo que indica que el firmante tiene la **clave secreta** correcta.

Estas evaluaciones son:

$$
e(Q,U + [h]Q_{ID}) = e(P, V)
$$

Es fácil comprobar que estas dos expresiones deberían calcular el mismo valor:

$$
e(P,V) = e(P, [k + h]S_{ID}) = e(P, [s][k+h]Q_{ID})
$$

$$
= e([s]P, [k]Q_{ID} + [h]Q_{ID}) = e(Q, U + [h]Q_{ID})
$$

Como puedes ver, si $V$ es correcto y de hecho usa el secreto maestro $s$, ¡entonces estas ecuaciones deberían funcionar! De lo contrario, tendríamos que encontrar un valor válido V que por casualidad cumpla con la igualdad anterior, y eso debería ser **súper difícil**.

> Formalmente, esto se conoce como el **Problema de Diffie-Hellman Bilineal** (BDHP), que es lo que sustenta la seguridad de estos métodos basados en emparejamientos.

Quiero decir, esto es **un poco loco**, pero al mismo tiempo, **no tan loco**. Si bien los emparejamientos son estructuras bastante complejas, ¡nuestra construcción no parece tan complicada! Hemos visto protocolos más elaborados [en el camino](/es/blog/cryptography-101/signatures-recharged). Y digo esto para tratar de desmitificar un poco la criptografía basada en identidad: es complicada porque los emparejamientos son complicados, pero si ignoramos los matices de su cálculo y nos centramos solo en sus **propiedades**, las cosas se vuelven mucho más claras.

<figure>
  <img
    src="/images/cryptography-101/pairing-applications-and-more/michael-scott-rock.webp" 
    alt="Michael Scott de The Office haciendo el signo de rock"
    title="Oh, estoy desbordando de felicidad"
  />
</figure>

---

## Resumen {#summary}

Como puedes imaginar, hay otras cosas que podemos hacer con los emparejamientos. Siguiendo el esquema establecido en [este artículo](/es/blog/cryptography-101/protocols-galore), podríamos inferir que hay formas de construir **esquemas de compromiso**, **pruebas de conocimiento**, diferentes tipos de **firmas**, **VRFs** y otras primitivas basadas en emparejamientos.

Sin embargo, sugiero ir despacio con estos, para que tengas tiempo de asimilar esta nueva cosa de **emparejamiento** que vimos.

Vimos un par de aplicaciones en el ámbito de la **criptografía basada en identidad** (una premisa muy interesante, porque ya no necesitamos recordar esas molestas claves públicas largas), pero también nos dimos cuenta de que los emparejamientos tienen otras aplicaciones.

Para cimentar completamente esta última idea, [la próxima vez](/es/blog/cryptography-101/commitment-schemes-revisited) veremos un **esquema de compromiso** particular que resultará esencial para que entendamos algunas **pruebas de conocimiento cero** modernas. ¡Hasta entonces!
