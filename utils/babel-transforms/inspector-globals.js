global.inspector_patch_fct = (fct, location, pure) => {
    if (location) {
        // eslint-disable-next-line no-underscore-dangle
        fct.__location = location;
    }
    if (pure) {
        // eslint-disable-next-line no-underscore-dangle
        fct.__pure_function = true;
    }
    return fct;
};
