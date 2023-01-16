import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { messages } from '../constants';
import { DestinationCallback } from '../customTypings/express';

const csvFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    cb(null, true);
};

const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, callback: DestinationCallback): void => {
        callback(null, path.join(__dirname, '../../public/upload/csv/'));
    },
    filename: (req, file, callback): void => {
        callback(null, `${Date.now()}-briswellvn-${file.originalname}`);
    }
});

const uploadFile = multer({ storage: storage, fileFilter: csvFilter });

export { uploadFile };