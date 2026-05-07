---
title: WTF is Entropy
date: '2026-05-06'
author: frank-mangone
tags:
  - entropy
  - theormodynamics
  - informationTheory
  - cryptography
thumbnail: /images/wtf-is/entropy/desk.webp
description: >-
  We explore the mysterious and misunderstood concept of entropy, and discover
  how it pops up in unexpected places.
readingTime: 13 min
contentHash: 34f72deb7b80afde808efe8b7fb13af9a4d5687364add63be84c69b5ee0d4090
---

If we had to pick the most widely misunderstood concept from science in general, I'm willing to bet a strong contender would be the concept of **entropy**.

Think about it for a second - what's your conception about this topic? Unless you're into the specifics, chances are you've heard something along the lines of entropy measuring the degree of **disorder** in a system. And while there's some truth to that, it's a very vague way of describing what entropy truly is.

But it also feels like an important and ubiquitous concept, doesn't it? In fact, it shows up in many different fields of knowledge: physics, information theory, cryptography, and more.

> Funnily enough, each field discovered it on its own terms, and they all ended up describing the exact same thing!

So what's with this strange concept then? And what on Earth do thermodynamics have to do with how we encrypt a secret?

Well my friends, that's the mystery we're going to unravel today!

This will be an interesting one. Sit tight, and let's get straight to business!

---

## Intuition

Let's start with the basic idea that has earned its place as the basic intuition for what entropy is.

Picture your working desk. If you're anything like me, not organizing that desk for a few weeks will result in an absolute mess of papers lying around, a few tangled cables, maybe a couple boxes that shouldn't be there, and maybe even some alien objects like, I don't know, a suncatcher your wife took off a window last sunday.

> True story. Don't judge me, ok?

None of that was planned. It just... kinda happened naturally. 

But now imagine the reverse happens: you wake up one morning and your previously chaotic desk has spontaneously organized itself overnight. Papers sorted, cables neatly bundled, no junk lying around. Unless you're aware of the existence of a friendly poltergeist that happens to love cleaning up, you'd probably be baffled - and rightfully so. That simply **doesn't happen**.

But **why** doesn't it? Nothing in the laws of physics strictly forbids things from spontaneously "organizing". After all, atoms are allowed to move in any direction, so what's stopping them from conspiring in your favor and tidying things up?

Turns out the answer is astonishingly simple:

::: big-quote
There are vastly more ways for your desk to be messy than to be tidy.
:::

> It's so simple, it doesn't even feel right!

One nice way to wrap your head around this is by imagining the state of your desk as a **possible configuration** of the objects you usually have on it. Try to visualize how many of those configurations would qualify as "tidy", and how many would qualify as "messy".

<figure>
	<img
		src="/images/wtf-is/entropy/desk.webp"
		alt="A messy desk"
		title="Be honest with yourself, nobody's gonna judge you here!"
	/>
</figure>

Indeed, **almost anything** qualifies as a messy configuration, while a tidy configuration requires everything to be in just the right place. So if you could pick a random configuration for said desk, you'd most likely pick a disorganized configuration, because **disorder** wins over by a large, large margin!

This is the exact same reason you can't unscramble an egg, or that you can't recover dissolved salt from water. The scrambled state isn't more "stable" in some obscure sense, it's just that there are astronomically many more ways to be scrambled than to be a pristine yolk sitting neatly in a white. Once you're in that messy territory, the odds of randomly wandering back out of it are essentially zero.

And that's the whole idea behind entropy. It's not "disorder" as some vague aesthetic judgment, but a precise **count** of how many ways a system can be **arranged**, and still look the same from the outside.

### Formalization

It's all good and dandy with analogies, but science doesn't run on those. At some point, someone had to sit down and actually write down a formal definition.

That someone was a guy called [Ludwig Boltzmann](https://en.wikipedia.org/wiki/Ludwig_Boltzmann).

> Mind you, that "guy" was one of the most influential scientists of his time, even if his theories were validated after his passing.

Back in the 19th century, Boltzmann was plagued by the same question we posed a few paragraphs back, only that his focus was on **physical systems** rather than desks or eggs. He wondered why a system like a gas could exhibit such predictable properties (like its temperature or pressure), when in reality those were the result of an unimaginably large swarm of molecules just minding their own businesses.

At a microscopic scale, everything is chaotic; but then at a macroscopic scale, everything seemed to coalesce into a single, clean emergent value. How could that even be possible?

<figure>
	<img
		src="/images/wtf-is/entropy/microstates.png"
		alt="Microstates describing roughly the same macrostate"
		title="[zoom]"
	/>
</figure>

So Boltzmann essentially did what we did just a moment ago with our figurative desk: he chose not to track individual molecules, but to **count the possible states** of the system instead.

The idea is again beautifully simple once we break it down. You see, when we observe a system, we're looking at what he called a **macrostate**, which is of course the result of the system being in a particular microscopic state, called a **microstate**. But many possible microstate arrangements can describe the same macrostate, and so he proceeded to write this down in one of the most elegant equations in all of physics:

$$
S= k_B \cdot ln(\Omega)
$$

Where $\Omega$ is the number of microstates compatible with the observed macrostate, $k_B$ is just a tiny constant (named after Boltzmann, of course), and then... would you care to guess what $S$ is?

Yes, of course - it's **entropy**!

> Fun trivia fact: the equation is so important to Boltzmann's legacy that it's literally engraved on his tombstone in Vienna.

<figure>
	<img
		src="/images/wtf-is/entropy/boltzmann.webp"
		alt="Boltzmann's tombstone"
		title="No kidding"
	/>
</figure>

That paints a much clearer picture of what entropy really is: it's just a measure of how many microscopic arrangements can give rise to what we observe. A highly "ordered" system has really low entropy, because such state is explained by very few microstates, and the opposite can be said of "disordered" states.

In a way, entropy is a way of measuring **uncertainty**. If we look at this the other way around, when we look at a highly-likely macrostate, what happens is that there's a myriad of microstates that could describe it, so we have no certainty about which of those underlying arrangements is responsible for what we're observing.

---

Boltzmann's definition of entropy became one of the foundational pillars of a field called [statistical mechanics](https://en.wikipedia.org/wiki/Statistical_mechanics), which is the branch of physics that bridges the microscopic world of atoms and molecules with the macroscopic world we actually live in.

The power of this formulation is that it turns our intuition about disorder into something we can actually **calculate**.

And I presume you're still wondering just **what the heck** this has to do with cryptography. As it turns out, this shift from intuition to calculation is exactly what allows entropy to transcend physics, and show up in places we might not expect.

---

## From Physics to Information

Our story now crosses the Atlantic Ocean, where a few years after Boltzmann's passing, another great mathematician would soon be born: [Claude Shannon](https://en.wikipedia.org/wiki/Claude_Shannon).

Around the halfway mark of the 20th century, Shannon was honing into a different matter: to understand the fundamental limits of **communication**. At the time, he wondered what would happen to a message being sent through a noisy channel, like a telephone wire, or a radio signal. The noise in the channel would alter the transmitted information, so he wondered just how much information could be transmitted **reliably**.

But how do you even **measure information**? Before he could analyze any results, he first needed a **definition**. So the question he really needed to answer was none other than:

::: big-quote
Just what is information?
:::

Believe it or not, there wasn't a clear definition at the time. And if you stop to think about it, you'll see that it's quite the tricky question to answer.

Is it, perhaps, the length of the message? But if you already know what someone is gonna say, then does it make sense to measure information as message size? Not really, I'd say. However, if we don't know what to expect from a message, then whatever information it contains is absolutely new to us. It's **maximally informative**, so to speak.

In a way, that little exercise from before tells us that information is related to **uncertainty**. The more **surprising** a message is, or the less predictable it is, then the more information it carries.

<figure>
	<img
		src="/images/wtf-is/entropy/ishowspeed.jpg"
		alt="IShowSpeed shock meme"
		title="OMG that carries so much information!"
	/>
</figure>

And so, he chose to model information around this idea of uncertainty or surprise. All he needed was to assign it a number.

Concretely, the formulation relates the probability $p$ of a message occurring, to its "degree of surprise", measured simply as $\text{log}(1/p)$. Rare messages (those with low $p$) carry high surprise, while common messages (those with high $p$) carry low surprise. Simple, right?

Furthermore, he defined the "average surprise" for all possible messages as:

$$
H=−\sum_i​ p_i​ \cdot \text{log}(p_i)​
$$
> Just so that this doesn't **surprise you** (sorry for the lame joke), it's easy to check that $\text{log}(1/p_i) = -\text{log}(p_i)$.

This measure is highest when all messages are equally likely, or when there's maximum uncertainty (and this, maximum information). And it collapses down to zero when the outcome is nearly certain.

Cool! But what does this have to do with **entropy**?

### Information Entropy

Well, all that Shannon needed at this point was to bestow a name upon his new measure.

In his search for a good name, he turned to his colleague [John von Neumann](https://en.wikipedia.org/wiki/John_von_Neumann) (yeah, bro was casually friendly with another one of the greatest minds of the 20th century) for advice. Von Neumann's response happened to be quite brilliant, though [probably mischievous in spirit](https://mathoverflow.net/questions/403036/john-von-neumanns-remark-on-entropy). 

And I cite, not at all literally:

::: big-quote
Call it entropy. It's the same formula as Boltzmann's, and besides, nobody really knows what entropy means anyway. So in any debate, you'll always have the advantage.
:::

> Or so the story goes.

Right on the money! The fact that the equations looked exactly the same was no coincidence at all. Sure, Boltzmann counted states of molecules, and Shannon measured possible messages, but deep down they were both measuring the same thing: **uncertainty**. 

---

Awesome! While we haven't given any universal definition of entropy, we've successfully established that it's tightly related to uncertainty.

And I guess the next natural thing to ask ourselves is whether this idea can be applied to **other areas**. In other words, is this a happy crossover between physics and information theory, or is there something even more fundamental happening here?

I spoiled this one a bit earlier I reckon, but still, the answer is that this idea does appear in other areas, in quite interesting ways.

Especially this next one.

---

## Hiding a Secret

> This will be quite the radical shift of gears, but hear me out. I promise it will make sense in the end!

Quick question: what does it mean to **keep a secret**?

<figure>
	<img
		src="/images/wtf-is/entropy/silence.jpg"
		alt="Jim stopping Dwight from sharing information"
		title="I said shut it!"
	/>
</figure>

Well, keeping a secret means that there's someone that's may try to gain knowledge of this secret **information**, and you're preventing that someone from doing so. For the sake of the argument, let's call that someone Bob.

> That little scheming bastard...

Information, eh? We've said quite a few things about information already. In particular, we pinned it down to **uncertainty**, but in this case, the uncertainty lies somewhere we might not expect: it's in Bob!

The less certainty Bob has about the secret, the better protected it is. Quite simple once we put it into words, right? And of course, that uncertainty has a name - one you probably already know by this point of the article:

::: big-quote
A good secret has high entropy.
:::

A typical example of this is **passwords**. Would you say that a password like `123456` is good? Probably not, right? But why is it bad exactly?

It's bad because an attacker trying to guess your password will have a field day. The number of "reasonable guesses" they need to try before they discover your password is very small. Or we can put this in terms of entropy: that password sits in a very small space $\Omega$ of **likely choices**. That's produces a **low entropy**, and consequently, a terrible secret.

> Remember kids: always use lowercase, uppercase, numbers, symbols, and at least 20 characters.

Once again, it's the same argument from before in disguise. Only this time, this framing is the core intuition behind one of my personal favorites areas of knowledge: **cryptography**.

### Cryptography

At its heart, cryptography is the science of **engineering uncertainty**.

Cryptographic systems take some piece of information and transform it in such a way that an attacker (looking at you, Bob) is left staring at a piece of information that could have been produced in an absurdly large number of ways. He knows the output, sure, but the input could have been any one value of an enormous set of possible values.

> Or in Boltzmann's terms, we can say an attacker holds **macrostate** with an extremely large $\Omega$ of possible underlying secrets, or microstates!

This is true for things like [encryption](/en/blog/cryptography-101/encryption-and-digital-signatures/#encryption) and [digital signatures](/en/blog/cryptography-101/encryption-and-digital-signatures/#digital-signatures). No need to worry if you're not very acquainted with either topic, because we can bring it into this realm of entropy quite easily. You see, these systems both rely on a **key**, which is a little secret gadget that controls **how information gets scrambled**. And this key is usually an integer, chosen from a very large set of possible integers.

Just like passwords though, the quality of this key is entirely determined by its entropy. If the number is picked truly at random from the large set of possibilities we mentioned before, then $\Omega$ is truly large, and Bob will have a very hard time to decipher it. But if it's generated in a predictable way (like through a weak random number generator, or even a human picking a number by hand), then $\Omega$ collapses dramatically. The math of something like [RSA](https://en.wikipedia.org/wiki/RSA_cryptosystem) might be very sound, but the entropy ultimately betrays you!

> And this is why cryptographers are almost pathologically obsessed with randomness. Bad randomness has broken more cryptographic systems in practice than bad algorithms ever have!

Which begs yet another question: where does **true high-entropy randomness** come from?

### In Search of Randomness

Generating a truly random number is not an easy task. Your computer in particular is not naturally fit for the task, being that it's a **deterministic machine** - so most algorithms for random number generation are really pseudo-random.

So to find a good source of entropy, your computer needs to look somewhere else. And it needs to look no further the most unpredictable place of all: our physical world!

Yup! Modern operating systems harvest entropy from **unpredictable physical events** - things like the precise timing of your key presses, or mouse movements, or even network packets. But some researchers have taken this idea even further, asking whether it would be possible to somehow build randomness directly into a device.

And they succeeed, the result being what's called a **Physical Unclonable Function** (or PUF for short).

<figure>
	<img
		src="/images/wtf-is/entropy/poof.jpg"
		alt="The Fairly OddParents Poof!"
		title="No, not that kind of PUF"
	/>
</figure>

How they did it is quite mind-bending, really: when a silicon chip is manufactured, atomic-scale variations in the fabrication process make every chip **subtly unique**. We're talking variations so small and so chaotic that not even the manufacturer can ever reproduce them.

A PUF uses these variations as a **cryptographic secret**. What you do is challenge the chip with an input, and it responds with an output determined by its **unique physical disorder**. As a consequence, no two chips respond the same way, because the secret is literally baked into the chip!

> So it's thermodynamic entropy, frozen into the silicon molecules, doing cryptography. Crazy, isn't it?

And before we go, I want to go all in on this concept of looking for randomness in weird places. 

Because you can use **freakin' DNA** as a source of entropy!

> What the fuuuuuu-

<figure>
	<img
		src="/images/wtf-is/entropy/dna.png"
		alt="A DNA strand"
	/>
</figure>

Oh yeah. DNA strands are essentially nature's own high-entropy medium. A sequence of just a few dozen nucleotides (drawn from an alphabet of only four bases, which we can think of as letters A, C, G, and T), produces a combinatorial space so incredibly large it **dwarfs** anything a computer could enumerate.

Back in 1994, Leonard Adleman [famously used DNA molecules to solve a computational problem](https://en.wikipedia.org/wiki/Leonard_Adleman#:~:text=%5B8%5D-,Discovery,-%5Bedit%5D) by letting chemistry do the counting. And since then, researchers have demonstrated that cryptographic schemes can be built on DNA, where the entropy isn't generated by an algorithm, but by that same molecular chaos Boltzmann was studying a century earlier.

> Don't tell that's not a satisfying wrap!

---

## Summary

So, after all this, can we finally answer what entropy is?

Honestly, entropy **resists a single definition**. What we can say though is that entropy always poses the same question:

::: big-quote
How many ways could this have happened?
:::

That's the common factor to all our examples: Boltzmann counted molecular arrangements, Shannon counted possible messages, cryptographers count possible keys, PUF designers count atomic configurations, and DNA researchers count nucleotide sequences.

The domain changes every time, but the underlying question is always the same. And as you may imagine, it **doesn't end there**. You'll see entropy pop up in several places, like:

- **Probability and statistics**: the [likelihood function](https://en.wikipedia.org/wiki/Likelihood_function) in statistical inference is deeply related to entropy. When you fit a model to data, you're essentially minimizing the "surprise" between your model's predictions and reality.
- **Machine learning**: [cross-entropy loss](https://en.wikipedia.org/wiki/Cross-entropy), one of the most widely used training objectives in deep learning, is literally Shannon's $H$ applied to the difference between predicted and true probability distributions. Every time a neural network trains, it's doing entropy arithmetic!
- **Black hole physics**: [Bekenstein-Hawking entropy](https://en.wikipedia.org/wiki/Bekenstein%E2%80%93Hawking_radiation) suggests that the entropy of a black hole is proportional to its surface area. The universe itself seems to be doing the same counting, at the most extreme scales imaginable.
- **Evolution**: even natural selection can be framed as a process that reduces entropy in biological information, because genomes become increasingly "improbable" configurations relative to random chemistry.

> It's almost eerie, as if counting things was deeply embedded into the very fabric of reality. 

In the end, Von Neumann was right in more ways than one. Most people don't know what entropy is, because it's not only confusing, but also because it doesn't really belong in a single area of knowledge.

But everybody who looks carefully enough at their own field eventually finds it waiting there, doing its quiet, patient counting work.
