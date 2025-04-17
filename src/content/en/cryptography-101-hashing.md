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
(10010100010111100)_2 = (75964)_10
$$

> Same number, expressed in different bases.

Just like that, hashing provides a solution to our problem: all we need is to run our message $M$ through a suitable hashing function. The output, $H(M)$, will be a _number_, just as we needed. Awesome stuff. Things are starting to click into place!

### Getting Elliptic Curve Points

When running a hashing function, the output will in general be a _binary number_ — another way to phrase this is to say that we _hash into_ an integer number. There are situations where this is not enough, though: we may require hashing into a* point on an elliptic curve*. In fact, we’ll be required to do this in the next article.

One possible way to hash into an elliptic curve is to calculate $h = H(M)$ normally, and compute a point $[h]G$ as our output, with $G$ being a generator of the elliptic curve. More [sophisticated methods](https://eprint.iacr.org/2009/226.pdf) exist, but we won’t dive into further detail. The point is that we can expand the _definition_ of what a hash function is, by letting it _hash into_ some arbitrary set $A$, like this:

$$
H: \{0,1\}^* \rightarrow A
$$

Again, the way in which this is achieved is irrelevant to us, and we’re mostly concerned about what _properties_ the algorithm has — is it _collision resistant_? Is it _irreversible_?

---

## The Weakest Link

Let’s go back to the digital signature (ECDSA) scheme from the previous article. We now know that the message M can be processed into a number through the use of a hash function, $H(M)$.
