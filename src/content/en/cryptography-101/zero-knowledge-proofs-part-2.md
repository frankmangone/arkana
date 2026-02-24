---
title: 'Cryptography 101: Zero Knowledge Proofs (Part 2)'
date: '2024-06-25'
author: frank-mangone
thumbnail: /images/cryptography-101/zero-knowledge-proofs-part-2/pikachu.webp
tags:
  - cryptography
  - zeroKnowledgeProofs
  - mathematics
  - polynomials
  - arithmeticCircuits
  - plonk
  - snark
description: >-
  This second round of zero knowledge proofs will take us on a journey to
  understand a more general framework. Hang tight!
readingTime: 17 min
mediumUrl: >-
  https://medium.com/@francomangone18/cryptography-101-zero-knowledge-proofs-part-2-9e14467ed0be
contentHash: 63d049ab554f181cb3d145026112b0987b4827dc3812d99971abb1d105399680
---

> This is part of a larger series of articles about cryptography. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/cryptography-101/where-to-start).

In the past few articles, we've covered a lot of **building blocks**. It's time to finally combine all these lego pieces into a protocol. Hooray!

Remember, the reason we made such an effort to understand these moving parts was to try and build a **general framework** for zero knowledge proofs — because, as we saw, creating a protocol for a specific application was somewhat impractical, requiring **specific** research.

We're now ready to introduce a family of **knowledge proofs** that utilizes every element we've preemptively defined: **SNARKs**.

Specifically, we'll be looking at a scheme called **Plonk**. For a full disclosure of the technique, go [here](https://eprint.iacr.org/2019/953.pdf). I'll try my best to explain this as precisely as possible. Moreover, this is not the only protocol that qualifies as a **SNARK** out there. Other mechanisms such as [Groth16](https://www.rareskills.io/post/groth16), [Marlin](https://eprint.iacr.org/2019/1047.pdf), and [Halo](https://eprint.iacr.org/2019/1021.pdf) exist. I might tackle those in the future, but for now, I'll just leave a couple links here in case you want to follow your curiosity!

### Disclaimer

This article is gonna be **long**, and honestly, **complex**. As in, probably **harder than usual**. There's only so much I can do to simplify the explanation for a protocol that is **pretty darn complex**.

But, if I had to put this entire process into a single phrase, it would be:

::: big-quote
In Plonk, we encode the computation of a circuit into a series of polynomials, which represent the constraints imposed by the circuit, for which we can prove statements by using a series of tests, without ever revealing the polynomials themselves — and thus, not leaking the secret inputs.
:::

Getting to fully understand this will be a **wild ride**. And there are several elements that we'll need to cover. Here's an overview of the plan, which doubles up as a sort of **table of contents**:

- [Circuits as sets of constraints](/en/blog/cryptography-101/zero-knowledge-proofs-part-2/#revisiting-circuits)
- [Encoding the circuit into polynomials](/en/blog/cryptography-101/zero-knowledge-proofs-part-2/#encoding-the-circuit)
- [Listing the requirements for verification](/en/blog/cryptography-101/zero-knowledge-proofs-part-2/#verification-requirements)
- [Techniques for verification](/en/blog/cryptography-101/zero-knowledge-proofs-part-2/#interactive-oracle-proofs)
- [Verification](/en/blog/cryptography-101/zero-knowledge-proofs-part-2/#back-to-verification)

> Also, I'm assuming you already checked out the article about [polynomial commitment schemes](/en/blog/cryptography-101/commitment-schemes-revisited), and also the one about [arithmetic circuits](/en/blog/cryptography-101/arithmetic-circuits). If you haven't, I strongly recommend reading them!

Without further ado, here we go!

---

## What is a SNARK?

The acronym stands for **S**uccint **N**on-interactive **AR**guments of **K**nowledge. In plain english: a mechanism to prove **knowledge** of something, that's **succint** (or short, or small) and **non-interactive**. There are a couple things that we need to dissect here, to better understand the goal of the construction:

- **Succint** means that whatever proof we produce must be small in size, and fast in evaluation time.
- **Non-interactive** means that upon receiving the proof, the verifier will not need any further interaction with the prover. More on this later.
- Finally, we say that this is a **knowledge proof**, but not necessarily a zero knowledge proof (although it **can** be). In particular, **Plonk** qualifies as zero knowledge because of how it's constructed.

Fret not — we cannot build our SNARK yet. We'll need to cover a few concepts first.

---

## Revisiting Circuits

In the previous article, we saw how [arithmetic circuits](/en/blog/cryptography-101/arithmetic-circuits) were a nice way to represent a computation. And how they allowed the crafting of recipes for **validation** of statements.

And so, the prover's goal will be to try and convince a verifier that they know some **secret value** $x$ — really, a **vector** of values — such that:

$$
\exists \ x \in {\mathbb{F}_p}^m \ / \ C(x,w) = 0
$$

> This reads: "there exists some vector $x$ whose elements are in the finite field $\mathbb{F}_p$, such that $C(x, w) = 0$, where $w$ is publicly known.

The prover doesn't want to reveal $x$, but also, we don't want the verifier to run the expensive computation of the circuit. And so, what will really happen is that the prover will **evaluate** the circuit, and then somehow **encode** both the inputs, and the results for each of the gates — also called the **computation trace**.

Here's an example evaluation, using the field $\mathbb{F}_{113}$:

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/circuit-example.webp" 
    alt="A small circuit example"
    title="[zoom] Remember that we're working with modulo p = 113 in this case"
    className="bg-white"
  />
</figure>

And we could think of this evaluation as the following trace, visualized as a table:

|        | $w_1$ | $x_1$ | $x_2$ |
| ------ | ----- | ----- | ----- |
| inputs | 20    | 13    | 5     |

|        | left input | right input | output |
| ------ | ---------- | ----------- | ------ |
| gate 0 | 5          | 20          | 100    |
| gate 1 | 13         | 100         | 0      |

The fantastic idea behind modern SNARKs, including **Plonk**, is to encode this trace as **polynomials**, which will ultimately allow a verifier to check that the computation is valid. Valid here means that a specific set of **constraints** are followed. Namely:

- That each gate is **correctly evaluated**
- That **wires** with the same origin have the **same value**

By wire, I mean the **connections between gates**, or connections from inputs to gates, in the circuit. We can think of these wires as holding the values of the circuit, instead of the nodes themselves:

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/wires.webp" 
    alt="A circuit showing wire values"
    title="[zoom]"
    className="bg-white"
  />
</figure>

Here, you can see that some of these wires should hold the same value: $W_0$, $W_1$, and $W_2$ — and also $W_4$ and $W_5$. Additionally, **gates** should make sense — meaning that, for instance, $W_0 + W_1$ should equal $W_4$.

> A circuit can be either a recipe for computation, or a set of constraints to check!

Each of this sets of constraints — wire values, gate constraints, and wiring constraints — , will be encoded in **different polynomials**.

For example, the entire computation trace can be encoded into a single polynomial $P$, where $P(x_i)$ corresponds to one wire.

$$
P(x_i) = W_i
$$

We have the wire values $W_i$, but we need to choose to which values $x_i$ we encode them. Using some integers is a perfectly valid option — you know, the set $\{0,1,2,3…,N\}$. But there’s a lot to gain from using the **roots of unity** of our field $\mathbb{F}_p$ instead.

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/toast-huh.webp" 
    alt="A toast, confused"
    title="Huh?"
    width="300"
  />
</figure>

### Roots of Unity

I mentioned [this concept before](/en/blog/cryptography-101/polynomials/#interpolation-revisited), but dodged having to explain any further like Neo in Matrix.

<video-embed src="https://www.youtube.com/watch?v=ODmhPsgqGgQ&t=20s" />

I think now is good time to zoom in a bit, so that we can better understand the notation coming ahead.

So, yeah, time for some definitions. We call a value $\omega$ (the greek letter **omega**) a $k-th$ **root of unity** of the field $\mathbb{F}_p$ if:

$$
\omega^k = 1
$$

In this case, the set $H$:

$$
H = \{1, \omega, \omega^2, \omega^3, ..., \omega^{k-1}\} \subseteq \mathbb{F}_p
$$

doubles up as a **cyclic multiplicative** [group](/en/blog/cryptography-101/where-to-start/#groups), generated by $\omega$:

$$
H = \langle \omega \rangle
$$

There are two nice things about using elements of this set as the inputs to our **encoding polynomial** $P(X)$. First, moving from one root of unity to the next, is as simple as** multiplying by** $\omega$. Likewise, moving backwards is done by multiplying by the _inverse_ of $\omega$. And it wraps **all the way around** - by definition:

$$
\omega^{k-1}\omega = 1
$$

$$
\omega^{-1} = \omega^{k-1}
$$

Secondly — and this is the most important part — , using this set allows us to perform **interpolation** using the **most efficient algorithm** we know: the [Fast Fourier Transform](https://en.wikipedia.org/wiki/Fast_Fourier_transform). We won’t dive into how it works (at least not now!), but know that this improves interpolation time dramatically — meaning that proofs are faster to generate (than other methods for interpolation).

---

## Encoding the Circuit

Having said all this, it’s time to get down to business. Time to actually see how the computation trace is **encoded**.

Let’s denote the **number inputs** to our circuit by $|I|$, and the **number of gates** by $|C|$. With this, we define:

$$
d = 3|C| + |I|
$$

> Each gate has three associated values: two inputs, and one output. And this is why we use $3|C|$. Notice that this magic number $d$ happens to be **exactly** the number of values in the computation trace!

We’ll encode all these values into the $d-th$ roots of unity:

$$
H = \{1, \omega, \omega^2, \omega^3, ..., \omega^{d-1}\}
$$

But which root encodes to which wire? We need a plan!

- The $|I|$ inputs will be encoded using **negative powers** of $\omega$. For the input $\#j$, we use:

$$
P(\omega^{-j})
$$

- The **three wires** associated to each gate $k$, ordered as **left input**, **right input**, and **output**, will be encoded by the following values:

$$
P(\omega^{3k}), P(\omega^{3k + 1}), P(\omega^{3k + 2})
$$

If we look at our sample trace, we’d get something like this:

$$
P(\omega^{-1}) = 20, P(\omega^{-2}) = 13, P(\omega^{-3}) = 5
$$

$$
P(\omega^0) = 5, P(\omega^1) = 20, P(\omega^2) = 100
$$

$$
P(\omega^3) = 13, P(\omega^4) = 100, P(\omega^5) = 0
$$

With this, all the values in our computation trace are included in the polynomial. We just have to **interpolate**, and obtain $P(X)$, which will have degree $d - 1$.

### Gate Encoding

Gates present a complication: they can be either **addition** or **multiplication** gates. This means that proving that a gate is correctly evaluated, requires us to convey information about its **type**.

We do this via a **selector polynomial** $S(X)$. For gate $k$:

$$
S(\omega^{3k}) = 0 \ \textrm{or} \ S(\omega^{3k}) = 1
$$

When the gate $k$ is an **addition gate**, then $S(X)$ will take the value $1$, and if it is a **multiplication gate**, then it will take the value $0$. To make this simple to write, let’s just define:

$$
\alpha = \omega^{3k}
$$

And then construct the following expression:

$$
S(\alpha)[P(\alpha) + P(\omega \alpha)] + (1 - S(\alpha))P(\alpha)P(\omega \alpha) = P(\omega^2 \alpha)
$$

Don’t let the expression scare you — what’s happening is actually fairly straightforward. You see, either $S(\alpha) = 0$ or $1 - S(\alpha) = 0$. Because of this, **only one of the terms** containing $S(X)$ will be active for some gate $k$, and in consequence, this expression ties **inputs** ($P(\alpha)$ and $P(\omega \alpha)$) and **outputs** (encoded in $P(\omega^2 \alpha)$) of a gate, along with the **gate type**.

### Wiring Encoding

This one is the trickiest of the lot. As mentioned before, it may happen that some wires correspond to the **same value**, since they come from the **same source**, like this:

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/shared-sources.webp" 
    alt="Shared gate sources"
    title="[zoom]"
    className="bg-white"
  />
</figure>

What this means is that some of the values encoded into $P(X)$ need to **match**:

$$
P(\omega^a) = P(\omega^b) = P(\omega^c) = ...
$$

If we analyze the **entire circuit**, we’ll end up having a set of this kind of constraints:

$$
\left\{\begin{matrix}
P(\omega^{-1}) = P(\omega^1)
\\ P(\omega^{-2}) = P(\omega^3)
\\ P(\omega^{-3}) = P(\omega^0)
\\ P(\omega^2) = P(\omega^4)
\end{matrix}\right.
$$

> This is for the example above. But in general, the equalities may have more than $2$ members each

**Each one** of these must be somehow encoded, of course, into polynomials. They way we do this is quite interesting: for each constraint, we define a polynomial that **permutates** or **rotates** the subset of roots whose **evaluation should match**. So for example, if the condition is:

$$
P(\omega^p) = P(\omega^q) = P(\omega^r) = P(\omega^s)
$$

Then we define the subset:

$$
H' = \{\omega^p, \omega^q, \omega^r, \omega^s\}
$$

And using $H’$, we create a polynomial $W(X)$ that has the following behavior:

$$
\\ W(\omega^p) = \omega^q
\\ W(\omega^q) = \omega^r
\\ W(\omega^r) = \omega^s
\\ W(\omega^s) = \omega^p
$$

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/root-rotation.webp" 
    alt="Rotation of powers of the involved roots"
    title="[zoom] It essentially cycles through the subset. This is the part that gives Plonk its name, actually!"
  />
</figure>

Because $W(X)$ always returns “the next” element in $H’$, and since all the values of $P(X)$ should be equal for the roots on $H’$, the way we prove that the wiring constraint holds is by proving that:

$$
P(x) = P(W(x)) \forall x \in H'
$$

This has to be done for every element in $H’$, thus covering **all the equalities** in a single constraint.

---

Okay! That was certainly a lot. Nevertheless, we’ve already covered a lot of ground with this.

At this point, the prover has all these polynomials that encode the entire **computation trace**. What’s missing then? Only the most important part: **convincing a verifier that the trace is correct**. Once we understand how this happens, everything will finally be tied together.

---

## Verification Requirements

Of course, the verifier **doesn’t know** the polynomials we just talked about. In particular, it’s critical that they **never learn** the full $P(X)$. The reason for this is that, if they do get ahold of it, then they could easily **uncover** the secret information $x$, by calculating:

$$
P(\omega^{-j})
$$

> The ability to never reveal these values by using polynomials is what gives Plonk its zero knowledge properties!

If the verifier cannot know the polynomials, then how can we convince them of **anything**? Did we hit a dead end? Should we panic now?

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/pikachu.webp" 
    alt="Suspicious Pikachu"
    title="I suspect you already know this narrative trick"
  />
</figure>

While the verifier cannot ask for the full polynomials, they **for sure** can ask for single **evaluations** of them. They should be able to ask for **any value** of $P(X)$, $S(X)$, or the $W(X)$'s — meaning they should be able to **query any part** of the computation trace. Except for the secret inputs, of course.

> It’s at this point that our [PCSs of choice](/en/blog/cryptography-101/commitment-schemes-revisited) comes in handy: when requesting the value of $P(X)$ at some point $b$ (so, $P(b)$), the verifier can check that it’s correctly computed by checking it against a **commitment**! Noooice.

<video-embed src="https://www.youtube.com/watch?v=SAfq55aiqPc" />

Why would they do that, though? To check that the **constraints** hold, that is!

To be convinced that the computation trace is correct, the verifier needs to check that:

- The output of the **last gate** is exactly $0$ (this is a convention),
- The inputs (the public ones, or the **witness**) are **correctly encoded**,
- The **evaluation** of each gate is correct (either **addition** or **multiplication** holds),
- The **wiring** is correct.

The first one is easy — the verifier just asks for the output at the **last gate**, which is:

$$
P(\omega^{3|C| - 1}) = 0
$$

For the other checks though, we’ll need to sprinkle in **some magic** (as usual, at this point).

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/salt-bae.webp" 
    alt="Salt bae meme"
    title="I never really understood this guy, but hey, it makes for a good meme"
  />
</figure>

### The Last Sprinkles of Cryptomagic

We’ll need to sidetrack a little for a moment. Here’s a question: given some polynomial of degree **at most** $d$, and that is **not identically** $0$ (so $f(x) \neq 0$), how likely would it be that for a **random input** $r$ (sampled from the integers modulo $p$), we obtain that $f(r) = 0$?

Because the polynomial has degree at most $d$, it will have at most $d$ _roots_. Then, the probability that $f(r) = 0$ is exactly the probability that $r$ happens to be a **root** of $f$:

$$
\mathcal{P}[f(r) = 0] \leq d/p
$$

And provided that $p$ is sufficiently larger than $d$, then this is a **negligible value** (very close to zero). This is important: if we randomly choose some $r$ and obtain that $f(r) = 0$, then we can say **with high probability** that $f(x)$ is **identically zero** (the zero function)!

This is known as a **zero test**. It doesn’t seem to amount to much, but we’re gonna need this to make our **SNARK** work.

> There are a couple more checks that we can perform, namely an **addition check**, and a **product check**. This is already quite a lot of information to digest, so let’s skip those for now.

What interesting is that there are efficient **Interactive Oracle Proofs** to perform these tests.

Sorry... **Interactive WHAT**?

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/sanic.webp" 
    alt="Sonic brain melting"
    title="*Meltdown*"
  />
</figure>

---

## Interactive Oracle Proofs

I warned you this wasn’t gonna be easy! Just a little bit more, and we’re done.

**Interactive Oracle Proofs** (IOPs) are essentially a family of mechanisms, by which a prover and a verifier **interact** with each other, so that the prover can convince the verifier about the truth of a certain statement. Something like this:

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/iop.webp" 
    alt="Interactive Oracle Proof interaction diagram"
    title="[zoom]"
    className="bg-white"
  />
</figure>

> I hope you can already see how this picture looks similar to the one we used to describe [Polynomial Commitment Schemes](/en/blog/cryptography-101/commitment-schemes-revisited) (PCSs)!

And we’ll use this model to perform our tests. For illustrative purposes, let’s describe how a **zero test** would go.

Imagine you want to prove that some set $S$ is a collection of **roots** of a given polynomial $P(X)$:

$$
S = \{s_0, s_1, s_2, ..., s_{n-1}\}
$$

What can you do about it? Well, since the values in $S$ are _roots_, you can divide the polynomial $P(X)$ by what’s called a **vanishing polynomial** for the set $S$:

$$
V(X) = \prod_{i=0}^{n-1} (X - s_i)
$$

> The term **vanishing** is due to the fact that the polynomial is zero only on the set $S$, so they are exactly its **roots**.

If $S$ really are the roots of $P(X)$, then $P$ should be divisible by $V(X)$, with **no remainder**.

$$
Q(X) = P(X) / V(X)
$$

And now, we’re gonna have to use a [Polynomial Commitment Scheme](/en/blog/cryptography-101/commitment-schemes-revisited) to continue. You might have to read that article first!

Essentially, what happens is that the prover commits to both $P(X)$ and $Q(X)$, and then, they request an evaluation at some random $s_i$. With these evaluations, they can check whether if the following is true:

$$
Q(s_i).V(s_i) - P(s_i) = 0
$$

If it happens to be zero, then we saw that they can conclude **with high probability** that this polynomial $Q(X)V(X) - P(X)\* is **exactly zero**! Meaning that:

$$
Q(X)V(X) = P(X)
$$

Thus, they can be convinced that, effectively, $S$ is a set of roots of $P(X)$. If for some reason they aren’t convinced though, they could ask for another set of evaluations of $P(s)$ and $Q(s)$, and run the check again.

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/iop-first-step.webp" 
    alt="Zero test in action"
    title="[zoom]"
    className="bg-white"
  />
</figure>

> Similar IOPs exist for the **addition check** and the **product check**.
>
> Also worth mentioning, this does not ensure that the polynomial doesn’t have other roots that are not contained in $S$. But we’ll not go down that path this time around!

### From Interactive to Non-interactive

But wait... Didn’t we say that SNARKs were **non-interactive**? Then how is it possible that some **interactive protocol** is a key part of our construction?

Turns out there’s a way to turn **interactivity** into **non-interactivity**: the [Fiat-Shamir transform](https://en.wikipedia.org/wiki/Fiat%E2%80%93Shamir_heuristic). It sounds more daunting than what it is, trust me.

If we think about it, we may wonder “why are these protocols **interactive** in the first place?” The reason is that on each query, the verifier samples some **random number** $r_i$ from some set. And these values **cannot be predicted** by the prover — they only become available for them when the verifier chooses to execute a query. This **unpredictability** is sort of an **anti-cheat mechanism**.

Instead of waiting for the verifier to send random values, we can **simulate** this randomness using a well-known cryptographic primitive that also has an unpredictable output: [hashing functions](/en/blog/cryptography-101/hashing)!

> Let’s not focus on the details though — all you need to know is that the Fiat-Shamir heuristic is a powerful transformation, that can be very useful to turn any interactive protocol into a non-interactive one!

---

After what can only be categorized as torture, we have all the elements we need. Our excruciating journey is almost over — all that remains is putting the cherry on top of this pile of shenanigans.

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/dumbledore-suffering.webp" 
    alt="Dumbledore crying after drinking from the chalice to obtain Slytherin's Locket"
    title="Just end my suffering already"
  />
</figure>

---

## Back to Verification

Okay, let’s see. Remember, we’re trying to convince a verifier that we know $x$ such that:

$$
\exists \ x \in {\mathbb{F}_p}^m \ / \ C(x,w) = 0
$$

And we have to convince them of a few things:

- Correct inputs
- Correct gate computation
- Correct wiring

Let’s start with the **inputs**. The verifier has the **public witness**, $w$. Now, imagine the verifier encodes this witness into a **polynomial** $v(X)$, so that:

$$
v(\omega^{-j}) = w_j
$$

In this scenario, it should be true that values $v(x)$ and $P(x)$ match for the roots of unity that encode the **public witness**:

$$
P(\omega^{-j}) - v(w_j) = 0
$$

So what do we do? Why, of course, a **zero test** for the polynomial $P(X) - v(X)$ on the inputs that **encode the witness**!

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/brain-explosion.webp" 
    alt="Brain explosion"
    width="540"
  />
</figure>

Ahá! It’s starting to come together, isn’t it?

### Checking the Gates

Likewise, recall that the gates should suffice the expression:

$$
\alpha = \omega^{3k}
$$

$$
S(\alpha)[P(\alpha) + P(\omega \alpha)] + (1 - S(\alpha))P(\alpha)P(\omega \alpha) = P(\omega^2 \alpha)
$$

So again, what do you do? A **zero test on this massive expression**, on every gate. Marvelous. Splendid.

> For this of course, the verifier will need a commitment to $S(X)$.

### Checking the Wires

Lastly, we need to check the **wire constraints**. These were encoded into some polynomials $W(X)$ that **cycled through** a set of inputs $H’$, and we had to check that:

$$
P(x) = P(W(x)) \forall x \in H'
$$

For each element in $H’$. This is not really **efficient** to do with zero tests (although it can be done), so there’s an alternative way to do it through the use of a **product check**. Using this **casually dropped** expression:

$$
L(Y, Z) = \prod_{x \in H'} \frac{P(x) + Y.W(x) + Z}{P(x) + Y.x + Z}
$$

> Yeah

The gist of this is that the whole expression **should equal** $1$! If you think about it, it makes perfect sense: all the $P(x)$ values should be the same, and since $W(X)$ **permutates** the elements of $H’$, and because the product covers all of $H’$, we just get:

$$
L(Y, Z) = \prod_{x \in H'} \frac{P(x) + Y.W(x) + Z}{P(x) + Y.x + Z}
$$

$$
= \frac{\prod_{x \in H'} P(x) + Y.W(x) + Z}{\prod_{x \in H'} P(x) + Y.x + Z} = \frac{\prod_{x \in H'} P(x) + Y.x + Z}{\prod_{x \in H'} P(x) + Y.x + Z} = 1
$$

> There’s more to say about this, like why do we need to incorporate $Y$ and $Z$ into the mix? But honestly, I think that’s enough math for today.

In short, and to wrap things up: we use some **IOPs** to verify the **constraints** in an arithmetic circuit, which were encoded into polynomials!

---

## Summary

Ooof. That was a lot. I know.

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-2/ross-internal-pain.webp" 
    alt="Ross from Friends in the high pitch scene"
    title="We know you’re not fine, Ross. It’s ok"
  />
</figure>

Still, I find it amazing how all these things come together to form such a sophisticated protocol: we use **polynomial interpolation** to encode stuff, **polynomial commitment schemes** to query for information, **interactive oracle proofs** to create tests, and the **Fiat-Shamir heuristic** to turn all this mess into a **non-interactive proof**. **Un-be-lie-va-ble**.

The final result, [Plonk](https://eprint.iacr.org/2019/953.pdf), achieves the generality we were looking for by allowing **any circuit** to be used. And since this reveals nothing about $x$, then this is really a **zero-knowledge SNARK** (**zkSNARK**)!

> For the sake of completeness, I’ll say that there are some other details to be considered in order to make sure that the protocol is **zero-knowledge**, specifically around the **challenges**. Don’t worry too much though — unless, of course, you’re planning on implement Plonk yourself!

For a more interactive look, you can check this excellent video lesson.

<video-embed src="https://www.youtube.com/watch?v=vxyoPM2m7Yg" />

And here’s [another stab at explaining the protocol](https://trapdoortech.medium.com/zkp-plonk-algorithm-introduction-834556a32a), in case you find it easier to follow!

Hopefully, you can now better understand the brief description of Plonk I provided at the very beginning of the article:

::: big-quote
In Plonk, we encode the computation of a circuit into a series of polynomials, which represent the constraints imposed by the circuit, for which we can prove statements by using a series of tests, without ever revealing the polynomials themselves— and thus, not leaking the secret inputs.
:::

Given that we can now craft proofs for arbitrary circuits, I’d like to get more practical. So, [next time](/en/blog/cryptography-101/zero-knowledge-proofs-part-3), we’ll be building a couple circuits for some statements, which can then be the inputs for Plonk, turning them into **zkSNARKS**. See you soon!
