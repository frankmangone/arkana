---
title: "Criptografia 101: Curvas Elípticas (Um Pouco) Desmistificadas"
date: "2024-03-11"
author: "frank-mangone"
thumbnail: "/images/cryptography-101/elliptic-curves-somewhat-demystified/elliptic-curve.webp"
tags: ["cryptography", "ellipticCurves", "mathematics", "modularArithmetic"]
description: "Uma introdução ao mundo das curvas elípticas, formando a base para entender mecanismos criptográficos úteis"
readingTime: "7 min"
mediumUrl: "https://medium.com/@francomangone18/cryptography-101-elliptic-curves-somewhat-demystified-e835cce01e23"
---

> Este é parte de uma série maior de artigos sobre criptografia. Se este é o primeiro artigo que você encontra, recomendo fortemente começar pelo [início da série](/pt/blog/cryptography-101/where-to-start).

No [artigo anterior](/pt/blog/cryptography-101/where-to-start), discutimos brevemente algumas das ideias que sustentam boa parte das técnicas criptográficas mais utilizadas atualmente.

Ainda não discutimos **por que** grupos e aritmética modular são úteis para criptografia. Mas como você pode imaginar, a ideia geral é que eles nos permitem criar problemas que são **tão difíceis de resolver**, que é praticamente impossível quebrá-los mesmo com quantidades impressionantes de recursos computacionais. Então, por exemplo, por que uma assinatura digital funciona? Bem, porque produzir uma assinatura válida é **relativamente simples** com o conhecimento de uma chave secreta, mas **inimaginavelmente difícil** sem ela.

Lidaremos com essas considerações mais tarde. Por enquanto, acredito ser mais proveitoso focar em **outros grupos** que ajudam a tornar os problemas a resolver **ainda mais difíceis** — e é aqui que as **curvas elípticas** entram em cena.

### O que são Curvas Elípticas? {#what-are-elliptic-curves}

Uma **curva** é geralmente definida por uma **equação**. No caso das curvas elípticas, a equação $$E$$ (que é na verdade uma forma reduzida, mas vamos com ela) se parece com isso:

$$
E: y^2 = x^3 + ax + b
$$

<figure>
  <img 
    src="/images/cryptography-101/elliptic-curves-somewhat-demystified/elliptic-curve.webp" 
    alt="Uma curva elíptica" 
    title="[zoom] Um gráfico da curva y² = x³ - x"
  />
</figure>

Mas espere... O que isso tem a ver com grupos? Isso é apenas uma curva, afinal!

Vamos recapitular o que aprendemos até agora, ok? Um grupo é definido por um **conjunto** (vamos chamá-lo de $\mathbb{G}$), e uma **operação binária** envolvendo dois elementos de $\mathbb{G}$, e produzindo uma saída que também está em $\mathbb{G}$. Se pudermos pensar em uma maneira de usar curvas elípticas para que obtenhamos um **conjunto** e uma **operação binária** válidos, então encontramos um grupo.

E certamente, há **algo** que podemos fazer!

---

## A Operação do Grupo {#the-group-operation}

Pegue quaisquer dois pontos $$P$$ e $$Q$$ na curva elíptica, então desenhe uma **linha** através desses pontos. Algumas substituições básicas mostram que existirá (quase sempre) um **terceiro ponto** de interseção. Então pegue esse ponto, imagine que o eixo x é um espelho, e reflita-o verticalmente. Parabéns, você acabou de chegar ao ponto $$R = P + Q$$!

Este processo é chamado de **regra da corda e tangente**. E é, de fato, a **operação do grupo** que estamos procurando.

A primeira vez que vi isso, lembro de ter pensado "que processo estranho". Lembro de ter me perguntado: **por que diabos você precisa inverter o terceiro ponto de interseção**? E depois de me aprofundar mais no assunto, tudo que posso dizer é: explicar o motivo pelo qual isso faz sentido está muito além do escopo deste artigo. Só vou pedir que você confie em mim que tudo é **perfeitamente sólido**, pelo menos por enquanto.

<figure>
  <img 
    src="/images/cryptography-101/elliptic-curves-somewhat-demystified/chord-and-tangent.webp" 
    alt="Diagrama da corda e tangente"
    title="[zoom] A curva elíptica y² = x³ - x + 1 (vermelho) com uma representação da operação P + Q = R"
  />
</figure>

Você pode tentar isso você mesmo em uma ferramenta gráfica como [Desmos](https://www.desmos.com/calculator) ou [GeoGebra](https://www.geogebra.org/graphing?lang=en).

Um componente resolvido, ainda falta mais um — também precisamos de um **conjunto**. E já que a **regra da corda e tangente** mapeia dois pontos na curva elíptica para outro, segue naturalmente que estaremos trabalhando com um **conjunto de pontos na curva elíptica**. Mas há dois problemas com isso, a saber:

- A maioria dos pontos na curva elíptica são de valor real, significando que as coordenadas podem não ser **inteiros**. E é importante que sejam: caso contrário, podemos ter erros de arredondamento ao calcular $P + Q$.
- Há um número **infinito** de pontos na curva, e estamos procurando um conjunto **finito**.

Então como resolvemos esses problemas?

### Encontrando um Conjunto Adequado {#finding-a-suitable-set}

Acontece que algumas curvas elípticas têm um número infinito de pontos com valores inteiros, isto é, pontos como $P = (1,2)$. Por causa disso, nosso primeiro problema desaparece de forma um tanto mágica com uma **seleção adequada** de curva elíptica. Vamos assumir que sabemos como fazer isso, e focar no segundo problema.

Há um truque interessante para transformar uma quantidade infinita de inteiros em um conjunto finito, e já o **vimos em ação**. Você consegue adivinhar? Isso mesmo, a **operação módulo**!

<figure>
  <img 
    src="/images/cryptography-101/elliptic-curves-somewhat-demystified/discrete-curve.webp" 
    alt="Como uma curva elíptica sobre os inteiros (módulo 23) se parece"
    title="[zoom] Os pontos de uma curva elíptica, módulo 23"
  />
</figure>

Formalmente, dizemos que a curva elíptica é definida sobre um **campo finito**, então qualquer ponto que esteja "fora do intervalo" é simplesmente mapeado de volta para o intervalo com a operação módulo. Isso é denotado como:

$$
E(\mathbb{F_q}) \ / \ \mathbb{F}_q = \{0,1,2,3,...,q-1\}
$$

E aí está! Agora temos um **conjunto**, e uma maneira de calcular o resultado de **"adicionar" dois pontos**. Mas temos mesmo? Algo está faltando...

### A Identidade do Grupo {#the-group-identity}

Dê uma olhada na seguinte imagem. O que acontece se tentarmos adicionar $$P + Q$$ neste cenário?

<figure>
  <img 
    src="/images/cryptography-101/elliptic-curves-somewhat-demystified/cancelling-points.webp" 
    alt="Dois pontos verticalmente alinhados sendo somados"
    title="[zoom]"
  />
</figure>

Podemos ver imediatamente que **não há terceiro ponto de interseção**! O pânico se instala. Isso significa que nossa construção não funciona?

<figure>
  <img 
    src="/images/cryptography-101/elliptic-curves-somewhat-demystified/panic-cat.webp" 
    alt="Um gato assustado"
    width="236"
    title="*Pânico"
  />
</figure>

Felizmente, a crise é rapidamente evitada definindo um **novo elemento do grupo**, denotado $\mathcal{O}$. Pense nele como um **ponto no infinito** — que não é realmente o que acontece, mas pode ajudar na conceituação. Este novo elemento tem uma propriedade interessante, dado qualquer ponto $$P$$ na curva:

$$
P + \mathcal{O} = \mathcal{O} + P = P
$$

Isso não lhe parece familiar? Não é **exatamente** o que acontece quando adicionamos **zero** a qualquer número?

De fato, esse comportamento é importante na teoria dos grupos — o papel que o **zero** desempenha no grupo dos inteiros, e o papel que $\mathcal{O}$ desempenha nas curvas elípticas é o da [**identidade**](https://en.wikipedia.org/wiki/Identity_element) dos respectivos grupos. Adicionar este elemento ao nosso conjunto o torna completo — e agora podemos adicionar dois pontos e sempre ter um resultado válido.

Mas ainda não terminamos. Há mais um pequeno detalhe que precisamos cobrir.

### Duplicação de Pontos {#point-doubling}

O que acontece se tentarmos adicionar $$P + P$$? Para tentar seguir a **regra da corda e tangente**: precisamos de uma linha através dos dois pontos na operação, mas aqui... **Só há um**! Então, como o nome sugere, precisaremos considerar a linha **tangente** à curva elíptica em $P$.

Como antes, encontramos outro ponto de interseção, invertemos, e encontramos $P + P$, que convenientemente denotaremos como $[2]P$. Em um absoluto lampejo de inspiração, esta operação foi chamada de **duplicação de ponto**.

<figure>
  <img 
    src="/images/cryptography-101/elliptic-curves-somewhat-demystified/point-doubling.webp" 
    alt="Duplicação de ponto em ação"
    title="[zoom] Duplicação de ponto em ação"
  />
</figure>

Calcular $P + [2]P$ então procede como de costume: desenhe uma linha através dos dois pontos, inverta o terceiro ponto de interseção, e voilà! Você acabou de obter $[3]P$. Faça isso novamente, e você terá $[4]P$. E aqui, podemos observar algo peculiar: adicionar $P$ quatro vezes ($P + P + P + P$) produz o **mesmo resultado** que adicionar $[2]P + [2]P$!

Por mais inocente que a afirmação anterior pareça, ela é na verdade a **ferramenta mais poderosa** que temos ao trabalhar com curvas elípticas. Suponha que queremos calcular $[12384162178627301263]P$. Fazer isso um ponto por vez levaria muito tempo — mas aplicando corretamente a **duplicação de pontos**, o resultado pode ser obtido **exponencialmente mais rápido**!

Isso sugere os problemas **extremamente difíceis** que foram mencionados no início deste artigo. E como discutiremos em breve, isso é **precisamente** o tipo de problemas difíceis que permitem que construções criptográficas baseadas em grupos existam!

---

## Resumo {#summary}

Acabamos de definir grupos de **curvas elípticas**. Eles são apenas um monte de pontos inteiros, que podemos adicionar, e que estão dentro de um intervalo graças à operação módulo. Geralmente, quando curvas elípticas são mencionadas na literatura, significa o **grupo**, não a curva. Se a curva precisa de menção específica, é frequentemente chamada de **curva afim**.

Se você se sente assim agora:

<figure>
  <img 
    src="/images/cryptography-101/elliptic-curves-somewhat-demystified/no-idea-what-im-doing.webp" 
    alt="Meme 'não faço ideia do que estou fazendo'"
    title="Eu toda manhã"
  />
</figure>

Tudo que posso dizer é que isso pode ser difícil de entender no primeiro contato, mas uma vez que você assimila, parece bastante natural. Dê um tempo, e não hesite em entrar em contato se tiver alguma dúvida!

> Além disso, você pode brincar com curvas elípticas [neste site](https://andrea.corbellini.name/ecc/interactive/modk-add.html).

Nossa base está estabelecida. No [próximo artigo](/pt/blog/cryptography-101/encryption-and-digital-signatures), examinaremos o que podemos fazer com nosso conhecimento de curvas elípticas. Veremos um esquema para **criptografia assimétrica**, e outro para **assinaturas digitais**. Fique ligado!
