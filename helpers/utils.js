const crypto = require('crypto');

exports.generateETag = (resource, controller) => {
    // eslint-disable-next-line max-len
    let etagString = '' 
    if(controller==='film'){
        etagString = resource.name + resource.synopsis + resource.genre_id + resource.release_year;
    }else if(controller === 'actor'){
       etagString = resource.first_name + resource.last_name + resource.date_of_birth + resource.date_of_death;

    }
    const etag = crypto.createHash('sha256').update(etagString).digest('hex');
    return etag;
};

exports.checkETag = (request, resource, controller) => {
    const clientETag = request.headers['if-match']; // Récupérer l'ETag envoyé par le client depuis l'en-tête personnalisé
    if (clientETag === this.generateETag(resource, controller)) {
        return true;
    }
    return false;
};
