---
title: 'Cryptography 101: Polynomials'
date: '2024-04-24'
author: frank-mangone
thumbnail: /images/cryptography-101/polynomials/parabola-points.webp
tags:
  - cryptography
  - polynomials
  - interpolation
  - mathematics
description: >-
  Polynomials play an important role in many cryptographic applications. This
  article is dedicated to giving a brief intro to the topic
readingTime: 8 min
mediumUrl: 'https://medium.com/@francomangone18/cryptography-101-polynomials-c888f31a571e'
contentHash: de861ca2aaaf9f0e4250d0bca46fad3b836ddbf2c21a30b75a254b7be3d7b320
supabaseId: 90cabede-a1f7-452a-a422-b34192fdb1bd
---

> This is part of a larger series of articles about cryptography. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/cryptography-101/where-to-start).

So far in the series, we've invested heavily on furthering our understanding of **Elliptic Curve Cryptography** (ECC). We took a short detour to introduce [hashing functions](/en/blog/cryptography-101/hashing), but that's about as far as we've deviated from our central topic.

Although ECC is very rich and powerful, there's **much more** to cryptography than just that. And in this section, I want to introduce you to the fantastic world of **polynomials**.

We can do some things with them that can't really be achieved with elliptic curves. So let's start by presenting them, and then we'll look at their applications. Let's go!

---

## Polynomials

You've probably seen these guys at some point during high school. In essence, they are very simple: they consist of an expression involving **variables**, which can only be **added**, **subtracted**, and **multiplied**. Multiplication also implies that we can have **powers** of variables. And each term in the summation can be multiplied by a number, called a **coefficient**. So, something like this:

$$
P(x,y) = x^4 + 3yx^3 - y^2x^2 + 6y - 1
$$

Notice that a polynomial can have **multiple different variables**. There's no limitation in this sense — but in most cases, we'll just use one variable, and denote it $x$.

> As a curiosity, adding two polynomials yields another polynomial, and multiplying two polynomials also yields another polynomial; because of this, the set of all polynomials forms a mathematical object called a [ring](/en/blog/cryptography-101/rings).

<figure>
  <img
    src="/images/cryptography-101/polynomials/gandalf.webp" 
    alt="Gandalf from The Lord of the Rings, with a scared face" 
    title="Again? Not that ring man!"
  />
</figure>

Polynomials have applications in several areas of mathematics. They are also useful in cryptography, but under **a condition**: we must use integers **everywhere**. This means that variables will only ever be given **integer values**, and we cannot have polynomials with coefficients like $0.5$. This guarantees that the polynomial will **exclusively** output integers.

Additionally, in cryptography, we normally operate under the **modulo operation**. So a complete expression for the polynomial, if you will, would look something like this:

$$
P(x) = x^4 + 3x^3 - x^2 + 6 \ \textrm{mod} \ q
$$

Finally, the **degree** of a polynomial is defined by the highest power to which the variable is raised. For instance, the polynomial we just saw has degree $4$.

This is typically the point where one would start asking oneself "**why do I need to know about this?**"

<figure>
  <img
    src="/images/cryptography-101/polynomials/math-isnt-bad.webp" 
    alt="A joke of a dad teaching his son math so he can teach his offspring as well"
    width="640"
  />
</figure>

Yeah, I know. I promise the applications will be **very interesting**. Please bear with me, because we still need to introduce a particular type of polynomial that will prove extremely useful for us: **Lagrange Polynomials**.

---

## Interpolation

Have you ever noticed how there's only a **single** possible line that goes through **two points**?

<figure>
  <img
    src="/images/cryptography-101/polynomials/line-through-points.webp" 
    alt="A line going through two points A and B" 
    title="[zoom] A line going through two points"
  />
</figure>

Try as you may, there's **no other line** that goes though $A$ and $B$. And a line is really a **polynomial function**, $P(x) = m.x + n$. And this is **not** a coincidence.

Let's now try three points. They can either be **aligned**, in which case you can draw a line through them, or not aligned. In the latter case, you can draw one, and **only** one **parabola** (a degree-2 polynomial) through them.

<figure>
  <img
    src="/images/cryptography-101/polynomials/parabola.webp" 
    alt="Parabola going through two points" 
    title="[zoom]"
  />
</figure>

> Just to clarify, since we use integers and the modulo operation, the curves are just a way to visualize what's happening — but we really use discrete points.

In general, for a given set of $m$ points, there's a **unique polynomial** of degree at most $m - 1$, that goes through all of the $m$ points. This polynomial is very special — so much that it receives its own name: a **Lagrange Polynomial**. We say that it **interpolates** the $m$ points.

What makes it so special? To understand, let's do a little exercise:

Take any three integer-valued points $(x_1, y_1)$, $(x_2, y_2)$, and $(x_3, y_3)$. We know that a **parabola** interpolates these three points, so our Lagrange polynomial will look like this:

$$
L(x) = ax^2 + bx + c
$$

We still don't know **how to calculate** the interpolating polynomial, but that's fine for the time being. Now, take a bunch of values of $x$, and calculate $L(x)$ for each one of them — we get a lot of points that **belong to the same parabola**.

<figure>
  <img
    src="/images/cryptography-101/polynomials/parabola-points.webp" 
    alt="Points in a parabola" 
    title="[zoom] Points in a parabola"
  />
</figure>

And here's what's cool about this: any set of **three** points or more from the drawing above yields the **same interpolated polynomial**.

> And again, you're probably still wondering "okay but why do I need to know this stuff???"

<figure>
  <img
    src="/images/cryptography-101/polynomials/what.webp" 
    alt="Visibly confused man" 
  />
</figure>

Okay, okay. You're right. Enough theory. Let's see what an application looks like, before I lose your interest! Here it is.

---

## Erasure Coding

Whenever you send a video through a messenger app, you expect the receiver to get it in **one unaltered piece**, right? But zooming in a bit, that's not really how **information is transmitted**. You don't just send a single package of information over the internet, as if it was a package bought from Amazon.

<figure>
  <img
    src="/images/cryptography-101/polynomials/amazon-delivery.webp" 
    alt="Amazon delivery guy" 
    title="If only it was that simple..."
  />
</figure>

What really happens is that the original video is sent in **little pieces**, called **packets** of information. And in your device, your recipient's device, and many places in between, there are process running (hello, TCP) that ensure every packet reaches its destination, while also taking care of the painstaking process of reconstructing the original video from its pieces.

And during their travels, many times, packets of information are **lost** or get **corrupted**. Yes, you heard that right. And the processes we mentioned remediate this complication by re-requesting any lost packets.

But there's another way to approach this problem, though: introducing **redundancy** in our data.

<figure>
  <img
    src="/images/cryptography-101/polynomials/erasure-coding.webp" 
    alt="Erasure coding diagram"
    className="bg-white"
    title="[zoom] We can reconstruct the data even if some packets are lost"
  />
</figure>

**Redundancy** means that we're effectively going to send more information than what's really needed. Think of our video as being divisible into four small chunks of information — then we would send a number of chunks bigger than four. And even if information is lost in the way, the recipient **can still reconstruct the original data**.

### But How?

**Polynomials**, that's how!

<figure>
  <img
    src="/images/cryptography-101/polynomials/science.webp" 
    alt="Jesse from Breaking Bad with his famous quote 'Yeah, science!'"
    title="Yeah, science!"
  />
</figure>

As usual, everything starts with a simple idea: the original **pieces** of data can be the **coefficients** for a polynomial!

$$
P(x) = a_0 + a_1x + a_2x^2 + ... + a_{m-1}x^{m-1} = \sum_{i=0}^{m-1} a_ix^i
$$

Each piece of data is just a **binary** number, this is, just an **integer**. And recall, we can reconstruct a polynomial of degree $m - 1$ from at least $m$ points (through Lagrange interpolation). Can you see how this continues?

We just have to evaluate $P(x)$ at $k$ different points $x$, and we require $k$ to be larger than $m$. How many more, you ask? That depends on how many packets you expect to **lose**, because the points $(x, P(x))$ will in fact be the **packets** to send over the network.

And of course, the receiver can reconstruct the original polynomial through interpolation, by using any $m$ of the $k$ points. And by recovering the **coefficients**, they effectively **reconstruct** the original message!

This technique is known as [Reed-Solomon error-correcting codes](https://tomverbeure.github.io/2022/08/07/Reed-Solomon.html). One cool application for them is in [deep-space communications](https://deepspace.jpl.nasa.gov/dsndocs/810-005/208/208B.pdf), where errors and data corruption happen when transmitting data over vast distances. Neat, right?

---

## Interpolation, Revisited

Now we know about at least one application for Lagrange polynomials. But we still don't know **how to interpolate**.

The [standard or direct way](https://en.wikipedia.org/wiki/Lagrange_polynomial) to find a polynomial interpolation is really quite cumbersome. You'll find expressions like this:

$$
\ell_j(x) = \prod_{\substack{0 \leq m \leq k \\ m \neq j}} (x - x_m)(x_j - x_m)^{-1}
$$

$$
L(x) = \sum_{j=1}^m y_j\ell_j(x)
$$

I mean, we can handle these equations, no problem — but the thing is, this is not really the most **efficient way** to interpolate a set of points.

> For those of you who know Big O notation, direct interpolation happens to be $\mathcal{O}(n^2)$. And the most efficient algorithm known today, the one presented below, is $\mathcal{O}(n.log(n))$.

The best and fastest way to interpolate is to use the **Fast Fourier Transform** algorithm (FFT for short). We won't go into detail on how this works, because it involves some concepts we haven't introduced like the **roots of unity** on a group.

Nevertheless, there are [great resources](https://decentralizedthoughts.github.io/2023-09-01-FFT/) out there if you're interested in dissecting the entrails of the algorithm. If that's your cup of tea, have fun!

---

## Secret Sharing

Finally, let's look at another application, which will prove to be very useful to design more familiar protocols like signatures. Let's look at [Shamir Secret Sharing](https://en.wikipedia.org/wiki/Shamir%27s_secret_sharing).

Do you remember how [Diffie-Hellman Key Exchange](/en/blog/cryptography-101/protocols-galore/#key-exchange) allowed multiple parties to generate a shared secret? Well, it has a limitation: the secret is **generated**.

What this means is that if I, Frank, want to disclose a **specific** secret value to a group of people, then Diffie-Hellman is **not** suitable for the task. We must think of another strategy.

And again, polynomials save the day. This is how:

- Set the secret value $s$, to be the **independent term** (the coefficient that's not multiplied by $x$).
- Then, select $m$ random numbers as coefficients for a polynomial, $P(x)$.
- To finish, choose $k$ values of $x$, and evaluate $y = P(x)$ at all these values.

You end up with a bunch of points $(x, y)$. And as you know, any $m + 1$ of these points can be used to **reconstruct** the original polynomial, $P(x)$.

So now, what? Suppose I engage in communications with participants in a network. I share $(x_1, y_1)$ with Alice, then $(x_2, y_2)$ with Bob, $(x_3, y_3)$ with Charlie, and so on. Then they start communicating with each other — Alice sends $(x_1, y_1)$ to Bob, Charlie sends $(x_3, y_3)$ to Alice, etc.

What happens is that, at some point, Alice will have **enough pieces** to **reconstruct** the polynomial $P(x)$. And this is great, because then she looks at the **independent coefficient**, and that is exactly the secret I wanted to share!

This is an example of a broad set of techniques known as Multi Party Computation (MPC). It's a very interesting topic that we'll expand upon in future articles.

---

## Summary

Elliptic curves, hashing, polynomials — our toolset keeps growing! And as we accumulate more tools, new cryptographic techniques become available for us. In particular, we can combine **signatures** and **polynomials** to produce an interesting new construction: **threshold signatures**. We'll go into detail in the [next article](/en/blog/cryptography-101/threshold-signatures), stretching the limits of possibility with the tools currently at our disposal.
