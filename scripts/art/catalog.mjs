// Every generated asset: [group, key, svg]. Keys are the Phaser texture keys.
import * as Ch from './characters.mjs';
import * as Cast from './cast.mjs';
import * as Cr from './creatures.mjs';
import * as Pr from './props.mjs';
import * as Pp from './platformProps.mjs';
import * as Pp2 from './platformProps2.mjs';
import * as BS from './bgSpace.mjs';
import * as BC from './bgCaves.mjs';
import * as BJ from './bgJungle.mjs';
import * as BR from './bgRooms.mjs';
import * as BSt from './bgStory.mjs';
import * as UI from './ui.mjs';

export function buildCatalog() {
  const list = [];
  const add = (group, key, svgText) => list.push({ key, svg: svgText, group });

  add('characters', 'blasternaut_stand', Ch.blasternaut({ pose: 'stand' }));
  [0, 1, 2, 3].forEach((f) => add('characters', `blasternaut_walk_${f}`, Ch.blasternaut({ pose: 'walk', frame: f })));
  ['jump', 'jet', 'throw', 'hurt'].forEach((pose) => add('characters', `blasternaut_${pose}`, Ch.blasternaut({ pose })));
  add('characters', 'blasternaut_portrait', Ch.blasternautPortrait());
  ['smile', 'talk', 'worried'].forEach((e) => add('characters', `gc_${e}`, Ch.gcPortrait(e)));
  add('characters', 'gc_full', Ch.gcFull('smile'));
  add('characters', 'gc_full_talk', Ch.gcFull('talk'));
  add('characters', 'spot_happy', Cast.spot('happy'));
  add('characters', 'spot_scared', Cast.spot('scared'));
  add('characters', 'gelator_grin', Cast.gelator('grin'));
  add('characters', 'gelator_angry', Cast.gelator('angry'));
  add('characters', 'freud', Cast.freud());

  [0, 1].forEach((f) => add('creatures', `foot_troll_${f}`, Cr.footTroll(f)));
  [0, 1].forEach((f) => add('creatures', `nose_troll_${f}`, Cr.noseTroll(f)));
  [0, 1].forEach((f) => add('creatures', `kissing_troll_${f}`, Cr.kissingTroll(f)));
  add('creatures', 'drone', Cr.drone());
  add('creatures', 'goo_drop', Cr.gooDrop());

  [0, 1, 2].forEach((v) => add('props', `asteroid_${v}`, Pr.asteroid(v)));
  add('props', 'satellite', Pr.satellite());
  add('props', 'space_mine', Pr.spaceMine());
  add('props', 'number_plate', Pr.numberPlate());
  add('props', 'crosshair', Pr.crosshair());
  add('props', 'laser_bolt', Pr.laserBolt());
  ['blue', 'red', 'green'].forEach((c) => add('props', `crystal_${c}`, Pr.powerCrystal(c)));
  add('props', 'gem', Pr.gem());
  add('props', 'gift_box', Pr.giftBox());
  add('props', 'crystal_cluster', Pr.crystalCluster());
  add('props', 'gold_key', Pr.goldKey());
  add('props', 'egg_token', Pr.eggToken());
  add('props', 'computer_pad', Pr.computerPad());

  add('platform', 'gate_closed', Pp.gateMachine('closed'));
  add('platform', 'gate_open', Pp.gateMachine('open'));
  add('platform', 'thought_bubble', Pp.thoughtBubble());
  add('platform', 'droplet', Pp.droplet());
  add('platform', 'banana_peel', Pp.bananaPeel());
  add('platform', 'clothespin', Pp.clothespin());
  add('platform', 'pacifier', Pp.pacifier());
  add('platform', 'platform_plank', Pp.plankPlatform());
  add('platform', 'platform_ice', Pp.icePlatform());
  add('platform', 'platform_temple', Pp.templePlatform());
  add('platform', 'platform_jungle', Pp.junglePlatform());
  add('platform', 'platform_mushroom', Pp.mushroomPlatform());
  add('platform', 'platform_girder', Pp.girderPlatform());
  add('platform', 'lava_pit', Pp2.lavaPit());
  add('platform', 'fire_statue_temple', Pp2.fireStatue('temple'));
  add('platform', 'fire_statue_ice', Pp2.fireStatue('ice'));
  add('platform', 'exit_door', Pp2.exitDoor());
  add('platform', 'jetpack_pickup', Pp2.jetpackPickup());
  add('platform', 'rope_bridge', Pp2.ropeBridge());
  add('platform', 'cobweb', Pp2.cobwebTrampoline());
  add('platform', 'glass_tube', Pp2.glassTube());
  add('platform', 'tube_token', Pp2.tubeToken());
  add('platform', 'recycle_bin', Pp2.recycleBin());

  add('backgrounds', 'bg_starfield', BS.starfield());
  add('backgrounds', 'bg_cockpit', BS.cockpit());
  add('backgrounds', 'bg_moldar', BS.moldarSurface());
  add('backgrounds', 'bg_ice', BC.iceCave());
  add('backgrounds', 'bg_temple', BC.templeCave());
  add('backgrounds', 'bg_jungle', BJ.jungleCave());
  add('backgrounds', 'bg_city', BJ.cityBonus());
  add('backgrounds', 'bg_chamber', BR.generatorChamber());
  add('backgrounds', 'bg_console', BR.consolePanel());
  add('backgrounds', 'bg_title', BR.titleBackdrop());
  add('backgrounds', 'bg_prison', BSt.prisonPlanet());
  add('backgrounds', 'bg_oozed', BSt.oozedMoldar());
  add('backgrounds', 'bg_bridge', BSt.shipBridge());
  add('backgrounds', 'bg_map', BSt.missionMap());

  add('ui', 'scroll_hud', UI.scrollHud());
  add('ui', 'dialog_panel', UI.dialogPanel());
  ['green', 'red', 'blue', 'gold', 'purple'].forEach((v) => add('ui', `btn_${v}`, UI.menuButton(v)));
  add('ui', 'console_btn_off', UI.consoleButton(false));
  add('ui', 'console_btn_on', UI.consoleButton(true));
  ['red', 'green', 'gold'].forEach((c) => add('ui', `machine_btn_${c}`, UI.machineButton(c)));
  add('ui', 'lamp_off', UI.chargeLamp(false));
  add('ui', 'lamp_on', UI.chargeLamp(true));
  add('ui', 'crystal_socket', UI.crystalSocket());
  add('ui', 'wood_sign', UI.woodSign());
  add('ui', 'logo', UI.logo());
  add('ui', 'energy_meter', UI.energyMeter());
  return list;
}
