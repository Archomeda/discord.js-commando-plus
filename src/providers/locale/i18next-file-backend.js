/*
 Original author: Archomeda
 */

const fs = require('fs');
const Backend = require('i18next-node-fs-backend');

/**
 * A custom localization backend for i18next that allows loading from fallback files.
 * @extends {Backend}
 * @private
 */
class FileBackend extends Backend {
    read(language, namespace, callback) {
        // Intercept this call to support loading from multiple folders
        if (Array.isArray(this.options.loadPath) && !this.options.loadPaths) {
            this.options.loadPaths = this.options.loadPath;
        }

        const filenames = Array.isArray(this.options.loadPaths) ? this.options.loadPaths : [this.options.loadPaths];
        let loadPath;
        for (const filename of filenames) {
            const intFilename = this.services.interpolator.interpolate(filename, { lng: language, ns: namespace });
            if (fs.existsSync(intFilename)) {
                loadPath = filename;
                break;
            }
        }
        if (!loadPath) {
            loadPath = filenames[filenames.length - 1];
        }
        this.options.loadPath = loadPath;

        return super.read(language, namespace, callback);
    }
}

module.exports = FileBackend;
