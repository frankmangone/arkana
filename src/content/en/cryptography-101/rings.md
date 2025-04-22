---
title: "Cryptography 101: Rings"
date: "2024-08-27"
author: "frank-mangone"
thumbnail: "/images/cryptography-101/rings/saurons-eye.webp"
tags: ["Cryptography", "Abstract Algebra", "Mathematics", "Ring"]
description: "Before moving onto the latest frontier of cryptography — post-quantum cryptography — , we need to lay down some more groundwork!"
readingTime: "13 min"
---

> This is part of a larger series of articles about cryptography. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/cryptography-101/where-to-start).

This series has been a pretty long journey already — and we’re approaching the end of it. We started a couple months ago talking about [groups](/en/blog/cryptography-101/where-to-start), and we quickly expanded our base knowledge by exploring the concepts of [hashing functions](/en/blog/cryptography-101/hashing), [polynomials](/en/blog/cryptography-101/polynomials), [pairings](/en/blog/cryptography-101/pairings), and [finite fields](/en/blog/cryptography-101/arithmetic-circuits/#changing-perspectives).

> I think I actually never really explained finite fields in depth. You’ll have to excuse me the oversight!

Those are the mathematical foundations upon which we’ve based every single method and technique so far in the series.

Yet, there’s one structure we’ve avoided talking about. It just didn’t feel right to talk about it before this point, because it’s the most complicated of the bunch. But we’ve covered some seriously complex topics by now — so yeah, we’re ready now. I trust the time is right.

Let’s talk about rings.

<figure>
  <img
    src="/images/cryptography-101/rings/saurons-eye.webp" 
    alt="Eye of Sauron"
    title="Chill, dude."
  />
</figure>

### Why Rings?

Rings are the underlying structure for most **Post-Quantum Cryptography** (**PQC**) methods out there. Our goal is to first define what rings are, and understand some basic concepts around them, so that later we can more naturally understand the PQC methods we explore.

> These are nothing like the rings we refer to in [ring signatures](/en/blog/cryptography-101/signatures-recharged/#ring-signatures). In that case, the name was just a metaphor to try and represent the circular nature of the construction.
>
> We’re now gonna enter into the realm of **abstract algebra** — this is the real deal.

Buckle up, and let’s go!

---

## Rings

A [ring](<https://en.wikipedia.org/wiki/Ring_(mathematics)>) is an abstract algebraic structure, much like a [group](/en/blog/cryptography-101/where-to-start) is. As you may recall, a group was defined by a **set** and an **operation**. We saw how such a simple construction had many uses, especially because of some particular properties, such as the existence of **generators** and **subgroups**.

Similarly, **rings** are simple to define. But a simple definition may hide complexities down the road. And indeed, there are a couple more things we need to consider.

So without further ado, here’s the definition: a **ring** is a triplet $(R, +, \cdot)$ — so there are **three** elements to consider now instead of two — , where $R$ is a non-empty set, associated with **two binary operations** on $R$.

These operations need to suffice a couple conditions.

### Addition

First and foremost, $R$ must behave like an **abelian group** under the operation $+$ (we usually call it **addition**). This means that:

- **Associativity** must hold, so $(a + b) + c = a + (b + c)$,
- **Commutativity** must hold, so $a + b = b + a$,
- An **identity element** $e$ must exist, so that $a + e = a$,
- An **additive inverse** must exist, meaning that $a + (-a) = e$.

If we imagine, just for a moment, that the second operation ($\cdot$) doesn’t exist, then all we’re left with is a **group** — a structure we’re pretty familiar with. The most interesting part comes next.

### Multiplication

The second operation is usually referred to as **multiplication**. And the set $R$ must be a **monoid** under this operation.

<figure>
  <img
    src="/images/cryptography-101/rings/what.webp" 
    alt="Meme of an 80s girl with a very forced smile"
    title="A what?"
  />
</figure>

A monoid. Yeah. Behaving like a monoid under multiplication means that:

- **Associativity** holds, meaning that $(a \cdot b) \cdot c = a \cdot (b \cdot c)$,
- An **identity element** $e’$ must exist, so $a \cdot e’ = e’ \cdot a = a$.

> Fancy word, quite simple meaning.

---

Now that we have two operations, we also need to consider how they **stack up** — and so, one extra condition pops up: multiplication must be **distributive** with respect to addition. This simply means that:

- $a \cdot (b + c) = (a \cdot b) + (a \cdot c)$
- $(b + c) \cdot a = (b \cdot a) + (c \cdot a)$

> Notice how the order is preserved. Multiplication **may not be commutative**!

Finally, there’s the implicit **closure** requirement, meaning that the result of any combination of binary operations must lie in the set $R$.

---

## Examples of Rings

With all these definitions, you’d think that rings may not be that common to come across. As it turns out, it’s **completely the opposite** — they are **everywhere**!

For example, the **integers modulo** $q$ behave like a ring. Of course, we know they also behave like a **field** when $q$ is prime. But in the more general setting, they always behave like a ring.

Quite in fact, the **integers** (not modulo $q$!) behave like a ring as well. And the **rational numbers**. And the **real numbers**. And the **complex numbers**. And [quaternions](https://en.wikipedia.org/wiki/Quaternion). Wait... Is **everything** a ring?

> For instance, the **irrational numbers** are not. Not everything is a ring!

We can think of even richer examples.

**Square matrices** with entries on a **field** form a ring as well. In fact, this is one of the examples where **commutativity doesn’t hold**. And still, they form a ring — a **non-commutative ring**, that is.

### The Important One

Why do we care about rings, you ask? Well, there’s a very important one that we need to know about, as it will be the basis for some **PQC** methods. You’ve heard about them quite a lot in this series. They should be old friends by now.

Can you guess what they are?

<figure>
  <img
    src="/images/cryptography-101/rings/come-on-homer.webp" 
    alt="Everyone waiting for Homer to talk in Moe's tabern"
    width="300"
  />
</figure>

That’s right — **Polynomials**!

> Man, they are everywhere. It’s always freaking polynomials.

We’ll see them in action further ahead. Our journey requires us to put them aside for now, so that we can discuss a couple more things about rings in general.

---

## Definitions

When we saw groups, we saw how there could be **subgroups**. And we also saw how there were [group homomorphisms](/en/blog/cryptography-101/homomorphisms-and-isomorphisms). Of course, rings also have these types of structures and properties: we can define **subrings**, and **ring homomorphisms**. But there are a couple extra definitions that are unique to this structure. We’ll need to understand one in particular: **ideals**.

### Ideals

There aren’t any parallels that we can make with groups here, so this will be a brand new concept!

Given a ring $R$, we can define both **left** and **right ideals**. The reason why we say **left** and **right** has to do with commutativity, as we’ll see in just a moment.

A **left ideal** of $R$ is a non-empty subset $I$ of $R$, so that for every elements $x$, $y$ in $I$, and for every element $r$ in $R$, the elements $x + y$ and $r \cdot x$ are in $I$. Yeah.

Math notation may help:

$$
I \subset R \ / \ \forall x, y \in I, \forall r \in R \Rightarrow \{x + y, r \cdot x \} \subset I
$$

<figure>
  <img
    src="/images/cryptography-101/rings/spongebob-huh.webp" 
    alt="Spongebob with a confused look"
    width="300"
  />
</figure>

I guess the question is **why**. Why the heck would we care about defining these “ideal” thingies, and what sort of twisted applications may they have?

Think of it this way: $I$ is some subset of $R$ that sort of operates on $R$, and **reduces** it to the ideal — so it acts like a **modulo operation**, in a certain way.

> Just don’t worry too much about this, we’ll have a better idea of how it can be useful pretty soon!

For the sake of completeness, we’ll also define a **right ideal**, which is pretty similar — only that $x \cdot r$ needs to be in the ideal instead of $r \cdot x$ — hence the name!

### An Example

Let’s analyze the ring of integers $\mathbb{Z}$. We claim that the set of all multiples of $q$ is a **two-sided ideal** (meaning that it’s both a left and a right ideal) of $\mathbb{Z}$. Let’s denote it by $(q)$.

$$
(q) = \{n \cdot q \ / \ n \in \mathbb{Z} \}
$$
