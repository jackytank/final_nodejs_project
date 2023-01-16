export const labels = {
    FIRST: 'First',
    LAST: 'Last',
    NEXT: 'Next',
    PREVIOUS: 'Previous',
};

export const messageTypes = {
    error: 'error',
    info: 'info',
    success: 'success',
};

export const titleMessageError = {
    NOT_FOUND: 'TITLE NOT FOUND',
    INTERNAL_SERVER_ERROR: 'Internal Server Error',
    FORBIDDEN: 'Forbidden, access denied.',
    BAD_REQUEST: 'Bad Request',
    LIMIT_REQUEST: 'Limit Request',
};

export interface IMessage {
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
    content: string;
}

export const valueLst = {
    // disable flag
    disableFlgs: {
        0: 'Valid',
        1: 'Invalid',
    },
};

export const messages = {
    CSVDefault: 'Please note that an error will occur if there is unnecessary data or rewriting of item names in the header of the format.',
    FORBIDDEN: `Forbidden, access denied.`,
    INTERNAL_SERVER_ERROR: `I'm sorry. <br/> The page you were trying to access could not be found. <br/>
    The URL may have changed due to site updates, or the URL may not have been entered correctly. <br/>
    If this page is still displayed after reloading the browser, please contact your system administrator.`,
    // ECL034: (param: string) => `An invalid value has been entered or selected for ${param}.`,
    API_SELECT_ERROR: (code: string) => `Corresponding information does not exist. (API response: <${code}>)`,
    API_UPDATE_ERROR: (code: string) => `A server error has occurred. Please check the data and register again. (API response: <${code}>)`,
    ECL054: 'Failed to call the CSV creation process.',
    NOT_FOUND: 'NOT FOUND',
    BAD_REQUEST: 'BAD REQUEST',
    ECL056: 'No data in session.',
    ECL057: 'Failed to register data.',
    ECL001: (field: string) => {
        return `${field}は必須項目です。`;
    },
    ECL002: (field: string, maxChar: number | string | undefined, curChar: number | string | undefined): string => {
        // Enter ${field} with less than "${maxChar}" characters. (currently ${curChar} characters)
        return `${field}は「${maxChar}」文字以下で入力してください。（現在${curChar}文字）																																`;
    },
    ECL004: (field: string) => {
        return `${field}は半角英数で入力してください。`;
    },
    ECL005: 'メールアドレスを正しく入力してください。',
    ECL008: (field: string) => {
        return `${field}は日付を正しく入力してください。`;
    },
    ECL010: (field: string) => {
        return `${field}は数字を正しく入力してください。`;
    },
    ECL017: '入力した情報のいずれかの情報が間違っています。<br>確認してから再度試してください。', // for login failed
    ECL019: 'すでにメールアドレスは登録されています。',
    ECL023: 'パスワードは半角英数字記号で8～20文字で入力してください。',
    ECL030: '確認用のパスワードが間違っています。',
    ECL033: (fileFormat: string) => {
        return `ファイル形式が誤っています。${fileFormat}を選択してください。`;
    },
    ECL034: (fileSize: number | string) => {
        return `ファイルのサイズ制限${fileSize as string}を超えています。`;
    },
    ECL050: '該当する情報がありませんでした。',
    ECL069: (field: string) => {
        return `入力値が正しくありません。${field}Fromより${field}Toが大きくなるよう入力してください。`;
    },
    ECL086: 'すでに証明書番号は登録されています。',
    ECL092: 'インポートできました。',
    ECL093: '登録・更新・削除処理に失敗しました。',
    ECL094: (field: string) => {
        return `${field}が存在しておりません。`;
    },
    ECL095: 'インポートファイルの中身が正しくありません。',
    ECL096: '登録・更新・削除処理に成功しました。',
    ECL097: 'CSV出力に失敗しました。',
    ECL098: 'システムエラーになあります。'
};

// tri - my own custom constants - START
export const errMsg = {
    ERR001: (field: string) => {
        return `${field} is required!`;
    },
    ERR002: (field: string, minLength: number, maxLength: number) => {
        return `${field} should be more than ${minLength}, less than equal to ${maxLength} characters`;
    },
    ERR003: (email: string) => {
        return `${email} is invalid!`;
    },
    ERR004: (field1: string, field2: string) => {
        return `${field1} must match ${field2}`;
    },
    ERR005: (field: string, min: number) => {
        return `${field} should be bigger than ${min} characters`;
    },
    ERR006: (field: string, max: number) => {
        return `${field} should be less than equal to ${max} characters`;
    },
    ERR007: (field: string, type: string) => {
        return `${field} is not of type ${type.toLowerCase()}`;
    },
    ERR008: (field: string) => {
        return `${field} is contains blacklisted words`;
    },
    ERR009: (field: string, minLength: number) => {
        return `${field} should be more than ${minLength} characters`;
    }
};

export const _1MB = 1024 * 1024;

export const _1GB = _1MB * 1024;

export const _1TB = _1GB * 1024;

export const _MB = (multiply: number) => {
    return _1MB * multiply;
};

export const POS_NUM = {
    GE_DI: 0,
    GR_LE: 1,
    LE: 2,
    MEM: 3,
};

export const POS_NAME = {
    GE_DI: 'General Director',
    GR_LE: 'Group Leader',
    LE: 'Leader',
    MEM: 'Member',
};

export const POS_NUMS = Object.values(POS_NUM);

export const blackListWords = [
    'img',
    'audio',
    'body',
    'script',
    'cookie',
    'console',
    'document',
    'element',
    'session',
    'localStorage',
    'window',
    'button',
    'canvas',
    'html',
    'iframe',
    'image',
    'img',
    'input',
    'link',
    'listing',
];

// tri - my own custom constants - END
