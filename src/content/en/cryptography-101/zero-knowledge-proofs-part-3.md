---
title: "Cryptography 101: Zero Knowledge Proofs (Part 3)"
date: "2024-07-30"
author: "frank-mangone"
thumbnail: "/images/cryptography-101/zero-knowledge-proofs-part-3/thinking.webp"
tags:
  ["cryptography", "zeroKnowledgeProofs", "mathematics", "arithmeticCircuits"]
description: "Let’s get practical, and build some arithmetic circuits!"
readingTime: "10 min"
---

> This is part of a larger series of articles about cryptography. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/cryptography-101/where-to-start).

With the theory behind us, it’s time to get more practical!

In today’s article, I’d like to focus on some simple examples of statements we can prove using a **zkSNARK** such as **Plonk**. So, we’ll essentially be **building some arithmetic circuits**.

And I see no better start to this, than to reversion **range proofs**! Let’s jump straight into the action.

---

## Range Proofs Revisited

During our not-so-brief look at [Bulletproofs](/en/blog/cryptography-101/zero-knowledge-proofs-part-1), we saw how hard it was to construct a range proof from scratch. But now, we have some new toys at our disposal. And as promised, we’ll see how we can build an arithmetic circuit to represent the statement:

::: big-quote
There’s a valid N-bit representation for a number $v$
:::

Building such a circuit allows us to prove knowledge of said number $v$ using **Plonk**! So let’s try to put this into equations, again.

> Really, this is the same system we [described before](/en/blog/cryptography-101/zero-knowledge-proofs-part-1/#switching-perspectives). Thus, the upcoming description will be somewhat condensed — I recommend the previous explanation for more attention to detail!

If our number $v$ can be represented with $N$ bits, this means that there’s some valid binary representation for it:

$$
(b_0, b_1, b_2, b_3, ..., b_{N-1})
$$

And in turn, these numbers should suffice this equation:

$$
v = 2^0b_0 + 2^1b_1 + 2^2b_2 + ... + 2^{N-1}b_{N-1} = \sum_{i=0}^{N-1} 2^ib_i
$$

We also know that all our inputs will be in a **finite field** of size $q$:

$$
x_i, w_j \in \mathbb{F}_q
$$

Both $v$ and the $b_i$ will be inputs to our circuit — thus, we need some way to prove that the $b_i$ values are **bits** (either $0$ or $1$). And we can do this with the following check:

$$
b_i(1 - b_i) = 0
$$

For each of the N bits.

### Subtraction

Great! We’ve got the system... But how do we turn this into an arithmetic circuit? In particular, we need to be able to represent **subtraction**, but we can only use **addition** and **multiplication** gates. What to do then?

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-3/thinking.webp" 
    alt="Thinking meme"
    title="Hmmm..."
    width="475"
  />
</figure>

Well, when working with **finite fields**, there’s the concept of **additive inverses**! Think of **subtracting** $1$, as being the same as **adding** $-1$. But, of course, $-1$ is not an element in our field:

$$
\mathbb{F}_q = \{0,1,2,3,..., q-1\}
$$

How does this help, then? You see, just as we said that addition **wrapped around** to the **beginning of the set** when the result was bigger than $q - 1$, it’s also true that subtraction wraps around to the end of the set when the result is less than $0$.

Really, what happens is that we can map $-1$ into the set by using the [modulo operation](/en/blog/cryptography-101/where-to-start/#the-modulo-operation):

$$
(-1) \ \textrm{mod} \ q = q - 1
$$

> You may also see this expressed as $-1 \equiv q - 1 (\textrm{mod} \ q)$. This is called a **congruence relation**, and it reads “$-1$ is congruent with $q - 1$ modulo $q$”.
>
> There’s a lot to say about [congruence relations](https://en.wikipedia.org/wiki/Congruence_relation), which also define congruence classes — but we’ll avoid getting into those topics today. You can read about it [here](/en/blog/cryptography-101/rings/#equivalence-relations-and-classes) if you’re interested.

In conclusion, **adding** $q - 1$ has the **exact same effect** as subtracting $1$!

> This works for any **additive group**.

### Putting It Together

Now that we know how to subtract, we can craft our circuit!

To start with, we must check that $b_i$ is a bit. This can be done in this fashion:

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-3/bit-checker.webp" 
    alt="A small circuit to represent the bit checking described before"
    title="[zoom] This represents bᵢ(bᵢ — 1). The output should be 0 if bᵢ is a bit (either 0 or 1)"
    className="bg-white"
  />
</figure>

> Of course, if we sum all of the outputs of these checks, the resulting value should also be $0$.

Then, we need to represent the sum of every bit multiplied by the corresponding power of $2$. Once we obtain the result, subtracting $v$ should also yield $0$. And as you might guess, subtracting $v$ is the same as adding $-v$, which of course, is the result of multiplying $-1$ and $v$.

To keep things manageable, let’s say that $N = 4$. For this amount of bits, our circuit would look like:

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-3/4-bit-checker.webp" 
    alt="The circuit to validate the binary representation of a 4-bit number"
    title="[zoom] Pardon the mess, drawing circuits is not my forte"
  />
</figure>

And there you go! This circuit should output $0$ if a number $v$ and its binary representation $b_0$, $b_1$, $b_2$, and $b_3$ are fed into it. Of course, we don’t want to reveal neither of those — so they will be the **private statement**. All the other inputs can be though as part of the **witness** — just a bunch of values that allow for an **efficient evaluation** of the circuit.

If we refer back to our nomenclature from the previous article, then the **secret information** and the **witness** would be:

$$
x = (v, b_0, b_1, b_2, b_3) \in {\mathbb{F}_q}^5
$$

$$
w = (q - 1, 2, 4, 8) \in {\mathbb{F}_q}^4
$$

From here, all we do is apply Plonk as presented in the previous article, and then we have a **zkSNARK** to prove that $v$ lies in the range $0$ to $15$. Sweet!

---

## Set Membership

The previous example introduced a couple interesting ideas, such as **how to subtract with gates**. And implicitly, we also used some **magic numbers** as inputs, to avoid excessive computation.

Nevertheless, these are not the only tricks we can use when building circuits — as we’ll see in just a moment. Let’s move on to our next example to see what’s in store for us.

Imagine we have a set of values $S$:

$$
S = \{s_0, s_1, s_2, ..., s_n\}
$$

What we’ll try to do is prove knowledge of a value $s_i$ that **belongs to said set**. We’ll require some mathematical statement that represents this fact. This one is easy enough — here, I’ll just write the equation for you:

$$
P(x) = (x - s_0)(x - s_1)...(x - s_n) = \prod_{i=0}^n (x - s_i)
$$

If $s_i$ is indeed part of the set, then one of the terms will be **zero**, causing the entire product to **yield** $0$. Otherwise, the value of $P(x)$ will be some positive non-zero value.

> This is, the $s_i$ are the **roots** of $P(x)$.

Building a circuit for this polynomial is not hard. It would probably involve providing the values $s_i$ as the witness, for faster computation, and for the protocol to make any sense at all. Like, what good is it to prove knowledge of a value in a set, if the verifier doesn’t know what set they’re talking about?

However, there seems to be a problem here: if $S$ is public, then **everybody can read it**. So in theory, anyone could prove knowledge of some $s_i$ in the set. Building a **zero knowledge proof** in that setting doesn’t really make much sense...

### Hiding the Set

Fixing this is not hard: to make the set **secret**, we can **hash** every element, and make the hashed values public instead. The set now looks like this:

$$
S' = \{H(s_0), H(s_1), H(s_2), ..., H(s_n)\} =  \{s'_0, s'_1, s'_2, ..., s'_n\}
$$

Now we're talking

With this adjustment, then knowing the set $S’$ **reveals nothing** about the actual values in $S$, which remain secret. Our equation also needs a slight modification:

$$
P(x) = (H(x) - s'_0)(H(x) - s'_1)...(H(x) - s'_n) = \prod_{i=0}^n (H(x) - s'_i)
$$

> Of course, the hashing function $H$ must hash into our finite field, so we can use these values in our circuit.

Wonderful. Marvelous. Until... We notice that we need to **include the hashing function in our circuit**.

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-3/gru.webp" 
    alt="Gru from Despicable Me looking down, worried"
    title="Uh-oh..."
  />
</figure>

Okay, breathe. It’s not that bad. Of course, if we had to implement a circuit for a hashing function ourselves, it would be a real pain in the backside.

Luckily, some folks have already thought about this, and provide hashing functions as packages in some popular [Domain-Specific Languages](https://en.wikipedia.org/wiki/Domain-specific_language) (DSLs) to build circuits, such as [Circom](https://docs.circom.io/) and [Noir](https://aztec.network/noir).

> For example, there’s [Poseidon](https://github.com/iden3/circomlib/blob/master/circuits/poseidon.circom). You can find its implementation [here](https://github.com/iden3/circomlib/blob/master/circuits/poseidon.circom).

Let’s just think of the hashing function as a **box**, which we’ll be including in our circuit, much like a **component**. With this in mind, our circuit would look like this:

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-3/set-membership.webp" 
    alt="Circuit to prove set membership as described before"
    title="As long as x is in the secret set, this circuit should output 0"
    className="bg-white"
  />
</figure>

Awesome! All that remains is to run this through **Plonk** — you know, computing the trace, encoding it, all the good stuff we already discussed in the [previous chapter in the series](/en/blog/cryptography-101/zero-knowledge-proofs-part-2).

---

## Zero Check

Having a reusable hashing component to include in our circuits is certainly a nice idea. One may wonder if there are other **actions** or **checks** that we may want to reuse in a similar fashion — thus being a good target for this sort of **black-boxing** process.

> Very similar to the process of creating computer components!

One very simple idea for such a component, is to build something that checks whether some value **is zero or not**. This is, a function that does the following:

$$
f(x) = \left\{\begin{matrix}
1 \ \textrm{if} \ x = 0
\\ 0 \ \textrm{if} \ x \neq 0
\end{matrix}\right.
$$

> I mean, it could be useful... Who knows, right? Checking that some computations yield $0$ in a big circuit might be necessary! Also, there's no direct `if (x == 0)` available to use.

Let’s build such a component. Here’s an idea for it:

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-3/zero-checker.webp" 
    alt="Circuit to evaluate if a value is zero or not"
    title="[zoom]"
    className="bg-white"
  />
</figure>

A closer step-by-step inspection reveals what this circuit is doing: the first **three gates** compute the expression:

$$
1 = x.x^{-1}
$$

If $x$ is $0$, then its **inverse** will also be zero, and the expression will yield $1$. If $x$ is not $0$, then by definition we know that $x.x^{-1} = 1$, and thus, the expression will return $0$.

This is the reason why the **output** of this component is not at the last gate, but at the third one. So why is there a **fourth gate**? What purpose does it serve?

To answer the question, I’ll ask you: **haven’t you noticed anything out of the ordinary in this circuit**? Take a look at it again.

You’ll soon realize that this is the first time we use a **modular inverse**. It’s an **input** to our circuit — we just **can’t compute** modular inverses with addition and multiplication gates alone. And so, the value of the modular inverse **must be provided**.

> Remember that in Plonk, we just check that the computation trace makes sense — it’s entirely fine that an inverse is provided as an input, as long as we make sure that the value is correct!

The idea is that the fourth gate exists as a means to check that the **claimed modular inverse** is in fact **correct**. Let’s call the claimed modular inverse $y$. In total, there are **four** possible scenarios to analyze, which you can corroborate yourself by following the circuit:

- $x = 0$: No matter what inverse we provide, the output will be $1$. We don’t really care whether if the inverse is okay or not, which is consistent with the **last gate always yielding** $0$.
- $x \neq 0, y = x^{-1} \neq 0$: The inverse is correct, and the output is $0$. The last gate should also yield $0$, meaning that the inverse is correct.
- $x \neq 0, x^{-1} = 0$: The inverse is **incorrect**. The output will be $1$ (which is **wrong**), and also, the last gate will **not yield** $0$. Because the last constraint doesn’t hold, this means that something about the inputs is wrong!
- $x \neq 0, y \neq x^{-1} \neq 0$: The inverse is **incorrect**, and in this case, the output will **not** be $1$, but some **other element** in the finite field. Because of this, the last gate will most certainly **not yield** $0$ — and this means that the provided inverse is not correct.

And there you have it! Our **zero checker** circuit is done.

Having these simple elements that perform **simple tasks** can be hugely helpful as we build bigger and bigger circuits. It allows some degree of **composability** in the process, which can speed the crafting of your circuits dramatically!

---

## Summary

These are just a few examples of the things you can do with arithmetic circuits: since they are such a general computation model, you can build just about any kind of statement.

Granted, creating the circuit itself might be a little challenging if we have to piece together a lot of gates ourselves. This is why **we never really do**.

We use **other types** of representations, which can be **conceptualized** as circuits.

> Circom, which is a popular DSL for building circuits, doesn’t force you to write gates. Instead, it relies on a technique called **arithmetization** to transform a set of constraints into the adequate form for zkSNARKs.

Finally, SNARKs have a lot of benefits (small proof sizes, short verification times), but also there are some aspects that generate some degree of concern (for example, Plonk requires a **trusted setup**). For this reason (and others), this is still a very active research area. Who knows what we might see in the future!

Speaking about **trusted setups** and ideally **avoiding them**, there’s another type of succint proof of knowledge that doesn’t require it — it’s **transparent**. So in the next chapter of our adventure, we’ll explore the world of [STARKs](/en/blog/cryptography-101/starks), the younger sibling of **SNARKs** that brings some interesting properties to the table. Until the [next one](/en/blog/cryptography-101/starks)!
