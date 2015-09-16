<?php
defined('BASEPATH') OR exit('No direct script access allowed');


class Report extends CI_Controller {

	public function __construct() {
	        parent::__construct();
       	        header('Access-Control-Allow-Origin: *');
	        $this->load->model("Gps_model", "gps", TRUE);
	        $this->load->database();
	        $this->load->helper(array('form', 'url', 'date', 'cookie'));
	        $this->load->library('session');
	        $this->load->helper('url');
	        $this->load->library('form_validation');
	        date_default_timezone_set('asia/kolkata');
       }
	
	//reports
	
	public function showReports()
	{
		$this->load->view('common/panels');
		$this->load->view('reports');
	}
	
	
	
	
}