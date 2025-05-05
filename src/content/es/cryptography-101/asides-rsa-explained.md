---
title: "Criptografía 101 (Anexo): RSA Explicado"
date: "2024-03-31"
author: "frank-mangone"
thumbnail: "/images/cryptography-101/rsa-explained/batman.webp"
tags: ["Criptografía", "RSA", "Aritmética Modular"]
description: "Una breve explicación sobre cómo funciona RSA"
readingTime: "6 min"
---

> Este artículo forma parte de una serie más amplia sobre criptografía. Si este es el primer artículo con el que te encuentras, te recomiendo encarecidamente comenzar desde el [principio de la serie](/es/blog/cryptography-101/where-to-start).

El cifrado RSA es uno de los algoritmos de cifrado más utilizados en todo el mundo — y se basa únicamente en el **grupo aditivo de enteros módulo** $n$. Es un gran ejemplo de cuánto se puede hacer sin necesidad de curvas elípticas o cualquier otra construcción más compleja.

Este anexo está dedicado a explicar los principios de funcionamiento y los matices del algoritmo RSA.

---

## El Problema Subyacente

Muchos mecanismos criptográficos operan bajo el principio de que es realmente difícil realizar cierta operación a menos que conozcas alguna **clave secreta**. En el **cifrado**, esa es exactamente la idea: un mensaje cifrado es **indescifrable** sin el conocimiento de dicha clave secreta.

¿Cómo se logra esto, entonces? Creando un problema que sea **realmente difícil de resolver**, a menos que tengas información **secreta adicional**. RSA se basa en uno de estos problemas: la **factorización de números grandes** en sus **factores primos**. Esto es: dado un número (grande) $$n$$, expresarlo como:

$$
n = p.q
$$

Donde $p$ y $q$ son números primos grandes. Si conoces $p$ y $q$, calcular $n$ es trivial — y también lo es calcular $p$ si conoces $n$ y $q$.

### ¿Qué tan grande es lo suficientemente grande?

Por supuesto, todo esto es **inútil** si el problema es fácil de resolver. Por ejemplo, si $n = 7×11 = 77$, entonces la factorización realmente solo toma un instante. Sin embargo, a medida que los números primos se vuelven más grandes, la factorización comienza a tomar cada vez más tiempo.

El tamaño recomendado para los factores primos $$p$$ y $$q$$ está entre $1024$ y $2048$ bits. Como referencia, así es como se ve un número primo de 1024 bits:

::: big-quote
170154366828665079503315635359566390626153860097410117673698414542663355444709893966571750073322692712277666971313348160841835991041384679700511912064982526249529596585220499141442747333138443745082395711957231040341599508490720584345044145678716964326909852653412051765274781142172235546768485104821112642811
:::

Sí, es bastante grande.

Estimar cuánto tiempo llevaría encontrar los factores primos de un número grande, digamos, de 2048 bits de longitud, es difícil. ¡Principalmente porque realmente no se ha logrado hacer!

Aún así, se teoriza que tomaría entre **cientos** y **miles** de años, incluso con hardware potente. A menos que la [Computación Cuántica](/es/blog/wtf-is/quantum-computing) esté disponible, claro — pero esa es una historia para otro momento.

---

## Preliminares

¿Cómo usamos el problema anterior para cifrar datos? Para hacerlo, necesitaremos algunas definiciones. En particular, necesitaremos conocer la [función totiente de Euler](https://es.wikipedia.org/wiki/Funci%C3%B3n_%CF%86_de_Euler) y sus propiedades.

### La Función Totiente de Euler

Para cualquier número natural $n$, esta función (denotada como $\varphi(n)$) cuenta cuántos números naturales menores que $n$ (sin contar el $0$) son **coprimos** con él.

Ser **coprimos** significa que los números **no comparten factores primos**. Otra forma de decirlo es que el **máximo común divisor** de los números coprimos es $1$.

> Por ejemplo, $6$ y $25$ son coprimos.

Observa que para un **número primo** $p$, todos los números menores que él son **coprimos** (¡porque como $p$ es primo, su único factor primo es $p$!). Así que podemos escribir:

$$
\varphi(p) = p - 1
$$

Y también, es cierto que para $n = p.q$, si $p$ y $q$ son primos, entonces:

$$
\varphi(n) = (p - 1)(q - 1)
$$

### Una Propiedad Importante

¿Por qué nos importa la función totiente? Principalmente debido al [teorema de Euler](https://en.wikipedia.org/wiki/Euler%27s_theorem), que establece que si $a$ y $n$ son coprimos, entonces:

$$
a^{\varphi(n)} \ \textrm{mod} \ n = 1
$$

Y si multiplicamos ambos lados por $a$, esto es lo que obtenemos:

$$
a^{\varphi(n) + 1} \ \textrm{mod} \ n = a
$$

Aparentemente, hay un cierto número mágico $\varphi(n) + 1$ que parece permitirnos recuperar el valor original $a$!

<figure>
  <img 
    src="/images/cryptography-101/rsa-explained/batman.webp" 
    alt="Batman pensando"
    width="600"
    title="Creo que sé adónde va esto..."
  />
</figure>

---

## El Algoritmo

Si sustituimos $$a$$ en la ecuación anterior por nuestro mensaje $$m$$, entonces tenemos una excelente base para un mecanismo de cifrado, ¡porque tenemos una operación en $$m$$ que nos permite **recuperar** $$m$$!

Lo que necesitamos hacer es dividir el proceso en **dos pasos**. Y para hacer esto, simplemente **factorizamos** $$\varphi(n) + 1$$.

Aunque esta no es tu factorización habitual. Lo que realmente sucede es que elegimos algún número **aleatorio grande** $$e$$, siempre que $$e < \varphi(n)$$, y que $$e$$ sea coprimo con $$\varphi(n)$$. Luego, calculamos otro número $$d$$ tal que:

$$
e.d \ \textrm{mod} \ \varphi(n) = 1
$$

> Esto es realmente solo el inverso multiplicativo modular de $$e$$, módulo $$\varphi(n)$$.

Y calcular $$d$$ de esta manera asegura que lo siguiente sea cierto (lo cual es bastante simple de probar, así que te dejo esa tarea a ti):

$$
m^{e.d} \ \textrm{mod} \ n = m
$$

Y la parte interesante es que, con el conocimiento de $$e$$ y $$n$$, no es fácil calcular $$\varphi(n)$$ porque para eso, ¡necesitarías los **factores primos de** $$n$$! ¡Lo cual es un problema realmente difícil! Por esta razón, $$e$$ puede hacerse público — y de hecho será la **clave pública** en RSA.

### Los Pasos

Todo lo que queda es separar en dos pasos. Usamos la clave pública $e$ para calcular un **texto cifrado**:

$$
m^e \ \textrm{mod} \ n = c
$$

Sin el conocimiento de $$d$$, esto no puede convertirse de nuevo en $$m$$. Así que mientras $$d$$ se mantenga en secreto, solo quien posea este valor podrá descifrar $$c$$. Y debido a esto, $$d$$ va a ser nuestra **clave privada**.

Para descifrar, simplemente hacemos lo siguiente:

$$
c^d \textrm{mod} \ n = m^{e.d} \textrm{mod} \ n = m
$$

¡Y voilà! ¡El mensaje está descifrado!

> Ten en cuenta que también puedes firmar digitalmente con este esquema, usando $$d$$ para producir una firma y $$e$$ para verificarla. Ingenioso, ¿no?

---

## Resumen

¡Y ahí lo tienes! Así es como funciona el cifrado RSA.

<figure>
  <img 
    src="/images/cryptography-101/rsa-explained/dumbledore-applaudes.webp" 
    alt="Dumbledore aplaude lentamente"
    title="Dumbledore aprueba"
  />
</figure>

No hay mucho más que decir al respecto. Aún así, hay un par de puntos que no hemos tocado — a saber, cómo [calcular inversos multiplicativos modulares](https://en.wikipedia.org/wiki/Modular_multiplicative_inverse#:~:text=modular%20multiplicative%20inverses.-,Computation,-%5Bedit%5D) o cómo [generar números primos grandes](https://crypto.stackexchange.com/questions/71/how-can-i-generate-large-prime-numbers-for-rsa). No los cubriremos aquí, pero por supuesto, estos también son componentes clave para el cifrado RSA.

Sin embargo, hay algunos puntos particularmente sensibles en RSA que pueden convertirse en grandes trampas para todo el criptosistema, como se explica fantásticamente [aquí](https://blog.trailofbits.com/2019/07/08/fuck-rsa/). La teoría está muy bien, pero implementar este esquema aparentemente simple por tu cuenta puede hacerlo muy vulnerable.

<figure>
  <img 
    src="/images/cryptography-101/rsa-explained/dumbledore-scared.webp" 
    alt="Dumbledore ligeramente preocupado"
    title="Impactado"
  />
</figure>

Esta es una de las razones por las que RSA se considera mayormente obsoleto y ha sido reemplazado por la [Criptografía de Curva Elíptica (ECC)](/es/blog/cryptography-101/elliptic-curves-somewhat-demystified) para muchas aplicaciones.
