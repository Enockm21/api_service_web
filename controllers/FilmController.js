const db = require('../database');
const FilmsRepository = require('../repository/FilmRepository');
const GenresRepository = require('../repository/GenreRepository');
const ActorsRepository = require('../repository/ActorRepository');
const Utils = require('../helpers/utils');

exports.filmList = async (req, res) => {
    const repo = new FilmsRepository(db);
    const actorRepo = new ActorsRepository(db);
    const genreRepo = new GenresRepository(db);

    repo.list().then((result) => {
        const allFilms = result;
        let allActorFilmIds = [];
        let allActors = [];
        // Retrieve actor-film associations from the repo.getAllFilmActor() function
        repo.getAllFilmActor().then((actorsFilms) => {
            allActorFilmIds = actorsFilms;
            // Retrieve all actors
            actorRepo.list().then((actors) => {
                allActors = actors;
                // Create a table of films with their actors
                const filmsWithActorsAndGenre = allFilms.map((film) => {
                    const filmId = film.id;
                    const filmActors = allActorFilmIds
                        .filter((entry) => entry.film_id === filmId)
                        .map((entry) => {
                            const actorId = entry.actor_id;
                            const actor = allActors.find((act) => act.id === actorId);
                            return actor;
                        });
                    // Get the film genre using genreRepo.get(film.genre_id)
                    return genreRepo.get(film.genre_id).then((genre) => ({
                        ...film,
                        actors: filmActors || [],
                        genre: genre || null,
                    }));
                });
                // Wait until all genreRepo.get(film.genre_id) promises have been resolved
                Promise.all(filmsWithActorsAndGenre).then((filmsWithGenreResolved) => {
                    res.json({
                        success: true,
                        data: filmsWithGenreResolved,
                    });
                });
            });
        });
    }).catch((err) => {
        res.status(500).json({ error: err.message });
    });
};

exports.getFilmById = async (req, res) => {
    const repo = new FilmsRepository(db);
    const genreRepo = new GenresRepository(db);
    const actorRepo = new ActorsRepository(db);
    repo.get(req.params.id).then(async (result) => {
        if (!result) {
            res.status(404).json({ error: `Film ${req.params.id} not found` });
            return;
        }

        const genre = await genreRepo.get(result.genre_id).then((data) => data);
        actorRepo.list().then((actors) => {
            const allActors = actors;

            repo.getAllFilmActor().then((actorsFilms) => {
                const filmActors = actorsFilms
                    .filter((entry) => entry.film_id === result.id)
                    .map((entry) => entry.actor_id);

                // eslint-disable-next-line max-len
                const filmActorsDetails = allActors.filter((actor) => filmActors.includes(actor.id));

                res.setHeader('ETag', Utils.generateETag(result));
                res.json({
                    success: true,
                    data: {
                        ...result,
                        genre: genre || null,
                        actors: filmActorsDetails || [],
                    },
                });
            });
        });
    }).catch((err) => {
        res.status(404).json({ error: err.message });
    });
};

exports.filmCreate = (req, res) => {
    const errors = [];
    const repo = new FilmsRepository(db);
    const genreRepo = new GenresRepository(db);
    const actorRepo = new ActorsRepository(db);

    ['name', 'synopsis', 'release_year', 'genre_id', 'actors'].forEach((field) => {
        if (!req.body[field]) {
            errors.push(`Field '${field}' is missing from request body`);
        }
    });

    if (errors.length) {
        res.status(400).json({
            success: false,
            errors,
        });
        return;
    }
    // check if genre id exist in database
    genreRepo.get(req.body.genre_id).then((data)=>{
        if (!data) {
            return  res.status(404).json({ error: `genre ${req.body.genre_id} does not exist` });
            
        }
    })

    //
    req.body.actors.forEach((field) => {
        actorRepo.get(field).then((data)=>{
            if (!data) {
                return  res.status(404).json({ error: `actor ${ field } does not exist` });
                
            }
        })
    });
   
    repo.create({
        name: req.body.name,
        synopsis: req.body.synopsis,
        release_year: req.body.release_year,
        genre_id: req.body.genre_id,

    }).then(async (result) => {
            await req.body.actors.forEach((actorId) => {
                repo.addActorsFilm({ film_id: result, actor_id: actorId });
            });
            res.status(201)
                .json({
                    success: true,
                    id: result,
                });
    }).catch((err) => {
            res.status(400).json({ error: err.message });
    });
};

exports.filmUpdate = async (req, res) => {
    const repo = new FilmsRepository(db);
    const genreRepo = new GenresRepository(db);
    const actorRepo = new ActorsRepository(db);
    const errors = [];
    ['name', 'synopsis', 'release_year', 'genre_id', 'actors'].forEach((field) => {
        if (!req.body[field]) {
            errors.push(`Field '${field}' is missing from request body`);
        }
    });
    if (errors.length) {
        res.status(400).json({
            success: false,
            errors,
        });
        return;
    }
    // Verification de l'ETag
    repo.get(req.params.id).then(async (result) => {
        if (Utils.checkETag(req, result, 'film')) {
            await repo.update(
                req.params.id,
                {
                    name: req.body.name,
                    synopsis: req.body.synopsis,
                    release_year: req.body.release_year,
                    genre_id: req.body.genre_id,
                },
            )
                .then(async () => {
                    
                    repo.get(req.params.id)
                        .then(async (data) => {
                            await req.body.actors.forEach((actorId) => {
                                repo.updateFilmActors({ film_id: req.params.id, actor_id: actorId })
                            });
                            const genre = await genreRepo.get(data.genre_id).then((data) => data);
                            actorRepo.list().then((actors) => {
                                const allActors = actors;
                                repo.getAllFilmActor().then((actorsFilms) => {
                                    const filmActors = actorsFilms
                                        .filter((entry) => entry.film_id === data.id)
                                        .map((entry) => entry.actor_id);

                                    // eslint-disable-next-line max-len
                                    const filmActorsDetails = allActors.filter((actor) => filmActors.includes(actor.id));

                                    res.setHeader('ETag', Utils.generateETag(data));
                                    res.json({
                                        success: true,
                                        data: {
                                            ...data,
                                            genre: genre || null,
                                            actors: filmActorsDetails || [],
                                        },
                                    });
                                });
                            });
                           
                        });
                })
                .catch((err) => {
                    res.status(400).json({ error: err.message });
                });
        } else {
            res.status(412).json({ error: 'Precondition Failed ETag not found' });
        }
    });
};

exports.filmDelete = (req, res) => {
    const repo = new FilmsRepository(db);

    repo.delete(req.params.id)
        .then(() => {
            res.status(204)
                .json({
                    success: true,
                });
        })
        .catch((err) => {
            res.status(400).json({ error: err.message });
        });
};
