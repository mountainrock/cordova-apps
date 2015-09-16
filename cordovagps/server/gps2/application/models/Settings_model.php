<?php

class Settings_model extends CI_Model {
	
	function __construct() {
		parent::__construct();
		
	}
	function getAllSettings($start, $limit, $sidx, $sord, $where1) {
	
	    $this->db->select('*');
	    $this->db->limit($limit);
	    if ($where1 != NULL)
	        $this->db->where($where1, NULL, FALSE);
	    $this->db->order_by($sidx, $sord);
	    $query = $this->db->get('masterentry', $limit, $start);
	   // echo "settings $limit $start --  $where1 --";
	    return $query->result();
	}
	
	public function createSetting($name, $value,$status, $customerId){
	    $data = array('name'=>  $name,
		        'value'=>$value,
		        'status'=>$status,
		        'lastUpdate'=>date('y-m-d h:i:s'),
		        'customerId'=>$customerId);
	    $this->db->insert('masterentry', $data);
	    echo'<div class="alert alert-success">One record inserted Successfully</div>';
	    exit;
	}
	
	function updateSetting($name, $value, $customerId) {
              $data = array( 'value'=>$value,
			        'lastUpdate'=>date('y-m-d h:i:s'),
			        );
	        
		$where = array('name' => $name, 'customerId' => $customerId);
		return $this->db->update('masterentry', $data, $where);
			
	}
	
/*	function deleteSetting($id) {
		 $this->db->where(array('settingId'=> $id));
	    	 $this->db->delete('setting');
	}*/
	
}
?>