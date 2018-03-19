// Toggle the primary assignment menu
d3.select("#assignment-menu")
    .on('mouseover', function() {
      // display collapse arrow
      d3.select("#collapseExpand").style("display", "block");
      if(d3.select(this).classed('toggle-menu')) {
        d3.select(this).transition('brighten').duration(250).style('background-color', 'lightsteelblue');
      }
    })
    .on('mouseout', function() {
      // hide collapse arrow
      d3.select("#collapseExpand").style("display", "none");
      if(d3.select(this).classed('toggle-menu'))
        d3.select(this).transition('brighten').duration(250).style('background-color', 'steelblue');
    })
    .on("click", function() {
      if(d3.event.target !== d3.event.currentTarget) return;
      if(d3.select(this).classed('toggle-menu')) { // untoggle assignment menu
        d3.select(this).transition('toggle').duration(500).style('right', '0px').style("background-color", "#f8f8f8");
        d3.select(this).classed('toggle-menu', false);
        d3.select(this).append("div").classed('clickme', true);
        d3.select("#collapseExpand").html("&rarr;");
      } else { // toggle assignment menu
        d3.select(this).transition('toggle').duration(500).style('right', '-280px').style("background-color", "steelblue");
        d3.select(this).classed('toggle-menu', true);
        d3.select("#collapseExpand").html("&larr;");
      }
    });

d3.selectAll(".assignmentContainer").on("resize", function(d, i) {
    console.log('resize', d, i);
});

// Bridges visualizer object to remove vis methods from the global scope
BridgesVisualizer.strokeWidthRange = d3.scale.linear().domain([1,50]).range([1,15]).clamp(true);
//scale values between 1 and 100 to a reasonable range
BridgesVisualizer.scaleSize = d3.scale.linear().domain([1,50]).range([80,4000]);

// Offsets for text labels for visualization types
BridgesVisualizer.textOffsets = {
  "graph": { "x": 22, "y": -10 },
  "tree": { "x": 200, "y": -15 },
  "default": { "x": 0, "y": 0}
};

BridgesVisualizer.treeDashArray = "3px, 3px";

// Keep track of the center of the default vis window
BridgesVisualizer.visCenter = function() {
  return [document.getElementById("vis0").clientWidth/2 || 0,
          document.getElementById("vis0").clientHeight/2 || 0];
};

// Default scale and transform values for each data structure
BridgesVisualizer.defaultTransforms = {
  "Alist": { "scale": 0.4, "translate": [20, 100]},
  "array": { "scale": 0.4, "translate": [20, 100]},
  "Array2D": { "scale": 0.4, "translate": [20, 100]},
  "Array3D": { "scale": 0.4, "translate": [20, 100]},

  //added this new objects, see 278, method reset()
  //this changes were made to handle mixed assignments when calling the reset method.
  "list": { "scale": 0.3, "translate": [50, -5]},
  "llist": { "scale": 0.3, "translate": [50, -5]},
  "dllist": { "scale": 0.3, "translate": [50, -5]},
  "cdllist": { "scale": 0.3, "translate": [50, -5]},
  "cllist": { "scale": 0.3, "translate": [50, -5]},

  "graph": { "scale": 0.5, "translate": BridgesVisualizer.visCenter()},
  "nodelink": { "scale": 0.5, "translate": BridgesVisualizer.visCenter()},

  "tree": { "scale": 0.9, "translate": [document.getElementById("vis0").clientWidth/2, 50]}
};

BridgesVisualizer.getDefaultTransforms = function(visType) {
  if(BridgesVisualizer.defaultTransforms[visType]) {
    return BridgesVisualizer.defaultTransforms[visType];
  } else {
    return {"scale": 0.9, "translate": [50, 100]};
  }
};

// function to return color depending on the style of representation
BridgesVisualizer.getColor = function(color) {
  if(Array.isArray(color))
    return "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + color[3] + ")";
  return color;
};

//this array holds the assignments types; it's used to handle the mixed assignements
BridgesVisualizer.assignmentTypes = [];

//this boolean is used to deactivate the tooltip when all labels are shown (key 'L')
BridgesVisualizer.tooltipEnabled = true;

BridgesVisualizer.centerTextHorizontallyInRect = function(obj, width){
    return (width - obj.getComputedTextLength()) / 2;
};

//add three ellipsis(...) if the text length is greater than 5
BridgesVisualizer.getShortText = function(text){
    if(text && text.length > 5){
      return text.substr(0,4)+"...";
    }else{
      return text;
    }
};

// bind linebreaks to text elements
BridgesVisualizer.insertLinebreaks = function (d, i) {
    var el = d3.select(this);
    var words = d3.select(this).text().split('\n');
    el.text('');

    for (var j = 0; j < words.length; j++) {
        var tspan = el.append('tspan').text(words[j]);
        if (j > 0)
            tspan.attr('x', 0).attr('dy', '15');
    }
};

//TODO, need unique ID for local storage
BridgesVisualizer.getTransformObjectFromLocalStorage = function(visID) {

};

// Add newly-styled markers to the defs for the given svg
// BridgesVisualizer.marker = function(svg, color, otherAttr) {
//     console.log('making marker', color);
//     var val;
//     svg.select("svg:defs").selectAll("marker")
//          .data([val])
//          .enter().append("svg:marker")
//          .attr("id", String)
//          .attr("viewBox", "0 -5 10 10")
//          .attr("refX", 20)
//          .attr("refY", 0)
//          .attr("markerWidth", 6)
//          .attr("markerHeight", 6)
//          .attr("orient", "auto")
//          .style("fill", color)
//          .append("svg:path")
//          .attr("d", "M0,-5L10,0L0,5");
//     return "url(#" +val+ ")";
// };

// function to return the transformObject saved positions
BridgesVisualizer.getTransformObjectFromCookie = function(visID) {
        var name = "vis"+visID+"-"+location.pathname + "=";
        // var name = cname + "=";
        var ca = document.cookie.split(';');
        // console.log(ca);
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                // return c.substring(name.length, c.length);
                var cookieStringValue = c.substring(name.length, c.length);
                var cookieJSONValue;
                try{
                    cookieJSONValue = JSON.parse(cookieStringValue);
                }catch(err){
                    console.log(err, cookieStringValue);
                }

                if(cookieJSONValue){
                  if(cookieJSONValue.hasOwnProperty("translatex") &&
                     cookieJSONValue.hasOwnProperty("translatey") &&
                     cookieJSONValue.hasOwnProperty("scale")){
                       var finalTranslate = [parseFloat(cookieJSONValue.translatex), parseFloat(cookieJSONValue.translatey)];
                       var finalScale = [parseFloat(cookieJSONValue.scale)];
                       return {"translate":finalTranslate, "scale":finalScale};
                  }
                }else{
                  return undefined;
                }
            }
        }
        return "";
};

d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
};

d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};

// Define the div for the tooltip
BridgesVisualizer.tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .classed("shown", false)
    .style("pointer-events", "none")
    .style("opacity", 0);

BridgesVisualizer.showTooltip = function(text, x, y) {
  function addLineBreaks(str) {
    str = str.split("\n");
    str = str.join("<br>");
    return str;
  }
  if(text) {
    BridgesVisualizer.tooltip
        // .transition("tooltip")
        // .duration(200)
        .style("opacity", 0.9);
    BridgesVisualizer.tooltip.html(addLineBreaks(text))
      .style("left", (x) + "px")
      .style("top", (y) + "px");
  } else {
    BridgesVisualizer.tooltip
        // .transition("tooltip")
        // .duration(200)
        .style("opacity", 0);
  }
};

BridgesVisualizer.textMouseover = function(d) {
    function addLineBreaks(str) {
      str = str.split("\n");
      str = str.join("<br>");
      return str;
    }

    if(!BridgesVisualizer.tooltipEnabled) return;

    //the design can be changed later, if not appropriate. Mainly for implementation
    if(d3.select(this).select("rect"))
        d3.select(this).select("rect").style("stroke", "yellow").style("stroke-width", 4);

    if(d3.select(this).select("path")){
            d3.select(this).select("path").transition()
                .duration(750)
                .attr('d', function (d) {
                    return d3.svg.symbol().type(d.shape||"circle")
                            .size(BridgesVisualizer.scaleSize(40))();
                });
    }
    tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
    tooltip.html(addLineBreaks(d.name))
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY) + "px");
    };

BridgesVisualizer.textMouseout = function(d) {
    if(d3.select(this).select("rect"))
        d3.select(this).select("rect").style("stroke", "gray").style("stroke-width", 2);

    if(d3.select(this).select("path")){
            d3.select(this).select("path").transition()
                .duration(750)
                .attr('d', function (d) {
                    return d3.svg.symbol().type(d.shape||"circle")
                            .size(BridgesVisualizer.scaleSize(d.size||1))();
                });
    }

    tooltip.transition()
        .duration(500)
        .style("opacity", 0);
};

// bind event handlers for ui
// d3.selectAll(".minimize").on("click", minimize);
d3.select("#reset").on("click", reset);
d3.select("#save").on("click", savePositions);
d3.select("#delete").on("click", deleteAssignment);
d3.select("#resize").on("click", resize);

allZoom = [];
allSVG = [];

var visCount = 0,
    minimizedCount = 0;

/* create new assignments  */
for (var key in data) {
  if (data.hasOwnProperty(key)) {
    var ele = document.getElementById("vis" + key),
        width = ele.clientWidth - 15,
        height = ele.clientHeight + 15,
        transform = data[key].transform;
    //saving a copy of every assignment: type and key of the assignment. Useful when trying to reset them.

    var canvas = d3.select("#vis" + key).append("canvas")
      .attr("id", "canvas" + key);

    BridgesVisualizer.assignmentTypes.push(data[key]['visType']);

    if (data[key]['visType'] == "tree" && d3.bst) {
        bst = d3.bst(d3, "#vis" + key, width, height);
        bst.make(data[key]);
    }
    else if(data[key]['visType'] == "dllist" && d3.dllist){
        d3.dllist(d3, "#vis" + key, width, height, sortNonCircularListByLinks(data[key]), transform);
    }
    else if(data[key]['visType'] == "cdllist" && d3.cdllist){
        d3.cdllist(d3, "#vis" + key, width, height, sortCircularDoublyListByLinks(data[key]));
    }
    else if(data[key]['visType'] == "llist" && d3.sllist){
        // d3.sllist(d3, "#vis" + key, width, height, sortNonCircularListByLinks(data[key]), transform);
        d3.sllist(d3, "#vis" + key, width, height, sortSLLists(data[key]), transform);
    }
    else if(data[key]['visType'] == "cllist" && d3.csllist){
        d3.csllist(d3, "#vis" + key, width, height, sortCircularSinglyListByLinks(data[key]), transform);
    }
    else if (data[key]['visType'] == "queue" && d3.queue) {
        d3.queue(d3, "#vis" + key, width, height, data[key].nodes, transform);
    }
    else if (data[key]['visType'] == "Alist" && d3.array) {
          d3.array(d3, "#vis" + key, width, height, data[key].nodes, transform);
    }
    else if (data[key]['visType'] == "Array2D" && d3.array2d) {
          d3.array2d(d3, "#vis" + key, width, height, data[key].nodes, data[key].dims, transform);
    }
    else if (data[key]['visType'] == "Array3D" && d3.array3d) {
          d3.array3d(d3, "#vis" + key, width, height, data[key].nodes, data[key].dims, transform);
    }
    else if (data[key]['visType'] == "grid" && d3.grid) {

        d3.grid(canvas, width, height, data[key]);
    }
    else if (data[key]['visType'] == "nodelink" && d3.graph) {

        d3.graph(canvas, width, height, data[key]);
        // handle map overlay for subassignment if appropriate
        if(data[key].map_overlay) {
          map('svg'+key, data[key].coord_system_type);
        }
    }
    else {
        // console.log("unknown data type");
        d3.graph(d3, "#vis" + key, width, height, data[key]);
        if(data[key].map_overlay) {
          map('svg'+key, data[key].coord_system_type);
        }
    }
    visCount++;

  }
}

// Reset positions and scales for all visualization divs
function reset() {

    for (var i = 0; i < allZoom.length; i++) {
        var zoom = allZoom[i];
        var svgGroup = allSVG[i];
        zoom.scale(1);

        /* set default translate based on visualization type */
        if(BridgesVisualizer.assignmentTypes[i] in BridgesVisualizer.defaultTransforms){

            zoom.translate(BridgesVisualizer.defaultTransforms[BridgesVisualizer.assignmentTypes[i]].translate);
            zoom.scale(BridgesVisualizer.defaultTransforms[BridgesVisualizer.assignmentTypes[i]].scale);
        }else{
            try {
                throw "For some reason this vistype is not being recognized.";
            } catch( ex ) {
                console.log(ex);
            }
        }
        svgGroup.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
    }
    saveVisStatesAsCookies();
}

function deleteAssignment() {

  var r = confirm("Are you sure you want to delete this assignment?");
  if (r === true) {
      // send delete request
      $.ajax({
          url: "/assignments/"+assignmentNumber,
          type: "DELETE",
          success: function(status) {
              window.location = '../../username';
          }
      });
  }
}

// Toggle resizing of visualization divs (swaps between two sizes)
function resize() {
    var sentinel = false;

    for(var i = 0; i < visCount; i++) {
        if ((d3.select("#vis" + i)).attr("height") < 400)
            sentinel = true;
    }
    if(sentinel) {
        height *= 2;

        d3.selectAll(".assignmentContainer")
            .attr( "height", height );
        d3.selectAll(".svg")
            .attr( "height", height );
    } else {
        height /= 2;

        d3.selectAll(".assignmentContainer")
            .attr("height", height);
        d3.selectAll(".svg")
            .attr("height", height);
    }
}

// Asynchronously update the node positions
function savePositions () {

  var updateTheseNodes = {};

  // store indices for all fixed nodes
  for (var key in data) {
    updateTheseNodes[key] = {
      'fixedNodes': {},
      'unfixedNodes': {}
    };
    if (data.hasOwnProperty(key)) {
      d3.select("#vis" + key).selectAll(".node").each(function(d, i) {
        // we need to name the nodes so we can identify them on the server; indices don't suffice
        if(d.fixed) updateTheseNodes[key].fixedNodes["n" + i] = {"x": d.x, "y": d.y};
        else updateTheseNodes[key].unfixedNodes["n" + i] = true;
      });
    }
  }

  // send fixed node indices to the server to save
  $.ajax({
      url: "/assignments/updatePositions/"+assignmentNumber,
      type: "post",
      data: updateTheseNodes
  }).done(function(status) {
      if(status == 'OK'){
          alertMessage("Node positions saved!", "success");
      } else {
          alertMessage("Unsuccessful. Try logging in!", "danger");
      }
  });
}

//Asynchronously update the vis transform values
//this method is just for testing, if approved, it still needs the ajax call and routing set up as well as the dabatase.
//It also can be used with the tree visualization
function saveTransform(){
    var visTransforms = {};
    for (var key in data) {
        var my_transform = d3.transform(d3.select("#vis"+key).select("g").attr("transform"));
        visTransforms[key] = {
          "scale": parseFloat(my_transform.scale[0]),
          "translatex": parseFloat(my_transform.translate[0]),
          "translatey": parseFloat(my_transform.translate[1])
        };
    }
    // console.log(visTransforms);
    // send scale and translation data to the server to save
    $.ajax({
        url: "/assignments/updateTransforms/"+assignmentNumber,
        type: "post",
        data: visTransforms
    }).done(function(status) {
        if(status == 'OK'){
            alertMessage("Scale and translation saved!", "success");
        } else {
            alertMessage("Unsuccessful. Try logging in!", "danger");
        }
    });
}

/*
 Create a tooltip from the given message and status
 status: success, danger, warning
*/
function alertMessage(message, status) {
  var today = new Date().toLocaleTimeString()+" - "+new Date().toLocaleDateString();
  $("#updateStatus").html(message+"<br>"+today);
  $("#updateStatus").addClass("alert alert-" + status);
  $("#updateStatus").show();
  setTimeout(function(){
     $("#updateStatus").hide();
  },2500);
}

// Saved the translate and scale of every visualization in an assignemts
function saveVisStatesAsCookies(){
    // console.log(this);
    var exdays = 30;
    try{
      for (var key in data) {
          var cookieName = "vis"+key+"-"+location.pathname;
          var my_transform = d3.transform(d3.select("#vis"+key).select("g").attr("transform"));

          var cookieValue = JSON.stringify({
            "scale": parseFloat(my_transform.scale[0]),
            "translatex": parseFloat(my_transform.translate[0]),
            "translatey": parseFloat(my_transform.translate[1])
          });
          var d = new Date();
          d.setTime(d.getTime() + (exdays*24*60*60*1000));
          var expires = "expires=" + d.toGMTString();
          document.cookie = cookieName+"="+cookieValue+"; "+expires;
      }
      var today = new Date().toLocaleTimeString()+" - "+new Date().toLocaleDateString();
      //  alertMessage("Scale and translation saved!", "success");
    } catch(err){
      console.log(err);
    }
}

// Save cookies when scale and translation are updated
//  only updates zoom after scrolling has stopped
try{
    var wheeling = null;
    $("svg").mouseup(saveVisStatesAsCookies);
    $("svg").on('wheel', function (e) {
      clearTimeout(wheeling);
      wheeling = setTimeout(function() {
        saveVisStatesAsCookies();
        wheeling = undefined;
      }, 250);
    });
}catch(err){
    console.log(err);
}

function hideTooltip(){
  tooltip.transition()
      .duration(500)
      .style("opacity", 0);
}

//toggle, show and hide all labels ".nodeLabel"
$("body").on("keydown", function(event) {
    if(event.which == "76"){
        hideTooltip();
        if($(".nodeLabel").length > 0 && (d3.selectAll(".nodeLabel").style("display") == "none" || d3.selectAll(".nodeLabel").style("opacity") == "0")){
            d3.selectAll(".nodeLabel").style("display","block").style("opacity","1");
            BridgesVisualizer.tooltipEnabled = false;
        }else if($(".nodeLabel").length > 0){
            d3.selectAll(".nodeLabel").style("display","none").style("opacity","0");
            BridgesVisualizer.tooltipEnabled = true;
        }
    }
});

//this methods sorts any Doubly Links linkedlist by links
function sortCircularSinglyListByLinks(unsortedNodes, listType){
    var links = unsortedNodes.links,
        nodes = unsortedNodes.nodes,
        uniqueForwardLink = {},
        uniqueBackwardLink = {},
        sortedNodes = [],
        head = 0,
        lastIndex;

    //O(n)
    for(var i = links.length-1; i >= 0; i--){
        if(parseInt(links[i].source) < parseInt(links[i].target)){
            uniqueForwardLink[links[i].source+"-"+links[i].target] = links[i];
        }else{
            uniqueBackwardLink[links[i].source+"-"+links[i].target] = links[i];
        }
    }

    //this is expensive. Previous methods worked, but I find this way is safer.
    //but it only happens once
    var keys = Object.keys(uniqueForwardLink).sort(function(a,b){
        if(a.split("-")[0] == b.split("-")[0]){
           if(parseInt(a.split("-")[1]) > parseInt(b.split("-")[1])){
              lastIndex = a;
           }else{
              lastIndex = b;
           }
        }
        return parseInt(a.split("-")[0]) - parseInt(b.split("-")[0]);
    });

    for(key in keys){
      nodes[head]['forwardlink'] = uniqueForwardLink[keys[key]];
      sortedNodes.push(nodes[head]);
      head = uniqueForwardLink[keys[key]].target;
    }if(sortedNodes.length == nodes.length-1){
      sortedNodes.push(nodes[head]);
    }

    //this is O(1) since there is only one link from the last node to the first.
    for(key in uniqueBackwardLink){
      sortedNodes[sortedNodes.length-1]['forwardlink'] = uniqueBackwardLink[key];
    }

    return sortedNodes;
}

//this methods sorts any Doubly Links linkedlist by links
function sortCircularDoublyListByLinks(unsortedNodes, listType){
    var links = unsortedNodes.links,
        nodes = unsortedNodes.nodes,
        uniqueForwardLink = {},
        uniqueBackwardLink = {},
        sortedNodes = [],
        head = 0,
        lastIndex,
        lastElement;

    for(var i = links.length-1; i >= 0; i--){
        if(parseInt(links[i].source) < parseInt(links[i].target)){
            uniqueForwardLink[links[i].source+"-"+links[i].target] = links[i];
            if(links[i].source == 0 && links[i].target == nodes.length-1){
                nodes[links[i].source]['forwardlink'] = links[i];
                continue;
            }else{
                nodes[links[i].target]['backwardlink'] = links[i];
                continue;
            }

        }else{
            uniqueBackwardLink[links[i].source+"-"+links[i].target] = links[i];
            if(links[i].source == nodes.length-1 && links[i].target == 0){
                nodes[links[i].target]['backwardlink'] = links[i];
                continue;
            }else{
                nodes[links[i].source]['forwardlink'] = links[i];
                continue;
            }
        }
    }

    var keys = Object.keys(uniqueForwardLink).sort(function(a,b){
        if(a.split("-")[0] == b.split("-")[0]){
           if(parseInt(a.split("-")[1]) > parseInt(b.split("-")[1])){
               lastIndexA = a;
               lastIndexB = b;
           }else{
               lastIndexA = a;
               lastIndexB = b;
           }
        }
        return parseInt(b.split("-")[0]) - parseInt(a.split("-")[0]);
    });

    for(var i = 0; i < keys.length; i++){
      sortedNodes.push(nodes[head]);
      head = uniqueForwardLink[keys[i]].target;
    }

    sortedNodes[lastIndexA.split("-")[1]] = nodes[lastIndexB.split("-")[1]];

    return sortedNodes;
}

//this methods sorts any Doubly Links linkedlist by links
function sortNonCircularListByLinks(unsortedNodes, listType){
    var links = unsortedNodes.links;
    var nodes = unsortedNodes.nodes;
    var uniqueForwardLink = {},
        uniqueBackwardLink = {},
        sortedNodes = [],
        head = 0;
    // console.log(unsortedNodes, listType);

    for(var i = links.length-1; i >= 0; i--){
        if(parseInt(links[i].source) < parseInt(links[i].target)){
            uniqueForwardLink[links[i].source+"-"+links[i].target] = links[i];
        }else{
            uniqueBackwardLink[links[i].target+"-"+links[i].source] = links[i];
        }
    }

    var keys = Object.keys(uniqueForwardLink).sort(function(a,b){
        return parseInt(a.split("-")[0]) - parseInt(b.split("-")[0]);
    });

    for(key in keys){
        nodes[head]['forwardlink'] = uniqueForwardLink[keys[key]];
        sortedNodes.push(nodes[head]);
        head = uniqueForwardLink[keys[key]].target;
    }if(sortedNodes.length == nodes.length-1){
        sortedNodes.push(nodes[head]);
    }

    for(key in uniqueBackwardLink){
        if(sortedNodes[uniqueBackwardLink[key].target])sortedNodes[uniqueBackwardLink[key].target]['backwardlink'] = uniqueBackwardLink[key];
    }

    // console.log(sortedNodes);
    return sortedNodes;
}

// Sort old and new SLLists
//  O(n)
function sortSLLists(unsortedNodes) {
  var links = unsortedNodes.links,
      nodes = unsortedNodes.nodes,
      sortedNodes = [],
      forwardLinks = {},
      forwardLinkObjects = {},
      backwardLinks = {},
      curr = null;

  // Store all the forward and backward connections
  // O(n)
  for(var i in links) {
    forwardLinks[links[i].source] = links[i].target;
    forwardLinkObjects[links[i].source] = links[i];
    backwardLinks[links[i].target] = links[i].source;
  }

  // If there are no links, just return nodes
  if(links.length === 0)
    return nodes;


  // find the head node
  // O(n) in worst case (old llists)
  // O(1) in best case (new llist)
  for(var i in nodes) {
    if(!backwardLinks[i]) {
      nodes[i].forwardLink = forwardLinkObjects[i];
      curr = nodes[i].forwardLink.target;
      sortedNodes.push(nodes[i]);
      break;
    }
  }

  // add the rest of the nodes in link order
  // O(n)
  for(var i = 0; i < links.length-1; i++) {
      nodes[curr].forwardLink = forwardLinkObjects[curr];
      sortedNodes.push(nodes[curr]);
      curr = nodes[curr].forwardLink.target;
  }

  // add last node
  sortedNodes.push(nodes[curr]);

  return sortedNodes;
}

// Update default transforms that rely on window sizes
$(window).resize(function() {
    clearTimeout(window.resizedFinished);
    window.resizedFinished = setTimeout(function(){
        BridgesVisualizer.defaultTransforms.graph.translate = BridgesVisualizer.visCenter();
        BridgesVisualizer.defaultTransforms.nodelink.translate = BridgesVisualizer.visCenter();
    }, 250);
});
