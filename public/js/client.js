$(document).ready(function(){
	var spinner = $("#refreshrate").spinner();
	var tabs = $("#tabs").tabs();
	var psButton = $("#psbutton").button({
		icons: {
			secondary: "ui-icon-arrowthick-1-s"
		},
		disabled: false
	});
	var refreshODButton = $("#refreshondemand").button({
		icons: {
			secondary: "ui-icon-refresh"
		},
		disabled: true
	});
	var refreshButton = $("#refreshbutton").button({
		icons: {
			secondary: "ui-icon-play"
		},
		disabled: true
	});
	var stopRefreshButton = $("#stoprefreshingbutton").button({
		icons: {
			secondary: "ui-icon-stop"
		},
		disabled: true
	});
	var dataTable;
	var clickedPID, PIDOwner, refreshInterval;
	var menuItemsDisabled = { kill: false, sleep: false, wake: false, dc: false, quit: false };

	$("#processestable").on("contextmenu", "tr", function() {
		clickedPID = $("td:eq(1)", this).text();
		PIDOwner = $("td:eq(0)", this).text();
			if(PIDOwner == "pkoniu") {
			$.each(menuItemsDisabled, function(i, n) {
				menuItemsDisabled[i] = true;
			});
		} else {
			$.each(menuItemsDisabled, function(i, n) {
				menuItemsDisabled[i] = false;
			});
		}
	});

	$(document).contextmenu({
		delegate: ".dataTable tr",
		menu: [
		        {
		            title: "D/C from PPID",
		            cmd: "dc"
		        },
		        {
		            title: "Quit",
		            cmd: "quit"
		        },
		        {
		        	title: "Kill",
		        	cmd: "kill"
		        },
		        {
		            title: "Sleep",
		            cmd: "sleep"
		        },
		        {
		            title: "Wake",
		            cmd: "wake"
		        },
		        {
		        	title: "----"
		        },
		        {
		        	title: "Refresh",
		        	cmd: "refresh"
		        }
		],
		select: function(event, ui) {
			switch(ui.cmd){
				case "dc":
					runAddon(clickedPID, 1);
					break;
				case "quit":
					runAddon(clickedPID, 3);
					break;
				case "kill":
					runAddon(clickedPID, 9);
					break;
				case "sleep":
					runAddon(clickedPID, 20);
					break;
				case "wake":
					runAddon(clickedPID, 18);
					break;
				case "refresh":
					refreshTable(true);
					break;
		        }
		},
		beforeOpen: function(event, ui) {
			$(document).contextmenu("enableEntry", "kill", menuItemsDisabled["kill"]);
			$(document).contextmenu("enableEntry", "sleep", menuItemsDisabled["sleep"]);
			$(document).contextmenu("enableEntry", "wake", menuItemsDisabled["wake"]);
			$(document).contextmenu("enableEntry", "dc", menuItemsDisabled["dc"]);
			$(document).contextmenu("enableEntry", "quit", menuItemsDisabled["quit"]);
		}
	});		

	$("#processestable tbody")
		.on('mouseover', 'td', function (){
			var colIdx = table.cell(this).index().column;
				if (colIdx !== lastIdx) {
					$(table.cells().nodes()).removeClass('highlight');
					$(table.column(colIdx).nodes()).addClass('highlight');
				}
			})
		.on('mouseleave', function (){
			$(table.cells().nodes()).removeClass('highlight');
		});

	$("#psbutton").click(function() {
		refreshTable(false);
		psButton.button("option", "disabled", true);
		refreshButton.button("option", "disabled", false);
		refreshODButton.button("option", "disabled", false);
	});

	$("#refreshondemand").click(function() {
		refreshTable(true);
	});

	$("#refreshbutton").click(function(){
		refreshInterval = setInterval(function() {
		refreshTable(true);
	}, spinner.spinner("value")*1000);
		refreshODButton.button("option", "disabled", true);
		refreshButton.button("option", "disabled", true);
		stopRefreshButton.button("option", "disabled", false);
	});

	$("#stoprefreshingbutton").click(function(){
		clearInterval(refreshInterval);
		refreshButton.button("option", "disabled", false);
		stopRefreshButton.button("option", "disabled", true);
		refreshODButton.button("option", "disabled", false);
	});

	function refreshTable(ver) {
		if(ver) {
			$("#processestable").html("");
			$("#processestable").dataTable().fnDestroy();
		}

		$.getJSON('tmp/ps.json', function(data, status){
			var txt, xx, x;

			txt = 	"<table border='1'> \
						<thead><tr> \
							<th>User</th> \
							<th>PID</th> \
							<th>%CPU</th> \
							<th>%MEM</th> \
							<th>VSZ</th> \
							<th>RSS</th> \
							<th>TTY</th> \
							<th>State</th> \
							<th>Started</th> \
							<th>Time</th> \
							<th>Command</th> \
							</tr> \
						</thead>";

			$.each(data, function(i, n) {
				txt = txt + "<tr>";

				$.each(data[i], function(j, m) {
					txt = txt + "<td>" + m + "</td>";
				});
							
				txt = txt + "</tr>";
			});

			$("#processestable").html(txt);
			dataTable = $("#processestable").dataTable();
		});
	}

	function runAddon(pid, signal) {
		var serverParam = {
			pid: pid,
			signal: signal
		};

		stringifiedServerParam = JSON.stringify(serverParam);

		$.ajax({
	        "url": "http://localhost:8888/",
	        "type": "POST",
	        "contentType": "application/json",
	        "data": stringifiedServerParam,
	        "dataType": "json"
    	});
	}
});