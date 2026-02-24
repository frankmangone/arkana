---
title: 'Criptografia 101: Aplicações de Emparelhamentos e Mais'
date: '2024-05-28'
author: frank-mangone
thumbnail: /images/cryptography-101/pairing-applications-and-more/rambo-thanks.webp
tags:
  - cryptography
  - pairings
  - mathematics
  - keyExchange
  - digitalSignatures
description: >-
  Seguindo nossa apresentação de emparelhamentos, olhamos para mais algumas
  aplicações habilitadas por esta nova ferramenta
readingTime: 8 min
contentHash: 258fd0d2eb0ae9a5099a3cdcd9cd3729803d52256d5b75fdda40d87fcb6013cf
---

> Este é parte de uma série de artigos sobre criptografia. Se este é o primeiro artigo que você encontra, eu recomendo começar do [início da série](/pt/blog/cryptography-101/where-to-start).

Em nosso [artigo anterior](/pt/blog/cryptography-101/pairings), aprendemos sobre emparelhamentos, uma estrutura que desbloqueou algumas novas possibilidades e algumas criptografias exóticas baseadas em identidade. E vimos como a **Encriptação Baseada em Identidade** (IBE) funciona.

Desta vez, vamos focar em mais alguns exemplos de aplicações de emparelhamentos, enquanto também espalhamos alguns outros detalhes pelo caminho.

Como fizemos da última vez, os emparelhamentos serão tratados como uma espécie de **caixas pretas**, no sentido de que não nos importaremos com como computá-los — apenas sua **bilinearidade** será de interesse para nós.

### A Configuração Necessária {#the-required-setup}

Para os métodos que estamos prestes a apresentar, uma certa configuração ou infraestrutura será necessária. Isso já foi [apresentado](/pt/blog/cryptography-101/pairings/#the-setup) da última vez, mas vamos reiterar brevemente a ideia aqui, para fins de auto-contido.

Um **Gerador de Chave Privada** (PKG) é assumido existir, que é responsável por **gerar chaves privadas** a partir das **identidades** dos usuários, e também precisa tornar públicos alguns **parâmetros do sistema**. Você pode verificar como isso funciona e quais são os parâmetros no [artigo anterior](/pt/blog/cryptography-101/pairings).

Sem mais delongas, vamos lá!

---

## Troca de Chaves {#key-exchange}

Se você tem acompanhado a série até agora, isso vai soar familiar para você — porque já [vimos](/pt/blog/cryptography-101/protocols-galore/#key-exchange) métodos de troca de chaves na série. O algoritmo de [Troca de Chaves Diffie-Hellman](/pt/blog/cryptography-101/protocols-galore/#crafting-the-shared-secret) (DHKE) é um dos métodos mais fundamentais em criptografia, essencial para qualquer coisa que use chaves simétricas.

Naturalmente, este é um bom lugar para começar nossa jornada de criptografia **baseada em identidade**.

Para isso funcionar, vamos precisar de um tipo particular de emparelhamento — às vezes referido como um **auto-emparelhamento**. Novamente, discutimos essa noção no [post anterior](/pt/blog/cryptography-101/pairings/#elliptic-curves-and-pairings). Ainda assim, a ideia é simples o suficiente para repetir aqui: em vez de assumir que as entradas vêm de dois grupos disjuntos, permitimos que elas venham do **mesmo grupo**:

$$
e: \mathbb{G}_1 \times \mathbb{G}_1 \rightarrow \mathbb{G}_3
$$

Há algumas condições que precisam ser atendidas para que isso seja possível, mas não vamos nos preocupar muito com isso, e apenas assumir que pode ser feito. Para nossa própria sanidade mental.

<figure>
  <img
    src="/images/cryptography-101/pairing-applications-and-more/rambo-thanks.webp" 
    alt="Rambo thumbs up"
  />
</figure>

### Gerando os Segredos {#generating-the-secrets}

Uma vez que temos um auto-emparelhamento em mãos, a geração de chaves é realmente bem direta. Vamos assumir que André e Bruna querem gerar o mesmo segredo compartilhado. E eles já obtiveram suas **chaves secretas**:

$$
Q_A = H(ID_A) \rightarrow S_A = [s]Q_A
$$

$$
Q_B = H(ID_B) \rightarrow S_B = [s]Q_B
$$

A estratégia é simples: se conseguirmos pensar em duas avaliações de emparelhamento que produzam o mesmo resultado — e que possam ser executadas independentemente por André e Bruna —, então estamos prontos. Olha como isso é elegante:

$$
e([s]Q_A, Q_B) = e(Q_A, Q_B)^s = e(Q_A, [s]Q_B)
$$

Ou simplesmente:

$$
e(S_A, Q_B) = e(Q_A, S_B)
$$

Tudo que André precisa saber é sua chave secreta, e a chave pública de Bruna, e ele pode avaliar a expressão do lado esquerdo. Por outro lado, Bruna só precisa da chave pública de André, e sua própria chave privada, e ela pode avaliar a expressão do lado direito. E ambos obtêm o mesmo resultado! Notável.

### Estendendo o Esquema {#extending-the-scheme}

O protocolo Diffie-Hellman pode ser estendido para que um segredo compartilhado possa ser gerado entre mais de dois participantes. Então, imagine que temos três participantes que querem gerar o mesmo segredo compartilhado. Ao trabalhar com curvas elípticas, eles vão computar este valor compartilhado:

$$
[a][b][c]G
$$

Dado que André tem um valor secreto $a$, Bruna tem valor secreto $b$, e Carlos tem valor secreto $c$.

Uma **ideia similar** pode ser aplicada a emparelhamentos, que foi proposta por [Antoine Joux em 2003](https://link.springer.com/content/pdf/10.1007/s00145-004-0312-y.pdf). Veja a seguinte avaliação de emparelhamento:

$$
K_{ABC} = e(G,G)^{a.b.c}
$$

Poderíamos distribuir os expoentes de forma inteligente assim:

$$
e([b]G, [c]G)^a = e([a]G, [c]G)^b = e([a]G, [b]G)^c
$$

Veja, o que é interessante aqui é que os valores $[a]G$, $[b]G$, e $[c]G$ não vazam informação sobre os valores secretos $a$, $b$, e $c$ (a menos que você possa resolver um DLP!). Por essas razões, esses valores podem ser **públicos**, e depois, todos podem computar o mesmo valor compartilhado!

> Esta extensão não usa a **identidade** dos usuários para o processo. Por sua vez, isso apenas mostra como emparelhamentos habilitam criptografia baseada em identidade, mas não são **limitados** a essa aplicação.

E aí está! Troca de chaves baseada em emparelhamentos. Legal, né?

<figure>
  <img
    src="/images/cryptography-101/pairing-applications-and-more/distracted-boyfriend.webp" 
    alt="Distracted boyfriend meme"
    title="Pairings are starting to look more attractive, ain't them?"
  />
</figure>

---

## Assinaturas Baseadas em Identidade {#identity-based-signatures}

Se encriptação baseada em emparelhamentos era possível, então o próximo passo é tentar criar **assinaturas** baseadas neles.

Vamos apresentar uma **versão simplificada**, que será relativamente fácil de entender. Há outros esquemas de assinatura de interesse por aí — como as bem conhecidas [assinaturas BLS](https://www.iacr.org/archive/asiacrypt2001/22480516.pdf), mas não vamos entrar em detalhes para não sobrecarregar vocês com informação. Vamos manter simples.

<figure>
  <img
    src="/images/cryptography-101/pairing-applications-and-more/homer-stuffing.webp" 
    alt="Homer Simpson being doughtnut-stuffed"
    title="Death cause: cryptography stuffing"
    width="350"
  />
</figure>

### A Versão Simplificada {#the-simplified-version}

Vamos querer definir a configuração corretamente, novamente. Me acompanhe por um segundo!

Começa quase igual ao antes, onde temos um PKG com um segredo mestre s, que torna públicos os valores $P$, e $Q = [s]P$. Além disso, precisamos de algumas funções hash: a mesma $H$ definida no artigo anterior, que vamos chamar de $H_1$ desta vez:

$$
H_1: \{0,1\}^* \rightarrow \mathbb{G}_1
$$

E uma segunda função hash $H_2$, que deve ser desta forma:

$$
H_2: \{0,1\}^* \times\mathbb{G}_1 \rightarrow \mathbb{Z}_r
$$

Finalmente, vamos assumir que o signatário obteve uma chave privada da forma:

$$
Q_{ID} = H(ID) \rightarrow S_{ID} = [s]Q_{ID}
$$

Onde o hash do $ID$ é a chave pública. E isso é tudo que precisamos!

<figure>
  <img
    src="/images/cryptography-101/pairing-applications-and-more/borat-nice.webp" 
    alt="Borat very nice meme"
    width="512"
  />
</figure>

Com a configuração no lugar, vamos dar uma olhada em como uma **assinatura baseada em identidade** (IBS) funciona.

> A propósito, o esquema apresentado é baseado [neste paper](https://eprint.iacr.org/2002/018).

Para assinar uma mensagem $M$, que é uma sequência de bits de qualquer comprimento:

$$
M \in \{0,1\}^*
$$

precisamos fazer o seguinte:

- Primeiro, o signatário amostra um nonce aleatório, um inteiro $k$
- Então, eles procedem a calcular os valores $U$ e $V$, como:

$$
U = [k]Q_{ID}
$$

$$
h = H_2(M, U), \ V = [k + h]S_{ID}
$$

Esses valores serão a **assinatura produzida**, a tupla $(U, V)$. Um resultado muito similar ao obtido com o [Algoritmo de Assinatura Digital de Curva Elíptica](/pt/blog/cryptography-101/encryption-and-digital-signatures/#digital-signatures) (ECDSA), onde um dos resultados codifica o nonce, e o outro codifica a chave secreta. Ou melhor, um é um **desafio** ($U$), e o outro elemento age como um **verificador** ($V$).

> Também podemos pensar em $V$ como uma espécie de **prova de conhecimento** da chave secreta.

Tudo que resta é a **verificação**. Até agora, não fizemos uso do emparelhamento — então você provavelmente pode dizer que é aqui que eles se encaixam no quebra-cabeça. E de fato, a ideia é fazer duas avaliações diferentes, uma usando $U$, e uma usando $V$. Se essas avaliações corresponderem, então isso significará que o valor $V$ foi calculado corretamente — significando que o signatário possui a **chave secreta** correta.

Essas avaliações são:

$$
e(Q,U + [h]Q_{ID}) = e(P, V)
$$

É fácil verificar que essas duas expressões devem computar para o mesmo valor:

$$
e(P,V) = e(P, [k + h]S_{ID}) = e(P, [s][k+h]Q_{ID})
$$

$$
= e([s]P, [k]Q_{ID} + [h]Q_{ID}) = e(Q, U + [h]Q_{ID})
$$

Como você pode ver, se $V$ está correto e de fato usa o segredo mestre $s$, então essas equações devem funcionar! Caso contrário, teríamos que encontrar um valor V válido que aconteça de satisfazer a igualdade acima — e isso deveria ser **super difícil**.

> Formalmente, isso é conhecido como o **Problema Bilinear Diffie-Hellman** (BDHP), que é o que sustenta a segurança desses métodos baseados em emparelhamentos.

Quer dizer, isso é **meio louco** — mas ao mesmo tempo, **não tão louco assim**. Embora emparelhamentos sejam estruturas bastante complexas, nossa construção não parece ser tão complicada! Vimos protocolos mais elaborados [pelo caminho](/pt/blog/cryptography-101/signatures-recharged). E digo isso para tentar desmistificar um pouco a criptografia baseada em identidade: é complicada porque emparelhamentos são complicados, mas se ignorarmos as nuances de sua computação e apenas focarmos em suas **propriedades**, as coisas ficam muito mais claras.

<figure>
  <img
    src="/images/cryptography-101/pairing-applications-and-more/michael-scott-rock.webp" 
    alt="Michael Scott from The Office making a rock sign"
    title="Oh I'm overflowing with happiness"
  />
</figure>

---

## Resumo {#summary}

Como você pode imaginar, há outras coisas que podemos fazer com emparelhamentos. Seguindo o plano estabelecido [neste artigo](/pt/blog/cryptography-101/protocols-galore), poderíamos inferir que há formas de construir **esquemas de comprometimento**, **provas de conhecimento**, diferentes tipos de **assinaturas**, **VRFs**, e outras primitivas baseadas em emparelhamentos.

No entanto, sugiro ir devagar com essas, para que você tenha tempo de entender essa nova coisa de **emparelhamento** que olhamos.

Vimos algumas aplicações no reino da **criptografia baseada em identidade** (uma premissa muito interessante, porque não precisamos mais lembrar daquelas chaves públicas longas chatas), mas também notamos que emparelhamentos têm outras aplicações.

Para cimentar totalmente esta última ideia, [da próxima vez](/pt/blog/cryptography-101/commitment-schemes-revisited) vamos olhar para um **esquema de comprometimento** particular que se provará essencial para entendermos algumas **provas de conhecimento zero** modernas. Até lá!
