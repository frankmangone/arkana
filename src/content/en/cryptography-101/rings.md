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

> In the case of integers, commutativity holds, so this will indeed be a two-sided ideal.

The way to check if this is true, is by evaluating the **conditions** in the ideal definition. These are:

- Adding elements in $(q)$ will result in elements in $(q)$, so the set is **closed** under addition.

$$
a + b = m \cdot q + n \cdot q = (m + n) \cdot q
$$

- Multiplying any element in $(q)$ by some integer will result in another element in $(q)$:

$$
n.a \in (q), \forall n \in \mathbb{Z}, a \in (q)
$$

And so, $(q)$ is indeed a two-sided ideal of $\mathbb{Z}$. Not so scary after all, eh?

---

There are some other definitions to explore — for example, what the [characteristic](<https://en.wikipedia.org/wiki/Characteristic_(algebra)>) of a ring is, or what [kernels are in ring homomorphisms](<https://en.wikipedia.org/wiki/Ring_homomorphism#:~:text=The%20kernel%20of%20f%2C%20defined%20as%20ker(f)%20%3D%20%7Ba%20in%20R%20%7C%20f(a)%20%3D%200S%7D%2C%20is%20a%20two%2Dsided%20ideal%20in%20R.%20Every%20two%2Dsided%20ideal%20in%20a%20ring%20R%20is%20the%20kernel%20of%20some%20ring%20homomorphism.>). But I think it’s more fruitful to focus on the things that we’ll need to better understand cryptographic methods. I’ll leave those definitions for you to check. Let’s get to the good stuff.

---

## Quotient Rings

We’re about to get into some murky waters, but this is the real **spice** we’re looking for in order to understand PQC methods.

**Quotient rings**, also called **factor rings**, **difference rings**, or **residue class rings**, are a type of ring derived using **ideals**. And that’s part of the reason why ideals are important.

Given a ring $R$ and a two-sided ideal $I$, the **quotient ring** $R / I$ is the ring whose elements are the **cosets** of $I$ in $R$.

**Huh?**

<figure>
  <img
    src="/images/cryptography-101/rings/mr-krabs-dizzy.webp" 
    alt="Mr. Krabs from Spongebob looking dizzy"
    title="What the fu-"
  />
</figure>

And that’s english for…? Yeah, some translation is due. Let’s try to make some sense out of that.

To do so, we must first understand what an **equivalence class** is.

### Equivalence Relations and Classes

Continuing with well-known examples, let’s focus on the **integers modulo** $q$. In this case, let’s treat them as a **ring**, so something like:

$$
\mathbb{Z}/q\mathbb{Z} = \{0,1,2,3,...,q-1\}
$$

> I promise this notation will make more sense in a minute!

During our introduction to groups, we saw how the [modulo operation](/en/blog/cryptography-101/where-to-start/#the-modulo-operation) was used to map any integer outside of this set, into the set. So when we have something like this:

$$
a \ \textrm{mod} \ q = b
$$

We can naturally think of $a$ and $b$ as being **equivalent**. Equivalence can be given by any type of relation, not just the one defined by the modulo operation. Any such type of relation can be written as $a \sim b$, which reads "$a$ is **equivalent** to $b$".

> An [equivalence relation](https://en.wikipedia.org/wiki/Equivalence_relation#:~:text=%22.-,Definition,-%5Bedit%5D) has a more formal definition that involves cartesian products of sets, and some weirdly-named properties (reflexivity, symmetry, and transitivity). But we don’t care too much about that — just the rough concept is fine.

In the case of the integers modulo $q$, any number of the form $a = k.q + b$ will be equivalent to $b$ — and there are infinitely many such integers!

We can group all those equivalent integers into a **set**. Such a set is called an [equivalence class](https://en.wikipedia.org/wiki/Equivalence_class). And in reality, each of the elements in our **ring of integers modulo** $q$ represents much more than a single value — it’s a representative for **the entire equivalence class**. When we mentioned **cosets** in our definition of quotient rings, we were referring to these **equivalence classes**.

> If you think about it, the integers modulo q allow us to reduce a “bigger” ring — the ring of integers, into a smaller one, by providing a way to map each integer into its equivalent value. That’s the important bit!

### Calculating the Quotient

With equivalence classes at hand, it’s easier to understand **quotient rings**. Following our example, let’s take the ring $\mathbb{Z}$ and the two-sided ideal $(q)$.

Here’s the plan: first, define an [equivalence relation](https://en.wikipedia.org/wiki/Equivalence_relation) as:

$$
a \sim b \iff a - b \in (q)
$$

In simple terms: two elements are equivalent if their difference is a multiple of $q$. Since we have an **equivalence relation**, we also have an equivalence class — the set of all elements equivalent to $a$ is:

$$
[a] = a + (q) = \{a+x \ / \ x \in (q) \}
$$

How many such classes are there? Well, let’s start counting from $0$! The equivalence class would be:

$$
[0] = \{0, q, -q, 2q, -2q, ... \}
$$

We can do the same for $1$:

$$
[1] = \{1, 1 + q, 1 - q, 1 + 2q, 1 - 2q, ... \}
$$

And in fact, we can do this with all integers up to $q - 1$. And when we reach $q$, something interesting happens:

$$
[q] = \{0, q, -q, 2q, -2q, ... \} = [0]
$$

Aha! We’ve stumbled upon a class that already existed! And so, the quotient ring $\mathbb{Z}/(q)$ is just:

$$
\mathbb{Z}/(q) = \{[0], [1], [2], ..., [q - 1]\}
$$

Taking a **single representative** of each equivalence class gives us:

$$
\mathbb{Z}/(q) = \{0, 1, 2, ..., q - 1\}
$$

> Wait... We’ve seen that one before! It’s the **ring of integers modulo** $q$! Would you look at that. All that mess just to get to this. I swear, sometimes math is so convoluted...

In a way, it’s as if we took the integers and performed **modulo** over the integers modulo $q$. That’s the reason why we use the notation $\mathbb{Z}/q\mathbb{Z}$.

### Revisiting the Definition

A final formalization of our example is necessary to close things off here. The quotient of $R$ and a two-sided ideal $I$ can be found via the following process:

- Defining the equivalence relation:

$$
a \sim b \iff a - b \in I
$$

- Finding all the equivalence classes of the form:

$$
[a] = a + (q) = \{a+x \ / \ x \in (q) \}
$$

The quotient ring $R/I$ will simply be the set of all such classes. Hopefully, the original definition makes more sense now:

::: big-quote
Given a ring R and a two-sided ideal I, the quotient ring R / I is the ring whose elements are the cosets of I in R
:::

---

## Quotient Polynomial Rings

Previously, I mentioned how **quotient rings** were important for PQC. When I said that, what I didn’t mention is that our interest lies **particularly** in **polynomial quotient rings**.

At this point, it’s easier to imagine why they are important — they provide a way to **map** polynomials (which form a ring) into a **smaller ring**, just like a modulo operation would.

> And hey, that ability was super important in order to develop most methods we’ve presented so far in the series! So, yeah, it’s probably pretty important!

Let’s work our way through this slowly.

<figure>
  <img
    src="/images/cryptography-101/rings/kermit-tea.webp" 
    alt="Kermit having a tea"
    title="Here, have a tea"
  />
</figure>

We’ll start from a ring of polynomials with coefficients on a **finite field**. This, we’ll denote $\mathbb{F}[X]$. Such a field can be, for example, the **integers modulo** $q$ — and coefficients can be reduced using the modulo operation. So far, so good!

Next, we’ll need a **two-sided ideal** of $\mathbb{F}[X]$. As it turns out, we can craft an ideal by selecting some polynomial $f(X)$ in $\mathbb{F}[X]$, and setting the ideal to be the set of **all multiples of it**.

$$
(f(X)) = \{g(X).f(X) \ / \ g(X) \in \mathbb{F}[X]}
$$

> Any polynomial in this ring is clearly divisible by $f(X)$. So it’s pretty simple to check that it’s an ideal indeed!

Again, we define an equivalence class — two polynomials are **equivalent** if their difference is a multiple of $f(X)$:

$$
g(X) \sim h(X) \iff g(X) - h(X) \in (f(X))
$$

And finally, we find all the different equivalence classes under this relation. This one may be harder to imagine, but the concept is that any **possible remainder** of the division of a polynomial by $f(X)$ will be in the **quotient ring**, denoted by $\mathbb{F}[X]/(f(X))$.

Remainders may not have a degree higher than $f(X)$. In consequence, we have both **bounded coefficients** (because we’re working with a **finite field**), and **bounded degree**, because we’re working with a quotient polynomial.

In summary: we’ve found a way to map just about **any** integer-valued polynomial into a **finite set of polynomials**! Awesome!

As we’ll see, this will be extremely useful for PQC methods.

### A Practical Example

To cement this idea, let’s look at a simple example. Say we choose the **modulus polynomial** to be $f(X) = X^2 + 1$, and set our finite field to $\mathbb{F}_7$.

The polynomial $f(X)$ will be used to reduce higher-degree polynomials into a **bounded degree**. So, for instance, let’s choose $P(X) = X^5 - 3X^2 + 6$.

Dividing $P(X)$ by $f(X)$ yields a **quotient** and a **remainder**:

$$
Q(X) = X^3 - X - 3
$$

$$
R(X) = X + 9
$$

We need to focus on the remainder (just like the modulo operation!). Of course, since we’re working with a finite field, we need to reduce $R(X)$ modulo $7$. This yields:

$$
R(X) = X + 2
$$

With that, we’ve reduced the original $P(X)$ modulo $f(X)$! And it holds that $P(X)$ is equivalent to $R(X)$:

$$
P(X) \sim R(X)
$$

Any polynomial whose remainder when divided by $f(X)$ is $R(X)$, will be equivalent to $R(X)$! Thus, its represented in the quotient ring $mathbb{F}_7[X]/(X^2 + 1)$ by the element $R(X)$.

---

## Summary

Dang, that was longer than I imagined.

As you can probably tell, **rings** require a higher degree of **abstraction** to fully understand when compared to **groups**. This is the reason they were not introduced before in the series — we’re slowly building up in terms of complexity.

> Well... “Slowly”. Nothing’s slow at this point anymore!

The main takeaway from this article, apart from some new abstract concepts, is the idea of **quotient polynomial rings**. As mentioned before, they were the missing foundation we needed to move onto some **PQC** methods (other than lattices, but we’ll cover those in the next installment).

All that remains it’s time to **go post-quantum**. But to propose any PQC methods, we need more than just a mathematical structure — we need a **hard problem to crack**. Rings also have some of those, as we’ll see [next time](/en/blog/cryptography-101/post-quantum-cryptography)!
