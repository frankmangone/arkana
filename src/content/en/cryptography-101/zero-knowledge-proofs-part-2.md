---
title: "Cryptography 101: Zero Knowledge Proofs (Part 2)"
date: "2024-06-25"
author: "frank-mangone"
tags:
  [
    "Cryptography",
    "Zero Knowledge Proofs",
    "Mathematics",
    "Polynomial",
    "Plonk",
  ]
description: "This second round of zero knowledge proofs will take us on a journey to understand a more general framework. Hang tight!"
readingTime: "17 min"
---

> This is part of a larger series of articles about cryptography. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/cryptography-101/where-to-start).

In the past few articles, we've covered a lot of **building blocks**. It's time to finally combine all these lego pieces into a protocol. Hooray!

Remember, the reason we made such an effort to understand these moving parts was to try and build a **general framework** for zero knowledge proofs — because, as we saw, creating a protocol for a specific application was somewhat impractical, requiring **specific** research.

We're now ready to introduce a family of **knowledge proofs** that utilizes every element we've preemptively defined: **SNARKs**.

Specifically, we'll be looking at a scheme called **Plonk**. For a full disclosure of the technique, go [here](https://eprint.iacr.org/2019/953.pdf). I'll try my best to explain this as precisely as possible. Moreover, this is not the only protocol that qualifies as a **SNARK** out there. Other mechanisms such as [Groth16](https://www.rareskills.io/post/groth16), [Marlin](https://eprint.iacr.org/2019/1047.pdf), and [Halo](https://eprint.iacr.org/2019/1021.pdf) exist. I might tackle those in the future, but for now, I'll just leave a couple links here in case you want to follow your curiosity!

### Disclaimer

This article is gonna be **long**, and honestly, **complex**. As in, probably **harder than usual**. There's only so much I can do to simplify the explanation for a protocol that is **pretty darn complex**.

But, if I had to put this entire process into a single phrase, it would be:

::: big-quote
In Plonk, we encode the computation of a circuit into a series of polynomials, which represent the constraints imposed by the circuit, for which we can prove statements by using a series of tests, without ever revealing the polynomials themselves — and thus, not leaking the secret inputs.
:::

Getting to fully understand this will be a **wild ride**. And there are several elements that we'll need to cover. Here's an overview of the plan, which doubles up as a sort of **table of contents**:

- Circuits as sets of constraints
- Encoding the circuit into polynomials
- Listing the requirements for verification
- Techniques for verification
- Verification

> Also, I'm assuming you already checked out the article about [polynomial commitment schemes](/en/blog/cryptography-101/commitment-schemes-revisited), and also the one about [arithmetic circuits](/en/blog/cryptography-101/arithmetic-circuits). If you haven't, I strongly recommend reading them!

Without further ado, here we go!

---

## What is a SNARK?

The acronym stands for **S**uccint **N**on-interactive **AR**guments of **K**nowledge. In plain english: a mechanism to prove **knowledge** of something, that's **succint** (or short, or small) and **non-interactive**. There are a couple things that we need to dissect here, to better understand the goal of the construction:

- **Succint** means that whatever proof we produce must be small in size, and fast in evaluation time.
- **Non-interactive** means that upon receiving the proof, the verifier will not need any further interaction with the prover. More on this later.
- Finally, we say that this is a **knowledge proof**, but not necessarily a zero knowledge proof (although it **can** be). In particular, **Plonk** qualifies as zero knowledge because of how it's constructed.

Fret not — we cannot build our SNARK yet. We'll need to cover a few concepts first.

---

## Revisiting Circuits

In the previous article, we saw how [arithmetic circuits](/en/blog/cryptography-101/arithmetic-circuits) were a nice way to represent a computation. And how they allowed the crafting of recipes for **validation** of statements.

And so, the prover's goal will be to try and convince a verifier that they know some **secret value** $x$ — really, a **vector** of values — such that:

$$
\exists \ x \in {\mathbb{F}_p}^m \ / \ C(x,w) = 0
$$

The prover doesn't want to reveal $x$, but also, we don't want the verifier to run the expensive computation of the circuit. And so, what will really happen is that the prover will **evaluate** the circuit, and then somehow **encode** both the inputs, and the results for each of the gates — also called the **computation trace**.

Here's an example evaluation, using the field $\mathbb{F}_{113}$:

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/circuit-example.webp" 
    alt="A small circuit example"
    title="[zoom] Remember that we're working with modulo p = 113 in this case"
    className="bg-white"
  />
</figure>

And we could think of this evaluation as the following trace, visualized as a table:

```
+-----------+------+------+------+
|           |  w1  |  x1  |  x2  |
+-----------+--------------------+
| inputs    |  20  |  13  |  5   |
+-----------+--------------------+

+-----------+--------------+---------------+----------+
|           |  left input  |  right input  |  output  |
+-----------+--------------+---------------+----------+
| gate 0    |  5           |  20           |  100     |
+-----------+--------------+---------------+----------+
| gate 1    |  13          |  100          |  0       |
+-----------+--------------+---------------+----------+
```

The fantastic idea behind modern SNARKs, including **Plonk**, is to encode this trace as **polynomials**, which will ultimately allow a verifier to check that the computation is valid. Valid here means that a specific set of **constraints** are followed. Namely:

- That each gate is **correctly evaluated**
- That **wires** with the same origin have the **same value**

By wire, I mean the **connections between gates**, or connections from inputs to gates, in the circuit. We can think of these wires as holding the values of the circuit, instead of the nodes themselves:

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/wires.webp" 
    alt="A circuit showing wire values"
    title="[zoom]"
    className="bg-white"
  />
</figure>

Here, you can see that some of these wires should hold the same value: $W_0$, $W_1$, and $W_2$ — and also $W_4$ and $W_5$. Additionally, **gates** should make sense — meaning that, for instance, $W_0 + W_1$ should equal $W_4$.

> A circuit can be either a recipe for computation, or a set of constraints to check!

Each of this sets of constraints — wire values, gate constraints, and wiring constraints — , will be encoded in **different polynomials**.

For example, the entire computation trace can be encoded into a single polynomial $P$, where $P(x_i)$ corresponds to one wire.

$$
P(x_i) = W_i
$$

We have the wire values $W_i$, but we need to choose to which values $x_i$ we encode them. Using some integers is a perfectly valid option — you know, the set $\{0,1,2,3…,N\}$. But there’s a lot to gain from using the **roots of unity** of our field $\mathbb{F}_p$ instead.

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/toast-huh.webp" 
    alt="A toast, confused"
    title="Huh?"
    width="300"
  />
</figure>

### Roots of Unity

I mentioned [this concept before](/en/blog/cryptography-101/polynomials/#interpolation-revisited), but dodged having to explain any further like Neo in Matrix.

<video-embed src="https://www.youtube.com/watch?v=ODmhPsgqGgQ&t=20s" />

I think now is good time to zoom in a bit, so that we can better understand the notation coming ahead.

So, yeah, time for some definitions. We call a value $\omega$ (the greek letter **omega**) a $k-th$ **root of unity** of the field $\mathbb{F}_p$ if:

$$
\omega^k = 1
$$

In this case, the set $H$:

$$
H = \{1, \omega, \omega^2, \omega^3, ..., \omega^{k-1}\} \subseteq \mathbb{F}_p
$$

doubles up as a **cyclic multiplicative** [group](/en/blog/cryptography-101/where-to-start/#groups), generated by $\omega$:

$$
H = \langle \omega \rangle
$$

There are two nice things about using elements of this set as the inputs to our **encoding polynomial** $P(X)$. First, moving from one root of unity to the next, is as simple as** multiplying by** $\omega$. Likewise, moving backwards is done by multiplying by the _inverse_ of $\omega$. And it wraps **all the way around** - by definition:

$$
\omega^{k-1}\omega = 1
$$

$$
\omega^{-1} = \omega^{k-1}
$$

Secondly — and this is the most important part — , using this set allows us to perform **interpolation** using the **most efficient algorithm** we know: the [Fast Fourier Transform](https://en.wikipedia.org/wiki/Fast_Fourier_transform). We won’t dive into how it works (at least not now!), but know that this improves interpolation time dramatically — meaning that proofs are faster to generate (than other methods for interpolation).

---

## Encoding the Circuit

Having said all this, it’s time to get down to business. Time to actually see how the computation trace is **encoded**.

Let’s denote the **number inputs** to our circuit by $|I|$, and the **number of gates** by $|C|$. With this, we define:

$$
d = 3|C| + |I|
$$

> Each gate has three associated values: two inputs, and one output. And this is why we use $3|C|$. Notice that this magic number $d$ happens to be **exactly** the number of values in the computation trace!

We’ll encode all these values into the $d-th$ roots of unity:

$$
H = \{1, \omega, \omega^2, \omega^3, ..., \omega^{d-1}\}
$$

But which root encodes to which wire? We need a plan!

- The $|I|$ inputs will be encoded using **negative powers** of $\omega$. For the input $\#j$, we use:

$$
P(\omega^{-j})
$$

- The **three wires** associated to each gate $k$, ordered as **left input**, **right input**, and **output**, will be encoded by the following values:

$$
P(\omega^{3k}), P(\omega^{3k + 1}), P(\omega^{3k + 2})
$$

If we look at our sample trace, we’d get something like this:

$$
P(\omega^{-1}) = 20, P(\omega^{-2}) = 13, P(\omega^{-3}) = 5
$$

$$
P(\omega^0) = 5, P(\omega^1) = 20, P(\omega^2) = 100
$$

$$
P(\omega^3) = 13, P(\omega^4) = 100, P(\omega^5) = 0
$$

With this, all the values in our computation trace are included in the polynomial. We just have to **interpolate**, and obtain $P(X)$, which will have degree $d - 1$.

### Gate Encoding

Gates present a complication: they can be either **addition** or **multiplication** gates. This means that proving that a gate is correctly evaluated, requires us to convey information about its **type**.

We do this via a **selector polynomial** $S(X)$. For gate $k$:

$$
S(\omega^{3k}) = 0 \ \textrm{or} \ S(\omega^{3k}) = 1
$$

When the gate $k$ is an **addition gate**, then $S(X)$ will take the value $1$, and if it is a **multiplication gate**, then it will take the value $0$. To make this simple to write, let’s just define:

$$
\alpha = \omega^{3k}
$$

And then construct the following expression:

$$
S(\alpha)[P(\alpha) + P(\omega \alpha)] + (1 - S(\alpha))P(\alpha)P(\omega \alpha) = P(\omega^2 \alpha)
$$

Don’t let the expression scare you — what’s happening is actually fairly straightforward. You see, either $S(\alpha) = 0$ or $1 - S(\alpha) = 0$. Because of this, **only one of the terms** containing $S(X)$ will be active for some gate $k$, and in consequence, this expression ties **inputs** ($P(\alpha)$ and $P(\omega \alpha)$) and **outputs** (encoded in $P(\omega^2 \alpha)$) of a gate, along with the **gate type**.

### Wiring Encoding

This one is the trickiest of the lot. As mentioned before, it may happen that some wires correspond to the **same value**, since they come from the **same source**, like this:

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/shared-sources.webp" 
    alt="Shared gate sources"
    title="[zoom]"
    className="bg-white"
  />
</figure>

What this means is that some of the values encoded into $P(X)$ need to **match**:

$$
P(\omega^a) = P(\omega^b) = P(\omega^c) = ...
$$

If we analyze the **entire circuit**, we’ll end up having a set of this kind of constraints:
