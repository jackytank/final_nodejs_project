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
            // call api then populate the data to select devision
            fetch('/api/admin/divisions')
                .then((res) => res.json())
                .then((data) => {
                    data.data.forEach((div) => {
                        selectDivision.append($('<option />').val(div.id).text(div.name));
                    });
                });
            // POS_ARR is in site/common.js
            POS_ARR.forEach((div) => {
                selectPosition.append($('<option />').val(div.id).text(div.name));
            });
        }
        initAndPopulateData();
    }

    function formValidation() {
        const validEmailRegex = customEmailRegex; // in site/common.js
        const strongPassRegex = customPassRegex; // in site/common.js

        $.validator.addMethod('checkValidEmail', function (value, element) {
            return validEmailRegex.test(value);
        }, messages.ECL005);
        $.validator.addMethod('checkStrongPassword', function (value, element) {
            return strongPassRegex.test(value);
        }, 'Password must between 8-20 characters, at least one numeric and a special character "@#$%^" !');

        formElement.validate({
            lang: 'jp',
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
                    maxlength: 100
                },
                "email": {
                    required: true,
                    maxlength: 255,
                    checkValidEmail: true
                },
                "password": {
                    required: true,
                    checkStrongPassword: true,
                },
                "retype": {
                    equalTo: "#password",
                    minlength: 6,
                    maxlength: 20
                },
                "position_id": {
                    required: true,
                },
                "division_id": {
                    required: true,
                },
                "entered_date": {
                    required: true,
                }
            },
            messages: {
                "name": {
                    required: messages.ECL001('User Name')
                },
                "email": {
                    required: messages.ECL001('Email')
                },
                "password": {
                    required: messages.ECL001('Password')
                },
                "retype": {
                    required: messages.ECL001('Password Confirmation')
                },
                "position_id": {
                    required: messages.ECL001('Position'),
                },
                "division_id": {
                    required: messages.ECL001('Division'),
                },
                "entered_date": {
                    required: messages.ECL001('Entered Date'),
                }
            }
        });

    }

    function events() {
        $(document).on('submit', formIdStr, function () {
            // prevent multiple submit
            $.LoadingOverlay("show");
            console.log('submitted');
            submitBtn.attr('disabled', true);
            submitBtn.html('Please wait...');
            $(this).submit(function () {
                return false;
            });
            return true;
        });
    }
});
