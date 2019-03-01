## Tail Collisions

### The Setup

[Lightcycles](https://beatobongco.com/lightcycles/) is a game of 2-player snake where you aim to cut your opponent off and make him crash into the wall, your lighttrail, or his own lighttrail.

Complexities in the gameplay arise from (1) the ability to accelerate and (2) the ability to slipstream

![Slipstreaming image](https://github.com/beatobongco/lightcycles/blob/master/devjournal/img/slipstream.gif)

*Accelerate up to 6 times normal speed and gain 50% speed near lighttrails (slipstreaming)*

### The Problem

A really interesting problem I had with lightcycles is the player hitting his own tail and dying when making really tight turns.

![Death by own lighttrail image](https://github.com/beatobongco/lightcycles/blob/master/devjournal/img/death_by_tail.gif)

*The red square is the player's hitbox. Turning really fast causes you to crash into your lighttrail*

This makes a "cooldown" necessary: players need to clear the trail before moving in the opposite direction.

The game would count the frames from the last time the player moved and would not execute a move until a number of cooldown frames had passed. 

This approach caused some problems:

1. When moving, it is not possible to make many tight turns in succession due to cooldown
2. The controls would frustrate players with fast fingers since inputting directions quickly (\*) would lose an input (called "ghosting" in games) and crash into the wall or other objects

![The U-turn move](https://github.com/beatobongco/lightcycles/blob/master/devjournal/img/uturn.gif)

*An early version of "U-turn". It required very precise timing to execute. I wanted a high-skill move in the game like Tekken's [EWFG](https://youtu.be/9gzGtdxQXvc?t=61) \(Here's the execution on [keyboard](https://youtu.be/nEjveNvT4yE?t=21) \)*

### The Solution

I decided to break down the problem into pixels for better visibility. The player would crash into his own tail because he hadn't travelled a sufficient distance to clear the lighttrail hitbox.

![Problem diagram](https://github.com/beatobongco/lightcycles/blob/master/devjournal/img/problem_diagram.png)

#### Legend

color | representation
-- | --
RED | player hitbox
BLUE | lighttrail hitbox
LIGHT BLUE | slipstream hitbox

#### Distance, not frames

The first solution which sounds really simple (but wasn't obvious to me before drawing the problem on paper) was that the player moved multiple units of distance per frame so it was not right to use `frames` as cooldowns but rather `distance` moved. 

![Solution diagram](https://github.com/beatobongco/lightcycles/blob/master/devjournal/img/solution_diagram.png)

I gave each player a variable that would increment every time he moved one unit and reset to 0 every time he made a legal move.

Even if the cooldown is now just 3 units, this still didn't solve the second problem. Key ghosting is a frustrating problem even in classic lightcycles games like https://www.fltron.com/ . Even if it's just 3 units, it would feel sluggish for hardcore players to lose an input.

#### Movement buffer

So I took a page from Tekken and other fighting games. 

In Tekken you can "buffer" or queue commands even when it looks like your character isn't accepting any inputs. I implemented an array for each player that would store up to 2 commands (overwriting the oldest one). 

```js
  const d = player.directionBuffer; // Array
  if (d.length < 2) {
    d.push(direction);
  } else {
    d.shift();
    d.push(direction);
  }
```

If the player was not on cooldown and there were items in the array he would consume / `shift` the first element. The result is a much more fluid movement experience, and the just-frame `U-turn` is easier to do (but still difficult enough to execute in a real game). 

## Thanks for reading!

Hope you enjoyed this little war story!

![Bit image](https://vignette.wikia.nocookie.net/tron/images/1/1a/TRON_Wiki_-_NAVI_Bit1.jpg/revision/latest?cb=20150626055445)
