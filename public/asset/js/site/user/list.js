/* eslint-disable @typescript-eslint/no-use-before-define */
$(function () {
    /**
     * Page load
     */
    $(document).ready(function () {
        init();
        validation();
        events();
    });

    /**
     * Init, validation, and events
     */
    function init() {
        // if don't specify the scope (let, const) the variable will be global
        searchFormIdStr = '#searchForm';
        searchForm = $(searchFormIdStr);
        usersTableElement = $('#usersTable');
        searchBtn = $('#searchBtn');
        getUserPosition = parseInt(document.querySelector('#user-position')?.dataset?.userPosition); // get user position attribute in defaultHeader.ejs (data-user-position="")
        getUserId = parseInt(document.querySelector('#user-id')?.dataset?.userId); // get user id attribute in defaultHeader.ejs (data-user-id="")
        // for import, export csv
        importCsvFormEl = $('#importCsvForm');
        importCsvInputEl = $('#importCsvInput');
        importCsvBtnEl = $('#importCsvBtn');
        exportCsvBtnEl = $('#exportCsvBtn');
        importCsvFileSizeEl = $('#fileSize');

        usernameInputStr = 'name';
        enteredDateFromStr = 'enteredDateFrom';
        enteredDateToStr = 'enteredDateTo';
        usernameInput = $(usernameInputStr);
        enteredDateFrom = $(enteredDateFromStr);
        enteredDateTo = $(enteredDateToStr);

        // for bootstrap invalid messages
        invalidUsernameEl = $('#invalidUsername');
        invalidFromEl = $('#invalidFrom');
        invalidToEl = $('#invalidTo');

        const table = usersTableElement.DataTable({
            lengthChange: false, // disable show entries
            pagingType: 'full_numbers', // have first, previous, next, last and numbers
            language: { // set japanese messages (in public\asset\js\site\user\common.js)
                paginate: {
                    first: labels.FIRST,
                    previous: labels.PREVIOUS,
                    next: labels.NEXT,
                    last: labels.LAST,
                },
                zeroRecords: "No Record",
            },
            pageLength: 10,
            ordering: false,
            searching: false,
            responsive: false,
            processing: true,
            serverSide: true,
            dom: "<'row mb-2'<'col-sm-12 col-md-8'p>>" +
                "<'row mb-2'<'col-sm-12'tr>>" +
                "<'row mb-2'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>",
            ajax: {
                url: '/api/admin/users/search',
                data: function (d) {
                    const name = $('form#searchForm input[type=text][name=name]').val();
                    const enteredDateFrom = $('form#searchForm input[type=text][name=enteredDateFrom]').val();
                    const enteredDateTo = $('form#searchForm input[type=text][name=enteredDateTo]').val();
                    d.name = name;
                    d.enteredDateFrom = enteredDateFrom;
                    d.enteredDateTo = enteredDateTo;
                },
                error: function (xhr, error, code) {
                    openErrorModalWithMsg(null, null, null, null, 'Datatable AJAX request error!', null, false);
                }
            },
            drawCallback: function (oSettings) {
                const api = this.api();
                let isDataEmpty = false;
                let isDataLessThanPageLength = false;
                if (isNaN(oSettings._iRecordsDisplay) || oSettings._iRecordsDisplay === 0) {
                    // if filter result is NaN on datatable init, hide pagination
                    // console.log(`check NaN run`);
                    // console.log(`recordDisplay: ${oSettings._iRecordsDisplay}, displayLength: ${oSettings._iDisplayLength}`);
                    isDataEmpty = true;
                }
                if (!isNaN(oSettings._iRecordsDisplay)) {
                    // if filter result is less than display length (set 10 in pageLength datatable above), hide pagination else show pagination
                    if (oSettings._iRecordsDisplay <= oSettings._iDisplayLength) {
                        // console.log(`check < run`);
                        // console.log(`recordDisplay: ${oSettings._iRecordsDisplay}, displayLength: ${oSettings._iDisplayLength}`);
                        isDataLessThanPageLength = true;
                    }
                }

                // console.log(`isHide: ${isHide}`);
                // for hiding pagination
                if (isDataEmpty || isDataLessThanPageLength) {
                    $(api.table().container()).find('.dataTables_paginate').hide();
                } else {
                    $(api.table().container()).find('.dataTables_paginate').show();
                }

                // for hiding header and export csv btn
                if (isDataEmpty) {
                    exportCsvBtnEl.hide();
                    usersTableElement.find('thead tr th span').hide();
                } else {
                    exportCsvBtnEl.show();
                    usersTableElement.find('thead tr th span').show();
                }
            },
            columnDefs: [
                {
                    searchable: false,
                    orderable: false,
                    width: 200,
                    targets: 0,
                },
            ],
            columns: [
                // {
                //     data: 'ID',
                // },
                {
                    data: null,
                    className: 'limit-char',
                    render: function (data, type, row, meta) {
                        // const isEditDisabled = getUserRole === 1 ? (Number(getUserId) === data.id ? false : true) : false;
                        // const isDelDisabled = getUserRole === 1 ? true : false;
                        const userId = data['ID'];
                        const isLoginUserGeDi = getUserPosition === 0 ? true : false;
                        const escapedName = escapeHtml(data['User Name']);
                        const link = `<a href="/admin/users/edit/${userId}">${escapedName}</a>`;
                        const label = `<label>${escapedName}</label>`;
                        return `${isLoginUserGeDi ? link : label}`;
                    },
                },
                {
                    data: 'Email',
                    className: 'limit-char',
                    render: function (data, type, row, meta) {
                        return escapeHtml(data);
                    },
                },
                {
                    data: 'Division Name',
                    className: 'limit-char',
                    render: function (data, type, row, meta) {
                        return escapeHtml(data);
                    },
                },
                {
                    data: 'Entered Date',
                    render: function (data, type, row, meta) {
                        return data ? dayjs(data).format('YYYY/MM/DD') : '';
                    },
                },
                {
                    data: 'Position',
                    className: 'limit-char',
                    render: function (data, type, row, meta) {
                        const parsedData = parseInt(data);
                        switch (parsedData) {
                            case 0: return POS_NAME.GE_DI;
                            case 1: return POS_NAME.GR_LE;
                            case 2: return POS_NAME.LE;
                            case 3: return POS_NAME.MEM;
                            default: return '';
                        }
                    },
                },
            ],
        });
    }
    function validation() {
        const strongDateRegex = DATE_REGEX;

        // add validate methods - START
        $.validator.addMethod('isValidCsvFile',
            function (value, el) {
                // const fileSize = element.size / 1024 / 1024 // in megabytes - mb
                // iSize = (Math.round(iSize * 100) / 100)
                const file = el.files[0];
                const fileSize = file.size; // in bytes
                const fileExt = file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length) || file.name; // ex: csv | txt | docx | doc
                console.log('file ext', fileExt);
                console.log('file size: ', fileSize);
                // check if file size is bigger than 2mb (in bytes)
                if (fileSize > 2097152) {
                    return false;
                }
                if (fileExt !== 'csv') {
                    return false;
                }
                return true;
            },
            '',
        );

        $.validator.addMethod('dateGreaterThanEqual', function (value, element, params) {
            // console.log('from', dayjs(value, 'YYYY/MM/DD', true).isValid());
            // console.log('to', dayjs($(params).val(), 'YYYY/MM/DD', true).isValid());

            // if both date is valid, compare date else return true
            if (dayjs(value, 'YYYY/MM/DD', true).isValid() && dayjs($(params).val(), 'YYYY/MM/DD', true).isValid()) {
                return new Date(value) <= new Date($(params).val());
            }
            return true;
            // return isNaN(value) && isNaN($(params).val()) || (Number(value) <= Number($(params).val()));
        });
        $.validator.addMethod('isValidDate', function (value, element, params) {
            return this.optional(element) || strongDateRegex.test(value);
        });

        let nameMaxLength = 0;
        let nameCurLength = 0;
        $.validator.addMethod('checkNameMaxLength', function (value, element, params) {
            nameCurLength = value.length;
            nameMaxLength = params.length;
            return value.length <= params.length;
        }, function () {
            return messages.ECL002('Password', nameMaxLength, nameCurLength);
        });
        // add validate methods - END

        importCsvFormEl.validate({
            rules: {
                file: {
                    required: true,
                    isValidCsvFile: true,
                },
            },
            messages: {
                file: '',
            },
        });

        searchForm.validate({
            errorElement: "span",
            errorClass: 'text-danger',
            errorPlacement: function (error, element) {
                // find the nearest element that has .validate-wrapper class and append error after it
                element.closest('.validate-wrapper').append(error);
            },
            rules: {
                name: {
                    checkNameMaxLength: { length: 100 }
                },
                enteredDateFrom: {
                    isValidDate: true,
                    dateGreaterThanEqual: '#enteredDateTo'
                },
                enteredDateTo: {
                    isValidDate: true,
                }
            },
            messages: {
                enteredDateFrom: {
                    isValidDate: messages.ECL008('Entered Date From'),
                    dateGreaterThanEqual: messages.ECL069('Entered Date '),
                },
                enteredDateTo: {
                    isValidDate: messages.ECL008('Entered Date To'),
                }
            }
        });
    }
    function events() {
        // if click del button then call ajax delete request
        $(document).on('click', '#delUserBtn', function () {
            const userId = $(this).attr('data-user-id');
            if (getUserRole !== 1) {
                const check = confirm('Are you sure you want to delete this users?');
                if (check) {
                    $.ajax({
                        type: 'DELETE',
                        url: `/api/admin/users/${userId}`,
                        success: function (res) {
                            alert(res.message);
                            location.reload();
                        },
                        error: function (response, status, error) {
                            console.log(response, status, error);
                        },
                    });
                }
            }
        });

        $(document).on('click', '#clearBtn', function () {
            // location.replace('/users/list');
            $(':input', searchFormIdStr)
                .not(':button, :submit, :reset, :hidden')
                .prop('checked', false)
                .prop('selected', false)
                .not(':checkbox, :radio, select') // not clear checkbox and radio, select
                .val('');
            searchBtn.attr("disabled", false);
        });

        // when search form is submit then send ajax GET then repopulate returned data to dataTable
        $(searchFormIdStr).on('submit', function (e) {
            e.preventDefault();
            searchBtn.attr("disabled", true);
            if ($('#searchForm').valid()) {
                usersTableElement.DataTable().ajax.reload();
            };
            // wait for 1.2s then enable search button
            setTimeout(() => {
                searchBtn.attr("disabled", false);
            }, 300);

        });

        $(document).on('click', '#importCsvBtn', function () {
            if (importCsvFormEl.valid()) {
                const files = importCsvInputEl.prop('files');
                const file = files[0];
                const formData = new FormData();
                formData.append('file', file);
                $.ajax({
                    method: 'POST',
                    enctype: 'multipart/form-data',
                    url: '/api/admin/users/csv/import',
                    data: formData,
                    contentType: false,
                    processData: false,
                    cache: false,
                    success: function (data) {
                        // location.reload();
                        openErrorModalWithMsg('errorModal', 'errorModalMessage', 'errorModalOkBtn', data.status, data.message, data.messages, true);
                        // console.log('Return data: ', JSON.stringify(data, null, 4));
                    },
                    error: function (req, stat, err) {
                        openErrorModalWithMsg('errorModal', 'errorModalMessage', 'errorModalOkBtn', req.status || req.responseJSON.status, req.responseJSON.message, req.responseJSON.messages, false
                        );
                    },
                });
                document.querySelector('#importCsvForm').reset();
            } else {
                openErrorModalWithMsg('errorModal', 'errorModalMessage', 'errorModalOkBtn', null, 'Please select a valid .csv file and no bigger than 2mb!', null, false);
            }
        });

        $(document).on('click', '#exportCsvBtn', function () {
            $.ajax({
                method: 'POST',
                url: '/api/admin/users/csv/export',
                cache: false,
                success: function (res) {
                    const blob = new Blob([res.data], {
                        type: 'text/csv;',
                    });
                    const url = window.URL || window.webkitURL;
                    const link = url.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.download = res.filename;
                    a.href = link;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    console.log(res.message);
                    openErrorModalWithMsg('errorModal', 'errorModalMessage', 'errorModalOkBtn', res.status || 200, res.message, null, false);
                },
                error: function (req, stat, err) {
                    console.log(stat, err);
                    openErrorModalWithMsg('errorModal', 'errorModalMessage', 'errorModalOkBtn', req.responseJSON.status, req.responseJSON.message, null, false);
                },
            });
        });
    }
});
