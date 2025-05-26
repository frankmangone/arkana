---
title: 'Cryptography 101: Elliptic Curves (Somewhat) Demystified'
date: '2024-03-11'
author: frank-mangone
thumbnail: >-
  /images/cryptography-101/elliptic-curves-somewhat-demystified/elliptic-curve.webp
tags:
  - cryptography
  - ellipticCurves
  - mathematics
  - modularArithmetic
description: >-
  An introductory dive into the world of elliptic curves, forming the basis for
  understanding useful cryptographic mechanisms
readingTime: 7 min
mediumUrl: >-
  https://medium.com/@francomangone18/cryptography-101-elliptic-curves-somewhat-demystified-e835cce01e23
contentHash: ee1771dc39c3364484df912509994d0c3967b9febd812930d005e74a77ff2c89
---

> This is part of a larger series of articles about cryptography. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/cryptography-101/where-to-start).

In the [previous article](/en/blog/cryptography-101/where-to-start), we briefly discussed some of the ideas that underpin a good portion of the most widely used cryptographic techniques out there.

We haven't yet discussed **why** groups and modular arithmetic are useful for cryptography. But as you may guess, the general idea is that they allow us to craft problems that are **so hard to solve**, that it's practically impossible to crack them even at the expense of astounding amounts of computational resources. So for example, why does a digital signature work? Well, because producing a valid signature is **fairly simple** with knowledge of a secret key, but **unfathomably hard** without it.

We'll deal with these considerations later on. For now, I believe it more fruitful to focus on **other groups** that help make the problems to solve **even harder** — and this is where **elliptic curves** come into the picture.

### What are Elliptic Curves?

A **curve** is usually defined by an **equation**. In the case of elliptic curves, the equation $$E$$ (which is actually a reduced form, but we'll go with it) looks like this:

$$
E: y^2 = x^3 + ax + b
$$

<figure>
  <img 
    src="/images/cryptography-101/elliptic-curves-somewhat-demystified/elliptic-curve.webp" 
    alt="An elliptic curve" 
    title="[zoom] A plot of the curve y² = x³ - x"
  />
</figure>

But wait... What does this have to do with groups? This is just a curve after all!

Let's recap what we've learned so far, shall we? A group is defined by a **set** (let's call it $\mathbb{G}$), and a **binary operation** involving two elements of $\mathbb{G}$, and producing an output that is also in $\mathbb{G}$. If we can think of a way to use elliptic curves so that we obtain a valid **set** and **binary operation**, then we find ourselves a group.

And surely, there **is** something we can do!

---

## The Group Operation

Take any two points $$P$$ and $$Q$$ in the elliptic curve, then draw a **line** through those points. Some basic substitutions show that there will (almost always) exist a **third point** of intersection. Then take that point, imagine the x-axis is a mirror, and reflect it vertically. Congratulations, you have now arrived at the point $$R = P + Q$$!

This process is called the **chord-and-tangent rule**. And it is, in fact, the **group operation** that we're seeking.

The first time I saw this, I recall thinking "what a strange process". I remember asking myself: **why on Earth do you need to flip the third intersection point**? And after taking digging deeper into the subject, all I can say is this: explaining the reason why this makes sense is very far out of the scope of this article. I'll just ask you to trust me that everything is **perfectly sound**, at least for now.

<figure>
  <img 
    src="/images/cryptography-101/elliptic-curves-somewhat-demystified/chord-and-tangent.webp" 
    alt="Chord-and-tangent diagram"
    title="[zoom] The elliptic curve y² = x³ - x + 1 (red) with a representation of the operation P + Q = R"
  />
</figure>

You can try this yourself in a graphical tool like [Desmos](https://www.desmos.com/calculator) or [GeoGebra](https://www.geogebra.org/graphing?lang=en).

One component down, still one more to go — we also need a **set**. And since the **chord-and-tangent** rule maps two points on the elliptic curve to another one, it follows naturally that we'll be working with a **set of points on the elliptic curve**. But there are two problems with this, namely:

- Most of the points on the elliptic curve are real-valued, meaning that the coordinates may not be **integers**. And it's important that they are: otherwise, we may have rounding errors when computing $P + Q$.
- There's an **infinite** number of points on the curve, and we're after a **finite** set.

So how do we solve these problems?

### Finding a Suitable Set

Turns out that some elliptic curves have an infinite number of integer-valued points, this is, points like $P = (1,2)$. Because of this, our first problem disappears somewhat magically with an **adequate selection** of elliptic curve. Let's assume that we know how to do that, and focus on the second problem.

There's a neat trick to turn an infinite amount of integers into a finite set, and we've **already seen it in action**. Can you guess it? That's right, the **modulo operation**!

<figure>
  <img 
    src="/images/cryptography-101/elliptic-curves-somewhat-demystified/discrete-curve.webp" 
    alt="How an elliptic curve over a the integers (modulo 23) looks like"
    title="[zoom] The points of an elliptic curve, modulo 23"
  />
</figure>

Formally, we say that the elliptic curve is defined over a **finite field**, so any point that's "out of range" is just mapped back into range with the modulo operation. This is denoted as:

$$
E(\mathbb{F_q}) \ / \ \mathbb{F}_q = \{0,1,2,3,...,q-1\}
$$

And there you have it! We now have a **set**, and a way to compute the result of **"adding" two points**. But do we? Something's missing...

### The Group Identity

Take a look at the following picture. What happens if we try adding $$P + Q$$ in this scenario?

<figure>
  <img 
    src="/images/cryptography-101/elliptic-curves-somewhat-demystified/cancelling-points.webp" 
    alt="Two vertically-alligned points being added together"
    title="[zoom]"
  />
</figure>

We can immediately see that **there's no third point of intersection**! Panic ensues. Does this mean our construction doesn't work?

<figure>
  <img 
    src="/images/cryptography-101/elliptic-curves-somewhat-demystified/panic-cat.webp" 
    alt="A frightened cat"
    width="236"
    title="*Panic"
  />
</figure>

Luckily, the crisis is readily averted by defining a **new group element**, denoted $\mathcal{O}$. Think of it as the a **point at infinity** — which is not really what happens, but may help conceptualization. This new element has an interesting property, given any point $$P$$ on the curve:

$$
P + \mathcal{O} = \mathcal{O} + P = P
$$

Doesn't this ring a bell? Isn't this **exactly** what happens when adding **zero** to any number?

Indeed, this behavior is important in group theory — the role **zero** plays on the group of integers, and the role $\mathcal{O}$ plays on elliptic curves is that of the [**identity**](https://en.wikipedia.org/wiki/Identity_element) of the respective groups. Adding this element to our set makes it complete — and we can now add two points and always have a valid result.

We're not done though. There's one more small detail that we need to cover.

### Point Doubling

What happens if we try adding $$P + P$$? To try and follow the **chord-and-tangent** rule: we need a line through the two points in the operation, but here... **There's only one**! So as the name suggests, we'll need to consider the line **tangent** to the elliptic curve at $P$.

As before, we find another intersection point, flip it, and find $P + P$, which we shall conveniently denote $[2]P$. In an absolute stroke of inspiration, this operation was named **point doubling**.

<figure>
  <img 
    src="/images/cryptography-101/elliptic-curves-somewhat-demystified/point-doubling.webp" 
    alt="Point doubling in action"
    title="[zoom] Point doubling in action"
  />
</figure>

Calculating $P + [2]P$ then proceeds as usual: draw a line through the two points, flip the third intersection point, and voilà! You just got $[3]P$. Do this again, and you'll get $[4]P$. And here, we can observe something peculiar: adding $P$ four times ($P + P + P + P$) yields the **same result** as adding $[2]P + [2]P$!

As innocent as the previous statement looks, it's actually the **most powerful tool** we have when working with elliptic curves. Suppose we want to compute $[12384162178627301263]P$. Doing this one point at a time would take a really long time — but by correctly applying **point doubling**, the result can be obtained **exponentially faster**!

This hints at the **extremely hard** problems that were mentioned at the beginning of this article. And as we'll soon discuss, this is **precisely** the kind of hard problems that enable cryptographic constructions based on groups to exist!

---

## Summary

We have just defined **elliptic curve** groups. They are just a bunch of integer points, which we can add, and which are inside of a range thanks to the modulo operation. Usually, when elliptic curves are mentioned in literature, it means the **group**, not the curve. If the curve needs specific mention, it's often called the **affine curve**.

If you feel like this right now:

<figure>
  <img 
    src="/images/cryptography-101/elliptic-curves-somewhat-demystified/no-idea-what-im-doing.webp" 
    alt="I have no idea what I'm doing meme"
    title="Me every morning"
  />
</figure>

All I can say is that this can be hard to wrap your head around upon first contact, but once it sinks in, it feels fairly natural. Give it some time, and don't hesitate to reach out if you have any questions!

> Also, you can play around with elliptic curves in [this website](https://andrea.corbellini.name/ecc/interactive/modk-add.html).

Our basic groundwork is in place. In the [next article](/en/blog/cryptography-101/encryption-and-digital-signatures), we'll examine what we can do with our knowledge of elliptic curves. We'll look at a scheme for **asymmetric encryption**, and another one for **digital signatures**. Stay tuned!
