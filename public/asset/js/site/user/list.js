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
        getUserRole = parseInt(document.querySelector('#user-role')?.dataset?.userPosition); // get user position attribute in defaultHeader.ejs (data-user-position="")
        getUserId = parseInt(document.querySelector('#user-id')?.dataset?.userId); // get user id attribute in defaultHeader.ejs (data-user-id="")
        // for import, export csv
        importCsvFormEl = $('#importCsvForm');
        importCsvInputEl = $('#importCsvInput');
        importCsvBtnEl = $('#importCsvBtn');
        importCsvFileSizeEl = $('#fileSize');

        createdDateFromStr = '#createdDateFrom';
        createdDateToStr = '#createdDateTo';
        createdDateFrom = $(createdDateFromStr);
        createdDateTo = $(createdDateToStr);

        // utility
        openErrorModalWithMsg = (modalId, modalMsgId, modalOkBtnId, status, message, messages, wantReload) => {
            const errorModalEl = document.querySelector(`#${modalId || 'errorModal'}`);
            const errorModalBodyEl = document.querySelector(`#${modalMsgId || 'errorModalMessage'}`);
            const errorModalOkBtn = document.querySelector(`#${modalOkBtnId || 'errorModalOkBtn'}`);
            let _msg = ``;
            if (message) {
                _msg = `
                        <h3>${status || ''}</h3>
                        <p>${message}</p>
                     `;
            }

            if (messages) {
                _msg = `
                        <h3>${status || ''}</h3>
                        <ul class="text-center">
                            ${messages.map(msg => `<li class="row">${msg}</li>`)}
                        </ul>
                    `;
            }
            errorModalBodyEl.innerHTML = _msg;
            const modal = new mdb.Modal(errorModalEl);
            modal.show();
            if (wantReload) {
                errorModalOkBtn.addEventListener('click', () => {
                    location.reload();
                });
            }
        };

        const table = usersTableElement.DataTable({
            pagingType: 'full_numbers',
            language: {
                paginate: {
                    first: "最終",
                    previous: "前へ",
                    next: "次へ",
                    last: "最終",
                }
            },
            ordering: false,
            searching: false,
            responsive: true,
            processing: true,
            serverSide: true,
            dom: "<'row mb-2'<'col-sm-12 col-md-8'p>>" +
                "<'row mb-2'<'col-sm-12'tr>>" +
                "<'row mb-2'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>",
            ajax: {
                url: '/api/admin/users/search',
                data: function (d) {
                    const name = $('form#searchForm input[type=text][name=name]').val();
                    const createdDateFrom = $('form#searchForm input[type=date][name=createdDateFrom]').val();
                    const createdDateTo = $('form#searchForm input[type=date][name=createdDateTo]').val();
                    d.name = name;
                    d.createdDateFrom = createdDateFrom;
                    d.createdDateTo = createdDateTo;
                },
                error: function (xhr, error, code) {
                    openErrorModalWithMsg(null, null, null, null, 'Datatable AJAX request error!', null, false);
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
                    data: null,
                    className: 'limit-char',
                    render: function (data, type, row, meta) {
                        const userId = data.id;
                        // const isEditDisabled = getUserRole === 1 ? (Number(getUserId) === data.id ? false : true) : false;
                        // const isDelDisabled = getUserRole === 1 ? true : false;
                        return `
                        <a href="/admin/users/edit/${userId}">${escapeHtml(data.name)}</a>
                        `;
                    },
                },
                {
                    data: 'email',
                    className: 'limit-char',
                    render: function (data, type, row, meta) {
                        return escapeHtml(data);
                    },
                },
                {
                    data: 'division_id',
                    className: 'limit-char',
                    render: function (data, type, row, meta) {
                        return data;
                    },
                },
                {
                    data: 'entered_date',
                    render: function (data, type, row, meta) {
                        return data ? dayjs(data).format('YYYY/MM/DD') : '';
                    },
                },
                {
                    data: 'position_id',
                    className: 'limit-char',
                    render: function (data, type, row, meta) {
                        return data;
                    },
                },
            ],
        });
    }
    function validation() {
        // add validate methods - START
        $.validator.addMethod(
            'isValidCsvFile',
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

        $.validator.addMethod('dateGreaterThanEqual',
            function (value, element, params) {
                if (!/Invalid|NaN/.test(new Date(value))) {
                    return new Date(value) >= new Date($(params).val());
                }
                return isNaN(value) && isNaN($(params).val())
                    || (Number(value) >= Number($(params).val()));
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
            rules: {
                createdDateTo: {
                    dateGreaterThanEqual: '#createdDateFrom',
                }
            },
            messages: {
                createdDateTo: {
                    dateGreaterThanEqual: 'Date to must be greater than or equal to date from',
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
                        console.log(req);
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
