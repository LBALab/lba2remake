const jobs = {};
const cancelJobHandlers = {};

export function startNewJob(execute, cancel) {
    const job = {
        id: Math.random().toString(36).substring(7),
        status: 'pending',
        progress: [],
        result: null,
    };

    const onResolve = (result) => {
        job.status = 'done';
        job.result = result;
    };

    const onReject = (error) => {
        job.status = 'error';
        job.error = error.message;
    };

    const onProgress = (progress) => {
        job.progress.push(progress);
    }

    jobs[job.id] = job;
    cancelJobHandlers[job.id] = cancel;

    setTimeout(() => {
        job.status = 'running';
        execute(onResolve, onReject, onProgress);
    }, 0);

    return job.id;
}

export function getJob(req, res) {
    const id = req.params.id;
    const offset = req.query.offset || 0;
    if (id in jobs) {
        const progress = jobs[id].progress.slice(offset);
        res.send({
            ...jobs[id],
            progress,
        });
    } else {
        res.status(404).send({
            error: 'Job not found'
        });
    }
}

export function cancelJob(req, res) {
    const id = req.params.id;
    if (id in cancelJobHandlers) {
        cancelJobHandlers[id]();
        delete cancelJobHandlers[id];
        res.send(jobs[id]);
    } else {
        res.status(404).send({
            error: 'Job not found'
        });
    }
}
