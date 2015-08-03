'use strict';

(function (window) {

	function WeatherWidget(z){
		var instance = this;
		instance.zipcode = z;
		instance.weatherData;
		instance.container = $('#weatherWidget');
		instance.inner = $('<div />').attr('class', 'weather-widget-inner');

		//instantiate promise object for data returned
		instance.forecastDefer = $.Deferred();

		//create and attach Widget HTML to DOM
		instance.currentTempHTML = instance.createCurrentTempHTML();
		instance.forecastHTML = instance.createForecastHTML();
		instance.currentTempHTML.appendTo(instance.inner);
		instance.forecastHTML.appendTo(instance.inner);
		instance.inner.appendTo(instance.container);

		//center widget, create ajax listener, fetch data
		instance.centerWidget();
		instance.createAjaxListenerEvent();
		instance.getWeatherData(instance.zipcode);


		//set data once returned from ajax call
		instance.forecastDefer.done(function(){
			instance.setCurrentForecast();
			instance.set5DayForecast();
		});
	}

	//calls yahoo api to get data from zipcode passed in
	WeatherWidget.prototype.getWeatherData = function(z){
		var instance = this;
		var zipcode = z;
		var regex = /^\d{5}$/;
		
		if(regex.test(zipcode)){
			$.ajax('http://query.yahooapis.com/v1/public/yql?q=select%20item%20from%20weather.forecast%20where%20location%3D%22' + zipcode + '%22&format=json')
			.done(function(data){
				instance.weatherData = data.query.results.channel.item;
				instance.forecastDefer.resolve();
			})
			.error(function(e){
				instance.createErrorMsg("ajax");
			});
		}else{
				instance.createErrorMsg("zipcode");
		}
	};

	//listener event for ajax calls. attaches spinner image to widget while data is being fetched
	WeatherWidget.prototype.createAjaxListenerEvent = function(){
		var instance = this;

		$(document).ajaxStart(function() {
			instance.container.addClass('loading');
		}).ajaxStop(function(){
			instance.container.removeClass('loading');
		});
	};

	//injects the data for the current weather conditions
	WeatherWidget.prototype.setCurrentForecast = function(){
		var data = this.weatherData;
		var ele = $('.current-temp');
		var head = ele.find('.locale');
		var temp = ele.find('.temp');
		var image = ele.find('img');
		var desc = ele.find('.description');

		var tmp = data.title.substr(14);
		var localeArray = tmp.split(' at ');
		var imgArray = data.description.split('\"');

		head.text(localeArray[0]);
		temp.html(data.condition.temp + '&deg;');
		image.attr('src', imgArray[1]);
		desc.text(data.condition.text);
	};

	//injects the data for the 5 day forecast
	WeatherWidget.prototype.set5DayForecast = function(){
		var data = this.weatherData.forecast;
		var ele = $('.five-day-forecast');

		for(var f in data){
			var item = $(ele.children()[f]);
			var day = item.find('.day');
			var hi = item.find('.hi');
			var low = item.find('.low');

			day.text(data[f].day);
			hi.html(data[f].high + '&deg;');
			low.html(data[f].low + '&deg;');
		}
	};

	//creates HTML scaffolding for the current conditions
	WeatherWidget.prototype.createCurrentTempHTML = function(){
		var container = $('<div />').attr('class', 'current-temp');
		var table = $('<div />').attr('class', 'table-block');
		var cell = $('<div />').attr('class', 'cell-block');
		var cell2 = $('<div />').attr('class', 'cell-block');
		var locale = $('<h4 />').attr('class', 'locale');
		var temp = $('<span />').attr('class', 'temp');
		var img = $('<img />').attr('src', '');
		var desc = $('<span />').attr('class', 'description');

		temp.appendTo(cell);
		img.appendTo(cell2);
		desc.appendTo(cell2);
		cell.appendTo(table);
		cell2.appendTo(table);
		locale.appendTo(container);
		table.appendTo(container);

		return container;
	};

	//creates HTML scaffolding for the 5 day forecast
	WeatherWidget.prototype.createForecastHTML = function(){
		var container = $('<ul />').attr('class', 'five-day-forecast list-inline');

		for(var x = 0; x < 5; x++){
			var item = $('<li />');
			var day = $('<h6 />').attr('class', 'day text-center');
			var hi = $('<span />').attr('class', 'hi');
			var low = $('<span />').attr('class', 'low');
			day.appendTo(item);
			hi.appendTo(item);
			low.appendTo(item);
			item.appendTo(container);
		}

		return container;
	};

	WeatherWidget.prototype.createErrorMsg = function(t){
		var instance = this;
		var type = t;
		var msg;
		
		switch (type) {
			case "ajax":
				msg = "An error occurred retrieving weather data";
				break;
			case "zipcode":
				msg = "You have entered an invalid zipcode";
				break;
			default:
				msg = "An error occurred";
		}	

		instance.container.addClass('error');
		instance.inner.html('<p>' + msg + '</p>');
			
	};

	//centers the widget on the page
	WeatherWidget.prototype.centerWidget = function(){
		var instance = this;

		instance.container.height(jQuery(window).height());
	};

	window.WeatherWidget = WeatherWidget;
}(window));
