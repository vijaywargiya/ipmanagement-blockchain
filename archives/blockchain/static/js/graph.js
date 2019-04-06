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
 *   Purpose: This file defines the SRC graph component
 */

//Graph implementations using Rickshaw graphs


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

SRC.Graph = function(args)
{
    /*validation*/
    if (!args.name) throw "SRC.Graph needs a reference to a name";
    if (!args.yaxisDataFunc) throw "SRC.Graph needs a refrence to data displayed over y axis";

    /*argument processing*/
    this.name = args.name;

    //Add all the required elements to the DOM
    var yaxis = document.createElement("div");
    yaxis.setAttribute("class", "rickshaw_yaxis");
    yaxis.setAttribute("id", args.name + "yaxis");

    var xaxis = document.createElement("div");
    xaxis.setAttribute("class", "rickshaw_xaxis");
    xaxis.setAttribute("id", args.name + "xaxis");

    var graphdiv = document.createElement("div");
    graphdiv.setAttribute("id", args.name + "graph");

    $("#" + args.name + " .chart_container").append(yaxis);
    $("#" + args.name + " .chart_container").append(graphdiv);
    $("#" + args.name + " .chart_container").append(xaxis);

    this.element = args.element || graphdiv;

    this.width = args.width || SRC.default.width;
    this.height = args.height || SRC.default.height;

    this.type = args.type || SRC.default.type;

    this.dataURL = args.dataURL || '/Dashboard/GetData' + capitalizeFirstLetter(args.name);
    this.dataURLArgs = args.dataURLArgs;
    this.dataURLArgsCheck = args.dataURLArgsCheck || false;

    this.xaxisDataFunc = args.xaxisDataFunc;
    this.xaxisLabel = args.xaxisLabel || 'Time';

    this.zaxisDataFunc = args.zaxisDataFunc;

    this.yaxisDataFunc = args.yaxisDataFunc;
    this.yaxisMin = args.yaxisMin;
    this.yaxisMax = args.yaxisMax;
    this.yaxisLabel = args.yaxisLabel || '';

    //default colors could be set of colors and can pick a random color for each of the new graph
    this.color = args.color || SRC.default.color;
    this.dotSize = args.dotSize || SRC.default.dotSize;

    this.hoverString = args.hoverString || args.name + " at";

    this.refreshFreq = args.refreshFreq;

    // user series
    this.seriesList = args.seriesList || [{yaxisDataFunc: this.yaxisDataFunc, color: this.color}];

    //http://doctrina.org/JavaScript:Why-Understanding-Scope-And-Closures-Matter.html
    var SRCGraphObj = this;

    var allSeries = []
    for(var i = 0; i < SRCGraphObj.seriesList.length; i++)
    {
        allSeries.push({ name: 'data' + i, color: SRCGraphObj.seriesList[i].color, data: [] });
    }
    /*create instance of the rickshaw graph*/
    var graphHandler = new Rickshaw.Graph.Ajax({
        element: this.element,
        width: this.width,
        height: this.height,
        min: this.yaxisMin,
        max: this.yaxisMax,
        renderer: this.type,
        interpolation: 'monotone',
        padding: { top: 0.1, left: 0.00, right: 0.00, bottom: 0.0 },
        dataURL: this.dataURL + ((this.dataURLArgs === undefined) ?"":  "?" + this.dataURLArgs()),
        onData: function (d) {
            var actual = []
            for(var i = 0; i < SRCGraphObj.seriesList.length; i++)
            {
                actual.push({ name: 'data' + i, color: SRCGraphObj.seriesList[i].color, data: [] });

                var count = 0;
                d.map(function (metric) {
                    //numRuns
                    actual[i].data[count] = {};
                    actual[i].data[count].x = (SRCGraphObj.xaxisDataFunc === undefined) ? d[count].time_sec : SRCGraphObj.xaxisDataFunc(d[count]);
                    actual[i].data[count].y = SRCGraphObj.seriesList[i].yaxisDataFunc(d[count]);
                    actual[i].data[count].z = (SRCGraphObj.zaxisDataFunc === undefined) ? 0 : SRCGraphObj.zaxisDataFunc(d[count]);
                    count++;
                });
                actual[i].data.sort(function (a, b) { return a.x - b.x });
            }
            return actual;
        },
        onComplete: function (transport) {
            var graph = transport.graph;
            var detail = new Rickshaw.Graph.HoverDetail({
                graph: graph,
                xFormatter: function (x) {
                    if (typeof moment != 'undefined')
                    {
                        return moment(x*1000).format("MMM Do YYYY, h:mm:ss a");
                    }
                    return new Date(x * 1000).toString();
                },
                formatter: function (series, x, y, formattedX, formattedY, point) {
                    if (SRCGraphObj.type === 'scatterplot')
                    {
                        return args.hoverString + point.value.z;
                    }
                    else
                    {
                        return y + " " + args.hoverString + " " + formattedX;
                    }
                }
            });

            //TODO: condition on time
            var timeUnit = false;
            if (SRCGraphObj.type === 'scatterplot')
            {
                var time = new Rickshaw.Fixtures.Time.Local();
                timeUnit = time.unit('15 minute');
            }
            var xAxis = new Rickshaw.Graph.Axis.Time({
                graph: graph,
                timeUnit : timeUnit,
                timeFixture: new Rickshaw.Fixtures.Time.Local(),
            });
            xAxis.render();
            var yAxis = new Rickshaw.Graph.Axis.Y({
                graph: graph,
            });
            yAxis.render();
            if (SRCGraphObj.type === 'scatterplot')
            {
                graph.renderer.dotSize = SRCGraphObj.dotSize;
            }
            d3.select("#" + SRCGraphObj.name + "yaxis").append("text")
            .attr("class", "rotate")
            .text(SRCGraphObj.yaxisLabel);

            d3.select("#" + SRCGraphObj.name + "xaxis").append("text")
             .text(SRCGraphObj.xaxisLabel);
        },
        series: allSeries
    });

    this.refreshData = function(){
        $.ajax({
            SRCDataURLArgs: ((typeof SRCGraphObj.dataURLArgs == 'undefined') ?"":  "?" + SRCGraphObj.dataURLArgs()),
            url: SRCGraphObj.dataURL + ((typeof SRCGraphObj.dataURLArgs == 'undefined') ?"":  "?" + SRCGraphObj.dataURLArgs()),
            dataType: 'json',
            success: function (data) {
                curDataURLArgs =  ((typeof SRCGraphObj.dataURLArgs == 'undefined') ?"":  "?" + SRCGraphObj.dataURLArgs());
                if((SRCGraphObj.dataURLArgsCheck == false) || (curDataURLArgs == this.SRCDataURLArgs))
                {
                    processedData = graphHandler.onData(data);
                    for(i = 0; i < SRCGraphObj.seriesList.length; i++)
                    {
                        graphHandler.graph.series[i].data = processedData[i].data;
                    }
                    graphHandler.graph.render();
                }
            }
        });
    }

    /*set refresh for the graph, fetch new data and render*/
    setInterval(this.refreshData, SRCGraphObj.refreshFreq);

    //return graphHandler;
}