<script>
    import { onMount } from 'svelte';
    import Details from './Details.svelte';
    import * as d3 from 'd3';
    import { initializeApp } from 'firebase/app';
    import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
    import { getDatabase, ref, onValue } from 'firebase/database';
    //this code works now with my data, but still need further structuring the data for SpecificsExplained and Value, probably should drop those and list them on the bottom of the page. 
    //The opacity stayed with transition, and the chart behaves as expected for zooming on category and subcategory level, do not touch this copy. Use Subnurstchart 2
    // Firebase configuration from your Firebase Console (safe for frontend)
    
    export let datasetId; // Dynamically set
 
    
    const firebaseConfig = {
      apiKey: "AIzaSyCS7FGAuLrgvVXVt6xEMY5n4yTdX9WBRzE",
      authDomain: "inclusight-6e55a.firebaseapp.com",
      databaseURL: "https://inclusight-6e55a-default-rtdb.firebaseio.com",
      projectId: "inclusight-6e55a",
      storageBucket: "inclusight-6e55a.appspot.com",
      messagingSenderId: "270009455",
      appId: "1:270009455:web:34c4d4ce6c8c265af4399a",
      measurementId: "G-1NY06W1990"
    };

    console.log("✅ Initializing Firebase..."); // Debugging output

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const auth = getAuth(app);

  let element; // Element to bind the SVG container for the Sunburst chart
  let data=null; // Variable to store transformed data ready for visualization
  let categoryData = {}; // Stores all JSON data retrieved from Firebase
  let selectedCategoryData = null; // Stores data for the clicked category
  let zoomLevel = 0; // Initial zoom level
 
    // Your email & password (replace with your credentials)
    const email = "xxl228@psu.edu";
    const password = "Password!123";


    // // Fetch data from Firebase and transform it on mount
    // onMount(() => {
    //     const dataRef = ref(database, `/datasets/${datasetId}`); // Reference to the Firebase data path
    //     onValue(dataRef, (snapshot) => {
    //         const rawData = snapshot.val(); // Retrieve raw data from Firebase
    //         console.log("Raw Dataset from Firebase:", rawData); // Log the raw data from Firebase
    //         data = transformData(rawData); // Transform the data for D3.js
    //         console.log("Transformed Data Structure:", JSON.stringify(data, null, 2));  // Check data structure
    //         updateSunburstChart(data); // Render the Sunburst chart with the transformed data
    //     });
    // });

    // //  Fetch Data When datasetId Changes
    // $: if (datasetId) {
    // console.log("Fetching dataset:", datasetId);
    onMount(() => {
        console.log("📌 onMount Triggered - datasetId:", datasetId);
        if (!datasetId) {
        console.error("Dataset ID not provided!");
        return;
        }

         // ✅ First, Sign in to Firebase
         signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log("✅ Signed in as:", userCredential.user.email);
                    
                const dataRef = ref(database, `/datasets/${datasetId}`);  // FIXED STRING INTERPOLATION
                    onValue(dataRef, (snapshot) => {
                        const rawData = snapshot.val();
                        if (!rawData) {
                            console.warn(`No data found for dataset: ${datasetId}`);
                            return;
                        }
                        console.log(`Fetched Dataset from Firebase: ${datasetId}`, rawData);
                        console.log("🔄 Transformed Data for Sunburst Chart:", data);
                        data = transformData(rawData);
                        updateSunburstChart(data);
                    });
                })
        .catch((error) => {
            console.error("❌ Authentication failed:", error.message);
        });
});

    // Transform raw data to a format compatible with D3.js Sunburst
    function transformData(rawData) {
      function recursiveTransform(obj, key) {
          // If it's a leaf node (contains Size), return it with its Size, SpecificsExplained, and Value
          if (obj.Size !== undefined) {
              return {
                  id: obj.Id,
                  name: key,
                  size: obj.Size, // Size is used for visualization
                  SpecificsExplained: obj.SpecificsExplained, // Retain SpecificsExplained for tooltip
                  Value: obj.Values // Retain Value (even if it's not used in visualization)
              };
          }

          // For non-leaf nodes (categories or subcategories), continue the recursion
          const children = Object.keys(obj)
              .map(subKey => recursiveTransform(obj[subKey], subKey));

          return {
              name: key || "Unnamed",
              children: children.filter(child => child.name) // Only include valid children
          };
      }

      const transformedData = {
        name: "Root",
        children: Object.keys(rawData).map(category => recursiveTransform(rawData[category], category))
    };
    
    console.log("Transformed Data Structure:", JSON.stringify(transformedData, null, 2));  // Log transformed data structure
    return transformedData;
}



    // Function to render the Sunburst chart
    function updateSunburstChart(data) {
        if (element) element.innerHTML = ''; // Clear existing SVG content

        const chart = Sunburst(data); // Generate Sunburst chart from data
        element.appendChild(chart); // Append chart to bound element
    }



    // Function to handle clicks on the sunburst chart and select category data
    function handleCategoryClick(clickedNode) {
    console.log("Node received in handleCategoryClick:", clickedNode);

    if (clickedNode && clickedNode.data && clickedNode.data.name) {
        selectedCategoryData = clickedNode.data;
        console.log("Selected Category Data (valid):", selectedCategoryData);  // Log selected data for confirmation
        // clicked(null, clickedNode); // Call `clicked` to zoom in on the node

        // // Update URL with category name or ID ADDED
        // const categoryId = clickedNode.data.id || clickedNode.data.name.toLowerCase().replace(/\s+/g, '-');
        // navigate(`/details/${categoryId}`, { replace: false, state: { categoryData: selectedCategoryData } });

        // // Zoom in or update chart as necessary ADDED
        // zoomLevel = clickedNode.depth;
    } else {
        zoomLevel = 0;
        selectedCategoryData = null;
        console.warn("Clicked node data is undefined or missing the name property");
        console.log("Full clickedNode object received:", clickedNode); // Log the node for further debugging
    }
}

 // Sunburst function for rendering the chart using D3.js
 function Sunburst(data) {
      const width = 928; // Width of the chart
      const height = width; // Set height equal to width for a square layout
      const radius = width / 6; // Radius size for the sunburst chart
      const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1)); // Color scale


      const hierarchy = d3.hierarchy(data)
              .eachBefore(d => {
                  if (!d.children) {
                      // For leaf nodes, calculate their sumValue (which is the Value itself)
                      d.sumValue = d.data.Value;  // Leaf node's Value is either 0 or 1
                      d.totalChildren = 1;        // Leaf nodes count as 1 child
                  } else {
                      // For subcategory and category nodes, aggregate their children's sumValues and totalChildren
                      d.sumValue = d.children.reduce((sum, child) => sum + (child.sumValue || 0), 0);  // Sum of children's Values
                      d.totalChildren = d.children.reduce((count, child) => count + (child.totalChildren || 0), 0);  // Total number of leaf nodes
                  }
                  // Calculate the total sum of leaf node values for the category level (ignore subcategory intermediate nodes)
                  if (d.depth === 1) {
                      d.totalLeafNodesWithOne = d.descendants().filter(n => !n.children && n.data.Value === 1).length;  // Count of leaf nodes with Value = 1
                      d.totalLeafNodes = d.descendants().filter(n => !n.children).length;  // Total number of leaf nodes
                  }

                  // Calculate the total leaf nodes for subcategory level
                  if (d.depth === 2) {
                      d.totalLeafNodesWithOne = d.descendants().filter(n => !n.children && n.data.Value === 1).length;  // Count of leaf nodes with Value = 1
                      d.totalLeafNodes = d.descendants().filter(n => !n.children).length;  // Total number of leaf nodes in subcategory
                  }
              })
            .sum(d => d.size) // Sum values to size arcs based on value
            .sort((a, b) => b.value - a.value); // Sort arcs by value for display

        const root = d3.partition()
            .size([2 * Math.PI, hierarchy.height + 1])(hierarchy); // Compute layout using partition

        // Debugging: Log leaf nodes to check if they are part of the hierarchy
        root.descendants().forEach(d => {
            if (!d.children) {
                console.log("Leaf Node:", d.data.name, "Value:", d.data.Value);
            }
        });

        root.each(d => d.current = d); // Initialize each node with its current position

        // Track the zoom state for handling the correct opacity
        let zoomLevel = 0;  // 0: initial load, 1: category zoom, 2: subcategory zoom
        
        function clicked(event, p) {
                // Determine zoom level based on the clicked node's depth
            zoomLevel = p.depth;
            
            parent.datum(p.parent || root); // Set zoom-out target

            // Reset clicked state on all nodes if zooming out to hide third layer
            if (p.depth <= 1) {
                root.each(d => {
                    d.clicked = false; // Reset clicked state
                });
            }

            root.each(d => d.target = {
                x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                y0: Math.max(0, d.y0 - p.depth),
                y1: Math.max(0, d.y1 - p.depth)
            });

            const t = svg.transition().duration(750); // Smooth transition
             
            // Transition the arcs, ensure that colors, opacity, and visibility are updated
            path.transition(t)
                .tween("data", d => {
                    const i = d3.interpolate(d.current, d.target);
                    return t => d.current = i(t);
                })
                .attr("fill", d => calculateColor(d))  // Reapply the color scale during transition
                .attr("fill-opacity", d => calculateOpacity(d))
                // .attr("fill-opacity", d => {
                //         // Make leaf nodes (depth 3) hidden on load
                //         return d.depth === 3 && !d.clicked ? 0 : calculateOpacity(d);
                //     })
                // .attr("fill-opacity", d => {
                //     // Recalculate opacity for depth 3 based on clicked state
                //     if (d.depth === 3) {
                //         d.clicked = true; // Set clicked state to true on transition
                //         return calculateOpacity(d);
                //     }
                //     return calculateOpacity(d); // For other depths, use existing logic
                // })

                .attr("pointer-events", d => arcVisible(d) ? "auto" : "none")  // Recalculate visibility during transitions
                .attrTween("d", d => () => arc(d.current)); // Animate arc transitions
             
                // Transition the labels
            label.transition(t)
                .attr("fill-opacity", d => +labelVisible(d.target)) // Label opacity on transition
                .attrTween("transform", d => () => labelTransform(d.current)); // Animate label position
        }
        
        
        // Calculate the opacity based purely on the data
        function calculateOpacity(d) {
            // For leaf nodes (Specifics), calculate opacity based on Value
            // if (!d.children) {
            //     return d.data.Value / 1;  // Full opacity for Value = 1, transparent for 0
            // }
                // Ensure leaf nodes (depth 3) are hidden on load
            if (zoomLevel === 0 && d.depth === 3) return 0; // Hide third-layer (leaf nodes) initially

            // Set opacity based on Value for other depths
            if (!d.children) return d.data.Value === 1 ? 1 : 0; // Leaf nodes on zoom
            // For subcategories, calculate opacity based on proportion of total leaf nodes with Value = 1
            if (d.depth === 2) {
                return (d.totalLeafNodesWithOne / d.totalLeafNodes);  // Proportional opacity for subcategories
            }

            // For categories, calculate opacity based on total leaf nodes in the category
            if (d.depth === 1) {
                return (d.totalLeafNodesWithOne / d.totalLeafNodes);  // Proportional opacity for categories
            }

            return 1;  // Default full opacity for the root or other nodes
        }




        const arc = d3.arc()
            .startAngle(d => d.x0) // Start angle of the arc
            .endAngle(d => d.x1) // End angle of the arc
            .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005)) // Padding between arcs
            .padRadius(radius * 1.5) // Radius padding calculation
            .innerRadius(d => d.y0 * radius) // Inner radius for the arc
            .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius-1)); // Outer radius of the arc

        const svg = d3.create("svg")
            .attr("viewBox", [-width * 0.5, -height * 0.5, width*1.1, height*1.1])  // Increase the viewBox for bigger area
            .attr("width", 928)  // Larger width for the chart
            .attr("height", 928)  // Larger height for the chart
            .style("font", "12px sans-serif")
            .style("background-color", "#f0f0f0") // Light gray background
            .attr("transform", `scale(1)`); 

        // Add the zoom function here
        const zoom = d3.zoom()
            .scaleExtent([1, 8]) // Zoom range
            .on("zoom", (event) => {
                svg.attr("transform", event.transform); // Apply the zoom effect on the svg
            });

        // Call the zoom on the svg
        svg.call(zoom);


        // Function to calculate the color fill
        function calculateColor(d) {
            // Go up the hierarchy to find the parent and apply the color scale
            while (d.depth > 1) d = d.parent;
            return color(d.data.name);  // Color is based on the name of the category
        }



        const path = svg.append("g") //This controls the color, opacity, and transition
            .selectAll("path")
            .data(root.descendants().slice(1)) // Skip the root node for arcs
            .join("path")
            .attr("fill", d => { 
                while (d.depth > 1) d = d.parent; 
                return color(d.data.name); // Use the color scale for each category
            })
            .attr("fill", d => calculateColor(d))// Use the color scale for each category
            .attr("fill-opacity", d => calculateOpacity(d))
            .attr("d", d => arc(d.current)) // Define the arc path
            .attr("pointer-events", d => arcVisible(d) ? "auto" : "none")  // Use visibility check only during transitions
            .on("click", (event, d) => {
                event.stopPropagation();  // Prevents event from bubbling up
                console.log("Node clicked (full structure):", d); // Log the full node structure to debug
                handleCategoryClick(d); // Pass the full node `d` to handleCategoryClick
                clicked(event, d);      // Trigger zoom on click for deeper interaction
            });

            path.append("title")
                .text(d => {
                    // Check if the node is a leaf node by verifying if SpecificsExplained exists
                    if (d.data.SpecificsExplained) {
                        return `Explanation: ${d.data.SpecificsExplained}`; // Show SpecificsExplained as the tooltip
                    }
                    // For non-leaf nodes, show just the name
                    return d.data.name;
                });

              
    
        const label = svg.append("g")
            .attr("pointer-events", "none") // Disable pointer events on labels
            .attr("text-anchor", "middle") // Center text labels
            .style("user-select", "none") // Disable text selection
            .selectAll("text")
            .data(root.descendants().slice(1))
            .join("text")
            .attr("dy", "0.35em") // Vertical alignment of text
            .attr("fill-opacity", d => +labelVisible(d.current)) // Set label visibility
            .attr("transform", d => labelTransform(d.current)) // Transform for label position
            .text(d => d.data.name); // Display node name

        const parent = svg.append("circle")
            .datum(root) // Set datum to root for zooming out
            .attr("r", radius) // Radius of zoom-out circle
            .attr("fill", "none") // No fill color
            .attr("pointer-events", "all") // Enable pointer events for zoom-out
            .on("click", clicked); // Click event for zooming out


        function arcVisible(d) {
            // return d.y1 <= 2 && d.x1 > d.x0;
            return d.depth <= 2 && d.y1 >= 1 && d.x1 > d.x0;  // Show only top 2 levels (categories and subcategories) on load
        }

        function labelVisible(d) {
            return d.y1 <= 3 && d.y0 >= 0 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03; // Label visibility based on area
        }

        function labelTransform(d) {
            const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
            const y = (d.y0 + d.y1) / 2 * radius;
            return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`; // Label rotation for readability
        }

        return svg.node(); // Return SVG node for rendering
    }

</script>



<div>
    <svg bind:this={element} 
         on:click={handleCategoryClick}
         on:keydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleCategoryClick(e);
            }
         }}
        tabindex="0"   
        role="button"
    ></svg> <!-- SVG is now inside a scrollable container, tabindex makes SVG focusable for keyboard navigation, role describes the SVG as a button for screen reader-->
</div>

<!-- <div class="details-section">
    {#if selectedCategoryData}
      <Details data={selectedCategoryData} zoomLevel={zoomLevel}/>
    {/if}
</div> -->

<Details data={selectedCategoryData} zoomLevel={zoomLevel} />

<style>
  svg {
      width: 1200px; /* Set an explicit large width for the chart*/
      height: 1200px; /*Corresponding large height */
      max-width: 100vw; /*Make sure it doesn't overflow the viewport width */
      max-height: 100vh; /*Make sure it doesn't overflow the viewport height */
      /*transform: translateX(-20px);  Moves the SVG 20px to the left */
  }

  div {
      width: 1200px; /* Increase width for more horizontal scrolling */
      overflow-x: scroll; 
      overflow-y: scroll;
      height: 100vh; /* Allow vertical scrolling */
      max-width: 100vw; /* Ensure the container is responsive */
  }

</style>
