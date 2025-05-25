---
title: "Criptografia 101: Por Onde Começar"
date: "2024-03-07"
author: "frank-mangone"
thumbnail: "/images/cryptography-101/where-to-start/aaaaa.webp"
tags: ["cryptography", "groups", "mathematics", "modularArithmetic"]
description: "Uma introdução bem suave ao mundo da criptografia"
readingTime: "6 min"
---

Começarei dizendo que não sou de forma alguma nem matemático, nem especialista em criptografia — sou apenas um cara tentando aprender o ofício por conta própria.

Mas é exatamente por isso que tentei destilar os conceitos complexos com os quais me deparei em partes que são fáceis de digerir. Então esta é minha tentativa de tentar apresentar esses conceitos. Sempre acreditei que há algo profundamente enriquecedor em tentar entender como as coisas funcionam, mesmo que não precisemos implementar ou realmente usar todas as ideias que aprendemos. Espero que você se divirta pelo caminho!

Neste artigo, exploraremos alguns dos conceitos básicos por trás das técnicas criptográficas, e construiremos sobre esses conceitos posteriormente. Estabelecer essas bases será importante ao tentar entender processos como **encriptação**, **compartilhamento de segredos** e outros.

## Começando {#getting-started}

No meu caso, trabalho em uma empresa que usa tecnologia [Blockchain](/pt/blog/blockchain-101/how-it-all-began). Isso requer um entendimento básico de **assinaturas digitais** — você sabe, algum usuário tem uma **chave privada**, usa essa chave privada para **assinar uma mensagem**, e a autenticidade da assinatura pode ser verificada com uma **chave pública**. Este é um jargão bastante comum, e existem muitas bibliotecas para realizar as ações que acabei de descrever.

Mas da minha perspectiva, isso não parecia diferente de feitiçaria. Como isso funciona? Que mecanismo permite um processo tão particular? Esta curiosidade é o que, em última análise, motiva este artigo.

No entanto, tal aventura não pode começar explicando como funciona um mecanismo de assinatura digital. Primeiro, devemos estabelecer algumas bases matemáticas para entender como operam os protocolos e técnicas criptográficas. Então, este será nosso ponto de partida.

---

## Grupos {#groups}

Existem muitas técnicas criptográficas que são baseadas em **grupos matemáticos**. Em essência, um **grupo** é simplesmente a combinação de um **conjunto** de elementos, e uma **operação binária** (denotaremos "+" por enquanto) que pega dois elementos no conjunto e produz outro elemento no mesmo conjunto. Isso é muito abstrato — e, na verdade, nada nos impede de usar um conjunto como:

$$
S = \{A, B, C, D, E\}
$$

Mas então teríamos que definir qual é o resultado da combinação de **cada par de elementos** quando aplicamos a operação de grupo (ou seja, qual é o resultado de $A + B$? É o mesmo resultado que $B + A$?).

Felizmente, existem grupos que são **mais simples de definir**. Um desses grupos é baseado nos inteiros — se restringirmos os inteiros apenas aos elementos abaixo de um certo limite $q$, obtemos um conjunto da forma:

$$
\mathbb{Z}_q = \{0, 1, 2, 3, ..., q-1\}
$$

Sem mergulhar no rigor matemático, chamaremos esse conjunto simplesmente de **inteiros módulo** $q$. E é muito natural tomar a **adição padrão** como operação de grupo: $1 + 2$ resulta em $3$, que é um elemento do conjunto, $2 + 2$ resulta em $4$, e assim por diante. Isso é verdade para muitos inteiros, desde que $q$ seja grande o suficiente! Mas surge uma questão: o que acontece se sairmos "fora do intervalo"? Por exemplo, se tentarmos adicionar:

$$
(q-1) + 1 = ?
$$

O que acontece? Um buraco negro? Estouro de pilha?

<figure>
  <img 
    src="/images/cryptography-101/where-to-start/aaaaa.webp" 
    alt="Cabra gritando"
    title="Aaaaaaaaa!"
  />
</figure>

De certa forma, sim! Nós simplesmente **voltamos ao início** do nosso conjunto, resultando em $0$. E isso acontece porque eu menti um pouco: a operação de grupo não é apenas a adição padrão, é a **adição modular**. Então devemos definir o que é isso para continuar.

## A Operação Módulo {#the-modulo-operation}

Na verdade, quando dizemos **adição modular**, nos referimos à operação de **módulo**. E esta operação é apenas o resto da divisão de um número $a$ por algum módulo $q$. Em geral, a seguinte relação se mantém:

$$
a = k.q + b \ / \ 0 \leq b < q
$$

Então, ao dividir $a / q$, obteremos como resultado algum inteiro $k$ e algum resto $b$. O resultado da operação de módulo é apenas o resto, e escrevemos:

$$
a \ \textrm{mod} \ q = b
$$

Legal! Com isso, podemos terminar de definir a operação de grupo que mencionamos anteriormente: é a adição padrão, mais a aplicação da operação de módulo $q$. O que acabamos de definir é o grupo conhecido como **grupo aditivo dos inteiros módulo** $q$. Esta construção simples estará por trás da maior parte de nossa análise posterior, implícita ou explicitamente — então é bom mantê-la em mente!

## Geradores de Grupo e Subgrupos {#group-generators-and-subgroups}

Vamos agora voltar nossa atenção para a compreensão dos grupos. E, em particular, vamos examinar o exemplo onde $q = 5$. Vamos agora escolher um elemento no conjunto, por exemplo $g = 2$. O que acontece se aplicarmos a operação de grupo em $g$ com **ele mesmo** repetidamente?

$$
\\ 2 + 2 \ \textrm{mod} \ 5 = 4
\\ 2 + 2 + 2 \ \textrm{mod} \ 5 = 1
\\ 2 + 2 + 2 + 2 \ \textrm{mod} \ 5 = 3
\\ 2 + 2 + 2 + 2 + 2 \ \textrm{mod} \ 5 = 0
$$

Observe que algo interessante acontece: produzimos **todos os elementos do grupo** através da adição repetida de $g$. Isso torna $g = 2$ "especial" de certa forma — dizemos que ele é um **gerador** do grupo, já que efetivamente "geramos" todo o conjunto associado neste procedimento. Geralmente denotamos o grupo gerado por um elemento $g$ com a expressão $\langle g \rangle$.

Também podemos fazer a observação de que no exemplo anterior, **cada elemento** no grupo acontece de ser um gerador — você pode tentar isso por conta própria. Isso não é coincidência: tem a ver com o fato de que o número de elementos no grupo (chamado o **ordem** do grupo e denotado por $\#$) é na verdade um **número primo**. Vamos apenas apontar isso, mas não se preocupe com esse fato por enquanto.

No entanto, se escolhermos um $q$ diferente, então nem todo elemento vai ser um gerador. Por exemplo, se $q = 6$, então o elemento $2$ **não** é um gerador: produziremos apenas o conjunto $\{ 0, 2, 4 \}$ — nos deparamos com um **subgrupo cíclico** gerado por $g=2$.

Há uma propriedade interessante sobre subgrupos, formulada no [teorema de Lagrange](<https://en.wikipedia.org/wiki/Lagrange%27s_theorem_(group_theory)>), que afirma:

> Todo subgrupo $S$ de um grupo de ordem finita $G$ tem uma ordem que é um divisor da ordem de $G$; isto é, $\#S$ divide $\#G$.

Os subgrupos e suas propriedades desempenham um papel importante na criptografia de grupo, então, novamente, voltaremos a esses fatos mais tarde.

## Resumo {#summary}

Nesta breve introdução, foram apresentados alguns conceitos matemáticos básicos. Estes servirão como base para o que está por vir nos próximos artigos.

Por si só, entender a operação de módulo e **suas propriedades** é suficiente para descrever algumas técnicas criptográficas (como [criptografia RSA](/pt/blog/cryptography-101/asides-rsa-explained)) — mas há outros grupos de interesse que ainda temos que definir. No [próximo artigo](/pt/blog/cryptography-101/elliptic-curves-somewhat-demystified), mergulharemos no mundo das curvas elípticas, e mais tarde as usaremos para criar alguns [protocolos criptográficos](/pt/blog/cryptography-101/encryption-and-digital-signatures).
