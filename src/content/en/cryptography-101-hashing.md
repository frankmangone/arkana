---
title: "Cryptography 101: Hashing"
date: "2024-03-24"
author: "Frank Mangone"
tags: ["Cryptography", "Hashing", "Data Structures", "Merkle Tree"]
description: "Hashing functions are an essential cryptographic primitive. Join me in a deep dive into what they are, and what they are used for!"
readingTime: "10 min"
---

> This is part of a larger series of articles about cryptography. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/cryptography-101-where-to-start).

[Last time](/en/blog/cryptography-101-encryption-and-digital-signatures), we went through a couple techniques involving elliptic curve groups — namely, _digital signatures_ and _asymmetric encryption_.

Both methods were based on the premise that the _message_, or a message _mask_, were _integers_. But how can this be? For instance, a message is much more likely to be some secret string like “super-secret-and-safe-string”, or more realistically, some JSON data like:

```json
{
  "amount": 1000,
  "account": 8264124135836,
  "transactionReceiptNumber": 13527135
}
```

These are clearly not integers! Thus, they are not fit for use “out of the box” in the way that we originally intended. Some kind of _processing_ will be required.

From this point further, we’ll slightly deviate from our development of groups and their uses. Let’s focus on _another_ tool that will make our cryptographic arsenal much more powerful.

---

## Hashing Functions

Simply put, a _hashing function_ or _algorithm_ takes some data as input, and outputs some random-looking information, like this:

<figure className="my-8">
  <img
    src="/images/cryptography-101/hashing/hashing-function.webp" 
    alt="Hashing function representation as taking any input, and spitting a fix-length binary output" 
  />
</figure>

The output is usually called the _hash_ of the input. For our purposes, the algorithm is like a _black box_ — meaning that we’re usually not interested in how the hash is obtained. What you need to know is that it essentially works as a _data blender_: once the data goes in, it’s scrambled all over, and you can’t possibly recover the original content.

<figure className="my-8">
  <img
    src="/images/cryptography-101/hashing/bosch.webp" 
    alt="Image of a blender" 
  />
  <figcaption className="text-center text-sm text-gray-500 mt-2">
    I’m not sponsored by Bosch, by the way. Hope I’m not infringing any copyrights with this...
  </figcaption>
</figure>

Again, we’re not that interested in _how_ hashing functions achieve this. It’s much more important to understand what _properties_ the algorithm and the hash have, and what we can do with them.

> Well, unless you’re trying to develop a new hashing function, of course. If that’s what you’re after, then you OBVIOUSLY care about the how. Here’s a [document](https://csrc.nist.gov/files/pubs/fips/180-2/final/docs/fips180-2.pdf) from the US’ National Institute of Standards and Technology (NIST) with specifications for different hashing algorithms; and here’s also an [implementation of SHA-256](https://www.movable-type.co.uk/scripts/sha256.html) in Javascript, for reference. Oh boy. Good luck with that.

For cryptographic purposes, hashing functions are often required to have the following characteristics:

- **Deterministic output**: Given an input $A$ (like “I love cats”), the _same output_ is obtained _every time_ we hash $A$.
- **Diffusion**: The slightest change in the input results in a dramatic change in the output. For example, the hashes of “I love cats” and “I love kats” are totally different, unrecognizable from one another.
- **Non-predictability**: The outcome of hashing some data should be _totally unpredictable_; there should be no recognizable patterns in the obtained hash.
- **Non-reversibility**: Reconstructing a valid input for a given hash should not be possible, so that the only way to assert that an input corresponds to a hash is through _trial and error_ (brute force!).
- **Collision resistance**: Finding two inputs that produce the same hash (or even partially-matching hashes) should be really hard.

> Not every hashing algorithm has all of these properties. For example, the [MD5 algorithm](https://en.wikipedia.org/wiki/MD5#:~:text=In%202004%20it%20was%20shown%20that%20MD5%20is%20not%20collision%2Dresistant.) does not provide collision resistance. Just a few days ago, I stumbled upon [this post](https://www.linkedin.com/posts/billatnapier_here-is-a-72-byte-alphanum-md5-collision-activity-7175974469776080896-G33b/?utm_source=share&utm_medium=member_desktop) which shows an MD5 collision of two strings that differ in just a _single bit_.
>
> And depending on our application of the algorithm, this may or may not be important — for instance, MD5 is used to [check file integrity](https://jonasmaro.medium.com/how-to-check-the-integrity-of-a-file-using-the-md5-hash-a4b98565e8c8) because it’s fast, and we don’t care as much about collisions in that context.

The output of hashing functions has a _fixed size_ in most algorithms. And since all inputs are really just _bits of information_, we’re essentially transforming some _arbitrary-length_ sequence of bits, into a _random-looking fixed-size sequence of bits_. This is denoted:

$$
H: \{0,1\}^* \rightarrow \{0,1\}^n
$$

There are many well-known hashing algorithms out there, like the previously mentioned MD5, the [SHA-2](https://en.wikipedia.org/wiki/SHA-2) and [SHA-3](https://en.wikipedia.org/wiki/SHA-3) families, Ethereum’s hashing algorithm [Keccak256](https://www.linkedin.com/pulse/understanding-keccak256-cryptographic-hash-function-soares-m-sc-/), [Blake2](<https://en.wikipedia.org/wiki/BLAKE_(hash_function)>), which is used in [Polkadot](https://wiki.polkadot.network/learn/learn-cryptography/), and others.

### What are Hashes Used For?

There are _many applications_ for hashes. We’ll see that they are useful to build cryptographic protocols, but there are other scenarios where hashing comes in handy. The list below is merely illustrative; keep in mind that hashing is a tremendously powerful tool with widespread application.

- **Data-integrity checks**: as previously mentioned, a hashing function can be used to _digest_ a large file into a small chunk of information. Even the slightest change in the original file causes the hash to change dramatically — so it can be used to check that a file _has not been altered_.

- **Content-driven indexing**: we can generate an identifier for some content, by using a hashing function. If the function is _collision-resistant_, then the identifier is most likely _unique_, and could even be used in database applications as an index.

- **Hash-based data structures**: some data structures rely on the power of hashes. For example, a _hash list_ may use the hash of the previous element as a pointer — very similar to what happens in a _Blockchain_. There are other important hash-based data structures such as [hash tables](https://en.wikipedia.org/wiki/Hash_table). We’ll look at one such structure later in this article.

- **Commitment schemes**: some situations require information not to be revealed _ahead of time_. Imagine I want to play rock-paper-scissors over correspondence. If I send “rock” to my opponent, they can just answer “paper”, and win. But what if we send a _hash_ of “rock” instead? We’ll explore this more in depth in the next article, but hash functions are helpful in these situations.

Alright, we now know what _hashing functions_ are, and we’ve covered some of their applications. Let’s circle back to group-based cryptography, and discuss the importance of hashes in that context.

---

## Hashes to the Rescue

At the beginning of this article, we noted that both _encryption_ and _signing_ require the some sort of _processing_. In encryption, we needed to process a _mask_, and in digital signing, a _message_. And in both scenarios, we needed the output to be some _integer value_. Can hashing functions help us in this endeavor?

Recall that a hashing function will produce a _fixed-size sequence of bits_... And what is that, if not a _binary representation_ of an integer?

$$
(10010100010111100)_2 = (75964)_{10}
$$

> Same number, expressed in different bases.

Just like that, hashing provides a solution to our problem: all we need is to run our message $M$ through a suitable hashing function. The output, $H(M)$, will be a _number_, just as we needed. Awesome stuff. Things are starting to click into place!

### Getting Elliptic Curve Points

When running a hashing function, the output will in general be a _binary number_ — another way to phrase this is to say that we _hash into_ an integer number. There are situations where this is not enough, though: we may require hashing into a _point on an elliptic curve_. In fact, we’ll be required to do this in the next article.

One possible way to hash into an elliptic curve is to calculate $h = H(M)$ normally, and compute a point $[h]G$ as our output, with $G$ being a generator of the elliptic curve. More [sophisticated methods](https://eprint.iacr.org/2009/226.pdf) exist, but we won’t dive into further detail. The point is that we can expand the _definition_ of what a hash function is, by letting it _hash into_ some arbitrary set $A$, like this:

$$
H: \{0,1\}^* \rightarrow A
$$

Again, the way in which this is achieved is irrelevant to us, and we’re mostly concerned about what _properties_ the algorithm has — is it _collision resistant_? Is it _irreversible_?

---

## The Weakest Link

Let’s go back to the digital signature (ECDSA) scheme from the [previous article](/en/blog/cryptography-101-encryption-and-digital-signatures/#digital-signatures). We now know that the message M can be processed into a number through the use of a hash function, $H(M)$.

<figure className="my-8">
  <img
    src="/images/cryptography-101/hashing/hashing-example.webp" 
    alt="Another hashing function visual" 
    className="bg-white"
  />
</figure>

We also said that the security of the digital signature lies on how hard it is to calculate the validation “key” $s$. But _hashing_ introduces a new problem. And we’ll explain by means of an example.

> Charlie wants to tamper with the original message $M$. Evidently, changing the message will change the hash $H(M)$, and this renders the signature invalid.
>
> However, if $H$ happens to be a hashing function where it’s easy to find collisions, then Charlie could produce a new message $M’$ by changing the bank account to his, and then play around with the amount until the hash of the new message matches the original, $H(M’) = H(M)$.

And boom! Just like that, Charlie has fooled our security. In this particular application, a non-collision-resistant hashing function would _break the algorithm_ completely.

Firstly, this is a clear example that not every hashing function is suitable for every application. And secondly, the security of any scheme or protocol we can think of will be limited by its weakest part. There’s a wise proverb that says “a chain is no stronger than its weakest link”. And that certainly applies here.

<figure className="my-8">
  <img
    src="/images/cryptography-101/hashing/chain.webp" 
    alt="Image of a chain with a clipper" 
  />
  <figcaption className="text-center text-sm text-gray-500 mt-2">
    “A chain is no stronger than its weakest link”
  </figcaption>
</figure>

So yeah, it’s important to keep these things in mind when designing cryptographic techniques. You should always analyze the security of each component of your protocol, and not just focus on one aspect of it.

> If you want more insights on security-related matters, try reading [this aside](/en/blog/cryptography-101-aside-evaluating-security) in the series.

---

## Merkle Trees

Before rounding up, I want to talk about an important hash-based data structure, which is essential in Blockchain development: [Merkle trees](https://www.baeldung.com/cs/merkle-trees).

In essence, it’s just a tree structure where the information contained in each node, is just the hash of the children nodes. Like this:

<figure className="my-8">
  <img
    src="/images/cryptography-101/hashing/tree-nodes.webp" 
    alt="Node construction in Merkle trees" 
    className="bg-white"
  />
  <figcaption className="text-center text-sm text-gray-500 mt-2">
    A node of a Merkle tree
  </figcaption>
</figure>

Repeating this pattern will lead to a tree structure:

<figure className="my-8">
  <img
    src="/images/cryptography-101/hashing/merkle-tree.webp" 
    alt="A Merkle tree" 
    className="bg-white"
  />
</figure>

All this does is reduce (possibly) a lot of information into a single hash, which is the _root_ of the tree. But wait, doesn’t a hash function do the _same thing_? If we just hash:

$$
h = H(A || B || C || D || E || F || G || I)
$$

We also obtain a _single hash_ associated with the _same information_. Changing a single bit in any of the original inputs causes dramatic changes in the produced hash. Then... _Why bother_ creating a weird tree structure?

> By the way, the $$||$$ operator means [bit concatenation](https://csrc.nist.gov/glossary/term/concatenation). It’s just pasting the bits of the inputs together. So for example if $A = 0101$ and $B = 1100$, then $A || B = 01011100$.

As it turns out, using a tree unlocks _new superpowers_. Imagine this situation: someone (let’s say Andrew) claims that $h$ corresponds to the input $A$, but doesn’t want to reveal the other inputs $(B, C, D...)$. How can we check if $A$ effectively produces $h$?

Our only option is to _hash the entire input_, and compare with $h$. And of course, for this, we need _all the original inputs_ used by Andrew. But he doesn’t want to share all the inputs, and sending a truckload of information (possibly _thousands of values_) over a network doesn’t sound very enticing...

### The Merkle Tree Solution

The strategy clearly becomes _inefficient_. Merkle trees allow for a more _elegant solution_. Imagine that Andrew has instead produced a Merkle root $R$ of all his inputs $(A, B, C...)$:

$$
R = Merkle(A, B, C...)
$$

He claims that $A$ is in the tree. How can he _prove_ this? And here’s where the magic happens: he can just send a _few nodes of the tree_ as proof, and we can check that $R$ is indeed produced with $A$. Take a look at this image:

<figure className="my-8">
  <img
    src="/images/cryptography-101/hashing/merkle-copath.webp" 
    alt="Merkle proof visualization, with only a few nodes needed for the proof" 
    className="bg-white"
  />
</figure>

See the nodes highlighted in _green_? That’s all the information we really need to _calculate the root_. See, we can calculate $m = H(a || b)$, and then $u = H(m || n)$, and finally $H(u || v)$, and we’re done. Instead of revealing all the _leaves_ of the tree $(A, B, C, D, E, F, G, I)$, we’re able to demonstrate that $A$ belongs to the tree by only revealing _three nodes_!

This system is known as a [Merkle proof](https://www.youtube.com/watch?v=2kPFSoknlUU). And a very neat thing about it is how nicely it _scales_. As it so happens, the number of nodes $N$ we have to reveal scales _logarithmically_ with the number of inputs:

$$
N = \textrm{log}_2(\#\textrm{inputs})
$$

So for 1024 inputs, we just have to reveal _10 nodes_. For 32768, _15 nodes_ will suffice.

<figure className="my-8">
  <img
    src="/images/cryptography-101/hashing/happy-seal.webp" 
    alt="A picture of a happy seal"
    width="620"
  />
  <figcaption className="text-center text-sm text-gray-500 mt-2">
    Soothing
  </figcaption>
</figure>

Merkle trees are one of the most used cryptographic data structures out there, powering Blockchains everywhere. There’s active research going on to possibly replace them with a new kid in the block, called the [Verkle tree](https://math.mit.edu/research/highschool/primes/materials/2018/Kuszmaul.pdf), but the idea is generally the same: proving something belongs to a dataset, without revealing the _entire dataset_.

This just goes to show how hashes can be utilized in clever ways to accomplish some quite magical feats!

---

## Summary

Slowly but surely, we’re building a solid cryptographic toolset. We now have _hashing_ at our disposal, along with groups, modular arithmetic, and elliptic curves. Sweet!

After this short detour from our development on elliptic curves, we’ll jump right back into the action in the [next article](/en/blog/cryptography-101-protocols-galore), and explore what else we can do with our current knowledge.
