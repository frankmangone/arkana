---
title: 'The ZK Chronicles: Inner Product Arguments'
author: frank-mangone
date: '2026-04-22'
readingTime: 16 min
thumbnail: /images/the-zk-chronicles/inner-product-arguments/bulletproofs.webp
tags:
  - zeroKnowledgeProofs
  - innerProductArguments
  - bulletproofs
  - dory
description: >-
  The next step in our journey will see us looking at a new and important
  commitment mechanism, designed for polynomials
mediumUrl: https://medium.com/@francomangone18/the-zk-chronicles-inner-product-arguments-efb0e3a45639
contentHash: 
---

[Last time](/en/blog/the-zk-chronicles/commitment-schemes-part-2), we built our first fully-fledged polynomial commitment scheme.

It’s one of those mechanisms that, at least to me, is extremely elegant and feels almost magical. I mean, heck, you need a **single group element** to commit, a **single group element** to prove an opening, and you tie everything together using a neat pairing equality.

It showcases the power of pairings, leveraging the ability to move algebra around so that all the pieces fit perfectly into place.

We’ll keep building on those capabilities - but right now, I want to state this: KZG is not the only way to go about polynomial commitments.

So far, we’ve approached this endeavor through the lens of “evaluation at a hidden point”. But what if I told you we can take a radically different perspective?

<figure>
	<img
		src="/images/the-zk-chronicles/inner-product-arguments/morfeus.webp"
		alt="Morpheus from Matrix" 
		title="What if I told you…"
	/>
</figure>

Oh yeah. Today, we'll be working with **vectors** rather than polynomials. And though it sounds perplexing, it should not be all that crazy in hindsight: we already covered vector commitments using [Pedersen commitments](/en/blog/the-zk-chronicles/commitment-schemes-part-1/#pedersen-as-vector-commitments), after all. We'll be looking at a different strategy though - a more targeted one, so to speak -, and once we start getting into it, it will make more sense why we'd even be interested in exploring other options in the first place.

We’ll be diving into a new mechanism, going by the name of **inner product arguments**. The ingredients, at least in principle, are quite different, but the results are just as powerful.

So to get us started, let’s take a look at said ingredients!

---

## The Inner Product

If my memory serves me right, this is the first time in the series I even mention inner products, so the only logical place to start is with their definition.

Given two vectors $\textbf{a}$ and $\textbf{b}$ (we’ll write vectors in bold), their **inner product** or [dot product](https://en.wikipedia.org/wiki/Dot_product) is defined as the sum of the component-wise multiplication of $\textbf{a}$ and $\textbf{b}$ together. If that sounds like a mouthful, perhaps writing it cleanly will help - so for vectors of length $n$, we’d get:

$$
\langle \textbf{a}, \textbf{b} \rangle = \sum_{i=0}^{n-1} a_ib_i
$$

While simple in appearance, inner products are extremely useful for a number of reasons.

> For instance, they provide a measure of **collinearity** between vectors. An inner product of $0$ means the vectors are **completely orthogonal**.

In our case though, we’re interested in the verifiable computing aspect of things, so inner products must serve some kind of purpose around **proving statements**. And indeed, there’s a very nice mechanism we can build around them.

### Inner Product Arguments

The core idea is best presented with a simple example. Suppose we have a secret vector $\textbf{a}$ and a public vector $\textbf{b}$, and we’ve somehow committed to **a** using a vector commitment scheme like a [[Commitment Schemes (Part 1)#Pedersen Commitments|Pedersen commitment]].

With this, we claim that:

$$
\langle \textbf{a}, \textbf{b} \rangle = v
$$

How can we, as provers, convince a verifier that this claim is true, without revealing $\textbf{a}$?

This is the essence of what an **inner product argument** (or **IPA**) does: it allows a prover to convince a verifier that a committed vector satisfies a specific **linear relation**, while **keeping the vector hidden**. Since $\textbf{a}$ is never revealed, the IPA must incorporate the commitment to $\textbf{a}$ into the mix, so that the prover is bound to the value of said vector.

In that statement up there, I've sneaked two two important things: IPAs should be both **hiding** (the vector remains hidden) and **binding** (the proof should work for $\textbf{a}$ alone). And by now, we know full well those are characteristic of **commitment schemes**. … so what’s the catch?

Well, to be precise, IPAs are really a **proving** or **argument system** more than a commitment scheme, as we’ll soon see. However, there’s a nice and simple connection we can make with polynomial commitment schemes - so much so that IPAs can **actually be used as PCSs** (among other things!).

The secret lies in a somewhat unexpected connection: inner products are tightly related to **polynomial evaluations**.

<figure>
	<img
		src="/images/the-zk-chronicles/inner-product-arguments/peppers.webp"
		alt="Two confused peppers" 
		title="Say whaaaat?"
	/>
</figure>


How, you may be wondering? Well, when we have a polynomial $Q(X)$ of degree $n$, we can write its coefficients as a **vector** $\textbf{q} = (q_0, q_1, q_2, ..., q_n)$. We can also take some value $z$, and write a vector for **all of its powers**, so we get $\textbf{z} = (1, z, z^2, ..., z^n)$. Now… what happens if we take the **inner product** of these vectors?

$$
\langle \textbf{q}, \textbf{z} \rangle = \sum_{i=0}^{n} q_iz^i = Q(z)
$$

Ahá! We’ve just stumbled upon an alternative way of writing a polynomial evaluation as an inner product - which means we can use IPAs to prove the correctness of polynomial evaluations!

---

Alright then! With that out of the way, and now that we better understand what we’re dealing with, it’s time to get our hands a bit dirty, and see one of these arguments in action.

Get ready - it’s gonna get a bit messy!

---

## Bulletproofs

Perhaps the most well-known realization of an inner product argument appears in [Bulletproofs](https://eprint.iacr.org/2017/1066.pdf).

<figure>
	<img
		src="/images/the-zk-chronicles/inner-product-arguments/bulletproofs.webp"
		alt="A man shooting another, wearing a very rudimentary bulletproof vest" 
		title="Nope!"
	/>
</figure>

They popularized a **particularly elegant** IPA that compresses an inner product claim into a logarithmic-size proof, which is really nice. And they do so in a **transparent way**, without requiring a trusted setup.

Before we start, I want to take a moment to clarify something right off the bat. One of the main use cases for Bulletproofs is **range proofs**: proving that a number belongs in a given range between $0$ and some other integer $k$.

> This was actually how I framed them the [first time I wrote about this topic](/en/blog/cryptography-101/zero-knowledge-proofs-part-1/#range-proofs)!

But really, the core construction they use can be applied to **any inner product**. It just so happens that one of the main components of a range proof is an inner product in itself, so the construction naturally fits that purpose!

This time around then, I want to focus much more on the general technique rather than on a specific use case.

> Just keep in mind that this type of argument system might be useful in multiple scenarios.

Having said that, let’s move onto the action!

### Notation

We’ll still be dealing with a secret vector $\textbf{u}$ of field elements. However, our story starts a little differently now: let’s assume we have committed to this vector through a [Pedersen commitment](/en/blog/the-zk-chronicles/commitment-schemes-part-1/#pedersen-as-vector-commitments):

$$
c_{\textbf{u}} = h^{r}\prod_{i=0}^n {g_i}^{u_i}
$$

Using a vector of generators $\textbf{g}$ for some group $\mathbb{G}$.

At surface level, this doesn’t look much like an inner product. But there’s a nice transformation we can apply here: an [isomorphism](/en/blog/the-zk-chronicles/groups/#group-equivalence)! If we think about $\mathbb{G}$ as an additive group rather than a multiplicative one, and if we conveniently omit the blinding factor, we’d get something like this:

$$
c_{\textbf{u}} = \sum_{i=0}^n u_i \cdot g_i
$$

And that… pretty much looks like an inner product! The only problem is that it involves field elements on one side, and group elements on the other. So here, we’ll slightly abuse notation, and still write the Pedersen commitment as:

$$
c_{\textbf{u}} = \langle \textbf{u}, \textbf{g} \rangle
$$

> We only omit the blinding factor for simplicity in our treatment, but keep in mind it should be accounted for in the full construction!

### The Core Construction

Alright, with that little change in notation, the goal of this IPA is very simple to state: the prover wants to prove knowledge of a vector $\textbf{u}$ so that the commitment $c_{\textbf{u}}$ is correctly formed, while also satisfying a specific inner product relation.

In order to make things work, we’re gonna need to tap into a resource we’ve exploited time and time again throughout the series: **recursion**!

<figure>
	<img
		src="/images/the-zk-chronicles/inner-product-arguments/recursion.webp"
		alt="Pooh eating recursion meme" 
	/>
</figure>

The main idea is that the prover will try to convince the verifier that the initial claim is tied to a **smaller claim** (in this case, of **half the size**) of the **same form** the original. We call this **folding**.

> As in, literally **folding the claim in half**.

All we do is repeat this process until a condition that’s directly checkable is reached - and that’s pretty much it!

However (and quite importantly), we must make it so that the argument is **sound**, meaning that it's impossibly hard for the prover to cheat. To enforce this, we do what we've been doing all along in all the proving systems we've seen so far: we request **verifier challenges**. By using those in the folding process itself, we bind the prover to this unpredictability, which is the key ingredient that prevents proof forgery.

And this is done in the following fashion: first, the prover splits both $\textbf{u}$ and $\textbf{g}$ cleanly into two halves:

$$
\textbf{u} = (\textbf{u}_L \ | \ \textbf{u}_R), \ \textbf{g} = (\textbf{g}_L \ | \ \textbf{g}_R)
$$

> For simplicity, we’ll assume the length of the vectors is a **power of** $2$, so that we can always split them half as we go through the recursive steps.

Which means we can also trivially split our original inner product via:

$$
\langle \textbf{u}, \textbf{g} \rangle = \langle \textbf{u}_L, \textbf{g}_L \rangle + \langle \textbf{u}_R, \textbf{g}_R \rangle
$$

They will also compute a couple **cross-terms**, whose usefulness is at the center of today’s construction: the verifier will need these during verification in order to reconstruct some things on their own.

> Just trust me for now - without these cross-terms, there would be no Bulletproofs at all!

$$
v_L = \langle \textbf{u}_L, \textbf{g}_R \rangle , \ v_R = \langle \textbf{u}_R, \textbf{g}_L \rangle
$$

From this point forward, a little **interactive protocol** between the prover and the verifier will take place. First, the prover will send the cross-term values (which are group elements). Keep in mind that the verifier does not know $\textbf{u}$, so they couldn’t have calculated these values on their own.

The verifier will respond with a challenge $\alpha \in \mathbb{F}_p$. And here comes the fun part: the prover will use this challenge to update their vector $\textbf{u}$, while the verifier can simultaneously update the commitment $c_{\textbf{u}}$ to **match the updated vector**.

> We say they do this update **homomorphically**.

Right… that’s easier said than done. I mean, the vector updates are quite straightforward, even though it will not be immediately clear **why** we choose the particular form, which looks like this:

$$
\textbf{u}’ = \alpha \textbf{u}_L + \alpha^{-1} \textbf{u}_R, \ \textbf{g}’ = \alpha^{-1} \textbf{g}_L + \alpha \textbf{g}_R
$$

But how on Earth do we update the **commitment**? It’s not like the verifier can split it in half or anything…

Let’s take it step by step. What we need is a way to have the verifier update their commitment to $\textbf{u}$ and $\textbf{g}$, to this new pair of vectors $\textbf{u'}$ and $\textbf{g'}$. So let’s try to see how that would look like, using the **linearity** of inner products:

$$
\langle \textbf{u}’, \textbf{g}’ \rangle = \langle \alpha \textbf{u}_L, \alpha^{-1} \textbf{g}_L \rangle + \langle \alpha \textbf{u}_L, \alpha \textbf{g}_R \rangle + \langle \alpha^{-1} \textbf{u}_R, \alpha^{-1} \textbf{g}_L \rangle + \langle \alpha^{-1} \textbf{u}_R, \alpha \textbf{g}_R \rangle
$$

We can move those $\alpha$ to the outside of the inner products using linearity once more:

$$
= \langle \textbf{u}_L, \textbf{g}_L \rangle + \alpha^2 \langle \textbf{u}_L, \textbf{g}_R \rangle + \alpha^{-2} \langle \textbf{u}_R, \textbf{g}_L \rangle + \langle \textbf{u}_R, \textbf{g}_R \rangle
$$

Oh? What’s that? Just like magic, it seems the **cross terms** we calculated earlier have appeared! And with some final rearrangements, we get to the final, clean form:

$$
c_{\textbf{u}’}= c_{\textbf{u}} + \alpha^2 v_L + \alpha^{-2} v_R
$$

**Et voilà**! Using the cross terms, the verifier is able to get a commitment to the folded vector on their own! 

> As a subtle but important detail, the verifier can also fold $\textbf{g}$ on their own, since $\textbf{g}$ is public. This is crucial for the final verification.

And believe it or not, that’s pretty all there is to it! Once we’re able to reduce a claim to half its size, we can continue doing this **recursively** with fresh challenges, until we fold the original vector $\textbf{u}$ into a single field element $u$. The final check for the verifier is just:

$$
u^* \cdot g^* = c_{u^*}
$$

And if that checks out, then we can say with a lot of confidence that the prover knew the original vector $\textbf{u}$!

### Public Coins

At this point, we need to formalize something we’ve been using all this time without its concrete name: **public randomness**.

Notice that the derivation of the folded commitment includes $\alpha$. This value is public, but it’s chosen at **exactly the right time** to prevent the prover from cheating. That is, the prover has no way to influence the derivation unless they know $\alpha$ **in advance**.

And if you recall from our [soundness analysis in the sum-check protocol](/en/blog/the-zk-chronicles/sum-check/#completeness-and-soundness), this is extremely unlikely. Effectively, this is a way to **lock in** the result of a previous step before we start the next one.

This use of random challenges is so central to the soundness analysis of interactive protocols, that they receive a special name: [public coins](https://en.wikipedia.org/wiki/Interactive_proof_system#Public_coin_protocol_versus_private_coin_protocol:~:text=see%20BPP%29.-,Public%20coin%20protocol%20versus%20private%20coin%20protocol,-%5Bedit%5D). And of course, we call the protocols that use this strategy **public-coin protocols**.

> As opposed to **private-coin protocols**, where the random selection is not made public.

Public-coin protocols provide strong soundness guarantees, and on top of that, they are conceptually very clean: the **entire transcript** of the protocol is determined by the combination of the prover messages and the public verifier challenges. There are no hidden shenanigans.

And to top it off, because all randomness is public, we can use the [Fiat-Shamir transform](/en/blog/the-zk-chronicles/enter-hashing/#the-fiat-shamir-transform) to remove interaction altogether!

---

So that’s the essence of Bulletproofs in a nutshell! The idea of **folding** leaves us with a neat argument system that requires no trusted setup, and runs in $\text{log}_2(n)$ rounds.

> Keep in mind we omitted the blinding factor for a simpler mathematical treatment, but the full construction should include it so that the commitment is **hiding**!

We could end the story here. However, I don’t want you guys to leave this article with the impression that Bulletproofs are **the only** IPA available, and that we either use this IPA or KZG for polynomial evaluations.

There’s much more out there. So to give you a little peek, I want to briefly talk about another technique that sits somewhat in the middle between the techniques we’ve talked about so far.

---
## Dory

We’ll be briefly looking at [Dory](https://eprint.iacr.org/2020/1274), a slightly more modern PCS that also relies on pairings, but uses them for a different purpose than KZG. Because Dory is, at its core, an **inner product argument**!

However, it’s very different in nature from Bulletproofs, because of how it handles inner products altogether.

### Inner Pairing Products

> It uses pairings!

Yeah! Rather than using Pedersen-like commitments, Dory relies on pairing-based commitments. It does so by leveraging what’s called an **inner pairing product** (or **IPP**), which is what we shall see next.

The setting is similar to that of KZG: we need three groups $\mathbb{G}_1$, $\mathbb{G}_2$, and $\mathbb{G}_t$ of prime order $p$, a pairing $e$ between them, and a field $\mathbb{F}_p$.

With these, we can define:

$$
\mathrm{IPP}(\textbf{a}, \textbf{b}) = \prod_{i=0}^n e(a_i, b_i)
$$

Why define it this way? Well, notice that here, $\textbf{a}$ and $\textbf{b}$ are **vectors of group elements**, not **field elements**. Therefore, we cannot use the standard inner product (nor the slightly modified one we used in Bulletproofs), because there’s no way to **multiply elements of two different groups together**.

But we can achieve a similar effect using the **pairing**!

What’s nice about this is that it behaves **exactly like an inner product**: it has the same linear properties, thanks to the **bilinearity** of pairings!

> Up to an isomorphism, we could even represent the IPP as a sum rather than a product! It’s just that we’re assuming $\mathbb{G}_t$ is a multiplicative group.

So moving forward, we’ll once again abuse notation a bit, and just write the expression $\langle \textbf{a}, \textbf{b} \rangle$ to represent $\mathrm{IPP}(\textbf{a}, \textbf{b})$.

---

Now, it’s not like Dory is just Bulletproofs on pairing steroids. It still builds on the inner product paradigm, yes, and it still relies recursion, but there’s a fundamental change in **what is being compressed** and **how it’s being compressed**.

This will be much clearer after saying this: the commitment to some vector $\textbf{u}$ is now calculated using a **commitment key** $\textbf{g}$ that is **no longer public**:

$$
c_\textbf{u} = \langle \textbf{u}, \textbf{g} \rangle
$$

That’s the key difference, really. Since $\textbf{g}$ is not public, the verifier **cannot fold it on their own**, and so the Bulletproof-style folding process cannot be applied. In other words, the object that defined the commitment in Bulletproofs was **public** and **foldable**. Here, it’s part of the commitment structure itself!

> Note that in Bulletproofs, the **hiding** property of the commitment is bestowed by the use of an explicit blinding factor $r$. Here, we don’t need such a factor.
> 
> Instead, hiding stems from the structure of the commitment key $\textbf{g}$ and the underlying hardness assumptions of the pairing group. We don’t need to worry about the details here, though. What’s important to know is that this is **still hiding**, only for different reasons!

“But Frank” - you may be wondering - , “how can we prove anything about the commitment if $\textbf{g}$ is not public?”. That’s exactly the right question! And it’s the key structural difference in Dory: we must perform a **transparent setup step** to make this whole thing work!

### The Transparent Setup

To understand how this would work, let’s try to go through a couple folding rounds together.

The round would proceed similarly to Bulletproofs: the prover splits the vector $\textbf{u}$ and the commitment key $\textbf{g}$, sends the cross terms to the verifier, and the verifier replies with a challenge $\alpha_1$. The prover then folds both $\textbf{u}$ and $\textbf{g}$ normally into $\textbf{u'}$ and $\textbf{g'}$, and the verifier folds the commitment $c_\textbf{u}$.

So far, this looks familiar. However, there’s a problem: the verifier **cannot fold** $\textbf{g}$, because they just **don’t know it**!

<figure>
	<img
		src="/images/the-zk-chronicles/inner-product-arguments/damn.webp"
		alt="A frustrated streamer" 
	/>
</figure>

No need to panic though: there’s a light at the end of the tunnel. All we require is some pre-processing!

The solution to this matter is to also go through with an IPA, but for the **commitment key**. I know it sounds challenging, but it’s actually quite simple.

For this, the prover selects a vector of random group elements we’ll call $\Gamma$, which needs to have half the length of $\textbf{g}$. Then, the prover splits $\textbf{g}$ into its left and right portions, and calculates a couple of IPP commitments to each half:

$$
\Delta_L = \langle \textbf{g}_L, \Gamma \rangle, \ \Delta_R = \langle \textbf{g}_R, \Gamma \rangle
$$

Why? Because these can now be **shared with the verifier**, and they can use them to calculate a commitment to $\textbf{g'}$:

$$
c_{\textbf{g}’} = \alpha_1^{-1} \Delta_L + \alpha_1 \Delta_R = \langle \textbf{g}’, \Gamma \rangle
$$

Let’s take a moment to appreciate of what just happened here: the verifier started this round with a **single commitment** in the form of one inner product equality, and ended up with **two** inner products:

$$
c_{\textbf{u}’} = \langle \textbf{u}’, \textbf{g}’ \rangle , \ c_{\textbf{g}’} = \langle \textbf{g}’, \Gamma \rangle
$$

> One small subtlety here: $\textbf{g}$ was originally a vector of elements of $\mathbb{G}_2$, but here, it’s being treated as a vector of elements of $\mathbb{G}_1$.
> 
> Strictly speaking, this step assumes a **symmetric pairing**. Otherwise, we must keep track of which group each vector lives in!

So what do we do from here? Well, we prove knowledge of the openings of **both commitments**! That is, we can run exactly the same folding strategy we just used for the **two commitments in parallel**!

For the sake of brevity, let’s just outline how this continues. If we were to go through another round, the prover would need to send new pre-computed $\Delta'$ values associated with a **new commitment key** $\Gamma'$ of half the length of $\Gamma$. And in turn, this would add **yet another inner product** for the prover to check.

> And the goal is simple, even if the path there isn’t: by committing to the commitment key itself at each round, the verifier can stay synchronized with the prover’s folding. They just track commitments to commitments, all the way down!

This continues until $\textbf{u}$ is folded into a single value $u*$, at which point the prover can send both $g*$ and $u*$, and **all the folded intermediate commitment keys** $\Gamma$.

Finally, the verifier checks $\text{log}_2(n)$ product equalities, and if they all check out, then they accept the proof!

---

So where’s the pre-processing then? It’s the selection of all the $\Gamma$ vectors, and the computation of all the $\Delta$ values! These can all be calculated **ahead of time**, so the prover can do this once per inner product, and send it to the verifier before the they send any challenge!

Transforming this to a polynomial commitment scheme takes a little extra work, but we need not worry about that now.

> Plus, Dory has several more details to cover, and that would detract us quite a lot. Just the central ideas are more than enough for us to move further into ZK territory!

---

### Summary

Oh my. This was a hardcore one for sure.

<figure>
	<img
		src="/images/the-zk-chronicles/inner-product-arguments/wasted.webp"
		alt="A boy lying on the ground with a book over his head"
		title="Nah, you think so?" 
	/>
</figure>

There’s just no sugarcoating these things. The math is complicated, and it will continue to be so.

> Sorry!

What’s more important to me is to focus on the bigger picture, and build intuition on the core ideas that make up verifiable computing.

In that regard, today was very instructive, as we explored the idea of **folding** in the context of a really important family of techniques: IPAs. And we saw how they are much more than just an alternative way of thinking about polynomial commitments: they are more like a **design pattern** for proving systems.

---

There’s one subtle and crucial aspect we’ve only implicitly hinted at: **are these arguments zero knowledge**?

In Bulletproofs, the prover convinces the verifier that an inner product relation holds, seemingly without revealing any information about the hidden vector.

That’s not an accident, but it’s not automatically obvious either. So, **how do we quantify this**?

And so, in the next article, we’ll take a break from constructions and finally focus on the central property of our entire exploration: **zero knowledge**.

> Because proving something efficiently is only half the story!

Hope you’re pumped for the [next one](/en/blog/the-zk-chronicles/zero-knowledge)! I’ll see you there!
