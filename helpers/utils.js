const crypto = require('crypto');

exports.generateETag = (resource) => {
    // eslint-disable-next-line max-len
    const etagString = resource.name + resource.synopsis + resource.genre_id + resource.release_year;
    const etag = crypto.createHash('sha256').update(etagString).digest('hex');
    return etag;
};

exports.checkETag = (request, resource) => {
    const clientETag = request.headers['if-match']; // Récupérer l'ETag envoyé par le client depuis l'en-tête personnalisé
    console.log(request.headers, 'header');
    console.log(request.headers['if-match'], 'header');
    console.log(this.generateETag(resource), 'generatr');
    if (clientETag === this.generateETag(resource)) {
        console.log('ça marche');
        return true;
        // Les ETags correspondent, la ressource n'a pas été modifiée
        // Permettre la modification de la ressource
        // ...
    }
    console.log('ça plantes');
    return false;
    /* {
        // Les ETags ne correspondent pas, modification concurrente
        // Retourner une réponse d'erreur
        // ...
        return false;
        console.log('ça plantes');
    } */
};
