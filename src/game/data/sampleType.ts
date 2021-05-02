import { getParams } from '../../params';

const isLBA1 = getParams().game === 'lba1';

const LBA1SampleType = {
    MAGIC_BALL_THROW: 23,
    FIRE_BALL_THROW: 48,
    BONUS_COLLECTED: 97,
    BONUS_FOUND: 11,
    OBJECT_FOUND: 41,
    MAGIC_BALL_BOUNCE: -1,
    MAGIC_BALL_STOP: -1,
    ERROR: -1,
    ACTOR_DYING: 111,
    TWINSEN_LANDING: 75,
};

const LBA2SampleType = {
    MAGIC_BALL_THROW: 0,
    FIRE_BALL_THROW: 1,
    BONUS_COLLECTED: 2,
    BONUS_FOUND: 3,
    OBJECT_FOUND: 6,
    MAGIC_BALL_BOUNCE: 7,
    MAGIC_BALL_STOP: 8,
    ERROR: 11,
    ACTOR_DYING: 14,
    TWINSEN_LANDING: 129,
};

export default isLBA1 ? LBA1SampleType : LBA2SampleType;
