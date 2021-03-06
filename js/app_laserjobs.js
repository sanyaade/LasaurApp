$(document).ready(function(){
  
  $('#gcode_queue').show();

  $('#library_placeholder').replaceWith($('#gcode_library'));
  $('#gcode_library').show();

  $('#gcode_library a').click(function(){		
  	$('#gcode_name').val( $(this).text() );
  	$('#gcode_program').val( $(this).next().text() );

  	// make sure preview refreshes
  	$('#gcode_program').trigger('blur');	
  });


  $('#calibration_placeholder').replaceWith($('#gcode_for_calibration'));
  $('#gcode_for_calibration').show();

  $('#gcode_for_calibration a').click(function(){
    $('#gcode_name').val( $(this).text() );
  	$('#gcode_program').val( $(this).next().text() );

  	// make sure preview refreshes
  	$('#gcode_program').trigger('blur');	
  });

  
  $("#gcode_submit").button()
  $("#gcode_submit").click(function(e) {
  	// send gcode string to server via POST
  	var gcode = $('#gcode_program').val();
  	$().uxmessage('notice', gcode.replace(/\n/g, '<br>'));
  	$.post("/gcode", { 'gcode_program':gcode }, function(data) {
  		if (data != "") {
  			$().uxmessage('success', "G-Code sent to serial.");	
  			// show progress bar, register live updates
  			if ($("#progressbar").progressbar( "option", "value" ) == 0) {
  				$("#progressbar").progressbar( "option", "value", 5 )
  				$("#progressbar").show();
  			  var progresstimer = setInterval(function() {
  					$.get('/queue_pct_done', function(data2) {
  						//$().uxmessage('notice', data2);
  						if (data2.length > 0) {
  							var pct = parseInt(data2);
  							//$().uxmessage('notice', data);
  							$('#progressbar').progressbar( "option", "value", pct );
  						} else {
  							$().uxmessage('notice', "Done.");
  							$('#progressbar').hide();
  							$('#progressbar').progressbar( "option", "value", 0 );
  							clearInterval(progresstimer);
  						}
  					});
  			  }, 3000);
  			}
  		} else {
  			$().uxmessage('error', "Serial not connected.");
  		}
    });
    
  	return false;
  });
  
  $("#gcode_submit").next().button( {
		text: false,
		icons: {
			primary: "ui-icon-triangle-1-s"
		}
  })
  $("#gcode_submit").next().toggle(function() {
    var pos = $(this).position();
    $("#gcode_more_div").css('left', pos.left-30).css('top', pos.top-30)
    $("#gcode_more_div").show();
    $('body').bind('click.dropdown', function(e) {
      $("#gcode_submit").next().trigger('click')
      // remove click event by namespace,
      // see: http://api.jquery.com/unbind/
      $('body').unbind('click.dropdown');
    });
  }, function() {
    $("#gcode_more_div").hide();
  });
  $("#gcode_submit").next().parent().buttonset();


  $("#gcode_bbox").button();  
  $("#gcode_bbox").click(function(e) {
    $().uxmessage('notice', "bbox not yet implemented");
    var gcodedata = $('#gcode_program').val();
    //var gcode_bbox = 
  });

  $("#gcode_save_to_queue").button();  
  $("#gcode_save_to_queue").click(function(e) {
    add_to_job_queue($('#gcode_program').val(), $.trim($('#gcode_name').val()));
  });


  $("#progressbar").progressbar({
  	value: 0
  });
  $("#progressbar").hide();


  // G-Code Canvas Preview
  //
  var canvas = new Canvas('#preview_canvas');
  canvas.background('ffffff');

  $('#gcode_program').blur(function() {
    var gcodedata = $('#gcode_program').val();
  	GcodeReader.parse(gcodedata, 0.25);
  	GcodeReader.draw(canvas);	
  });

});  // ready
