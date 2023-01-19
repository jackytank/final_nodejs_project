/* eslint-disable @typescript-eslint/no-use-before-define */
$(function () {
    /**
     * Page load
     */
    $(document).ready(function () {
        init();
        formValidation();
        events();
    });

    function init() {
        divisionsTableIdStr = '#divisionsTable';
        importCsvFormIdStr = '#importCsvForm';
        importCsvInputIdStr = '#importCsvInput';
        importCsvBtnIdStr = '#importCsvBtn';

        divisionsTableEl = $('#divisionsTable');
        importCsvFormEl = $(importCsvFormIdStr);
        importCsvInputEl = $(importCsvInputIdStr);
        importCsvBtnEl = $(importCsvBtnIdStr);

        const table = divisionsTableEl.DataTable({
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
                url: '/api/admin/divisions/search',
                // data: function (d) {
                // },
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
                    divisionsTableEl.find('thead tr th span').hide();
                } else {
                    divisionsTableEl.find('thead tr th span').show();
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
                {
                    data: 'ID',
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
                    data: 'Division Note',
                    className: 'limit-char',
                    render: function (data, type, row, meta) {
                        return escapeHtml(data);
                    },
                },
                {
                    data: 'Division Leader',
                    className: 'limit-char',
                    render: function (data, type, row, meta) {
                        return escapeHtml(data);
                    },
                },
                {
                    data: 'Floor Number',
                    className: 'limit-char',
                    render: function (data, type, row, meta) {
                        return escapeHtml(data);
                    },
                },
                {
                    data: 'Created Date',
                    render: function (data, type, row, meta) {
                        return data ? dayjs(data).format('YYYY/MM/DD') : '';
                    },
                },
                {
                    data: 'Updated Date',
                    render: function (data, type, row, meta) {
                        return data ? dayjs(data).format('YYYY/MM/DD') : '';
                    },
                },
                {
                    data: 'Deleted Date',
                    render: function (data, type, row, meta) {
                        return data ? dayjs(data).format('YYYY/MM/DD') : '';
                    },
                },
            ],
        });
    }
    function formValidation() {
        // add validate methods - START
        // $.validator.addMethod('isValidFormatCsv', function (value, el) {
        //     const file = el.files[0];
        //     const fileExt = file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length) || file.name; // ex: csv | txt | docx | doc
        //     if (fileExt !== 'csv') {
        //         return false;
        //     }
        //     return true;
        // });

        // $.validator.addMethod('isCsvFileRightMbSize', function (val, el, params) {
        //     // const fileSize = element.size / 1024 / 1024 // in megabytes - mb
        //     // iSize = (Math.round(iSize * 100) / 100)
        //     const file = el.files[0];
        //     const fileSize = file.size; // in bytes
        //     const inMb = params.size * 1024 * 1024; // in bytes
        //     // check if file size is bigger than 2mb (in bytes)
        //     if (fileSize > inMb) {
        //         return false;
        //     }
        //     return true;
        // });

        // importCsvFormEl.validate({
        //     rules: {
        //         file: {
        //             // required: true,
        //             isValidFormatCsv: true,
        //             isCsvFileRightMbSize: { size: 2 }
        //         },
        //     },
        //     messages: {
        //         file: {
        //             // required: '',
        //             isValidFormatCsv: messages.ECL033('CSV'),
        //             isCsvFileRightMbSize: messages.ECL034('2 MB')
        //         }
        //     },
        // });
        checkFormThenReturnMsgErr = () => {
            const files = importCsvInputEl.prop('files');
            const file = files[0];
            const inMb = 2 * 1024 * 1024; // 2mb in bytes
            const fileExt = file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length) || file.name; // ex: csv | txt | docx | doc
            if (fileExt !== 'csv') {
                return messages.ECL033('CSV');
            }
            if (file.size > inMb) {
                return messages.ECL034('2 MB');
            }
            return null;
        };
    }
    function events() {
        $(document).on('change', importCsvInputEl, function () {
            const validateMsgErr = checkFormThenReturnMsgErr(); // null || string
            if (!validateMsgErr) {
                const files = importCsvInputEl.prop('files');
                const file = files[0];
                const formData = new FormData();
                formData.append('file', file);
                $.ajax({
                    method: 'POST',
                    enctype: 'multipart/form-data',
                    url: '/api/admin/divisions/csv/import',
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
                        console.log(req);
                        openErrorModalWithMsg('errorModal', 'errorModalMessage', 'errorModalOkBtn', req.status || req.responseJSON.status, req.responseJSON.message, req.responseJSON.messages, false);
                    },
                });
            } else {
                openErrorModalWithMsg('errorModal', 'errorModalMessage', 'errorModalOkBtn', null, validateMsgErr, null, false);
            }
            document.querySelector(importCsvFormIdStr).reset();
        });
    }
});