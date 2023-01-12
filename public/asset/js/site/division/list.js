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
                        return data ? dayjs(data).format('MM/DD/YYYY') : '';
                    },
                },
                {
                    data: 'Updated Date',
                    render: function (data, type, row, meta) {
                        return data ? dayjs(data).format('MM/DD/YYYY') : '';
                    },
                },
                {
                    data: 'Deleted Date',
                    render: function (data, type, row, meta) {
                        return data ? dayjs(data).format('MM/DD/YYYY') : '';
                    },
                },
            ],
        });
    }
    function formValidation() { null; }
    function events() { null; }
});