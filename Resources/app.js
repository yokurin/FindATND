// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// create tab group
var tabGroup = Titanium.UI.createTabGroup();


//
// create base UI tab and root window
//
var win1 = Titanium.UI.createWindow({  
    title:'ATND検索',
    backgroundColor:'#fff'
});
var tab1 = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'ATND検索',
    window:win1
});

var label1 = Titanium.UI.createLabel({
	color:'#999',
	top: 10,
	text:'キーワードを入力してください',
	//font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	width:'auto'
});
win1.add(label1);


//キーワードを入力するテキストフィールド
var textField1 = Ti.UI.createTextField({
	value: '',
	hintText: '例:android',
	top: 35,
	width: '70%',
	borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
	autocapitalization: false //先頭を大文字にしない
});
win1.add(textField1);

//読み込まれたときにfocusする
win1.addEventListener('focus',function(e){
	textField1.focus();
});


var win2 = Titanium.UI.createWindow({  
    title:'検索結果',
    backgroundColor:'#fff'
});
var tab2 = Titanium.UI.createTab({  
    icon:'KS_nav_ui.png',
    title:'検索結果',
    window:win2
});


//URI中に使用する定数の宣言
const ROW_IN_PAGE = 7;
var startPos = 1;
var findword = '';

//tableViewRowを格納するための配列
var tableViewRowList = [];
var refControl = Ti.UI.createRefreshControl({
	tintColor: 'blue'
});
var tableView = Ti.UI.createTableView({
	refreshControl: refControl
});
win2.add(tableView);

//http通信を開始するボタン
var button1 = Ti.UI.createButton({
	title: '検索',
	top: 75,
	width: '100',
	height: '30'
});

button1.addEventListener('click', function(e){
	var findword = textField1.value;
	if(findword.length === 0)
	{
		alert('検索ワードを入力してください');
		return;
	}
	startPos = 1;
	tableViewRowList = [];
	getJsonData();
});
win1.add(button1);

function getJsonData()
{
	//encodeURIComponent 文字列を完全なURI形式にエンコードする
	var url = 'http://api.atnd.org/events/?keyword=' + encodeURIComponent(findword) + '&count=' + ROW_IN_PAGE + '&start='+ startPos + '&format=json';
	var client = Ti.Network.createHTTPClient({
		onload: function(e)
		{
			Ti.API.info('受けとったテキスト：'+this.responseText);
			
			try{
				//JSONパース
				var jsondata = JSON.parse(this.responseText);
				jsonToRow(jsondata);
				tabGroup.activeTab = 1;
			}catch(err){
				alert('JSON変換エラー：' + err.message);
			}
		},
		onerror:function(e)
		{
			Ti.API.debug(e.error);
		},
		timeout: 5000
		
	});
	
	//GETで取得
	client.open('GET', url);
	//http getを実行
	client.send();	
}


function jsonToRow(jsondata)
{
			
		//行データの作成
		for(var i=0; i<jsondata.results_returned; i++)
		{
			var rowdata = jsondata.events[i];
			
			//セルの作成
			var labelEventId = Ti.UI.createLabel({
				text: rowdata.event_id,
				font:{fontSize:10},
				textAlign: 'left',
				color: '#000',
				top: 20,
				left: 0,
				width: 'auto',
				height: 20 
			});
			var labelTitle = Ti.UI.createLabel({
				text: rowdata.title,
				font:{fontSize:12, fontWight:'bold'},
				textAlign:'left',
				color: '#00f',
				top: 20,
				left: 0,
				width: 'auto',
				height: 40 					
			});
			var labelStartedAt = Ti.UI.createLabel({
				text: rowdata.started_at,
				font:{fontSize:10},
				textAlign:'left',
				color: '#000',
				top: 12,
				left: 60,
				width: 'auto',
				height: 40
			});
			var labelAddress = Ti.UI.createLabel({
				text: rowdata.address,
				font:{fontSize:12},
				textAlign:'left',
				color: '#00f',
				top: 0,
				left: 60,
				width: 'auto',
				height: 20
			});
			
			//Cellのクラス名と高さを定義
			var row = Ti.UI.createTableViewRow({
				height: 60
			});
			
			row.add(labelEventId);
			row.add(labelTitle);
			row.add(labelStartedAt);
			row.add(labelAddress);
			
			tableViewRowList.push(row);
		}
		
		//取得したJSONデータを一覧表示する
		tableView.setData(tableViewRowList);
}

refControl.addEventListener('refreshstart', function(e){
	startPos = startPos + ROW_IN_PAGE;
	getJaonData();
	refControl.endRefreshing();
});

//
//  add tabs
//
tabGroup.addTab(tab1);  
tabGroup.addTab(tab2);  


// open tab group
tabGroup.open();
