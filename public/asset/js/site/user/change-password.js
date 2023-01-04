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
         // if don't specify the scope (let, const) the variable will be global
        formIdStr = '#changePasswordForm';
        submitIdBtnStr = '#changePasswordBtn'
        formElement = $(formIdStr);
        submitBtn = $(submitIdBtnStr);
    }

    function formValidation() {
        const strongPassRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$/;
        $.validator.addMethod('checkStrongPassword', function (value, element) {
            return strongPassRegex.test(value);
        }, 'Password must between 6-20 characters, at least one numeric and a special character "@#$%^" !');

        // Form Validation
        // $(formIdStr).validate({
        //     rules: {
        //         "password": {
        //             required: true,
        //             checkStrongPassword: true,
        //         },
        //         "retype": {
        //             required: true,
        //             equalTo: "#password",
        //             minlength: 6
        //         }
        //     }
        // });
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
