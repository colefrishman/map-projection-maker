import React, { useState } from "react";
import fs from 'fs'
import * as nodeCsv from 'node-csv';
import gridData from './grid_with_climate_temp'
import { evaluate } from "mathjs";

let scale = 2

let full_map = new Array(180).fill("").map(() => new Array(360).fill(""));
let width = 360*scale
let height = 180*scale

width = height = Math.max(width, height)

const cities = 'cities_with_climate_temp.csv'
const grid = 'grid_with_climate_temp.csv'

const parser = nodeCsv.createParser()
const getClimateData = async () => {
	parser.parse(gridData, function(err, data) {
		data.forEach(row => {
			full_map[Math.floor(row[1]) + 90][Math.floor(row[2]) + 180] = row[5]
			full_map[Math.floor(row[1])+1 + 90][Math.floor(row[2]) + 180] = row[5]
			full_map[Math.floor(row[1]) + 90][Math.floor(row[2])+1 + 180] = row[5]
			full_map[Math.floor(row[1])+1 + 90][Math.floor(row[2])+1 + 180] = row[5]
		})
	})
}

await getClimateData()

let get_color_for_climate = (climate) => {
    if (climate == null || climate?.length<1)
        return "grey"
    switch (climate[0]){
        case "A":
            return "darkolivegreen"
        case "B":
            return "tan"
        case "C":
            return "forestgreen"
        case "D":
            return "greenyellow"
        case "E":
            return "lightblue"
        case "O":
            return "blue"
        default:
            return "grey"
	}
	return "grey"
}

const draw = (xEquation="lon", yEquation="lat") => {
	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");
	ctx.fillStyle = get_color_for_climate()
	ctx.fillRect(0, 0, width, height);
	let xEq, yEq
	for (let lon = 0; lon<360; ++lon){
		for (let lat = 0; lat<180; ++lat){
			xEq = xEquation && xEquation.length ? xEquation.replaceAll("lon", lon-180).replaceAll("lat", 90-lat) : (lon-180).toString()
			yEq = yEquation && yEquation.length ? yEquation.replaceAll("lon", lon-180).replaceAll("lat", 90-lat) : (90-lat).toString()
			ctx.fillStyle = get_color_for_climate(full_map[lat][lon])
			ctx.fillRect((evaluate(xEq)+180)*scale, (180+evaluate(yEq))*scale, scale, scale);
		}
	}
}

const App = () => {
	const [xEquation, setXEquation] = useState("lon")
	const [yEquation, setYEquation] = useState("lat")

	
	const useSampleProjection = () => {
		setXEquation("lon*(90-(lat*lat)/90)/90")
		setYEquation("lat")
	}
	const useDefaultProjection = () => {
		setXEquation("lon")
		setYEquation("lat")
	}

	return(
  	<>
    	<h1>Map Projection</h1>
		<button onClick={useDefaultProjection}>use default projection</button>
		<button onClick={useSampleProjection}>use sample projection</button>
		<p>Use lat for latitude</p>
		<p>Use lon for latitude</p>
		<input placeholder="x=" onChange={e => setXEquation(e.target.value)} value={xEquation}/>
		<br />
		<input placeholder="y=" onChange={e => setYEquation(e.target.value)} value={yEquation}/>
		<br />
		<button onClick={() => draw(xEquation, yEquation)}>DRAW</button>
		<br />
		<canvas id="canvas" width={width} height={height} style={{"border":"1px solid black"}}>
			Sorry, your browser does not support canvas.
		</canvas>
	</>
	)
};

export default App