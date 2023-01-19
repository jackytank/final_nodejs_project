import { CustomUserData } from './../customTypings/express/index';
/* eslint-disable @typescript-eslint/no-explicit-any */
import moment from 'moment-timezone';
import Big from 'big.js';
import crypto from 'crypto';
import _ from 'lodash';
import { generate } from 'generate-password';
import path from 'path';
import jsonfile from 'jsonfile';
import * as fs from 'fs';


/**
 * Format date
 * @param date
 */
export const formatDate = (date: string | undefined, format: string) => {
    return date && !isNaN(<any>new Date(date))
        ? moment(date).format(format)
        : '';
};

/**
 * addCommaToNumber
 * @param string
 */
export const addCommaToNumber = (x: string | number | null | undefined) => {
    if (x === null || x === undefined) {
        return '';
    }
    try {
        const amount = new Big(x).toFixed();
        const parts = amount.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        if (parts[1] !== undefined) {
            parts[1] = parts[1].slice(0, 2);
        }
        return parts.join('.');
    } catch (_) {
        return '';
    }
};

/*
 * Concatenate string text
 */
export const combineText = (data: any[], char?: string) => {
    const arr = data.filter(d => d !== undefined && d !== null);

    if (arr.length === 0) {
        return null;
    }

    if (arr.join('') === '') {
        return null;
    }

    if (arr.length > 0) {
        if (char) {
            return arr.filter(d => d).join(char);
        } else {
            return arr.filter(d => d).join(' ');
        }
    } else {
        return null;
    }
};

/**
 * Display date under a specific format
 * @param format
 * @param date
 */
export function toStringDate(
    date?: string | Date,
    format?: string,
): string | undefined {
    format = format || 'YYYY/MM/DD';
    return date
        ? moment(date)
            .tz('Asia/Tokyo')
            .format(format)
        : date;
}

/**
 * Display date-time under a specific format
 * @param format
 * @param date
 */
export function toStringDatetime(
    date?: string | Date,
    format?: string,
): string | undefined {
    format = format || 'YYYY/MM/DD HH:mm:ss';
    return date
        ? moment(date)
            .tz('Asia/Tokyo')
            .format(format)
        : date;
}

/**
 * Get current system date time
 */
export function getCurrentSystemDatetime() {
    return moment()
        .tz('Asia/Tokyo')
        .format('YYYY/MM/DD HH:mm:ss');
}

// tri - my own custom functions - START
export const customCheckEmptyValues = (value: unknown) => {
    return value === undefined || value === '';
};

export const isValidDate = (obj: unknown) => {
    return _.isDate(obj) && obj.toString() !== 'Invalid Date';
};

export const getRandomPassword = () => {
    return generate({
        length: 16,
        numbers: true,
        uppercase: true,
        symbols: true,
        lowercase: true,
        excludeSimilarCharacters: true, // exclude similar characters like 0O1l
        strict: true, // include all types of characters from options above
    });
};

export const bench = () => {
    const iterations = 100000;
    let startTime: number;
    const start = () => {
        startTime = new Date().getTime();
    };

    const end = () => {
        const endTime = new Date().getTime();
        const time = endTime - startTime;
        console.info(`time: ${time}ms, op: ${time / iterations}ms`);
    };

    return { start, end };
};


export const setAllNull = (obj: Record<string, unknown>, ifEl?: { isEmpty: boolean; }) => {
    const result = obj;
    if (result == null) {
        return result;
    }
    Object.keys(result).forEach(key => {
        if (ifEl && ifEl.isEmpty && result[key] === '') {
            result[key] = null;
        }
    });
    return result;
};

const escapeHtml = (htmlStr: string) => {
    return htmlStr != null ?
        htmlStr.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;") : htmlStr;
};

const unEscapeHtml = (htmlStr: string) => {
    if (htmlStr == null) {
        return htmlStr;
    } else {
        htmlStr = htmlStr.replace(/&lt;/g, "<");
        htmlStr = htmlStr.replace(/&gt;/g, ">");
        htmlStr = htmlStr.replace(/&quot;/g, "\"");
        htmlStr = htmlStr.replace(/&#39;/g, "\'");
        htmlStr = htmlStr.replace(/&amp;/g, "&");
        return htmlStr;
    }
};

/**
 * @param accept an object 
 * @returns return an object with escaped properties
 */

export const escapeObjProps = (obj: { [key: string]: unknown; }) => {
    let tmp: { [key: string]: unknown; } = {};
    Object.keys(obj).map(key => {
        tmp = { ...obj };
        tmp[key] = typeof tmp[key] === 'string' ? escapeHtml(tmp[key] as string) : tmp[key];
    });
    return tmp;
};

export const isHasDup = (a: unknown[]) => {
    return new Set(a.map((item: CustomUserData) => item['User Name'])).size !== a.length;
};

export const isAllElementDup = (a: unknown[]) => {
    const setA = new Set(a.map((item: CustomUserData) => item['User Name']));
    return setA.size === 1;
};

export type HashedData = {
    iv: string,
    content: string;
};

const algo = 'aes-256-cbc';
const key = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';

export const encrypt = (text: string) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algo, key, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};

export const decrypt = (hash: HashedData) => {
    if (hash?.iv && hash?.content) {
        const decipher = crypto.createDecipheriv(algo, key, Buffer.from(hash.iv, 'hex'));
        const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
        return decrpyted.toString();
    }
    return null;
};

const json_path = path.join(__dirname, '../../db/db.json');

export const readJsonDB = async () => {
    let json;
    fs.readFile(json_path, (err, data) => {
        if (err) console.error(err);
        json = JSON.parse(data as unknown as string);
        console.log('read db.json done: ');
        console.dir(json);
    });
    return json;
};

export const writeJsonDB = async (obj: any) => {
    const data = JSON.stringify(obj, null, 2);
    fs.writeFile(json_path, data, 'utf-8', (err) => {
        if (err) console.error(err);
        console.info('write to db.json success!!');
    });
};



// tri - my own custom functions - END