---
title: Elliptic Curves In-Depth (Part 7)
date: '2025-05-20'
author: frank-mangone
thumbnail: /images/elliptic-curves-in-depth/part-7/sweaty-bear.jpg
tags:
  - cryptography
  - mathematics
  - ellipticCurves
  - pairings
  - torsion
description: >-
  Setting up the bases to later define pairings, this article explores torsion
  groups!
readingTime: 14 min
mediumUrl: >-
  https://medium.com/@francomangone18/elliptic-curves-in-depth-part-7-a62306e99089
contentHash: 48433d216d079612c4bf11397c54b8697fa4ab3744233e7dcbbd990c5633ddeb
supabaseId: 195db18e-c038-4462-8cb6-d5b97b8e60bd
---

It must not have been an easy ride to get here.

We've covered a wide spread of concepts, ranging from simple stuff to some very abstract ideas.

Well, if you've felt things have been complicated so far... Well, grab onto whatever you have at hand. Things are about to go batshit crazy.

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-7/aaa-cat.jpg" 
    alt="A screaming cat"
    width="300"
  />
</figure>

Because today, we'll be talking about **pairings**. And in stark contrast to my [previous article on the topic](/en/blog/cryptography-101/pairings), this time we'll get to the finer and nitty-gritty details.

As a consequence, pairings will be tackled in **three consecutive deliveries**: the first one (this one) will focus on setting up some foundations upon which we'll later define pairings in the second part (next article), and then discuss some other details about computation to wrap things up in the third part.

It's gonna be a long one. Take a deep breath. Grab a cup o' coffee. Ready? Let's get started.

---

## Pairings in a Nutshell

First things first - what is a pairing?

Informally speaking, a **pairing** or **bilinear map** is a function that takes two inputs, each belonging to a group, and spits out an element of another group. More formally, we write:

$$
e: \mathbb{G}_1 \times \mathbb{G}_2 \to \mathbb{G}_3
$$

Now, this is not just any kind of function - for it to be a pairing, it must have a very peculiar property. This property is called **bilinearity**: it means it's **linear** in both inputs.

What do I mean by this? Let's suppose the group operations can be represented by $+$, $\cdot$, and $*$ for $\mathbb{G}_1$, $\mathbb{G}_2$, and $\mathbb{G}_3$ respectively. Bilinearity essentially means that both these equalities hold:

$$
e(x + y, z) = e(x,z) * e(y, z)
$$

$$
e(x, y \cdot z) = e(x,y) * e(x, z)
$$

It doesn't look that crazy, I know. But this feature enables moving things around in clever ways. For instance, it's easy to see that:

$$
e(x^n, y) = e(x,y^n)
$$

> I took the liberty of using exponential notation, because we can always find an isomorphism to multiplicative anyway. But keep in mind the exponent means repeated application of the group operation.

These kinds of little tricks we can do with pairings enable all sorts of cool cryptographic primitives, such as [identity-based encryption](/en/blog/cryptography-101/pairing-applications-and-more) (IBE), and [tools](/en/blog/cryptography-101/commitment-schemes-revisited) that are essential for some modern zero knowledge proofs. Among others, of course.

---

And that's the end of the easy part.

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-7/sweaty-bear.jpg" 
    alt="The sweating bear meme"
    width="500"
  />
</figure>

The problem now is that we need to find **suitable groups**, and also define some **function** that behaves like a bilinear map. Of course, we can infer that those groups have to do with our trusty elliptic curves. But it isn't as simple as just picking two random curves - we'll require much more than that for this to work.

In particular, we need to revisit the group structure of elliptic curves one more time.

---

## Elliptic Curve Subgroups

In the previous article, we explored how the structure of an elliptic curve group could be described by the Mordell-Weil theorem:

$$
E(\mathbb{Q}) \simeq E(\mathbb{Q})_{\textrm{tors}} \oplus \mathbb{Z}^r
$$

Where we could separate between the subgroups of **infinite order** (which are isomorphic to the integers), and subgroups of **finite order**.

Elliptic curve groups over finite fields are, as we know, finite - there are only so many points you can fit on a $p \times p$ grid. Thus, those infinite-order subgroups are not really that important to us - and it makes more sense to focus on the ones with finite order.

By scaling the curve by an appropriate factor, we can ensure that every point in those finite subgroups will not only be rational, but **integer-valued**. That's how we get our elliptic curve groups over finite fields.

These subgroups we're focusing on are quite special, and get their own name: they're called **torsion groups**.

And they are exactly what we need to construct pairings.

### Torsion Groups

Torsion groups are the subgroups where, for some integer $r$, all its elements $P$ have the property of resulting in $\mathcal{O}$ when multiplied by $r$. So basically, $[r]P = \mathcal{O}$ for every point in the subgroup. We write this as $E[r]$ - the **r-torsion** of $E$.

> Also, if $P$ is a generator of $E[r]$, we can see that every other point in the subgroup also belongs to the torsion because $[r]([n]P) = [n]([r]P) = [n]\mathcal{O} = \mathcal{O}$.
>
> For this reason, the group $E[r]$ is also the **kernel** of the map $[r]: P \rightarrow [r]P$, or multiplication by $r$. Remember that kernel is just the generalized idea for **roots**.

Now we go back to finite fields. As previously mentioned, it's clear that the entire elliptic curve group is finite. However, it's worth remembering that it's highly non-trivial to find integer-valued points on an elliptic curve, as we explored in the [previous article](/en/blog/elliptic-curves-in-depth/part-5).

It's also clear that since we have a limited amount of points to work with, we're guaranteed to have some cyclic subgroups. At most, the entire group will be a single cycle of some size $r$.

What follows is quite perplexing. There's a theorem, called the [structure theorem for finite abelian groups](https://medium.com/r/?url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FFinitely_generated_abelian_group) (that's a long name), which states that:

$$
E[r] \approx \mathbb{Z}_r \times \mathbb{Z}_r
$$

Meaning there's some isomorphism between these two groups, which also means they have the same **size** (it's a one-to-one correspondence).

Think about the consequences of this. It's saying that the r-torsion should have a size of $r^2$. If $r$ is larger than $p$ (the size of our finite field), we don't even have that many points available!

Thus, hunting these remaining points forces us to look at field extensions.

---

## Extending the Curve

Working with field extensions is not a new concept for us. We already know how it works: we attach some element(s) to our finite field, causing it to grow much larger. One such example was the **complex extension**: by adding $i$ to the field - so that $i^2 + 1 = 0$ - , suddenly a myriad of new (complex) numbers appear on the extended field, and its size grows to $p^2$.

Likewise, more points are available. Some of these also suffice the elliptic curve equation $E$, so the elliptic curve group **also grows in size**.

The complex numbers are kind of the **obvious choice** here - but they aren't the **only choice** available. In fact, we can achieve extensions with any size $p^k$, where $k$ is an integer called the **degree** of the extension.

> I want to be precise here. Let's work with $\mathbb{F}_{17}$ yet again. Let's say we wanted to extend the field by adding an element $\alpha$, such that $\alpha^3 - 2 = 0$. The problem is that this equation has a solution in that field: $8$! You can check this yourself.
>
> So we need to be careful that the element we choose makes sense. If we try the same extension on $\mathbb{F}_7$ instead, you'll see that $\alpha^3 - 2 = 0$ has no solution in the field, so this is a valid degree-three extension, with a total of $7^3$ elements.

We can create extensions of any degree - and the degree itself is given by the highest power in the polynomial condition we impose on the new element we attach to the field.

### Extensions and Torsion

With this in mind, we can return to this expression here:

$$
E[r] \approx \mathbb{Z}_r \times \mathbb{Z}_r
$$

And we ask ourselves: what's the smallest $k$ we need to find all our missing r-torsion points?

This smallest $k$ has a special name in this context: it's called the **embedding degree**. It's the smallest positive integer such that $r$ divides $p^k - 1$, which is the size of the group in the extended field.

> This is also written as $r | (p^k - 1)$, meaning "$r$ divides $(p^k - 1)$".

At first glance, this requirement may not seem to be enough - after all, it doesn't guarantee that all $r^2$ points of the r-torsion will belong to our field. As it turns out though, this condition is **usually enough**. It has to do with the field containing the **r-th roots of unity**, which are some field elements $z$ such that $z^r \ \textrm{mod}\ p = 1$.

> All we really need is for $r$ to be prime.

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-7/trust.gif" 
    alt="Vin Diesel with legend 'I trust you'"
    width="600"
  />
</figure>

Alright, say we've found a suitable field extension. Now what?

Let's see. We know that the r-torsion has $r^2$ elements. We also know that each subgroup in the r-torsion has $r$ elements. And all of those groups have one element in common: $\mathcal{O}$. So each of them has $r - 1$ **different** elements.

This means that in total, there are $r + 1$ subgroups in the r-torsion. This is because:

$$
(r + 1)(r - 1) = r^2 - 1
$$

And if we also count $\mathcal{O}$, we arrive at the grand total of $r^2$ points!

What originally was a single subgroup on the base field, undergoes some sort of evolution, and transforms into many more groups.

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-7/flower.png" 
    alt="4 torsion subgroups"
    title="[zoom] 3-torsion of the curve E/F₁₁: y² = x³ + 4. 𝒪 is common to all subgroups."
    className="bg-white"
  />
</figure>

These subgroups will be the key to build pairings.

We still have a couple things to say about these groups before we actually see how to construct pairings. Stay strong, folks.

---

## The Trace Map

Part of what makes these torsion subgroups useful is the existence of some **maps** of **functions** between them with very special properties.

> We've already talked about **twists** on curves, as a notable example.

Another such function is what's called the **trace map**, denoted by $\textrm{Tr}$. Its definition is quite involved. Here's how it looks:

$$
\textrm{Tr}(P) = \sum_{\sigma \in Gal(\mathbb{F}_{p^k} / \mathbb{F}_{p})} \sigma (P) = \sum_{i=0}^{k-1} \pi ^i(P) = \sum_{i=0}^{k-1} (x^{p^i}, y^{p^i})
$$

I know. **What the f\*ck is that**.

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-7/luffy.png" 
    alt="Luffy from One Piece with popping eyes"
    width="500"
  />
</figure>

Let's take this apart piece by (one) piece.

The $\pi$ function is just the [Frobenius endomorphism](/en/blog/elliptic-curves-in-depth/part-4/#the-endomorphism-ring) we talked about a couple articles ago. We saw how it acted trivially on elements of the base field - but for the field extension, it's another story. Generally, applying the endomorphism will yield some other point.

But what the heck is that $\sigma$? Again, it's something we've already seen: an element of the [Galois group](/en/blog/elliptic-curves-in-depth/part-6/#galois-conjugates) of the field.

> As a quick reminder, a Galois group is basically a collection of field automorphisms. Automorphisms simply shuffle elements around, but preserve the field structure. In the case of our extension, these automorphisms are expected to leave the elements in the base field $\mathbb{F}_p$ unchanged.

For finite fields, the Galois group is **cyclic** (a cycle of functions), **generated** by the Frobenius endomorphism - every element $\sigma$ is just some power of $\pi$, which is what we see in the formula.

---

The trace map has an interesting property: it maps elements in the field extension into the **base field** - it's somewhat of a **projection** or **squashing**.

> It's easy to prove this by showing that $\pi(\textrm{Tr}(P)) = \textrm{Tr}(P)$. I'll leave it to you as an exercise!

And it has another even crazier property: it's **linear**. Meaning, for any points $P$ and $Q$, then $\textrm{Tr}(P + Q) = \textrm{Tr}(P) + \textrm{Tr}(Q)$. This is not evident at first sight, but we can see why this is by examining each of the trace map's components -  which are powers of the Frobenius endomorphism.

Essentially, for this to work, this equality should hold:

$$
(a + b)^p \ \textrm{mod}\ p = (a^p + b^p) \ \textrm{mod}\ p
$$

And magically, in finite fields, **this works**. The expanded formula would be:

$$
(a + b)^p \ \textrm{mod}\ p = \sum_{k=0}^{p}\begin{pmatrix}
p \\
k
\end{pmatrix}a^{(p-k)}b^k
$$

All of the coefficients happen to be divisible by $p$, except the ones for $a^p$ and $b^p$ - meaning that said coefficients are **congruent** to $0$ modulo $p$, so they vanish!

> This is referred to as "[the freshman's dream](https://medium.com/r/?url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FFreshman%2527s_dream)". What they don't tell you is that it works for finite fields!

Therefore, the Frobenius endomorphism is linear, so are its powers, and **so is the trace**.

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-7/mind-explosion.jpg" 
    alt="A head exploding"
    width="600"
  />
</figure>

The linearity of the trace map also guarantees one extra thing. When applied to the r-torsion, we already know we'll obtain a group on the base field. But the result will also belong to a subgroup in the r-torsion. Because linearity causes this:

$$
\textrm{Tr}([r]P) = [r]\textrm{Tr}(P)
$$

> If $P$ is a point in the r-torsion, then $[r]P = \mathcal{O}$. So $[r]\textrm{Tr}(P)$ will be equal to $\textrm{Tr}(\mathcal{O})$, which is by definition $\mathcal{O}$.

---

## Torsion Structure

To close things up, I want to talk a little about some special subgroups in the r-torsion. Again, all of these will be important for pairing construction.

Over the base field, we (often) get a single subgroup in the r-torsion. This is often called the **base field subgroup**, and we denote it by $\mathcal{G}_1$. When we apply the trace map to a torsion subgroup, this is exactly the group we obtain, so we could say:

$$
\textrm{Tr}: E[r] \to \mathcal{G}_1
$$

Now, I'll present you a strangely convoluted way to write $\mathcal{G}_1$. It can be written as:

$$
\mathcal{G}_1 = E[r] \cap \textrm{Ker}(\pi - [1])
$$

$\textrm{Ker}$ just means **kernel**. We've talked about this enough in the past, but it's simply the set of points which, when we apply the endomorphism at hand (the function $\pi - [1]$), we get $\mathcal{O}$. And we know that $\pi$ acts trivially on the base field - so that kernel is exactly $\mathbb{F}_p$.

> $\mathcal{G}_1$ is then the set of points in the r-torsion that belong to the base field.

We say that $\mathcal{G}_1$ is the **[1]-eigenspace** of $\pi$ restricted to $E[r]$. **Eigenspace** of course refers to the idea of [eigenvalues](https://medium.com/r/?url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FEigenvalues_and_eigenvectors), which in the context of elliptic curves, are values $\lambda$ associated with sets of points $P$ such that:

$$
\pi(P) = [\lambda]P
$$

So, $1$ is an eigenvalue of the Frobenius endomorphism. But it's not its **only** eigenvalue.

### The Characteristic Polynomial

The second eigenvalue is not as evident, and to find it, we need to know about the **characteristic polynomial** of the Frobenius endomorphism.

Long story short, the characteristic polynomial is this function over here:

$$
\pi^2(P)- [t](\pi(P)) + [p]P = \mathcal{O}
$$

Explaining where this comes from would probably take another full article - so again, I ask of you a small act of faith.

> The $t$ in that equation is an interesting value: it's the **trace of Frobenius**. Essentially, if the size of our elliptic curve group is $\#E$, then $t = \#E - p + 1$.

To find the eigenvalues of $\pi$, we assume that $\pi(P) = [\lambda]P$, and substitute into the above equation, yielding:

$$
[\lambda^2 - t\lambda + p]P = \mathcal{O}
$$

For this to be true, we require the value between brackets to be $0$. And this yields two results - let's call them $\alpha$ and $\beta$. They are the eigenvalues, and using some basic algebra, we know that they should suffice two conditions:

- $\alpha + \beta = t$
- $\alpha \beta = p$

The second one is particularly important - we already know that one of the eigenvalues is $1$. Therefore, the other one must be $p$!

Using this second eigenvalue (and its associated eigenspace), we can now recycle that strange definition from before, but using this newly found result:

$$
\mathcal{G}_2 = E[r] \cap \textrm{Ker}(\pi - [p])
$$

In other words, $\mathcal{G}_2$ consists of points $P$ in the r-torsion such that $\pi(P) = [p]P$.

---

These groups ($\mathcal{G}_1$ and $\mathcal{G}_2$) are **very special**. Let's take a moment to talk about them.

As we already mentioned, $\mathcal{G}_1$ is called the base-field subgroup, which makes sense, since we already know it lives entirely on the base field. In contrast, $\mathcal{G}_2$ exists **entirely** in the field extension.

> This makes sense because any point $P$ in $\mathcal{G}_2$ should satisty $\pi(P) = [p]P$, and if $P$ belonged to the base field, then we'd have $P = [p]P$. And this is not true for points in the r-torsion, unless $r$ divides $p$. Since both $r$ and $p$ are usually primes, we conclude that $\mathcal{G}_2$ must not exist on the base field.

Both are cyclic subgroups of order $r$, because they belong to the r-torsion. Their intersection is exactly the point $\mathcal{O}$. And in conjunction, they have a remarkable property: they **generate the entire r-torsion**.

> There are many clues to this. For example, the fact that $E[r]$ is isomorphic to $\mathbb{Z}_r \times \mathbb{Z}_r$ - a space of "dimension 2" over $\mathbb{Z}_r$. Also, the characteristic polynomial also had degree two. These clues suggest that only two eigenspaces of the r-torsion are enough to generate it entirely - which simply means that any point $P$ in $E[r]$ can be uniquely decomposed as $P = P_1 + P_2$, where $P_1 \in \mathcal{G}_1$, and $P_2 \in \mathcal{G}_2$.

Oh, and we have to baptize $\mathcal{G}_2$ with a name. We call it the **trace-zero subgroup**, since all points $P$ in $\mathcal{G}_2$ have $\textrm{Tr}(P) = \mathcal{O}$. We'll not show why this is here, but again, feel free to try this yourself!

Rounding things up, we know that the **trace map** takes points in $E[r]$ to $\mathcal{G}_1$. What about $\mathcal{G}_2$, though? Is there any map that does the same thing? In fact, there is, and it's called the **anti-trace map**, defined as:

$$
a\textrm{Tr} : P \to P' \ / \ a\textrm{Tr}(P)= [k]P - \textrm{Tr}(P)
$$

We'd of course need to show that $\textrm{Tr}(a\textrm{Tr}) = \mathcal{O}$. That endeavor, my friend, I leave to you.

---

## Summary

If you've made it to this point, there's no way you don't feel like you've been hit by a truck full of mathematical weirdness.

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-7/crash.png" 
    alt="A man being hit by a car"
    title="Wheeee~"
    width="500"
  />
</figure>

I know this has been intense. I know at times, it's not fun. I've done my best to try to keep it clear and somewhat entertaining - but math at this level is challenging no matter how you slice it, and everywhere you look, there's more and more theory to dig into.

Still, we've surely covered a lot of ground today.

Let's recap: we introduced the idea of **pairings** or **bilinear maps**. We mentioned how building such functions is not easy, and how we'll require some special groups as inputs.

Then we proceeded to present those groups, exploring the r-torsion in field extensions, and introducing the **base-field subgroup** ($\mathcal{G}_1$) and the **trace-zero subgroup** ($\mathcal{G}_2$) as generators for the r-torsion. And we saw how the **trace map** and the **anti-trace map** allow us to squash elements in the r-torsion into either $\mathcal{G}_1$ or $\mathcal{G}_2$.

> From the perspective of a curious person, I will say that I find the things we've seen today incredibly amazing and beautiful in their own right.

Of course, we've missed the cherry on top: what role these things have in the construction of pairings.

And that will be the topic for the [next article](/en/blog/elliptic-curves-in-depth/part-8). See you then!
