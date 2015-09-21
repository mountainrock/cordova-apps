<?php
defined('BASEPATH') OR exit('No direct script access allowed');


class Auth extends CI_Controller {

	public function __construct() {
	        parent::__construct();
       	        header('Access-Control-Allow-Origin: *');
	        $this->load->model("User_model", "user", TRUE);
	        $this->load->database();
	        $this->load->helper(array('form', 'url', 'date', 'cookie'));
	        $this->load->library('session');
	        $this->load->helper('url');
	        $this->load->library('form_validation');
	        date_default_timezone_set('asia/kolkata');
       }
	
	public function login()
	{
		$this->load->view('auth/login');
	}
	
	public function doLogin()
	{	
		$this->form_validation->set_rules('userName', 'User Name', 'required');
           	$this->form_validation->set_rules('password', 'password', 'required');
              	
              	if ($this->form_validation->run() == FALSE){
                   echo validation_errors();
	           exit;
        	}
            
		$userName=   $_REQUEST['userName'];
		$password=   $_REQUEST['password'];
		
		$user1= $this->user->loginUser($userName,$password);
		
            	if($user1!=null){
            		$this->session->set_userdata("userName", $user1[0]->userName);
			$this->session->set_userdata("customerId", $user1[0]->customerId);

			echo "OK";

		}else{
			echo 'Invalid username or password or customerId';
		}
		exit;
	}
	
	function logout(){
		$this->session->sess_destroy();
		$this->load->view('auth/login');
	}
	
	
	
}