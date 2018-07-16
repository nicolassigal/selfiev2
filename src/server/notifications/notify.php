<?php
$_POST = json_decode(file_get_contents('php://input'), true);

require './PHPMailer-master/PHPMailerAutoload.php';
$_POST = json_decode(file_get_contents('php://input'), true);
$errors = array();
$data = array();
$mail = new PHPMailer;
$mail->SMTPDebug = 2;                               // Enable verbose debug output
$mail->isSMTP();                                      // Set mailer to use SMTP
 $mail->Host = 'smtp.gmail.com';  // Specify main and backup SMTP servers
// $mail->Host = 'mail.tucourier.com.ar';  // Specify main and backup SMTP servers
$mail->SMTPAuth = true;                               // Enable SMTP authentication
// $mail->Username = 'no-reply@tucourier.com.ar';                 // SMTP username
 $mail->Username = 'santiago.lloret@tucourier.com.ar';                 // SMTP username
// $mail->Password = 'courier2018';                           // SMTP password
$mail->Password = 'reset2016';                           // SMTP password
$mail->SMTPSecure = 'tls';                            // Enable TLS encryption, `ssl` also accepted
$mail->Port = 587;
                                    // TCP port to connect to
// $admin_email = "no-reply@tucourier.com.ar";
$admin_email = "santiago.lloret@tucourier.com.ar";
$name = "HBR | tu courier";


$subject = $_POST['subject'];
$body = $_POST['body'];
$altBody = $_POST['altBody'];
$to = $_POST['to'];

$mail->IsHTML(true);
$mail->SMTPKeepAlive = true;   
$mail->Mailer = “smtp”;
$mail->CharSet = 'UTF-8';
$mail->AddReplyTo($admin_email);
$mail->SetFrom($admin_email, $name);
$mail->Subject = $subject;
$mail->AddAddress($to);
$mail->Body = $body;

if ($AltBody) {
    $mail->AltBody = $AltBody;
}

if(!$mail->send()) {
    echo 'Message could not be sent.';
    echo 'Mailer Error: ' . $mail->ErrorInfo;
} else {
    echo 'Message has been sent';
}
?>