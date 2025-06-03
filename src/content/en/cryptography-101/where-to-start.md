---
title: 'Cryptography 101: Where to Start'
date: '2024-03-07'
author: frank-mangone
thumbnail: /images/cryptography-101/where-to-start/aaaaa.webp
tags:
  - cryptography
  - groups
  - mathematics
  - modularArithmetic
description: A very gentle intro into the world of cryptography
readingTime: 6 min
mediumUrl: >-
  https://medium.com/@francomangone18/cryptography-101-where-to-start-df7d0791b189
contentHash: 0b9cf628f5e2d1580aca155dd600b3c36007e71cf1e47b5aec1b552eb204ad6f
supabaseId: 1a8f7374-2b3a-4cca-bc0a-a7278f6c7018
---

I’ll preface this by saying that I’m by no means neither a mathematician, nor an expert in cryptography — I’m just a guy trying to learn the craft on my own.

But it’s precisely because of this that I’ve tried to distill the complex concepts I’ve stumbled upon into bits that are easy to digest. So this is my attempt at trying to present these concepts. I’ve always believed there’s something deeply enriching in trying to understand how things work, even though we may not need to implement or really use all of the ideas that we learn. Hope you have fun along the way!

In this article, we'll explore some of the basic concepts behind cryptographic techniques, and we'll construct upon these concepts at a later time. Laying these foundations will prove important when trying to understand processes such as **encryption**, **secret sharing**, and others.

## Getting started

In my case, I've been working at a company that uses [Blockchain](/en/blog/blockchain-101/how-it-all-began) technology. This requires a basic understanding of **digital signatures** — you know, some user has a **private key**, uses that private key to **sign a message**, and the authenticity of the signature can be checked with a **public key**. This is fairly common jargon, and lots of libraries exist to perform the actions I just described.

But from my perspective, this looked no different than sorcery. How does this even work? What mechanism allows for such a particular process? This curiosity is what ultimately motivates this article.

However, such an adventure cannot start by explaining how a digital signature mechanism works. We must first lay some mathematical groundwork in order to understand how cryptographic protocols and techniques operate. So this will be our starting point.

---

## Groups

There are lots of cryptographic techniques that are based on **mathematical groups**. In essence, a **group** is simply the combination of a **set** of elements, and a **binary operation** (we'll denote it "+" for now) that takes two elements in the set, and outputs another element in said set. This is very abstract — and in fact, nothing stops us from using a set such as:

$$
S = \{A, B, C, D, E\}
$$

But then we'd have to define what the result of the combination of **each pair of elements** yields when we apply the group operation (i.e. what's the result of $A + B$? Is it even the same result as $B + A$?).

Luckily, there are groups that are **simpler to define**. One such group is based on the integers — if we restrict the integers to only the elements below a certain threshold $$q$$, we obtain a set of the form:

$$
\mathbb{Z}_q = \{0, 1, 2, 3, ..., q-1\}
$$

Without diving into the mathematical rigor, we'll just call this set the **integers modulo** $$q$$. And it's very natural to take **standard addition** as the group operation: $$1 + 2$$ yields $$3$$, which is an element of the set, $$2 + 2$$ yields $$4$$, and so on. This is true for a lot of integers, provided that $$q$$ is big enough! But one question arises: what happens if we step "out of range"? For instance, if we try adding:

$$
(q-1) + 1 = ?
$$

What happens? A black hole? Stack overflow?

<figure>
  <img 
    src="/images/cryptography-101/where-to-start/aaaaa.webp" 
    alt="Goat screaming"
    title="Aaaaaaaaa!"
  />
</figure>

Well... Kind of! We just **wrap around to the beginning** of our set, yielding $$0$$. And this happens because I lied a bit: the group operation is not just standard addition, it's **modular addition**. So we must define what this is in order to continue.

## The Modulo Operation

Really, when we say **modular addition**, we refer to the **modulo** operation. And this operation is just the remainder of dividing a number $$a$$ by some modulo $$q$$. In general, the following relation holds:

$$
a = k.q + b \ / \ 0 \leq b < q
$$

So when dividing $a / q$, we'll obtain as a result some integer $$k$$, and some remainder $$b$$. The result of the modulo operation is just the remainder, and we write:

$$
a \ \textrm{mod} \ q = b
$$

Cool! With this, we can finish defining the group operation that we previously mentioned: it's standard addition, plus application of the modulo $$q$$ operation. What we've just defined is the group known as the **additive group of integers modulo** $$q$$. This simple construction will be behind most of our further analysis, either implicitly or explicitly — so it's good to keep it in mind!

## Group Generators and Subgroups

Let's now turn our attention back to understanding groups. And in particular, let's examine the example where $q = 5$. Let's now choose an element in the set, for instance $g = 2$. What happens if we apply the group operation on $g$ with **itself** over and over?

$$
\\ 2 + 2 \ \textrm{mod} \ 5 = 4
\\ 2 + 2 + 2 \ \textrm{mod} \ 5 = 1
\\ 2 + 2 + 2 + 2 \ \textrm{mod} \ 5 = 3
\\ 2 + 2 + 2 + 2 + 2 \ \textrm{mod} \ 5 = 0
$$

Notice that something interesting happens: we have produced **every element of the group** through the repeated addition of $$g$$. This makes $$g = 2$$ "special" in a certain way— we say that it's a **generator** of the group, since we've effectively "generated" all the associated set in this procedure. We usually denote the group generated by an element $g$ with the expression $$\langle g \rangle$$.

We can also make the observation that in the previous example, **every element** in the group happens to be a generator — you can try this yourself. This is no coincidence: it has to do with the fact that the number of elements in the group (called the **order** of the group, and denoted with $$\#$$) is actually a **prime number**. We'll just point this out, but pay no mind to this fact for now.

However, if we choose a different $$q$$ instead, then not every element has to be a generator. For instance, if $$q = 6$$, then the element $$2$$ is **not** a generator: we'll just produce the set $$\{ 0, 2, 4 \}$$ — we've stumbled upon a **cyclic subgroup** generated by $$g=2$$.

There's an interesting property about subgroups, formulated in [Lagrange's theorem](<https://en.wikipedia.org/wiki/Lagrange%27s_theorem_(group_theory)>), which states:

> Every subgroup $S$ of a finite-order group $G$ has an order that is a divisor of the order of $G$; that is, $\#S$ divides $\#G$.

Subgroups and their properties play an important role in group cryptography, so again, we'll come back to these facts later.

## Summary

In this brief introduction, some basic mathematical concepts were introduced. These will serve as a foundation for what's to come in the next articles.

By itself, understanding the modulo operation and **its properties** is enough to describe some cryptographic techniques (like [RSA encryption](/en/blog/cryptography-101/asides-rsa-explained)) — but there are other groups of interest that we are still to define. In the [next article](/en/blog/cryptography-101/elliptic-curves-somewhat-demystified), we'll dive into the world of elliptic curves, and later we'll use them to devise some [cryptographic protocols](/en/blog/cryptography-101/encryption-and-digital-signatures).
