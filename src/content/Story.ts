import { DialogLine } from '../gfx/Ui';
import { MissionKey } from '../types';
import { K } from '../gfx/Keys';

export interface StoryBeat {
  backdrop: string;
  lines: DialogLine[];
  /** Optional sprite overlays: [textureKey, x, y, scale] */
  props?: [string, number, number, number][];
}

/** Opening cutscene, in the spirit of the 1996 intro. */
export const INTRO_SCRIPT: StoryBeat[] = [
  {
    backdrop: K.BG_PRISON,
    props: [[K.SPOT_HAPPY, 180, 140, 1.6]],
    lines: [
      { speaker: 'narrator', text: "Spot, the galaxy's most curious space pet, zooms past the prison planet Lock-Em-Up on a joyride." },
      { speaker: 'narrator', text: 'Behind the bars sit the old villains: the Trash Alien, Illitera, and Dr. Minus. All safely locked up... for now.' }
    ]
  },
  {
    backdrop: K.BG_OOZED,
    props: [[K.GELATOR_GRIN, 820, 200, 1.3], [K.SPOT_SCARED, 700, 300, 1.4]],
    lines: [
      { speaker: 'gelator', text: 'Well, well. A pet with a big brain! I am GELATOR, the brain drainer, and your smarts are MINE now!' },
      { speaker: 'narrator', text: "Gelator captures Spot and starts using Spot's intelligence as his own. His slimy ooze spreads across the planet Moldar." }
    ]
  },
  {
    backdrop: K.BG_BRIDGE,
    props: [[K.FREUD, 860, 620, 1.4]],
    lines: [
      { speaker: 'gc', text: 'Blasternaut! This is Galactic Commander. Gelator has kidnapped Spot and oozed the whole planet Moldar!' },
      { speaker: 'freud', text: 'Zis is a trail of ooze, left by Gelator. Ze three Power Crystals of Moldar can power a generator zat frees ze planet und veakens him.' },
      { speaker: 'blasternaut', text: "Then that's the plan, Freud. Zap the space trash, cross the caverns, charge the generator, and rescue Spot!" },
      { speaker: 'gc', text: "Your math skills are your best weapon. Pick your subject on the console and let's blast off!" }
    ]
  }
];

export const MISSION_BRIEFS: Record<MissionKey, DialogLine[]> = {
  spaceZapper1: [
    { speaker: 'gc', text: 'Space Zapper! Solve the equation on your dashboard by shooting the number that completes it. Five correct answers charge your lasers for a free-fire bonus!' },
    { speaker: 'freud', text: 'Complete ze mission und ze Blue Power Crystal is yours.' }
  ],
  mathBlaster: [
    { speaker: 'gc', text: "Gelator's drones are guarding the surface of Moldar. Shoot the drone carrying the right answer, and watch out for falling goo!" },
    { speaker: 'freud', text: 'Getting slimed vill not hurt you, but it vill slow you down. Ze Red Power Crystal awaits.' }
  ],
  caveRunner: [
    { speaker: 'gc', text: 'Cave Runner! Pick up a number that fits BETWEEN the two numbers on each gate. Your number floats in your thought bubble.' },
    { speaker: 'freud', text: 'Trolls patrol ze caverns. Banana peels trip ze foot trolls, clothespins stop ze nose trolls, und pacifiers calm ze kissing trolls.' },
    { speaker: 'gc', text: 'Find the Green Power Crystal at the end of the jungle caves!' }
  ],
  equationator: [
    { speaker: 'gc', text: 'This is the Equationator. Drop a number from each tube to build a true equation. Recycle a tube to bring a different number to the bottom.' },
    { speaker: 'freud', text: 'Every true equation charges ze generator. Vhen it is full, ve fire it at Moldar!' }
  ],
  spaceZapper2: [
    { speaker: 'gc', text: 'Gelator is fleeing through the asteroid field with Spot! Shoot the mines and asteroids with the right answers to catch him.' },
    { speaker: 'blasternaut', text: "Hang on, Spot. We're coming!" }
  ]
};

export const CRYSTAL_LINES: Record<MissionKey, DialogLine[]> = {
  spaceZapper1: [{ speaker: 'gc', text: 'Excellent zapping! The Blue Power Crystal of Moldar is yours.' }],
  mathBlaster: [{ speaker: 'gc', text: 'The drones are down! You found the Red Power Crystal!' }],
  caveRunner: [{ speaker: 'gc', text: 'You made it through the caverns! The Green Power Crystal is ours!' }],
  equationator: [{ speaker: 'freud', text: 'Ze generator is fully charged! Firing at Moldar... ze ooze is melting avay!' }],
  spaceZapper2: [{ speaker: 'gc', text: "You caught up with Gelator! Let's get Spot back!" }]
};
