<?php
/**
 * @package iCMS
 * @copyright 2007-2017, iDreamSoft
 * @license http://www.idreamsoft.com iDreamSoft
 * @author coolmoo <idreamsoft@qq.com>
 */
class apps {
	public static $table   = 'article';
	public static $primary = 'id';
	public static $appid   = '1';

    public static function table($appId){
        $appMap = array(
            '1'  => 'article',   //文章
            '2'  => 'category',  //分类
            '3'  => 'tags',      //标签
            '4'  => 'push',      //推送
            '5'  => 'comment',   //评论
            '6'  => 'prop',      //属性
            '7'  => 'message',   //私信
            '8'  => 'favorite',  //收藏
            '9'  => 'user',      //用户
            '10' => 'weixin',    //微信
            '11' => 'download',  //下载
        );
        return $appMap[$appId];
    }

	public static function init($table = 'article',$appid='1',$primary = 'id'){
		self::$table   = $table;
		self::$primary = $primary;
		self::$appid   = $appid;
		return self;
	}
	public static function cache(){
        $rs = iDB::all("SELECT `id`,`name`,`title`,`table`,`field` FROM `#iCMS@__app`");

        foreach((array)$rs AS $a) {
        	$tb_array = json_decode($a['table']);
        	$table = array(
				'name'    => '#iCMS@__'.$tb_array[0][0],
				'primary' => $tb_array[0][1],
        	);
        	if($tb_array[1]){
				$table['join'] = '#iCMS@__'.$tb_array[1][0];
				$table['on']   = $tb_array[1][1];
        	}
        	$a['table'] = $table;
			$app_id_array[$a['id']]     = $a;
			$app_name_array[$a['name']] = $a;

			iCache::delete('iCMS/app/'.$a['id']);
			iCache::set('iCMS/app/'.$a['id'],$a,0);

			iCache::delete('iCMS/app/'.$a['name']);
			iCache::set('iCMS/app/'.$a['name'],$a,0);

        }
        iCache::set('iCMS/app/cache_id',  $app_id_array,0);
        iCache::set('iCMS/app/cache_name',$app_name_array,0);
	}
	public static function get_app($appid=1){
		$rs	= iCache::get('iCMS/app/'.$appid);
       	$rs OR iPHP::error_throw('app no exist', '0005');
       	return $rs;
	}
	public static function get_url($appid=1,$primary=''){
		$rs	= self::get_app($appid);
		return iCMS_URL.'/'.$rs['name'].'.php?'.$rs['table']['primary'].'='.$primary;
	}
	public static function get_table($appid=1){
		$rs	= self::get_app($appid);
       	return $rs['table'];
	}
	public static function get_label($appid=0,$key='title'){
		$array	= iCache::get('iCMS/app/cache_id');
		if($appid){
			return $array[$appid][$key];
		}
       	return $array;
	}


}
