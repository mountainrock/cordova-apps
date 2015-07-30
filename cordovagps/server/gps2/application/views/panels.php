<!DOCTYPE html>
<html>
<head>
   <?php
$page="Dashboard";

include('common-header.php');
$userName= $this->session->userdata('userName');
$customerId = $this->session->userdata('customerId');
if($userName ==null){
  redirect(base_url().'index.php/Gps/login');
}
?>
<script >
  var userName  = '<?php echo $userName; ?>';
  var customerId = '<?php echo $customerId; ?>';
</script>
</head>
<body>

<!--Main sidebar seen on the left. may be static or collapsing depending on selected state. * Collapsing-navigation auto collapse.* Static - stays always open.-->
<nav id="sidebar" class="sidebar" role="navigation">
    <!-- need this .js class to initiate slimscroll -->
    <div class="js-sidebar-content">
        <header class="logo hidden-xs">
           <a><h3><span style="color: rgb(253, 207, 183);">Super</span><span style="color:rgb(228, 184, 71)"> GPS</span></h3></a>
        </header>
        <!-- seems like lots of recent admin template have this feature of user info in the sidebar.
             looks good, so adding it and enhancing with notifications -->
        <div class="sidebar-status visible-xs">
            <a>
               <?php echo '<i class="fa fa-user"></i>&nbsp '.$userName;?> &nbsp;
                
            </a>
            <!-- #notifications-dropdown-menu goes here when screen collapsed to xs or sm -->
        </div>
        <!-- main notification links are placed inside of .sidebar-nav -->
        <ul class="sidebar-navibar">
            <li>
                <a href="<?php echo base_url();?>index.php/Gps/showMap">
                    <span class="icon">
                        <i class="fa fa-desktop"></i>
                    </span>
                    Display Map
                </a>
            </li>
            <li>
                <a href="<?php echo base_url();?>index.php/Gps/showManageUsers?customerId=1#">
                    <span class="icon">
                        <i class="fa fa-table"></i>
                    </span>
                   Manage Users
                   
                </a>
            </li>
            <li>
                <a href="<?php echo base_url();?>index.php/Gps/showSettings">
                    <span class="icon">
                        <i class="glyphicon glyphicon-briefcase"></i>
                    </span>
                  Settings
                   
                </a>
            </li>
           
        </ul>
       
        
       
        
    </div>
</nav>
<!-- This is the white navigation bar seen on the top. A bit enhanced BS navbar. See .page-controls in _base.scss. -->
<nav class="page-controls navbar navbar-default">
    <div class="container-fluid">
        <!-- .navbar-header contains links seen on xs & sm screens -->
        <div class="navbar-header">
            <ul class="nav navbar-nav">
                <li>
                    <!-- whether to automatically collapse sidebar on mouseleave. If activated acts more like usual admin templates -->
                    <a class="hidden-sm hidden-xs" id="nav-state-toggle" href="#" title="Turn on/off sidebar collapsing" data-placement="bottom">
                        <i class="fa fa-bars fa-lg"></i>
                    </a>
                    <!-- shown on xs & sm screen. collapses and expands navigation -->
                    <a class="visible-sm visible-xs" id="nav-collapse-toggle" href="#" title="Show/hide sidebar" data-placement="bottom">
                        <span class="rounded rounded-lg bg-gray text-white visible-xs"><i class="fa fa-bars fa-lg"></i></span>
                        <i class="fa fa-bars fa-lg hidden-xs"></i>
                    </a>
                </li>
                
            </ul>
            <ul class="nav navbar-nav navbar-right visible-xs">
                <li>
                    <!-- toggles chat -->
                    <a href="#" data-toggle="chat-sidebar">
                        <span class="rounded rounded-lg bg-gray text-white"><i class="fa fa-globe fa-lg"></i></span>
                    </a>
                </li>
            </ul>
            <!-- xs & sm screen logo -->
            <a class="navbar-brand visible-xs">
                <i class="fa fa-circle text-gray mr-n-sm"></i>
                <i class="fa fa-circle text-warning"></i>
                &nbsp;
                SuperGps
                &nbsp;
                <i class="fa fa-circle text-warning mr-n-sm"></i>
                <i class="fa fa-circle text-gray"></i>
            </a>
        </div>

        <!-- this part is hidden for xs screens -->
        <div class="collapse navbar-collapse">
            <!-- search form! link it to your search server -->
            
            <ul class="nav navbar-nav navbar-right">
                <li class="dropdown">
                    <a class="dropdown-toggle dropdown-toggle-notifications">
                        &nbsp;
                       <?php echo '<i class="fa fa-user"></i>&nbsp '.$userName ;?> &nbsp;
                    </a> 
                </li>
                <li class="dropdown">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                        <i class="fa fa-cog fa-lg"></i>
                    </a>
                    <ul class="dropdown-menu">
                        <li><a data-toggle="modal" data-target="#changePassword" style="cursor: pointer;">
                        	<i class="glyphicon glyphicon-user"></i> &nbsp; My Account</a>
                        </li>
                        <li class="divider"></li>
                        <li><a href="<?php echo base_url();?>index.php/Gps/logout"><i class="fa fa-sign-out"></i> &nbsp; Log Out</a></li>
                    </ul>
                </li>
                <li>
                    <a data-toggle="chat-sidebar">
                        <i class="fa fa-globe fa-lg"></i>
                    </a>
                    <div id="chat-notification" class="chat-notification hide">
                        <div class="chat-notification-inner">
                            <h6 class="title">
                                
                                <?php echo '<i class="fa fa-user"></i> '.$userName ;?>
                            </h6>
                            
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</nav>


<div class="modal fade" id="changePassword" tabindex="-1" role="dialog" aria-labelledby="myModalLabel18" aria-hidden="true">
                            <div class="modal-dialog">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                                        <h4 class="modal-title text-align-center fw-bold mt" id="myModalLabel18">Manage Account</h4>
                                        <p class="text-align-center fs-mini text-muted mt-sm">
                                            You can change the Password here
                                        </p>
                                    </div>
                                    <div class="modal-body bg-gray-lighter">
                                        <form>
                                            <div class="row">
                                                <div class="col-md-12">
                                                    <div class="alert alert-danger alert-sm" hidden="" id="showerrorformismatch" >
                                                        <button class="close" aria-hidden="true" data-dismiss="alert" type="button">×</button>
                                                        <span class="fw-semi-bold">Both must be same.</span>

                                                    </div>
                                                    
                                                    <div class="alert alert-success alert-sm" hidden="" id="showsuccessforpasswordchange" >
                                                        <button class="close" aria-hidden="true" data-dismiss="alert" type="button">×</button>
                                                        <span class="fw-semi-bold">Password changed successfully</span>

                                                    </div>
                                                    
                                                    <div class="alert alert-danger alert-sm" hidden="" id="showfailureforpasswordchange" >
                                                        <button class="close" aria-hidden="true" data-dismiss="alert" type="button">×</button>
                                                        <span class="fw-semi-bold">Sorry!!! Failed to change Password. Please contact admin</span>

                                                    </div>
                                                    
                                                    <div class="form-group">
                                                        <div class="col-md-10">
                                                        <input type="password" class="form-control input-no-border" id="password"
                                                               placeholder="password"><br>
                                                        <input type="password" class="form-control input-no-border" id="confirmpassword"
                                                               placeholder="confirm password">
                                                        <input type="hidden" id="loginRecID" value="<?php echo $this->session->userdata('loginRecId');?>"/>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-gray" data-dismiss="modal"><i class="glyphicon glyphicon-remove-circle"></i> Close</button>
                                        <button type="button" class="btn btn-success"  id="passwordchange"><i class="glyphicon glyphicon-download"></i> Save password</button>
                                    </div>
                                </div>
                            </div>
                        </div>