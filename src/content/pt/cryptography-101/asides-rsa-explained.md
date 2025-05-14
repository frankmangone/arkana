---
title: "Criptografia 101 Anexo: RSA Explicado"
date: "2024-03-31"
author: "frank-mangone"
thumbnail: "/images/cryptography-101/rsa-explained/batman.webp"
tags: ["cryptography", "rsa", "mathematics", "modularArithmetic"]
description: "Uma breve explicação sobre como o RSA funciona"
readingTime: "6 min"
mediumUrl: "https://medium.com/@francomangone18/cryptography-101-asides-rsa-explained-7f28fd28659d"
---

> Este é parte de uma série maior de artigos sobre criptografia. Se este é o primeiro artigo que você encontra, recomendo fortemente começar pelo [início da série](/pt/blog/cryptography-101/where-to-start).

A criptografia RSA é um dos algoritmos de criptografia mais utilizados — e depende exclusivamente do **grupo aditivo de inteiros módulo** $$n$$. É um ótimo exemplo de quanto pode ser feito sem a necessidade de curvas elípticas ou quaisquer outras construções mais complexas.

Este anexo é dedicado a explicar os princípios de funcionamento e nuances do algoritmo RSA.

---

## O Problema Subjacente {#the-subjacent-problem}

Muitos mecanismos criptográficos operam no princípio de que é realmente difícil realizar uma determinada operação a menos que você conheça alguma **chave secreta**. Na **criptografia**, essa é exatamente a ideia: uma mensagem criptografada é **indecifrável** sem o conhecimento dessa chave secreta.

Como isso é alcançado, então? Criando um problema que é **realmente difícil de resolver**, a menos que você tenha alguma informação extra, **secreta**. O RSA depende de um desses problemas: a **fatoração de números grandes** em seus **fatores primos**. Isto é: dado um número (grande) $$n$$, expressá-lo como:

$$
n = p.q
$$

Onde $$p$$ e $$q$$ são números primos grandes. Se você conhece $$p$$ e $$q$$, calcular $$n$$ é trivial — e o mesmo vale para calcular $$p$$ se você conhece $$n$$ e $$q$$.

### Quão Grande é Grande o Suficiente? {#how-big-is-big-enough}

Claro, isso tudo é **inútil** se o problema for fácil de resolver. Por exemplo, se $$n = 7×11 = 77$$, então a fatoração realmente leva apenas um instante. No entanto, à medida que os números primos se tornam maiores, a fatoração começa a levar cada vez mais tempo.

O tamanho recomendado para os fatores primos $$p$$ e $$q$$ é entre $$1024$$ e $$2048$$ bits. Para referência, é assim que um número primo de 1024 bits se parece:

::: big-quote
170154366828665079503315635359566390626153860097410117673698414542663355444709893966571750073322692712277666971313348160841835991041384679700511912064982526249529596585220499141442747333138443745082395711957231040341599508490720584345044145678716964326909852653412051765274781142172235546768485104821112642811
:::

Sim, é bem grande.

Estimar quanto tempo levaria para encontrar os fatores primos de um número grande, digamos, de 2048 bits, é difícil. Principalmente porque isso realmente nunca foi feito!

Mas ainda assim, teoriza-se que levaria de **centenas** a **milhares** de anos, mesmo com hardware poderoso. A menos que a [Computação Quântica](/pt/blog/wtf-is-quantum-computing) se torne disponível, isto é — e essa é uma história para outra hora.

---

## Preliminares {#preliminaries}

Como usamos o problema anterior para criptografar dados? Fazer isso exigirá algumas definições. Em particular, precisaremos saber sobre a [função totiente de Euler](https://en.wikipedia.org/wiki/Euler%27s_totient_function) e suas propriedades.

### Função totiente de Euler {#eulers-totient-function}

Para qualquer número natural $$n$$, esta função (denotada como $$\varphi(n)$$) conta quantos números naturais menores que $$n$$ (não contando 0) são **coprimos** com ele.

Ser **coprimo** significa que os números **não compartilham fatores primos**. Outra maneira de dizer isso é que o **máximo divisor comum** de números coprimos é $$1$$.

> Por exemplo, $6$ e $25$ são coprimos.

Note que para um **número primo** $$p$$, todo número menor que ele é **coprimo** (porque como $$p$$ é primo, seu único fator primo é $$p$$!). Então podemos escrever:

$$
\varphi(p) = p - 1
$$

E também, é verdade que para $$n = p.q$$, se $$p$$ e $$q$$ são primos, então:

$$
\varphi(n) = (p - 1)(q - 1)
$$

### Uma Propriedade Importante {#an-important-property}

Por que nos importamos com a função totiente? Principalmente por causa do [teorema de Euler](https://en.wikipedia.org/wiki/Euler%27s_theorem), que afirma que se $$a$$ e $$n$$ são coprimos, então:

$$
a^{\varphi(n)} \ \textrm{mod} \ n = 1
$$

E se multiplicarmos ambos os lados por $$a$$, isto é o que obtemos:

$$
a^{\varphi(n) + 1} \ \textrm{mod} \ n = a
$$

Aparentemente, existe um certo número mágico $$\varphi(n) + 1$$ que parece nos permitir recuperar o valor original $$a$$!

<figure>
  <img 
    src="/images/cryptography-101/rsa-explained/batman.webp" 
    alt="Batman pensando"
    width="600"
    title="Acho que sei onde isso vai dar..."
  />
</figure>

---

## O Algoritmo {#the-algorithm}

Se substituirmos $$a$$ na equação anterior por nossa mensagem $$m$$, então temos uma ótima base para um mecanismo de criptografia, porque temos uma operação em $$m$$ que nos permite **recuperar** $$m$$!

O que precisamos fazer é dividir o processo em **duas etapas**. E para fazer isso, simplesmente **fatorizamos** $$\varphi(n) + 1$$.

Esta não é sua fatoração usual, no entanto. O que realmente acontece é que escolhemos algum número $$e$$ **aleatório grande**, desde que $$e < \varphi(n)$$, e que $$e$$ seja coprimo com $$\varphi(n)$$. Então, calculamos outro número $$d$$ tal que:

$$
e.d \ \textrm{mod} \ \varphi(n) = 1
$$

> Isto é realmente apenas o inverso multiplicativo modular de $$e$$, módulo $$\varphi(n)$$.

E calcular $$d$$ dessa maneira garante que o seguinte seja verdadeiro (o que é bastante simples de provar, então deixo essa tarefa para você):

$$
m^{e.d} \ \textrm{mod} \ n = m
$$

E a parte interessante é que, com o conhecimento de $$e$$ e $$n$$, não é fácil calcular $$\varphi(n)$$ porque para isso, você precisaria dos **fatores primos de** $$n$$! O que é um problema realmente difícil! Por essa razão, $$e$$ pode ser tornado público — e de fato será a **chave pública** no RSA.

### Os Passos {#the-steps}

Tudo o que resta é separar em duas etapas. Usamos a chave pública $$e$$ para calcular um **texto cifrado**:

$$
m^e \ \textrm{mod} \ n = c
$$

Sem o conhecimento de $$d$$, isso não pode ser convertido de volta em $$m$$. Então, desde que $$d$$ seja mantido em segredo, apenas quem possui esse valor pode descriptografar $$c$$. E por causa disso, $$d$$ será nossa **chave privada**.

Para descriptografar, simplesmente fazemos o seguinte:

$$
c^d \textrm{mod} \ n = m^{e.d} \textrm{mod} \ n = m
$$

E voilà! A mensagem está descriptografada!

> Note que você também pode assinar digitalmente com este esquema, usando $$d$$ para produzir uma assinatura e $$e$$ para verificá-la. Legal, né?

---

## Resumo {#summary}

E aí está! É assim que a criptografia RSA funciona.

<figure>
  <img 
    src="/images/cryptography-101/rsa-explained/dumbledore-applaudes.webp" 
    alt="Dumbledore aplaude lentamente"
    title="Dumbledore aprova"
  />
</figure>

Não há muito mais a dizer sobre isso. Ainda assim, há alguns pontos que não abordamos — a saber, como [calcular inversos multiplicativos modulares](https://en.wikipedia.org/wiki/Modular_multiplicative_inverse#:~:text=modular%20multiplicative%20inverses.-,Computation,-%5Bedit%5D), ou como [gerar números primos grandes](https://crypto.stackexchange.com/questions/71/how-can-i-generate-large-prime-numbers-for-rsa). Não vamos cobri-los aqui, mas é claro, estes também são componentes-chave para a criptografia RSA.

No entanto, existem alguns pontos particularmente sensíveis no RSA que podem se tornar grandes armadilhas para todo o sistema criptográfico, como é fantasticamente explicado [aqui](https://blog.trailofbits.com/2019/07/08/fuck-rsa/). A teoria é realmente boa e bonita, mas implementar esse esquema aparentemente simples por conta própria pode torná-lo muito vulnerável.

<figure>
  <img 
    src="/images/cryptography-101/rsa-explained/dumbledore-scared.webp" 
    alt="Dumbledore ligeiramente preocupado"
    title="Chocado"
  />
</figure>

Esta é uma das razões pelas quais o RSA é considerado principalmente obsoleto e foi substituído pela [Criptografia de Curva Elíptica (ECC)](/pt/blog/cryptography-101/elliptic-curves-somewhat-demystified) em muitas aplicações.
