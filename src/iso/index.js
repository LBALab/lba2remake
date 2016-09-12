export function loadIsoSceneManager() {
    const scene = {};
    return {
        currentScene: () => scene
    }
}

export function loadBricks(callback) {
    async.auto({
        ress: loadHqrAsync('RESS.HQR'),
        bkg: loadHqrAsync('LBA_BKG.HQR')
    }, function(err, files) {
        callback(files);
    });
}
