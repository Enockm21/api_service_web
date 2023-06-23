const db = require('../database');
const GenresRepository = require('../repository/GenreRepository');
const FilmsRepository = require('../repository/FilmRepository');

exports.genreList = (req, res) => {
    const repo = new GenresRepository(db);
    repo.list()
        .then((result) => {
            res.json({
                success: true,
                data: result,
            });
        })
        .catch((err) => {
            res.status(500).json({ error: err.message });
        });
};

exports.genreCreate = (req, res) => {
    const errors = [];
    ['name'].forEach((field) => {
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

    const repo = new GenresRepository(db);

    repo.create({
        name: req.body.name,

    })
        .then((result) => {
            res
                .status(201)
                .json({
                    success: true,
                    id: result,
                });
        })
        .catch((err) => {
            res.status(400).json({ error: err.message });
        });
};

exports.genreDelete = async (req, res) => {
    const repo = new GenresRepository(db);
    const filmRepo = new FilmsRepository(db);
    let isGenreUsed = false;
    await filmRepo.list()
        .then((films) => {
            films.forEach((film) => {
                if (film.genre_id === Number(req.params.id)) isGenreUsed = true;
            });
        });
    if (isGenreUsed) {
        res.status(409).json({ error: 'It\'s impossible to delete this genre because it\'s linked to film(s).' });
    } else {
        await repo.delete(req.params.id)
            .then(() => {
                res.status(204)
                    .json({
                        success: true,
                    });
            })
            .catch((err) => {
                res.status(400).json({ error: err.message });
            });
    }
};
