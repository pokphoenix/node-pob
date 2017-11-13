
var app     = require('express')();
var server  = require('http').Server(app);
var io      = require('socket.io')(server);
var port    = 8080;
var extend = require('util')._extend;


// var mysql      = require('mysql');

// var host = "localhost";
// var user  =    'ferretki_dota';
// var password = 'dota1234';
// var database = 'ferretki_dota';

// console.log('ENV',process.env.ENVIRONMENT);

// if (typeof process.env.ENVIRONMENT != 'undefined'){
//   	host = "localhost";
// 	user  =    'root';
// 	password = '';
// 	database = 'ferretki_dota';
// 	console.log(process.env.ENVIRONMENT);
// }



// var database = mysql.createConnection({
//   host     : host,
//   user     : user,
//   password : password,
//   database : database
// });

var users = [];
// var match = [{ room: '425471505460960752', user_1: 'a', user_2: 'c' }
// { room: '425471505460960752', user_1: 'a', user_2: 'c' }
// { room: '425471505460960752', user_1: 'a', user_2: 'c' }
// ];

var match = [];

var history = [];

var currentBoard = [] ;

// database.connect(function(err){
// if(!err) {
//     console.log("Database is connected ... nn");    
// } else {
//     console.log("Error connecting database ... nn");    
// }
// });

app.set('socketIo', io);




server.listen(port, function () {
  console.log('Server listening at port %d', port);
});


app.get('/', function(req, res){

});

app.get('/login', function(req, res){
 	res.sendFile(__dirname + '/index.html');
});

app.get('/rand', function(req, res){
	var board = [];
	for (var i=0 ; i<8;i++){
		var arry =[];
		for (var j=0 ; j<8;j++){
			// console.log(i,j);
			arry.push(rand(1,6));
		}
		board.push(arry);
	}
	console.log('board ',board);
	console.log('board [0][0]',board[0][0]);
	console.log('board [0][7]',board[0][7]);
	console.log('board [1][1]',board[1][1]);
	console.log('board [2][2]',board[2][2]);
	res.send('board '+board);
});

app.get('/checkroom/:userId', function(req, res){
  	id =	req.params.userId ;
  	users = id;
  	// if (match.length>0){
  	// 	users = getValueByKey(match, {
			// 	  key: 'user_1',
			// 	  value: id
			// 	});
  	// 	res.send(users);
  	// }
  	response = {};
  	response.result = true;
	response.error = '';
	response.response_time = Math.floor(Date.now()/1000,0) ;
	response.response = {};
  	res.setHeader('Content-Type', 'application/json');
    
  	if (typeof match !== 'undefined' && match.length > 0) { 
  	    	searchRoom(match, {
			  key1: 'user_1',
			  key2: 'user_2',
			  value: id
			},
			'room'
			).then((text) => {
			  response.response.resume = true ;
			  res.status(200).send(JSON.stringify(response, null, 3));
			}).catch((error) => {
			  response.response.resume = false ;
			  res.status(200).send(JSON.stringify(response, null, 3));
			})
  		
  		// res.send( 'rooms',rooms);
  	}else{
  		response.response.resume = false ;
		res.status(200).send(JSON.stringify(response, null, 3));
  	}
    // res.send( typeof match+' : '+match.length);
  	
});


app.get("/getuser",function(req,res){
	const userLandVariable = 58 ;
	// database.query(`SELECT * FROM users WHERE id = ${mysql.escape(userLandVariable)}`, function(err, rows, fields) {
	// database.end();
	//   if (!err){
	//   	// console.log('The solution is: ', rows);
	//   	rows.forEach( (row) => { 
	// 	  console.log(`${row.name} is in ${row.location}`); 
	// 	});
	//  	res.json(rows);
	//   }else
	//     console.log('Error while performing Query.');
 //  	});
	
});


function generateBoard(){
	var board = [];
	for (var i=0 ; i<8;i++){
		var arry =[];
		for (var j=0 ; j<8;j++){
			// console.log(i,j);
			arry.push(rand(1,6));
		}
		board.push(arry);
	}
	return board;
}

function removeByKey(array, params){
  array.some(function(item, index) {
    return (array[index][params.key] === params.value) ? !!(array.splice(index, 1)) : false;
  });
  return array;
}

function searchRoom(array, paramsIn,paramsOut){
    return new Promise(
	function (resolve, reject) {
		var search_room = 0 ;
		for (var i=0; i < array.length; i++) {
			console.log(i,paramsIn.key1,paramsIn.value,paramsIn.key2,paramsIn.value);
	        if (array[i][paramsIn.key1] === paramsIn.value || array[i][paramsIn.key2] === paramsIn.value ) {
	            search_room = array[i][paramsOut] ;
	        }
	    }
	    if (search_room!=0){
	    	resolve(search_room); 
	    }else{
	    	reject(0);
	    }
    });
}

function rand(min,max){
	return Math.floor((Math.random() * max) + min);
}

function clone(a) {
   return JSON.parse(JSON.stringify(a));
}
function findMatch(data,value) { 
    return data.room === value;
}





io.on('connection', function (socket) {
	var currentRoomId;
	var userGuid;
	var myTimeout;
	var myDisconnect ;
	console.log('[ '+socket.id+' ] connection');
	// console.log('room',io.sockets.adapter.rooms); //  ดู room ทั้งหมด
	socket.on('cancel_search', function(data) {  
		users = removeByKey(users, {
		  key: 'id',
		  value: userGuid
		});
		clearTimeout(myTimeout);
	})

	socket.on('search', function(data) { 
	 	console.log('type of b4', typeof data);
	 	if (typeof data==='string'){
	 		data = JSON.parse(data);
	 		data.level = parseInt(data.level);
	 	}
	 	console.log('type of af', typeof data);
        console.log('search ', typeof data.id,'|', typeof data.level,data);
        // console.log('users ', users);
        // str = 'a|1';
        // var res = str.split("|");
        // console.log('res',res);
        // var data = {};
        // data.id = res[0];
        // data.level = res[1];
        userGuid = data.id;
        var user_data = {
		  		id : data.id
		  		,name : data.name
		  		,level : data.level
		  		,hero_id : data.hero_id
		  		,item : data.item_slot
		  	};
	  	console.log(user_data);
		myTimeout = setTimeout(function(){ 
	        	// console.log(data.id,'setTimeout ');
        	users = removeByKey(users, {
				  key: 'id',
				  value: userGuid
				});
        	socket.emit('time_out','time out');
        }, 10000);


	    	//--- เช็คว่ามีแข่งอยู่หรือไม่
        var b4Search =  JSON.parse(JSON.stringify(match));
        for(var i = 0; i < b4Search.length; i++)
        {
        	if( b4Search[i].user_1.user_id == user_data.id || b4Search[i].user_2.user_id == user_data.id ){
        		clearTimeout(myDisconnect);
        		socket.emit('find',b4Search[i]);
        		return ;
        	}
        }

        var b4Users = JSON.parse(JSON.stringify(users));
	    var pushData = true ;
	    // console.log('length ',b4Users.length);
	    //--- ค้นหา user ที่อยู่ในเงื่อนไขเดียวกัน
	    for(var i = 0; i < b4Users.length; i++)
		{
			//--- ถ้าเจอ ก็เริ่มเกม join room 
			// console.log('search ', b4Users[i].level,'=',data.level);
			if( (b4Users[i].level == user_data.level) && (b4Users[i].id != user_data.id)  )
			{
				var room = rand(1,100000)+''+Date.now() ;
				var board = generateBoard();

				var user_1 = { 'user_id': b4Users[i].id
								,'hero_id': b4Users[i].hero_id
								,'hero_hp': rand(5000,10000)
								,'item' : b4Users[i].item
								,'seq' : 0
								,'board' : board
								,'loading':0
							 }
				var user_2 = { 'user_id': user_data.id
								,'hero_id': user_data.hero_id
								,'hero_hp': rand(5000,10000)
								,'item' : user_data.item
								,'seq' : 0
								,'board' : board
								,'loading':0
							 }
				var matchData = {
					'room':room
					,'user_1':user_1
					,'user_2':user_2
					,'board':board
				};
				match.push(matchData);	

				var historyData = {
					'room':room
					,'history_1_arr':[] 
					,'history_2_arr':[] 
				}
				history.push(historyData);	
			 	console.log( 'matching ['+room+']',matchData.user_1.user_id+' ('+matchData.user_1.hero_id+') vs '+ matchData.user_2.user_id+' ('+matchData.user_2.hero_id+')');	
			 	pushData = false;	
			 	users = removeByKey(users, {
				  key: 'id',
				  value: b4Users[i].id
				});
				io.emit('find',matchData);
			}
		}
		if (pushData){
	    	// data.searchtime = Math.floor(Date.now() / 1000)
			users.push(user_data);
	    }
     

    })

	socket.on('find', function(data) {
        console.log('server find  ',data);
        socket.emit('find',data);
    });
	socket.on('chat', function(data) {
        // console.log('send ',data);
        socket.emit('chat', 'hello '+data);
        io.in(data.room).emit('message', 'hello '+data);
    });
    socket.on('sync_loading', function(data) {
    	if (typeof data==='string'){
	 		data = JSON.parse(data);
	 		data.loading = parseInt(data.loading);
	 	}
    	var response;
    	for(var i = 0; i < match.length; i++)
	    {
        	if( (match[i].room == data.room) && (match[i].user_1.user_id == data.id) ){ 
        		match[i].user_1.loading = data.loading ;
        		response = match[i].user_1 ;
        	} 
        	if( (match[i].room == data.room) && (match[i].user_2.user_id == data.id) ){ 
        		match[i].user_2.loading = data.loading ;
        		response = match[i].user_2 ;
        	}
	    }
        socket.broadcast.to(data.room).emit('sync_loading', response);
    });
    socket.on('history', function(data) {
    	if (typeof data==='string'){
	 		data = JSON.parse(data);
	 		data.action = parseInt(data.action);
	 	}
        for(var i = 0; i < history.length; i++)
        {
        	if( (history[i].room == data.room) && (data.action==1) ){
        		response = history[i].history_1_arr ;
        	}else if( (history[i].room == data.room) && (data.action==2) ){
        		response = history[i].history_2_arr ;
        	}
        }
        console.log('get history',response);
        socket.emit('history', response);    //----
        //io.in(data.room).emit('history',response);
    });
  
    socket.on('subscribe', function(room) { 
        console.log('joining room', room);
        socket.join(room);
        currentRoomId = room ;
        clearTimeout(myTimeout);
    })

    socket.on('save_data', function(data) { 
    	if (typeof data==='string'){
	 		data = JSON.parse(data);
	 	}
        for(var i = 0; i < match.length; i++)
	    {
        	if( (match[i].room == data.room) && (match[i].user_1.user_id == data.id) ){ 
        		match[i].user_1.user_id = data.id ;
        		match[i].user_1.hero_id = data.hero_id ;
				match[i].user_1.hero_hp = data.hero_hp ;
        		match[i].user_1.board = data.board ;
        	} 
        	if( (match[i].room == data.room) && (match[i].user_2.user_id == data.id) ){ 
        		match[i].user_2.user_id = data.id ;
        		match[i].user_2.hero_id = data.hero_id ;
				match[i].user_2.hero_hp = data.hero_hp ;
        		match[i].user_2.board = data.board ;
        	}
	    }
    })
    socket.on('delete_history', function(data) { 
    	if (typeof data==='string'){
	 		data = JSON.parse(data);
	 		data.seq = parseInt(data.seq);
	 	}
    	var response ;
    	var historyData ;
    	var index;
        for(var i = 0; i < match.length; i++)
	    {
        	if( (match[i].room == data.room) && (match[i].user_1.user_id == data.id) ){ 
        		for (var j=0 ;j<history[i].history_2_arr.length;j++ ){
        			if (history[i].history_2_arr[j].seq == data.seq){
        				console.log('delete_history 2 ['+j+'] ',history[i].history_2_arr[j]);
        				history[i].history_2_arr.splice(0, j);
        				break;
        			}
        		}
        		response = history[i].history_2_arr ;
        	} 
        	if( (match[i].room == data.room) && (match[i].user_2.user_id == data.id) ){ 
        		for (var j=0 ;j<history[i].history_1_arr.length;j++ ){
        			if (history[i].history_1_arr[j].seq == data.seq){
        				console.log('delete_history 1 ['+j+'] ',history[i].history_1_arr[j]);
        				history[i].history_1_arr.splice(0, j);
        				break;
        			}
        		}
        		response = history[i].history_1_arr ;
        	}
	    }
	    console.log('history',response);
    })

    socket.on('sync_action', function(data) { 
    	
	 	if (typeof data==='string'){
	 		console.log('sync_action type of b4', typeof data);
	 		data = JSON.parse(data);
	 		data.action = parseInt(data.action);
	 		console.log('sync_action type of af', typeof data);
	 	}
	 	
        console.log('sync_action input', data);
        var response = {};
        for(var i = 0; i < match.length; i++)
	    {
        	if( (match[i].room == data.room) && (match[i].user_1.user_id == data.id) ){ 
        		if(data.action==3){
        			match[i].user_2.hero_hp -= parseInt(data.arr[0])  ;
        		}
        		match[i].user_1.seq++ ;
        		var historyData = clone(data) ;
        		historyData.seq = match[i].user_1.seq ;
        		delete historyData.room;
        		delete historyData.id;
        		if(history[i].room == data.room){
					history[i].history_1_arr.push(historyData);
					console.log('set history 1 ',historyData.seq,history[i].history_1_arr);
        		}
        		response.seq = match[i].user_1.seq ;
        	} 
        	if( (match[i].room == data.room) && (match[i].user_2.user_id == data.id) ){ 
        		if(data.action==3){
        			match[i].user_1.hero_hp -= parseInt(data.arr[0])  ;
        		}
        		match[i].user_2.seq++ ;
        		var historyData = clone(data) ;
        		historyData.seq = match[i].user_2.seq ;
        		delete historyData.room;
        		delete historyData.id;
        		if(history[i].room == data.room){
					history[i].history_2_arr.push(historyData);
					console.log('set history 2 ',historyData.seq,history[i].history_2_arr);
        		}
        		 response.seq = match[i].user_2.seq ;
        	}
	    }

	    response.event = data.action ;
	    response.arr = data.arr ;

	    console.log('sync_action output ', response);
	    //io.in(data.room).emit('sync_action', response);
	    socket.broadcast.to(data.room).emit('sync_action', response);
    })
    socket.on('end_match', function(room) {  
        console.log('leaving room', room);
      	match = removeByKey(match, {
				  key: 'room',
				  value: room
				});
        
		console.log('match',match);
		io.in(room).emit('end_match',{status:true});
		//  io.sockets.clients(room).forEach(function(s){
		//     s.leave(room);
		// });
		 // io.sockets.in(room).leave(room);
       	// socket.leave(room); 
       	//--- remove roome
       	io.of('/').in(room).clients(function(error, clients) {
		    if (clients.length > 0) {
		        // console.log('clients in the room: \n');
		        // console.log(clients);
		        clients.forEach(function (socket_id) {
		            io.sockets.sockets[socket_id].leave(room);
		        });
		    }
		});
    })

    socket.on('disconnect', function() {
     	// socket.broadcast.in(currentRoomId).emit('user:left', socket.id);
     	users = removeByKey(users, {
				  key: 'id',
				  value: userGuid
				});

     	// console.log('users',users);

     	//--- กรณีหลุดระหว่างแข่ง
     	if(typeof currentRoomId != 'undefined'){
     		myDisconnect = setTimeout(function(){ 
	        	socket.leave(currentRoomId);
	        	console.log(socket.id,'leave ',currentRoomId);
	        	// ถ้าหลุดจากเกมทั้ง 2 คน  บังคับจบเกม 
		     	io.of('/').in(currentRoomId).clients(function(error, clients) {
		     		 console.log('clients in the room: \n',clients.length);
				    if (clients.length <= 0) {
				    	//ล้างข้อมูลแมทออกจาก server เพื่อให้เวลา join เข้ามาแล้วไม่กลับเข้าไป
				        match = removeByKey(match, {
						  key: 'room',
						  value: currentRoomId
						});
				        // console.log(clients);
				        clients.forEach(function (socket_id) {
				            io.sockets.sockets[socket_id].leave(currentRoomId);
				        });
				    }
				});
	        }, 5000);
     		
	     	 // console.log(socket.id,' disconnect room ',currentRoomId);

	     	
     	}
     	

    });

});
