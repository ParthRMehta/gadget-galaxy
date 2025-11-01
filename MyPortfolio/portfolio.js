/*
 * Custom JavaScript & jQuery for Portfolio Project
 */

// Use jQuery's $(document).ready() to ensure the DOM is loaded (Exp 7)
$(document).ready(function() {

    // --- Experiment 7: jQuery for Blog Page ---
    $('.read-more-btn').on('click', function() {
        
        // --- THIS IS THE FIX ---
        // Find the blog content using .siblings() instead of .next()
        // This is more robust and won't fail if there are spaces.
        const $content = $(this).siblings('.blog-content');
        
        $content.slideToggle(400); // 400ms animation

        // Change the button text based on visibility
        if ($content.is(':visible')) {
            $(this).text('Read Less');
        } else {
            $(this).text('Read More');
        }
    });


    // --- Experiment 6: JavaScript Form Validation for Contact Page ---
    $('#contactForm').on('submit', function(event) {
        event.preventDefault(); // Stop the form from submitting normally

        // Select form fields
        const $name = $('#contactName');
        const $email = $('#contactEmail');
        const $message = $('#contactMessage');
        const $formMessage = $('#formMessage');

        // Clear previous messages and error styles
        $formMessage.empty().removeClass('form-message-success form-message-error');
        $('input, textarea').removeClass('is-invalid');

        let isValid = true;

        // 1. Validate Name
        if ($name.val().trim() === '') {
            $name.addClass('is-invalid');
            isValid = false;
        }

        // 2. Validate Email (simple check for '@' and '.')
        const emailVal = $email.val().trim();
        if (emailVal === '' || !emailVal.includes('@') || !emailVal.includes('.')) {
            $email.addClass('is-invalid');
            isValid = false;
        }

        // 3. Validate Message
        if ($message.val().trim() === '') {
            $message.addClass('is-invalid');
            isValid = false;
        }

        // --- Show Messages ---
        if (isValid) {
            // Success
            $formMessage.addClass('form-message-success')
                        .text('Thank you! Your message has been sent.');
            
            // Clear the form
            $('#contactForm')[0].reset();
        } else {
            // Error
            $formMessage.addClass('form-message-error')
                        .text('Please fill out all required fields correctly.');
        }
    });

});