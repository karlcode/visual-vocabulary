function drawLegend() {
	let seriesNames=[]
	const colourScale = d3.scaleOrdinal()
        .range(gChartcolour.lineWeb)
        .domain(seriesNames);
    let rem=10
    let alignment="horz"

	function legend(parent) {
		let legendyOffset=0

		let ledge=parent.append("g")
			.attr ("id",function(d,i){
                return "l"+i
            })
        ledge.append("text")
            .attr("id",(d,i)=> ("t"+i))
			.attr("x",rem+rem/2)
            .attr("y",rem/2)
            //.attr("class","subtitle")
            .text(function(d){
                return d;
            })
        ledge.append("line")
            .attr("stroke",(d)=>colourScale(d))
            .attr("x1",0)
            .attr("x2",rem)
            .attr("y1",rem/4)
            .attr("y2",rem/4)
            .attr("class","lines")

        ledge.attr("transform",function(d,i){
            if (alignment=='hori') {
                var gHeigt=parent.select("#l0").node().getBBox().height;
                if (i>0) {
                    var gWidth=d3.select("#l"+(i-1)).node().getBBox().width+rem; 
                }
                else {gWidth=0};
                legendyOffset=legendyOffset+gWidth;
                return "translate("+(legendyOffset)+","+(gHeigt/2)+")";  
            }
            else {
                return "translate(0,"+((i*rem))+")"};
    })
	}

	legend.seriesNames = (d)=>{
        seriesNames = d;
        return legend;
    }

    legend.colourPalette = (d) =>{
        if(d==='social' || d==='video'){
            colourScale.range(gChartcolour.lineSocial);
        } else if (d==='web') {
            colourScale.range(gChartcolour.lineWeb);
        } else if (d==='print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return legend;
    }

    legend.rem = (d)=>{
        rem = d;
        return legend;
    }

    legend.alignment = (d)=>{
        alignment = d;
        return legend;
    }


	return legend
}