---
title: 'The ZK Chronicles: Fast Fourier Transform'
author: frank-mangone
date: '2026-04-01'
readingTime: 13 min
thumbnail: /images/the-zk-chronicles/fast-fourier-transform/carrey.jpg
tags:
  - zeroKnowledgeProofs
  - fastFourierTransform
  - polynomials
description: >-
  Before we go on any further, we must stop and take a look at one of the most
  important algorithms enabling most of the things we're doing
mediumUrl: >-
  https://medium.com/@francomangone18/the-zk-chronicles-fast-fourier-transform-c8e59a4e38b0
contentHash: a1ec67413ef6111b92f315b947ebc46bd5516f86473b97bef6caa1ca3f9dc8ef
---
I was a bit hesitant to dedicate a full article to this topic at first. I usually like covering broader subjects on each delivery. You know, thematic packages that feel cohesive.

The thing though, is that besides being extremely useful, this is one of the most elegant algorithms you’ll find out there.

It’s so ubiquitous, that you’ll most probably never have to implement it. And yet, there’s a lot of value in understanding the ins and outs of its beautiful design.

Of course, I’m talking about the [Fast Fourier transform](https://en.wikipedia.org/wiki/Fast_Fourier_transform), or **FFT** for short.

As I [previously mentioned](/en/blog/the-zk-chronicles/math-foundations/#interpolation), this allows **efficient polynomial interpolation**, and since this is an activity we’ll be using **a lot** in upcoming proving systems, FFT becomes essentially the **backbone** of said protocols.

I don’t think I can build much more hype than this, so let’s put all that energy to good use, and see what’s in store for us today!

---

## The Core Challenge

Let’s start by circling back to the [previous article](/en/blog/the-zk-chronicles/sigma-protocols) real quick.

Our analysis of Sigma protocols revealed that we could build a surprisingly simple mechanism to prove knowledge of an entire circuit. However, doing so required a number of commitments proportional to the number of multiplication gates. And that’s **no bueno amigo**.

To circumvent this, other protocols out there opt for encoding the circuits as [polynomials](/en/blog/the-zk-chronicles/math-foundations/#polynomials) instead.

> How do they do that? I don’t want to spoil the fun, so here’s just a little teaser:
>
> Imagine we encode the **left input** ($a$) to each multiplication gate $i$ in as a polynomial $A(X)$, by requiring that $A(i) = a_i$. Likewise, the **right input** ($b$) is encoded in $B(X)$ so that $B(i) = b_i$. And the **output**, we encode in $C(X)$.
>
> Then, we’d need to prove that $A(X) \cdot B(X) = C(X)$ holds for all possible values of $i$!

This simple example (which, despite its simplicity, is behind one of the most popular modern ZK protocols, [Groth16](/en/blog/the-zk-chronicles/snarks-part-1)) tells us something important: when working with polynomials, we’ll often need perform operations with them — either by **adding polynomials together** or by **calculating their product**.

Each of these operations happen to be **efficient** when performed with a certain polynomial representation.

Oh, right. I don’t think we talked about that explicitly. There are **two main strategies** to represent polynomials:

- As a set of **coefficients**, as in $A(X) = a_0 + a_1X + a_2X^2 + ... + a_{n-1}X^{n-1}$. We may choose different bases when doing this, like for example [Lagrange bases](/en/blog/the-zk-chronicles/math-foundations/#lagrange-polynomials).
- Or as a set of **evaluations**: pairs of points $(i, A(x_i))$, that ultimately [interpolate](/en/blog/the-zk-chronicles/math-foundations/#interpolation) to the same polynomial. The first coordinate is the **index**, and the second is the **functional value**.

Coefficients make addition a breeze, while multiplication is more docile when using evaluations, because you just multiply the functional values at each index.

So, when some protocol (or any other type of application, really) requires us to perform multiple of these operations, having the freedom to switch back and forth between these forms is desirable. The question though, is whether we can do this **efficiently**: if the conversion costs are higher than just running the raw computations, then there’s no point in switching at all!

What is it then? Are the costs justifiable?

### The Naive Approach

Let’s analyze the most direct approach we can think of, and you’ll see how we soon run into problems.

Let’s start by analyzing the conversion from coefficients to evaluations. We want to evaluate some polynomial of degree $n$ at $n + 1$ different points (so that we can later interpolate back). A single evaluation requires us to at least calculate $X^n$, so it takes $\mathcal{O}(n)$ steps. And since we need to evaluate $n + 1$ points the whole conversion is $\mathcal{O}(n^2)$.

Then we have the inverse path, going from evaluations to coefficients. The standard way to do this involves constructing Lagrange basis polynomials, and combining them. Without diving into the details, this process requires even more work, ranging between $\mathcal{O}(n^2)$ to $\mathcal{O}(n^3)$ operations.

Given those numbers, just how bad is the situation? Well, considering we want to encode circuits with potentially **millions of gates**, we’d be dealing with huge polynomials, and the conversion costs would be simply **insane**.

> Which means that, without a more efficient approach, these conversions are **completely off the menu**.

And so, we’ll ask the same question we’ve asked many ties throughout the series: **can we do any better**?

---

The answer is of course a big fat **yes**, courtesy of a clever insight about something have overlooked so far: that we can choose **where to evaluate the polynomials**.

Perhaps the most natural choice for this is to simply use **consecutive integers** as our indexes: $0$, $1$, $2$, $3$, and so on. That works just fine. But... What if I told you there’s a **much better option**?

---

## The Magic Properties

> [Remember](/en/blog/the-zk-chronicles/groups/#roots-of-unity)?

Yup! Roots of unity!

When we talked about them a [a few articles ago](/en/blog/the-zk-chronicles/groups/#roots-of-unity), it was in the context of groups. Really, we’re interested in the roots of unity of the **multiplicative group of integers modulo** $p$ this time. Because these will be the inputs to our polynomials, and they take integers as inputs.

Just as a short refresher, the nth-roots of unity of a group are the set of values $\omega$ such that:

$$
\omega^n = 1
$$

Yeah, cool. But those are just **numbers** in the end. What makes them so special?

<figure>
	<img
		src="/images/the-zk-chronicles/fast-fourier-transform/carrey.jpg"
		alt="Jim Carrey, confused" 
		title="Visible confusion"
	/>
</figure>

The secret lies in a couple special properties these little guys have: **symmetry** and **closure under squaring**.

### Symmetry

To understand what I mean by this, let’s work our way backwards. We know that when we have a **primitive** $n$th-root of unity, raising it to the n-th power gives us the identity, which in our case is just $1$.

With that information in mind, what would happen if instead of raising to the $n$-th power, we try **half of that**?

$$
\omega^{\frac{n}{2}} = \ ?
$$

> Provided, obviously, that $n/2$ is an integer!

Since it’s a primitive root of unity, the result can’t be $1$. Furthermore, it must be a number such that:

$$
(\omega^{\frac{n}{2}})^{2} = 1
$$

Ah, wait. There’s a clear candidate then: $-1$!

> Or well, in our case, $-1 \bmod p$.

Thanks to this observation, we can do something amazing: split the group on $n$ roots of unity into **pairs of opposites**, since:

$$
\omega^{k + \frac{n}{2}} = \omega^k \omega^{\frac{n}{2}} =-\omega^k
$$

Since we’re just multiplying by $-1$, we have a very fast way to get the (modular) opposite of a root of unity. This will be very important when aggregating results together, but it’s actually the other property that’s the secret sauce behind the algorithm.

### Closure Under Squaring

Similarly, we can ask ourselves what happens when we **square** a root of unity:

$$
(\omega^k)² = \omega^{2k}
$$

Which we can answer through some simple manipulation:

$$
1 = (\omega^k)^n = (\omega^{2k})^{\frac{n}{2}}
$$


Can you see it? Squaring any root of unity transforms it into an $(n/2)$**-th root of unity**!

<figure>
	<img
		src="/images/the-zk-chronicles/fast-fourier-transform/hollywood.jpg"
		alt="The iconic TV scene from Once Upon a Time in Hollywood" 
	/>
</figure>

It’s not hard to deduce that there are exactly **half as many** $(n/2)$-th roots of unity than there are $n$-th roots of unity. Which is interesting because, if we take it one step further and square **all** $n$-th roots of unity, something quite magical happens.

$$
\{(\omega^0)^2, \omega^2, (\omega^2)^2, (\omega^3)^2, ..., (\omega^{n-1})^2 \} = \{1, \omega^2, \omega^4, \omega^6, ..., {\omega}^{2(n-1)} \}
$$

This set of squares has size $n$, but only has $(n/2)$-th roots of unity... So there must be **repeated values** in there! In fact, we get each of these roots **exactly twice**! 

> Try seeing how that looks for yourself!

You’d be completely forgiven to assume this is just a fun fact, and you’d also be **completely wrong**: this is the **entire reason** the Fast Fourier transform works at all!

We just need to find a clever way to exploit these properties.

---

## Divide and Conquer

The technique we’re about to use is one we’ve actually already [tapped into in the past](/en/blog/the-zk-chronicles/sum-check): **recursion**.

In a nutshell, what we’ll try to do here is to reduce a bigger problem into a **smaller version of itself**, and in doing so, considerably cut computation costs. It’s a beautifully simple idea, and in certain situations where the stars align in just way, it can be immensely powerful.

> And this happens to be one of those situations!

Right, so the setup is as follows: let’s say we have a polynomial $A(X)$ of degree $n - 1$, which we want to transform from its coefficients form, to its evaluation form.

We’ll start by splitting $A(X)$ into **odd and even powers**. We then select the corresponding coefficients, and build a couple new polynomials, like this:

- From even-powered terms: $A_E(X) = a_0 + a_2X + a_4X^2 + a_6X^3 + ...$
- From odd-powered terms: $A_O(X) = a_1 + a_3X + a_5X^2 + a_7X^3 + ...$

The mismatch between the coefficient indexes and the powers may throw you off at first, but it’s actually **not arbitrary**. The reason for this is that the original polynomial $A(X)$ can be expressed as a clever combination of these two new ones:

$$
A(X) = A_{E}(X^2) + X.A_{O}(X^2)
$$

That’s a cool trick — but on its own, it doesn’t amount to much. The real fun starts when we combine this with our knowledge about roots of unity.

### Evaluation

Let’s try plugging in a root of unity into that form of $A(X)$, and see what happens:

$$
A(\omega^k) = A_{E}(\omega^{2k}) + \omega^k A_{O}(\omega^{2k})
$$

Instead of evaluating $A(X)$ directly at each nth-root of unity, the above expression suggests that we can get the same result by evaluating a couple other polynomials at the $(n/2)$-th roots of unity.

And here, our **closure property** comes in clutch: we know the number of $(n/2)$-th roots of unity is **half** that of the $n$-th roots of unity!

The consequence is very nice: some evaluations of $A_E(X)$ and $A_O(X)$ can be reused, since they repeat! Or, to put it even more visually, you can easily check that:

$$
A(\omega^{k + n/2}) = A_{E}(\omega^{2k}) + \omega^{k + n/2} A_{O}(\omega^{2k})
$$

Ahá! Our problem of evaluating $A(X)$ at $n$ points has been reduced to evaluating $A_E(X)$ and $A_O(X)$ at **half as many points**, and performing some simple operations. This, we can do as long as we can evaluate $A_E(X)$ and $A_O(X)$ efficiently as well... But wait...

::: big-quote
That was our original problem, just roughly half the size!
:::

Yes! This is exactly where **recursion** kicks in: we can continue doing this over and over thanks to the nice properties of the roots of unity!


<figure>
	<img
		src="/images/the-zk-chronicles/fast-fourier-transform/omg.jpg"
		alt="Oh my fucking god" 
	/>
</figure>

And as if that wasn’t enough, the icing on the cake is provided by the **symmetry property** we studied before. Since we know that:

$$
\omega^{k+n/2}=-\omega^k
$$
Then our second evaluation becomes:

$$
A(-\omega^{k}) = A_{E}(\omega^{2k}) — \omega^{k} A_{O}(\omega^{2k})
$$

> Which looks exactly like the evaluation at $\omega^k$, but with a minus sign in there!

---

In summary, we need to execute these steps for each $k$ from $0$ to $n/2 - 1$:

1. Evaluate $A_E(\omega^{2k})$ once
2. Evaluate $A_O(\omega^{2k})$ once
3. Compute $\omega^k A_O(\omega^{2k})$$ once
4. Calculate $A(\omega^k)$ by adding the results together
5. Calculate $A(-\omega^k)$ by subtracting instead

And we get the two evaluations for **barely more** than the cost of one, since we’re evaluating two polynomials of **half the degree**, at **half as many points**!

It’s incredible how the pieces fall into place, as if guided by some invisible math genie. So much so, that one can’t help but still have doubts, until presented with a working example.

So let’s do that!

### A Concrete Example

We’ll work in $\mathbb{F}_{17}$, whose multiplicative group is $\mathbb{Z}_{17}^*$. This field is nice because it has primitive **4th roots of unity**, which means we can do a small example using $n = 4$.

First, we’ll need the concrete values for the roots of unity. The value $\omega = 4$ happens to be a primitive root of unity in this case, so if you work your way through the operations, you’ll find that the set of roots looks like this:

$$
H = \{1,4,16,13\}
$$

Perfect! Next, let’s take a simple polynomial, like: $A(X) = 3 + 2X + 5X^2 + 7X^3$. We want to evaluate this at the points in $H$ (our roots of unity), so we proceed according to our recursive process:

- First, separate into even and odd coefficients, resulting in $A_E(X) = 3 + 5X$ and $A_O(X) = 2 + 7X$.
- Next, we need to evaluate these two polynomials at the **2nd-roots of unity**, which are simply $\{1, 16\}$. These are very basic operations (since the polynomials have degree $1$) that result in:

$$
A_{E}(1) = 8, \ A_{E}(16) = 15, \ A_{O}(1) = 9, \ A_{O}(16) = 12
$$

- We then combine using the symmetry property. For example, for $k = 0$ we have: $A(1) = 8 + 9 \bmod 17 = 0$, and $A(-1) = A(16) = 8 – 9 \bmod 17 = 16$. Just repeat with $k = 1$, and we’re done!

> The final result is $A(1) = 0$, $A(4) = 12$, $A(16) = 16$, and $A(13) = 1$, just in case you’ve been following with pen and paper and want to check!
> 
> And if you’re already doing that, make sure to also check that this matches direct evaluation!

That’s it! Just split, recurse, and combine. Rinse and repeat, and we have our FFT algorithm!

---

This little example might not seem like much of an improvement, but still, you can already see some gains:

- the direct approach requires 4 evaluations, with 4 operations each (calculating $X^3$ and then adding all terms together), so roughly 16 computation steps total.
- in contrast, FFT took 4 evaluations (of the split polynomials) plus 4 combinations, so 8 operations total.

It’s **half the effort**! And it gets even better as we try with bigger polynomials: each recursive step will take $\mathcal{O}(n)$ operations, and the number of steps is **logarithmic** with respect to $n$ (we divide the number of evaluations by two on each step!), so the overall complexity of the algorithm is $\mathcal{O}(n.log_2(n))$.

> To put this into perspective, when $n = 100$, the direct evaluation would take around $10000$ steps, while FFT would only require around $650$ steps!

### Interpolation

With this, we have an efficient way to go from coefficients to evaluations.

Could we not try to go the in the **other direction**? You know, to truly be able to transform back and forth between forms. Is there a similar trick here?

Amazingly, this **also works the other way around**!

The **inverse FFT** uses almost the exact same algorithm, with just a couple small tweaks. To understand how this operates, we need to change our perspective a bit — we have to imagine the process of obtaining evaluations as a **matrix multiplication**:

$$
\begin{bmatrix} 1 & 1 & 1 & 1 \\ 1 & \omega & \omega^2 & \omega^3 \\ 1 & \omega^2 & \omega^4 & \omega^6 \\ 1 & \omega^3 & \omega^6 & \omega^9 \end{bmatrix} \begin{bmatrix} a_0 \\ a_1 \\ a_2 \\ a_3 \end{bmatrix} = \begin{bmatrix}  
A(\omega^0) \\ A(\omega^1) \\ A(\omega^2) \\ A(\omega^3) \end{bmatrix}
$$

The matrix in that equation up there is called the **Discrete Fourier Transform** (**DFT**) matrix. From this point of view, it’s pretty obvious that all we have to do is solve this equation is calculate the **inverse** of this matrix, and then multiply accordingly.

What’s more, the structure of the inverse is actually quite nice! For our $n = 4$ example, we’d get:

$$
\frac{1}{4}\begin{bmatrix} 1 & 1 & 1 & 1 \\ 1 & \omega^{-1} & \omega^{-2} & \omega^{-3} \\ 1 & \omega^{-2} & \omega^{-4} & \omega^{-6} \\ 1 & \omega^{-3} & \omega^{-6} & \omega^{-9} \end{bmatrix}
$$

> The generalization of this is just what you’d expect: a bigger matrix, and a scalar factor of $1/n$!

And with that, we get the algorithm to recover the coefficients from evaluations almost for free!

---

## Summary

FFT is one of those algorithms that feels **almost magical**. Everything just clicks.

> No wonder we owe it to the efforts of great mathematicians like Gauss or Fourier!

Everything started with the rather uninspiring observation that we can choose where to evaluate our polynomials. And it was by choosing a set with some very nice properties, that we ended up with this genuinely beautiful algorithm.

The FFT is hugely important for ZK for its ability to make operations on large polynomials computationally feasible. And as I mentioned at the very start of the article, you’ll probably never have to implement it yourself: pretty much every ZK library out there will include a highly-optimized version of the algorithm, with even more little tricks like parallelism, caching, and more.

> Plus, there are several nuances to take into account that I didn’t mention explicitly. For instance, you need to make sure to evaluate in a number of points that’s a **power of** $2$, which requires the polynomials to have specific degrees, and the finite fields of choice to contain the appropriate set of roots of unity!

So yeah, there’s more to this story — but I think what we’ve covered should be sufficient for us.

---

And since we’re in the topic of polynomials, I’d like our next stop to showcase yet another ingredient we’ll need in our journey.

What we’re about to study is what allows us to make the quality jump from our Sigma protocols, to the more modern techniques that can fully exploit FFT, and thus provide a degree of efficiency that finally brings ZK into the domain of practicality.

Thus, [next time](/en/blog/the-zk-chronicles/commitment-schemes-part-2) we’ll talk about **polynomial commitment schemes**, one of the last remaining gadgets before we go full ballistic on modern ZK algorithms.

> And we’ll finally shed some light on the [oracle access](/en/blog/the-zk-chronicles/sum-check/#closing-the-loop) we’ve been keeping on the freezer for so long!

Until then!
