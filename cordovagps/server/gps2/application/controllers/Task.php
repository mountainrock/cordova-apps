<?php
defined('BASEPATH') OR exit('No direct script access allowed');


class Task extends CI_Controller {

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

       
	//manage tasks
	public function showTasks()
	{
		$this->load->view('common/panels');
		$this->load->view('task/tasks');
	}
	
	
	
}