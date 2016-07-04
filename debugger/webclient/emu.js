// Socket Declarations
var listener, ws;

// Image Declarations
var IMG_BASE = view.center;
IMG_BASE.y = 10;
//new Point(500, 10);

var msp_image = new Raster('msp', IMG_BASE.x + 142.5, 
			   IMG_BASE.y + 185.5);

var reset_button_down_image = new Raster('button_down', 
					 IMG_BASE.x + 215, 
					 IMG_BASE.y + 345);
reset_button_down_image.visible = false;

var P1_3_button_down_image = new Raster('button_down', IMG_BASE.x + 28,
					IMG_BASE.y + 345);
P1_3_button_down_image.visible = false;

var P1_0_LED_image = new Raster('P1_0_LED', IMG_BASE.x + 70, 
				IMG_BASE.y + 361.5);
P1_0_LED_image.visible = false;

var P1_6_LED_image = new Raster('P1_6_LED', IMG_BASE.x + 84, 
				IMG_BASE.y + 361);
P1_6_LED_image.visible = false;

// windows
var serial_window = document.getElementById('serial_window');    
var console_window = document.getElementById('console_window');    
var canvas = document.getElementById('myCanvas');


// Text declarations
var P1_0_value_text = new PointText({
    point: [IMG_BASE.x + 102, IMG_BASE.y + 190],
    content: '0',
    fontSize: 14,
    fontWeight: 'bold',
    fillColor: 'white',
    fontFamily: 'Terminal',
});

var P1_1_value_text = new PointText({
    point: [IMG_BASE.x + 102, IMG_BASE.y + 205],
    content: '0',
    fontSize: 14,
    fontWeight: 'bold',
    fillColor: 'white',
    fontFamily: 'Terminal',
});

var P1_2_value_text = new PointText({
    point: [IMG_BASE.x + 102, IMG_BASE.y + 220],
    content: '0',
    fontSize: 14,
    fontWeight: 'bold',
    fillColor: 'white',
    fontFamily: 'Terminal',
});

var P1_3_value_text = new PointText({
    point: [IMG_BASE.x + 102, IMG_BASE.y + 234],
    content: '0',
    fontSize: 14,
    fontWeight: 'bold',
    fillColor: 'white',
    fontFamily: 'Terminal',
});

var P1_4_value_text = new PointText({
    point: [IMG_BASE.x + 102, IMG_BASE.y + 248],
    content: '0',
    fontSize: 14,
    fontWeight: 'bold',
    fillColor: 'white',
    fontFamily: 'Terminal',
});

var P1_5_value_text = new PointText({
    point: [IMG_BASE.x + 102, IMG_BASE.y + 262],
    content: '0',
    fontSize: 14,
    fontWeight: 'bold',
    fillColor: 'white',
    fontFamily: 'Terminal',
});

var P1_6_value_text = new PointText({
    point: [IMG_BASE.x + 175, IMG_BASE.y + 262],
    content: '0',
    fontSize: 14,
    fontWeight: 'bold',
    fillColor: 'white',
    fontFamily: 'Terminal',
});

var P1_7_value_text = new PointText({
    point: [IMG_BASE.x + 175, IMG_BASE.y + 248],
    content: '0',
    fontSize: 14,
    fontWeight: 'bold',
    fillColor: 'white',
    fontFamily: 'Terminal',
});

// Table Declaration
var table = document.getElementById("register_table");

// textArea declarations
var stdout = document.getElementById('console');
stdout.value = "";

var serial = document.getElementById('serial_out');
serial.value = "";

// Button declarations
var pause_button = document.getElementById('pause_button');
var play_button = document.getElementById('play_button');
var enter_button = document.getElementById('enter_button');
var serial_enter_button = document.getElementById('serial_enter_button');
var upload_button = document.getElementById('upload_button');
var show_serial_button = document.getElementById('show_serial_button');


function print_console (text){
    var another = stdout.value + text;
    stdout.value = another;

    stdout.scrollTop = stdout.scrollHeight;
}

function print_serial (text){
    var another = serial.value + text;
    serial.value = another;

    serial.scrollTop = serial.scrollHeight;
}

//var serial_state = "visible";
show_serial_button.onclick = function()
{
    if (serial_window.style.display == "none") {
	serial_window.style.display = "block";
    }
    else {
	serial_window.style.display = "none";
    }
};

// upload binary file //
var contents;

//upload_button.onclick = function(){	     
upload_button.onclick = function() {	     
    ws.send("UPLOAD");
    ws.send(contents);
    ws.send("NPLOAD");
};

function readSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
	return;
    }

    var reader = new FileReader();
    
    reader.onload = function(e) {
	contents = e.target.result;
    };

    reader.readAsArrayBuffer(file);
}

document.getElementById('file-input').addEventListener('change', readSingleFile, false);
//

var prev_cmd = "";
enter_button.onclick = function(){
    if (stdin.value == "") {
	if (prev_cmd != "")
	    stdin.value = prev_cmd;
	else 
	    return;
    }
    else {
	prev_cmd = stdin.value;
    }

    ws.send(stdin.value);
    stdin.value = "";
};

serial_enter_button.onclick = function(){
    if (serial_in.value == "") {
	return;
    }
    
    ws.send("_SERIAL_");
    ws.send(serial_in.value + "\n");
    serial_in.value = "";
};

pause_button.onclick = function(){
    ws.send("PAUSE");
};

play_button.onclick = function(){
    ws.send("PLAY");
};	 

function onMouseDown (event) {
    var x = event.point.x;
    var y = event.point.y;

    //ws.send(x); ws.send(y);

    if (x >= (IMG_BASE.x + 15) && x <= (IMG_BASE.x + 49)) {
	if (y >= (IMG_BASE.y + 327) && y <= (IMG_BASE.y + 360)) {
	    P1_3_button_down_image.visible = true;
	}
    }

    if (x >= (IMG_BASE.x + 199) && x <= (IMG_BASE.x + 232)) {
	if (y >= (IMG_BASE.y + 327) && y <= (IMG_BASE.y + 360)) {
	    reset_button_down_image.visible = true;
	}
    }	     
    paper.view.update();
}

function onMouseUp (event) {
    P1_3_button_down_image.visible = false;
    reset_button_down_image.visible = false;
    
    paper.view.update();
}

function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
	str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

var stdout_mode = false;
var serial_mode = false;

// Websock Declarations
var listener = new WebSocket("ws://127.0.0.1:9000", 'emu-protocol');
//var listener = new WebSocket('ws://poorhackers.com:9000', 'emu-protocol');

listener.onmessage = function (event) {
    var msg = event.data;
    console.log("Here got " + msg);
    ws = new WebSocket("ws://127.0.0.1:" + msg, 'emu-protocol');
    //ws = new WebSocket("ws://poorhackers.com:" + msg, 'emu-protocol');
    
    ws.binaryType = "arraybuffer";

    function ab2str(buf) {
	return String.fromCharCode.apply(null, new Uint16Array(buf));
    }

    ws.onmessage =  function (event) {
	var packet = event.data;
	
	var data = new DataView(packet);
	var opcode = data.getUint8(0);

	var data_len = data.byteLength;
	var message_len = data_len - 1;
	
	var str_array = new Uint16Array(message_len * 2);
	
	for (var i = 1;i < data_len;i = i+1) {
	    str_array[i-1] = data.getUint8(i);
	    //console.log(str_array[i-1]);
	}
	
	var message = ab2str(str_array);
	var control_opcode = null;
	var control_data   = "";
	var control_data_len = 0;
	//console.log("Here got [" + message + "], len " + data_len);

	switch (opcode) {
	   case 0x00: {
	       control_opcode   = data.getUint8(1);

	       if (data_len > 2) {
		   control_data_len = data.getUint8(2);
		   
		   for (var k = 0;k < control_data_len;k++) {
		       control_data += data.getUint8(k + 3);
		       //console.log(' ' + data.getUint8(k + 3));
		   }

		   //console.log("control opcode: " + control_opcode);
		   //console.log("data len " + control_data_len);
		   //console.log("data: " + control_data);
	       }
	       break;
	   }

	   case 0x01: {
	       //console.log("console");
	       print_console(message);
	       break;
	   }

	   case 0x02: {
	       //console.log("serial");
	       print_serial(message);
	       break;
	   }
	}
	

	switch (control_opcode) {	    
	    // P1.0 OUTPUT
	    case 0x00: {
		P1_0_LED_image.visible = true;			 
		P1_0_value_text.content = '1';

		break;
	    }	    
	    case 0x01: {
		P1_0_LED_image.visible = false;
		P1_0_value_text.content = '0';

		break;
	    }
		
	    // P1.1 OUTPUT
	    case 0x02: {
		P1_1_value_text.content = '1';

		break;
	    }
	    case 0x03: {
		P1_1_value_text.content = '0';

		break;
	    }

	    // P1.2 OUTPUT
	    case 0x04: {
		P1_2_value_text.content = '1';

		break;
	    }
	    case 0x05: {
		P1_2_value_text.content = '0';

		break;
	    }

	    // P1.3 OUTPUT
	    case 0x06: {
		P1_3_value_text.content = '1';

		break;
	    }
	    case 0x07: {
		P1_3_value_text.content = '0';

		break;
	    }

	    // P1.4 OUTPUT
	    case 0x08: {
		P1_4_value_text.content = '1';

		break;
	    }
	    case 0x09: {
		P1_4_value_text.content = '0';

		break;
	    }

	    // P1.5 OUTPUT
	    case 0x0A: {
		P1_5_value_text.content = '1';

		break;
	    }
	    case 0x0B: {
		P1_5_value_text.content = '0';

		break;
	    }

	    // P1.6 OUTPUT
	    case 0x0C: {
		P1_6_LED_image.visible = true;
		P1_6_value_text.content = '1';

		break;
	    }
	    case 0x0D: {
		P1_6_LED_image.visible = false;
		P1_6_value_text.content = '0';

		break;
	    }
		
	    // P1.7 OUTPUT
	    case 0x0E: {
		P1_7_value_text.content = '1';

		break;
	    }
	    case 0x0F: {
		P1_7_value_text.content = '0';

		break;
	    }

	    // UPDATE REG R0 (PC)
	    case 0x10: {
		table.rows[0].cells[1].innerHTML = message;
		break;
	    }
	    // UPDATE REG R1 (SP)
	    case 0x11: {
		table.rows[0].cells[3].innerHTML = message;
		break;
	    }
	    // UPDATE REG R2 (SR)
	    case 0x12: {
		table.rows[0].cells[5].innerHTML = message;
		break;
	    }
	    // UPDATE REG R3 (CG2)
	    case 0x13: {
		table.rows[0].cells[7].innerHTML = message;
		break;
	    }
	    // UPDATE REG R4
	    case 0x14: {
		table.rows[1].cells[1].innerHTML = message;
		break;
	    }

	    // UPDATE REG R5
	    case 0x15: {
		table.rows[1].cells[3].innerHTML = message;
		break;
	    }
	    // UPDATE REG R6
	    case 0x16: {
		table.rows[1].cells[5].innerHTML = message;
		break;
	    }
	    // UPDATE REG R7
	    case 0x17: {
		table.rows[1].cells[7].innerHTML = message;
		break;
	    }
	    // UPDATE REG R8
	    case 0x18: {
		table.rows[2].cells[1].innerHTML = message;
		break;
	    }
	    // UPDATE REG R9
	    case 0x19: {
		table.rows[2].cells[3].innerHTML = message;
		break;
	    }
	    // UPDATE REG R10
	    case 0x1A: {
		table.rows[2].cells[5].innerHTML = message;
		break;
	    }
	    // UPDATE REG R11
	    case 0x1B: {
		table.rows[2].cells[7].innerHTML = message;
		break;
	    }
	    // UPDATE REG R12
	    case 0x1C: {
		table.rows[3].cells[1].innerHTML = message;
		break;
	    }
	    // UPDATE REG R13
	    case 0x1D: {
		table.rows[3].cells[3].innerHTML = message;
		break;
	    }
	    // UPDATE REG R14
	    case 0x1E: {
		table.rows[3].cells[5].innerHTML = message;
		break;
	    }
	    // UPDATE REG R15
	    case 0x1F: {
		table.rows[3].cells[7].innerHTML = message;
		break;
	    }

	    // UPDATE C FLAG
	    case 0x1F: {
		table.rows[3].cells[7].innerHTML = message;
		break;
	    }
	    // UPDATE Z FLAG
	    case 0x1F: {
		table.rows[3].cells[7].innerHTML = message;
		break;
	    }
	    // UPDATE N FLAG
	    case 0x1F: {
		table.rows[3].cells[7].innerHTML = message;
		break;
	    }
	    // UPDATE V FLAG
	    case 0x1F: {
		table.rows[3].cells[7].innerHTML = message;
		break;
	    }

	    default: {
		break;
	    }
	}

	paper.view.update();
    };

}

stdin.onkeydown = function auto_enter (event) {
    // On enter key press
    if (event.keyCode == 13) {
        enter_button.click();
    }
};

serial_in.onkeydown = function auto_enter (event) {
    // On enter key press
    if (event.keyCode == 13) {
        serial_enter_button.click();
    }
};


/// Dragable TextArea console_window
var selected = null, // Object of the element to be moved
    x_pos = 0, y_pos = 0, // Stores x & y coordinates of the mouse pointer
    x_elem = 0, y_elem = 0; // Stores top, left values (edge) of the element

// Will be called when user starts dragging an element
function _drag_init(elem) {
    // Store the object of the element which needs to be moved
    selected = elem;

    x_elem = x_pos - selected.offsetLeft;    
    y_elem = y_pos - selected.offsetTop;
}

// Will be called when user dragging an element
function _move_elem(e) {
    x_pos = window.event.clientX;
    y_pos = window.event.clientY;

    if (selected != null) {
        selected.style.left = (x_pos - x_elem) + 'px';
        selected.style.top  = (y_pos - y_elem) + 'px';
    }
}

// Destroy the object when we are done
function _destroy() {
    selected = null;
}

// Bind the functions...
document.getElementById('console_window').onmousedown = function () {
    _drag_init(this);
    stdin.focus();

    return false;
};

document.getElementById('serial_window').onmousedown = function () {
    _drag_init(this);
    serial_in.focus();

    return false;
};

document.getElementById('register_window').onmousedown = function () {
    _drag_init(this);

    return false;
};

document.onmousemove = _move_elem;
document.onmouseup = _destroy;

//var table = document.getElementById("register_table");
for (var i = 0, row; row = table.rows[i]; i++) {
    //iterate through rows
    //rows would be accessed using the "row" variable assigned in the for loop
    for (var j = 0, col; col = row.cells[j]; j++) {
	//table.rows[i].cells[j].innerHTML = "X";
    }  
}
