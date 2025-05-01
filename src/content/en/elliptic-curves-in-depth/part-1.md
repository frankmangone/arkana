---
title: "Elliptic Curves In-Depth (Part 1)"
date: "2025-01-14"
author: "frank-mangone"
tags: ["Cryptography", "Mathematics", "Math", "Curves", "Elliptic Curve"]
description: "A (kinda) gentle intro to elliptic curves"
readingTime: "12 min"
---

Cryptography is always evolving.

New techniques are being developed all the time. Especially in some fields that seem to be all the rage nowadays, such as [Zero-Knowledge proofs](/en/blog/cryptography-101/zero-knowledge-proofs-part-2), [Fully Homomorphic Encryption](/en/blog/cryptography-101/fully-homomorphic-encryption), and [Post-Quantum Cryptography](/en/blog/cryptography-101/post-quantum-cryptography).

Better, faster, more secure methods are constantly being researched. The sheer amount of cryptographic techniques out there is overwhelming.

However, the fundamental **mathematical structures** upon which this world of diverse techniques is based is rather invariant.

> Although there are perhaps some new faces on the block like [polynomial rings](/en/blog/cryptography-101/rings/#quotient-polynomial-rings) and [ideals](/en/blog/cryptography-101/rings/#ideals), and some research on more exotic alternatives like [p-adic numbers](https://eprint.iacr.org/2021/522.pdf).

---

Most of the cryptographic methods we use every day (often times without even noticing) are based on a single construction: an **elliptic curve**.

> It’s possible that [they become obsolete soon](https://billatnapier.medium.com/shock-news-sha-256-ecdsa-and-rsa-not-approved-in-australia-by-2030-3d1c286cad58). But at least in the very near future, they are going nowhere!

I recently talked about them in the [Cryptography 101](/en/blog/cryptography-101/elliptic-curves-somewhat-demystified) series. Truth be told, that was only a brief, friendly overview of the topic. Good enough as a first approach — but not nearly close to the full story.

This time around, I want to take a stab at a deeper dive into the world of elliptic curves. There’s a lot to cover, so I’ll be splitting this into a few parts.

Hope you enjoy!

---

## Elliptic Curves

Naturally, the first question that comes to mind is **what the hell is an elliptic curve**?

Without much further ado, I present to you — this is an elliptic curve:

$$
E: y^2 + a_1xy + a_2y = x^3 + a_3x^2 + a_4x + a_5
$$

What you’re looking at is the **general Weierstrass equation** for elliptic curves — it’s really just a **cubic** (degree three) polynomial. Nothing to be scared of.

In general, we’ll use the following reduced version, which is equivalent under some conditions that we’ll not cover here:

$$
E: y^2 = x^3 + ax + b
$$

And this is what an elliptic curve looks like when plotted in a cartesian plane:

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-1/elliptic-curve.webp" 
    alt="A basic elliptic curve"
    title="[zoom] Hello there!"
    width="500"
  />
</figure>

> Looking at this figure, you may wonder what’s “elliptic” about these curves. It just so happens that this is somewhat of a **misnomer**, as explained [here](https://medium.com/@youssef.housni21/why-elliptic-curves-are-called-elliptic-a8327d94e3d1).

What we’re representing here is the collection of points that satisfy the equation $E$ we defined previously, just like a parabola satisfies the equation $y = x^2$.

Now, there are a couple things we can say about these curves from the get go.

First off, notice how they are **symmetric** about the x-axis. It’s easy to see that the culprit is that $y^2$ term, because any positive value for $x^3 + ax+ b$ has both a positive and a negative square root, which are both valid solutions for $y$.

Secondly, the curve is **smooth**. Not all curves that satisfy the expression $E$ are smooth, though — like this one:

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-1/singular-curve.webp" 
    alt="A singular curve, with a 'pointy' part"
    title="[zoom] This is the curve E: y² = x³ - 3x + 2"
    width="500"
  />
</figure>

We can see how there seems to be an **intersection point**. If you try plotting the curve $y^2 = x^3$, you’ll also notice some strange behavior.

> It’s technically **not** an intersection, but rather two pointy parts of the curve touching each other.

We call these kind of curves **singular**. Singular curves will be problematic when we try to use them for our intents and purposes — because the **derivative** at those points isn’t well-defined. For this reason, non-smooth curves such as this one are **not considered** to be elliptic curves.

So much for presentations! What are these little thingies good for anyway?

---

## Defining Operations

What’s attractive about these curves is that we can use them to define **an operation**. I want to dedicate the remainder of this article to understanding said operation, which leaves its usefulness out of the picture for now — but we’ll cover that in coming articles.

Still, I’d like to provide some context before moving on.

> Our operation will serve as a key piece in the construction of a [mathematical group](/en/blog/cryptography-101/where-to-start/#groups). We’ll talk about those later — but the idea is that groups are the cornerstone for some crazy hard math problems, that enable the public key cryptography we all know and love. And then some.

---

The **elliptic curve operation** we’re going to present has sort of a weird definition. Please bear with me for now. It goes like this:

1. Pick two points $P$ and $Q$ on the curve, and draw a line through them.
2. You’ll find that this line intersects another point on the curve. Let’s call it $-R$.
3. Now, flip $-R$ about the x-axis. Since $-R$ is a point on the curve, and the curve is symmetric, you’ll arrive at another point on the curve: $R$.
