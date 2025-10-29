---
title: Elliptic Curves In-Depth (Part 10)
author: frank-mangone
date: '2025-10-28'
thumbnail: /images/elliptic-curves-in-depth/part-10/1*klTDp0fQcQHrUK43VREKMQ-4.png
tags:
  - ellipticCurves
  - algorithms
  - secp256k1
  - ed25519
  - bls12381
description: >-
  To wrap up the series, we take a look at a few practical aspects, and present
  some of the most studied elliptic curves out there.
readingTime: 16 min
contentHash: c5965285bfb55521098027fdd7724dda0c419cf29ed6a72fd5a89df5fed7dd05
supabaseId: 48dd1bfc-98ae-4ec7-b696-9cb32f86b8c9
---

I reckon getting here must have not been easy, my dear reader.

We've gone through [nine full articles](/en/reading-lists/elliptic-curves-in-depth) of elliptic curve theory, spanning topics from the very basics, to some real freakin' abstract stuff (looking at you, divisors).

It's about time we get more acquainted with some **practical aspects**. In particular, what I think the series is missing is to present some of the **actual curves** that are used in the most common algorithms out there.

In doing so, we'll cover some cool concepts that we haven't had the chance to look at yet, and that will nicely wrap up our journey into elliptic curves.

We're almost there! Stay strong, only a short sprint remains.

---

## The SECP Family

Our story today begins with a **family** of curves that is among the most widely deployed and used in the world. In fact, your browser most likely used one of them when it connected to this site!

> The name comes from the document where they were defined, the [Standards for Efficient Cryptography](https://www.secg.org/sec1-v2.pdf). And the $p$ has to do with the prime field over which the curve is defined.

Since they are so ubiquitous, they are a good place for us to get started. There are multiple variants available, but we'll just look at one of them here.

### The Bitcoin Curve

The curve [secp256k1](https://en.bitcoin.it/wiki/Secp256k1) is the one both Bitcoin and Ethereum use.

It's actually a really simple curve. Its Weierstrass form is just:

$$
y^2 = x^3 + 7
$$

However, we know full well that defining an elliptic curve is not just a matter of specifying its formula: we also need to define the **prime field** over which we'll be operating, and we need to find a **suitable generator** of a large cyclic subgroup.

Let's start with the prime field. Here:

$$
p = 2^{256} — 2^{32} — 2^9 — 2^8 — 2^7 — 2^6 — 2^4 — 1
$$

My first reaction when looking at that number was "huh, that's oddly specific". It's the kind of number that makes you suspect something deeper is going on, or at least that's how I personally felt about it.

Of course, there's a good reason for this particular structure. The number itself belongs to a family called the [Solinas primes](https://en.wikipedia.org/wiki/Solinas_prime) (or **generalized Mersenne primes**), and their main advantage is that they enable **fast modular reduction**, at least when compared with some random 256-bit prime.

> As a rough sketch of how this works, notice that we can express $p$ as $2^{256} - c$, with $c$ being a "tiny" constant when compared to $p$ itself. With this, it's easy to see that $2^{256} mod p = c$.
>
> So the strategy is the following: split any big number you want to reduce (say, 512 bits) into **high bits** ($x_h$) and **low bits** ($x_l$). We can represent such separation for an arbitrary number $x$ as $x = x_h.2^{256} + x_l$. When we apply $\textrm{mod} \ p$ to the expression, we get something fantastic: $x mod p = x_h.c + x_l$.And since $c$ is small (and also has a sparse binary representation, but let's not worry about that now), this operation is super fast!

Prime field, check! Now we turn our attention to the group structure, starting with its **order** (number of elements), which is this little number here:

$$
n = 2^{256} — 432420386565659656852420866394968145599
$$

What's special about that, you might ask? Hear this: it's a **prime number**. And you know what that means? Thanks to [Lagrange's theorem](<https://en.wikipedia.org/wiki/Lagrange%27s_theorem_(group_theory)>), we're sure the whole group is a **single cyclic group**, where every non-identity point generates the group entirely.

<figure>
	<img
		src="/images/elliptic-curves-in-depth/part-10/1*klTDp0fQcQHrUK43VREKMQ-4.png"
		alt="Satisfying meme"
		title="Ahhh nice"
	/>
</figure>

From a security perspective, this is **ideal**. The presence of other smaller subgroups opens the door to some attack vectors, such as the well-known [Pohlig-Hellman algorithm](https://en.wikipedia.org/wiki/Pohlig%E2%80%93Hellman_algorithm).

So, in theory, we could pick any point as a generator. Only for compatibility purposes, a "standard" generator was selected as another parameter of the curve.

> You can check its value [here](https://en.bitcoin.it/wiki/Secp256k1).

Finally, there's one more little thing worth mentioning about secp256k1 — and it's about that $k$ in its name.

Secp256k1 also belongs to a family of curves called **Koblitz curves**. The defining characteristic of this family is that they have an **efficiently computable endomorphism**. There's [a lot of material](https://link.springer.com/rwe/10.1007/978-1-4419-5906-5_872) if you want to get deeper into this topic, so I'll just give you a rough idea of what it's about.

An endomorphism is, as we've [already mentioned](/en/blog/elliptic-curves-in-depth/part-4/#the-endomorphism-ring), a function that maps $E$ (the curve) onto itself. So what we have essentially is a map $\phi$ that acts on curve points, satisfying $\phi (P) = \lambda P$ for some constant $\lambda$.

This matters because it enables **faster scalar multiplication** using a method called the [Gallant-Lambert-Vanstone decomposition method](https://dl.acm.org/doi/10.1007/978-3-319-12087-4_13) (or GLV for short).

Instead of using the standard double-and-add multiplication to find $[k]P$, you can decompose the scalar $k$ into **two smaller scalars** ($k_1$ and $k_2$) such that:

$$
[k]P = [k_1]P + [k_2]\phi(P)
$$

Both multiplications can be computed in parallel, and then added together.

The speedup is actually **quite significant** — roughly 25–30% faster than standard scalar multiplication. For systems performing millions of ECDSA operations, this adds up. However, implementing GLV correctly is tricky and can introduce side-channel attacks (timing) if not done carefully.

In practice, many libraries don't bother with it. But for high-performance scenarios (like blockchain nodes validating thousands of signatures per second), the GLV endomorphism can be a valuable optimization.

All these special characteristics might be the reason the mysterious figure that is Satoshi Nakamoto chose secp256k1 over more standard options, like [secp256r1](https://www.nervos.org/knowledge-base/what_is_secp256r1). It's simple, and it's fast when you need it to be. Some also speculate that Nakamoto also avoided [NIST](https://www.nist.gov/) curves (a.k.a. the standard ones) in fear that they may have potential backdoors.

> Especially after the [Dual_EC_DRBG controversy](https://en.wikipedia.org/wiki/Dual_EC_DRBG).

We might never really know. What we do know is that this little curve, with all its hidden tricks, is responsible for securing hundreds of billions of dollars worth of cryptocurrencies. At least in the short term, it's not going anywhere!

---

## Alternative Forms

Up until now, we've conceptualized and presented curves in their short Weierstrass form:

$$
y^2 = x^3 +ax + b
$$

This is the "standard" representation. It's what most people think of when they hear "elliptic curve". But this isn't the **only** form an elliptic curve can take, as we alluded to back in the [first article of the series](/en/blog/elliptic-curves-in-depth/part-1/#but-why-elliptic-curves).

In fact, we mentioned a couple more forms back then, one of which I want to formally present to you now. Meet the **Montgomery form**:

$$
By^2 = x^3 + Ax^2 + x
$$

> It's different, but at the same time, it's not that unfamiliar. After all, there's only so many ways you can write third degree polynomials!

We've now got a coefficient for $y^2$, and a new $x^2$ term. Overall, the change doesn't seem very dramatic.

One curve that's defined in this form is [Curve25519](https://en.wikipedia.org/wiki/Curve25519), whose equation is:

$$
y^2 = x^3 + 486662x^2 + x
$$

and is defined over the prime field with $p = 2^{255} - 19$.

Much like in the case of secp256k1, that prime deserves a moment of appreciation. It's a very simple number, and it's also a pseudo-Mersenne prime. This helps making modular arithmetic fast, using similar techniques to the fast modular reduction presented before.

I know what you're thinking at this point. Hey Frank, **why a different form**? What does it change?

Montgomery forms have a beautiful property with very interesting implications: scalar multiplication **only requires using x-coordinates**. The explicit formula for point doubling looks like this:

$$
x_{[2]P} = \frac{({x_P}^2 — 1)^2}{4x_P({x_P}^2 + Ax_P + 1)}
$$

Point addition is a bit trickier. While it can be done with x-coordinates only, everything really comes together as an algorithm called the Montgomery ladder, which we shall see in a minute.

Before that, let's talk about the **major advantages** of only having to track one coordinate:

- In terms of speed, we roughly have **half the data** to process. This makes the Montgomery ladder about **twice as fast** as regular Weierstrass multiplication.
- **Bandwidth** also benefits from this form, because we only need to send the x-coordinates (32 bytes for Curve25519) instead of full points. This is actually what the protocol [x25519](https://cryptography.io/en/latest/hazmat/primitives/asymmetric/x25519/) (Diffie-Hellman key exchange) does.
- Finally, there's the fact that the Montgomery ladder algorithm is very regular in its execution, meaning that the number of operations it performs does not depend on patterns in the scalar being used for the multiplication. This makes it naturally resistant to a type of attack called [timing attacks](https://en.wikipedia.org/wiki/Timing_attack), which attempt at guessing something about the scalar by measuring the **time** it takes to execute an algorithm.

> And Weierstrass implementations have historically struggled with that.

It sounds fabulous. So what's this magical algorithm about?

### The Montgomery Ladder

Actually, the algorithm is **beautifully simple**.

To compute $[k]P$, you need to keep track of just two values: $R_0$ and $R_1$. These points will satisfy a particular **invariant**: $R_1 - R_0 = P$. We'll see why this is important in just a minute.

Starting with $R_0 = \mathcal{O}$ (represented as $x = 0$ in Montgomery forms) and $R_1 = P$, we go through $k$ bit by bit. This is, we take the **binary** representation of $k$, and then traverse its digits from least significance to most significance, performing these updates:

- If the bit is 0: $R_1 \leftarrow R_0 + R_1$, then $R_0 ← 2R_0$
- If the bit is 1: $R_0 \leftarrow R_0 + R_1$, then $R_1 ← 2R_1$

We can see a couple things right off the bat. First, the invariant **does indeed hold** — you can check that yourself via a couple examples. Secondly, both branches do **exactly one addition and one doubling**. The execution pattern is identical, and what changes is which variable gets each update. This is the constant-time property we mentioned earlier, and the reason why timing attacks are resisted.

Finally, we need to deal with addition — and this is where the magic happens. The explicit formula for addition of two points $U$ and $V$ is this one:

$$
x_{U+V} = \frac{(x_U x_V — 1)^2}{(x_U — x_V)^2.x_{U - V}}
$$

Something should catch your eye immediately: we need the x-coordinate of the point $U - V$. Under normal circumstances, this wouldn't make much sense — an addition that depends on another addition (subtraction is just addition $-V$) seems like an impossible loophole, and a recipe for disaster.

But this is where our **invariant** comes in: when adding $R_0$ and $R_1$, we know exactly what that difference is: $P$!

Quite fascinating, isn't it?

### What About the Rest?

Right. That algorithm looks cool and all. But what about all the group law stuff we defined so carefully? Or even worse, what about all that divisor theory we went through? Does that no longer matter?

<figure>
	<img
		src="/images/elliptic-curves-in-depth/part-10/1*BzB3oSdSPSGw6rir0aXDWA-11.png"
		alt="Crying on floor" 
	/>
</figure>

Don't panic — of course it does!

The Montgomery form is just a different way to represent curves that could also be written in Weierstrass form. In fact, there's a **transformation** that allows one system to be converted into the other, and vice versa.

> Try it yourself: you can convert from Montgomery form to Weierstrass form by using the map $(x,y) \mapsto (x/B + A/3B, y/B)$. The other way around is a bit trickier, but this should be enough to convince you!

Said transformation is essentially a **change of coordinates** — a birrational map that preserves the algebraic structure of the curve. The group law remains the same, the divisors remain the same, and the fundamental properties we've studied all hold.

> It's analogous to describing the same geometric object in Cartesian coordinates versus polar coordinates. The object itself doesn't change — you're just looking at it differently.

So those line intersections that define point addition? Still there.

The divisors? Still there.

The group structure? Still there.

Montgomery forms simply allow for more efficient scalar multiplication. The theory doesn't change — only the computation does.

---

## Edwards Curves

Curve25519 is great for protocols that make heavy use of scalar multiplication, such as [Diffie-Hellman key exchange](/en/blog/cryptography-101/protocols-galore/#key-exchange). But this doesn't mean they are a silver bullet.

For example, [digital signature algorithms](/en/blog/cryptography-101/encryption-and-digital-signatures/#digital-signatures) require addition of points rather than scalar multiplication. Ideally, we also need fast verification and uniform execution time irrespective of the operations being performed.

In this setting, Montgomery curves struggle, as addition only makes sense when we have an invariant.

As for the Weierstrass form, the problem is that we need a **complete addition formula** — in other words, one that works exactly the same for all point types. Because of the existence of a little pesky point called the **point at infinity** ($\mathcal{O}$), this is simply not possible in Weierstrass form.

We're gonna need an alternative here. And this is where **twisted Edwards forms** enter the scene.

### The Twisted Edwards Form

A **twisted Edwards** curve equation looks like this:

$$
ax^2 + y^2 = 1 + dx^2y^2
$$

<figure>
	<img
		src="/images/elliptic-curves-in-depth/part-10/1*IMEgb2b6DAixSIWEQ8VX-Q-13.png"
		alt="A plot of a twisted edwards curve" 
		title="They look weird when plotted!"
	/>
</figure>

Before any confusions arise, I must clarify: **twisted** here has nothing to do with **curve twists,** like the ones we discussed [previously in the series](/en/blog/elliptic-curves-in-depth/part-4/#twists). It's just kind of an unfortunate naming choice.

**Twisted Edwards** is simply the name of this curve form, distinguishing it from the original Edwards curves proposed by Harold Edwards in 2007 (which had $a = 1$). The "twisted" just means we've added the parameter $a$ to **generalize** the original form

With that out of the way, we can focus on the things this form has to offer.

The standout feature of twisted Edwards curves is, as previously hinted, their **complete addition formula**. In twisted Edwards form, point addition is given by:

$$
(x_1, y_1) + (x_2, y_2) = \left(\frac{x_1y_2 + y_1x_2}{1 + dx_1x_2y_1y_2}, \frac{y_1y_2 — ax_1x_2}{1 — dx_1x_2y_1y_2}\right)
$$

Take a close look at this formula. Notice anything interesting?

At first glance, maybe not. But what if I told you to try adding $P$ to itself? The formula seems to hold up well. And what about the identity? In this coordinate system, the identity is the point $(0,1)$ — you can check for yourself —, and the above formula also works.

That's exactly the power of addition on twisted Edwards curves: there are **no special cases**. The formula is complete in the sense that it **just works** for all inputs!

Contrast this with the Weierstrass form, where we had to handle several different cases:

- If $P = \mathcal{O}$, then $P + Q = Q$
- If $Q = \mathcal{O}$, then $P + Q = P$
- If $P = -Q$, then $P + Q = \mathcal{O}$
- If $P = Q$, use the tangent line (point doubling)
- Otherwise, use the line through $P$ and $Q$

That's **five different cases** that need to be checked and handled separately, and two of those require different formulas.

Having a single, complete formula has some advantages:

- The most obvious is its **simplicity**. Fewer branches means fewer opportunities for bugs. When dealing with cryptographic code where a single mistake can be a catastrophe, this simplicity is nothing short of **invaluable**.
- Secondly, since we always execute the same operation, we get **constant-time execution**. Much like Montgomery curves, this provides resistance against timing attacks.
- Lastly, the formula is **symmetric** and **efficient** for both operands. For signature verification especially, where you're computing linear combinations of points (something like $[s]G + [h]P$), having fast, uniform additions makes a real difference.

The trade-off when compared with Montgomery curves is what you'd expect: scalar multiplication is not as fast. But that's completely fine — and which curve we choose largely depends on the type of protocols we'll be using them for.

### Ed25519

One of the most widely used twisted Edwards curves is [Ed25519](https://neuromancer.sk/std/other/Ed25519), which has the form:

$$
-x^2 + y^2 = 1 — (121665/121666)x^2y^2
$$

> Careful! That division right there is modulo p!

The curve is defined over $p = 2^{255} - 19$. And that's a **familiar value** — it's the same one we used in Curve25519.

This is no coincidence. In fact, Ed25519 and Curve25519 are [birrationally equivalent](https://en.wikipedia.org/wiki/Birational_geometry) — they're the same underlying algebraic curve, but represented in different coordinate systems.

> Like the relation we already saw between Montgomery and Weierstrass forms!

Because we can essentially use the same curve in both forms, we can optimize for our use case and still preserve the security guarantees offered by the curve. It's even possible to transform points between forms, in rare cases where we need both fast addition and fast scalar multiplication.

And I think that's awesome!

---

## Pairing-Friendly Curves

To wrap things up, let's briefly talk about curves designed **specifically for pairings**.

> If you haven't read the previous articles on pairings in this series, I strongly suggest doing so before jumping onto this next section!

When designing this type of curve, there are some extra requirements we need to take into account, such as:

- We need a prime-order subgroup of size $r$.
- We need to have an embedding degree $k$ such that $r$ divides $q^k - 1$, where $k$ is small enough for efficiency but large enough for security.
- And some other conditions we haven't discussed at all, like guaranteeing **twist security**.

Finding curves that satisfy these conditions is **not an easy task**. For instance, if you pick some random curve, chances are the embedding degree is **very large** — close to the group order, actually — which renders pairings on those curves completely impractical.

> To make this point absolutely clear, remember that we're performing operations on field extensions. The embedding degree tells us how many elements of the base field we need to store to represent a **single element** in the extension. And as $k$ grows, operations become **exponentially more expensive**, to the point of being absolutely impossible to manage.

So how do we go about finding these elusive curves?

### Complex Multiplication Method

The main technique for constructing pairing-friendly curves is called the **Complex Multiplication (CM) method**.

Rather than generating random curves and praying they have the right properties, the CM method **works backwards**: we specify the properties we want (embedding degree, security level, etc.) and solve a certain problem to find curve parameters that achieve those goals.

Said problem comes from an area we haven't really explored in depth, though we did mention a couple things about it: the study of [endomorphisms on elliptic curves](/en/blog/elliptic-curves-in-depth/part-4/#the-endomorphism-ring).

Some curves have more endomorphisms available than just standard scalar multiplication, and the Frobenius endomorphism (and its powers). When this happens, the curve is said to be equipped with **complex multiplication.**

> It's called like that because we might find an endomorphism that satisfies a condition like $\psi ^2 + D = 0$ (in the endomorphism ring). This is analogous to the complex number $i$ satisfying $i^2 + 1 = 0$, hence the naming!

This only happens if the curves satisfy a **special relationship** (the CM equation), given by:

$$
4q = t^2 — Dy^2
$$

Where $q$ is the field size, and $t$ is the [trace of Frobenius](https://crypto.stanford.edu/pbc/notes/elliptic/count.html) — which is simply defined as this difference:

$$
t = q + 1 — \#E(\mathbb{F}_q)
$$

Having an extra constraint is actually **beneficial** in this case: it means we can **systematically search** for curves with the properties we need.

The procedure roughly goes like this:

1. Choose your target embedding degree $k$.
2. Pick a small discriminant $D$. Smaller $D$ values are easier to work with, and they typically take values like $D = 1, 2, 3, 7, 11$, etc.
3. Solve the CM equation for different values of $y$, getting pairs $(q, t)$.
4. Check if $q + 1 - t$ has a large prime factor $r$. This will guarantee the existence of a subgroup of order $r$.
5. Verify that $r$ divides $q^k - 1$. This ensures the embedding degree is exactly $k$ (or a divisor of $k$).
6. Check that $q$ is prime (or a prime power). Recall that $q$ defines our field.

If we can manage to meet all these conditions, then we will have stumbled upon a pairing-friendly curve! Easy, right?

<figure>
	<img
		src="/images/elliptic-curves-in-depth/part-10/0*V1UgdlFRjHAVd-oY-18.jpg"
		alt="Confused squidward" 
	/>
</figure>

> Notice that the curve equation itself (the $a$ and $b$ values in $y^2 = x^3 + ax + b$) can then be chosen somewhat freely, as long as the curve has the correct number of points (to get the required trace of Frobenius).

This is really just the tip of the iceberg on this topic. We won't go into any further detail, as it is a very deep rabbit hole leading into [algebraic number theory](https://en.wikipedia.org/wiki/Algebraic_number_theory) and [class field theory](https://en.wikipedia.org/wiki/Class_field_theory).

> I'd love to say "and that's well above my paygrade", but I do this for free, so...

Also, we need to know how to [count points on a curve](https://en.wikipedia.org/wiki/Counting_points_on_elliptic_curves) — another interesting endeavor to pursue that I leave up to your curiosity.

And on top of that, we're interested in other properties, such as twist security, efficient arithmetic, and avoiding certain attack vectors. In short:

::: big-quote
Finding pairing-friendly curves is really hard
:::

For this reason, cryptographers have opted for defining some **parametric families** rather than solving the CM problem every single time. These are formulas that generate suitable curves for any required security level — kind of a curated shortcut, if you will. Some of the most important ones include:

- **Barreto-Naehrig (BN)**: $k = 12$, highly efficient.
- **Barreto-Lynn-Scott (BLS)**: $k = 12$, $24$, or $48$, and better security than BN.
- **Kachisa-Schaefer-Scott (KSS)**: $k = 18$, middle ground between efficiency and security.

Which are the methods used to derive some of the most widely used pairing-friendly curves, among which we can find BLS12–381 and BN254.

At the time of writing this, BLS12–381 is the current **gold standard** for pairing-based cryptography. It comes from the BLS family with $k = 12$, defined over a 381-bit prime field. The curve equation is really simple:

$$
y^2 = x^3 + 4
$$

It's used by giants like **Ethereum 2.0**, **Zcash**, **Filecoin**, and it's also used in most modern zero-knowledge proof systems.

---

## Summary

So yes — while we have gone through a lot of theory, I want us to stop for a moment and appreciate how much more there's still to discover.

> In fact, most of the things we defined for elliptic curves can be generalized to the study of [algebraic varieties](https://en.wikipedia.org/wiki/Algebraic_variety).

In summary, elliptic curves are beautiful structures that hide an astounding level of complexity behind a seemingly harmless facade.

They bring together different areas of mathematics with incredible grace, and strike a fantastic balance between computational efficiency and security.

Because of the threat of quantum computers, it's believed that elliptic curve cryptography will be obsolete soon, and will be replaced by the current surge of post-quantum algorithms being tested and developed. In the short term though, ECC isn't likely to go anywhere, and probably in the same way we still see RSA being used today, I'm willing to bet it's gonna stick around for a good while.

---

That's gonna be it for this series!

I don't consider myself an expert in the subject. In fact, I've probably learned as much as you have in the making of these articles, since each of them has taken a lot of research effort, especially on those times when I felt the ideas weren't completely clicking in my head.

My hope is that you've found this material useful, and perhaps even fun and engaging. And if you find the topic interesting, I'd like to encourage you not to stop here — there are fantastic books with a much, much deeper covering of elliptic curves out there.

And if anything, you know where to find me!

Cheers!
