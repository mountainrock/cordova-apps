    <?php $appTitle = "Super GPS"; 
	  $userName= $this->session->userdata('userName');
	  $customerId = $this->session->userdata('customerId');
    ?>
    <title> <?php echo $appTitle." - ".$page; ?></title>
    <link href="<?php echo base_url();?>css/application.css" rel="stylesheet">
    <link rel="shortcut icon" href="img/favicon.png">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="description" content="">
    <meta name="author" content="">
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <script>
        /* yeah we need this empty stylesheet here. It's cool chrome & chromium fix
         chrome fix https://code.google.com/p/chromium/issues/detail?id=167083
         https://code.google.com/p/chromium/issues/detail?id=332189
         */
        var baseurl = "<?php echo base_url();?>";
    </script>
   
<!--[if lte IE 10]>
	<script> alert("This application doesnt support Internet explorer 10 or lesser version. Please use chrome or Firefox");</script>
<![endif]-->