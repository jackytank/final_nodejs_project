/************ VALUE LIST ***************/
const valueLst = {
  // 無効化フラグ
  disableFlgs: {
    0: '有効',
    1: '無効'
  },
};

const POS_NUM = {
  GE_DI: 0,
  GR_LE: 1,
  LE: 2,
  MEM: 3,
};

const POS_NAME = {
  GE_DI: 'General Director',
  GR_LE: 'Group Leader',
  LE: 'Leader',
  MEM: 'Member',
};

const POS_ARR = [
  {
    id: 0,
    name: 'General Director'
  },
  {
    id: 1,
    name: 'Group Leader'
  },
  {
    id: 2,
    name: 'Leader'
  },
  {
    id: 3,
    name: 'Member'
  },

];

const EMAIL_REGEX_1 = /^(?:[a-z0-9+!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi;
const EMAIL_REGEX_2 = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASS_REGEX = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$/;
const DATE_REGEX = /^(\d{4})[\/](0?[1-9]|1[012])[\/](0?[1-9]|[12][0-9]|3[01])$/;