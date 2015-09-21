<?php

class User_model extends CI_Model {
	
	function __construct() {
		parent::__construct();
	}
    
	function loginUser($userName,$password){
		$this->db->select('userId,userName,deviceId,phoneNumber,created,customerId')
			->where('userName',$userName)
			->where('password',$password);
			
		 return $this->db->get('user')->result(); 
	}
	
	function getAllUsers($start, $limit, $sidx, $sord, $where1) {
	
	    $this->db->select('userId,userName,deviceId,phoneNumber,created,customerId');
	    $this->db->limit($limit);
	    if ($where1 != NULL)
	        $this->db->where($where1, NULL, FALSE);
	    $this->db->order_by($sidx, $sord);
	    $query = $this->db->get('user', $limit, $start);
	   // echo "users $limit $start --  $where1 --".implode(",", $query->result());
	    return $query->result();
	}
	
	public function createUser(){
	    $data = array('userName'=>  $this->input->post('userName'),
	        'deviceId'=>$this->input->post('deviceId'),
	        'phoneNumber'=>$this->input->post('phoneNumber'),
	        'created'=>date('d/m/y'),
	        'customerId'=>$this->input->post('customerId'));
	    $this->db->insert('user', $data);
	    echo'<div class="alert alert-success">One record inserted Successfully</div>';
	    exit;
	}
        
       function getUserName($deviceId){
           
            $this->db->select('userName')
			->where('deviceId',$deviceId);
	   
	    return $this->db->get('user')->result();
       }
	
	function updateUser($id, $data) {
		$this->db->where('userId', $id );
		return $this->db->update('user', $data);
			
	}
	
	function deleteUser($id) {
		 $this->db->where('userId', $id);
	    	 $this->db->delete('user');
	}
	
}
?>