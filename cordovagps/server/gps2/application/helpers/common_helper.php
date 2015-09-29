<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

if ( ! function_exists('dateFromFormatToCustom'))
{
	function dateFromFormatToCustom($dateFromStr,$dateFromStrFormat, $dateToStrFormat )
    {
		$resultDateStr = $dateFromStr;
		if($dateFromStr!=null){
			$dateFromStrObj = date_create_from_format($dateFromStrFormat,$dateFromStr);
			$resultDateStr = date_format( $dateFromStrObj,$dateToStrFormat);
		}
        return $resultDateStr;
    }   
}