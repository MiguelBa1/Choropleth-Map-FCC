(async function getData() {
    let educationData = await (await fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json')).json()
    let shapes = await (await fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json')).json()
    let countyInfo = new Map(educationData.map(x => [x.fips, {bachelor: x.bachelorsOrHigher, area_name: x.area_name, state: x.state}]))

    const margin = { top: 50, bottom: 50, left: 75, right: 50 }
    const width = 1100 - margin.left - margin.right;
    const height = 700 ;

    const path = d3.geoPath();

    let color = d3.scaleThreshold()
        .domain([0, 12, 21, 30, 39, 48, 57, 66])
        .range(d3.schemeBlues[8])

    let svg = d3.select("main")
        .append("svg")
        .attr("height", height)
        .attr("width", width)
        .attr("viewbox", [0, 0, width, height])

    let tooltip = d3.select("main")
        .append("div")
        .attr("class", "tooltip")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("opacity", "0")

    let mouseover = (data) => {
        let county = countyInfo.get(data.id)
        return tooltip
            .style("top", (d3.event.pageY)-10 + "px")
            .style("left", (d3.event.pageX)+25 + "px")
            .style("opacity", "1")
            .attr("data-education", county.bachelor)
            .html(`${county.area_name}, ${county.state}: ${county.bachelor}%`)
    }

    let mouseleave = (d) => tooltip.style("opacity", "0")

    let counties = topojson.feature(shapes, shapes.objects.counties).features

    svg.selectAll("path")
        .data(counties)
        .enter()
        .append("path")
        .attr("fill", d => color(countyInfo.get(d.id).bachelor))
        .attr("data-fips", d=>d.id)
        .attr("data-education", d=>countyInfo.get(d.id).bachelor)
        .attr("class", "county")
        .attr("d", path)
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave)

    let states = topojson.mesh(shapes, shapes.objects.states, (a, b) => a !== b)

    svg.append("path")
        .datum(states)
        .attr("class", "state")
        .attr("d", path);

    let g = svg.append("g")
        .attr("transform", "translate(600,40)")
        .attr("id", "legend")

    const widthLegend = 260;
    const length = color.range().length;

    const x = d3.scaleLinear()
        .domain([0, length - 1])
        .rangeRound([widthLegend / length, widthLegend * (length - 1) / length]);

    g.selectAll("rect")
        .data(color.range())
        .enter()
        .append("rect")
        .attr("height", 8)
        .attr("x", (d, i) => x(i))
        .attr("width", (d, i) => x(i + 1) - x(i))
        .attr("fill", d => d);

    g.call(d3.axisBottom(x)
        .tickSize(13)
        .tickFormat(i => color.domain()[i] + '%')
        .tickValues(d3.range(0, length)))
        .select(".domain")
        .remove();
})()
