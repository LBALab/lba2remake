import LibsLBA1 from './libraries_lba1';
import LibsLBA2 from './libraries_lba2';
import { getParams } from '../../../../../params';

const isLBA1 = getParams().game === 'lba1';
const LibrariesData = isLBA1 ? LibsLBA1 : LibsLBA2;

export default LibrariesData;
