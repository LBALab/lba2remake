import {loadHqr} from "../hqr"

const videoConvertor = async () => {
    const videos = await loadHqr("VIDEO/VIDEO.HQR");
    console.log(videos);
};

const convertors = {
    "video": videoConvertor,
};

const convert = () => {
    const convertorName = process.argv[2];
    if (!convertorName) {
        console.error(`Please provide argument for convertor. Supported: ${Object.keys(convertors)}`);
        return;
    }
    const convertor = convertors[convertorName];
    if (!convertor) {
        console.error(`Not supported convertor type: ${convertorName}; Supported: ${Object.keys(convertors)}`);
        return;
    }
    convertor();
};

convert();
