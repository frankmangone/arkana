---
title: "Cryptography 101: Encryption and Digital Signatures"
date: "2024-03-18"
author: "Frank Mangone"
tags:
  [
    "Cryptography",
    "Mathematics",
    "Elliptic Curves",
    "Encryption",
    "Digital Signatures",
  ]
description: "Building upon our previous knowledge of elliptic curves, we explore how to encrypt and sign information"
readingTime: "9 min"
---

> This is part of a larger series of articles about cryptography. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/cryptography-101-where-to-start).

In the [previous installment](/en/blog/cryptography-101-elliptic-curves-somewhat-demystified), we expanded upon our basic knowledge of groups by defining _elliptic curve groups_. And we briefly mentioned that these concepts would allow us to construct some useful cryptographic mechanisms.

And as promised, we'll take a look at _two_ such basic technique examples: one for _digital signing_, and one for _encryption_. But before we do this, we need to define a couple gadgets that will be essential in our development. We'll be working in the context of elliptic curves, but these concepts can be generalized to other groups.

You've probably heard of _private_ and _public keys_. Let's take a look at what they really are.

---

## Keys Pairs

The story that's usually told when learning about digital signatures goes something like this: a user (let's say, Alice) with a private (or _secret_) key can _sign_ a message, and then anyone can _verify_ the signature with the associated public key.

<figure className="my-8">
  <img 
    src="/images/cryptography-101/encryption-and-digital-signatures/cool-story.webp" 
    alt="Cool story bro" 
    width="389"
  />
  <figcaption className="text-center text-sm text-gray-500 mt-2">
    Yeah, awesome
  </figcaption>
</figure>

And of course, we learn _nothing_ about the mechanisms behind this. But there's an implicit message in there: it _shouldn't be possible_ to get a private key from a public key, for this would mean anyone holding Alice's public key could produce a signature in Alice's name (it's called _private_ for a reason, after all). With this to consider, let's see what these keys really are.

<figure className="my-8">
  <img 
    src="/images/cryptography-101/encryption-and-digital-signatures/key-pairs.webp" 
    alt="Key pair relation" 
    className="bg-white"
  />
</figure>

> Remember [group generators](/en/blog/cryptography-101-where-to-start) from the very first article? Well, this is where they come in. Elliptic curves, being groups, also have generators and subgroups!

Suppose Alice and some other guy Bob agree on a generator point $G$ on the elliptic curve. Alice then chooses some random number $d$ from the set of _integers modulo_ $q$, so $d < q$. Also, let's assume $d$ is a big number, not just $12$ or $35$. This will be her _private key_.

<figure className="my-8">
  <img
    src="/images/cryptography-101/encryption-and-digital-signatures/busted.webp" 
    alt="Scooby-doo unmasking meme" 
    width="400"
  />
  <figcaption className="text-center text-sm text-gray-500 mt-2">
    Busted
  </figcaption>
</figure>

Alice proceeds to calculate $Q = [d]G$, leveraging the power of _point doubling_, and obtains _another point_ in the group — this will be her _public key_, and she can safely send it out to Bob.

Evidently, $Q$ _encodes information about the private key_. Bob could try and calculate a number $d$ such that $Q = [d]G$ — but the problem is that, if our elliptic curve group is “big enough”, that would take Bob a really, _really_ long time. And this is _precisely_ the secret sauce: finding $d$, even when knowing $Q$ and $G$, should be nearly impossible. This is known as (a version of) the _discrete logarithm problem_ (_DLP_).

Of course, if our group happens to have $1000$ elements, or if the number Alice chooses is “small”, trying possible values of $d$ is a doable task. You can probably write a script that solves the problem in under 10 minutes — this is called _brute forcing_. The DLP problem really shines when we have _huge_ groups. For instance, the [curve 25519](https://en.wikipedia.org/wiki/Curve25519) has subgroups of order around ~2²⁵⁰. That's quite a big number. Good luck trying to brute-force $d$.

---

## Encryption

Alice now holds some number $d$ as her private key, and Bob holds the corresponding public key $Q$, which is just a point on the elliptic curve. What can they do with this?

These gadgets we developed are just about enough to start building fun things (yay!). Let's _encrypt_ some data!

> Imagine that Bob wants to _protect a message_ so that Alice is the only person who can read it. If they were teenagers at school, they may exchange a written message in a _secret code_ that only Alice and Bob can understand. Since they both know the secret code, both of them can “undo” the encoding — so this is called _symmetric encryption_.

Alright, sounds simple enough!

How does this happen in a _real application_? Think about this: any message is just a bunch of _zeros_ and _ones_, some _binary number_. If we _distort_ said number, we essentially transform it into meaningless gibberish — this is usually called _ciphertext_. And if we do this in a _reversible_ way, the original message can be recovered!

<figure className="my-8">
  <img 
    src="/images/cryptography-101/encryption-and-digital-signatures/encryption.webp" 
    alt="Encryption visual representation" 
    className="bg-white"
  />
  <figcaption className="text-center text-sm text-gray-500 mt-2">
    Just like magic
  </figcaption>
</figure>

> Here's a [simple implementation](https://gist.github.com/frankmangone/2ec7bff333a8d2ef7138bf0ac1e161d6) in case you want to play around with it.

Just to clarify, the reversibility here is given by the logical XOR operation. Don't worry about this - the point is that we were able to _mask_ the original message, with a _shared secret key_.

### What About Elliptic Curves?

Clearly, we _didn't need_ elliptic curves in the previous construction. And this goes to show that cryptography is _much broader_ than just a single tool, and really dates back to well before elliptic curves were even a thing.

But what happens with the secret key? How do Alice and Bob _agree_ on a shared key? If they do this in an insecure way, then someone else could be listening, and that third person (let's say Charlie) can then _read Alice and Bob's secret messages_! Not cool, our encryption is rendered useless!

Let's not panic yet. Even though there are ways to [securely share secret keys](https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange), there's another way around this: we can use elliptic curves to obtain the shared secret in an _asymmetric way_.

### Asymmetric Encryption

Say Bob wants to encrypt a message $M$ for Alice. Instead of agreeing on a key, Alice can simply choose a private key $d$, and share her public key $Q = [d]G$ with Bob. With this setup, we can devise a way for Bob to encrypt messages for _Alice and Alice only_. This is how it goes:

- He picks some random number $k < q$, usually called a _nonce_,
- Bob then computes $[k]Q$, and uses this to calculate a _mask_, which we'll denote $P$, using some agreed-upon algorithm,
- He masks the message using XOR as in the previous example, and obtains the _ciphertext_ $C = M + P$,
- Finally, he computes $[k]G$, where $G$ is the group generator that Alice and Bob previously agreed upon,
- Bob then sends the pair of points $([k]G, C)$ to Alice.

Alice, who knows the private key $d$, can then perform these actions:

- She calculates $[d]([k]G)$. We didn't mention this, but multiplication is _commutative_ in elliptic curves, so $[d]([k]G) = [k]([d]G) = [k]Q$. Without knowledge of $k$, we can still _reconstruct_ the mask that Bob used. Amazing.
- Using the agreed-upon algorithm, Alice calculates the mask, and _reverses_ the masking with $M = C + P$.

Visuals tend to help a lot. All in all, the process looks like this:

<figure className="my-8">
  <img 
    src="/images/cryptography-101/encryption-and-digital-signatures/encryption-process.webp" 
    alt="Encryption & decryption cycle" 
    className="bg-white"
  />
  <figcaption className="text-center text-sm text-gray-500 mt-2">
    ECIES in action
  </figcaption>
</figure>

This process is called [Elliptic Curve Integrated Encryption Scheme](https://medium.com/asecuritysite-when-bob-met-alice/elliptic-curve-integrated-encryption-scheme-ecies-encrypting-using-elliptic-curves-dc8d0b87eaa), or ECIES for short. Other similar schemes exist, such as [ElGamal’s encryption system](https://en.wikipedia.org/wiki/ElGamal_encryption), which can be adapted to elliptic curves.

I don’t know about you, but I find this fascinating. With just a couple operations, it’s possible to protect data in a way that is _impossible to decipher_ in practice without knowledge of a single _number_ (which _only Alice_ knows).

<figure className="my-8">
  <img 
    src="/images/cryptography-101/encryption-and-digital-signatures/heavy-breathing.webp" 
    alt="Heavy breathing meme" 
    width="376"
  />
</figure>

Our understanding of groups is finally paying dividends!

Summarizing:

::: big-quote
This encryption method works by calculating a mask and adding it to the original message.

In symmetric encryption, both parties need to know the mask; in asymmetric encryption, the masking can only be undone with knowledge of a private key by one party.
:::

---

## Digital Signatures

Encryption assumes that the encoded information _must remain secret to unintended readers_. This is not always true: sometimes the information can be _public_, but our interest lies in proving its _authenticity_. For instance:

> Suppose Bob wants to send a payment request to Alice for $1000. He sends Alice his bank account number, and the amount he needs to transfer. What would happen if someone else (let’s say Charlie) _intercepts_ the message, and _changes_ Bob’s bank account by his?
>
> Alice has no means to check whether if the bank account is Bob’s or Charlie’s. Is there something we can do to prevent Charlie from using this strategy to steal the money?

If Bob could somehow _sign_ the information, then Alice could check that the signature is _valid_, and accept the message. In turn, if Charlie changes the bank account, then the signature is no longer valid, and Alice would reject the message. This is exactly the functionality that _digital signatures_ provide.

What we’ll present now is called the [Elliptic Curve Digital Signature Algorithm](https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm), or ECDSA for short. This process is perhaps slightly more complicated than encryption. It will involve some new math gymnastics. We’ll define them as they are needed. Sit tight.

- Bob encodes his message, like he did on the encryption example, but this time the output is an _integer_ $M$. We’ll see how to do this later.
- Bob then picks a random number $k$, just like in the case of encryption,
- He also calculates $R = [k]G$. We’ll denote the x-coordinate of $R$ by the letter $r$,
- The last calculation he performs is for the number $s$, calculated as:

$$
s = k^{-1}(M + d.r) \ \textrm{mod} \ n
$$

- And finally, he sends the pair $(r, s)$ to Alice.

> The $k^{-1}$ in the calculation of $s$ is _not_ the _reciprocal_ of $k$ (this is, it's not $1/k$).
>
> Instead, $k^{-1}$ represents the [modular multiplicative inverse](https://en.wikipedia.org/wiki/Modular_multiplicative_inverse). Essentially, it’s a number such that, when multiplied by k, yields the following result:

$$
k.k^{-1} \ \textrm{mod} \ n = 1
$$

> Also, the modulo (n) is a special number: it’s the order of the generator point $G$. Every point in the elliptic curve has an order, which is the smallest integer for which $[n]G = \mathcal{O}$. This is also the order of the group $\mathbb{G}$.

Okay, that was a mouthful, but we have our signature. All that remains is _verifying it_. Since the message is public, Bob can _encode_ it to the same number $M$ that Alice used. And then, he follows through these steps:

- He calculates $w$ as the modular inverse of $s$, so $w = s^-1 \ \textrm{mod} \ n$.
- Bob then takes this value and calculates $R' = [w.M]G + [w.r]Q$.
- He accepts the signature if the x-coordinate of $R’$ matches the value $r$.

Working out the numbers and checking that $R’ = R$ is a nice exercise for the reader. If you’re going to try, just remember that since $G$ is a generator of order n, then $[n]G = \mathcal{O}$. You may also need to use some [modular arithmetic properties](https://en.wikipedia.org/wiki/Modular_arithmetic#:~:text=.-,Basic%20properties,-%5Bedit%5D).

<figure className="my-8">
  <img 
    src="/images/cryptography-101/encryption-and-digital-signatures/ecdsa-in-action.webp" 
    alt="ECDSA visualization" 
    className="bg-white"
  />
  <figcaption className="text-center text-sm text-gray-500 mt-2">
    ECDSA in action
  </figcaption>
</figure>

And again, just like magic, a signature is really just a _pair of numbers_! The idea here is that calculating s is really easy with knowledge of the private key, but really hard without it — you’d have to solve a DLP problem!

If Charlie wants to change the message, he has no other option than _brute force_. And we know how that plays out for him (spoiler: it’s not gonna be fun).

Let’s say this again, so that it sticks:

::: big-quote
Signing involves calculating a sort of “challenge” R, and some “verification key” s. The pair (R, s) constitutes a signature.

The value s is special because, when put into a blender (i.e. some process) along with the public key Q, and the original message M, it yields back the challenge R. And the idea is that s can only be calculated with knowledge of the private key.
:::

---

## Summary

There are several more techniques and constructions that we’ll be exploring in the next few articles, but this is a good place to stop for now.

I believe it’s not as important to understand every piece of math or every calculation at play, but to appreciate how in the end, both encryption and digital signing really amount to a clever use of elliptic curve operations, leveraging the power of the DLP problem.

The good news is that there’s a lot we can do with the tools we have so far. More sophisticated techniques will require the introduction of some new and more complex concepts — and we’ll not go there yet.

Moreover, there are some things we haven’t quite explained yet, like how to _turn a message into a number_, in the case of digital signatures, nor how to _obtain a mask from a point in the elliptic curve_, in the case of encryption.

This can be done via _hashing_, a very powerful tool which will be the central topic of the [next article](/en/blog/cryptography-101-hashing)!
