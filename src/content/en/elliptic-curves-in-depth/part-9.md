---
title: 'Elliptic Curves In-Depth (Part 9)'
author: frank-mangone
date: '2025-10-06'
thumbnail: /images/elliptic-curves-in-depth/part-9/0*cA5HOtwjA3YxYxcy-20.jpg
tags:
  - pairings
  - ellipticCurves
  - degeneracy
  - algorithms
description: "A wrap-up on pairings, with some discussions around algorithms, types, and other nuances."
readingTime: 15 min
mediumUrl: >-
  https://medium.com/@francomangone18/elliptic-curves-in-depth-part-9-f9253c437fbd
contentHash: # TODO: Add content hash
supabaseId: # TODO: Add supabase ID


---

Alright! We left off the [previous installment](/en/blog/elliptic-curves-in-depth/part-8) with a wrap on the very specific way pairings are defined.

After the dust settled, we were left with a couple suspiciously simple definitions for the Weil and Tate pairings. For such complex constructions, it feels almost poetical that we wind up with expressions such as this one:

$$
t_r(P,Q) = f(D_Q)
$$

However, and as you’ve probably come to expect by now, appearances are deceiving: we have in fact said nothing about how to **compute pairings** out of these simple expressions.

> And that’s actually the most important part, if we want to have any hope of putting pairings to good use!

Today, we’ll be looking at the technique that makes pairing computation possible, along with a few more details that will finally bring all the elements together.

We’re much closer to the finish line now. Just a little more!

---

## Computation

Let’s focus on the Weil pairing for a moment:

$$
w_r(P,Q) = \frac{f(D_Q)}{g(D_P)}
$$

In the previous article, we saw that there’s a natural way to **evaluate a function** on a divisor — and that’s exactly what we’d need to do to compute this pairing. That is, for divisor $D$ and function $f$:

$$
f(D) = \prod_{P \in E(\mathbb{F}_q)} f(P)^{n_P}
$$

Those $f$ and $g$ right there are not just any functions — we said they were **exactly** the functions whose divisor were:

$$
(f) = rD_P, \ (g) = rD_Q
$$

What we never mentioned is **how to obtain them** - [last time](/en/blog/elliptic-curves-in-depth/part-8), we merely mentioned that such functions can be constructed, but not how. It’s clear that once we have them, it’s just a matter of plugging them into the definition. But how do we find them?

Let’s see how we can get there.

### Building the Functions

To get us started, we’ll need to go back to one of the affirmations at the start of the previous article: that we can build a function **fₘ,ₚ** whose divisor (which is principal) is of this form:

$$
(f_{m,P}) = m(P) — ([m]P) — (m — 1)(\mathcal{O})
$$

What we’ll do is kind of an **inductive process** here: assuming we have $f_{m,P}$, can we build $f_{m+1,P}$?

The answer is **yes** — and in quite an elegant fashion.

We’ll make use of a couple tricks we have already seen, which involve two very simple functions. First, let’s take the line going through $P$ and $[m]P$, whose divisor is just:

$$
(\ell_{[m]P,P}) = (P) + ([m]P) + (-[m+1]P) — 3(\mathcal{O})
$$

Second, take the vertical line going through $[m+1]P$:

$$
(v_{[m+1]P}) = (-[m+1]P) + ([m+1]P) — 2(\mathcal{O})
$$

Using these two divisors, we can find a very neat relation between $f_{m,P}$ and $f_{m+1,P}$:

$$
(f_{m+1,P}) = (f_{m,P}) + (\ell_{[m]P,P}) — (v_{[m+1]P})
$$

Our prior knowledge of divisors reveals something amazing about the above observation: the divisor equality can be mapped directly into an algebraic expression with which we **can work with**:

$$
f_{m+1,P} = f_{m,P} \frac{\ell_{[m]P,P}}{v_{[m+1]P}}
$$

And that’s pretty much it! Given any value of $m$, we can start at the function $f_{1,P}$, and work our way to the desired function. Piece o’ cake, am I right?

<figure>
	<img
		src="/images/elliptic-curves-in-depth/part-9/1*Y71Dkhd9DKSknDYhBZkJTw-10.png"
		alt="A lady with a giant cake" 
		title="Whatever you say, pal."
	/>
</figure>

Not so fast, cowboy.

### Where it Gets Tricky

Remember our goal with all this was to construct a function whose divisor is:

$$
(f_{r,P}) = r(P) — r(\mathcal{O})
$$

That $r$ value right there is exactly the size of the **r-torsion**. In practice, the value of $r$ will be **huge** (we’re talking over $2^{150}$), which means that finding our functions by performing one update at a time **will get us nowhere**.

> Said differently, by using the strategy above, pairing computation would be infeasible in practice, so all we’d have is a nice bit of theory that serves no purpose.

However, pairings **are** used in practice for various cryptographic protocols — so there must be some trick to all this. And sure as hell, pairing computation was made possible by the clever ideas of a guy called [Victor S. Miller](https://en.wikipedia.org/wiki/Victor_S._Miller).

And that’s what we shall see next.

Rather than trying to add one to $m$ on each iteration, what would happen if we try to **double it**?

Let’s see. We being with some function $f_{m,P}$:

$$
(f_{m,P}) = m(P) — ([m]P) — (m — 1)(\mathcal{O})
$$

Even when going one iteration at a time, we’ll eventually get to the following function:

$$
(f_{2m,P}) = 2m(P) — ([2m]P) — (2m — 1)(\mathcal{O})
$$

The interesting bit happens when we try to **square** our original function. By the properties of divisors we already know, we can work out the resulting divisor to be:

$$
(f_{m,P}²) = 2(f_{m,P}) = 2m(P) — 2([m]P) — 2(m — 1)(\mathcal{O})
$$

Which is almost **suspiciously similar** to the divisor we want to get to!

In fact, we can work out their difference to be:

$$
(f_{2m,P} ) — ({f_{m,P}}²) = 2([m]P) — ([2m]P) — (\mathcal{O})
$$

That should look familiar by now, right?

<figure>
	<img
		src="/images/elliptic-curves-in-depth/part-9/0*L8jmx3bjxrPt7XAg-16.jpg"
		alt="A woman squinting hard" 
		title="*Hard squint"
	/>
</figure>

Let me save you the trouble: it’s the divisor of the line **tangent** to $[m]P$, minus the divisor of the **vertical line** through $[2m]P$. In essence, the functions used to **double** $[m]P$.

$$
(f_{2m,P} ) — ({f_{m,P}}²) = (\ell_{[m]P}) — (v_{[2m]P})
$$

This brilliant insight enables us to **double** the current $m$ value by:

- Squaring the current function,
- Multiplying by the line tangent to $[m]P$,
- Dividing by the vertical line at $[2m]P$ (which is just a scalar value).

We can get to any value of $r$ in logarithmic time by **squaring-and-adding**, using a single step when needed.

> For example, to get to $r = 28$, we could do **double**, **add**, **double**, **add**, **double**, **double**.

This should be very reminiscent of the [double-and-add algorithm](/en/blog/elliptic-curves-in-depth/part-1/#fast-addition) we used for fast multiplication of elliptic curve points. Behind the scenes, both use the tangent rule for the duplication — it’s just that we’re building functions in the case of Miller’s algorithm.

As a final remark, it should be noted that as we go deeper into the algorithm, the resulting functions will have high degree, so storing them in full becomes **prohibitively expensive**.

The trick is not to store the full function, but its **evaluation** at some divisor. Naturally, all we have to do is choose the divisor at which we want to compute the pairing functions!

---

Miller’s elegant algorithm is what ultimately enables practical pairing computation. But this isn’t all there’s to pairings — there are a few more things we need to take into account.

---

## Pairing Types

One thing we've left forgotten in the shelves is the definition of the [trace](/en/blog/elliptic-curves-in-depth/part-7/#the-trace-map) and [anti-trace](/en/blog/elliptic-curves-in-depth/part-7/#the-characteristic-polynomial) maps. It seems we took all that effort for no apparent reason.

Until now.

You see, when we define a pairing as:

$$
e: \mathbb{G}_1 \times \mathbb{G}_2 \rightarrow \mathbb{G}_3
$$

We need to consider who these groups actually are. Sure, we know they belong to the r-torsion, but is it okay for us to pick **any** torsion subgroup? Or should we be mindful of our decisions?

As you might expect, care indeed has to be taken when selecting those groups. Doing otherwise might cause some complications.

This will ultimately lead us to the idea of **pairing types**, which essentially describe the relationship between $\mathbb{G}_1$ and $\mathbb{G}_2$. But to fully grasp what’s at stake, we must first understand a few things about what we may be using pairings for.

### Group Requirements

When building cryptographic protocols with pairings, there are **two fundamental operations** we’ll need to perform.

First, we’ll need to **hash into our groups of choice**. By this, we mean taking arbitrary data — like a user’s name, email address, some message, or just about anything — and **deterministically mapping** it to a point in $\mathbb{G}_1$ or $\mathbb{G}_2$.

> For example, this is essential for schemes like [identity-based encryption](/en/blog/cryptography-101/pairings/#identity-based-encryption), where a person’s **identity** itself becomes their public key through **hashing**.

We also want this hashing process to be **efficient**. Some group choices make such a thing very hard to do, so instead, we’re forced to work with **fixed** [**generators**](/en/blog/elliptic-curves-in-depth/part-3/#identity-and-generators) and **scalar multiples**, which severely limits what protocols we can build. That is, we can only create points of the form $[k]P$ for some fixed generator $P$, and we can’t handle arbitrary inputs directly — a dealbreaker for most applications.

Second, we occasionally need **efficient homomorphisms** between groups. Having an efficiently computable map like this one:

$$
\psi : \mathbb{G}_2 \rightarrow \mathbb{G}_1
$$

can prove extremely useful.

The reason for this is that some protocols require **checking relationships** or **performing operations** that only make sense when elements are in the same group. Additionally, operations in some groups are much faster than in others — so if we can move between groups for faster computation, it’s a big win!

> Kinda like a computational cheat code!

But of course, there’s the catch. There’s always a catch.

In this case, the problem is that **we can’t have both things easily at the same time**. Different choices of groups provide different balances in this tradeoff. And that’s exactly what the different pairing types are about.

With this, we’re now ready to formally present them.

### Type 1: Symmetric Pairings

The simplest case we could imagine is when $\mathbb{G}_1$ = $\mathbb{G}_2$ = $\mathcal{G}_1$

> Recall that 𝒢**₁ **is the [base field subgroup](/en/blog/elliptic-curves-in-depth/part-7/#torsion-structure).

Since we use the same group for both  $\mathbb{G}_1$ and  $\mathbb{G}_2$, it’s no surprise these are called **symmetric pairings**.

Let’s see how they fare against our requirements. First, hashing into $\mathcal{G}_1$ is relatively efficient, since the entire group is on the base field — so that’s a win. And since both groups are the same, we only need **one hash** function.

In terms of maps between groups, we actually have a trivial one — the identity map! I guess that doesn’t really count? Heck, let’s just say it’s another win.

So what’s the tradeoff then? Everything seems pretty good...

<figure>
	<img
		src="/images/elliptic-curves-in-depth/part-9/0*cA5HOtwjA3YxYxcy-20.jpg"
		alt="A cartoon chicken with a doubtful look" 
		title="I don’t trust you anymore"
	/>
</figure>

Well, remember that for pairings to work, the divisor supports **must be disjoint**. When both $P$ and $Q$ come from $\mathcal{G}_1$, ensuring disjoint supports **becomes problematic** — we’re essentially pairing a group with itself.

The solution to this is to use what’s called the **distortion map**: an efficiently computable map $\phi$ that takes a point in $\mathcal{G}_1$ and moves it into a different r-torsion subgroup. With this, we could compute:

$$
e(P, \phi (Q))
$$

And the disjoint supports condition would be easier to cover.

So here’s the **real** problem: distortion maps only exist for [supersingular curves](https://en.wikipedia.org/wiki/Supersingular_elliptic_curve).

<figure>
	<img
		src="/images/elliptic-curves-in-depth/part-9/0*Te6UOAIM4kOD0KLs-22.jpg"
		alt="Freddie Mercury in his iconic pose" 
		title="Super singular you said? Oh yeah baby!"
	/>
</figure>

Supersingular curves have small [embedding degrees](/en/blog/elliptic-curves-in-depth/part-7/#extensions-and-torsion), typically $k \leq 6$. Small embedding degrees mean the pairing outputs land on a small field extension, which in turn causes the discrete logarithm problem in the output group to become **tractable**, resulting in curves that are **vulnerable to attacks**.

In short, Type 1’s simplicity comes at the cost of **security**. As more secure alternatives emerged, Type 1 pairings have fallen out of favor in practice.

### Type 2: Asymmetric with Isomorphism

We now move onto **asymmetric pairings** for types 2, 3, and 4. In all three cases, we’ll take $\mathbb{G}_1$ to be $\mathcal{G}_1$.

In type 2 pairings, $\mathbb{G}_2$ is chosen to be one of the other r-torsion subgroups **except** for $\mathcal{G}_2$ (the trace zero subgroup).

Again, let’s check on our requirements:

- In terms of **available isomorphisms**, we do have an efficiently computable map $\psi: \mathbb{G}_2 → \mathbb{G}_1$, and you’ve already seen it — it’s the trace map! This allows us to move elements from $\mathbb{G}_2$ into $\mathbb{G}_1$ when protocols require it. We can even go **the reverse direction** using the anti-trace map for certain operations, though this doesn’t map directly back into $\mathbb{G}_2$.
- However, in terms of **hashing**, this selection struggles. There’s no known efficient way to hash **directly into** these other r-torsion subgroups.

So **hashing** is the real offender here. The best we can do is, as we previously mentioned, to choose a fixed generator $P_2 ∈ \mathbb{G}_2$ and create elements via scalar multiplication $[k]P_2$. But this means every element has a **known discrete logarithm** relative to $P_2$, which breaks protocols that require random or hash-derived points.

This single limitation is so critical that it has prevented type 2 pairings from seeing widespread practical use — most protocols simply **need** the ability to hash into both groups, which immediately rules this type out.

### Type 3: Asymmetric without Isomorphism

Now for this type, we take $\mathbb{G}_2$ to be $\mathcal{G}_2$ — the trace zero subgroup itself.

This seemingly small change has profound implications — it actually **flips** the tradeoff completely on its head. Let’s see:

- Unlike Type 2, we **can** now hash into $\mathbb{G}_2$. The mechanism involves first hashing into the **entire r-torsion**, and then simply applying the **anti-trace map** to move into $\mathcal{G}_2$.
- Of course, we must pay a price for this convenience. In this case, that translates into not having an efficient way to compute an isomorphism ψ that we can use.

It’s important to point out that such an isomorphism **must exist** — after all, both $\mathbb{G}_1$ and $\mathbb{G}_2$ have the same size. The problem is that there’s no known **efficient way** to compute it.

> Ironically, the only group we can efficiently hash into (besides $\mathcal{G}_1$) is the only subgroup we **cannot** efficiently map out of.

Thus, we lose the computational shortcuts and protocol flexibility that type 2 offered. And no less important is the fact that most security proofs rely on actually **having** such a map, so to prove the robustness of type 3 pairings, protocols need to be designed around different hardness assumptions.

In practice, this tradeoff has proven to be acceptable, as the ability to hash into both groups is the most critical aspect for most protocols out there.

Type 3 is the **gold standard** for modern pairing-based cryptography.

### Type 4: The Full Torsion

Finally, type 4 takes $\mathbb{G}_2$ to be the **entire r-torsion** $E[r]$.

- Hashing into $E[r]$ is possible, but it’s less efficient than hashing into $\mathcal{G}_1$ or $\mathcal{G}_2$. Since the group is larger (it has order $r^2$, as we’ve already seen), there’s more computational overhead.
- Then, we can look at the **structure** of $E[r]$. In this sense, it has a distinctive feature: it’s **not cyclic**. We [already know](/en/blog/elliptic-curves-in-depth/part-7/#torsion-groups) it’s isomorphic to $\mathbb{Z}_r \times \mathbb{Z}_r$, so there’s no single generator that can produce all elements in the group. Some protocols rely on cyclicity to work, so they cannot use type 4 pairings.

Curiously, when hashing into E[r], the probability of landing in either $\mathcal{G}_1$ or $\mathcal{G}_2$ is close to $2 / r$ — **negligible** for big $r$ values. Certain specialized protocols might need to ensure avoiding specific subgroups, and in those cases, type 4 pairings can be useful.

The efficiency costs and lack of cyclicity mean that type 4 pairings are **rarely used in practice**.

---

All in all, type 3 pairings are the predominant variant in modern pairing-based cryptography. And truth be told, we hardly ever worry about which type of pairing we’re using. It’s just that if we have to get really technical in our protocol design, we might have to consider what using each group choice implies!

Now that we understand the different pairing types and their tradeoffs, let’s address one more critical concern, before closing the chapter on these amazing constructions.

---

## Degeneracy

We’ve talked about pairing types and how to construct the functions needed for computation, but there’s one more critical property we need to ensure: that our pairing actually **works**.

<figure>
	<img
		src="/images/elliptic-curves-in-depth/part-9/0*wp5W4xy9k3cMWbJS-23.jpg"
		alt="The quote 'God damn it Gump! You're a God damn genius!' from Forrest Gump".
	/>
</figure>

What do I mean by **works**? Remember that pairings are meant to be bilinear maps. But there’s a trivial way to satisfy bilinearity: just map everything to $1$!

$$
e(P, Q) = 1 \ \forall P, Q
$$

While such a pairing would technically satisfy bilinearity, it’s **completely useless**. We call such a pairing **degenerate**.

> And of course, a pairing is non-degenerate if there exist points $P$ and $Q$ such that $e(P, Q) \neq 1$.

### Should I Worry?

After we went through the trouble of defining pairings in these convoluted and complex ways, it would seem quite unlikely that our pairings would be degenerate, right?

Well... Not quite. If we’re not careful about how we choose $\mathbb{G}_1$ and $\mathbb{G}_2$, we can end up with a degenerate pairing even when following all the construction steps correctly. The mathematics might be sound, but the result is cryptographically useless.

A concrete example of what can go wrong happens when we try to use the Weil pairing with $\mathbb{G}_1 = \mathbb{G}_2 = \mathcal{G}_1$, but we’re working with an ordinary (non-supersingular) curve that has **no distortion map**.

When the Weil pairing operates on two points from the same Frobenius eigenspace (in this case, $\mathcal{G}_1$), the pairing **always evaluates to** $1$, regardless of which points you choose. At the cost of glazing over some of the details, here’s the short explanation:

- First, we know that the Frobenius endomorphism acts trivially on points in $\mathcal{G}_1$, so for any $P$ and $Q$ in $\mathcal{G}_1$, we have $\pi (P) = P$ and $\pi (Q) = Q$.
- Then, for rational functions on the curve, the Frobenius map has a special property:

$$
f(\pi(R)) = f(R)^q
$$

- We can plug this property into the Weil pairing itself, and looking at the resulting divisors, we obtain:

$$
w_r(\pi(P), \pi(Q)) = w_r(P, Q)^q
$$

- But since $P$ and $Q$ are in $\mathcal{G}_1$:

$$
w_r(P, Q) = w_r(P, Q)^q
$$

What we’re saying is that whatever the output of the pairing is, it’s **fixed by the q-th power map**. In other words, it has to be an **element in the base field**, for if $w_r(P, Q)$ belongs to a field extension, then raising it to the q-th power will **not yield** the same result.

We also know that **w_r(P, Q) **[must be an r-th root of unity](/en/blog/elliptic-curves-in-depth/part-8/#weil-reciprocity).

> Recall that for a field to contain r-th roots of unity, $r$ must divide the cardinality of the multiplicative subgroup of the field, so in this case, $q - 1$.

That’s the final nail in the coffin: we usually choose $r$ so that it does **not** divide $q - 1$, meaning that there are no roots of unity — except for the trivial one: the **multiplicative identity element**. Thus, $w_1(P, Q)$ **must equal** $1$.

This is precisely why Type 1 pairings require supersingular curves with distortion maps — without them, **degeneracy is unavoidable**.

### Requirements

Okay! That was certainly a lot. Sorry for that!

<figure>
	<img
		src="/images/elliptic-curves-in-depth/part-9/0*_jkpt_RYsng0eup3-28.jpg"
		alt="A kid crying" 
		title="Why you do this to me?"
	/>
</figure>

Beyond the specific example, there are some **general conditions** we should check to ensure non-degeneracy. Let’s round things off by looking at them.

- First and most important: $\mathbb{G}_1$ and $\mathbb{G}_2$ must be **disjoint** (except of course for the identity, $\mathbb{G}_1 \cap \mathbb{G}_2 = \{\mathcal{O}\}$). If they share non-trivial points, the pairing degenerates on those points. We already saw the extreme case where $\mathbb{G}_1 = \mathbb{G}_2$ without a distortion map — and the pairing becomes completely degenerate.

> This is why the trace and anti-trace decomposition is so valuable: it naturally allows us to use $\mathcal{G}_1$ and $\mathcal{G}_2$, which are **disjoint by definition**.

- Second: the **divisor supports** must be disjoint. We’ve mentioned this before, but there’s no harm in repeating it: if the supports aren’t disjoint, the function evaluation collapses to 0 or blows up to infinity, causing undefined behaviors that can result in degeneracy. Choosing $\mathbb{G}_1$ and $\mathbb{G}_2$ from different eigenspaces naturally ensures this.
- Third: the embedding degree must be **large enough**. Recall that the [embedding degree](/en/blog/elliptic-curves-in-depth/part-7/#extensions-and-torsion) $k$ is the smallest positive integer such that $r$ divides $q^k - 1$, and it determines where pairing values live. Essentially, we must ensure there are enough independent r-th roots of unity to support a non-degenerate pairing.

In practice, choosing the right pairing type (especially type 3) and using properly constructed [pairing-friendly curves](https://www.ietf.org/archive/id/draft-irtf-cfrg-pairing-friendly-curves-10.html) automatically satisfies all these conditions. The mathematical machinery ensures non-degeneracy, so we can focus on the cryptographic applications rather than worrying about the edge cases.

Still, understanding **why** these conditions matter may help us appreciate the careful design that goes into pairing-based cryptography. One step in the wrong direction, and the entire thing can fall apart!

---

## Summary

With this, we’ve completed our exploration of pairings, by covering some of the most important practical aspects that make them usable in cryptography.

As always, there’s more to say. In particular, I want to point at the fact that we still need to find suitable curves for these constructions. Most of the time, we **assume** we can find them, but it’s not necessarily an easy task.

Still, with these past few articles, you should have a rough idea of what pairings are all about. It’s interesting how we set out to find functions with a seemingly simple and harmful property — bilinearity — , but ended up having to get into pretty deep stuff to make it work.

> Part of what makes math beautiful, I guess: everything ends up clicking nicely!

To summarize today’s article, remember: most of the time, you’ll be using **type 3 pairings**, with **Miller’s algorithm** working in the background for actual computation, and you’ll be using curves and embedding degrees that **ensure non-degeneracy**.

---

While we could say much, much more about elliptic curves (heck, there are [entire books](https://link.springer.com/book/10.1007/978-0-387-09494-6) written about them, if you’re interested), I don’t wish to cover everything in this series.

However, I believe some practical considerations would be a good wrap-up. Thus, next article will be dedicated to understanding some of the curves with the most widespread adoption and their particularities.

I’ll see you on the finish line!