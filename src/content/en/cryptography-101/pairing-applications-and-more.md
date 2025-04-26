---
title: "Cryptography 101: Pairing Applications & More"
date: "2024-05-28"
author: "frank-mangone"
thumbnail: "/images/cryptography-101/pairing-applications-and-more/rambo-thanks.webp"
tags:
  [
    "Cryptography",
    "Pairing",
    "Mathematics",
    "Digital Signatures",
    "Key Exchange",
  ]
description: "Following our presentation of pairings, we look at a couple more applications enabled by this new tool"
readingTime: "8 min"
---

> This is part of a larger series of articles about cryptography. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/cryptography-101/where-to-start).

In our [previous installment](/en/blog/cryptography-101/pairings), we learned about pairings, a structure that unlocked some new possibilities and some exotic cryptography based on identity. And we saw how **Identity-Based Encryption** (IBE) works.

This time, we'll focus on a couple more examples of pairing applications, while also sprinkling some other details along the way.

As we did last time, pairings will be treated as sort of **black boxes**, in the sense that we won't care about how to compute them — only their **bilinearity** will be of interest to us.

### The Required Setup

For the methods we're about to present, a certain setup or infrastructure will be required. This was [already presented](/en/blog/cryptography-101/pairings/#the-setup) last time, but we'll briefly reiterate the idea here, for the sake of self-containment.

A **Private Key Generator** (PKG) is assumed to exist, which is in charge of **generating private keys** from the **identities** of users, and also needs to make public some **system parameters**. You can check how this works and what the parameters are in the [previous article](/en/blog/cryptography-101/pairings).

Without further ado, here we go!

---

## Key Exchange

If you've been following the series so far, this will sound familiar to you — because we've [already seen](/en/blog/cryptography-101/protocols-galore/#key-exchange) key exchange methods in the series. The [Diffie-Hellman Key Exchange](/en/blog/cryptography-101/protocols-galore/#crafting-the-shared-secret) (DHKE) algorithm is one of the most fundamental methods in cryptography, essential for anything that uses symmetric keys.

Naturally, this is a good place to start our **identity-based** cryptography journey.

For this to work, we'll require a particular type of pairing — sometimes referred to as a **self-pairing**. Again, we discussed this notion in the [previous post](/en/blog/cryptography-101/pairings/#elliptic-curves-and-pairings). Still, the idea is simple enough to repeat here: instead of assuming the inputs come from two disjoint groups, we allow them to come from the **same group**:

$$
e: \mathbb{G}_1 \times \mathbb{G}_1 \rightarrow \mathbb{G}_3
$$

There are some conditions that have to be met for this to be possible, but let's not worry about this too much, and just assume that it can be done. For our own sanity.

<figure>
  <img
    src="/images/cryptography-101/pairing-applications-and-more/rambo-thanks.webp" 
    alt="Rambo thumbs up"
  />
</figure>

### Generating the Secrets

Once we have a self-pairing at hand, the key generation is really quite straightforward. Let's assume that Alice and Bob want to generate the same shared secret. And they have already obtained their **secret keys**:

$$
Q_A = H(ID_A) \rightarrow S_A = [s]Q_A
$$

$$
Q_B = H(ID_B) \rightarrow S_B = [s]Q_B
$$

The strategy is simple: if we can think of two pairing evaluations that yield the same result — and that can be executed independently by Alice and Bob — , then we're done. Look at how elegant this is:

$$
e([s]Q_A, Q_B) = e(Q_A, Q_B)^s = e(Q_A, [s]Q_B)
$$

Or simply:

$$
e(S_A, Q_B) = e(Q_A, S_B)
$$

All Alice has to know is her secret key, and Bob's public key, and she can evaluate the expression on the left-hand side. Conversely, Bob only requires Alice's public key, and his own private key, and he can evaluate the right-hand side expression. And they both get the same result! Remarkable.

### Extending the Scheme

The Diffie-Hellman protocol can be extended so that a shared secret can be generated amongst more than two participants. So, imagine we have three participants that want to generate the same shared secret. When working with elliptic curves, they will compute this shared value:

$$
[a][b][c]G
$$

Given that Alice has a secret value $a$, Bob has secret value $b$, and Charlie has secret value $c$.

A **similar idea** can be applied to pairings, which was proposed by [Antoine Joux back in 2003](https://link.springer.com/content/pdf/10.1007/s00145-004-0312-y.pdf). Check the following pairing evaluation:

$$
K_{ABC} = e(G,G)^{a.b.c}
$$

We could cleverly distribute the exponents in this way:

$$
e([b]G, [c]G)^a = e([a]G, [c]G)^b = e([a]G, [b]G)^c
$$

You see, what's interesting here is that the values $[a]G$, $[b]G$, and $[c]G$ do not leak information about the secret values $a$, $b$, and $c$ (unless you can solve a DLP!). For these reason, these values can be _q_, and afterwards, everyone can compute the same shared value!

> This extension does not use the users' **identity** for the process. In turn, this just goes to show how pairings enable identity-based cryptography, but are not **limited** to that application.

And there you go! Key exchange based on pairings. Nice, isn't it?

<figure>
  <img
    src="/images/cryptography-101/pairing-applications-and-more/distracted-boyfriend.webp" 
    alt="Distracted boyfriend meme"
    title="Pairings are starting to look more attractive, ain't them?"
  />
</figure>

---

## Identity-Based Signatures

If encryption based on pairings was possible, then the next step is to try and craft **signatures** based on them.

We'll present a **simplified version**, which will be relatively easy to understand. There are other signature schemes of interest out there — such as the well-known [BLS signatures](https://www.iacr.org/archive/asiacrypt2001/22480516.pdf), but we won't go into detail so as not to overload you guys with information. Let's keep it simple.

<figure>
  <img
    src="/images/cryptography-101/pairing-applications-and-more/homer-stuffing.webp" 
    alt="Homer Simpson being doughtnut-stuffed"
    title="Death cause: cryptography stuffing"
    width="350"
  />
</figure>

### The Simplified Version

We'll want to define the setup correctly, again. Bear with me for a second!

It starts just about the same as before, where we have a PKG with a master secret s, who makes the values $P$, and $Q = [s]P$ public. Furthermore, we need a couple hash functions: the same $H$ defined in the previous article, which we'll call $H_1$ this time around:

$$
H_1: \{0,1\}^* \rightarrow \mathbb{G}_1
$$

And a second hash function $H_2$, which must be of this form:

$$
H_2: \{0,1\}^* \times\mathbb{G}_1 \rightarrow \mathbb{Z}_r
$$

Finally, we'll assume that the signer has obtained a private key of the form:

$$
Q_{ID} = H(ID) \rightarrow S_{ID} = [s]Q_{ID}
$$

Where the hash of the $ID$ is the public key. And that's all we need!

<figure>
  <img
    src="/images/cryptography-101/pairing-applications-and-more/borat-nice.webp" 
    alt="Borat very nice meme"
    width="512"
  />
</figure>

With the setup in place, let's take a look at how an **identity-based signature** (IBS) works.

> By the way, the presented scheme is based on [this paper](https://eprint.iacr.org/2002/018).

To sign a message $M$, which is a sequence of bits of any length:

$$
M \in \{0,1\}^*
$$

we need to do the following:

- First, the signer samples a random nonce, an integer $k$
- Then, they proceed to calculate the values $U$ and $V$, as:

$$
U = [k]Q_{ID}
$$

$$
h = H_2(M, U), \ V = [k + h]S_{ID}
$$

These values will be the **produced signature**, the tuple $(U, V)$. A very similar result to the one obtained with the [Elliptic Curve Digital Signature Algorithm](/en/blog/cryptography-101/encryption-and-digital-signatures/#digital-signatures) (ECDSA), where one of the results encodes the nonce, and the other encodes the secret key. Or rather, one is a **challenge** ($U$), and the other element acts as a **verifier** ($V$).

> We can also think of $V$ as a sort of a **proof of knowledge** of the secret key.

All that remains is **verification**. So far, we haven't made use of the pairing — so you can probably tell that this is where they fit into the puzzle. And indeed, the idea is to make two different evaluations, one using $U$, and one using $V$. If these evaluations match, then this will mean the value $V$ was correctly calculated — meaning that the signer holds the correct **secret key**.

These evaluations are:

$$
e(Q,U + [h]Q_{ID}) = e(P, V)
$$

It's easy to check that these two expressions should compute to the same value:

$$
e(P,V) = e(P, [k + h]S_{ID}) = e(P, [s][k+h]Q_{ID})
$$

$$
= e([s]P, [k]Q_{ID} + [h]Q_{ID}) = e(Q, U + [h]Q_{ID})
$$

As you can see, if $V$ is correct and indeed uses the master secret s, then these equations should work out! Otherwise, we'd have to find a valid value V that happens to suffice the equality above — and that should be **super hard**.

> Formally, this is known as the **Bilinear Diffie-Hellman Problem** (BDHP), which is what underpins the security of these pairing-based methods.

I mean, this is **kinda crazy** — but at the same, **not that crazy**. While pairings are fairly complex structures, our construction doesn't seem to be that complicated! We've seen more elaborate protocols [along the way](/en/blog/cryptography-101/signatures-recharged). And I say this to try and demystify identity-based cryptography a bit: it is complicated because pairings are complicated, but if we ignore the nuances of their computation and just focus on their **properties**, things become much clearer.

<figure>
  <img
    src="/images/cryptography-101/pairing-applications-and-more/michael-scott-rock.webp" 
    alt="Michael Scott from The Office making a rock sign"
    title="Oh I'm overflowing with happiness"
  />
</figure>

---

## Summary

As you may imagine, there are other things we can do with pairings. Following the blueprint established in [this article](/en/blog/cryptography-101/protocols-galore), we could infer that there are ways to build **commitment schemes**, **knowledge proofs**, different types of **signatures**, **VRFs**, and other primitives based on pairings.

Nevertheless, I suggest going slow with these, so you have the time to wrap your head around this new **pairing** stuff we looked at.

We saw a couple applications in the realm of **identity-based cryptography** (a very interesting premise, because we don't need to remember those pesky long public keys anymore), but also took notice that pairings have other applications.

To fully cement this last idea, [next time](/en/blog/cryptography-101/commitment-schemes-revisited) we'll be looking at a particular **commitment scheme** that will prove essential for us to understand some modern **zero knowledge proofs**. See you then!
