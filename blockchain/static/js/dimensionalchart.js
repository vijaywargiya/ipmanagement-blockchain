/*!
 * --------------------------------------- START OF LICENSE NOTICE ------------------------------------------------------
 * Copyright (c) 2015 Software Robotics Corporation Limited ("Soroco"). All rights reserved.
 *
 * NO WARRANTY. THE PRODUCT IS PROVIDED BY SOROCO "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL SOROCO BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THE PRODUCT, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
 * DAMAGE.
 * ---------------------------------------- END OF LICENSE NOTICE -------------------------------------------------------
 *
 *   Primary Author: Nishant Jain <nishant@soroco.com>
 *
 *   Purpose: This file defines the SRC dimensional chart component
 */

//wrapper around dc.js

SRC.DimensionalChart = function(args)
{
    /*validation*/
    if (!args.dataURL && !args.data_handler) throw "SRC.DimensionalChart needs a data url or data handler";

    /*argument processing*/
    this.chartGroup = args.chartGroup || "";
    this.dataURL = args.dataURL;
    this.dataURLArgs = args.dataURLArgs;
    this.data_handler = args.data_handler;
    this.dataURLArgsCheck = args.dataURLArgsCheck || false;
    this.refreshFreq = args.refreshFreq;
    this.charts = args.charts;
    this.countdiv = args.countdiv;
    this.table = args.table;
    this.customCharts = args.customCharts;
    this.blockOnRefresh = args.blockOnRefresh || false;
    this.blockCustomDiv = args.blockCustomDiv;
    this.blockMessage = args.blockMessage || "";

    /*few defaults*/
    this.chartDefaults =  {
        width: 250,
        height: 200,
        colors: d3.scale.category10(),
        label: function (d) {
                    return d.key;
                },
        title: function (d) {
                    return d.key + ' / ' + d.value;
                },
        yAxisLabel: "",
        xAxisLabel: "",
    }

    var SRCDCObj = this;

    /*initialize all the charts, associate the charts with their html elements
      currently we support three types of charts */
    for (chart in this.charts)
    {
        if(this.charts[chart].type === 'rowChart')
        {
            this.charts[chart].obj = dc.rowChart('#' + this.charts[chart].div, this.chartGroup);
        }
        else if(this.charts[chart].type === 'barChart')
        {
            this.charts[chart].obj = dc.barChart('#' + this.charts[chart].div, this.chartGroup);
        }
        else if(this.charts[chart].type === 'lineChart')
        {
            this.charts[chart].obj = dc.lineChart('#' + this.charts[chart].div, this.chartGroup);
        }
        else if(this.charts[chart].type === 'bubbleChart')
        {
            this.charts[chart].obj = dc.bubbleChart('#' + this.charts[chart].div, this.chartGroup);
        }
        else if(this.charts[chart].type === 'pieChart')
        {
            this.charts[chart].obj = dc.pieChart('#' + this.charts[chart].div, this.chartGroup);
        }
        else if(this.charts[chart].type === 'compositeChart')
        {
            this.charts[chart].obj = dc.compositeChart('#' + this.charts[chart].div, this.chartGroup);
        }
        else if(this.charts[chart].type === 'dataTable')
        {
            this.charts[chart].obj = dc.dataTable('#' + this.charts[chart].div, this.chartGroup)
        }
    }

    // we'll need to display month names rather than 0-based index values
    var monthNames = [
			"January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"
    ];

    // we'll need to display day names rather than 0-based index values
    var dayNames = [
			"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];

    // dimensions code
    this.datadim = crossfilter()

    var get_filtered_group_all_func = function(index){return function(){ return SRCDCObj.charts[index].orgGroup.all().filter(SRCDCObj.charts[index].filterGroup)};}
    var get_custom_group_all_func = function(index){return function(){ return SRCDCObj.charts[index].customGroup(index, SRCDCObj.charts[index].orgGroup);};}

    for (var chart in this.charts)
    {
        this.charts[chart].dimension = this.datadim.dimension(this.charts[chart].dimensionfunc);
        this.charts[chart].group = this.charts[chart].dimension.group().reduce(this.charts[chart].reduceIncrement, this.charts[chart].reduceDecrement, this.charts[chart].reduceInitial);
        if(typeof this.charts[chart].filterGroup != 'undefined')
        {
            this.charts[chart].orgGroup = this.charts[chart].group;
            this.charts[chart].group = Object.assign({}, this.charts[chart].orgGroup);
            this.charts[chart].group.all = get_filtered_group_all_func(chart);
        }
        if(typeof this.charts[chart].customGroup != 'undefined')
        {
            this.charts[chart].orgGroup = this.charts[chart].group;
            this.charts[chart].group = Object.assign({}, this.charts[chart].orgGroup);
            this.charts[chart].group.all = get_custom_group_all_func(chart);
        }
    }

    // chart configurations
    for (var chart in this.charts)
    {
        //common configuration
        obj = this.charts[chart].obj
        obj
            .width(this.charts[chart].width || this.chartDefaults.width)
            .height(this.charts[chart].height || this.chartDefaults.height)

        if(this.charts[chart].type === 'rowChart')
        {

            obj
                .dimension(this.charts[chart].dimension)
                .group(this.charts[chart].group)
                .colors(this.charts[chart].colors || this.chartDefaults.colors)
                .label(this.charts[chart].label || this.chartDefaults.label)
                .title(this.charts[chart].title || this.chartDefaults.title)
                .elasticX(true)
                .xAxis().ticks(4);
                if(typeof this.charts[chart].ordering != 'undefined')
                {
                    obj.ordering(this.charts[chart].ordering);
                }
                obj.cap(this.charts[chart].cap || Infinity);
                if(typeof this.charts[chart].excludeOthers != undefined && this.charts[chart].excludeOthers == true)
                {
                    obj.othersGrouper(function(topRows){ return topRows;});
                }
                if(typeof this.charts[chart].valueAccessor != 'undefined')
                {
                    obj.valueAccessor(this.charts[chart].valueAccessor);
                }
                if(typeof this.charts[chart].title != 'undefined')
                {
                    obj.title(this.charts[chart].title);

                }
                if(typeof this.charts[chart].groupOrder != 'undefined')
                {
                    this.charts[chart].group.order(this.charts[chart].groupOrder);
                }

        }
        else if(this.charts[chart].type === 'barChart')
        {
            obj
                .dimension(this.charts[chart].dimension)
                .group(this.charts[chart].group)
                .colors(this.charts[chart].colors || this.chartDefaults.colors)
                .label(this.charts[chart].label || this.chartDefaults.label)
                .title(this.charts[chart].title || this.chartDefaults.title)
                .x(d3.scale.ordinal())
                .xUnits(dc.units.ordinal)
                .elasticY(true)
                .yAxisLabel(this.charts[chart].yAxisLabel || this.chartDefaults.yAxisLabel)
                .xAxisLabel(this.charts[chart].xAxisLabel || this.chartDefaults.xAxisLabel);

        }
        else if(this.charts[chart].type === 'lineChart')
        {
            obj
                .margins({
                    top: 20,
                    right: 0,
                    bottom: 40,
                    left: 40
                })
                .dimension(this.charts[chart].dimension)
                .group(this.charts[chart].group)
                .elasticY(true)
                .elasticX(true)
                .x(this.charts[chart].xScale || d3.time.scale().domain([new Date(2010, 1, 1), new Date(2020, 12, 31)]))
                .xUnits(this.charts[chart].xUnits || d3.time.week)
                .valueAccessor(this.charts[chart].valueAccessor)
                .yAxisLabel(this.charts[chart].yAxisLabel || this.chartDefaults.yAxisLabel)
                .xAxisLabel(this.charts[chart].xAxisLabel || this.chartDefaults.xAxisLabel)
                .xAxis().ticks(4);

                if(typeof this.charts[chart].tickFormat != 'undefined')
                {
                    obj.xAxis().tickFormat(this.charts[chart].tickFormat);
                }
                if(typeof this.charts[chart].brushOn != 'undefined')
                {
                    obj.brushOn(this.charts[chart].brushOn);
                }
        }
        else if(this.charts[chart].type === 'bubbleChart')
        {
            obj
                .margins({
                    top: 20,
                    right: 0,
                    bottom: 40,
                    left: 40
                })
                .dimension(this.charts[chart].dimension)
                .group(this.charts[chart].group)
                .transitionDuration(750)
                .colors(this.charts[chart].colors || this.chartDefaults.colors)
                .colorAccessor(function (d) { return d.key; })
                .x(d3.scale.linear().domain([0, 0]))
		        .y(d3.scale.linear().domain([0, 0]))
		        .r(d3.scale.linear().domain([0, 5]))
		        .keyAccessor(this.charts[chart].keyAccessor)
		        .valueAccessor(this.charts[chart].valueAccessor)
		        .radiusValueAccessor(this.charts[chart].radiusValueAccessor || function (p) {return 0.5;})
		        .elasticY(true)
                .elasticX(true)
		        .yAxisPadding(100)
                .xAxisPadding(150)
                .yAxisLabel(this.charts[chart].yAxisLabel || this.chartDefaults.yAxisLabel)
                .xAxisLabel(this.charts[chart].xAxisLabel || this.chartDefaults.xAxisLabel)
                .label(this.charts[chart].label || this.chartDefaults.label)
                .title(this.charts[chart].title || this.chartDefaults.title)
                .label(function (p) {
                    return p.key;
                })
                .renderTitle(true)
                .renderLabel(true)
                obj.yAxisMin = this.charts[chart].yAxisMin;
                obj.xAxisMin = this.charts[chart].xAxisMin;
                obj.xAxisMax = this.charts[chart].xAxisMax;
                obj.yAxisMax = this.charts[chart].yAxisMax;
                if(typeof this.charts[chart].xTickFormat != 'undefined')
                {
                    obj.xAxis().tickFormat(this.charts[chart].xTickFormat);
                }
                if(typeof this.charts[chart].yTickFormat != 'undefined')
                {
                    obj.yAxis().tickFormat(this.charts[chart].yTickFormat);
                }
                if(typeof this.charts[chart].xTicks != 'undefined')
                {
                    obj.xAxis().ticks(this.charts[chart].xTicks)
                }
                if(typeof this.charts[chart].yTicks != 'undefined')
                {
                    obj.yAxis().ticks(this.charts[chart].yTicks)
                }
        }
        else if (this.charts[chart].type === 'pieChart')
        {
            obj
                .innerRadius(this.charts[chart].innerRadius || 50)
                .dimension(this.charts[chart].dimension)
                .group(this.charts[chart].group)
            if(typeof this.charts[chart].legend != 'undefined')
            {
                obj.legend(dc.legend().x(this.charts[chart].legend.x || 0).y(this.charts[chart].legend.y || 0)
                .gap(this.charts[chart].legend.gap || 5).horizontal(this.charts[chart].legend.horizontal || false))
            }
            if(typeof this.charts[chart].label != 'undefined')
            {
                obj.label(this.charts[chart].label)
            }
            //support for the capping number of pies
            obj.cap(this.charts[chart].cap || Infinity);
            if(typeof this.charts[chart].excludeOthers != undefined && this.charts[chart].excludeOthers == true)
            {
                obj.othersGrouper(function(topRows){ return topRows;});
            }
            // support for changing the center of the piechart
            if(typeof this.charts[chart].cx != 'undefined')
            {
                obj.cx(this.charts[chart].cx)
            }
            if(typeof this.charts[chart].cy != 'undefined')
            {
                obj.cy(this.charts[chart].cy)
            }
            if(typeof this.charts[chart].externalLabels != 'undefined')
            {
                obj.externalLabels(this.charts[chart].externalLabels)
            }
            if(typeof this.charts[chart].externalRadiusPadding != 'undefined')
            {
                obj.externalRadiusPadding(this.charts[chart].externalRadiusPadding)
            }
        }
        else if (this.charts[chart].type === 'compositeChart')
        {
            obj
                .margins({
                    top: 20,
                    right: 0,
                    bottom: 40,
                    left: 40
                })
                .dimension(this.charts[chart].dimension)
                .title(this.charts[chart].title || this.chartDefaults.title)
                .elasticX(true)
                .brushOn(false)
                .x(d3.time.scale().domain([new Date(2010, 1, 1), new Date(2020, 12, 31)]))
                .xUnits(d3.time.week)
                .yAxisLabel(this.charts[chart].yAxisLabel || this.chartDefaults.yAxisLabel)
                .xAxisLabel(this.charts[chart].xAxisLabel || this.chartDefaults.xAxisLabel)
                .xAxis().ticks(this.charts[chart].xAxisTicks || 4);
                if(typeof this.charts[chart].yMin != 'undefined' && typeof this.charts[chart].yMax != 'undefined') {
                    obj
                        .elasticY(false)
                        .y(d3.scale.linear().domain([this.charts[chart].yMin, this.charts[chart].yMax]))
                }
                else {
                    obj.elasticY(true)
                }

                if(typeof this.charts[chart].legend != 'undefined')
                {
                    obj.legend(dc.legend().x(this.charts[chart].legend.x || 100).y(this.charts[chart].legend.y || 0).itemHeight(this.charts[chart].legend.itemHeight || 10)
                    .gap(this.charts[chart].legend.gap || 5).horizontal(this.charts[chart].legend.horizontal || false))
                }

            composeCharts = [];
            //Compose all the graphs
            for(index in this.charts[chart].composeCharts)
            {
                chartGroup = this.charts[chart].dimension.group().reduce(this.charts[chart].composeCharts[index].reduceIncrement, this.charts[chart].composeCharts[index].reduceDecrement, this.charts[chart].composeCharts[index].reduceInitial);
                chartLegend = this.charts[chart].composeCharts[index].legend || "Unknown";
                chartColor = this.charts[chart].composeCharts[index].color ||  'blue'
                childChart = dc.lineChart(obj, this.chartGroup)
                        .dimension(this.charts[chart].dimension)
                        .group(chartGroup, chartLegend)
                        .valueAccessor(this.charts[chart].composeCharts[index].valueAccessor)
                        .colors(chartColor);

                composeCharts.push(childChart);
            }
            obj.compose(composeCharts);
        }
        else if(this.charts[chart].type === 'dataTable')
        {
            obj
                .dimension(this.charts[chart].group)
                .group(this.charts[chart].groupKey)
                .columns(this.charts[chart].columns)

            if(typeof this.charts[chart].size != 'undefined')
            {
                obj.size(this.charts[chart].size)
            }
            if(typeof this.charts[chart].sortBy != 'undefined')
            {
                obj.sortBy(this.charts[chart].sortBy)
                obj.order(this.charts[chart].order)
            }
        }
    }

    this.normalizeData = function (dataList) {
        // normalise the data
        dataList.forEach(function (data) {
            //date manipulation ... expects a standard data format, make it a custom attribute that may be passed along
            if("date" in data)
            {
                data.dateAsString = data.date;
                var dateParts = data.date.split(" ")[0].split("-");
                var timeParts = data.date.split(" ")[1].split(":");
                data.datefull = (new Date(Date.UTC(dateParts[0], (dateParts[1] - 1), dateParts[2], timeParts[0], timeParts[1], timeParts[2]))).toLocaleString();
                data.date = new Date(dateParts[0], (dateParts[1] - 1), dateParts[2]);
                data.date_with_time = new Date(dateParts[0], (dateParts[1] - 1), dateParts[2], timeParts[0], timeParts[1], timeParts[2]);
                data.year = data.date.getFullYear();
                // prepend each name with its position to aid sorting in the bar charts below
                data.monthName = data.date.getMonth() + '.' + monthNames[data.date.getMonth()];
                data.dayName = data.date.getDay() + '.' + dayNames[data.date.getDay()];
            }
						
			
        });
    };

    this.refreshCustomVisualizations = function()
    {
        if(typeof SRCDCObj.table != 'undefined')
        {
            SRCDCObj.table.RefreshTable();
        }
        if(typeof SRCDCObj.customCharts != 'undefined')
        {
            for(index in SRCDCObj.customCharts)
            {
                SRCDCObj.customCharts[index].refreshChart();
            }
        }
    }

    for (var i = 0; i < dc.chartRegistry.list(this.chartGroup).length; i++) {
            var chartI = dc.chartRegistry.list(this.chartGroup)[i];
            chartI.on("filtered", SRCDCObj.refreshCustomVisualizations);
    }

    if(typeof this.table != 'undefined')
    {
        var datatable = $('#'+this.table.div).dataTable({
            order: this.table.order || [],
            columnDefs: this.table.columnDefs,
            dom: 'lfBrtip',
            buttons: this.table.buttons || [],
        });

        this.table.dimension = this.datadim.dimension(this.table.dimensionfunc);
        if (typeof this.table.reduceIncrement !='undefined')
        {
            this.table.group = this.table.dimension.group().reduce(this.table.reduceIncrement, this.table.reduceDecrement, this.table.reduceInitial);
        }
        var dcTable = this;

        function RefreshTable() {

            dc.events.trigger(function () {
                if (typeof SRCDCObj.table.reduceIncrement !='undefined')
                {
                    //Use group if reduce functions are defined, use dimension otherwise to get directly the rows
                    datatable.api()
                      .clear()
                      .rows.add(SRCDCObj.table.group.all())
                      .draw();
                }
                else
                {
                    datatable.api()
                    .clear()
                    .rows.add(SRCDCObj.table.dimension.top(Infinity))
                    .draw();
                }
            });
        }

        /*
        for (var i = 0; i < dc.chartRegistry.list(this.chartGroup).length; i++) {
            var chartI = dc.chartRegistry.list(this.chartGroup)[i];
            chartI.on("filtered", RefreshTable);
        }
        */

        SRCDCObj.table.RefreshTable = RefreshTable;
        RefreshTable();

        //filter all charts when using the datatables search box
         $('#'+this.table.div+"_filter").find(":input").on('keyup',function(){
            text_filter(dcTable.table.dimension, this.value);

            function text_filter(dim,q){
                 if (q!='') {
                    dim.filter(function(d){
                        return d.indexOf(q.toLowerCase()) !== -1;
                    });
                } else {
                    dim.filterAll();
                    }
                RefreshTable();
                if(typeof SRCDCObj.customCharts != 'undefined')
                {
                    for(index in SRCDCObj.customCharts)
                    {
                        SRCDCObj.customCharts[index].refreshChart();
                    }
                }
                dc.redrawAll(SRCDCObj.chartGroup);}
        });
    }

    if(typeof this.customCharts != 'undefined')
    {
        for(customChart in this.customCharts)
        {
            this.customCharts[customChart].dimension = this.datadim.dimension(this.customCharts[customChart].dimensionfunc);

            this.customCharts[customChart].refreshFunc = this.customCharts[customChart].refreshFunc || function(v){};
            function refreshChart(){
                dc.events.trigger(function () {
                    SRCDCObj.customCharts[customChart].refreshFunc(SRCDCObj.customCharts[customChart].dimension.top(Infinity));
                });
            }

            /*
            for (var i = 0; i < dc.chartRegistry.list(this.chartGroup).length; i++) {
                var chartI = dc.chartRegistry.list(this.chartGroup)[i];
                chartI.on("filtered", refreshChart);
            }
            */

            SRCDCObj.customCharts[customChart].refreshChart = refreshChart;
            refreshChart();

            this.customCharts[customChart].filterFunc = this.customCharts[customChart].filterFunc || function(d, v){ return d==v;}
            this.customCharts[customChart].applyFilter = function(value){
                chart_filter(SRCDCObj.customCharts[customChart].dimension, value);


                function chart_filter(dim,q){
                     if (q!='') {
                        dim.filter(function(d){return SRCDCObj.customCharts[customChart].filterFunc(d, q)});
                    } else {
                        dim.filterAll();
                    }

                    if(typeof SRCDCObj.table != 'undefined')
                    {
                        SRCDCObj.table.RefreshTable();
                    }
                    if(typeof SRCDCObj.customCharts != 'undefined')
                    {
                        for(index in SRCDCObj.customCharts)
                        {
                            SRCDCObj.customCharts[index].refreshChart();
                        }
                    }
                    dc.redrawAll(SRCDCObj.chartGroup);}
            }

        }
    }

    //create a counter and bind it to the named element
    if(typeof this.countdiv != 'undefined')
    {
         var all = datadim.groupAll();
         dc.dataCount("#info-data-count", this.chartGroup)
            .dimension(datadim)
            .group(all);
    }



    dc.renderAll(this.chartGroup);

    //hacks for rendering the axis for rowchart
    function AddXAxis(chartToUpdate, displayText)
    {
        chartToUpdate.svg()
                    .append("text")
                    .attr("class", "x-axis-label")
                    .attr("text-anchor", "middle")
                    .attr("x", chartToUpdate.width()/2)
                    .attr("y", chartToUpdate.height())
                    .text(displayText);
    }

    function AddYAxis(chartToUpdate, displayText)
    {
        chartToUpdate.svg()
                    .append("text")
                    .attr("class", "y-axis-label rotate")
                    .attr("text-anchor", "middle")
                    .attr("x", -chartToUpdate.height()/2)
                    .attr("y", 20)
                    .text(displayText);
    }

    for (var chart in this.charts)
    {
        //common configuration
        obj = this.charts[chart].obj

        if(this.charts[chart].type === 'rowChart')
        {
            AddXAxis(obj, (this.charts[chart].xAxisLabel || this.chartDefaults.xAxisLabel));
            AddYAxis(obj, (this.charts[chart].yAxisLabel || this.chartDefaults.yAxisLabel));
        }
    }

    // Unfilters all the given dimensions, removes all data
    // from xf and adds newData to xf.
    this.xfilter_reset = function (xf, dimensions, newData) {
        var i;
        for (i = 0; i < this.charts.length; i++) {
            // Clear all filters from this dimension.
            // Necessary because xf.remove only removes records
            // matching the current filter.
            this.charts[i].dimension.filter(null);
        }
        xf.remove(); // Remove all data from the crossfilter
        xf.add(newData);
        return xf;
    }


    /*Resets the global crossfilter object and reapplies all
      current dc.js chart filters. */
    this.refresh_data = function(data){
        var i, j,
            chart, oldFilters,
            allCharts = dc.chartRegistry.list(this.chartGroup);

        _xfilter = this.xfilter_reset(this.datadim, this.charts, data);

        // Reset all filters using dc.js
        for (i = 0; i < allCharts.length; i++) {
            chart = allCharts[i];
            oldFilters = chart.filters(); // Get current filters
            chart.filter(null); // Reset all filters on current chart
            for (j = 0; j < oldFilters.length; j++) {
                // Set all the oldFilters back onto the chart
                chart.filter(oldFilters[j]);
            }
        }
        dc.redrawAll(this.chartGroup);
    }

    this.blockAll = function(){
            if(this.blockOnRefresh == false)
            {
                return;
            }
            if(typeof this.blockCustomDiv !='undefined')
            {
                $('#' + this.blockCustomDiv).block({ message: this.blockMessage });
            }
            else
            {
                for (var chart in this.charts)
                {
                    $('#' + this.charts[chart].div).block({ message: this.blockMessage });
                }

                if(typeof this.table != 'undefined')
                {
                    $('#' + this.table.div).block({ message: this.blockMessage });
                }
            }

    }

    this.unBlockAll = function(){
            if(this.blockOnRefresh == false)
            {
                return;
            }
            if(typeof this.blockCustomDiv !='undefined')
            {
               $('#' + this.blockCustomDiv).unblock();
            }
            else
            {
                for (var chart in this.charts)
                {
                    $('#' + this.charts[chart].div).unblock();
                }
                if(typeof this.table != 'undefined')
                {
                    $('#' + this.table.div).unblock();
                }
            }
    }

    /*get the data and update the graphs*/
    this.refreshData = function(){
        // If dataURL is present then make ajax call to get data else use the data passed with the SRC object.
        if(typeof SRCDCObj.dataURL != 'undefined') {
            $.ajax({
                SRCDataURLArgs: ((typeof SRCDCObj.dataURLArgs == 'undefined') ?"":  "?" + SRCDCObj.dataURLArgs()),
                url: SRCDCObj.dataURL + ((typeof SRCDCObj.dataURLArgs == 'undefined') ?"":  "?" + SRCDCObj.dataURLArgs()),
                dataType: 'json',
                beforeSend: function(){
                    SRCDCObj.blockAll();
                },
                success: function (data) {
                    curDataURLArgs = ((typeof SRCDCObj.dataURLArgs == 'undefined') ?"":  "?" + SRCDCObj.dataURLArgs());
                    if((SRCDCObj.dataURLArgsCheck == false) || (curDataURLArgs == this.SRCDataURLArgs))
                    {
                        SRCDCObj.normalizeData(data);
                        SRCDCObj.refresh_data(data);
                    }
                },
                complete: function(){
                    SRCDCObj.unBlockAll();
                }
            });
        }
        else {
            data = SRCDCObj.data_handler();
            SRCDCObj.normalizeData(data);
            SRCDCObj.refresh_data(data);
        }
    }

    /*update this the first time*/
    this.refreshData();

    /*setup the refresh of the graph*/
    setInterval(function () {
        SRCDCObj.refreshData();
    }, SRCDCObj.refreshFreq);

    /*reset all charts to the default values if needed.*/
    this.reset = function(){
        for (var chart in this.charts)
        {
            chart.obj.filterAll(this.chartGroup);
        }
        dc.redrawAll(this.chartGroup);
    };

}
