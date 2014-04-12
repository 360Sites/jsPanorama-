<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>360 sites</title>
    <meta name="description" content="Responsive Animated Border Menus with CSS Transitions" />
    <meta name="keywords" content="navigation, menu, responsive, border, overlay, css transition" />
    <meta name="author" content="Codrops" />
    <link rel="shortcut icon" href="../favicon.ico">
    <link rel="stylesheet" type="text/css" href="css/normalize.css" />
    <link rel="stylesheet" type="text/css" href="css/icons.css" />
    <link rel="stylesheet" type="text/css" href="css/style5.css" />
    <link rel="stylesheet" type="text/css" href="css/style.css" />
    <link rel="stylesheet" type="text/css" href="fancybox/jquery.fancybox.css" />
    <link rel="stylesheet" type="text/css" href="fancybox/helpers/jquery.fancybox-buttons.css" />
    <link rel="stylesheet" type="text/css" href="css/style_hint.css" />


    <script src="assets/panorama/jquery-1.10.2.min.js"></script>
    <script src="assets/panorama/modernizr.custom.js"></script>


<?php
//$data = include ('../../web/menu.php');
$data = include ('../web/menu.php');

?>



</head>





<body>
<div class="container">
    <header class="codrops-header">
        <section>
            <span class="loader"><img src="img/ajax-loader.gif" ></span>
            <section id="container">

            </section>
        </section>
    </header>
    <nav id="bt-menu" class="bt-menu">
        <a href="#" class="bt-menu-trigger"><span>Menu</span></a>
        <ul>
            <?php foreach($data as $index=>$row) {
                $name = strtoupper($row['name']);
                echo ('<li><a href="#" onclick="toggleMenu();" data-toggle="panorama" data-panorama-index="'.$index.'">'.$name.'</a></li>');
            } ?>
        </ul>
        <ul>
            <li><a href="http://www.twitter.com/codrops" class="bt-icon icon-twitter">Twitter</a></li>
            <li><a href="https://plus.google.com/101095823814290637419" class="bt-icon icon-gplus">Google+</a></li>
            <li><a href="http://www.facebook.com/pages/Codrops/159107397912" class="bt-icon icon-facebook">Facebook</a></li>
            <li><a href="https://github.com/codrops" class="bt-icon icon-github">icon-github</a></li>
        </ul>
    </nav>
</div><!-- /container -->
<div id="gallery" style="display:none;">
</div>
<ul id="hint" class="tt-wrapper-2" onclick="hintClick();">
    <li><a class="tt-hint"><span id="hint-text">test</span></a></li>
</ul>
</body>
<script src="assets/panorama/classie.js"></script>
<script src="assets/panorama/borderMenu.js"></script>
<script src="fancybox/jquery.mousewheel-3.0.6.pack.js"></script>
<script src="fancybox/jquery.fancybox.js"></script>
<script src="fancybox/helpers/jquery.fancybox-buttons.js"></script>
<script src="fancybox/helpers/jquery.fancybox-media.js"></script>


<script src="assets/panorama/Detector.js"></script>
<script src="assets/panorama/three.min.js"></script>

<script src="assets/panorama/application.js"></script>
<script src="assets/panorama/pointevent.js"></script>
</html>