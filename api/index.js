import express from 'express';
import { cancelJob, getJob } from './jobs';
import { bake } from './bake';
import { getHDRIList } from './hdri';

const router = express.Router();

router.post('/bake/:type/:game/:name', bake);
router.get('/job/:id', getJob);
router.delete('/job/:id', cancelJob)
router.get('/bake/hdri', getHDRIList);

module.exports = router;
