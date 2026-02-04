---
title: Elliptic Curves In-Depth (Part 3)
date: '2025-01-29'
author: frank-mangone
thumbnail: /images/elliptic-curves-in-depth/part-3/hawk.webp
tags:
  - cryptography
  - groups
  - mathematics
  - ellipticCurves
description: >-
  Time to focus on the most relevant aspect about elliptic curves in
  cryptography: their group structure.
readingTime: 10 min
mediumUrl: >-
  https://medium.com/@francomangone18/elliptic-curve-in-depth-part-3-7ae583674b4d
contentHash: 437f9257c6cdd4616eedb23d6e1eca51df6272642d0f1b01241103358e98400a
supabaseId: a7d039e6-5cb5-440b-b17d-618ccaa258ea
---

If we had to define what an elliptic curve is only with what we’ve covered so far, we’d probably say something like:

::: big-quote
They are third-degree polynomials with a particular expression, defined over finite fields, coupled with a special way to add points
:::

While this is technically accurate, it doesn’t do elliptic curves much justice. Especially since their entire raison d’être is to be applied in cryptographic algorithms — and so far, we have said **nothing** (other than the discrete precision we talked about in the [previous article](/en/blog/elliptic-curves-in-depth/part-2)) that makes elliptic curves appealing as cryptographic primitives.

Clearly, there’s something we’re missing.

To be fair, talking about **elliptic curves** ends up being a little misleading. Because really, the elliptic curves used in cryptography are not even **curves** — they are **groups**.

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-3/hawk.webp" 
    alt="Shocked hawk"
    title="They what??"
    width="600"
  />
</figure>

Yeah, groups. The name “elliptic curves” alone doesn’t tell the full story. It would be much more suitable to call them elliptic curve **groups**, but the shorter version is widely accepted.

Now, groups **are** interesting for cryptography. And we haven’t said much about them yet, so let’s start there!

---

## Groups

In principle, groups are very simple structures. They are defined by just two simple elements: a **set**, and a **binary operation**. A valid binary operation needs to produce a result that also belongs in the set. In other words, it should be a function of the form:

$$
f: \mathbb{G} \times \mathbb{G} \rightarrow \mathbb{G}
$$

> Normally, we don’t make a distinction between the group $\mathbb{G}$ and the underlying set. It’s common to refer to the set as the “group” itself!

We’ll see why groups are important in a minute. But first, let’s look at an important example.

A great deal of our [previous encounter](/en/blog/elliptic-curves-in-depth/part-2) was dedicated to **finite fields**. The set behind said fields was just the **integers modulo** $p$:

$$
\mathbb{Z}_p = \{0,1,2,..,p-1\}
$$

This behaves like a field, because addition, subtraction, multiplication, and division (modular inverses) are well-defined (modulo $p$). But let’s now remove **zero** from this set:

$$
{\mathbb{Z}_p}^* = \{1,2,3,..,p-1\}
$$

And now I ask: **is this still a field**?

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-3/flying-equations.webp" 
    alt="Equations flying meme"
    width="450"
  />
</figure>

The answer is **no**. The reason is that it’s not **closed under addition**: when we add $1$ and $p - 1$, it results in $0$, which does not belong in our set.

However, things do work out when using **multiplication**.

> The only way we could get $0$ when multiplying two numbers $a$ and $b$ in the group is if the result is a multiple of $p$ — that is, if $p$ is in the factorization of $a.b$. But if $p$ is prime, then this is not possible — $p$ cannot simply appear as a combination of factors of $a$ and $b$.
>
> Thus, multiplying elements of the set ${\mathbb{Z}_p}^*$ will never yield $0$ (modulo $p$, and with prime $p$).

In quite an organic fashion, we see that ${\mathbb{Z}_p}^*$ behaves like a group, since it only supports one operation (multiplication). It should be no surprise that we call this a **multiplicative group**.

> One might argue that it supports two operations instead of one, as we can calculate multiplicative inverses. Let’s just not dwell on that for too long.

There’s no reason why groups should be **finite** — in fact, infinite groups do exist. But for reasons similar to the ones exposed in the [previous post](/en/blog/elliptic-curves-in-depth/part-2/#modular-arithmetic), we want to work with finite groups. Often times, this is phrased as working with groups of finite **order** — and you can probably guess that the **order** is the number of elements in the group, or its **size**, or **cardinality**.

### Identity and Generators

Some elements in groups have particular properties that make them special. Such is the case of the **identity** of a group.

Conceptually, the identity element is very simple. It’s an element that has the effect of doing **absolutely nothing** in the binary operation of a group. For example, in our **multiplicative group of integers**, we can easily see that $1$ is the identity, since for any number $a$ in the group:

$$
1.a = a
$$

Every group needs to have an identity element. Some might not be as evident, though.

---

Then, we have **generators**. The idea is again fairly simple: take an element $g$ of the group, and perform the group operation with **itself**.

$$
f(g,g) = g \cdot g = g^2
$$

> For the sake of simplicity, let’s assume that the group is multiplicative, for now. Thus, the result is $g^2$ instead of $2g$.

Take the result, and multiply it by $g$ again, getting $g^3$. Rinse and repeat, until the result is again $g$.

> The multiplicative groups of integers modulo $p$ is **cyclic** — not only is it finite, but you return to the same generator after applying the group operation enough times. Like the numbers on a clock!

If after this iterative process you happen to see **every single element** of the group before re-obtaining $g$, then we say that it **generates** the group, or that it is a **generator** of the group. This is usually denoted:

$$
\langle g \rangle = \mathbb{G}
$$

Not every element in a group is necessarily a generator. More often than not, we’ll find a **subsequence** of elements of $\mathbb{G}$. It just so happens that this subsequence also behaves like a group — in fact, these resulting subsets are called **subgroups**.

### Why Groups?

At this point, you may be wondering what’s so special about groups. Compared to the things we’ve seen so far, they don’t seem particularly fancy.

Appearances can be deceiving, though. Simple as they may look, they are the **backbone** of a great deal of cryptographic algorithms!

> At least until ring and lattice-based cryptography become more widespread!

In the early days of modern cryptography, algorithms like the [Diffie-Hellman Key Exchange](/en/blog/cryptography-101/protocols-galore/#key-exchange) and [Rivest-Shamir-Adleman](/en/blog/cryptography-101/asides-rsa-explained) (RSA) revolutionized the way information was shared and protected. Both were based on a simple operation: **modular exponentiation**. In other words, operations like this:

$$
y = g^x \ \textrm{mod} \ p
$$

And look at that — $y$ is an element in the multiplicative group **generated** by $g$. That is, $g$ is a group generator, which also means it cannot be the group identity.

Algorithms exist for [fast modular exponentiation](https://www.khanacademy.org/computing/computer-science/cryptography/modarithmetic/a/fast-modular-exponentiation). But the inverse process — in our case, finding $x$ — is not nearly as simple, due to the non-linearity introduced by the modulo operation.

The problem of reversing the exponentiation operation is known as the **Discrete Logarithm Problem**, or **DLP**. And although [algorithms exist](https://en.wikipedia.org/wiki/Function_field_sieve) to solve this problem, they are not nearly as efficient as fast exponentiation. As the size of the group gets larger, so does the problem get harder— and for big enough groups, the problem is **infeasible** with standard computing power.

> For the sake of correctness, I must clarify that RSA is not based on the DLP, but on the [integer factorization problem](https://en.wikipedia.org/wiki/Integer_factorization).

So, yeah, groups **are** useful! But how does this relate with elliptic curves?

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-3/homer-thinking.webp" 
    alt="Homer Simpson thinking"
    title="Hmmm..."
    width="500"
  />
</figure>

---

## Elliptic Curve Groups

Well, I kinda spoiled this one at the beginning of the article.

Elliptic curves, coupled with the operation we defined to add (and double) points, form **groups**.

The equivalent of modular exponentiation is point scalar multiplication: we take a an integer $x$, and calculate:

$$
Y = [x]G
$$

Again, $G$ is a generator, different from the **group identity**.

> In elliptic curve groups, the identity is the point at infinity $\mathcal{O}$.

What sets these groups apart from integer multiplicative groups, is the fact that calculating the binary operation is **much more costly**. Multiplying two integers together is simple and fast, while adding elliptic curve points involves several multiplications.

This is important, because it makes solving the DLP **much harder**. And as we previously mentioned, most modern cryptography relies on the hardness of this problem, or similar ones. The harder the problem, the better the security.

> Well, for similar key sizes, at least. You can find an interesting discussion about that [here](/en/blog/cryptography-101/asides-evaluating-security).

### Group Size

This is all good and dandy, as long as we’re dealing with **large groups**. If not, then all our efforts are for naught.

> Any problem that relies on the DLP for its security can be translated into elliptic curve groups — where we have the elliptic curve discrete logarithm problem, or ECDLP.

There are indeed examples of small elliptic curve groups — we saw one in the [previous article](/en/blog/elliptic-curves-in-depth/part-2). Those aren’t useful for cryptographic purposes.

Plus, it isn’t immediately obvious what the size of an elliptic curve just by looking at its affine equation. So you might be wondering: how do we know the size of a given elliptic curve group?

We could first try the naive approach: literally, just **count every single point**.

Consider for instance the curve $y^2 = x^3 + x + 1$ over $\mathbb{F}_7$. To find all the points in the curve, we just check all the combinations $(x, y)$ with coordinates in $\mathbb{F}_7$ — and the combinations that satisfy the equation above will be points on the curve. Alongside $\mathcal{O}$, of course.

> A slightly faster approach would involve making use of the symmetry of the curve, which would cut our search domain by half.

In this small example, we find $9$ points total. Not that bad, right?

But we run into a problem when a curve is defined over $\mathbb{F}_p$, with $p$ being a **large prime**. If $p$ is a 256-bit integer, even a modern supercomputer would take too long to count all the points in a curve. Like, until the heat death of the universe.

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-3/skeleton.webp" 
    alt="Skeleton thinking"
    title="Still waiting."
    width="500"
  />
</figure>

> To give you a rough idea, most elliptic curves used in practice are defined over fields of size around $2^{256}$ (that’s a 77-digit number).

Impractical, to say the least.

Of course, more efficient methods have been developed. One of the most famous algorithms to count elliptic curve points [Schoof’s algorithm](https://en.wikipedia.org/wiki/Schoof%27s_algorithm), which makes use of a few concepts we haven’t yet introduced, like the [Hasse bound](https://en.wikipedia.org/wiki/Hasse%27s_theorem_on_elliptic_curves) and the [Frobenius endomorphism](https://en.wikipedia.org/wiki/Frobenius_endomorphism). We’ll talk about those later.

> Schoof’s algorithm runs in polynomial time, and there are even faster alternatives like the [Schoof-Elkies-Atkin (SEA) algorithm](https://en.wikipedia.org/wiki/Schoof%E2%80%93Elkies%E2%80%93Atkin_algorithm).

---

Another thing to be mindful about when dealing with group size is its **prime factorization**. The size of elliptic curve groups will more often than not be a **composite number** (a.k.a. not prime). This is, the size $\#E(\mathbb{F}_p)$ of the group will be:

$$
\#E(\mathbb{F}_p) = q = p_1.p_2.p_3...
$$

Where the $p_i$ are prime numbers.

Why do we care? Because of a certain chad named **Lagrange**.

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-3/lagrange.webp" 
    alt="Joseph-Louis Lagrange"
    title="Sup"
    width="500"
  />
</figure>

[Lagrange’s theorem](<https://en.wikipedia.org/wiki/Lagrange%27s_theorem_(group_theory)>) in group theory reveals that if $q$ is the order of some group $\mathbb{G}$, then said group will have **cyclic subgroups** of orders $p_i$ — the factors of $q$.

This is problematic because of another theorem: the [Chinese Remainder Theorem](https://en.wikipedia.org/wiki/Chinese_remainder_theorem) (CRT for short). Long story short, solving the DLP can be done by finding subgroups of every order pᵢ, solving the problem on each of these subgroups, and then combining the results.

If we analyze that process, we see that the hardest of those sub-DLPs is the one associated with the largest $p_i$.

All this to say: we’re not just after a **large** elliptic curve group — what we really need is a large group with a **large prime factor**.

Thanks, Lagrange.

### A Deeper Connection

Lastly, I want to take a moment to address a most interesting topic. Counting points on elliptic curves has practical applications in cryptography, as we just saw. But it’s also related to one of the deepest unsolved problems in mathematics: the [Birch and Swinnerton-Dyer (BSD) conjecture](https://en.wikipedia.org/wiki/Birch_and_Swinnerton-Dyer_conjecture).

> This conjecture is one of the 6 [Millennium Problems](https://www.claymath.org/millennium-problems/) that remain unsolved. If you’re feeling especially edgy, try reading the [problem statement](https://www.claymath.org/wp-content/uploads/2022/05/birchswin.pdf) and see if it piques your interest! There’s a million-dollar prize for whoever solves this.

The BSD conjecture is about finding **rational points** on elliptic curves — points whose coordinates are **fractions**, like $(1/2, -3/4)$. Some curves can have an infinite number of rational points, while others have only finitely many. The conjecture is about understanding to which of those two categories an elliptic curve belongs.

> While elliptic curves over the real numbers can form infinite groups, when we define them over finite fields, they automatically become finite groups. This is because our coordinates can only take values from the finite field — and there are only $p$ possible values for each coordinate. This finite is more suitable for cryptographic purposes.

Figuring this out is a complex task. Quite literally — it involves using something called the **L-function** of the curve, which is defined over the complex numbers. Computing this L-function is closely related to point counting, which was our goal just a minute ago.

The BSD conjecture takes a hot minute to understand. If you’re interested, here’s a [lecture from the Clay Institute of Mathematics](https://www.youtube.com/watch?v=2gbQWIzb6Dg) on the matter, and another great video (in Spanish, but it has subtitles) explaining it with great detail, diagrams, and animations:

<video-embed src="https://www.youtube.com/watch?v=9mR_h9ufs4E" />

But that’s a rabbit hole for [another time](/en/blog/elliptic-curves-in-depth/part-6). Back to Earth we go.

---

## Summary

After reading this article, if we’re again asked to define what an elliptic curve is, we can now talk about **elliptic curve groups**, and we now know that those are the structures that are useful in cryptography.

There are lots of applications for elliptic curve groups. I suggest looking at the [Cryptography 101](/en/reading-lists/cryptography-101) series for a long (but incomplete) list of algorithms involving elliptic curves.

But alas, the story doesn’t end here. There’s quite a lot more to be said about elliptic curves. Tips and tricks on how to make computations faster, insights on how to choose “good elliptic” curves, moving onto “higher dimensions” — yeah, lots of fun ahead.

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-3/happy-spongebob.webp" 
    alt="Spongebob facing backwards with a happy face drawn in his back"
    title="Yay"
    width="400"
  />
</figure>

See you on the [next one](/en/blog/elliptic-curves-in-depth/part-4)!
