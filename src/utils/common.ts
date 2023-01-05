/* eslint-disable @typescript-eslint/no-explicit-any */
import moment from 'moment-timezone';
import Big from 'big.js';
import _ from 'lodash';
import { generate } from 'generate-password';

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


// tri - my own custom functions - END