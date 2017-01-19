
function bumpChart(data,stylename,media,plotpadding,legAlign,yAlign, yMin, yMax, numbers,rects){

    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height;

    // return the series names from the first row of the spreadsheet
    var seriesNames = Object.keys(data[0]).filter(function(d){ return d!="pos" ; });
    //Select the plot space in the frame from which to take measurements
    var frame=d3.select("#"+media+"chart")
    var plot=d3.select("#"+media+"plot")

    var yOffset=d3.select("#"+media+"Subtitle").style("font-size");
    yOffset=Number(yOffset.replace(/[^\d.-]/g, ''));
    
    //Get the width,height and the marginins unique to this chart
    var w=plot.node().getBBox().width;
    var h=plot.node().getBBox().height;
    var margin=plotpadding.filter(function(d){
        return (d.name === media);
      });
    margin=margin[0].margin[0]
    var colours=stylename.linecolours;
    var plotWidth = w-(margin.left+margin.right);
    var plotHeight = h-(margin.top+margin.bottom);
    
    yMin=Math.min(yMin,d3.min(data, function(d) { return +d.pos;}))
    yMax=Math.max(yMax,d3.max(data, function(d) { return +d.pos;}))
    console.log(data)

    let plotData=seriesNames.map(function(d,i){
        return {
            group:d,
            index:i+1,
            rankings:getGroups(d,i)
        }
    })
    let drawData=

    function getGroups(group,index) {
        //console.log(group,index)
        let rankings=[]
        data.forEach(function(el,i){
            let column=new Object();
            column.pos= +el.pos
            column.group=group
            column.prevGroup=seriesNames[index-1]
            column.nextGroup=seriesNames[index+1]
            column.item=el[group]
            column.prev=relPositions("prev",el[group], index-1)
            column.next=relPositions("next",el[group], index+1)
            column.status=column.prev-column.pos
        rankings.push(column)   
        });
        return rankings
    }

    //finds the items previous ranking
    function relPositions(trace,item,i) {
        //console.log(trace,item,seriesNames[i])
        let lookup = seriesNames[i]
        const prev = data.find(function(d){
                return d[lookup]==item;
        });
        //checks to see if undefined Nan etc
        if(!prev) return prev;
        return +prev.pos;
    }

    console.log("plotData", plotData);

    console.log("Build links")
        let terminus=[]
        let items=[]
        plotData.forEach(function(d){
            let start=d.rankings.filter(function (el){
                items.push(el.item)
                return (el.prev==undefined)
            })
            terminus.push.apply(terminus, start);

        })
        terminus=terminus.filter(function(d){
            return (d.next!=undefined)
        })

    let paths=terminus.map(function(d) {
        return {
            item: d.item,
            indexStart: seriesNames.indexOf(d.group),
            indexEnd: endindex(d.item,seriesNames.indexOf(d.group)+1),
            pathData: getPaths(d.item,seriesNames.indexOf(d.group),endindex(d.item,seriesNames.indexOf(d.group))+1)
        }
    })
    console.log("paths",paths)

    function getPaths(item, indexStart,indexEnd) {
        //console.log(item,indexStart,indexEnd)
        let plotArray=[]
        for (var i = indexStart; i < indexEnd; i++) {
            //console.log("seriesNames",seriesNames[i])
            //console.log("plotData",plotData[i])
            let points=plotData[i].rankings.filter(function(d){
                return(d.item==item)
            })
            plotArray.push.apply(plotArray, points);
        }
        return (plotArray)
    }

    function endindex(item, start) {
        var end=0
        for (var i = start; i < plotData.length; i++) {
            let lookup = plotData[i]
            lookup.rankings.forEach(function(el){
                if(el.item==item && el.next==undefined) {
                    end=i
                }
            })
        }
        return end

    }


    var yScale = d3.scale.ordinal()
    .rangeBands([0, plotHeight],.2)
    .domain(data.map(function(d) { return d.pos      ;}));

    var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .tickSize(0);
    
    var yLabel=plot.append("g")
    .attr("id", media+"yAxis")
    .attr("class", media+"yAxis")
    .call(yAxis)

    var yLabelOffset=yLabel.node().getBBox().width

    yLabel
        .attr("transform",function(){
            return "translate("+(yLabelOffset+margin.left)+","+margin.top+")"
            })

    var xScale = d3.scale.ordinal()
    .rangeBands([0, plotWidth-yLabelOffset],.4)
    .domain(seriesNames.map(function(d) { return d;}));

    var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("top")
    .tickSize(0);

    var xLabels=plot.append("g")
      .attr("class", media+"xAxis")
      .attr("transform",function(){
                return "translate("+(margin.left+yLabelOffset)+","+(margin.top)+")"
            })
      .call(xAxis);

    plot.selectAll("."+media+"bar")
    .data(plotData)
    .enter()
        .append("g")
        .attr("id",function(d) { return d.group; })
        .attr("class", media+"category")
        .call(function(parent){
            
        // parent.selectAll('text')
        //     .data(function(d){
        //             return d.rankings
        //         })
        //     .enter()
        //     .append("text")
        //     .attr("class", media+"subtitle")
        //     .style("text-anchor",function(d){
        //         if (d.group==seriesNames[0]) {
        //             return "start"
        //         }
        //         else {return "middle"}
        //     })
        //     .attr("y", function(d){return yScale(d.pos)+(yScale.rangeBand()*.6)})
        //     .attr("x", function(d){
        //         if(d.group==seriesNames[0]) {
        //             return xScale(d.group)+(xScale.rangeBand()/8)
        //         }
        //         else {return xScale(d.group)+(xScale.rangeBand()/2)}
        //         })
        //     .text(function(d){
        //         if(d.status>=0 && d.status<=0) {}
        //         else {return d.item}
        //     })
        //     .attr("transform",function(){
        //         return "translate("+(margin.left+yLabelOffset)+","+(margin.top)+")"
        //     })


            function highlightBar(barName) {
                let selected=d3.selectAll("#"+barName)
                var elClass = selected[0];
                var el=d3.select(elClass[0])
                if (el.attr("class")==media+"fill") {
                        selected.attr("class",media+"highlight")
                    }
                else {selected.attr("class",media+"fill")}
                highlightlink(barName)
            }

            function highlightlink(linkName) {
                console.log("link",linkName)
                let selected=d3.selectAll("#link"+linkName)
                var elClass = selected[0];
                var el=d3.select(elClass[0])
                if (el.attr("class")==media+"link") {
                        selected.attr("class",media+"linkhighlight")
                    }
                else {selected.attr("class",media+"link")}
            }
    })

    //create a line function that can convert data[] into x and y points
    var lineData= d3.svg.line()
        .x(function(d,i) { 
            return xScale(d.group)-(xScale.rangeBand()/2); 
        })
        .y(function(d) { 
            return yScale(d.pos); 
        })
        .interpolate("linear")

    plot.selectAll("."+media+"link")
        .data(paths)
        .enter()
        .append("g")
        .attr("id",function(d) { return d.item; })
        .attr("transform",function(){
                    return "translate("+(margin.left+yLabelOffset)+","+(margin.top)+")"
                })
        .attr("class",media+"link")
        .call(function(parent){

            parent.selectAll('path')
                    .data(function(d){
                        return [d.pathData]
                    })
                    .enter()
                    .append("path")

            .attr("stroke-width",3)
            .attr('d', function(d){
                return lineData(d);
            })
            .attr("transform",function(){
                return "translate("+(margin.left+yLabelOffset)+","+(margin.top)+")"
            });

        })

        

}