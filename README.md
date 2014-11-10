#Thaumatrope

**What?** Thaumatrope is a proof-of-concept Chrome extension to add public key encryption to direct messages on Twitter.

**How?** Thaumatrope uses the [Keybase API](https://keybase.io/docs/api/1.0/) to find available keys and [kbpgp](https://keybase.io/kbpgp/) to do the heavy lifting.

**Why?** Keybase provided a neat API and PGP library, so why not?

**Should I use this?** Probably not. I think it has potential, but it's entirely untested at this point. The real work is done by kbpgp, so it should be as safe as that is, but things may break here and there.

**Can I help?** Absolutely! Feel free to submit a pull request to fix or improve anything you see. Feedback is most certainly welcome.

**Is it free?** Released under the BSD 3-Clause license.

**What's with the name?** According to [wikipedia](https://en.wikipedia.org/wiki/Thaumatrope):
> A thaumatrope is a toy that was popular in the 19th century. A disk with a picture on each side is attached to two pieces of string. When the strings are twirled quickly between the fingers the two pictures appear to blend into one due to the persistence of vision.

One common set of images to use on a thaumatrope is a bird and a cage. This would give the appearance of a caged bird when twirled. Adding encryption to Twitter is like caging a bird. It's really quite obvious when you think about it. (Note: one other consideration was "The Free Chicken Illusion".)
