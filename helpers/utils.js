const crypto = require('crypto');

exports.generateETag = (resource) => {
    // eslint-disable-next-line max-len
    const etagString = resource.name + resource.synopsis + resource.genre_id + resource.release_year;
    const etag = crypto.createHash('sha256').update(etagString).digest('hex');
    return etag;
};

exports.checkETag = (request, resource) => {
    const clientETag = request.headers['if-match']; // Récupérer l'ETag envoyé par le client depuis l'en-tête personnalisé
    if (clientETag === this.generateETag(resource)) {
        return true;
    }
    return false;
};
