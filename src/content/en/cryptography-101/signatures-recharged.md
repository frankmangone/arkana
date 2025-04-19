---
title: "Cryptography 101: Signatures Recharged"
date: "2024-04-09"
author: "Frank Mangone"
tags: ["Cryptography", "Digital Signatures", "Elliptic Curve", "Mathematics"]
description: "A quick look at some slightly more elaborate signature schemes than usual"
readingTime: "11 min"
---

> This is part of a larger series of articles about cryptography. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/cryptography-101/where-to-start).

If you've been following the series, then you've already seen your fair share of cryptographic shenanigans. Especially in the [previous article](/en/blog/cryptography-101/protocols-galore). Still... That's just the tip of the iceberg.

<figure>
  <img
    src="/images/cryptography-101/signatures-recharged/iceberg.webp" 
    alt="An iceberg" 
    title="Don't worry, though. Our descent into the depths will be slow and steady"
  />
</figure>

There's **so much more** to learn. We can do a lot more with elliptic curves (and groups in general, to be fair). In particular, **digital signatures** have some **elegant variants** that prove to be extremely useful in the right context. This will be the topic for today's article.

### A Friendly Forewarning

I reckon that it is at this point in the series where the math gets **slightly spicier** than usual. The complexity of the protocols to be presented is a little higher. If you're here just to get a general idea of cryptographic techniques, then I suggest reading **only the introduction to each topic**. I'll do my best to keep the introductions simple and self-contained, so that they provide a good overall idea, without the hassle of understanding the math.

Let's get it!

---

## Blind Signatures

In some cases, it may be necessary to sign **private information**. For example, in a **voting system**, a user may want to keep their vote **private**, but require endorsement from some third party. The latter would have to sign the vote **blindly** — without knowing what the user's vote is.

Of course, even though this is technically possible, **blind signing** should be implemented with care. You don't want to be blind signing a transaction that empties your bank account, after all.

<figure>
  <img
    src="/images/cryptography-101/signatures-recharged/sign-here.webp" 
    alt="Spongebob requesting a signature" 
    width="480"
    title="Not so fast, cowboy"
  />
</figure>

Still, if blind signatures are needed, there are many ways to construct them. One possibility is to adapt existing signature schemes. In particular, adapting Schnorr signatures is fairly simple. Let's try that!

The point is that Alice **doesn't know** what she's signing — she's going to be asked by Bob to sign some message $M$ that he previously **blinds** or **masks**. And after crafting the signature, Bob has a way to **unmask it**, so that verification works with his **original message**.

<figure>
  <img
    src="/images/cryptography-101/signatures-recharged/blind-signature.webp" 
    alt="A blind signature diagram" 
    className="bg-white"
    title="[zoom] A brief visual summary of the process"
  />
</figure>

In short:

::: big-quote
Blind signatures allow signing of private information
:::

### The Protocol

We start as usual: Alice has private key $d$ and public key $Q = [d]G$. She's going to be our signer. As always, $G$ is a generator for the elliptic curve group of choice, and has order $n$.

The process begins with Alice choosing a random integer $k$, and computing $R = [k]G$. She sends this to Bob, and then he starts the **blinding procedure**:

- Bob chooses a random integer $b$, which is called the **blinding factor**,
- He then calculates:

$$
R' = R + [b]Q
$$

- And uses this to calculate a **challenge**:

$$
e' = H(M || R')
$$

- Finally, he also blinds the challenge:

$$
e = e' + b \ \textrm{mod} \ n
$$

All that remains is for Alice to **sign**. She receives $e$, and simply calculates the signature as usual:

$$
s = k + e.d \ \textrm{mod} \ n
$$

In this particular example, Bob doesn't have to do anything upon receiving the signature — the output is simply $(s, e')$. But in general, it's possible that he needs to **reverse the blinding process** in other versions of blind signatures.

Verification happens exactly as in the standard Schnorr signature case:

$$
V = [s]G - [e']Q
$$

If this happens to be equal to $R'$, then $H(M || V)$ will be exactly equal to the challenge $e'$, and the signature is accepted. And this should be the case, because:

$$
V = [e.d + k]G - [e'.d]G = [(e' + b)d - e'.d + k]G
$$

$$
= [e'.d - e'.d + k + b.d]G = [k]G + [d.b]G = [k]G + [b]Q = R'
$$

Like clockwork, we see that a correctly calculated $s$ should in fact verify the signature (because we get back the original challenge).

> By the way, I'm purposefully omitting the modulo $n$ operations, for simplicity. But for rigorous treatment, they should be included into the demonstration.

Blind signing, check. Not that crazy, right?

Now that we've warmed up, let's take the it up a notch...

---

## Ring Signatures

Every time you digitally sign something, verification happens with knowledge of your **public key**. Therefore, you don't have **anonymity**: your public key identifies you as an **individual** holding a private key. But what if I told you there's a way to sign things **anonymously**?

**Ring signatures** offer such a functionality. The premise is that a single person in a group of people generates a signature that doesn't reveal **who in the group** was the original signer. Something like this:

<figure>
  <img
    src="/images/cryptography-101/signatures-recharged/ring-signature.webp" 
    alt="A ring signature diagram" 
    className="bg-white"
    title="[zoom] (This will make more sense when we're finished explaining, I promise)"
  />
</figure>

Again, as a short preliminary summary:

::: big-quote
Ring signatures allow a user in a group to create a signature that could have been produced by any member of the group, thus preserving the user's anonymity
:::

### Creating the Ring

In order to achieve this anonymity behavior, we must first **forge** a new and slightly unusual structure, called a **ring**.

<figure>
  <img
    src="/images/cryptography-101/signatures-recharged/ring.webp" 
    alt="The One Ring from Lord of the Rings" 
    title="No Frodo, not that ring!"
  />
</figure>

The concept of a **ring** is that of an **ordered set** (in this case, of participants), and whose order determines a series of calculations starting from a value $A$, and ending in the **same value** $A$. And as always, the idea is that crafting said sequence of computations is only feasible with knowledge of a private key.

> By the way, this is **not** a ring as in the [abstract algebraic structure](/en/blog/cryptography-101/rings). We'll talk about those later on.

So, for the setup: the ring has $p$ participants, which as previously mentioned, are **ordered**. This is, Alice is the $\#1$ participant, Bob is the $\#2$ participant, and so on.

Sarah, who is the $s^{th}$ participant, has knowledge of the public keys of **all other participants** — we'll denote those $Q_i$. She also has her **own private** and **public key** pair, which are going to be $d_s$ and $Q_s = [d_s]G$.

To produce a signature for a message $M$, Sarah does the following:

- She chooses a random integer $k$, and computes $R = [k]G$.
- She then computes a **seed**, $v = H(M || R)$.

This seed will be used for an **iterative process**. She starts by setting $e_{s+1} = v$, and then for each **other** of the $p$ participants in the ring:

- She picks a random value $k_i$, and computes:

$$
R_i = [k_i]G + [e_i]Q
$$

- And calculates the **next challenge**:

$$
e_{i+1} = H(M || R_i)
$$

Eventually, Sarah does this for **all participants**, obtaining a final challenge, which we'll just call $e$. She does this in order, starting at herself (s), and then calculating $e_{s+1}$. She continues, with this process, and upon reaching the participant $p$, then she counts up from $1$ to $s$. This is **crucial**, because the signature will be evaluated in this exact same order.

$$
e_{s+1} \rightarrow e_{s+2} \rightarrow ... \rightarrow e_p \rightarrow e_1 \rightarrow ... \rightarrow e_{s-1} \rightarrow e_s
$$

All that remains is for her to **close the ring**, meaning that the final computation should **yield back** the initial value, so $e_{s+1} = v$. For this, she has to find some value $k_s$ such that:

$$
R_s = [k_s]G + [e_s]Q
$$

$$
e_{s+1} = H(M || R_s)
$$

Since we know that $e_{s+1} = v = H(M || R)$, all we need is to find a value of $k_s$ such that $R = R_s$. Moving things around a bit:

$$
R = R_s \Rightarrow [k]G = [k_s]G + [e_s]Q
$$

$$
\mathcal{O} = [k_s]G + [e_s.d_s]G - [k]G = [k_s + e_s.d_s - k]G
$$

$$
k_s = k - e_s.d_s
$$

We can get the desired value for $k_s$. And the final signature is the tuple:

$$
(e_1, k_1, k_2, ..., k_p)
$$

It's important that the values are provided in the **order of the ring**. Sarah will be somewhere in the middle, hidden...

<figure>
  <img
    src="/images/cryptography-101/signatures-recharged/sneaky.webp" 
    alt="Sneaky Sneaky meme" 
  />
</figure>

Here's a visual representation of the whole signing process, to help better understand all the steps involved:

<figure>
  <img
    src="/images/cryptography-101/signatures-recharged/ring-flow.webp" 
    alt="General visualization of the flow explained before" 
    title="[zoom]"
  />
</figure>

### Verification

All that remains is to **verify** the signature. For this, Bob starts from $e_1$, and calculates the following for **each** participant $i$:

- The value $R_i = [k_i]G + [e_i]Q_i$
- And the next challenge, as:

$$
e_{i+1} = H(M || R_i)
$$

If the loop **closes back** correctly, meaning that the final challenge yields exactly $e_1$, then the he **accepts the signature**. Note that the ring closes because we made sure to find a suitable $k_{s-1}$ for Sarah! And we did this using Sarah's **private key** — if we didn't know it, then finding the right $k_{s-1}$ is not an easy task.

From the verifier's point of view, all the $k$ values are **indistinguishable** from one another (they are just numbers), so he can't know which one is the calculated one — remember that the others are just **random**!

All right, that was certainly a lot!

**Warning:** summations ahead. Take a breather. Hydrate. Pause for a minute.

Ready? Let's move on.

---

## Multisignatures

The idea is simple: what if we require **multiple participants** to sign something? And this is not that far-fetched: it's often a requirement when signing physical world legal documents. It feels like a very natural extension.

> Multisignatures are especially useful when signing sensitive operations. For example, admin actions in an application might require a signature from **multiple members** of an organization. This ensures no single actor has admin privileges, and that no single point of failure exists.

<figure>
  <img
    src="/images/cryptography-101/signatures-recharged/multisignature.webp" 
    alt="Multisignature schematics"
    title="[zoom]"
    className="bg-white" 
  />
</figure>

Following the pattern from previous examples, let's give a brief summary before jumping into the math:

::: big-quote
Multisignatures allow multiple users to sign a single message, so that the signature is not valid if it hasn't been signed by enough users
:::

There are multiple ways to do this.

### Schnorr Multisignatures

Schnorr signatures have a very nice property: they are **linear**. Simply put, this means that we can **add individual signatures together** and still end up with a valid signature. There are no fancy multiplicative inverses in the mix that could potentially complicate things.

Because of this, we can adapt the scheme we already presented, so that **multiple participants** can sign a message.

The setup is slightly different from the usual: each of the $p$ participants holds a private key $d_i$, and has a public key as $Q_i = [d_i]G$. We'll also need a **combined** public key $Q$, calculated as:

$$
Q = \sum_{i=1}^p Q_i
$$

Note that this is the exact same result as if we had summed up the private keys **first**, and then computed $Q$:

$$
\left [ \sum_{i=1}^p d_i \right ]G =  \sum_{i=1}^p [d_i]G = \sum_{i=1}^p Q_i
$$

Afterwards, signing happens as follows:

- Each participant picks a random number $k_i$, and calculates $R_i = [k_i]G$.
- Then, the individual $R_i$ are combined like this:

$$
R = \sum_{i=1}^p R_i
$$

-With this, a challenge $e$ is computed as $e = H(R || M)$.
-Then, each participant calculates an individual signature $s_i$:

$$
s_i = k_i - e.d_i \ \textrm{mod} \ n
$$

- Finally, the partial signatures are added to yield a single $s$, as:

$$
s = \sum_{i=1}^p s_i \ \textrm{mod} \ n
$$

And as before, the produced signature is the pair $(e, s)$. Curiosly, this pair is verified **exactly** like a normal Schnorr signature! The verifier computes $R' = [s]G + [e]Q$, and accepts if $e = H(R' || M)$. This is where the linearity comes in: we can show that $R'$ should equal $R$, and thus the signature should work.

$$
R' = [s]G + [e]Q = \left [ \sum_{i=1}^p s_i + e.\sum_{i=1}^p d_i \right ]G = \left [ \sum_{i=1}^p k_i + e.d_i - e.d_i \right ]G
$$

$$
R' = \left [ \sum_{i=1}^p k_i \right ]G = \sum_{i=1}^p [k_i]G = \sum_{i=1}^p R_i = R
$$

> Remember that I'm purposefully omitting the modulo $n$ operations to keep things as simple and clean as possible. Rigorous treatment requires that you take the operation into account!

And just like that, multiple participants have produced a single signature! Nice!

### Threshold Signatures

**Threshold signatures** offer a slightly more advanced functionality. The term **threshold** alludes to the fact that a certain **minimum** number of signers will be required for the signature to be valid. We require $t$ participants from a group of $m$ people to engage in signing, in order to produce a signature.

As always, we're going to need a **private key**. But as before, the point is that no single actor knows it — they only hold **shares** or **parts** of it. Achieving this in the case of threshold signatures is **not trivial** — one does not simply choose a random integer, as was the case for other schemes.

<figure>
  <img
    src="/images/cryptography-101/signatures-recharged/one-does-not-simply.webp" 
    alt="One does not simply meme" 
    title="One does not simply do threshold cryptography"
    width="560"
  />
</figure>

Indeed, **key generation** is a crucial step for threshold signatures to work.

Truthfully, understanding threshold signatures involves using **polynomials**, which we haven't yet covered. They will be the central topic in [upcoming installments](/en/blog/cryptography-101/polynomials). For now, we must content ourselves with knowing about the existence of this type of signatures. We'll come back to them [later in the series](/en/bloh/cryptography-101/threshold-signatures).

---

## Summary

Signatures come in many different flavors. In the end, it's all about creating a cryptographic **game** that has some specific properties. Whatever need you may have, you can probably come up with a strategy that covers it.

Do you need anonymous signing but with an **admin** that can revoke signatures? [Group signatures](https://en.wikipedia.org/wiki/Group_signature) are there to save the day. Do you want to alter the message, but keep a valid signature? [Homomorphic signatures](https://medium.com/rootstock-tech-blog/homomorphic-signatures-a6659a376185) are your thing.

We've now seen a significant number of cryptographic applications based on groups. It's due time for us to deepen our understanding of groups a step further — so next time, we'll look at group [homomorphisms and isomorphisms](/en/blog/cryptography-101/homomorphisms-and-isomorphisms). And in turn, cover a **new useful cryptographic technique**.
