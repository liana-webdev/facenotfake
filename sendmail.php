<?php
// === CONFIG ===
$to = "facenotfake1@gmail.com";
$subject = "New message from Face Not Fake website";

// === COLLECT FORM DATA ===
$name = strip_tags(trim($_POST["name"] ?? ''));
$email = filter_var($_POST["email"] ?? '', FILTER_SANITIZE_EMAIL);
$message = trim($_POST["message"] ?? '');

// === VALIDATION ===
if ($name === '' || $email === '' || $message === '') {
    http_response_code(400);
    echo "Please complete all fields.";
    exit;
}

// === BUILD EMAIL BODY ===
$body = "You’ve received a new message from the website contact form:\n\n";
$body .= "Name: $name\n";
$body .= "Email: $email\n\n";
$body .= "Message:\n$message\n";

// === HEADERS ===
$headers = "From: $name <$email>\r\n";
$headers .= "Reply-To: $email\r\n";

// === SEND ===
if (mail($to, $subject, $body, $headers)) {
    echo "<script>alert('Thank you, your message has been sent successfully!'); window.location.href='index.html';</script>";
} else {
    echo "<script>alert('Sorry, something went wrong. Please try again later.'); window.location.href='index.html';</script>";
}
?>