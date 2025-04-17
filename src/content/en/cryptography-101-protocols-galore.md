---
title: "Cryptography 101: Protocols Galore"
date: "2024-04-02"
author: "Frank Mangone"
tags:
  [
    "Cryptography",
    "Zero Knowledge Proofs",
    "Verifiable Randomness",
    "Elliptic Curve",
    "Key Exchange",
  ]
description: "A gentle introduction to some very useful schemes: key exchange, commitment schemes, zero-knowledge proofs, verifiable random functions"
readingTime: "11 min"
---

> This is part of a larger series of articles about cryptography. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/cryptography-101-where-to-start).

Alright! We’ve come pretty far already. We have [groups](/en/blog/cryptography-101-where-to-start) (and in particular [elliptic curves](/en/blog/cryptography-101-elliptic-curves-somewhat-demystified)) and [hashing](/en/blog/cryptography-101-hashing) as tools at our disposal, and we’ve already [seen them in action](/en/blog/cryptography-101-encryption-and-digital-signatures).

But a lot more can be done with what we know. This article will be dedicated to listing and explaining cryptographic protocols based on elliptic curves.

> I must point out that the _same protocols_ can be constructed using the group of integers modulo $q$. We’ll stick with elliptic curves, since there are some benefits in using them. That discussion will happen another time.

This list is by no means _complete_ — there’s more out there. Still, this should provide a solid base for you to have a good grasp of what’s possible with what we know so far.

Buckle up, and let’s jump right into it!

---

## Key Exchange

> Copy in progress!
