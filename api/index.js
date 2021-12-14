import express from 'express';
import { cancelJob, getJob } from './jobs';
import { bake } from './bake';

const router = express.Router();

router.post('/bake/:type/:game/:name', bake);
router.get('/job/:id', getJob);
router.delete('/job/:id', cancelJob)

module.exports = router;
