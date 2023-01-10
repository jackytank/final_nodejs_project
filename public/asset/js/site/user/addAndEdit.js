

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

    /**
     * Form validation
     */
    function init() {
        // without const/let variable become global
        formIdStr = '#addEditDeleteForm';
        registerIdStr = '#registerBtn';
        updateIdStr = '#updateBtn';
        deleteIdStr = '#deleteBtn';
        cancelIdStr = '#cancelBtn';
        selectDivisionIdStr = '#selectDivision';
        selectPositionIdStr = '#selectPosition';

        formElement = $(formIdStr);
        registerBtn = $(registerIdStr);
        updateBtn = $(updateIdStr);
        deleteBtn = $(deleteIdStr);
        cancelBtn = $(cancelIdStr);
        selectDivision = $(selectDivisionIdStr);
        selectPosition = $(selectPositionIdStr);

        function initAndPopulateData() {
            const renderedUserPosition = selectPosition.data('userPositionId'); // data-user-position-id="23232"
            const renderedUserDivision = selectDivision.data('userDivisionId'); // data-user-division-id="23232"
            // call api then populate the data to select devision
            fetch('/api/admin/divisions')
                .then((res) => res.json())
                .then((data) => {
                    data.data.forEach((div) => {
                        selectDivision.append(`<option value="${div.id}" ${div.id === renderedUserDivision ? 'selected' : ''}>${div.name}</option>`);
                    });
                });
            // POS_ARR is in site/common.js
            POS_ARR.forEach((div) => {
                // when server render ejs <select> tag will have data-user-position-id, set <option> selected if div.id equal to that id
                selectPosition.append(`<option value="${div.id}" ${div.id === renderedUserPosition ? 'selected' : ''}>${div.name}</option>`);
            });
        }
        initAndPopulateData();
    }

    function formValidation() {
        const strongEmailRegex = EMAIL_REGEX_1; // in site/constant.js
        const normalEmailRegex = EMAIL_REGEX_2;
        const strongPassRegex = PASS_REGEX; // in site/constant.js
        const strongDateRegex = DATE_REGEX; // in site/constant.js

        $.validator.addMethod('checkValidEmail', function (value, element) {
            return normalEmailRegex.test(value);
        });
        $.validator.addMethod('isValidDate', function (value, element, params) {
            return this.optional(element) || strongDateRegex.test(value);
        });
        $.validator.addMethod('is1ByteChar', function (value, element, params) {
            const arr = Array.from(value);
            let is1Byte = true;
            // check every character whether it is (2 bytes / full width) char or not
            arr.some((char) => {
                if (eastAsianWidth.isFullWidth(char) === true) {
                    // console.log(char, ' ', eastAsianWidth.isFullWidth(char));
                    is1Byte = false;
                    return true;
                }
            });
            return is1Byte;
        });

        formElement.validate({
            onfocusout: function (element) {
                // "eager" validation
                this.element(element);
            },
            errorElement: 'span',
            errorClass: 'has-error',
            highlight: function (element, errorClass) {
                $(element).parents('.inputBox').addClass(errorClass);
            },
            unhighlight: function (element, errorClass) {
                $(element).parents('.inputBox').removeClass(errorClass);
            },
            errorPlacement: function (err, el) {
                err.addClass('help-block').appendTo(el.closest('.has-error-wrapper'));
            },
            rules: {
                "name": {
                    required: true,
                    is1ByteChar: true,
                    maxlength: 100,
                },
                "email": {
                    required: true,
                    is1ByteChar: true,
                    checkValidEmail: true,
                    maxlength: 255,
                },
                "password": {
                    required: true,
                    is1ByteChar: true,
                    minlength: 8,
                    maxlength: 20,
                },
                "retype": {
                    required: true,
                    equalTo: "#password",
                    is1ByteChar: true,
                    minlength: 8,
                    maxlength: 20,
                },
                "position_id": {
                    required: true,
                },
                "division_id": {
                    required: true,
                },
                "entered_date": {
                    required: true,
                    is1ByteChar: true,
                    isValidDate: true,
                }
            },
            messages: {
                "name": {
                    required: messages.ECL001('User Name'),
                    is1ByteChar: messages.ECL004('User Name'),
                },
                "email": {
                    required: messages.ECL001('Email'),
                    is1ByteChar: messages.ECL004('Email'),
                    checkValidEmail: messages.ECL005
                },
                "password": {
                    required: messages.ECL001('Password'),
                    minlength: messages.ECL023,
                    maxlength: messages.ECL023,
                    is1ByteChar: messages.ECL004('Password'),
                },
                "retype": {
                    required: messages.ECL001('Password Confirmation'),
                    equalTo: messages.ECL030,
                    minlength: messages.ECL023,
                    maxlength: messages.ECL023,
                    is1ByteChar: messages.ECL004('Password Confirmation'),
                },
                "position_id": {
                    required: messages.ECL001('Position'),
                },
                "division_id": {
                    required: messages.ECL001('Division'),
                },
                "entered_date": {
                    required: messages.ECL001('Entered Date'),
                    isValidDate: messages.ECL008('Entered Date'),
                    is1ByteChar: messages.ECL004('Entered Date'),
                }
            }
        });

    }

    function events() {
        // $(document).on('submit', formIdStr, function () {
        //     // prevent multiple submit
        //     $.LoadingOverlay("show");
        //     console.log('submitted');
        //     submitBtn.attr('disabled', true);
        //     submitBtn.html('Please wait...');
        //     $(this).submit(function () {
        //         return false;
        //     });
        //     return true;
        // });
        $(document).on('click', registerIdStr, function (e) {
            if (formElement.valid()) {
                $.LoadingOverlay("show");
                const formData = {
                    name: $(`form${formIdStr} input[name=name]`).val(),
                    email: $(`form${formIdStr} input[name=email]`).val(),
                    division_id: $(`form${formIdStr} select[name=division_id]`).val(),
                    entered_date: $(`form${formIdStr} input[name=entered_date]`).val(),
                    position_id: $(`form${formIdStr} select[name=position_id]`).val(),
                    password: $(`form${formIdStr} input[name=password]`).val(),
                    retype: $(`form${formIdStr} input[name=retype]`).val(),
                };
                // console.log(formData);
                $.ajax({
                    method: 'POST',
                    // enctype: 'multipart/form-data',
                    url: '/api/admin/users', // /admin/users/addPage
                    data: formData,
                    dataType: "json",
                    cache: false,
                    success: function (res) {
                        $.LoadingOverlay("hide");
                        // alert('success');
                        // console.log(res);
                        openErrorModalWithMsg('errorModal', 'errorModalMessage', 'errorModalOkBtn', res.status, res.message, null, true);
                    },
                    error: function (res, stat, err) {
                        $.LoadingOverlay("hide");
                        // alert('failed');
                        console.log(res);
                        openErrorModalWithMsg('errorModal', 'errorModalMessage', 'errorModalOkBtn', res.statusText, res.responseJSON.message, null, false);
                    },
                });
            }
        });

        $(document).on('click', deleteIdStr, function (e) {
            (async () => {
                const userIdToDelete = formElement.find('#userIdToDelete').data('userId'); // ex: data-user-id="287374"
                const isConfirmed = await confirmModal(`Are you sure want to delete user: ${userIdToDelete}?`);
                if (isConfirmed) {
                    $.ajax({
                        method: 'DELETE',
                        // enctype: 'multipart/form-data',
                        url: `/api/admin/users/${userIdToDelete}`,
                        cache: false,
                        success: function (res) {
                            openErrorModalWithMsg('errorModal', 'errorModalMessage', 'errorModalOkBtn', res.status, res.message, null, true);
                        },
                        error: function (res, stat, err) {
                            openErrorModalWithMsg('errorModal', 'errorModalMessage', 'errorModalOkBtn', res.statusText, res.responseJSON.message, null, false);
                        },
                    });
                }
            })();
        });
    }
});
