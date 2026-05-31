<?php
session_start();

define('TO_EMAIL', 'sherwin1983@gmail.com');
define('SITE_NAME', 'Microdot');
define('RATE_LIMIT_SECONDS', 300);
define('MAX_REQUESTS_PER_IP', 3);

$is_ajax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

function json_response($code, $data) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    if ($is_ajax) json_response(405, ['ok' => false, 'error' => 'Method not allowed']);
    header('Location: /contact/', true, 303);
    exit;
}

$honeypot = trim($_POST['website'] ?? '');
if ($honeypot !== '') {
    if ($is_ajax) json_response(200, ['ok' => true]);
    http_response_code(200);
    exit('Thank you for your message.');
}

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$now = time();

if (!isset($_SESSION['rate_attempts'])) {
    $_SESSION['rate_attempts'] = [];
}
$_SESSION['rate_attempts'] = array_filter($_SESSION['rate_attempts'], function($t) use ($now) {
    return $t > ($now - RATE_LIMIT_SECONDS);
});
$ip_attempts = array_filter($_SESSION['rate_attempts'], function($t) use ($ip) {
    return $t === $ip;
});
if (count($ip_attempts) >= MAX_REQUESTS_PER_IP) {
    http_response_code(429);
    exit('Too many requests. Please try again later.');
}
$_SESSION['rate_attempts'][] = $now;
$_SESSION['rate_attempts'] = array_values($_SESSION['rate_attempts']);

function clean_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) && strlen($email) <= 254;
}

function validate_url($url) {
    if (empty($url)) return true;
    return filter_var($url, FILTER_VALIDATE_URL) !== false && strlen($url) <= 500;
}

$errors = [];

$fullname = clean_input($_POST['fullname'] ?? '');
$email    = clean_input($_POST['email'] ?? '');
$company  = clean_input($_POST['company'] ?? '');
$country  = clean_input($_POST['country'] ?? '');
$message  = clean_input($_POST['message'] ?? '');
$services = $_POST['services'] ?? [];

if (empty($fullname) || strlen($fullname) < 2 || strlen($fullname) > 100) {
    $errors[] = 'Invalid full name.';
}
if (!validate_email($email)) {
    $errors[] = 'Invalid email address.';
}
if (!validate_url($company)) {
    $errors[] = 'Invalid company URL.';
}
if (empty($country)) {
    $errors[] = 'Please select your country.';
}
$valid_services = [
    'Upgrade existing website',
    'Develop new website',
    'I have a design',
    'I need design service',
    'SEO Local',
    'SEO International'
];
foreach ($services as $s) {
    if (!in_array($s, $valid_services)) {
        $errors[] = 'Invalid service selection.';
        break;
    }
}
if (empty($message) || strlen($message) < 10 || strlen($message) > 5000) {
    $errors[] = 'Message must be between 10 and 5000 characters.';
}

if (!empty($errors)) {
    if ($is_ajax) json_response(400, ['ok' => false, 'error' => implode(' ', $errors)]);
    http_response_code(400);
    echo '<h2>Form Error</h2><ul>';
    foreach ($errors as $e) {
        echo '<li>' . htmlspecialchars($e, ENT_QUOTES, 'UTF-8') . '</li>';
    }
    echo '</ul><p><a href="/contact/">Go back</a></p>';
    exit;
}

$subject = 'New Contact from ' . SITE_NAME . ' — ' . $fullname;
$service_list = !empty($services) ? implode(', ', $services) : 'Not specified';

$body = "New project inquiry from " . SITE_NAME . "\n\n";
$body .= "Full Name:     " . $fullname . "\n";
$body .= "Email:         " . $email . "\n";
$body .= "Company URL:   " . ($company ?: 'Not provided') . "\n";
$body .= "Country:       " . $country . "\n";
$body .= "Service Type:  " . $service_list . "\n";
$body .= "IP:            " . $ip . "\n\n";
$body .= "Message:\n" . $message . "\n";
$body .= "\n--- End of message ---\n";

$headers = "From: " . SITE_NAME . " <no-reply@microdot.solutions>\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$headers = str_replace(["\r\n", "\r", "\n"], '', $headers);

$sent = mail(TO_EMAIL, $subject, $body, $headers);

if ($sent) {
    if ($is_ajax) json_response(200, ['ok' => true]);
    header('Content-Type: text/html; charset=utf-8');
    ?>
    <!doctype html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="robots" content="noindex">
        <title>Thank You — Microdot</title>
        <style>
            * { box-sizing: border-box; margin: 0; }
            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f5f5f5; color: #1e1a1a; }
            .card { background: #fff; padding: 48px; border-radius: 12px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.08); max-width: 480px; width: 90%; }
            h1 { font-size: 1.75rem; margin-bottom: 12px; }
            p { color: #555; line-height: 1.6; margin-bottom: 24px; }
            a { display: inline-block; padding: 12px 24px; border: 2px solid #1e1a1a; border-radius: 8px; text-decoration: none; color: #1e1a1a; font-weight: 600; }
            a:hover { background: #1e1a1a; color: #fff; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>Thank You!</h1>
            <p>Your message has been sent successfully. We'll get back to you within 24 hours.</p>
            <a href="/contact/">Back to Contact</a>
        </div>
    </body>
    </html>
    <?php
} else {
    if ($is_ajax) json_response(500, ['ok' => false, 'error' => 'Server error. Please email sherwin1983@gmail.com directly.']);
    http_response_code(500);
    header('Content-Type: text/html; charset=utf-8');
    echo '<h2>Server Error</h2><p>Unable to send your message. Please try again later or email us directly at sherwin1983@gmail.com.</p><p><a href="/contact/">Go back</a></p>';
}
