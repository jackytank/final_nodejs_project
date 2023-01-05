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
        formIdStr = '#userForm';
        formElement = $(formIdStr);
        submitBtn = $('#submitBtn');
    }

    function formValidation() {
        // const validEmailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        // const strongPassRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$/;

        // $.validator.addMethod('checkValidEmail', function (value, element) {
        //     return validEmailRegex.test(value);
        // }, 'Please enter a valid email address please !');
        // $.validator.addMethod('checkStrongPassword', function (value, element) {
        //     return strongPassRegex.test(value);
        // }, 'Password must between 8-20 characters, at least one numeric and a special character "@#$%^" !');

        // $('#addUserForm').validate({
        //     rules: {
        //         "name": {
        //             required: true,
        //             maxlength: 100
        //         },
        //         "username": {
        //             required: true,
        //             maxlength: 255
        //         },
        //         "email": {
        //             required: true,
        //             maxlength: 255,
        //             checkValidEmail: true
        //         },
        //         "password": {
        //             required: true,
        //             checkStrongPassword: true,
        //         },
        //         "retype": {
        //             equalTo: "#password",
        //             minlength: 6,
        //             maxlength: 20
        //         },
        //         "role": {
        //             required: true,
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
