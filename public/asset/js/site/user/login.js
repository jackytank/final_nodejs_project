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
        username = $('#username');
        password = $('#password');
        submitBtn = $('#submitBtn');
        errorMessage = $('#errorMessage');
    }

    function formValidation() {
        // Form Validation
        // $('#loginForm').validate({
        //     lang: 'vn',
        //     errorElement: 'span',
        //     errorClass: 'has-error',
        //     highlight: function (element, errorClass) {
        //         // $(element).parents('.inputBox').addClass(errorClass);
        //     },
        //     unhighlight: function (element, errorClass) {
        //         // $(element).parents('.inputBox').removeClass(errorClass);
        //     },
        //     errorPlacement: function (err, el) {
        //         err.addClass('help-block').appendTo(el.parent());
        //         $('#errorMessage').html('');
        //     },
        //     rules: {
        //         password: {
        //             required: { name: 'Password is required!' },
        //         },
        //         name: {
        //             required: { name: 'Username is required!' },
        //         },
        //     },
        // });
        // Example starter JavaScript for disabling form submissions if there are invalid fields
        // Fetch all the forms we want to apply custom Bootstrap validation styles to

        // already validate input fields with mdbootstrap styles in site/common.js
    }

    function events() {
        username.on('keyup', function () {
            $('#errorMessage').html('');
        });
        password.on('keyup', function () {
            $('#errorMessage').html('');
        });
        setTimeout(() => {
            document.querySelectorAll('.message').forEach(function (el) {
                el.innerHTML = ''; //Clears the innerHTML
            });
        }, 3000);

    }
});
