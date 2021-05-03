
// SVG wrapper dimensions are determined by the current width
// and height of the browser window.
var svgWidth = 1200;
var svgHeight = 760;

var margin = {
  top: 20,
  right: 50,
  bottom: 95,
  left: 100
};

var height = svgHeight - margin.top - margin.bottom;
var width = svgWidth - margin.left - margin.right;


// Create an SVG wrapper that will append a svg group tp hold the chart
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Appending the svg group
  var chartGroup = svg.append("g")
    .attr("transform",  `translate(${margin.left}, ${margin.top})`);

// Intalize Params
var chosenXAxis = "poverty";



// xScale Function: function used to update x-scale variable upon clicking on x axis label
function xScale(data, chosenXAxis){
    // Create Scale
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d=> d[chosenXAxis]) * 0.8,
            d3.max(data, d => d[chosenXAxis]) * 1.2])
        .range([0,width]);

    return xLinearScale;
}


var chosenYAxis = "healthcare";
// yScale Function: function used to update y-scale variable upon clicking on y axis label

function yScale(data,chosenYAxis){
    // Create Scale
    var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d=> d[chosenYAxis]) * 0.8,
        d3.max(data, d => d[chosenYAxis]) * 1])
    .range([height,0]);

    return yLinearScale;
}

// renderXAxis Function: function used to update x axis upon clicking on x axis label

function renderXAxis(newXScale, xAxis){
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// renderYAxis Function: function used to updat4e y axis upon clicking on y axis label

function renderYAxis(newYScale, yAxis){
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// renderCircles Function: function used to updating circles group (markers) with a transition to new circles

function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis){
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    
    return circlesGroup;
}

// updateToolTip Function: function used for updating circles group with new tooltip

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup){

    // initialize x and y variables used to check conditionals
    var xlabel;
    var ylabel;

    if(chosenXAxis == "poverty"){
        xlabel = "In Poverty (%)";
    } else if(chosenXAxis == "age"){
        xlabel = "Age (Median)";
    } else {
        xlabel = "Household Income (Median)";
    }
    
    if(chosenYAxis == "healthcare"){
        ylabel = "Lacks Healthcare (%)";
    } else if (chosenYAxis == "smokes"){
        ylabel = "Smokes (%)";
    } else {
        ylabel = "Obese (%)";
    }
    
    var toolTip = d3.tip()
        .attr("class","d3-tip")
        .offset([100,-60])
        .html(function(d) {
            return(`${d.state}<br>${xlabel}: ${d[chosenXAxis]}<br>${ylabel}: ${d[chosenYAxis]}`);
        });
    
    circlesGroup.call(toolTip);
    
    // mouseover event
    circlesGroup.on("mouseover",function(data){
        toolTip.show(data,this);
        d3.select(this)
            .style("stroke","black")
            .style("opacity",1)
    });
    // mouseout event
    circlesGroup.on("mouseout", function(data,index){
        toolTip.hide(data);
        d3.select(this)
            .style("stroke","none");
    });

    return circlesGroup;
}

// updateCirclesFunction: function to update the state abbr text used for the circles markers
function updateStates(stateAbbr,xLinearScale,yLinearScale,chosenXAxis,chosenYAxis){
    stateAbbr.transition()
    .duration(1000)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]));

    return stateAbbr;
}

// Retrieve data from data.csv and execute everything
  d3.csv("Assets/data/data.csv").then(function(censusData, err){
    // In the case of an error
    if (err) throw err;

    // parse data to confirm data is read in as num type
    censusData.forEach(function(data){
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
    });

    // create xLinearScale 
    var xLinearScale  = xScale(censusData, chosenXAxis);

    // create yLinearScale
    var yLinearScale = yScale(censusData, chosenYAxis);

    // create initial axes functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .attr("transform",`translate(0,${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d=> xLinearScale(d[chosenXAxis]))
        .attr("cy", d=> yLinearScale(d[chosenYAxis]))
        .attr("r",20)
        // .attr("fill","#87CEFA")
        // .attr("opacity",".5")
        .classed('stateCircle',true);

    // create state abbreviation used for markers
    var stateAbbr = chartGroup.selectAll("text")
        .exit()
        .data(censusData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .text(d => d.abbr)
        .attr("font-size","12px")
        .classed("stateText",true)

    // x axis tick labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform",`translate(${width/2}, ${height + 20})`);

    // x axis labels
    var povertyLabel = xlabelsGroup.append("text")
        .attr("x",0)
        .attr("y",20)
        .attr("value","poverty")
        .classed("active",true)
        .text("In Poverty (%)");
        
    var ageLabel = xlabelsGroup.append("text")
        .attr("x",0)
        .attr("y",40)
        .attr("value","age")
        .classed("inactive",true)
        .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
        .attr("x",0)
        .attr("y",60)
        .attr("value","income")
        .classed("inactive",true)
        .text("Household Income (Median)");

    // y axis tick labels
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${10}, ${height/2})`);

    // y axis labels
    var healthcareLabel = ylabelsGroup.append("text")
        .attr("transform","rotate(-90)")
        .attr("y",0 - margin.left-45)
        .attr("x",-65)
        .attr("dy","3em")
        .attr("value","healthcare")
        .classed("active",true)
        .text("Lacks Healthcare (%)");

        var smokesLabel = ylabelsGroup.append("text")
        .attr("transform","rotate(-90)")
        .attr("y",0 - margin.left-5)
        .attr("x",-65)
        .attr("dy","3em")
        .attr("value","smokes")
        .classed("inactive",true)
        .text("Smokes (%)");

        var obeseLabel = ylabelsGroup.append("text")
        .attr("transform","rotate(-90)")
        .attr("y",0-margin.left-25)
        .attr("x",-65)
        .attr("dy","3em")
        .attr("value","obesity")
        .classed("inactive",true)
        .text("Obese (%)");
    
    // use functions to update the circlesGroup markers
    var circlesGroup = renderCircles(circlesGroup,xLinearScale,yLinearScale,chosenXAxis, chosenYAxis);
    var stateAbbr = updateStates(stateAbbr,xLinearScale,yLinearScale,chosenXAxis, chosenYAxis);
    var circlesGroup = updateToolTip(chosenXAxis,chosenYAxis,circlesGroup,stateAbbr);


    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function(){

            var value = d3.select(this).attr("value");

            if(value !== chosenXAxis){
                chosenXAxis = value; 

                // functions used to update aspects to the x axis
                xLinearScale = xScale(censusData,chosenXAxis);
                xAxis = renderXAxis(xLinearScale, xAxis);
                circlesGroup = renderCircles(circlesGroup,xLinearScale,yLinearScale,chosenXAxis, chosenYAxis);
                stateAbbr = updateStates(stateAbbr,xLinearScale,yLinearScale,chosenXAxis, chosenYAxis);
                circlesGroup = updateToolTip(chosenXAxis,chosenYAxis,circlesGroup,stateAbbr);


                // update to change bold text
                if (chosenXAxis == "poverty"){
                    povertyLabel
                    .classed("active",true)
                    .classed("inactive",false);
                    ageLabel
                    .classed("active",false)
                    .classed("inactive",true);
                    incomeLabel
                    .classed("active",false)
                    .classed("inactive",true);
                } else if (chosenXAxis == "age"){
                    povertyLabel
                    .classed("active",false)
                    .classed("inactive",true);
                    ageLabel
                    .classed("active",true)
                    .classed("inactive",false);
                    incomeLabel
                    .classed("active",false)
                    .classed("inactive",true);
                } else {
                    povertyLabel
                    .classed("active",false)
                    .classed("inactive",true);
                    ageLabel
                    .classed("active",false)
                    .classed("inactive",true);
                    incomeLabel
                    .classed("active",true)
                    .classed("inactive",false);
                }
            }

        
        })
    ylabelsGroup.selectAll("text")        
        .on("click", function(){

        var value = d3.select(this).attr("value");

        if(value !== chosenYAxis){
            chosenYAxis = value; 

            // functions used to update aspects to the x axis
            yLinearScale = yScale(censusData,chosenYAxis);
            yAxis = renderYAxis(yLinearScale, yAxis);
            circlesGroup = renderCircles(circlesGroup,xLinearScale,yLinearScale,chosenXAxis, chosenYAxis);
            stateAbbr = updateStates(stateAbbr,xLinearScale,yLinearScale,chosenXAxis, chosenYAxis);
            circlesGroup = updateToolTip(chosenXAxis,chosenYAxis,circlesGroup,stateAbbr);


            // update to change bold text
            if (chosenYAxis === "healthcare"){
                healthcareLabel
                .classed("active",true)
                .classed("inactive",false);
                smokesLabel
                .classed("active",false)
                .classed("inactive",true);
                obeseLabel
                .classed("active",false)
                .classed("inactive",true);
            } else if (chosenYAxis === "smokes"){
                healthcareLabel
                .classed("active",false)
                .classed("inactive",true);
                smokesLabel
                .classed("active",true)
                .classed("inactive",false);
                obeseLabel
                .classed("active",false)
                .classed("inactive",true);
            } else {
                healthcareLabel
                .classed("active",false)
                .classed("inactive",true);
                smokesLabel
                .classed("active",false)
                .classed("inactive",true);
                obeseLabel
                .classed("active",true)
                .classed("inactive",false);
            }
        }

    
    })

    
  }).catch(function(error){
      console.log(error);
  })