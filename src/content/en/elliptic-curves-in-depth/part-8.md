---
title: Elliptic Curves In-Depth (Part 8)
date: '2025-07-23'
author: frank-mangone
thumbnail: /images/elliptic-curves-in-depth/part-8/barassi.jpg
tags:
  - cryptography
  - mathematics
  - ellipticCurves
  - pairings
  - torsion
description: >-
  With torsion groups at hand, we can now explore the formal definition of
  pairings.
readingTime: 11 min
mediumUrl: >-
  https://medium.com/@francomangone18/elliptic-curves-in-depth-part-8-a20ca0681ed8
contentHash: f25a320c4aeabf99c28913a35bf6b2b849edfa4038a5e7686f65378fd8ea4305
supabaseId: 2d51d852-ebf6-4963-b42d-75f2710fcd66
---

After our expedition through the tangled jungles of [torsion groups](/en/blog/elliptic-curves-in-depth/part-7), we continue our journey presenting **pairings**.

As I mentioned last time, this is the second part of the three-part section of the series about these fascinating constructions.

We'll need more than just the previous article, though. In fact, we'll need everything we've talked about in the previous **few** articles, because [divisors](/en/blog/elliptic-curves-in-depth/part-5) also play a crucial role in pairing definition.

Things won't get any easier, so I recommend taking it slow if needed, and really giving the concepts time to sink in.

> It's not gonna be pretty, but we'll get there.

Welcome aboard the pairing express. I'll be your guide.

---

## Preliminaries

Before we present the **two pairings** we'll be exploring in this article, there are a couple things we need to look at - a few principles used in both pairing definitions.

When we talked about divisors, one of the main concepts we talked about was that of [principal divisors](/en/blog/elliptic-curves-in-depth/part-5/#principal-divisors). These represent divisors for **functions**, and have two defining characteristics:

- One is that the multiplicities of points (the $n_P$ values) add up to zero, or that the **degree** of the divisor is $0$.
- The other one, which we haven't mentioned yet, is this one:

$$
\sum_{P \in E(\bar{\mathbb{F}}_q)} [n_P]P = \mathcal{O}
$$

> This is a consequence of the [Abel-Jacobi theorem](https://en.wikipedia.org/wiki/Abel%E2%80%93Jacobi_map#:~:text=of%20principal%20divisors.-,Abel%E2%80%93Jacobi%20theorem,-%5Bedit%5D), which is complicated enough for us to not want to go there now. It involves interesting topological concepts that we might explore in the future!

This means that for some integer $m$, we can construct a function $f_{m,P}$ with the following divisor:

$$
(f_{m,P}) = m(P) - ([m]P) - (m - 1)(\mathcal{O})
$$

It's obviously a principal divisor, because the sum of the multiplicities is zero (it has degree zero), and because $[m]P - [m]P$ is clearly $\mathcal{O}$.

If we choose $m = r$, this function's divisor reduces to:

$$
(f_{r,P}) = r(P) - r(\mathcal{O})
$$

We'll need this little divisor here to understand our pairing definitions!

### Evaluating a Divisor

The other thing we'll need is to understand how to **evaluate a function** on a divisor. This is, given a function:

$$
f: E(\bar{\mathbb{F}}_q) \rightarrow \mathbb{F}_q
$$

We'd like to be able to define what $f(D)$ is, given that $D$ is some divisor.

In fact, there's a quite natural definition for this:

$$
f(D) = \prod_{P \in E(\bar{\mathbb{F}}_q)} f(P)^{n_P}
$$

> Because $f$ can only take points in the curve as inputs, we don't have many more options! Still, we'll soon see first-hand that this definition is very convenient.

Truth be told, this doesn't always work. For this to make sense, we need to impose an extra condition: it's necessary for $(f)$ and $D$ to have **disjoint supports**.

Recall that the [support](/en/blog/elliptic-curves-in-depth/part-5/#divisors-on-a-curve) of a divisor is the set of points with non-zero multiplicities - which means that they are either a **zero**, or a **pole** of the function (which is of course defined over a curve, meaning that they really are the intersection points, as we already know).

So if $(f)$ and $D$ share a point in their supports, this means that some value of $f(P)$ will either be $0$ or **infinity** - causing the entire product to either collapse to zero, or blow up to infinity.

With disjoint supports, we ensure that $f(D)$ will produce some meaningful value!

---

Alright, that's the end of the introduction! How are we feeling?

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-8/barassi.jpg" 
    alt="Argentinian television celebrity Barassi with a pained look"
    width="600"
    title="Oh God there's more?"
  />
</figure>

Yes there is. With this, we can finally define pairings. Let's do this!

---

## The Weil Pairing

We already know that pairings are functions of the form:

$$
e: \mathbb{G}_1 \times \mathbb{G}_2 \rightarrow \mathbb{G}_3
$$

The inputs are nothing more than two points $P$ and $Q$ on the curve. But not just any points - let's restrict them to the [r-torsion](/en/blog/elliptic-curves-in-depth/part-7/#torsion-groups). We'll see why in just a few minutes.

Another thing we know is that we can map points to divisors easily, through the isomorphism we defined when we worked with [the Mordell-Weil group](/en/blog/elliptic-curves-in-depth/part-5/#the-mordell-weil-group):

$$
P \mapsto D_P = (P) - (\mathcal{O})
$$

$$
Q \mapsto D_Q = (Q) - (\mathcal{O})
$$

And through the notion of [divisor equivalence](/en/blog/elliptic-curves-in-depth/part-5/#the-picard-group), we can find divisors equivalent to the ones associated with $P$ and $Q$, in such a way that they have disjoint supports.

With this in mind, the **Weil pairing** is defined as:

$$
w_r(P,Q) = \frac{f(D_Q)}{g(D_P)}
$$

Given that the functions $f$ and $g$ have divisors:

$$
(f) = rD_P, \ (g) = rD_Q
$$

> I know. This might feel a little underwhelming after so many definitions and profound mathematics. But there's certainly a lot to unpack here... This uninspiring facade certainly hides a lot!

A closer inspection reveals a problem: the **disjoint supports** requirement is not met. Both functions and both divisors share a point in their supports: $\mathcal{O}$. And we know what that means - the pairing will not be well-defined.

It seems we're in a pickle.

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-8/pickle-rick.jpg" 
    alt="Pickle Rick from Rick and Morty"
    width="600"
    title="Pickle Riiiick!"
  />
</figure>

What's the trick this time? Yet again, **divisor equivalence**!

Only one of the two divisors needs to be updated (and its associated function, of course), but let's see how we would update both, to keep things fair.

> We don't discriminate divisors here.

For this, we choose two more random points in the curve, $R$ and $S$, and we follow the same process outlined [here](/en/blog/elliptic-curves-in-depth/part-5/#the-mordell-weil-group). All we do is use our trusty and effective chord-and-tangent rule. As a refresher, let's see it in action with just $P$ and $R$:

- Draw the line going through those points. It will have divisor $(\ell) = (P) + (R) + (-(P + R)) - 3(\mathcal{O})$.
- Draw the vertical line through $-(P + R)$; the divisor for this line will of course be $v = (-(P + R)) + (P + R) - 2(\mathcal{O})$.
- Finally, we just add $(v)$ and subtract $(\ell)$:

$$
(P) - (\mathcal{O}) + (v) - (\ell) = (P+R) - (R)
$$

Note that these divisors are **equivalent**, because their difference is the divisor of a function.

### Updating the Functions

What about $f$ and $g$, though? We've updated the inputs, yes, but the entire gist of the matter is to find functions for these new divisors we just found.

Take the original $f$, for example. It was a function such that:

$$
(f) = rD_P = r(P) - r(\mathcal{O})
$$

And we now need to find some function $f'$ such that:

$$
(f') = r{D_P}' = r(P + R) - r(R)
$$

If you have a keen eye, you may have spotted the similarity with the divisor conversion process - all we need to do is to apply that procedure exactly $r$ times.

$$
(f') = (f) + r(v) - r(\ell)
$$

Surprisingly easy, I'd say!

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-8/kombucha.png" 
    alt="Kombucha girl meme"
    width="500"
  />
</figure>

This divisor transformation is equivalent to multiplying the original function $f$ by $v / \ell$ exactly $r$ times, so:

$$
f' = f\left ( \frac{v}{\ell} \right )^r
$$

Marvelous! Now we have all the elements we need to compute the pairing.

Still... I don't know about you, but I'm not convinced **at all** that this $w$ function is **bilinear**.

### Weil Reciprocity

You're absolutely right to be suspicious - the expression we built seems rather arbitrary without any further context.

As you'd expect, we're missing the **secret spice** here.

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-8/lisan.jpg" 
    alt="Lisan al Gaib from Dune staring fiercely at the camera"
    width="600"
    title="Did you say spice?"
  />
</figure>

The magic that makes this work is called **Weil reciprocity**, which is a powerful theorem that states that for any two functions $f$ and $g$ on an elliptic curve, and their divisors $(f)$ and $(g)$, this holds:

$$
\frac{f((g))}{g((f))} = 1
$$

> Again, a simple, innocuous expression. Under the hood however, this tells us that there's some **fundamental symmetry** in how functions "see" each other's divisors.

Let's not dangle on the details too long. What's more exciting is how this plays into the pairing definition. By Weil reciprocity, we know that:

$$
\frac{f_{r,P}((g_{r,Q}))}{g_{r,Q}((f_{r,P}))} = \frac{f_{r,P}(rD_Q)}{g_{r,Q}(rD_P)} = 1
$$

But because of how we defined evaluations of functions over divisors, this actually can be rewritten as:

$$
\left ( \frac{f_{r,P}(D_Q)}{g_{r,Q}(D_P)} \right )^r = 1
$$

> Actually, for this to work, we also require that functional evaluations of $(\mathcal{O})$ yield exactly $1$. This isn't necessarily true, but there's usually a **normalization** process involved to ensure this condition.
>
> It's also important to mention that this step here is why using r-torsion points is crucial - if not, we wouldn't have been able to factor $r$ out!

Well, Weil, well... Look at that! It's our pairing raised to the $r$! Which means that the output of our pairing is none other than an **r-th root of unity** in the field.

### Bilinearity

That doesn't say anything about bilinearity, though.

Let's take it a step further. For our pairing to be bilinear, we require that:

$$
w_r(P_1 + P_2, Q) = w_r(P_1,Q).w_r(P_2,Q)
$$

> We'd need to prove it for both inputs, of course - but a similar argument can be made for the one we're omitting.

As we already know, we'll need to construct a function for that first input with divisor $r(P_1​ + P_2​) − r(\mathcal{O})$. Fortunately, there's a straightforward way to do that, and it's again by leveraging the **chord-and-tangent rule**.

You see, by applying this process, we get the following divisor equivalence:

$$
(P_1 + P_2) \sim (P_1) + (P_2) - (\mathcal{O})
$$

Nothing stops us from multiplying both sides by $r$:

$$
r(P_1 + P_2) \sim r(P_1) + r(P_2) - r(\mathcal{O})
$$

Divisor equivalence just means that these divisors differ from each other by some function we'll call $\phi$. And if we subtract $r(\mathcal{O})$ from both sides:

$$
r(P_1 + P_2) - r(\mathcal{O}) = r(P_1) - r(\mathcal{O}) + r(P_2) - r(\mathcal{O}) + (\phi)
$$

There you go! That's the divisor we were after. In terms of function divisors, the expression maps to the following product:

$$
f_{r, P_1 + P_2} = f_{r, P_1}.f_{r, P_2}.\phi
$$

All this to say: to prove bilinearity, we just need to show that:

$$
\phi(D_Q) = 1
$$

The same machinery applies once more: function evaluation over divisors, disjoint supports, and a final application of Weil reciprocity. We can show that this extra $\phi$ term effectively **vanishes**, giving us bilinearity.

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-8/confused-cat.png" 
    alt="Confused cat"
    title="I be like 'ahhh okay'... But I don't get"
    width="500"
  />
</figure>

So yeah! While the pairing formula might have looked arbitrary at first, it's tightly related to Weil reciprocity, which is the glue that brings this all together!

---

## The Tate Pairing

That's one pairing down - but there's another one I want to show you.

It's a bit different from the last one - while the Weil pairing required both inputs to come from the r-torsion, the Tate pairing is slightly more flexible as it formally only needs one of them to be an r-torsion point.

I reckon you're pretty tired at this point.

> Take a break if needed!

A bit of bad news though: despite the extra flexibility, this pairing is arguably **more complicated** than the previous one. I'll try to keep it friendly though!

And to start us off, we need some definitions.

### A New Group

The r-torsion, as we already know, is the set of all points such that $[r]P = \mathcal{O}$.

<figure>
  <img
    src="/images/elliptic-curves-in-depth/part-8/it-is-known.gif" 
    alt="'It is known' scene from Game of Thrones"
    width="500"
  />
</figure>

Now, what happens when we multiply other points by $r$? Let's collect them all into another set, $rE$.

$$
rE = \{ [r]P : \ P \in E(\mathbb{F}_{q^k}) \}
$$

This is just the set of all points "$r$ times something". Turns out this forms a **subgroup** of our elliptic curve.

Similar to how we treated [quotient rings](/en/blog/cryptography-101/rings/#quotient-rings), we can use this group to define a "quotient group" $E/rE$ - interpreted as "$E mod rE$", where two points are considered the same if their **difference** is in $rE$.

> In other words, points $P_1$ and $P_2$ are equivalent if $P_1 - P_2 = [r]Q$ for some point $Q$.

Now, say we pick some point $P$. And we start generating points via the following strategy: pick another point $Q_1$, and calculate $P + [r]Q_1$. Then do the same with $Q_2$, $Q_3$, $Q_4$, and so on, until you run out of points in the curve.

What you'll find is that you have obtained a **subset** of $E$. If you pick another starting point (not in this new subset), you'll get an **entirely different subset**, completely **disjoint** from the previous one.

These disjoint sets, we call **cosets**. And they represent [equivalence classes](/en/blog/cryptography-101/rings/#equivalence-relations-and-classes).

So, all in all, $E/rE$ is the set of **equivalence classes**, or of representatives of said cosets.

---

Yeah, I know. **Why the hell does this matter?**

The Tate Pairing is defined by taking an input from the r-torsion, and the other one from $E/rE$. Although, under the right circumstances, something quite magical happens: each r-torsion point represents a **unique, different coset**!

Which means - we can end up taking both inputs from the r-torsion.

### The Pairing

With this in mind, let's proceed to the definition. And let's do it in (quasi) rigorous fashion.

Let $P$ be a point in the r-torsion, we know we can find a function with divisor $(f) = r(P) - r(\mathcal{O})$, and let $Q$ be a representative of $E/rE$. Also, we'll need a divisor such that:

$$
D_Q \sim (Q) - (\mathcal{O})
$$

With disjoint support from $(f)$. With this, the Tate pairing is simply the map:

$$
t_r(P,Q) = f(D_Q)
$$

In this context, the output of this pairing is a member of an **equivalence class**:

$$
t_r(P,Q) \in {\mathbb{F}^*}_{q^k}/({\mathbb{F}^*}_{q^k})^r
$$

> Which is defined as you would expect at this point.

This is not cool - usually, in pairing computation, we rely on the fact that different parties are able to compute the **exact same value**, not a representative of an equivalence class. To avoid this, we introduce the **reduced Tate pairing** as:

$$
T_r(P,Q) = f(D_Q)^{(q^k - 1)/r}
$$

What this achieves (let's say **magically**, but you can check yourself!) is sending all elements in the resulting equivalence classes to a **unique r-th root of unity** in the field.

Proving bilinearity is not too different from the Weil pairing case, so I leave it to you as an exercise!

---

## Summary

Alright! That's a wrap for now.

We've defined both main pairings today, taking the time to look into some of the more subtle details that make them work. And while the different components in our definitions feel quite simple, all these definitions are rooted in deep mathematics that we simply cannot cover here if we hope to keep this brief.

> Things like topology, algebraic geometry, Galois theory, and complex analysis.

Also, you might find that there are some variants or optimizations of these pairings - but the two fundamental definitions are the two we've seen just now.

It's all fantastic with the **functional definitions**, but we've said nothing about how to efficiently **compute pairings**. Much like we have the **double-and-add rule** for point multiplication, we'll see that pairing computation will also require the introduction of an efficient technique in order to be feasible.

And what role do the [trace](/en/blog/elliptic-curves-in-depth/part-7/#the-trace-map) and [anti-trace](/en/blog/elliptic-curves-in-depth/part-7/#the-characteristic-polynomial) map play in all this?

Do not fret - these questions will be answered in time, when we meet for the [next article](/en/blog/elliptic-curves-in-depth/part-9)!
