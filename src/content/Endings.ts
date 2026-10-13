import { StoryBeat } from './Story';
import { Subject } from '../types';
import { K } from '../gfx/Keys';

export type EndingKey = 'splat' | 'highNoon' | 'parentTrap';

/** Ending is chosen by how many bonus treasures were found, like the original. */
export function pickEnding(bonusItems: number): EndingKey {
  if (bonusItems >= 12) return 'parentTrap';
  if (bonusItems >= 5) return 'highNoon';
  return 'splat';
}

export const ENDINGS: Record<EndingKey, { title: string; beats: StoryBeat[] }> = {
  splat: {
    title: 'SPACE SPLAT',
    beats: [
      {
        backdrop: K.BG_STARFIELD,
        props: [[K.GELATOR_ANGRY, 700, 330, 1.2], [K.SPOT_HAPPY, 300, 420, 1.6]],
        lines: [
          { speaker: 'narrator', text: 'Blasternaut catches Gelator in the asteroid field. One well-aimed laser and... SPLAT! Gelator is spread across a passing asteroid.' },
          { speaker: 'gc', text: 'Spot is safe, Moldar is free, and Gelator is going to need a very large mop. Mission complete!' }
        ]
      }
    ]
  },
  highNoon: {
    title: 'HIGH NOON',
    beats: [
      {
        backdrop: K.BG_MOLDAR,
        props: [[K.GELATOR_ANGRY, 760, 470, 1.1], [K.BLASTERNAUT_STAND, 240, 500, 1.8]],
        lines: [
          { speaker: 'narrator', text: 'On the dusty surface of Moldar, Blasternaut and Gelator face off at high noon.' },
          { speaker: 'gelator', text: 'Draw, space cowboy!' },
          { speaker: 'narrator', text: 'Blasternaut is faster. The petrifying ray turns Gelator to stone, and he crumbles into a pile of dust. Spot hops free!' }
        ]
      }
    ]
  },
  parentTrap: {
    title: 'PARENT TRAP',
    beats: [
      {
        backdrop: K.BG_BRIDGE,
        props: [[K.GELATOR_GRIN, 520, 300, 0.8], [K.SPOT_HAPPY, 300, 430, 1.6]],
        lines: [
          { speaker: 'narrator', text: "Just as Gelator is cornered, two ENORMOUS slime monsters ooze onto the bridge. Gelator's parents!" },
          { speaker: 'gelator', text: 'Mom! Dad! I was only borrowing the planet...' },
          { speaker: 'narrator', text: 'Gelator, it turns out, is a very naughty child. He is grounded for a thousand years, and Spot is returned with an apology.' },
          { speaker: 'gc', text: 'You found every bonus treasure and earned the best ending. Congratulations, Blasternaut!' }
        ]
      }
    ]
  }
};

export const MATH_TIPS: Record<Subject, string[]> = {
  addition: ['Add the ones first, then the tens.', 'Count up from the bigger number.', 'Making ten helps: 8 + 5 is 8 + 2 + 3.'],
  subtraction: ['Count back from the bigger number.', 'Think: what do I add to the small number to reach the big one?', 'Subtract the ones, then the tens.'],
  multiplication: ['Skip count: 4 × 3 is 4, 8, 12.', 'Times 10 just adds a zero.', 'Doubling helps: 6 × 4 is double 3 × 4.'],
  division: ['Think of the times table backwards.', '12 ÷ 3 asks: how many 3s make 12?', 'Sharing equally is dividing.'],
  estimation: ['Round each number to the nearest ten first.', 'Look at the ones digit: 5 or more rounds up.', 'Estimates are close, not exact.'],
  fractions: ['The bottom number tells how many equal parts.', 'Same bottom numbers? Just add the tops.', '50% is one half, 25% is one quarter.'],
  patterns: ['Find the jump between the first two numbers.', 'Check that the jump works for every step.', 'Some patterns grow by doubling.'],
  review: ['Read the sign carefully before you start.', 'Use the hint if you are stuck.', 'Every mistake teaches you something!']
};
