import { adaptSetup, shutterLabel } from './calculators';
import type { Preferences, Scene } from './schema';

/** One content selection for screen, complete print and pocket print. */
export function selectedSceneContent(scene: Scene, prefs: Preferences) {
  if (prefs.format === 'phone') {
    return {
      conditions: scene.phone.conditions ?? scene.conditions,
      intent: scene.phone.intent ?? scene.intent,
      startingPoint: scene.phone.startingPoint ?? 'Take a test capture in the selected phone mode. Enlarge the important detail, inspect movement and highlights, and adjust using the controls your device or app supports.',
      why: scene.phone.why,
      steps: scene.phone.steps,
      pack: scene.phone.pack,
      problems: scene.phone.problems,
      tip: scene.phone.tip ?? scene.tip,
    };
  }
  const adapted = adaptSetup(scene, prefs);
  return {
    conditions: scene.conditions,
    intent: scene.intent,
    startingPoint: scene.startingPoint,
    why: scene.why,
    steps: adapted.exposureChanged
      ? scene.steps.map(step => adaptStartingInstruction(step, scene, adapted))
      : scene.steps,
    pack: scene.pack,
    problems: scene.problems,
    tip: scene.tip,
  };
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Replace references to this sheet's starting exposure, never its correction
 * targets, flash power, interval, bracket spacing or alternative recipes. */
export function adaptStartingInstruction(text: string, scene: Scene, setup: ReturnType<typeof adaptSetup>) {
  const base = scene.setup;
  let result = text;
  if (setup.aperture !== base.aperture) {
    result = result.replace(new RegExp(`\\bf/${escapeRegExp(String(base.aperture))}(?![\\d.])`, 'g'), `f/${setup.aperture}`);
  }
  if (setup.iso !== base.iso && !base.autoISO) {
    result = result.replace(new RegExp(`\\bISO ${base.iso}(?!\\d)`, 'g'), `ISO ${setup.iso}`);
  }
  if (setup.shutter !== base.shutter) {
    const forms = new Set([shutterLabel(base.shutter), `${base.shutter} s`]);
    if (base.shutter < 1) forms.add(`1/${Math.round(1 / base.shutter)} s`);
    for (const form of forms) {
      result = result.replace(new RegExp(`(?<![\\d./])${escapeRegExp(form)}(?![\\w/])`, 'g'), shutterLabel(setup.shutter));
    }
  }
  return result;
}

export function alternativeGearWarning(scene: Scene, index: number, prefs: Preferences): string | undefined {
  if (!prefs.gearEnabled || prefs.format === 'phone') return;
  const alternative = scene.alternatives[index];
  const aperture = Number(prefs.maxAperture);
  const limit = Number(prefs.isoLimit);
  const warnings: string[] = [];
  if (Number.isFinite(aperture) && aperture > alternative.aperture) {
    warnings.push(`This f/${alternative.aperture} reference needs a faster lens than your entered f/${aperture} limit. Keep the intended shutter and compensate with ISO or more light; background separation will change.`);
  }
  if (Number.isFinite(limit) && limit > 0 && alternative.iso > limit) {
    warnings.push(`Its ISO ${alternative.iso} ${alternative.mode === 'M + Auto ISO' ? 'expectation' : 'setting'} exceeds your ISO ${limit} ceiling. More light or a different result may be needed.`);
  }
  return warnings.length ? warnings.join(' ') : undefined;
}
