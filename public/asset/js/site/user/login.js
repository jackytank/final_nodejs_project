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
        email = $('#email');
        password = $('#password');
        submitBtn = $('#submitBtn');
        errorMessage = $('#errorMessage');

        emailCurLength = 0;
        passwordCurLength = 0;

        // for Japanese messages
        // console.log(messages.ECL001('Email'));
        // document.querySelector('#emailRequired').textContent = messages.ECL001('Email');
        // document.querySelector('#passwordRequired').textContent = messages.ECL001('Password');
    }

    function formValidation() {
        // Form Validation
        let passwordMaxLength = 0;
        let emailMaxLength = 0;

        $.validator.addMethod('checkPassMaxLength', function (value, element, params) {
            passwordCurLength = value.length;
            passwordMaxLength = params.length;
            return value.length <= params.length;
        }, function () {
            return messages.ECL002('Password', passwordMaxLength, passwordCurLength);
        });

        $.validator.addMethod('checkEmailMaxLength', function (value, element, params) {
            emailCurLength = value.length;
            emailMaxLength = params.length;
            return value.length <= params.length;
        }, function () {
            return messages.ECL002('Email', emailMaxLength, emailCurLength);
        });

        $.validator.addMethod('isEmailValidFormat', function (value, element, params) {
            return /(?:[a-z0-9+!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi.test(value);
        }, function () {
            return messages.ECL005;
        });


        $('#loginForm').validate({
            onfocusout: function (element) {
                // "eager" validation
                this.element(element);
            },
            // onkeyup: function (element) {
            //     this.element(element);
            // },
            errorElement: 'span',
            errorClass: 'has-error',
            highlight: function (element, errorClass) {
                $(element).parents('.inputBox').addClass(errorClass);
            },
            unhighlight: function (element, errorClass) {
                $(element).parents('.inputBox').removeClass(errorClass);
            },
            errorPlacement: function (err, el) {
                err.addClass('help-block').appendTo(el.parent());
                $('#errorMessage').hide();
            },
            rules: {
                password: {
                    required: true,
                    checkPassMaxLength: { length: 20 }
                },
                email: {
                    required: true,
                    isEmailValidFormat: true,
                    checkEmailMaxLength: { length: 255 }
                },
            },
            messages: {
                password: {
                    required: messages.ECL001('Password'),
                },
                email: {
                    required: messages.ECL001('Email')
                },
            }
        });

        // already validate input fields with mdbootstrap styles in site/common.js
    }

    function events() {
        // setTimeout(() => {
        //     document.querySelectorAll('.message').forEach(function (el) {
        //         el.innerHTML = ''; //Clears the innerHTML
        //     });
        // }, 3000);

    }
});
