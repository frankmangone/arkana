---
title: "Cryptography 101: Protocols Galore"
date: "2024-04-02"
author: "Frank Mangone"
tags:
  [
    "Cryptography",
    "Zero Knowledge Proofs",
    "Verifiable Randomness",
    "Elliptic Curve",
    "Key Exchange",
  ]
description: "A gentle introduction to some very useful schemes: key exchange, commitment schemes, zero-knowledge proofs, verifiable random functions"
readingTime: "11 min"
---

> This is part of a larger series of articles about cryptography. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/cryptography-101/where-to-start).

Alright! We’ve come pretty far already. We have [groups](/en/blog/cryptography-101/where-to-start) (and in particular [elliptic curves](/en/blog/cryptography-101/elliptic-curves-somewhat-demystified)) and [hashing](/en/blog/cryptography-101/hashing) as tools at our disposal, and we’ve already [seen them in action](/en/blog/cryptography-101/encryption-and-digital-signatures).

But a lot more can be done with what we know. This article will be dedicated to listing and explaining cryptographic protocols based on elliptic curves.

> I must point out that the _same protocols_ can be constructed using the group of integers modulo $q$. We’ll stick with elliptic curves, since there are some benefits in using them. That discussion will happen another time.

This list is by no means _complete_ — there’s more out there. Still, this should provide a solid base for you to have a good grasp of what’s possible with what we know so far.

Buckle up, and let’s jump right into it!

---

## Key Exchange

Remember the [symmetric encryption](/en/blog/cryptography-101/encryption-and-digital-signatures/#encryption) example? It relied on the usage of a _shared secret key_. We briefly mentioned that sharing a secret key over an insecure channel is not a good idea — _anyone_ could be eavesdropping. And if they are, and they get ahold of the shared secret, then they could decrypt any subsequent messages!

Luckily, there are mechanisms to _generate shared keys_ in a safe way. The most common technique to do this is the [Diffie-Hellman key exchange](https://brilliant.org/wiki/diffie-hellman-protocol/) algorithm. This method was originally formulated using the integers modulo $q$, but can easily be extended to elliptic curves — and we get the so called _Elliptic Curve Diffie-Hellman (ECDH)_ method. This is what it looks like:

<figure className="my-8">
  <img 
    src="/images/cryptography-101/protocols-galore/diffie-hellman.webp" 
    alt="Diffie hellman hey exchange visualization"
    className="bg-white"
  />
</figure>

The idea is simple: Alice and Bob want to _combine_ their individual secrets, to produce a _shared key_.

### Crafting the Shared Secret

To do this, Alice and Bob agree on an elliptic curve to use, and some generator $G$ for the curve. Let’s say that Alice chooses a secret integer $a$, and Bob chooses another secret integer $b$. How do they combine them?

- Alice computes $A = [a]G$, and sends that to Bob. Remember that Bob can’t possibly recover $a$ from $A$ — it’s extremely difficult.
- Bob receives $A$, and computes $S = [b]A = [b]([a]G) = [b.a]G$.

Bob also sends out $B = [b]G$, and Alice also computes $S = [a]B = [a]([b]G) = [b.a]G$. And look at that — they have both calculated the same point $S$!

The neat thing about this is that anyone intercepting the communications between Alice and Bob would only obtain either $A$ or $B$. And on their own, these points _mean nothing_.

Just like that, they have safely created a _shared key_! Sensational. Just remember to keep the generated key safe!

<figure className="my-8">
  <img
    src="/images/cryptography-101/protocols-galore/gandalf.webp" 
    alt="Gandalf meme" 
  />
  <figcaption className="text-center text-sm text-gray-500 mt-2">
    And heed Gandalf's advice
  </figcaption>
</figure>

---

## Commitment Schemes

Okay, we know how to safely generate a shared key. What more can we do?

Another idea is that of _committing_ to a value _ahead of time_. And to illustrate, let’s play some _rock-paper-scissors_. But let’s play it in turns. This is how it would go:

> Alice plays rock. Then Bob plays paper. Easiest win of his life.

Obviously, the problem here is that Alice _revealed_ her play ahead of time. What if she could _hide_ her play though?

<figure className="my-8">
  <img
    src="/images/cryptography-101/protocols-galore/rock-paper-scissor.webp" 
    alt="Async rock-paper-scissor" 
    className="bg-white"
  />
  <figcaption className="text-center text-sm text-gray-500 mt-2">
    An unusual game of rock-paper-scissors
  </figcaption>
</figure>

Alice produces some value that’s _tied_ to her play (scissors), but which also _hides_ her decision. This is known as a _commitment_. Later, Alice _reveals_ the original value, and Bob _verifies_ that it matches the commitment. It’s really like putting your play on a sealed envelope, and _opening_ it when needed.

I know what you’re thinking: why on Earth would anyone play rock-paper-scissors in this fashion? I don’t really know. But that’s not the point — we can use this idea to craft useful protocols.

### Creating the Commitment

Let’s build what’s called a [Pedersen commitment](https://www.rareskills.io/post/pedersen-commitment). This type of scheme requires a _setup_ step, which should return a generator $G$ of an elliptic curve, and some other point $H = [k]G$.

$$
\textrm{log}() \rightarrow (G, H)
$$

Then, if Alice wants to commit to some message $M$, she follows these steps:

- She hashes the value to an integer $h(M)$,
- She then chooses a random integer $r$, also called a _blinding factor_,
- Finally, she computes $C = [r]G + [h(M)]H$. This will be her commitment.

The commitment $C$ can be shared with anyone, because it is _hiding_: it doesn’t reveal information about the message. Later on, Alice can share the secret values $M$ and $r$, and anyone (for example, Bob) can recalculate C and check that it matches what Alice shared — we say that Alice _opens_ the commitment.

Formally, we say that a commitment scheme must be:

- **Hiding**: it should not reveal information about the committed message.
- **Binding**: the commitment can only be opened with the original $M$ and $r$. Otherwise, it should be invalid.

And finally, what about the _blinding factor_? If we don’t use it, then $C$ would always look like this: $C = [h(M)]H$. This is not good, because the hashing function is deterministic: it will always yield the same result for a fixed input.

So as soon as you see two identical commitments, you immediately know they are associated to the same information — and if you _already know_ the secret data, then the commitment is _not hiding at all_! Remember:

::: big-quote
A chain is only as strong as its weakest link
:::

The introduction of a _random_ blinding factor solves this problem. In general, this idea of _introducing randomness_ to schemes is used to prevent vulnerabilities based on repetition, such as the one we just described.

Commitment schemes are a cornerstone for more powerful constructions that we’ll explore in later articles.

---

## Signatures

We’ve [already covered](/en/blog/cryptography-101/encryption-and-digital-signatures/#digital-signatures) an example of signatures using elliptic curves, called the _Elliptic Curve Digital Signature Algorithm_ (or _ECDSA_ for short). But there are other ways to create signatures.

In particular, there’s another protocol called the [Schnorr signature](https://en.wikipedia.org/wiki/Schnorr_signature). And in all honesty, it’s simpler than ECDSA. Come to think about it, maybe we should have covered this instead of ECDSA. Yeah. Sorry for that.

<figure className="my-8">
  <img
    src="/images/cryptography-101/protocols-galore/harold.webp" 
    alt="Hide the pain meme" 
  />
  <figcaption className="text-center text-sm text-gray-500 mt-2">
    I'm sorry, Harold
  </figcaption>
</figure>

Anyway, the Schnorr signature is often presented using the _additive group of integers modulo_ $q$, but as we previously mentioned, any construction with said group can be _adapted to elliptic curves_. And this is what we shall demonstrate now.

The setup is the same as before, in ECDSA: Alice holds a private key $d$, and Harold (sorry Bob, we owe him at least this much) holds the associated public key $Q = [d]G$, where $G$ is a group generator that Alice and Harold have agreed upon.

To sign, Alice does the following:

- She chooses a random integer $r$, and calculates $R = [r]G$.
- Then, she calculates the hash $e = H(R || M)$. Here, the $||$ represents _bitwise concatenation_ — so essentially she just hashes a bunch of zeroes and ones. Oh, and $e$ is an integer.
- Finally, she computes $s = r - e.d$.

The signature is the pair $(s, e)$. To verify, Harold follows this procedure:

- He computes $R’ = [s]G + [e]Q$,
- And he accepts if $e = H(R’ || M)$.

Simple, right? This time, we didn’t need to calculate any _modular multiplicative inverses_. And it’s fairly straightforward to check that $R’$ should match $R$:

$$
R' = [s]G + [e]Q = [r - e.d + e.d]G = [r]G = R
$$

Schnorr signatures offer an alternative to the more well-established ECDSA. In fact, they are simpler to implement, don’t rely on modular multiplicative inverses, and theoretically offer more security. Some blockchains like [Polkadot](https://wiki.polkadot.network/learn/learn-cryptography/) have already adopted this signature scheme; in the end, it’s up to you to decide what to use.

---

## Zero-Knowledge Proofs

[Zero-knowledge proofs](https://en.wikipedia.org/wiki/Zero-knowledge_proof) (ZKPs for short) have been a hot topic in the past few years. They are not a new discovery by any means, but they have received a lot of interest because of their properties, and the cool things that can be done with them.

Essentially, a ZKP is a way to demonstrate or prove knowledge of _something_, without revealing _anything_ about it. Sounds crazy, right? How can I tell you I know something _without telling you what that something is_?

> Here’s an excellent video that shows some great examples of ZKPs.

<video-embed src="https://www.youtube.com/watch?v=fOGdb1CTu5c" />

The one example I love the most is the _Where’s Waldo_ proof: what I want to prove is that I know where Waldo is. One option is simply to point at him — but this would effectively reveal his location!

In order _not_ to reveal it, I can do the following: take a large piece of cardboard, punch a hole on it the size of Waldo, and place it over the book. You can see Waldo through the hole, but you can’t see _where he’s placed on the page_!

<figure className="my-8">
  <img
    src="/images/cryptography-101/protocols-galore/waldo.webp" 
    alt="Waldo" 
  />
  <figcaption className="text-center text-sm text-gray-500 mt-2">
    There he is, the slippery son of a gun
  </figcaption>
</figure>

### The Schnorr Protocol

Clearly, we’re not about to build a Where’s Waldo location proving system with elliptic curves. We’ll have to content ourselves with something far simpler: proving knowledge of the _discrete logarithm_ of a point. This is, proving that we know some value $x$, such that $Y = [x]G$, with $G$ being a generator of an elliptic curve group. The group has order $n$.

What we’re about to describe is called the [Schnorr protocol](https://en.wikipedia.org/wiki/Proof_of_knowledge#:~:text=%5Bedit%5D-,Schnorr%20protocol,-%5Bedit%5D), adapted to elliptic curves. It is a very simple and elegant protocol, and it provides a great foundation for more complex proofs of knowledge.

> Here’s Claus P. Schnorr, by the way. Rocking his 80 years of age. What a legend.

<video-embed src="https://www.youtube.com/watch?v=qVyuYQGQ-_0" />

> Copy in progress!
