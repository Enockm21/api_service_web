const express = require('express');
const filmsController = require('../controllers/FilmController');
const genresController = require('../controllers/GenreController');
const actorsController = require('../controllers/ActorController');

const router = express.Router();

// Films routes

router.get('/film', filmsController.filmList);
router.get('/film/:id', filmsController.getFilmById);
router.post('/film', filmsController.filmCreate);
router.put('/film/:id', filmsController.filmUpdate);
router.delete('/film/:id', filmsController.filmDelete);

// genres routes

router.get('/genre', genresController.genreList);
router.post('/genre', genresController.genreCreate);
router.delete('/genre/:id', genresController.genreDelete);

// actors routes

router.get('/actor', actorsController.actorList);
router.get('/actor/:id', actorsController.getActorById);
router.post('/actor', actorsController.actorCreate);
router.put('/actor/:id', actorsController.actorUpdate);
router.delete('/actor/:id', actorsController.actorDelete);
module.exports = router;
