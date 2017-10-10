export const actors = [
    'actors = scene.actors',
    'visibleActors = filter(actors, isVisible)',
    'sprites = filter(actors, isSprite)',
    'distToHero = dist(physics.position, hero.physics.position)',
    'actorsDistance = sort(map(visibleActors, distToHero))',
    'actorsOrientation = map(visibleActors, deg(euler(physics.orientation)))',
    'actorsDistance',
    'actorsOrientation'
];

export const ui = [
    'ui',
    'ui.interjections',
    'ui.text',
    'ui.foundObject',
    'ui.video'
];

export const camera = [
    'camera = renderer.getMainCamera(scene)',
    'pixelRatio = renderer.pixelRatio()',
    'camera'
];

export const gameState = [
    'state = game.getState()',
    'game.isLoading()',
    'game.isPaused()',
    'game.controlsState',
    'state.chapter',
    'state.hero',
    'state.hero.clover',
    'state.hero.magicball',
    'state.config',
    'state.flags',
];
