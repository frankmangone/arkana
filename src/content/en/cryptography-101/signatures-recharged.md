---
title: "Cryptography 101: Signatures Recharged"
date: "2024-04-09"
author: "Frank Mangone"
tags: ["Cryptography", "Digital Signatures", "Elliptic Curve", "Mathematics"]
description: "A quick look at some slightly more elaborate signature schemes than usual"
readingTime: "11 min"
---

> This is part of a larger series of articles about cryptography. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/cryptography-101/where-to-start).

If you’ve been following the series, then you’ve already seen your fair share of cryptographic shenanigans. Especially in the [previous article](/en/blog/cryptography-101/protocols-galore). Still... That’s just the tip of the iceberg.

<figure className="my-8">
  <img
    src="/images/cryptography-101/signatures-recharged/iceberg.webp" 
    alt="An iceberg" 
  />
  <figcaption className="text-center text-sm text-gray-500 mt-2">
    Don’t worry, though. Our descent into the depths will be slow and steady
  </figcaption>
</figure>

There’s _so much more_ to learn. We can do a lot more with elliptic curves (and groups in general, to be fair). In particular, _digital signatures_ have some _elegant variants_ that prove to be extremely useful in the right context. This will be the topic for today’s article.

### A Friendly Forewarning

I reckon that it is at this point in the series where the math gets _slightly spicier_ than usual. The complexity of the protocols to be presented is a little higher. If you’re here just to get a general idea of cryptographic techniques, then I suggest reading _only the introduction to each topic_. I’ll do my best to keep the introductions simple and self-contained, so that they provide a good overall idea, without the hassle of understanding the math.

Let’s get it!

---

## Blind Signatures

In some cases, it may be necessary to sign _private information_. For example, in a _voting system_, a user may want to keep their vote _private_, but require endorsement from some third party. The latter would have to sign the vote _blindly_ — without knowing what the user’s vote is.

Of course, even though this is technically possible, _blind signing_ should be implemented with care. You don’t want to be blind signing a transaction that empties your bank account, after all.

<figure className="my-8">
  <img
    src="/images/cryptography-101/signatures-recharged/sign-here.webp" 
    alt="Spongebob requesting a signature" 
    width="480"
  />
  <figcaption className="text-center text-sm text-gray-500 mt-2">
    Not so fast, cowboy
  </figcaption>
</figure>

Still, if blind signatures are needed, there are many ways to construct them. One possibility is to adapt existing signature schemes. In particular, adapting Schnorr signatures is fairly simple. Let’s try that!

The point is that Alice _doesn’t know_ what she’s signing — she’s going to be asked by Bob to sign some message $M$ that he previously _blinds_ or _masks_. And after crafting the signature, Bob has a way to _unmask it_, so that verification works with his _original message_.

> Copying in progress!
