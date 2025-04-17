---
title: "Cryptography 101 Asides: RSA Explained"
date: "2024-03-31"
author: "Frank Mangone"
tags: ["Cryptography", "RSA", "Modular Arithmetic"]
description: "A short explanation on how RSA works"
readingTime: "6 min"
---

> This is part of a larger series of articles about cryptography. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/cryptography-101/where-to-start).

RSA encryption is one of the most widely used encryption algorithms out there — and it relies solely on the _additive group of integers modulo_ $$n$$. It's a great example of how much can be done without the need for elliptic curves, or any other more complex constructions.

This aside is dedicated to explaining the working principles and nuances of the RSA algorithm.

---

## The subjacent problem

A lot of cryptographic mechanisms operate on the principle that it's really hard to perform a certain operation unless you know some _secret key_. In _encryption_, that's exactly the idea: an encrypted message is _undecipherable_ without knowledge of said secret key.

How is this achieved, then? By crafting a problem that's _really difficult to solve_, unless you have some extra, _secret information_. RSA hinges on one of these problems: the _factorization of large numbers_ into their _prime factors_. This is: given a (large) number $$n$$, expressing it as:

$$
n = p.q
$$

Where $$p$$ and $$q$$ are large prime numbers. If you know $$p$$ and $$q$$, calculating $$n$$ is trivial — and so is calculating $$p$$ if you know $$n$$ and $$q$$.

### How Big is Big Enough?

Of course, this is all _worthless_ if the problem is easy to solve. For example, if $$n = 7×11 = 77$$, then factorization really only takes an instant. As the prime numbers become larger though, factorization starts taking more and more time.

The recommended size for the prime factors $$p$$ and $$q$$ is between $$1024$$ and $$2048$$ bits. For reference, this is how a 1024-bit prime number looks like:

::: big-quote
170154366828665079503315635359566390626153860097410117673698414542663355444709893966571750073322692712277666971313348160841835991041384679700511912064982526249529596585220499141442747333138443745082395711957231040341599508490720584345044145678716964326909852653412051765274781142172235546768485104821112642811
:::

Yeah, it's pretty big.

Estimating how long it would take to find the prime factors of a large number say, 2048-bit long, is hard. Mainly because it hasn't really been done!

But still, it’s theorized that it would take anywhere from _hundreds_ to _thousands_ of years, even with powerful hardware. Unless [Quantum Computing](/en/blog/wtf-is-quantum-computing) becomes available, that is — and that’s a story for another time.

---

## Preliminaries

How do we use the previous problem to encrypt data? Doing so will require a couple definitions. In particular, we'll need to know about [Euler's totient function](https://en.wikipedia.org/wiki/Euler%27s_totient_function), and its properties.

### Euler’s totient function

For any natural number $$n$$, this function (denoted as $$\varphi(n)$$) counts how many natural numbers lower than $$n$$ (not counting 0) are _coprime_ to it.

Being _coprime_ means that the numbers _share no prime factors_. Another way to say this is that the _greatest common denominator_ of coprime numbers is $$1$$.

> For example, 6 and 25 are coprime.

Notice that for a _prime number_ $$p$$, every number lower than it is a _coprime_ (because since $$p$$ is prime, it’s only prime factor is $$p$$!). So we can write:

$$
\varphi(p) = p - 1
$$

And also, it is true that for $$n = p.q$$, if $$p$$ and $$q$$ are prime, then:

$$
\varphi(n) = (p - 1)(q - 1)
$$

### An important property

Why do we care about the totient function? Mostly because of [Euler's theorem](https://en.wikipedia.org/wiki/Euler%27s_theorem), which states that if $$a$$ and $$n$$ are coprime, then:

$$
a^{\varphi(n)} \ \textrm{mod} \ n = 1
$$

And if we multiply both sides by $$a$$, this is what we get:

$$
a^{\varphi(n) + 1} \ \textrm{mod} \ n = a
$$

Apparently, there's a certain magical number $$\varphi(n) + 1$$ which seems to allow us to recover the original value $$a$$!

<figure className="my-8">
  <img 
    src="/images/cryptography-101/rsa-explained/batman.webp" 
    alt="Batman thinking"
    width="600"
  />
  <figcaption className="text-center text-sm text-gray-500 mt-2">
    I think I know where this is going...
  </figcaption>
</figure>

---

## The algorithm

If we substitute $$a$$ in the previous equation by our message $$m$$, then we have a great primer for an encryption mechanism, because we have an operation on $$m$$ that allows us to _recover_ $$m$$!

What we need to do, is split the process into _two steps_. And to do this, we simply _factorize_ $$\varphi(n) + 1$$.

This is not your usual factorization, though. What really happens is that we choose some _random large_ number $$e$$, provided that $$e < \varphi(n)$$, and that $$e$$ is coprime with $$\varphi(n)$$. Then, we calculate another number $$d$$ such that:

$$
e.d \ \textrm{mod} \ \varphi(n) = 1
$$

> This is really just the modular multiplicative inverse of $$e$$, modulo $$\varphi(n)$$.

And calculating $$d$$ in such a way ensures that the following is true (which is fairly simple to prove, so I leave that task to you):

$$
m^{e.d} \ \textrm{mod} \ n = m
$$

And the interesting part is, with knowledge of $$e$$ and $$n$$, it’s not easy to calculate $$\varphi(n)$$ because for that, you’d need the _prime factors of_ $$n$$! Which is a really hard problem! For this reason, $$e$$ can be made public — and will indeed be the _public key_ in RSA.

### The steps

All that remains is to separate into two steps. We use the public key $$e$$ to calculate a _ciphertext_:

$$
m^e \ \textrm{mod} \ n = c
$$

Without knowledge of $$d$$, this cannot be converted back into $$m$$. So as long as $$d$$ is kept secret, then only whoever holds this value can decrypt $$c$$. And because of this, $$d$$ is going to be our _private key_.

To decrypt, we simply do the following:

$$
c^d \textrm{mod} \ n = m^{e.d} \textrm{mod} \ n = m
$$

And voilà! The message is decrypted!

> Note that you can also digitally sign with this scheme, by using $$d$$ to produce a signature, and $$e$$ to verify it. Neat, huh?

---

## Summary

And there you have it! That’s how RSA encryption works.

<figure className="my-8">
  <img 
    src="/images/cryptography-101/rsa-explained/dumbledore-applaudes.webp" 
    alt="Dumbledore slow claps"
  />
  <figcaption className="text-center text-sm text-gray-500 mt-2">
    Dumbledore approves
  </figcaption>
</figure>

There’s not much more to say about it. Still, there are a couple points we haven’t touched on — namely, how to [calculate modular multiplicative inverses](https://en.wikipedia.org/wiki/Modular_multiplicative_inverse#:~:text=modular%20multiplicative%20inverses.-,Computation,-%5Bedit%5D), or how to [generate large prime numbers](https://crypto.stackexchange.com/questions/71/how-can-i-generate-large-prime-numbers-for-rsa). We won’t cover them here, but of course, these are key components for RSA encryption as well.

Nevertheless, there are some particularly sensitive points in RSA that can become very big pitfalls for the entire cryptosystem, as is fantastically explained [here](https://blog.trailofbits.com/2019/07/08/fuck-rsa/). The theory is really fine and dandy, but implementing this seemingly simple scheme on your own can make it very vulnerable.

<figure className="my-8">
  <img 
    src="/images/cryptography-101/rsa-explained/dumbledore-scared.webp" 
    alt="Dumbledore slightly concerned"
  />
  <figcaption className="text-center text-sm text-gray-500 mt-2">
    Shocked
  </figcaption>
</figure>

This is one of the reasons why RSA is mostly considered obsolete, and has been replaced by [Elliptic Curve Cryptography (ECC)](/en/blog/cryptography-101/elliptic-curves-somewhat-demystified) for a lot of applications.
